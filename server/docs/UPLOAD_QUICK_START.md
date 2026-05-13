# Quick Start: Image Upload Testing

## Prerequisites
- Server running on http://localhost:5001
- Multer and Sharp installed (`npm install multer sharp`)

## Test Endpoints

### 1. Single Image Upload
```bash
# Using curl
curl -X POST http://localhost:5001/api/admin/upload/image \
  -F "image=@test-image.jpg"

# Using fetch (JavaScript)
const formData = new FormData();
formData.append('image', file); // from file input
const res = await fetch('/api/admin/upload/image', {
  method: 'POST',
  body: formData
});
const { image } = await res.json();
console.log('WebP base64:', image.base64);
console.log('Compression:', image.stats.compressionRatio);
```

### 2. Batch Gallery Upload
```bash
# Using curl
curl -X POST http://localhost:5001/api/admin/upload/gallery \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png" \
  -F "images=@photo3.gif"

# Using fetch
const formData = new FormData();
files.forEach(file => formData.append('images', file));
const res = await fetch('/api/admin/upload/gallery', {
  method: 'POST',
  body: formData
});
const { images, totalProcessed } = await res.json();
console.log(`Processed ${totalProcessed} images`);
```

## Expected Responses

### Success (200)
```json
{
  "success": true,
  "image": {
    "format": "webp",
    "base64": "UklGRiYAAABXRUJQVlA4IBIAAAAwAQ...",
    "mimeType": "image/webp",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "originalFormat": "jpeg",
      "originalMimeType": "image/jpeg",
      "quality": 75
    },
    "stats": {
      "originalSizeBytes": 245000,
      "compressedSizeBytes": 52000,
      "compressionRatio": "78.8%"
    }
  }
}
```

### Error (400/413/422)
```json
{
  "message": "Image file exceeds maximum size of 5 MB.",
  "code": "image_too_large",
  "details": {
    "sizeBytes": 6291456,
    "maxSizeBytes": 5242880
  }
}
```

## Verify Integration

### Check Swagger UI
1. Open http://localhost:5001/api/admin/docs
2. Look for **Admin Upload** section
3. Test endpoints directly in Swagger

### Check Routes Mount
```bash
# Server startup should show:
# 🛠 Admin docs: http://localhost:5001/api/admin/docs
```

## File Sizes for Testing
Create test images with different formats:
```bash
# Create small test JPG (~100 KB)
ffmpeg -f lavfi -i color=c=blue:s=1920x1080:d=1 test.jpg

# Create PNG (~200 KB)
ffmpeg -f lavfi -i color=c=red:s=1920x1080:d=1 test.png

# Create GIF (~150 KB)
ffmpeg -f lavfi -i color=c=green:s=1920x1080:d=1 test.gif
```

## Integration with Product Admin
After upload returns base64:
```javascript
// Store in product cover
product.cover = image.base64;

// Or with metadata
product.images = [{
  url: image.base64,
  width: image.metadata.width,
  height: image.metadata.height,
  compressed: image.stats.compressionRatio
}];
```

## Troubleshooting

| Issue | Solution |
|---|---|
| 404 Not Found | Check /api/admin/docs for correct URL |
| 413 File Too Large | Keep images under 5 MB |
| No file property | Check multer field name matches ("image" or "images") |
| Slow response | Large files take 200-500ms per image |
| MIME type rejected | Upload must be actual image file |

## Performance Notes
- Single ~200 KB JPG: ~300-400ms
- Batch 5 images: ~1-2s (parallel processing)
- Memory usage: ~10-15 MB for 50 × 5MB files
- Compression: typically 75-80% size reduction
