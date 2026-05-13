import { Product } from "../models/Product.model.js";
import { InventoryMovement } from "../models/InventoryMovement.model.js";
import {
  buildAdminProductFilter,
  buildPagination,
  parseBooleanQuery,
  parseCsvQuery,
  parseNumberQuery,
} from "../utils/adminQuery.js";
import {
  applyInventoryOperation,
  buildInventoryPositions,
  buildInventorySummary,
} from "../utils/adminInventory.js";
import { logSuccess, logFailure } from "../utils/logging.js";

const INVENTORY_ERROR_MESSAGES = {
  inventory_invalid_quantity: "Invalid inventory quantity.",
  inventory_items_required: "At least one inventory item is required.",
  inventory_invalid_product_id: "Invalid product identifier.",
  inventory_purchase_option_not_found: "Purchase option not found.",
  inventory_target_not_tracked: "Inventory target is not tracked.",
  inventory_insufficient_stock: "Insufficient stock for write-off.",
  product_not_found: "Product not found.",
};

function getInventoryErrorStatus(errorCode) {
  if (["product_not_found", "inventory_purchase_option_not_found"].includes(errorCode)) {
    return 404;
  }

  if (
    [
      "inventory_invalid_quantity",
      "inventory_items_required",
      "inventory_invalid_product_id",
      "inventory_target_not_tracked",
      "inventory_insufficient_stock",
    ].includes(errorCode)
  ) {
    return 400;
  }

  return 500;
}

function buildMovementFilter(query = {}) {
  const filter = {};
  const operationTypes = parseCsvQuery(query.operationType || query.operationTypes);
  const scopes = parseCsvQuery(query.scope || query.scopes);
  const productId = String(query.productId || "").trim();
  const purchaseOptionKey = String(query.purchaseOptionKey || "").trim();
  const reference = String(query.reference || "").trim();
  const createdBy = String(query.createdBy || "").trim();

  if (operationTypes.length) {
    filter.operationType = { $in: operationTypes };
  }

  if (scopes.length) {
    filter.scope = { $in: scopes };
  }

  if (productId) {
    filter.productId = productId;
  }

  if (purchaseOptionKey) {
    filter.purchaseOptionKey = purchaseOptionKey;
  }

  if (reference) {
    filter.reference = reference;
  }

  if (createdBy) {
    filter.createdBy = createdBy;
  }

  if (query.createdFrom || query.createdTo) {
    const createdAt = {};

    if (query.createdFrom) {
      const createdFrom = new Date(query.createdFrom);
      if (!Number.isNaN(createdFrom.getTime())) {
        createdAt.$gte = createdFrom;
      }
    }

    if (query.createdTo) {
      const createdTo = new Date(query.createdTo);
      if (!Number.isNaN(createdTo.getTime())) {
        createdAt.$lte = createdTo;
      }
    }

    if (Object.keys(createdAt).length) {
      filter.createdAt = createdAt;
    }
  }

  return filter;
}

function buildInventoryProductFilterQuery(query = {}) {
  const nextQuery = { ...query };

  delete nextQuery.minStock;
  delete nextQuery.maxStock;
  delete nextQuery.lowStockMax;
  delete nextQuery.trackedOnly;
  delete nextQuery.enabled;
  delete nextQuery.positionType;
  delete nextQuery.includeDisabledPurchaseOptions;
  delete nextQuery.sortBy;
  delete nextQuery.sortOrder;

  return buildAdminProductFilter(nextQuery);
}

async function handleInventoryMutation(req, res, operationType) {
  try {
    const result = await applyInventoryOperation({
      operationType,
      payload: req.body || {},
    });

    // Log successful inventory operation
    const itemCount = Array.isArray(req.body?.items) ? req.body.items.length : 0;
    await logSuccess({
      operationType: "mutation",
      entityType: `Inventory${operationType.charAt(0).toUpperCase() + operationType.slice(1)}`,
      action: `inventory_${operationType}`,
      details: {
        itemCount,
        totalDelta: result.totalDelta,
      },
      quantity: result.totalDelta,
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    // Log failed inventory operation
    const itemCount = Array.isArray(req.body?.items) ? req.body.items.length : 0;
    await logFailure({
      operationType: "mutation",
      entityType: `Inventory${operationType.charAt(0).toUpperCase() + operationType.slice(1)}`,
      action: `inventory_${operationType}`,
      details: { itemCount },
      errorMessage: error.message,
      errorCode: error?.code || error?.message,
      req,
    });

    const errorCode = error?.code || error?.message || "inventory_operation_failed";

    return res.status(getInventoryErrorStatus(errorCode)).json({
      message: INVENTORY_ERROR_MESSAGES[errorCode] || "Inventory operation failed.",
      code: errorCode,
      details: {
        productId: error?.productId,
        purchaseOptionKey: error?.purchaseOptionKey,
        quantityBefore: error?.quantityBefore,
        quantityRequested: error?.quantityRequested,
        fieldName: error?.fieldName,
        itemIndex: error?.itemIndex,
      },
    });
  }
}

export async function listInventoryPositions(req, res) {
  const filter = buildInventoryProductFilterQuery(req.query);
  const products = await Product.find(filter)
    .select(
      "slug title type brand isActive stockQuantity inStock purchaseOptionsV2 createdAt updatedAt"
    )
    .lean();

  const positions = buildInventoryPositions(products, req.query);
  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 50,
    maxLimit: 500,
  });
  const paginatedPositions = positions.slice(skip, skip + limit);

  return res.status(200).json({
    items: paginatedPositions,
    page,
    limit,
    total: positions.length,
    pages: Math.ceil(positions.length / limit),
    summary: buildInventorySummary(positions, {
      lowStockMax: parseNumberQuery(req.query.lowStockMax) ?? 5,
    }),
  });
}

export async function getInventorySummary(req, res) {
  const filter = buildInventoryProductFilterQuery(req.query);
  const products = await Product.find(filter)
    .select(
      "slug title type brand isActive stockQuantity inStock purchaseOptionsV2 createdAt updatedAt"
    )
    .lean();
  const positions = buildInventoryPositions(products, req.query);

  return res.status(200).json(
    buildInventorySummary(positions, {
      lowStockMax: parseNumberQuery(req.query.lowStockMax) ?? 5,
    })
  );
}

export async function listInventoryMovements(req, res) {
  const filter = buildMovementFilter(req.query);
  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 50,
    maxLimit: 200,
  });
  const includeMeta = parseBooleanQuery(req.query.includeMeta) === true;

  const [items, total] = await Promise.all([
    InventoryMovement.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InventoryMovement.countDocuments(filter),
  ]);

  return res.status(200).json({
    items: includeMeta ? items : items.map(({ meta, ...item }) => item),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function createInventoryReceipt(req, res) {
  return handleInventoryMutation(req, res, "receipt");
}

export async function createInventoryWriteoff(req, res) {
  return handleInventoryMutation(req, res, "writeoff");
}

export async function createInventoryRecount(req, res) {
  return handleInventoryMutation(req, res, "recount");
}