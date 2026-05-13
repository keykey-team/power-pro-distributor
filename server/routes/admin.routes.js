import { Router } from "express";
import adminProductsRoutes from "./admin.products.routes.js";
import adminInventoryRoutes from "./admin.inventory.routes.js";
import adminUploadRoutes from "./admin.upload.routes.js";
import adminLogsRoutes from "./admin.logs.routes.js";

const router = Router();

router.use("/products", adminProductsRoutes);
router.use("/inventory", adminInventoryRoutes);
router.use("/upload", adminUploadRoutes);
router.use("/logs", adminLogsRoutes);

export default router;