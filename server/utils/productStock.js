function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeTrackedStockQuantity(rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return null;
  }

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Math.trunc(parsedValue);
}

function isTrackedEntityOutOfStock(source) {
  const trackedStockQuantity = getTrackedStockQuantity(source);

  if (trackedStockQuantity !== null) {
    return trackedStockQuantity <= 0;
  }

  return source?.inStock === false;
}

function getTrackedEntityAvailability(source) {
  const stockQuantity = getTrackedStockQuantity(source);
  const isAvailable = !isTrackedEntityOutOfStock(source);

  return {
    isAvailable,
    status: isAvailable ? "in_stock" : "out_of_stock",
    message: isAvailable ? "In stock" : "Out of stock",
    stockQuantity,
    isTracked: stockQuantity !== null,
  };
}

function normalizePurchaseOptionItem(option) {
  if (!option || typeof option !== "object") {
    return option;
  }

  applyTrackedStockState(option);

  if (Array.isArray(option.images)) {
    option.images.sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0));
  }

  return option;
}

function normalizePurchaseOptionItems(items) {
  if (!Array.isArray(items)) {
    return items;
  }

  items.forEach(normalizePurchaseOptionItem);
  items.sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0));

  return items;
}

export function getTrackedStockQuantity(source) {
  return normalizeTrackedStockQuantity(source?.stockQuantity);
}

export function hasTrackedStock(source) {
  return getTrackedStockQuantity(source) !== null;
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

export function normalizePurchaseOptionsV2(purchaseOptionsV2) {
  if (!purchaseOptionsV2 || typeof purchaseOptionsV2 !== "object") {
    return purchaseOptionsV2;
  }

  normalizePurchaseOptionItems(purchaseOptionsV2.items);
  return purchaseOptionsV2;
}

export function getPurchaseOptionItems(source, { includeDisabled = false } = {}) {
  const items = source?.purchaseOptionsV2?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return includeDisabled
    ? items
    : items.filter((item) => item?.enabled !== false);
}

export function getPurchaseOptionItem(
  source,
  optionKey,
  { includeDisabled = false } = {}
) {
  const normalizedKey = String(optionKey || "").trim();
  if (!normalizedKey) {
    return null;
  }

  return (
    getPurchaseOptionItems(source, { includeDisabled }).find(
      (item) => String(item?.key || "").trim() === normalizedKey
    ) || null
  );
}

export function getPurchaseOptionAvailability(option) {
  return getTrackedEntityAvailability(option);
}

export function getPurchaseOptionsV2Availability(source) {
  const items = getPurchaseOptionItems(source);

  if (!items.length) {
    return {
      totalActive: 0,
      availableCount: 0,
      hasAvailable: false,
      items: [],
    };
  }

  const availabilityItems = items.map((item) => ({
    key: item.key,
    title: item.title,
    mode: item.mode,
    quantity: item.quantity,
    availability: getPurchaseOptionAvailability(item),
  }));

  const availableCount = availabilityItems.filter(
    (item) => item.availability.isAvailable
  ).length;

  return {
    totalActive: availabilityItems.length,
    availableCount,
    hasAvailable: availableCount > 0,
    items: availabilityItems,
  };
}

export function syncTrackedStockInUpdate(update) {
  if (!update || typeof update !== "object" || Array.isArray(update)) {
    return update;
  }

  const nextUpdate = { ...update };

  if (hasOwnProperty(nextUpdate, "stockQuantity")) {
    applyTrackedStockState(nextUpdate);
  }

  if (hasOwnProperty(nextUpdate, "purchaseOptionsV2")) {
    nextUpdate.purchaseOptionsV2 = {
      ...nextUpdate.purchaseOptionsV2,
    };
    normalizePurchaseOptionsV2(nextUpdate.purchaseOptionsV2);
  }

  if (nextUpdate.$set && typeof nextUpdate.$set === "object") {
    nextUpdate.$set = { ...nextUpdate.$set };

    if (hasOwnProperty(nextUpdate.$set, "stockQuantity")) {
      applyTrackedStockState(nextUpdate.$set);
    }

    if (hasOwnProperty(nextUpdate.$set, "purchaseOptionsV2")) {
      nextUpdate.$set.purchaseOptionsV2 = {
        ...nextUpdate.$set.purchaseOptionsV2,
      };
      normalizePurchaseOptionsV2(nextUpdate.$set.purchaseOptionsV2);
    }

    if (hasOwnProperty(nextUpdate.$set, "purchaseOptionsV2.items")) {
      nextUpdate.$set["purchaseOptionsV2.items"] = normalizePurchaseOptionItems(
        nextUpdate.$set["purchaseOptionsV2.items"]
      );
    }
  }

  return nextUpdate;
}

export function isProductOutOfStock(source) {
  const purchaseOptionsAvailability = getPurchaseOptionsV2Availability(source);

  if (purchaseOptionsAvailability.totalActive > 0) {
    return !purchaseOptionsAvailability.hasAvailable;
  }

  return isTrackedEntityOutOfStock(source);
}

export function getProductAvailability(source) {
  const purchaseOptionsAvailability = getPurchaseOptionsV2Availability(source);

  if (purchaseOptionsAvailability.totalActive > 0) {
    const isAvailable = purchaseOptionsAvailability.hasAvailable;

    return {
      isAvailable,
      status: isAvailable ? "in_stock" : "out_of_stock",
      message: isAvailable ? "In stock" : "Out of stock",
      stockQuantity: null,
      isTracked: purchaseOptionsAvailability.items.some(
        (item) => item.availability.isTracked
      ),
    };
  }

  return getTrackedEntityAvailability(source);
}

export function assertProductCanBeOrdered(
  source,
  requiredQuantity = 1,
  errorCodes = {},
  purchaseOptionKey = null
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

  if (purchaseOptionKey) {
    const option = getPurchaseOptionItem(source, purchaseOptionKey);

    if (!option) {
      throw new Error("product_purchase_option_not_found");
    }

    const trackedStockQuantity = getTrackedStockQuantity(option);
    if (trackedStockQuantity !== null) {
      if (trackedStockQuantity <= 0) {
        throw new Error(outOfStockCode);
      }

      if (trackedStockQuantity < normalizedRequiredQuantity) {
        throw new Error(insufficientCode);
      }

      return;
    }

    if (option?.inStock === false) {
      throw new Error(outOfStockCode);
    }

    return;
  }

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
