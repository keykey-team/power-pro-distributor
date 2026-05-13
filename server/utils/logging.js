import OperationLog from "../models/OperationLog.model.js";

/**
 * Operation Logging Utility
 *
 * Provides centralized logging for all admin operations.
 * Tracks: product CRUD, inventory mutations, file uploads, etc.
 *
 * Usage:
 *   await logOperation({
 *     operationType: 'create',
 *     entityType: 'Product',
 *     action: 'product_created',
 *     details: { name: 'New Product' },
 *     userId: 'admin-123',
 *     req: express_request_object
 *   });
 */

function extractRequestContext(req) {
  return {
    ip:
      req?.headers?.["x-forwarded-for"]?.split(",")[0].trim() ||
      req?.connection?.remoteAddress ||
      "unknown",
    userAgent: req?.headers?.["user-agent"] || "unknown",
    method: req?.method || "unknown",
    path: req?.path || req?.baseUrl || "unknown",
  };
}

/**
 * Create operation log entry
 *
 * @param {Object} params - Logging parameters
 * @param {string} params.operationType - create|read|update|delete|mutation
 * @param {string} params.entityType - Product|Inventory|ImageUpload|etc
 * @param {string} params.action - Specific action (product_created, inventory_receipt)
 * @param {string} [params.entityId] - ID of affected entity
 * @param {string} [params.entitySlug] - Slug of affected entity
 * @param {string} [params.entityTitle] - Title of affected entity
 * @param {Object} [params.details] - Operation details
 * @param {Object} [params.changes] - Before/after comparison {before, after}
 * @param {string} [params.status] - success (default) | failed
 * @param {string} [params.errorMessage] - Error message if failed
 * @param {string} [params.errorCode] - Error code if failed
 * @param {string} [params.userId] - User who performed operation
 * @param {string} [params.userRole] - User role
 * @param {string} [params.userEmail] - User email
 * @param {Object} [params.req] - Express request object for context
 * @param {number} [params.duration] - Operation duration in ms
 * @param {number} [params.quantity] - Quantity affected
 * @param {number} [params.amount] - Monetary amount if applicable
 * @returns {Promise<Object>} Created log document
 */
export async function logOperation(params) {
  try {
    const {
      operationType,
      entityType,
      action,
      entityId,
      entitySlug,
      entityTitle,
      details = {},
      changes,
      status = "success",
      errorMessage,
      errorCode,
      errorStack,
      userId,
      userRole,
      userEmail,
      req,
      duration,
      quantity,
      amount,
    } = params;

    const metadata = {
      ...extractRequestContext(req),
      timestamp: new Date(),
      ...(duration !== undefined && { duration }),
    };

    const logEntry = new OperationLog({
      operationType,
      entityType,
      action,
      entityId,
      entitySlug,
      entityTitle,
      details,
      changes,
      status,
      errorMessage,
      errorCode,
      errorStack,
      userId,
      userRole,
      userEmail,
      metadata,
      quantity,
      amount,
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    // Log utility should not throw; instead warn
    console.error("❌ Failed to log operation:", error.message);
    return null;
  }
}

/**
 * Convenience wrapper for successful operations
 */
export async function logSuccess(params) {
  return logOperation({
    ...params,
    status: "success",
  });
}

/**
 * Convenience wrapper for failed operations
 */
export async function logFailure(params) {
  return logOperation({
    ...params,
    status: "failed",
  });
}

/**
 * Wrapper to log both operation and execution
 *
 * @param {Object} logParams - Log parameters
 * @param {Function} asyncFn - Function to execute
 * @returns {Promise<any>} Result of asyncFn
 */
export async function logAndExecute(logParams, asyncFn) {
  const startTime = Date.now();

  try {
    const result = await asyncFn();
    const duration = Date.now() - startTime;

    await logSuccess({
      ...logParams,
      duration,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    await logFailure({
      ...logParams,
      duration,
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack,
    });

    throw error;
  }
}

/**
 * Query logs with filters
 *
 * @param {Object} filters - Query filters
 * @param {string} [filters.operationType] - Operation type to filter
 * @param {string} [filters.entityType] - Entity type to filter
 * @param {string} [filters.action] - Action to filter
 * @param {string} [filters.status] - success | failed
 * @param {string} [filters.userId] - Filter by user
 * @param {string} [filters.entityId] - Filter by entity ID
 * @param {Date} [filters.fromDate] - Filter logs from date
 * @param {Date} [filters.toDate] - Filter logs to date
 * @param {number} [filters.limit] - Limit results (default 50, max 500)
 * @param {number} [filters.skip] - Skip results (for pagination)
 * @returns {Promise<Array>} Matching logs
 */
export async function queryLogs(filters = {}) {
  try {
    const {
      operationType,
      entityType,
      action,
      status,
      userId,
      entityId,
      fromDate,
      toDate,
      limit = 50,
      skip = 0,
    } = filters;

    const query = {};

    if (operationType) query.operationType = operationType;
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (entityId) query.entityId = entityId;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const logs = await OperationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 500))
      .skip(skip)
      .lean();

    return logs;
  } catch (error) {
    console.error("❌ Failed to query logs:", error.message);
    return [];
  }
}

/**
 * Get operation summary statistics
 *
 * @param {Object} [filters] - Same filters as queryLogs
 * @returns {Promise<Object>} Summary stats
 */
export async function getLogsSummary(filters = {}) {
  try {
    const query = {};

    if (filters.operationType) query.operationType = filters.operationType;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.status) query.status = filters.status;

    const stats = await OperationLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOperations: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          byOperationType: {
            $push: {
              type: "$operationType",
              count: 1,
            },
          },
          byEntityType: {
            $push: {
              type: "$entityType",
              count: 1,
            },
          },
          avgDuration: {
            $avg: "$metadata.duration",
          },
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    return stats[0] || {};
  } catch (error) {
    console.error("❌ Failed to get logs summary:", error.message);
    return {};
  }
}

/**
 * Delete old logs (cleanup)
 *
 * @param {number} daysOld - Delete logs older than N days
 * @returns {Promise<number>} Number of deleted documents
 */
export async function cleanupOldLogs(daysOld = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await OperationLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(
      `✅ Cleaned up ${result.deletedCount} logs older than ${daysOld} days`
    );
    return result.deletedCount;
  } catch (error) {
    console.error("❌ Failed to cleanup logs:", error.message);
    return 0;
  }
}
