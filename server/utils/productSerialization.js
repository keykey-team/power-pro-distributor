import {
  getProductAvailability,
  getPurchaseOptionAvailability,
  getPurchaseOptionItems,
} from "./productStock.js";

function buildPurchaseOptionsAvailability(items) {
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
    enabled: item.enabled !== false,
    availability: getPurchaseOptionAvailability(item),
  }));

  const availableCount = availabilityItems.filter(
    (item) => item.enabled && item.availability.isAvailable
  ).length;

  return {
    totalActive: availabilityItems.filter((item) => item.enabled).length,
    availableCount,
    hasAvailable: availableCount > 0,
    items: availabilityItems,
  };
}

export function serializeProduct(
  product,
  { includeDisabledPurchaseOptions = false } = {}
) {
  const plainProduct = product?.toObject?.() || product;
  const purchaseOptionItems = getPurchaseOptionItems(plainProduct, {
    includeDisabled: includeDisabledPurchaseOptions,
  });

  const serializedPurchaseOptionsV2 = plainProduct?.purchaseOptionsV2
    ? {
        ...plainProduct.purchaseOptionsV2,
        items: purchaseOptionItems.map((item) => ({
          ...item,
          availability: getPurchaseOptionAvailability(item),
        })),
      }
    : plainProduct?.purchaseOptionsV2;

  const serialized = {
    ...plainProduct,
    purchaseOptionsV2: serializedPurchaseOptionsV2,
    availability: getProductAvailability(plainProduct),
  };

  if (serializedPurchaseOptionsV2?.items?.length) {
    serialized.purchaseOptionsV2Availability = buildPurchaseOptionsAvailability(
      serializedPurchaseOptionsV2.items
    );
  }

  return serialized;
}

export function serializeProductList(
  products,
  { includeDisabledPurchaseOptions = false } = {}
) {
  return (products || []).map((product) =>
    serializeProduct(product, { includeDisabledPurchaseOptions })
  );
}