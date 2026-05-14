import { processImageBuffer, processImageBuffers, ImageProcessingErrors } from "../utils/imageProcessing.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logSuccess, logFailure } from "../utils/logging.js";

/**
 * Admin Upload Controller
 *
 * Handles file uploads and image processing for admin panel.
 * Converts uploaded images to WebP format with minimal compression.
 *
 * Current support:
 * - Single image upload with immediate conversion
 * - Batch image upload for gallery processing
 *
 * Saves processed WebP files into ftpuser/ftp/files and returns public FTP link.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FTP_FILES_DIRECTORY = path.resolve(__dirname, "..", "ftpuser", "ftp", "files");
const PUBLIC_FTP_BASE_URL = "https://fitwin-powerpro.com/ftp";

async function ensureFtpDirectory() {
  await fs.mkdir(FTP_FILES_DIRECTORY, { recursive: true });
}

function buildFileName(prefix = "file") {
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${randomSuffix}.webp`;
}

async function saveWebpFromBase64(base64, fileName) {
  await ensureFtpDirectory();

  const absolutePath = path.join(FTP_FILES_DIRECTORY, fileName);
  const fileBuffer = Buffer.from(base64, "base64");

  await fs.writeFile(absolutePath, fileBuffer);

  return {
    fileName,
    absolutePath,
    publicUrl: `${PUBLIC_FTP_BASE_URL}/${fileName}`,
  };
}

function getUploadErrorStatus(errorCode) {
  if (
    [
      "image_invalid_buffer",
      "image_empty_buffer",
      "image_invalid_dimensions",
      "image_batch_empty",
    ].includes(errorCode)
  ) {
    return 400;
  }

  if (["image_too_large", "image_batch_too_large"].includes(errorCode)) {
    return 413;
  }

  if (errorCode === "image_processing_failed") {
    return 422;
  }

  return 500;
}

/**
 * Upload and process a single image
 * Converts to WebP with quality 75 (minimal compression)
 *
 * POST /api/admin/upload/image
 *
 * Expected: multipart/form-data with single file named "image"
 * Returns: WebP base64 data, metadata, compression statistics
 */
export async function uploadSingleImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided.",
        code: "image_file_required",
      });
    }

    const result = await processImageBuffer(
      req.file.buffer,
      req.file.mimetype
    );
    const storedFile = await saveWebpFromBase64(result.base64, buildFileName("cover"));

    // Log successful upload
    await logSuccess({
      operationType: "create",
      entityType: "ImageUpload",
      action: "image_uploaded",
      details: {
        originalSize: result.stats.originalSizeBytes,
        compressedSize: result.stats.compressedSizeBytes,
        compression: result.stats.compressionRatio,
        dimensions: `${result.metadata.width}x${result.metadata.height}`,
        originalFormat: result.metadata.originalFormat,
        publicUrl: storedFile.publicUrl,
        fileName: storedFile.fileName,
      },
      quantity: 1,
      req,
    });

    return res.status(200).json({
      success: true,
      url: storedFile.publicUrl,
      fileName: storedFile.fileName,
      image: {
        format: "webp",
        mimeType: result.mimeType,
        metadata: result.metadata,
        stats: result.stats,
      },
    });
  } catch (error) {
    // Log failed upload
    const errorCode = error?.code || "image_processing_failed";
    await logFailure({
      operationType: "create",
      entityType: "ImageUpload",
      action: "image_uploaded",
      errorMessage: error.message,
      errorCode,
      details: {
        sizeBytes: error?.sizeBytes,
        maxSizeBytes: error?.maxSizeBytes,
      },
      req,
    });

    return res.status(getUploadErrorStatus(errorCode)).json({
      message: ImageProcessingErrors[errorCode] || "Image upload failed.",
      code: errorCode,
      details: {
        sizeBytes: error?.sizeBytes,
        maxSizeBytes: error?.maxSizeBytes,
        originalError: error?.originalError,
      },
    });
  }
}

/**
 * Upload and process multiple images (gallery batch)
 * Converts each to WebP with quality 75
 *
 * POST /api/admin/upload/gallery
 *
 * Expected: multipart/form-data with multiple files named "images"
 * Returns: Array of WebP base64 data, each with metadata and compression stats
 */
export async function uploadGalleryImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No image files provided.",
        code: "image_files_required",
      });
    }

    const imagesToProcess = req.files.map((file) => ({
      buffer: file.buffer,
      mimeType: file.mimetype,
    }));

    const results = await processImageBuffers(imagesToProcess);
    const storedFiles = await Promise.all(
      results.map((result) => saveWebpFromBase64(result.base64, buildFileName("file")))
    );
    const images = results.map((result, index) => ({
      url: storedFiles[index].publicUrl,
      fileName: storedFiles[index].fileName,
      format: "webp",
      mimeType: result.mimeType,
      metadata: result.metadata,
      stats: result.stats,
    }));

    // Log successful gallery upload
    const totalOriginalSize = results.reduce(
      (sum, img) => sum + img.stats.originalSizeBytes,
      0
    );
    const totalCompressedSize = results.reduce(
      (sum, img) => sum + img.stats.compressedSizeBytes,
      0
    );

    await logSuccess({
      operationType: "create",
      entityType: "ImageUpload",
      action: "gallery_uploaded",
      details: {
        totalImages: results.length,
        totalOriginalSize,
        totalCompressedSize,
        storageDirectory: FTP_FILES_DIRECTORY,
        averageCompression: (
          ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) *
          100
        ).toFixed(1),
      },
      quantity: results.length,
      req,
    });

    return res.status(200).json({
      success: true,
      totalProcessed: results.length,
      images,
    });
  } catch (error) {
    // Log failed gallery upload
    const errorCode = error?.code || "image_processing_failed";
    const fileCount = req.files?.length || 0;

    await logFailure({
      operationType: "create",
      entityType: "ImageUpload",
      action: "gallery_uploaded",
      errorMessage: error.message,
      errorCode,
      details: {
        fileCount,
        itemIndex: error?.itemIndex,
      },
      req,
    });

    return res.status(getUploadErrorStatus(errorCode)).json({
      message: ImageProcessingErrors[errorCode] || "Gallery upload failed.",
      code: errorCode,
      details: {
        itemIndex: error?.itemIndex,
        count: error?.count,
        maxCount: error?.maxCount,
        originalError: error?.originalError,
      },
    });
  }
}
