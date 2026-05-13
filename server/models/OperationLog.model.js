import mongoose from "mongoose";

/**
 * Operation Log Schema
 *
 * Audit trail for all admin operations (product CRUD, inventory mutations, uploads).
 * Used for tracking changes, debugging, and compliance.
 *
 * Fields:
 * - operationType: CRUD operation type
 * - entityType: Product, Inventory, Upload, etc.
 * - entityId: Reference to affected entity
 * - action: Specific action performed
 * - userId: Admin user performing operation (optional for now)
 * - status: success | failed
 * - details: Operation-specific data
 * - errorMessage: If failed, error details
 * - metadata: Additional context (IP, user agent, etc.)
 * - timestamps: createdAt
 */

const operationLogSchema = new mongoose.Schema(
  {
    // Operation classification
    operationType: {
      type: String,
      enum: ["create", "read", "update", "delete", "mutation"],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: [
        "Product",
        "Inventory",
        "InventoryReceipt",
        "InventoryWriteoff",
        "InventoryRecount",
        "ImageUpload",
      ],
      required: true,
      index: true,
    },

    // Entity reference
    entityId: {
      type: String,
      index: true,
    },
    entitySlug: String,
    entityTitle: String,

    // Action details
    action: {
      type: String,
      required: true,
      index: true,
      // Examples: "product_created", "inventory_receipt", "image_uploaded"
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
      index: true,
    },

    // Request/Response data
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },

    // Error tracking
    errorMessage: String,
    errorCode: String,
    errorStack: String,

    // User context (expandable for auth)
    userId: String,
    userRole: String,
    userEmail: String,

    // Request context
    metadata: {
      ip: String,
      userAgent: String,
      method: String,
      path: String,
      duration: Number, // milliseconds
      timestamp: Date,
    },

    // Statistics
    quantity: Number,
    amount: Number,
  },
  {
    timestamps: true,
    collection: "operationLogs",
  }
);

// Indexes for common queries
operationLogSchema.index({ createdAt: -1 });
operationLogSchema.index({ operationType: 1, createdAt: -1 });
operationLogSchema.index({ entityType: 1, createdAt: -1 });
operationLogSchema.index({ action: 1, createdAt: -1 });
operationLogSchema.index({ status: 1, createdAt: -1 });
operationLogSchema.index({ userId: 1, createdAt: -1 });
operationLogSchema.index({ "metadata.ip": 1, createdAt: -1 });

const OperationLog = mongoose.model("OperationLog", operationLogSchema);

export default OperationLog;
