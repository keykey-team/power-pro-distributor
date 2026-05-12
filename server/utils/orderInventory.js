import { Product } from "../models/Product.model.js";
import {
  assertProductCanBeOrdered,
  getPurchaseOptionItem,
  getTrackedStockQuantity,
} from "./productStock.js";

function normalizeQuantity(value) {
  const parsedValue = Number(value || 0);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(Math.trunc(parsedValue), 0);
}

function addRequirement(
  requirementsMap,
  productId,
  title,
  quantity,
  purchaseOptionKey = "",
  purchaseOptionTitle = ""
) {
  const normalizedQuantity = normalizeQuantity(quantity);
  if (!productId || normalizedQuantity <= 0) {
    return;
  }

  const key = `${String(productId)}::${String(purchaseOptionKey || "")}`;
  const existingRequirement = requirementsMap.get(key);

  if (existingRequirement) {
    existingRequirement.quantity += normalizedQuantity;
    return;
  }

  requirementsMap.set(key, {
    productId,
    title: String(title || ""),
    quantity: normalizedQuantity,
    purchaseOptionKey: String(purchaseOptionKey || ""),
    purchaseOptionTitle: String(purchaseOptionTitle || ""),
  });
}

export function getOrderStockRequirements(order) {
  const requirementsMap = new Map();

  for (const item of order?.items || []) {
    if (item?.kind === "product" && item?.id) {
      const orderedQuantity = normalizeQuantity(item.quantity || 1);

      if (item?.v2Key) {
        addRequirement(
          requirementsMap,
          item.id,
          item.title,
          orderedQuantity,
          item.v2Key,
          item.optionTitle
        );
        continue;
      }

      const packQuantity =
        item?.purchaseMode === "box"
          ? Math.max(normalizeQuantity(item.packQuantity || 1), 1)
          : 1;

      addRequirement(
        requirementsMap,
        item.id,
        item.title,
        orderedQuantity * packQuantity
      );
      continue;
    }

    if (item?.kind === "custom_box") {
      for (const boxItem of item?.box?.items || []) {
        addRequirement(
          requirementsMap,
          boxItem.id,
          boxItem.title,
          boxItem.quantity
        );
      }
    }
  }

  return Array.from(requirementsMap.values());
}

function buildStockIncreasePipeline(quantity) {
  return [
    {
      $set: {
        stockQuantity: {
          $add: [{ $ifNull: ["$stockQuantity", 0] }, quantity],
        },
        inStock: {
          $gt: [{ $add: [{ $ifNull: ["$stockQuantity", 0] }, quantity] }, 0],
        },
      },
    },
  ];
}

function buildStockDecreasePipeline(quantity) {
  return [
    {
      $set: {
        stockQuantity: {
          $subtract: ["$stockQuantity", quantity],
        },
        inStock: {
          $gt: [{ $subtract: ["$stockQuantity", quantity] }, 0],
        },
      },
    },
  ];
}

function buildPurchaseOptionStockIncreasePipeline(optionKey, quantity) {
  return [
    {
      $set: {
        "purchaseOptionsV2.items": {
          $map: {
            input: "$purchaseOptionsV2.items",
            as: "item",
            in: {
              $cond: [
                { $eq: ["$$item.key", optionKey] },
                {
                  $mergeObjects: [
                    "$$item",
                    {
                      stockQuantity: {
                        $add: [{ $ifNull: ["$$item.stockQuantity", 0] }, quantity],
                      },
                      inStock: {
                        $gt: [
                          {
                            $add: [
                              { $ifNull: ["$$item.stockQuantity", 0] },
                              quantity,
                            ],
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
                "$$item",
              ],
            },
          },
        },
      },
    },
  ];
}

function buildPurchaseOptionStockDecreasePipeline(optionKey, quantity) {
  return [
    {
      $set: {
        "purchaseOptionsV2.items": {
          $map: {
            input: "$purchaseOptionsV2.items",
            as: "item",
            in: {
              $cond: [
                { $eq: ["$$item.key", optionKey] },
                {
                  $mergeObjects: [
                    "$$item",
                    {
                      stockQuantity: {
                        $subtract: [{ $ifNull: ["$$item.stockQuantity", 0] }, quantity],
                      },
                      inStock: {
                        $gt: [
                          {
                            $subtract: [
                              { $ifNull: ["$$item.stockQuantity", 0] },
                              quantity,
                            ],
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
                "$$item",
              ],
            },
          },
        },
      },
    },
  ];
}

async function rollbackAppliedAdjustments(appliedAdjustments) {
  for (const adjustment of [...appliedAdjustments].reverse()) {
    try {
      if (adjustment.purchaseOptionKey) {
        await Product.findOneAndUpdate(
          { _id: adjustment.productId },
          buildPurchaseOptionStockIncreasePipeline(
            adjustment.purchaseOptionKey,
            adjustment.quantity
          )
        );
      } else {
        await Product.findOneAndUpdate(
          { _id: adjustment.productId },
          buildStockIncreasePipeline(adjustment.quantity)
        );
      }
    } catch {
      // Best-effort rollback; the order remains visible for manual reconciliation.
    }
  }
}

export async function deductOrderStockOnce(order) {
  if (!order) {
    return null;
  }

  const currentInventory =
    order.inventory?.toObject?.() || order.inventory || { items: [] };

  if (currentInventory?.deductedAt) {
    return currentInventory;
  }

  const requirements = getOrderStockRequirements(order);
  if (!requirements.length) {
    order.inventory = {
      ...currentInventory,
      deductedAt: new Date(),
      items: [],
    };
    return order.inventory;
  }

  const products = await Product.find({
    _id: { $in: requirements.map((item) => item.productId) },
  })
    .select("_id title stockQuantity inStock purchaseOptionsV2")
    .lean();

  const productsById = new Map(products.map((product) => [String(product._id), product]));

  for (const requirement of requirements) {
    const product = productsById.get(String(requirement.productId));

    if (!product) {
      throw new Error("product_not_found");
    }

    assertProductCanBeOrdered(
      product,
      requirement.quantity,
      {},
      requirement.purchaseOptionKey || null
    );
  }

  const appliedAdjustments = [];
  const deductedItems = [];

  try {
    for (const requirement of requirements) {
      const product = productsById.get(String(requirement.productId));
      let updatedProduct = null;
      let stockAfter = null;

      if (requirement.purchaseOptionKey) {
        const trackedPurchaseOption = getPurchaseOptionItem(
          product,
          requirement.purchaseOptionKey
        );

        if (getTrackedStockQuantity(trackedPurchaseOption) === null) {
          continue;
        }

        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: requirement.productId,
            "purchaseOptionsV2.items": {
              $elemMatch: {
                key: requirement.purchaseOptionKey,
                stockQuantity: { $gte: requirement.quantity },
              },
            },
          },
          buildPurchaseOptionStockDecreasePipeline(
            requirement.purchaseOptionKey,
            requirement.quantity
          ),
          {
            new: true,
            lean: true,
          }
        );

        stockAfter = getPurchaseOptionItem(
          updatedProduct,
          requirement.purchaseOptionKey,
          { includeDisabled: true }
        )?.stockQuantity;
      } else {
        const trackedStockQuantity = getTrackedStockQuantity(product);

        if (trackedStockQuantity === null) {
          continue;
        }

        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: requirement.productId,
            stockQuantity: { $gte: requirement.quantity },
          },
          buildStockDecreasePipeline(requirement.quantity),
          {
            new: true,
            lean: true,
          }
        );

        stockAfter = updatedProduct?.stockQuantity;
      }

      if (!updatedProduct) {
        throw new Error("product_insufficient_stock");
      }

      appliedAdjustments.push({
        productId: requirement.productId,
        quantity: requirement.quantity,
        purchaseOptionKey: requirement.purchaseOptionKey,
      });

      deductedItems.push({
        productId: requirement.productId,
        title: requirement.title,
        quantity: requirement.quantity,
        purchaseOptionKey: requirement.purchaseOptionKey,
        purchaseOptionTitle: requirement.purchaseOptionTitle,
        stockAfter,
      });
    }
  } catch (error) {
    await rollbackAppliedAdjustments(appliedAdjustments);
    throw error;
  }

  order.inventory = {
    ...currentInventory,
    deductedAt: new Date(),
    items: deductedItems,
  };

  return order.inventory;
}