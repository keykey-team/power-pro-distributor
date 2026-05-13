import sharp from "sharp";

/**
 * Image Processing Utility
 *
 * Converts uploaded images to WebP format with minimal compression.
 * Quality setting of 75 provides good balance between file size and visual quality.
 *
 * Features:
 * - Converts any format (JPG, PNG, GIF, etc.) to WebP
 * - Applies minimal lossy compression (quality: 75)
 * - Returns base64-encoded result for easy storage
 * - Metadata: original size, compressed size, format, dimensions
 *
 * Typical compression:
 * - JPG (~100-200 KB) → WebP (~30-50 KB)
 * - PNG (~150-300 KB) → WebP (~40-70 KB)
 */

const WEBP_QUALITY = 75;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function normalizeString(value) {
  return String(value || "").trim();
}

function createImageError(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

/**
 * Validates buffer before processing
 * @param {Buffer} buffer - Image buffer from multer
 * @throws {Error} If validation fails
 */
function validateImageBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw createImageError("image_invalid_buffer");
  }

  if (buffer.length === 0) {
    throw createImageError("image_empty_buffer");
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw createImageError("image_too_large", {
      sizeBytes: buffer.length,
      maxSizeBytes: MAX_FILE_SIZE,
    });
  }
}

/**
 * Processes a single image: converts to WebP format with minimal compression
 *
 * @param {Buffer} buffer - Raw image buffer from multer
 * @param {string} mimeType - Original MIME type (e.g., 'image/jpeg')
 * @returns {Promise<Object>} Result object with base64 data, metadata, and compression stats
 * @throws {Error} If processing fails
 */
export async function processImageBuffer(buffer, mimeType = "") {
  validateImageBuffer(buffer);

  try {
    const originalSize = buffer.length;
    const originalFormat = normalizeString(mimeType).split("/")[1] || "unknown";

    // Load metadata to get dimensions
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      throw createImageError("image_invalid_dimensions");
    }

    // Convert to WebP with minimal compression
    const webpBuffer = await sharp(buffer)
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const compressedSize = webpBuffer.length;
    const compressionRatio = (
      ((originalSize - compressedSize) / originalSize) * 100
    ).toFixed(1);

    return {
      format: "webp",
      base64: webpBuffer.toString("base64"),
      mimeType: "image/webp",
      metadata: {
        width: metadata.width,
        height: metadata.height,
        originalFormat,
        originalMimeType: mimeType,
        quality: WEBP_QUALITY,
      },
      stats: {
        originalSizeBytes: originalSize,
        compressedSizeBytes: compressedSize,
        compressionRatio: `${compressionRatio}%`,
      },
    };
  } catch (error) {
    if (error.code) {
      throw error;
    }

    throw createImageError("image_processing_failed", {
      originalError: error.message,
    });
  }
}

/**
 * Processes multiple image buffers in parallel
 * Useful for batch operations like uploading gallery images
 *
 * @param {Array<{buffer: Buffer, mimeType: string}>} images - Array of image objects
 * @returns {Promise<Array>} Array of processed image results
 * @throws {Error} If any processing fails
 */
export async function processImageBuffers(images = []) {
  if (!Array.isArray(images) || images.length === 0) {
    throw createImageError("image_batch_empty");
  }

  if (images.length > 50) {
    throw createImageError("image_batch_too_large", {
      count: images.length,
      maxCount: 50,
    });
  }

  return Promise.all(
    images.map((img, index) =>
      processImageBuffer(img.buffer, img.mimeType).catch((error) => {
        error.itemIndex = index;
        throw error;
      })
    )
  );
}

export const ImageProcessingErrors = {
  image_invalid_buffer: "Invalid image buffer provided.",
  image_empty_buffer: "Image buffer is empty.",
  image_too_large: "Image file exceeds maximum size of 5 MB.",
  image_invalid_dimensions: "Unable to determine image dimensions.",
  image_processing_failed: "Failed to process image.",
  image_batch_empty: "At least one image is required.",
  image_batch_too_large: "Maximum 50 images allowed per batch.",
};
