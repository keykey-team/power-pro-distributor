import mongoose from "mongoose";

const DEFAULT_SORT_FIELD = "updatedAt";
const DEFAULT_SORT_ORDER = "desc";
const SORT_DIRECTIONS = {
  asc: 1,
  desc: -1,
};
const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "price",
  "oldPrice",
  "stockQuantity",
  "sort",
  "slug",
  "type",
  "isActive",
  "inStock",
]);

export function parseBooleanQuery(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = String(value ?? "").trim().toLowerCase();

  if (["true", "1", "yes"].includes(normalizedValue)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalizedValue)) {
    return false;
  }

  return undefined;
}

export function parseCsvQuery(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item || "").split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseIntegerQuery(
  value,
  { defaultValue, min, max } = {}
) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return defaultValue;
  }

  let normalizedValue = Math.trunc(parsedValue);

  if (typeof min === "number") {
    normalizedValue = Math.max(min, normalizedValue);
  }

  if (typeof max === "number") {
    normalizedValue = Math.min(max, normalizedValue);
  }

  return normalizedValue;
}

export function parseNumberQuery(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRegexConditions(paths, searchValue) {
  const regex = new RegExp(escapeRegex(searchValue), "i");
  return paths.map((path) => ({ [path]: regex }));
}

function buildDateRange(field, fromValue, toValue) {
  const range = {};

  if (fromValue) {
    const parsedFrom = new Date(fromValue);
    if (!Number.isNaN(parsedFrom.getTime())) {
      range.$gte = parsedFrom;
    }
  }

  if (toValue) {
    const parsedTo = new Date(toValue);
    if (!Number.isNaN(parsedTo.getTime())) {
      range.$lte = parsedTo;
    }
  }

  return Object.keys(range).length ? { [field]: range } : null;
}

function buildTrackedStockFilter(hasTrackedStock) {
  if (typeof hasTrackedStock !== "boolean") {
    return null;
  }

  if (hasTrackedStock) {
    return {
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
    };
  }

  return {
    stockQuantity: null,
    "purchaseOptionsV2.items": {
      $not: {
        $elemMatch: {
          stockQuantity: { $ne: null },
        },
      },
    },
  };
}

export function buildAdminProductFilter(query = {}) {
  const conditions = [];
  const ids = parseCsvQuery(query.ids).filter((id) => mongoose.isValidObjectId(id));
  const slugs = parseCsvQuery(query.slugs).map((slug) => slug.toLowerCase());
  const types = parseCsvQuery(query.types);

  if (ids.length) {
    conditions.push({ _id: { $in: ids } });
  }

  if (slugs.length) {
    conditions.push({ slug: { $in: slugs } });
  }

  const exactId = String(query.id || "").trim();
  if (exactId && mongoose.isValidObjectId(exactId)) {
    conditions.push({ _id: exactId });
  }

  const exactSlug = String(query.slug || "").trim().toLowerCase();
  if (exactSlug) {
    conditions.push({ slug: exactSlug });
  }

  const isActive = parseBooleanQuery(query.isActive);
  if (typeof isActive === "boolean") {
    conditions.push({ isActive });
  }

  const inStock = parseBooleanQuery(query.inStock);
  if (typeof inStock === "boolean") {
    conditions.push({ inStock });
  }

  const isBar = parseBooleanQuery(query.isBar);
  if (typeof isBar === "boolean") {
    conditions.push({ isBar });
  }

  const hasVariants = parseBooleanQuery(query.hasVariants);
  if (typeof hasVariants === "boolean") {
    conditions.push({
      "purchaseOptionsV2.items.0": { $exists: hasVariants },
    });
  }

  const hasTrackedStock = parseBooleanQuery(query.hasTrackedStock);
  const trackedStockFilter = buildTrackedStockFilter(hasTrackedStock);
  if (trackedStockFilter) {
    conditions.push(trackedStockFilter);
  }

  const type = String(query.type || "").trim();
  if (type) {
    conditions.push({ type });
  }

  if (types.length) {
    conditions.push({ type: { $in: types } });
  }

  const brand = String(query.brand || "").trim();
  if (brand) {
    conditions.push({
      $or: buildRegexConditions(
        ["brand.title.ua", "brand.title.ru", "brand.title.en", "brand.title.sk"],
        brand
      ),
    });
  }

  const q = String(query.q || "").trim();
  if (q) {
    const searchConditions = buildRegexConditions(
      [
        "slug",
        "type",
        "title.ua",
        "title.ru",
        "title.en",
        "title.sk",
        "subtitle.ua",
        "subtitle.ru",
        "subtitle.en",
        "subtitle.sk",
        "brand.title.ua",
        "brand.title.ru",
        "brand.title.en",
        "brand.title.sk",
      ],
      q
    );

    if (mongoose.isValidObjectId(q)) {
      searchConditions.push({ _id: q });
    }

    conditions.push({ $or: searchConditions });
  }

  const minPrice = parseNumberQuery(query.minPrice);
  const maxPrice = parseNumberQuery(query.maxPrice);
  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    const priceFilter = {};
    if (typeof minPrice === "number") {
      priceFilter.$gte = minPrice;
    }
    if (typeof maxPrice === "number") {
      priceFilter.$lte = maxPrice;
    }
    conditions.push({ price: priceFilter });
  }

  const minStock = parseNumberQuery(query.minStock);
  const maxStock = parseNumberQuery(query.maxStock);
  if (typeof minStock === "number" || typeof maxStock === "number") {
    const stockFilter = {};
    if (typeof minStock === "number") {
      stockFilter.$gte = minStock;
    }
    if (typeof maxStock === "number") {
      stockFilter.$lte = maxStock;
    }
    conditions.push({ stockQuantity: stockFilter });
  }

  const createdAtFilter = buildDateRange(
    "createdAt",
    query.createdFrom,
    query.createdTo
  );
  if (createdAtFilter) {
    conditions.push(createdAtFilter);
  }

  const updatedAtFilter = buildDateRange(
    "updatedAt",
    query.updatedFrom,
    query.updatedTo
  );
  if (updatedAtFilter) {
    conditions.push(updatedAtFilter);
  }

  if (!conditions.length) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions };
}

export function buildAdminProductSort(query = {}, { defaultSort } = {}) {
  const explicitSort = String(query.sort || "").trim();

  if (explicitSort) {
    const normalizedSort = explicitSort
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .reduce((accumulator, item) => {
        const isDesc = item.startsWith("-");
        const field = item.replace(/^[+-]/, "");

        if (ALLOWED_SORT_FIELDS.has(field)) {
          accumulator[field] = isDesc ? -1 : 1;
        }

        return accumulator;
      }, {});

    if (Object.keys(normalizedSort).length) {
      return normalizedSort;
    }

    return defaultSort || { updatedAt: -1 };
  }

  const sortField = String(query.sortBy || DEFAULT_SORT_FIELD).trim();
  const sortOrder = String(query.sortOrder || DEFAULT_SORT_ORDER)
    .trim()
    .toLowerCase();

  if (ALLOWED_SORT_FIELDS.has(sortField)) {
    return {
      [sortField]: SORT_DIRECTIONS[sortOrder] || -1,
    };
  }

  return defaultSort || { updatedAt: -1 };
}

export function buildPagination(
  query = {},
  { defaultLimit = 20, maxLimit = 100 } = {}
) {
  const page = parseIntegerQuery(query.page, {
    defaultValue: 1,
    min: 1,
  });
  const limit = parseIntegerQuery(query.limit, {
    defaultValue: defaultLimit,
    min: 1,
    max: maxLimit,
  });

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function getLocalizedTextValue(localizedValue) {
  if (!localizedValue || typeof localizedValue !== "object") {
    return String(localizedValue || "").trim();
  }

  for (const locale of ["sk", "en", "ua", "ru"]) {
    const value = String(localizedValue?.[locale] || "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}