import { Product } from "../models/Product.model.js";
import {
  buildAdminProductFilter,
  buildAdminProductSort,
  buildPagination,
  getLocalizedTextValue,
  parseBooleanQuery,
} from "../utils/adminQuery.js";
import {
  serializeProduct,
  serializeProductList,
} from "../utils/productSerialization.js";
import { logSuccess, logFailure } from "../utils/logging.js";
import ExcelJS from "exceljs";

const EXPORT_HEADERS = [
  { key: "id", header: "id" },
  { key: "slug", header: "slug" },
  { key: "type", header: "type" },
  { key: "titleUa", header: "title_ua" },
  { key: "titleRu", header: "title_ru" },
  { key: "titleEn", header: "title_en" },
  { key: "titleSk", header: "title_sk" },
  { key: "currency", header: "currency" },
  { key: "price", header: "price" },
  { key: "oldPrice", header: "old_price" },
  { key: "stockQuantity", header: "stock_quantity" },
  { key: "inStock", header: "in_stock" },
  { key: "isActive", header: "is_active" },
  { key: "weightG", header: "weight_g" },
  { key: "proteinG", header: "protein_g" },
  { key: "nutritionTable", header: "nutrition_table_json" },
  { key: "cardBadges", header: "card_badges_json" },
  { key: "purchaseOptions", header: "purchase_options_json" },
  { key: "purchaseOptionsV2", header: "purchase_options_v2_json" },
  { key: "createdAt", header: "created_at" },
  { key: "updatedAt", header: "updated_at" },
];

function safeJson(value) {
  if (value === null || value === undefined) return "";

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function toExportRows(products = []) {
  return products.map((item) => ({
    id: String(item?._id || ""),
    slug: String(item?.slug || ""),
    type: item?.type || "",
    titleUa: item?.title?.ua || "",
    titleRu: item?.title?.ru || "",
    titleEn: item?.title?.en || "",
    titleSk: item?.title?.sk || "",
    currency: item?.currency || "EUR",
    price: item?.price ?? "",
    oldPrice: item?.oldPrice ?? "",
    stockQuantity: item?.stockQuantity ?? "",
    inStock: item?.inStock === true,
    isActive: item?.isActive === true,
    weightG: item?.weightG ?? "",
    proteinG: item?.proteinG ?? "",
    nutritionTable: safeJson(item?.nutritionTable),
    cardBadges: safeJson(item?.cardBadges),
    purchaseOptions: safeJson(item?.purchaseOptions),
    purchaseOptionsV2: safeJson(item?.purchaseOptionsV2),
    createdAt: item?.createdAt ? new Date(item.createdAt).toISOString() : "",
    updatedAt: item?.updatedAt ? new Date(item.updatedAt).toISOString() : "",
  }));
}

function escapeCsvCell(value) {
  const normalized = String(value ?? "").replace(/\r?\n/g, " ");

  if (/[",;]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

function buildCsvBuffer(rows = []) {
  const headerLine = EXPORT_HEADERS.map((item) => escapeCsvCell(item.header)).join(",");
  const lines = rows.map((row) =>
    EXPORT_HEADERS.map((item) => escapeCsvCell(row[item.key])).join(",")
  );

  return Buffer.from([headerLine, ...lines].join("\n"), "utf-8");
}

async function buildXlsxBuffer(rows = []) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("products");

  sheet.columns = EXPORT_HEADERS.map((item) => ({
    header: item.header,
    key: item.key,
    width: 24,
  }));

  for (const row of rows) {
    sheet.addRow(row);
  }

  return workbook.xlsx.writeBuffer();
}

function buildProductLookupQuery(idOrSlug) {
  return /^[0-9a-fA-F]{24}$/.test(String(idOrSlug || ""))
    ? { _id: idOrSlug }
    : { slug: String(idOrSlug || "").trim().toLowerCase() };
}

export async function listAdminProducts(req, res) {
  const filter = buildAdminProductFilter(req.query);
  const sort = buildAdminProductSort(req.query, {
    defaultSort: { updatedAt: -1, createdAt: -1 },
  });
  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 25,
    maxLimit: 200,
  });
  const includeDisabledPurchaseOptions =
    parseBooleanQuery(req.query.includeDisabledPurchaseOptions) !== false;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    items: serializeProductList(items, { includeDisabledPurchaseOptions }),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    sort,
  });
}

export async function exportAdminProducts(req, res) {
  const format = String(req.query.format || "csv").trim().toLowerCase();

  if (!["csv", "xlsx"].includes(format)) {
    return res.status(400).json({
      message: "Unsupported format. Use csv or xlsx.",
      code: "unsupported_export_format",
    });
  }

  const filter = buildAdminProductFilter(req.query);
  const sort = buildAdminProductSort(req.query, {
    defaultSort: { updatedAt: -1, createdAt: -1 },
  });

  try {
    const products = await Product.find(filter).sort(sort).lean();
    const rows = toExportRows(products);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `products-export-${timestamp}.${format}`;

    if (format === "csv") {
      const csvBuffer = buildCsvBuffer(rows);

      await logSuccess({
        operationType: "read",
        entityType: "Product",
        action: "products_exported_csv",
        details: { total: rows.length, filter, sort },
        quantity: rows.length,
        req,
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
      return res.status(200).send(csvBuffer);
    }

    const xlsxBuffer = await buildXlsxBuffer(rows);

    await logSuccess({
      operationType: "read",
      entityType: "Product",
      action: "products_exported_xlsx",
      details: { total: rows.length, filter, sort },
      quantity: rows.length,
      req,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    return res.status(200).send(Buffer.from(xlsxBuffer));
  } catch (error) {
    await logFailure({
      operationType: "read",
      entityType: "Product",
      action: "products_export_failed",
      errorMessage: error.message,
      errorCode: error.code,
      req,
    });

    return res.status(500).json({
      message: "Failed to export products.",
      code: "products_export_failed",
    });
  }
}

export async function getAdminProduct(req, res) {
  const includeDisabledPurchaseOptions =
    parseBooleanQuery(req.query.includeDisabledPurchaseOptions) !== false;
  const product = await Product.findOne(
    buildProductLookupQuery(req.params.idOrSlug)
  ).lean();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(
    serializeProduct(product, { includeDisabledPurchaseOptions })
  );
}

export async function createAdminProduct(req, res) {
  const payload = req.body || {};
  
  try {
    const created = await Product.create(payload);
    
    // Log successful creation
    await logSuccess({
      operationType: "create",
      entityType: "Product",
      action: "product_created",
      entityId: String(created._id),
      entitySlug: created.slug,
      entityTitle: getLocalizedTextValue(created.title),
      details: { payload: Object.keys(payload) },
      req,
    });

    return res.status(201).json(
      serializeProduct(created, { includeDisabledPurchaseOptions: true })
    );
  } catch (error) {
    await logFailure({
      operationType: "create",
      entityType: "Product",
      action: "product_created",
      details: { payload: Object.keys(payload) },
      errorMessage: error.message,
      errorCode: error.code,
      req,
    });
    
    throw error;
  }
}

export async function updateAdminProduct(req, res) {
  const payload = req.body || {};
  const productId = req.params.id;
  
  try {
    // Get original product for comparison
    const original = await Product.findById(productId).lean();
    
    if (!original) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const updated = await Product.findByIdAndUpdate(productId, payload, {
      new: true,
      runValidators: true,
    });

    // Log successful update
    await logSuccess({
      operationType: "update",
      entityType: "Product",
      action: "product_updated",
      entityId: String(updated._id),
      entitySlug: updated.slug,
      entityTitle: getLocalizedTextValue(updated.title),
      details: { changedFields: Object.keys(payload) },
      changes: {
        before: Object.keys(payload).reduce((acc, key) => {
          acc[key] = original[key];
          return acc;
        }, {}),
        after: Object.keys(payload).reduce((acc, key) => {
          acc[key] = updated[key];
          return acc;
        }, {}),
      },
      req,
    });

    return res.status(200).json(
      serializeProduct(updated, { includeDisabledPurchaseOptions: true })
    );
  } catch (error) {
    await logFailure({
      operationType: "update",
      entityType: "Product",
      action: "product_updated",
      entityId: productId,
      details: { changedFields: Object.keys(payload) },
      errorMessage: error.message,
      errorCode: error.code,
      req,
    });
    
    throw error;
  }
}

export async function deleteAdminProduct(req, res) {
  const productId = req.params.id;
  
  try {
    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Log successful deletion
    await logSuccess({
      operationType: "delete",
      entityType: "Product",
      action: "product_deleted",
      entityId: String(deleted._id),
      entitySlug: deleted.slug,
      entityTitle: getLocalizedTextValue(deleted.title),
      details: {
        deletedAt: new Date(),
        productType: deleted.type,
      },
      req,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    await logFailure({
      operationType: "delete",
      entityType: "Product",
      action: "product_deleted",
      entityId: productId,
      errorMessage: error.message,
      errorCode: error.code,
      req,
    });
    
    throw error;
  }
}

export async function getAdminProductMeta(req, res) {
  const [total, active, inactive, withVariants, tracked] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: false }),
    Product.countDocuments({ "purchaseOptionsV2.items.0": { $exists: true } }),
    Product.countDocuments({
      $or: [
        { stockQuantity: { $ne: null } },
        {
          "purchaseOptionsV2.items": {
            $elemMatch: {
              stockQuantity: { $ne: null },
            },
          },
        },
      ],
    }),
  ]);

  const [types, brandDocs] = await Promise.all([
    Product.distinct("type", { type: { $ne: null } }),
    Product.find({ "brand.title": { $exists: true } })
      .select("brand.title")
      .lean(),
  ]);

  const brands = Array.from(
    new Set(
      brandDocs
        .map((item) => getLocalizedTextValue(item?.brand?.title))
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right));

  return res.status(200).json({
    stats: {
      total,
      active,
      inactive,
      withVariants,
      tracked,
    },
    filters: {
      types: types.filter(Boolean).sort((left, right) => left.localeCompare(right)),
      brands,
    },
  });
}