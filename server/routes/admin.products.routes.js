import { Router } from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  exportAdminProducts,
  getAdminProduct,
  getAdminProductMeta,
  listAdminProducts,
  updateAdminProduct,
} from "../controllers/admin.products.controller.js";

const router = Router();

router.get("/meta", getAdminProductMeta);
router.get("/export", exportAdminProducts);
router.get("/", listAdminProducts);
router.get("/:idOrSlug", getAdminProduct);
router.post("/", createAdminProduct);
router.put("/:id", updateAdminProduct);
router.patch("/:id", updateAdminProduct);
router.delete("/:id", deleteAdminProduct);

export default router;