import { Product } from "../models/Product.model.js";
import { calcDiscountedTotal } from "./pricing.js";
import { toTitleString } from "./title.js";

function getProductImage(product) {
  if (product?.cover?.url) return product.cover.url;
  if (typeof product?.cover === "string") return product.cover;
  if (Array.isArray(product?.gallery) && product.gallery.length) {
    const first = product.gallery[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
  }
  if (Array.isArray(product?.imageURL) && product.imageURL.length) {
    return product.imageURL[0];
  }
  return "";
}

function getProductBarcode(product) {
  return product?.barcode || "";
}

function getProductMultiplicity(product) {
  return Number(product?.multiplicity || 1);
}

function normalizePurchaseMode(value) {
  const mode = String(value || "unit").trim().toLowerCase();
  if (mode === "unit" || mode === "box") return mode;
  throw new Error("product_purchase_mode_invalid");
}

function resolveUnitPrice(dbProduct) {
  const purchaseUnitPrice = Number(dbProduct?.purchaseOptions?.unit?.price);
  if (Number.isFinite(purchaseUnitPrice) && purchaseUnitPrice > 0) {
    return purchaseUnitPrice;
  }

  const fallbackPrice = Number(dbProduct?.cost ?? dbProduct?.price ?? 0);
  if (Number.isFinite(fallbackPrice) && fallbackPrice >= 0) {
    return fallbackPrice;
  }

  return 0;
}

function resolveBoxPrice(dbProduct) {
  const enabled = dbProduct?.purchaseOptions?.box?.enabled === true;
  const price = Number(dbProduct?.purchaseOptions?.box?.price);
  const quantity = Number(dbProduct?.purchaseOptions?.box?.quantity);

  if (!enabled) {
    throw new Error("product_box_not_available");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("product_box_not_available");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("product_box_not_available");
  }

  return {
    price,
    quantity,
  };
}

export async function buildCustomBoxPosition(boxPayload) {
  const { size, items } = boxPayload || {};

  const boxSize = Number(size);
  if (![5, 10].includes(boxSize)) throw new Error("box_invalid_size");

  if (!Array.isArray(items) || items.length === 0) throw new Error("box_empty");

  const normalized = items
    .map((x) => ({
      id: x._id || x.id || x.productId,
      quantity: Number(x.quantity || x.qty || 0),
    }))
    .filter((x) => x.id && x.quantity > 0);

  const totalQty = normalized.reduce((s, x) => s + x.quantity, 0);
  if (totalQty !== boxSize) throw new Error("box_invalid_total_qty");

  const ids = normalized.map((x) => x.id);

  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const boxItems = normalized.map((x) => {
    const p = byId.get(String(x.id));
    if (!p) throw new Error("box_product_not_found");

    const unitPrice = resolveUnitPrice(p);
    const qty = x.quantity;

    const total = +(qty * unitPrice).toFixed(2);
    const discountedTotal = calcDiscountedTotal(total, p.discount || 0);

    return {
      id: p._id,
      barcode: getProductBarcode(p),
      title: toTitleString(p.title),
      quantity: qty,
      unitPrice: +unitPrice.toFixed(2),
      total,
      discountedTotal,
      img: getProductImage(p),
      multiplicity: getProductMultiplicity(p),
    };
  });

  const boxTotal = boxItems.reduce(
    (sum, item) => sum + Number(item.discountedTotal || 0),
    0
  );

  return {
    kind: "custom_box",
    title: `Balený box ${boxSize} ks`,
    quantity: 1,
    unitPrice: +boxTotal.toFixed(2),
    total: +boxTotal.toFixed(2),
    discountedTotal: +boxTotal.toFixed(2),
    img: boxItems[0]?.img || "",
    multiplicity: 1,
    purchaseMode: "unit",
    packQuantity: null,
    box: {
      size: boxSize,
      items: boxItems,
    },
  };
}

export async function buildProductPosition(item) {
  const productId = item?._id || item?.id || item?.productId;
  if (!productId) throw new Error("product_invalid");

  const qty = Number(item.quantity || item.qty || 1);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("product_invalid_qty");

  const purchaseMode = normalizePurchaseMode(item?.purchaseMode);

  const dbProduct = await Product.findById(productId).lean();
  if (!dbProduct) throw new Error("product_not_found");

  const discount = Number(dbProduct.discount || 0);

  let unitPrice = 0;
  let packQuantity = null;

  if (purchaseMode === "box") {
    const boxData = resolveBoxPrice(dbProduct);
    unitPrice = boxData.price;
    packQuantity = boxData.quantity;
  } else {
    unitPrice = resolveUnitPrice(dbProduct);
  }

  const total = +(qty * unitPrice).toFixed(2);
  const discountedTotal = calcDiscountedTotal(total, discount);

  return {
    kind: "product",
    id: dbProduct._id,
    barcode: getProductBarcode(dbProduct),
    title: toTitleString(dbProduct.title),
    quantity: qty,
    unitPrice: +unitPrice.toFixed(2),
    total,
    discountedTotal,
    img: getProductImage(dbProduct),
    multiplicity: getProductMultiplicity(dbProduct),
    purchaseMode,
    packQuantity,
  };
}

export async function buildOrderPositions(items = []) {
  const safeItems = Array.isArray(items) ? items : [];

  return await Promise.all(
    safeItems.map(async (item) => {
      if (item?.kind === "custom_box") {
        return await buildCustomBoxPosition(item);
      }

      return await buildProductPosition(item);
    })
  );
}

export function calcOrderTotals(positions = []) {
  const subtotal = positions.reduce(
    (sum, position) => sum + Number(position.total || 0),
    0
  );

  const total = positions.reduce(
    (sum, position) => sum + Number(position.discountedTotal || 0),
    0
  );

  const discountTotal = +(subtotal - total).toFixed(2);

  return {
    subtotal: +subtotal.toFixed(2),
    discountTotal,
    total: +total.toFixed(2),
    currency: "EUR",
  };
}