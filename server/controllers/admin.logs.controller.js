import {
  queryLogs,
  getLogsSummary,
  cleanupOldLogs,
} from "../utils/logging.js";

/**
 * Admin Logs Controller
 *
 * Endpoints for viewing, filtering, and managing operation logs.
 */

/**
 * List operation logs with filtering
 *
 * GET /api/admin/logs
 *
 * Query parameters:
 * - operationType: create|read|update|delete|mutation
 * - entityType: Product|Inventory|ImageUpload|etc
 * - action: Specific action string
 * - status: success|failed
 * - userId: Filter by user
 * - entityId: Filter by entity ID
 * - fromDate: ISO date string
 * - toDate: ISO date string
 * - limit: Results per page (default 50, max 500)
 * - skip: Pagination offset
 */
export async function listLogs(req, res) {
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
    } = req.query;

    const logs = await queryLogs({
      operationType,
      entityType,
      action,
      status,
      userId,
      entityId,
      fromDate,
      toDate,
      limit: Math.min(parseInt(limit, 10) || 50, 500),
      skip: Math.max(0, parseInt(skip, 10) || 0),
    });

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve logs",
      code: "logs_query_failed",
      error: error.message,
    });
  }
}

/**
 * Get logs summary statistics
 *
 * GET /api/admin/logs/summary
 *
 * Optional query parameters: operationType, entityType, status
 */
export async function getLogsSummaryEndpoint(req, res) {
  try {
    const { operationType, entityType, status } = req.query;

    const summary = await getLogsSummary({
      operationType,
      entityType,
      status,
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve logs summary",
      code: "logs_summary_failed",
      error: error.message,
    });
  }
}

/**
 * Get recent operations by entity type
 *
 * GET /api/admin/logs/entity/:entityType/:entityId
 *
 * Example: /api/admin/logs/entity/Product/5f7b3c3c3c3c3c3c3c3c3c3c
 */
export async function getEntityOperationHistory(req, res) {
  try {
    const { entityType, entityId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || 20), 500);

    if (!entityType || !entityId) {
      return res.status(400).json({
        message: "entityType and entityId are required",
        code: "params_missing",
      });
    }

    const logs = await queryLogs({
      entityType,
      entityId,
      limit,
    });

    return res.status(200).json({
      success: true,
      entityType,
      entityId,
      operationsCount: logs.length,
      operations: logs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve entity history",
      code: "entity_history_failed",
      error: error.message,
    });
  }
}

/**
 * Get user activity logs
 *
 * GET /api/admin/logs/user/:userId
 */
export async function getUserActivityLogs(req, res) {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || 50), 500);
    const skip = Math.max(0, parseInt(req.query.skip || 0));

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
        code: "user_id_missing",
      });
    }

    const logs = await queryLogs({
      userId,
      limit,
      skip,
    });

    return res.status(200).json({
      success: true,
      userId,
      activitiesCount: logs.length,
      activities: logs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve user activity",
      code: "user_activity_failed",
      error: error.message,
    });
  }
}

/**
 * Get failed operations for debugging
 *
 * GET /api/admin/logs/failed
 *
 * Query parameters: limit, skip, operationType, entityType
 */
export async function getFailedOperations(req, res) {
  try {
    const { operationType, entityType, limit = 50, skip = 0 } = req.query;

    const logs = await queryLogs({
      status: "failed",
      operationType,
      entityType,
      limit: Math.min(parseInt(limit, 10) || 50, 500),
      skip: Math.max(0, parseInt(skip, 10) || 0),
    });

    return res.status(200).json({
      success: true,
      failedCount: logs.length,
      failed: logs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve failed operations",
      code: "failed_ops_query_failed",
      error: error.message,
    });
  }
}

/**
 * Cleanup old logs
 *
 * POST /api/admin/logs/cleanup
 *
 * Body: { daysOld: 90 }
 */
export async function cleanupLogs(req, res) {
  try {
    const { daysOld = 90 } = req.body;

    if (!Number.isInteger(daysOld) || daysOld < 1) {
      return res.status(400).json({
        message: "daysOld must be a positive integer",
        code: "invalid_days_old",
      });
    }

    const deletedCount = await cleanupOldLogs(daysOld);

    return res.status(200).json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} logs older than ${daysOld} days`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cleanup logs",
      code: "cleanup_failed",
      error: error.message,
    });
  }
}
