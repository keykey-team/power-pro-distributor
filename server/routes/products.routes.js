// ================================
// routes/products.routes.js
// ================================
import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/:idOrSlug", getProduct);

// ⚠️ ideally protect with admin auth middleware
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
