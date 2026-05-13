import mongoose from "mongoose";

const InventoryMovementSchema = new mongoose.Schema(
  {
    operationType: {
      type: String,
      enum: ["receipt", "writeoff", "recount"],
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ["product", "purchase_option"],
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productSlug: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    productTitle: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    purchaseOptionKey: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    purchaseOptionTitle: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    quantityRequested: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityBefore: {
      type: Number,
      default: null,
      min: 0,
    },
    quantityDelta: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    reference: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    createdBy: {
      type: String,
      default: "",
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

InventoryMovementSchema.index({ createdAt: -1, operationType: 1 });

export const InventoryMovement =
  mongoose.models.InventoryMovement ||
  mongoose.model("InventoryMovement", InventoryMovementSchema);