// models/Product.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/** =========================
 *  i18n: ua/ru/en/sk
 * ========================= */
const LocalizedString = new Schema(
  {
    ua: { type: String, default: "" },
    ru: { type: String, default: "" },
    en: { type: String, default: "" },
    sk: { type: String, default: "" }, // ✅ Slovak
  },
  { _id: false }
);

const LocalizedStringArray = new Schema(
  {
    ua: { type: [String], default: [] },
    ru: { type: [String], default: [] },
    en: { type: [String], default: [] },
    sk: { type: [String], default: [] },
  },
  { _id: false }
);

/** =========================
 *  Images
 * ========================= */
const ImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: LocalizedString, default: () => ({}) },
    sort: { type: Number, default: 0 },
  },
  { _id: false }
);

/** =========================
 *  Dynamic badges (chips) on product card
 *  e.g. "25g", "0g", "180 kcal"
 * ========================= */
const BadgeSchema = new Schema(
  {
    key: { type: String, required: true, trim: true }, // "protein", "sugar", "kcal"
    label: { type: LocalizedString, default: () => ({}) }, // если нужно: "Protein", "Sugar"
    valueNumber: { type: Number, default: null }, // 25, 0, 180
    valueText: { type: String, default: "" }, // если нужно строкой (например "0 g")
    unit: { type: String, default: "" }, // "g", "kcal"
    // как отображать:
    display: { type: String, enum: ["value", "label_value"], default: "value" }, // "25g" vs "Protein 25g"
    sort: { type: Number, default: 0 },
    isHighlighted: { type: Boolean, default: false }, // если надо подсветить один бейдж
  },
  { _id: false }
);

/** =========================
 *  Dynamic nutrition table:
 *  columns: dynamic
 *  rows: dynamic
 * ========================= */
const NutritionCellSchema = new Schema(
  {
    value: { type: Number, default: null },
    text: { type: String, default: "" }, // например "1436 kJ / 364 kcal"
    unit: { type: String, default: "" }, // "g", "kcal", ...
  },
  { _id: false }
);

const NutritionColumnSchema = new Schema(
  {
    key: { type: String, required: true, trim: true }, // "per_100g", "per_60g"
    label: { type: LocalizedString, default: () => ({}) }, // "NA 100G", "NA 60G"
    meta: {
      grams: { type: Number, default: null }, // 100, 60 (если применимо)
    },
    sort: { type: Number, default: 0 },
  },
  { _id: false }
);

const NutritionRowSchema = new Schema(
  {
    key: { type: String, required: true, trim: true }, // "energy", "fat", ...
    label: { type: LocalizedString, default: () => ({}) },
    values: {
      type: Map,
      of: NutritionCellSchema, // Map<columnKey, cell>
      default: () => ({}),
    },
    sort: { type: Number, default: 0 },
  },
  { _id: false }
);

const NutritionTableSchema = new Schema(
  {
    title: { type: LocalizedString, default: () => ({}) }, // "Výživové údaje"
    columns: { type: [NutritionColumnSchema], default: [] },
    rows: { type: [NutritionRowSchema], default: [] },
  },
  { _id: false }
);

const PurchaseUnitSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    price: { type: Number, default: null },
  },
  { _id: false }
);

const PurchaseBoxSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    price: { type: Number, default: null },
    quantity: { type: Number, default: null },
  },
  { _id: false }
);

const PurchaseOptionsSchema = new Schema(
  {
    unit: { type: PurchaseUnitSchema, default: () => ({}) },
    box: { type: PurchaseBoxSchema, default: () => ({}) },
    defaultMode: {
      type: String,
      enum: ["unit", "box"],
      default: "unit",
    },
  },
  { _id: false }
);

/** =========================
 *  Product
 * ========================= */
const ProductSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // i18n
    title: { type: LocalizedString, required: true, default: () => ({}) },
    subtitle: { type: LocalizedString, default: () => ({}) }, // строка под заголовком
    description: { type: LocalizedString, default: () => ({}) }, // можно HTML
    ingredients: { type: LocalizedString, default: () => ({}) }, // "Zloženie"
    features: { type: LocalizedStringArray, default: () => ({}) }, // буллеты

    // media
    cover: { type: ImageSchema, default: null },
    gallery: { type: Array, default: [] },

    // ✅ dynamic badges for card (chips)
    cardBadges: { type: [BadgeSchema], default: [] },

    // nutrition
    nutritionTable: { type: NutritionTableSchema, default: null },

    // commerce
    currency: { type: String, default: "EUR" },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null },
    inStock: { type: Boolean, default: true },

    // optional quick fields (for filters/sorting), не обязаны
    weightG: { type: Number, default: null },
    proteinG: { type: Number, default: null },

    // seo
    seoTitle: { type: LocalizedString, default: () => ({}) },
    seoDescription: { type: LocalizedString, default: () => ({}) },

    isActive: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
    isBar: { type: Boolean, default: true },
    brand: { title: { type: LocalizedString, default: () => ({}) } },
    purchaseOptions: {
      type: PurchaseOptionsSchema,
      default: () => ({
        unit: { enabled: true, price: null },
        box: { enabled: false, price: null, quantity: null },
        defaultMode: "unit",
      }),
    },
  },
  { timestamps: true }
);

/** =========================
 *  Hooks
 * ========================= */
ProductSchema.pre("save", function (next) {
  if (this.slug) this.slug = String(this.slug).trim().toLowerCase();

  // сортировки по умолчанию (не обязательно, но удобно)
  if (Array.isArray(this.gallery)) {
    this.gallery.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }
  if (Array.isArray(this.cardBadges)) {
    this.cardBadges.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }
  if (this.nutritionTable?.columns?.length) {
    this.nutritionTable.columns.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }
  if (this.nutritionTable?.rows?.length) {
    this.nutritionTable.rows.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }

  next();
});

/** =========================
 *  Indexes
 * ========================= */
ProductSchema.index({ isActive: 1, sort: 1, createdAt: -1 });
ProductSchema.index({
  "title.ua": "text",
  "title.ru": "text",
  "title.en": "text",
  "title.sk": "text",
});

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);