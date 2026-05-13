# Image Upload API Documentation

## Overview

The Admin Image Upload API provides endpoints for uploading and automatically converting images to WebP format with minimal compression. This ensures optimal file sizes while maintaining visual quality.

**Compression Settings:**
- **Format:** WebP (modern, efficient image format)
- **Quality Level:** 75 (minimal compression)
- **Storage:** Base64-encoded for direct MongoDB storage
- **Max File Size:** 5 MB per image
- **Supported Formats:** JPG, PNG, GIF, BMP, TIFF, WebP, and more

## Typical Compression Results

| Original Format | Original Size | Compressed Size | Reduction |
|---|---|---|---|
| JPG (1920x1080) | ~150 KB | ~35 KB | **76%** |
| PNG (1920x1080) | ~250 KB | ~55 KB | **78%** |
| GIF (1920x1080) | ~200 KB | ~40 KB | **80%** |

## Endpoints

### 1. Single Image Upload

**Endpoint:** `POST /api/admin/upload/image`

**Request:**
```bash
curl -X POST http://localhost:5001/api/admin/upload/image \
  -F "image=@/path/to/image.jpg"
```

**Response (200 OK):**
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
      "originalSizeBytes": 153600,
      "compressedSizeBytes": 36400,
      "compressionRatio": "76.3%"
    }
  }
}
```

**Usage in Admin Panel:**
```javascript
// Upload single cover image
const formData = new FormData();
formData.append('image', file); // file from <input type="file">

const response = await fetch('/api/admin/upload/image', {
  method: 'POST',
  body: formData
});

const { image } = await response.json();

// Store the base64 directly in product
product.cover = image.base64; // Or create object: { url: image.base64, sort: 0 }
```

### 2. Gallery Batch Upload

**Endpoint:** `POST /api/admin/upload/gallery`

**Request:**
```bash
curl -X POST http://localhost:5001/api/admin/upload/gallery \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png" \
  -F "images=@photo3.gif"
```

**Response (200 OK):**
```json
{
  "success": true,
  "totalProcessed": 3,
  "images": [
    {
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
        "originalSizeBytes": 153600,
        "compressedSizeBytes": 36400,
        "compressionRatio": "76.3%"
      }
    },
    // ... more images
  ]
}
```

**Usage in Admin Panel:**
```javascript
// Upload multiple gallery images
const formData = new FormData();
files.forEach(file => {
  formData.append('images', file);
});

const response = await fetch('/api/admin/upload/gallery', {
  method: 'POST',
  body: formData
});

const { images } = await response.json();

// Build gallery with sort order
product.gallery = images.map((img, index) => ({
  url: img.base64,
  sort: index
}));
```

## Error Handling

### Common Error Codes

| Code | Status | Description |
|---|---|---|
| `image_file_required` | 400 | No file uploaded |
| `image_invalid_buffer` | 400 | Invalid image data |
| `image_empty_buffer` | 400 | Empty file uploaded |
| `image_invalid_dimensions` | 400 | Cannot read image dimensions |
| `image_too_large` | 413 | File exceeds 5 MB limit |
| `image_batch_empty` | 400 | No images in batch request |
| `image_batch_too_large` | 400 | More than 50 images in batch |
| `image_processing_failed` | 422 | Sharp conversion error |

### Error Response Example

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

## Storage in MongoDB

Images are stored as base64 strings in the Product model:

### Option 1: Simple String Storage
```javascript
product.cover = "data:image/webp;base64,UklGRiYAAABXRUJQVlA4...";
product.gallery = [
  { url: "data:image/webp;base64,UklGRiYAAABXRUJQVlA4...", sort: 0 },
  { url: "data:image/webp;base64,UklGRiYAAABXRUJQVlA4...", sort: 1 }
];
```

### Option 2: Using ProductImage Schema
```javascript
product.gallery = [
  {
    url: "data:image/webp;base64,UklGRiYAAABXRUJQVlA4...",
    sort: 0
  }
];
```

### Option 3: Purchase Option Images
```javascript
product.purchaseOptionsV2.items[0].images = [
  {
    url: "data:image/webp;base64,UklGRiYAAABXRUJQVlA4...",
    sort: 0
  }
];
```

## Implementation Notes

### Image Processing Logic

The image processing utility (`utils/imageProcessing.js`) handles:

1. **Validation**
   - Buffer integrity check
   - File size verification (max 5 MB)
   - Format verification

2. **Processing**
   - Format detection and metadata extraction
   - Dimension reading (width/height)
   - WebP conversion with quality: 75
   - Base64 encoding

3. **Metadata Collection**
   - Original dimensions
   - Original format (jpeg, png, etc.)
   - Original MIME type
   - Compression statistics

### Multer Configuration

- **Storage:** Memory (no disk writes)
- **File Size Limit:** 5 MB per file
- **Batch Limit:** 50 files per request
- **File Filter:** Only image/* MIME types accepted

### Performance Characteristics

- **Single Upload:** ~200-500ms (depends on size)
- **Batch Upload (5 images):** ~1-2s (parallel processing)
- **Typical Compression:** 75-80% size reduction

## Swagger Documentation

Full API documentation with interactive testing:

**Admin Docs:** `http://localhost:5001/api/admin/docs`

Look for **Admin Upload** section with:
- `/upload/image` - Single image endpoint
- `/upload/gallery` - Batch upload endpoint

## Security Considerations

⚠️ **Current State:** No authentication middleware on `/api/admin` endpoints

**Recommended Actions:**
1. Add JWT/Bearer token validation
2. Implement admin role checking
3. Add rate limiting
4. Consider file scanning for malicious content
5. Log upload operations for audit trail

## Integration Examples

### React Admin Component

```javascript
import React, { useState } from 'react';

export function ImageUpload({ onImageReady }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const { image } = await response.json();
      onImageReady({
        url: `data:${image.mimeType};base64,${image.base64}`,
        base64: image.base64,
        dimensions: `${image.metadata.width}x${image.metadata.height}`,
        compression: image.stats.compressionRatio
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Processing image...</p>}
    </div>
  );
}
```

### Gallery Batch Upload

```javascript
const handleGalleryUpload = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const response = await fetch('/api/admin/upload/gallery', {
    method: 'POST',
    body: formData
  });

  const { images, totalProcessed } = await response.json();
  
  const galleryItems = images.map((img, idx) => ({
    url: `data:${img.mimeType};base64,${img.base64}`,
    sort: idx,
    size: img.stats.compressedSizeBytes,
    original: img.stats.originalSizeBytes
  }));

  return galleryItems;
};
```

## Troubleshooting

### "Image file exceeds maximum size"
- Maximum allowed: 5 MB
- Solution: Use image editor to reduce dimensions or quality before upload

### "Cannot read image dimensions"
- File may be corrupted
- Solution: Try different image format or file

### "Only image files are allowed"
- MIME type not recognized as image
- Solution: Ensure file is valid image (not .txt renamed to .jpg)

### Slow processing
- Large file being processed
- Solution: Normal for files > 2 MB; consider batch uploads

## Future Enhancements

Potential improvements:
1. S3/Cloud storage integration (instead of base64)
2. Image resizing for thumbnails
3. AVIF format support
4. Watermarking capability
5. Batch processing with progress reporting
6. CDN URL generation instead of base64
