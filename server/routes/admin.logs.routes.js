import { Router } from "express";
import {
  listLogs,
  getLogsSummaryEndpoint,
  getEntityOperationHistory,
  getUserActivityLogs,
  getFailedOperations,
  cleanupLogs,
} from "../controllers/admin.logs.controller.js";

/**
 * Admin Logs Routes
 *
 * Endpoints for viewing and managing operation audit logs.
 * All endpoints return JSON with logs, summaries, and history.
 */

const router = Router();

/**
 * @name GET /api/admin/logs
 * @description List all operation logs with filtering
 * @query {string} [operationType] - create|read|update|delete|mutation
 * @query {string} [entityType] - Product|Inventory|ImageUpload|etc
 * @query {string} [status] - success|failed
 * @query {number} [limit] - Results per page (default 50, max 500)
 * @query {number} [skip] - Pagination offset
 */
router.get("/", listLogs);

/**
 * @name GET /api/admin/logs/summary
 * @description Get aggregate statistics on operations
 * @query {string} [operationType] - Filter summary
 * @query {string} [entityType] - Filter summary
 * @query {string} [status] - Filter summary
 */
router.get("/summary", getLogsSummaryEndpoint);

/**
 * @name GET /api/admin/logs/failed
 * @description Get all failed operations for debugging
 * @query {string} [operationType] - Filter by type
 * @query {string} [entityType] - Filter by entity
 * @query {number} [limit] - Results per page
 * @query {number} [skip] - Pagination offset
 */
router.get("/failed", getFailedOperations);

/**
 * @name GET /api/admin/logs/entity/:entityType/:entityId
 * @description Get operation history for a specific entity
 * @param {string} entityType - Product, Inventory, etc.
 * @param {string} entityId - Entity ID
 * @query {number} [limit] - Results per page
 */
router.get("/entity/:entityType/:entityId", getEntityOperationHistory);

/**
 * @name GET /api/admin/logs/user/:userId
 * @description Get all operations performed by a specific user
 * @param {string} userId - User ID
 * @query {number} [limit] - Results per page
 * @query {number} [skip] - Pagination offset
 */
router.get("/user/:userId", getUserActivityLogs);

/**
 * @name POST /api/admin/logs/cleanup
 * @description Delete logs older than N days
 * @body {number} [daysOld] - Default 90 days
 */
router.post("/cleanup", cleanupLogs);

export default router;
