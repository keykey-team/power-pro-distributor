import mongoose from "mongoose";

const OrderBoxItemSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    barcode: { type: String, default: "" },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    discountedTotal: { type: Number, required: true, min: 0 },
    img: { type: String, default: "" },
    multiplicity: { type: Number, default: 1 },
  },
  { _id: false }
);

const OrderBoxSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      enum: [5, 10],
      required: true,
    },
    items: {
      type: [OrderBoxItemSchema],
      default: [],
    },
  },
  { _id: false }
);

const OrderPositionSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["product", "custom_box"],
      required: true,
    },

    // product
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    barcode: { type: String, default: "" },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    discountedTotal: { type: Number, required: true, min: 0 },
    img: { type: String, default: "" },
    multiplicity: { type: Number, default: 1 },

    // custom_box
    box: {
      type: OrderBoxSchema,
      default: null,
    },
  },
  { _id: false }
);

const DeliverySchema = new mongoose.Schema(
  {
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    psc: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cash", "card", "online", "bank_transfer", "other"],
      default: "card",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    customer: {
      name: { type: String, required: true, trim: true },
      surname: { type: String, default: "", trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: "", trim: true },
    },

    promoCode: {
      type: String,
      default: "",
      trim: true,
    },

    items: {
      type: [OrderPositionSchema],
      default: [],
    },

    totals: {
      subtotal: { type: Number, default: 0, min: 0 },
      discountTotal: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "EUR" },
    },

    delivery: {
      type: DeliverySchema,
      default: () => ({}),
    },

    payment: {
      type: PaymentSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: [
        "new",
        "processing",
        "confirmed",
        "shipped",
        "completed",
        "cancelled",
      ],
      default: "new",
      index: true,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

function generateOrderNumber() {
  const ts = Date.now().toString().slice(-8);
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${ts}-${rnd}`;
}

OrderSchema.pre("validate", function () {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
});

export const Order = mongoose.model("Order", OrderSchema);