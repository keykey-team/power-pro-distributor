import { Product } from "../models/Product.model.js";
import { calcDiscountedTotal } from "./pricing.js";
import { toTitleString } from "./title.js";

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

    const unitPrice = Number(p.cost ?? p.price ?? 0);
    const qty = x.quantity;

    const total = +(qty * unitPrice).toFixed(2);
    const discountedTotal = calcDiscountedTotal(total, p.discount || 0);

    return {
      id: p._id,
      barcode: p.barcode || "",
      title: toTitleString(p.title),
      quantity: qty,
      unitPrice: +unitPrice.toFixed(2),
      total,
      discountedTotal,
      img: (p.imageURL && p.imageURL[0]) || "",
      multiplicity: p.multiplicity || 1,
    };
  });

  const boxTotal = boxItems.reduce(
    (s, it) => s + Number(it.discountedTotal || 0),
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
    box: { size: boxSize, items: boxItems },
  };
}

export async function buildProductPosition(item) {
  const productId = item?._id || item?.id || item?.productId;
  if (!productId) throw new Error("product_invalid");

  const qty = Number(item.quantity || item.qty || 1);
  if (qty <= 0) throw new Error("product_invalid_qty");

  const dbProduct = await Product.findById(productId).lean();
  if (!dbProduct) throw new Error("product_not_found");

  const unitPrice = Number(dbProduct.cost ?? dbProduct.price ?? 0);
  const discount = Number(dbProduct.discount || 0);

  const total = +(qty * unitPrice).toFixed(2);
  const discountedTotal = calcDiscountedTotal(total, discount);

  return {
    kind: "product",
    id: dbProduct._id,
    barcode: dbProduct.barcode || "",
    title: toTitleString(dbProduct.title),
    quantity: qty,
    unitPrice: +unitPrice.toFixed(2),
    total,
    discountedTotal,
    img: (dbProduct.imageURL && dbProduct.imageURL[0]) || "",
    multiplicity: dbProduct.multiplicity || 1,
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
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  const total = positions.reduce(
    (sum, p) => sum + Number(p.discountedTotal || 0),
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