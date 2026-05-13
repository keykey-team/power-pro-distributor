import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";
import { InventoryMovement } from "../models/InventoryMovement.model.js";
import {
  getPurchaseOptionItem,
  getPurchaseOptionItems,
  getTrackedStockQuantity,
} from "./productStock.js";
import { serializeProduct } from "./productSerialization.js";
import { getLocalizedTextValue, parseBooleanQuery, parseNumberQuery } from "./adminQuery.js";

function createInventoryError(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function normalizePositiveInteger(value, fieldName = "quantity") {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw createInventoryError("inventory_invalid_quantity", { fieldName });
  }

  return Math.trunc(parsedValue);
}

function normalizeNonNegativeInteger(value, fieldName = "quantity") {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw createInventoryError("inventory_invalid_quantity", { fieldName });
  }

  return Math.trunc(parsedValue);
}

function normalizeOperationItems(payload, operationType) {
  const inputItems = Array.isArray(payload?.items)
    ? payload.items
    : payload
    ? [payload]
    : [];

  if (!inputItems.length) {
    throw createInventoryError("inventory_items_required");
  }

  return inputItems.map((item, index) => {
    const productId = String(item?.productId || item?.id || "").trim();
    if (!productId || !mongoose.isValidObjectId(productId)) {
      throw createInventoryError("inventory_invalid_product_id", {
        itemIndex: index,
      });
    }

    const purchaseOptionKey = String(item?.purchaseOptionKey || "").trim();
    const reason = String(item?.reason ?? payload?.reason ?? "").trim();
    const comment = String(item?.comment ?? payload?.comment ?? "").trim();
    const reference = String(item?.reference ?? payload?.reference ?? "").trim();
    const createdBy = String(item?.createdBy ?? payload?.createdBy ?? "").trim();
    const meta = item?.meta ?? payload?.meta ?? null;

    if (operationType === "recount") {
      const quantityRequested = normalizeNonNegativeInteger(
        item?.exactQuantity ?? item?.countedQuantity ?? item?.quantity,
        "exactQuantity"
      );

      return {
        productId,
        purchaseOptionKey,
        quantityRequested,
        reason,
        comment,
        reference,
        createdBy,
        meta,
      };
    }

    return {
      productId,
      purchaseOptionKey,
      quantityRequested: normalizePositiveInteger(item?.quantity, "quantity"),
      reason,
      comment,
      reference,
      createdBy,
      meta,
    };
  });
}

function getTargetMeta(product, purchaseOptionKey) {
  if (!purchaseOptionKey) {
    return {
      scope: "product",
      target: product,
      purchaseOptionKey: "",
      purchaseOptionTitle: {},
    };
  }

  const target = getPurchaseOptionItem(product, purchaseOptionKey, {
    includeDisabled: true,
  });

  if (!target) {
    throw createInventoryError("inventory_purchase_option_not_found", {
      productId: product._id,
      purchaseOptionKey,
    });
  }

  return {
    scope: "purchase_option",
    target,
    purchaseOptionKey,
    purchaseOptionTitle: target.title || {},
  };
}

function applyOperationToTarget(target, operationType, quantityRequested) {
  const quantityBefore = getTrackedStockQuantity(target);
  let quantityAfter = null;

  if (operationType === "receipt") {
    quantityAfter = (quantityBefore ?? 0) + quantityRequested;
  }

  if (operationType === "writeoff") {
    if (quantityBefore === null) {
      throw createInventoryError("inventory_target_not_tracked");
    }

    if (quantityBefore < quantityRequested) {
      throw createInventoryError("inventory_insufficient_stock", {
        quantityBefore,
        quantityRequested,
      });
    }

    quantityAfter = quantityBefore - quantityRequested;
  }

  if (operationType === "recount") {
    quantityAfter = quantityRequested;
  }

  target.stockQuantity = quantityAfter;
  target.inStock = quantityAfter > 0;

  return {
    quantityBefore,
    quantityAfter,
    quantityDelta:
      operationType === "recount"
        ? quantityAfter - (quantityBefore ?? 0)
        : operationType === "writeoff"
        ? -quantityRequested
        : quantityRequested,
  };
}

function buildMovementPayload(product, targetMeta, normalizedItem, change, operationType) {
  return {
    operationType,
    scope: targetMeta.scope,
    productId: product._id,
    productSlug: product.slug,
    productTitle: product.title,
    purchaseOptionKey: targetMeta.purchaseOptionKey,
    purchaseOptionTitle: targetMeta.purchaseOptionTitle,
    quantityRequested: normalizedItem.quantityRequested,
    quantityBefore: change.quantityBefore,
    quantityDelta: change.quantityDelta,
    quantityAfter: change.quantityAfter,
    reason: normalizedItem.reason,
    comment: normalizedItem.comment,
    reference: normalizedItem.reference,
    createdBy: normalizedItem.createdBy,
    meta: normalizedItem.meta,
  };
}

function buildAppliedItem(movementPayload, serializedProduct) {
  return {
    ...movementPayload,
    product: {
      _id: serializedProduct._id,
      slug: serializedProduct.slug,
      title: serializedProduct.title,
      availability: serializedProduct.availability,
      stockQuantity: serializedProduct.stockQuantity,
      inStock: serializedProduct.inStock,
      purchaseOptionsV2: serializedProduct.purchaseOptionsV2,
      purchaseOptionsV2Availability: serializedProduct.purchaseOptionsV2Availability,
      isActive: serializedProduct.isActive,
      updatedAt: serializedProduct.updatedAt,
    },
  };
}

function normalizePositionRows(rows, query = {}) {
  const trackedOnly = parseBooleanQuery(query.trackedOnly);
  const inStock = parseBooleanQuery(query.inStock);
  const enabled = parseBooleanQuery(query.enabled);
  const lowStockMax = parseNumberQuery(query.lowStockMax);
  const minStock = parseNumberQuery(query.minStock);
  const maxStock = parseNumberQuery(query.maxStock);
  const filteredRows = rows.filter((row) => {
    if (trackedOnly === true && !row.isTracked) {
      return false;
    }

    if (typeof inStock === "boolean" && row.inStock !== inStock) {
      return false;
    }

    if (typeof enabled === "boolean" && row.positionType === "purchase_option") {
      if (row.enabled !== enabled) {
        return false;
      }
    }

    if (typeof minStock === "number") {
      if ((row.stockQuantity ?? Number.NEGATIVE_INFINITY) < minStock) {
        return false;
      }
    }

    if (typeof maxStock === "number") {
      if ((row.stockQuantity ?? Number.POSITIVE_INFINITY) > maxStock) {
        return false;
      }
    }

    if (typeof lowStockMax === "number") {
      if (!row.isTracked || row.stockQuantity === null || row.stockQuantity > lowStockMax) {
        return false;
      }
    }

    return true;
  });

  const sortBy = String(query.sortBy || "updatedAt").trim();
  const sortOrder = String(query.sortOrder || "desc").trim().toLowerCase() === "asc" ? 1 : -1;

  filteredRows.sort((left, right) => {
    const leftValue =
      sortBy === "title"
        ? getLocalizedTextValue(left.title)
        : sortBy === "stockQuantity"
        ? left.stockQuantity ?? Number.NEGATIVE_INFINITY
        : left[sortBy] ?? "";
    const rightValue =
      sortBy === "title"
        ? getLocalizedTextValue(right.title)
        : sortBy === "stockQuantity"
        ? right.stockQuantity ?? Number.NEGATIVE_INFINITY
        : right[sortBy] ?? "";

    if (leftValue < rightValue) {
      return -1 * sortOrder;
    }

    if (leftValue > rightValue) {
      return 1 * sortOrder;
    }

    return 0;
  });

  return filteredRows;
}

export function buildInventoryPositions(products, query = {}) {
  const positionType = String(query.positionType || "all").trim().toLowerCase();
  const includeDisabledPurchaseOptions =
    parseBooleanQuery(query.includeDisabledPurchaseOptions) !== false;
  const rows = [];

  for (const product of products) {
    const serializedProduct = serializeProduct(product, {
      includeDisabledPurchaseOptions,
    });

    if (positionType === "all" || positionType === "product") {
      rows.push({
        positionType: "product",
        productId: serializedProduct._id,
        slug: serializedProduct.slug,
        title: serializedProduct.title,
        type: serializedProduct.type || "",
        brand: serializedProduct.brand?.title || {},
        isActive: serializedProduct.isActive,
        isTracked: serializedProduct.availability?.isTracked || false,
        stockQuantity: serializedProduct.stockQuantity ?? null,
        inStock: serializedProduct.inStock,
        availability: serializedProduct.availability,
        updatedAt: serializedProduct.updatedAt,
        createdAt: serializedProduct.createdAt,
      });
    }

    if (positionType === "all" || positionType === "purchase_option") {
      for (const item of getPurchaseOptionItems(product, {
        includeDisabled: includeDisabledPurchaseOptions,
      })) {
        rows.push({
          positionType: "purchase_option",
          productId: serializedProduct._id,
          slug: serializedProduct.slug,
          title: item.title,
          type: serializedProduct.type || "",
          brand: serializedProduct.brand?.title || {},
          isActive: serializedProduct.isActive,
          enabled: item.enabled !== false,
          purchaseOptionKey: item.key,
          purchaseOptionMode: item.mode,
          purchaseOptionQuantity: item.quantity,
          isTracked: item.availability?.isTracked || false,
          stockQuantity: item.stockQuantity ?? null,
          inStock: item.inStock,
          availability: item.availability,
          updatedAt: serializedProduct.updatedAt,
          createdAt: serializedProduct.createdAt,
        });
      }
    }
  }

  return normalizePositionRows(rows, query);
}

export function buildInventorySummary(positions, { lowStockMax = 5 } = {}) {
  const trackedPositions = positions.filter((row) => row.isTracked);
  const lowStockPositions = trackedPositions.filter(
    (row) => (row.stockQuantity ?? Number.POSITIVE_INFINITY) <= lowStockMax
  );

  return {
    totalPositions: positions.length,
    trackedPositions: trackedPositions.length,
    inStockPositions: positions.filter((row) => row.inStock).length,
    outOfStockPositions: positions.filter((row) => !row.inStock).length,
    lowStockPositions: lowStockPositions.length,
    totalTrackedUnits: trackedPositions.reduce(
      (sum, row) => sum + (row.stockQuantity || 0),
      0
    ),
  };
}

export async function applyInventoryOperation({ operationType, payload }) {
  const dryRun = parseBooleanQuery(payload?.dryRun) === true;
  const normalizedItems = normalizeOperationItems(payload, operationType);
  const appliedItems = [];
  const movementPayloads = [];
  const session = dryRun ? null : await mongoose.startSession();

  try {
    const executeOperation = async () => {
      for (const normalizedItem of normalizedItems) {
        const productQuery = Product.findById(normalizedItem.productId);

        if (session) {
          productQuery.session(session);
        }

        const product = await productQuery;

        if (!product) {
          throw createInventoryError("product_not_found", {
            productId: normalizedItem.productId,
          });
        }

        const targetMeta = getTargetMeta(product, normalizedItem.purchaseOptionKey);
        const change = applyOperationToTarget(
          targetMeta.target,
          operationType,
          normalizedItem.quantityRequested
        );

        if (!dryRun) {
          await product.save({ session });
        }

        const serializedProduct = serializeProduct(product, {
          includeDisabledPurchaseOptions: true,
        });
        const movementPayload = buildMovementPayload(
          product,
          targetMeta,
          normalizedItem,
          change,
          operationType
        );

        movementPayloads.push(movementPayload);
        appliedItems.push(buildAppliedItem(movementPayload, serializedProduct));
      }

      if (!dryRun && movementPayloads.length) {
        const createdMovements = await InventoryMovement.insertMany(movementPayloads, {
          session,
        });

        createdMovements.forEach((movement, index) => {
          appliedItems[index].movementId = movement._id;
          appliedItems[index].createdAt = movement.createdAt;
        });
      }
    };

    if (session) {
      await session.withTransaction(executeOperation);
    } else {
      await executeOperation();
    }

    return {
      operationType,
      dryRun,
      totalItems: appliedItems.length,
      totalDelta: appliedItems.reduce(
        (sum, item) => sum + (item.quantityDelta || 0),
        0
      ),
      items: appliedItems,
    };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}