# Quick Testing Guide: Operation Logging

## Verify Logging Works

### 1. Create a Product (should log)
```bash
curl -X POST http://localhost:5001/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": { "uk": "Тестовий продукт", "ru": "Тестовый продукт" },
    "slug": "test-product-123",
    "price": 29.99
  }'
```

### 2. Check Logs Were Created
```bash
# Get all logs
curl http://localhost:5001/api/admin/logs

# Get only successful logs
curl "http://localhost:5001/api/admin/logs?status=success"

# Get only product operations
curl "http://localhost:5001/api/admin/logs?entityType=Product"

# Get recent failures
curl "http://localhost:5001/api/admin/logs?status=failed&limit=10"
```

### 3. View Log Summary
```bash
curl http://localhost:5001/api/admin/logs/summary

# Filter summary by entity type
curl "http://localhost:5001/api/admin/logs/summary?entityType=Product"
```

### 4. View Failed Operations
```bash
curl http://localhost:5001/api/admin/logs/failed
```

### 5. View Single Entity History
```bash
# After creating product, get its ID from response
PRODUCT_ID="507f1f77bcf86cd799439010"

curl "http://localhost:5001/api/admin/logs/entity/Product/$PRODUCT_ID"
```

## Expected Log Structure

```json
{
  "operationType": "create",
  "entityType": "Product",
  "entityId": "507f1f77bcf86cd799439010",
  "entitySlug": "test-product-123",
  "entityTitle": "Тестовий продукт",
  "action": "product_created",
  "status": "success",
  "details": {
    "payload": ["title", "slug", "price"]
  },
  "metadata": {
    "ip": "127.0.0.1",
    "userAgent": "curl/7.68.0",
    "method": "POST",
    "path": "/api/admin/products",
    "duration": 145,
    "timestamp": "2026-05-13T12:30:00Z"
  },
  "createdAt": "2026-05-13T12:30:05Z"
}
```

## Test Specific Scenarios

### Test Product Update with Changes Tracking
```bash
PRODUCT_ID="507f1f77bcf86cd799439010"

curl -X PATCH http://localhost:5001/api/admin/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"price": 27.99}'

# Then check logs - should show before/after
curl "http://localhost:5001/api/admin/logs/entity/Product/$PRODUCT_ID"
```

### Test Inventory Operations
```bash
# Receipt (add stock)
curl -X POST http://localhost:5001/api/admin/inventory/receipts \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439010",
        "quantity": 50,
        "reason": "Purchase order",
        "reference": "PO-12345"
      }
    ]
  }'

# Check inventory logs
curl "http://localhost:5001/api/admin/logs?entityType=InventoryReceipt"
```

### Test Image Upload
```bash
# Upload single image
curl -X POST http://localhost:5001/api/admin/upload/image \
  -F "image=@test-image.jpg"

# Check upload logs
curl "http://localhost:5001/api/admin/logs?entityType=ImageUpload&action=image_uploaded"
```

## MongoDB Direct Query

If you want to check database directly:

```javascript
// Connect to MongoDB and run:
db.operationLogs.find({ entityType: "Product" }).sort({ createdAt: -1 }).limit(5)

// Get statistics
db.operationLogs.aggregate([
  { $group: {
    _id: "$status",
    count: { $sum: 1 }
  }}
])

// Find failed operations
db.operationLogs.find({ status: "failed" }).pretty()
```

## Log Cleanup

### Clean logs older than 90 days
```bash
curl -X POST http://localhost:5001/api/admin/logs/cleanup \
  -H "Content-Type: application/json" \
  -d '{"daysOld": 90}'

# Response: { "success": true, "deletedCount": 340, "message": "..." }
```

## Swagger UI Testing

1. Open http://localhost:5001/api/admin/docs
2. Expand **Admin Logs** section
3. Try endpoints directly:
   - GET /logs - List with filters
   - GET /logs/summary - Statistics
   - GET /logs/failed - Failed ops
   - POST /logs/cleanup - Maintenance

## Typical Log Counts After Testing

After running operations:
- Product create: 1 log
- Product update: 1 log
- Inventory receipt: 1 log
- Image upload: 1 log

Total expected logs: 4-5 (depending on errors)

## Performance Notes

- First request: ~200ms (index creation)
- Subsequent queries: <50ms
- Summary aggregation: ~100-150ms
- Logs stored in collection: `operationLogs`

## Troubleshooting

**No logs appearing:**
- Check MongoDB connection is active
- Verify operationLogs collection exists
- Check server console for logging errors (prefixed with ❌)

**Logs not updating real-time:**
- Logs write is async; wait 1-2s after operation
- Refresh browser/curl multiple times

**High query latency:**
- Check MongoDB indexes are created
- Run: `db.operationLogs.getIndexes()`
- Should see indexes on: createdAt, operationType, entityType, action, status, userId

## Next Features to Add

- [ ] Export logs to CSV
- [ ] Real-time log streaming via WebSocket
- [ ] Log retention policies
- [ ] Automated alerts on failures
- [ ] User authentication tracking
- [ ] Permission audit logging
