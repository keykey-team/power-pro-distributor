import { Router } from "express";
import multer from "multer";
import { uploadSingleImage, uploadGalleryImages } from "../controllers/admin.upload.controller.js";

/**
 * Admin Upload Routes
 *
 * Image upload endpoints for admin panel.
 * Uses memory storage (images are not persisted to disk).
 * Processes images immediately and returns WebP base64 data.
 *
 * Endpoints:
 * - POST /image - Upload single image
 * - POST /gallery - Upload multiple images for gallery
 */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 50, // Max 50 files per request
  },
  fileFilter: (req, file, cb) => {
    const mimeType = file.mimetype.toLowerCase();

    // Only allow image MIME types
    if (mimeType.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

const router = Router();

/**
 * Single image upload
 * @name POST /api/admin/upload/image
 * @param {File} image - Single image file
 * @returns {Object} WebP base64, metadata, compression stats
 */
router.post("/image", upload.single("image"), uploadSingleImage);

/**
 * Gallery batch upload
 * @name POST /api/admin/upload/gallery
 * @param {File[]} images - Multiple image files
 * @returns {Object} Array of WebP base64 data with metadata
 */
router.post("/gallery", upload.array("images", 50), uploadGalleryImages);

export default router;
