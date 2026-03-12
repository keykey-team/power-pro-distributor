// ================================
// routes/index.js
// ================================
import { Router } from "express";
import productsRoutes from "./products.routes.js";
import leadsRoutes from "./leads.routes.js";
import ordersRoutes from "./orders.routes.js";


const router = Router();

router.use("/products", productsRoutes);
router.use("/leads", leadsRoutes);
router.use("/orders", ordersRoutes);

export default router;
