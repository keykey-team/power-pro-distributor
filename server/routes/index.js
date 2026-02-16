// ================================
// routes/index.js
// ================================
import { Router } from "express";
import productsRoutes from "./products.routes.js";
import leadsRoutes from "./leads.routes.js";

const router = Router();

router.use("/products", productsRoutes);
router.use("/leads", leadsRoutes);

export default router;
