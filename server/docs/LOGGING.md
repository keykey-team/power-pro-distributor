# Operation Logging System

## Overview

Complete audit trail system for all admin operations (product CRUD, inventory mutations, file uploads). All operations are logged to MongoDB collection `operationLogs` with detailed metadata for compliance, debugging, and analytics.

**Logged Operations:**
- ✅ Product creation, updates, deletion
- ✅ Inventory receipts, write-offs, recounts
- ✅ Image uploads (single and batch)
- ✅ All failures with error details

## Database Schema

### OperationLog Model

```javascript
{
  operationType: "create" | "read" | "update" | "delete" | "mutation",
  entityType: "Product" | "Inventory" | "InventoryReceipt" | "ImageUpload" | ...,
  entityId: String,        // Reference to affected entity
  entitySlug: String,      // Entity slug if applicable
  entityTitle: String,     // Entity title/name
  action: String,          // Specific action: "product_created", "inventory_receipt"
  status: "success" | "failed",
  details: Object,         // Operation-specific data
  changes: {
    before: Object,        // Previous values (updates only)
    after: Object          // New values (updates only)
  },
  errorMessage: String,    // Error message if failed
  errorCode: String,       // Error code if failed
  errorStack: String,      // Stack trace if failed
  userId: String,          // Admin user ID (future: auth integration)
  userRole: String,        // User role
  userEmail: String,       // User email
  metadata: {
    ip: String,            // Request IP
    userAgent: String,     // User agent
    method: String,        // HTTP method
    path: String,          // Request path
    duration: Number,      // Operation duration in ms
    timestamp: Date        // Operation timestamp
  },
  quantity: Number,        // Items affected
  amount: Number,          // Monetary amount if applicable
  createdAt: Date,         // Log creation timestamp
  updatedAt: Date
}
```

## API Endpoints

### 1. List All Logs

**Endpoint:** `GET /api/admin/logs`

**Query Parameters:**
```
- operationType: create|read|update|delete|mutation
- entityType: Product|Inventory|ImageUpload|etc
- action: Specific action string
- status: success|failed
- userId: Filter by user
- entityId: Filter by entity ID
- fromDate: ISO date string
- toDate: ISO date string
- limit: Results per page (default 50, max 500)
- skip: Pagination offset
```

**Example Request:**
```bash
# Get all failed product operations in last 7 days
GET /api/admin/logs?operationType=update&entityType=Product&status=failed&fromDate=2026-05-06
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "operationType": "update",
      "entityType": "Product",
      "entityId": "507f1f77bcf86cd799439010",
      "entitySlug": "protein-powder-1kg",
      "entityTitle": "Protein Powder 1kg",
      "action": "product_updated",
      "status": "success",
      "details": {
        "changedFields": ["price", "stockQuantity"]
      },
      "changes": {
        "before": { "price": 29.99, "stockQuantity": 100 },
        "after": { "price": 27.99, "stockQuantity": 95 }
      },
      "metadata": {
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "method": "PATCH",
        "path": "/api/admin/products/507f1f77bcf86cd799439010",
        "duration": 145,
        "timestamp": "2026-05-13T10:30:00Z"
      },
      "createdAt": "2026-05-13T10:30:05Z"
    }
    // ... more logs
  ]
}
```

### 2. Get Logs Summary

**Endpoint:** `GET /api/admin/logs/summary`

**Query Parameters:**
```
- operationType: Filter by type
- entityType: Filter by entity
- status: Filter by status
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalOperations": 1250,
    "successCount": 1240,
    "failedCount": 10,
    "byOperationType": [
      { "type": "create", "count": 450 },
      { "type": "update", "count": 650 },
      { "type": "delete", "count": 100 },
      { "type": "mutation", "count": 50 }
    ],
    "byEntityType": [
      { "type": "Product", "count": 800 },
      { "type": "InventoryReceipt", "count": 300 },
      { "type": "ImageUpload", "count": 150 }
    ],
    "avgDuration": 245,
    "totalQuantity": 5420,
    "totalAmount": null
  }
}
```

### 3. Get Failed Operations

**Endpoint:** `GET /api/admin/logs/failed`

**Response:**
```json
{
  "success": true,
  "failedCount": 3,
  "failed": [
    {
      "operationType": "mutation",
      "entityType": "InventoryWriteoff",
      "action": "inventory_writeoff",
      "status": "failed",
      "errorCode": "inventory_insufficient_stock",
      "errorMessage": "Insufficient stock for write-off.",
      "details": { "itemCount": 2 },
      "createdAt": "2026-05-13T10:25:00Z"
    }
    // ... more failed operations
  ]
}
```

### 4. Get Entity History

**Endpoint:** `GET /api/admin/logs/entity/:entityType/:entityId`

**Example:**
```bash
GET /api/admin/logs/entity/Product/507f1f77bcf86cd799439010
```

**Response:**
```json
{
  "success": true,
  "entityType": "Product",
  "entityId": "507f1f77bcf86cd799439010",
  "operationsCount": 5,
  "operations": [
    {
      "action": "product_updated",
      "status": "success",
      "details": { "changedFields": ["price"] },
      "createdAt": "2026-05-13T10:30:00Z"
    },
    {
      "action": "product_updated",
      "status": "success",
      "details": { "changedFields": ["stockQuantity"] },
      "createdAt": "2026-05-12T15:20:00Z"
    },
    // ... history
  ]
}
```

### 5. Get User Activity

**Endpoint:** `GET /api/admin/logs/user/:userId`

**Response:**
```json
{
  "success": true,
  "userId": "admin-123",
  "activitiesCount": 45,
  "activities": [
    // Similar structure to logs above
  ]
}
```

### 6. Cleanup Old Logs

**Endpoint:** `POST /api/admin/logs/cleanup`

**Request Body:**
```json
{
  "daysOld": 90
}
```

**Response:**
```json
{
  "success": true,
  "deletedCount": 340,
  "message": "Deleted 340 logs older than 90 days"
}
```

## Usage in Controllers

### Logging Success

```javascript
import { logSuccess } from "../utils/logging.js";

// In create/update/delete handlers
await logSuccess({
  operationType: "create",
  entityType: "Product",
  action: "product_created",
  entityId: String(product._id),
  entitySlug: product.slug,
  entityTitle: product.title,
  details: { name: product.title },
  req,  // Express request object (extracts IP, UA, etc)
});
```

### Logging Failure

```javascript
import { logFailure } from "../utils/logging.js";

try {
  // operation
} catch (error) {
  await logFailure({
    operationType: "create",
    entityType: "Product",
    action: "product_created",
    errorMessage: error.message,
    errorCode: error.code,
    errorStack: error.stack,
    req,
  });
}
```

### Logging with Before/After

```javascript
await logSuccess({
  operationType: "update",
  entityType: "Product",
  action: "product_updated",
  entityId: String(product._id),
  details: { changedFields: ["price", "stock"] },
  changes: {
    before: { price: 29.99, stockQuantity: 100 },
    after: { price: 27.99, stockQuantity: 95 }
  },
  req,
});
```

### Log and Execute Pattern

```javascript
import { logAndExecute } from "../utils/logging.js";

export async function updateProduct(req, res) {
  try {
    const result = await logAndExecute(
      {
        operationType: "update",
        entityType: "Product",
        action: "product_updated",
        entityId: req.params.id,
        req,
      },
      async () => {
        return await Product.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );
      }
    );
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

## Logged Operations

### Product Operations

| Action | Operation | Entity | Example Data |
|--------|-----------|--------|--------------|
| `product_created` | create | Product | `{payload: ["title", "price"]}` |
| `product_updated` | update | Product | `{changedFields: ["price"], before/after}` |
| `product_deleted` | delete | Product | `{deletedAt, productType}` |

### Inventory Operations

| Action | Operation | Entity | Example Data |
|--------|-----------|--------|--------------|
| `inventory_receipt` | mutation | InventoryReceipt | `{itemCount, totalDelta}` |
| `inventory_writeoff` | mutation | InventoryWriteoff | `{itemCount, totalDelta}` |
| `inventory_recount` | mutation | InventoryRecount | `{itemCount, totalDelta}` |

### Upload Operations

| Action | Operation | Entity | Example Data |
|--------|-----------|--------|--------------|
| `image_uploaded` | create | ImageUpload | `{originalSize, compressedSize, compression}` |
| `gallery_uploaded` | create | ImageUpload | `{totalImages, totalOriginalSize, totalCompressed}` |

## Database Indexes

Automatic indexes for performance:

```javascript
createdAt: -1
operationType: 1, createdAt: -1
entityType: 1, createdAt: -1
action: 1, createdAt: -1
status: 1, createdAt: -1
userId: 1, createdAt: -1
"metadata.ip": 1, createdAt: -1
```

## Compliance & Retention

**Current Policy:**
- ✅ All operations logged automatically
- ✅ Failures logged with full error stack
- ✅ IP and User-Agent captured
- ✅ Before/After changes tracked for updates
- ✅ Operation duration measured

**Recommended Retention:**
- Keep 90+ days of logs
- Archive logs older than 1 year
- Run cleanup monthly: `POST /api/admin/logs/cleanup { daysOld: 365 }`

## Querying Examples

### Get all failed inventory operations today

```bash
curl "http://localhost:5001/api/admin/logs?operationType=mutation&status=failed&fromDate=$(date -u +%Y-%m-%d)"
```

### Get product update history for one item

```bash
curl "http://localhost:5001/api/admin/logs/entity/Product/507f1f77bcf86cd799439010"
```

### Get specific user activity

```bash
curl "http://localhost:5001/api/admin/logs/user/admin-123?limit=100"
```

### Get upload statistics

```bash
curl "http://localhost:5001/api/admin/logs/summary?entityType=ImageUpload"
```

## Future Enhancements

- [ ] Export logs to CSV/JSON
- [ ] Real-time log streaming via WebSocket
- [ ] Log retention policies
- [ ] Automated alerts on failures
- [ ] Integration with external audit systems
- [ ] User identity (auth middleware integration)
- [ ] Detailed permission tracking
- [ ] Log encryption at rest
