function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function getTrackedStockQuantity(source) {
  const rawValue = source?.stockQuantity;

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return null;
  }

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Math.trunc(parsedValue);
}

export function hasTrackedStock(source) {
  return getTrackedStockQuantity(source) !== null;
}

export function isProductOutOfStock(source) {
  const trackedStockQuantity = getTrackedStockQuantity(source);

  if (trackedStockQuantity !== null) {
    return trackedStockQuantity <= 0;
  }

  return source?.inStock === false;
}

export function getProductAvailability(source) {
  const stockQuantity = getTrackedStockQuantity(source);
  const isAvailable = !isProductOutOfStock(source);

  return {
    isAvailable,
    status: isAvailable ? "in_stock" : "out_of_stock",
    message: isAvailable ? "In stock" : "Out of stock",
    stockQuantity,
    isTracked: stockQuantity !== null,
  };
}

export function applyTrackedStockState(target) {
  const trackedStockQuantity = getTrackedStockQuantity(target);

  if (trackedStockQuantity === null) {
    return target;
  }

  target.stockQuantity = trackedStockQuantity;
  target.inStock = trackedStockQuantity > 0;
  return target;
}

export function syncTrackedStockInUpdate(update) {
  if (!update || typeof update !== "object" || Array.isArray(update)) {
    return update;
  }

  const nextUpdate = { ...update };

  if (hasOwnProperty(nextUpdate, "stockQuantity")) {
    applyTrackedStockState(nextUpdate);
  }

  if (nextUpdate.$set && typeof nextUpdate.$set === "object") {
    nextUpdate.$set = { ...nextUpdate.$set };

    if (hasOwnProperty(nextUpdate.$set, "stockQuantity")) {
      applyTrackedStockState(nextUpdate.$set);
    }
  }

  return nextUpdate;
}

export function assertProductCanBeOrdered(
  source,
  requiredQuantity = 1,
  errorCodes = {}
) {
  const normalizedRequiredQuantity = Math.max(
    Math.trunc(Number(requiredQuantity) || 0),
    0
  );

  if (normalizedRequiredQuantity <= 0) {
    return;
  }

  const outOfStockCode = errorCodes.outOfStock || "product_out_of_stock";
  const insufficientCode =
    errorCodes.insufficient || "product_insufficient_stock";

  const trackedStockQuantity = getTrackedStockQuantity(source);
  if (trackedStockQuantity !== null) {
    if (trackedStockQuantity <= 0) {
      throw new Error(outOfStockCode);
    }

    if (trackedStockQuantity < normalizedRequiredQuantity) {
      throw new Error(insufficientCode);
    }

    return;
  }

  if (source?.inStock === false) {
    throw new Error(outOfStockCode);
  }
}