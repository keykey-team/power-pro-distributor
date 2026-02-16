// ================================
// controllers/products.controller.js
// (basic CRUD)
// ================================
import { Product } from "../models/Product.model.js";

export async function listProducts(req, res) {
  const { page = 1, limit = 20, q = "", isActive, inStock } = req.query;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = {};
  if (typeof isActive !== "undefined") filter.isActive = String(isActive) === "true";
  if (typeof inStock !== "undefined") filter.inStock = String(inStock) === "true";

  if (q && String(q).trim()) filter.$text = { $search: String(q).trim() };

  const items = await Product.find(filter)
    .sort({ sort: 1, createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);

  const total = await Product.countDocuments(filter);

  return res.status(200).json({
  items,
  page: safePage,
  limit: safeLimit,
  total,
  pages: Math.ceil(total / safeLimit),
});

}

export async function getProduct(req, res) {
  const { idOrSlug } = req.params;

  const query = /^[0-9a-fA-F]{24}$/.test(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: String(idOrSlug).toLowerCase() };

  const doc = await Product.findOne(query);
  if (!doc) return res.status(404).json({ message: "Product not found" });

  res.json(doc);
}

export async function createProduct(req, res) {
  const payload = req.body || {};
  const created = await Product.create(payload);
  res.status(201).json(created);
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const payload = req.body || {};

  const updated = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) return res.status(404).json({ message: "Product not found" });
  res.json(updated);
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);

  if (!deleted) return res.status(404).json({ message: "Product not found" });
  res.json({ ok: true });
}
