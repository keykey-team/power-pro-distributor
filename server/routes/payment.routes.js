import express from "express";
import {
  createOrder,
  createOrderPayment,
  comgateCallback,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orders.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/:id/pay", createOrderPayment);

router.get("/", getOrders);
router.get("/:id", getOrderById);

router.put("/:id", updateOrder);
router.patch("/:id/status", updateOrderStatus);

router.delete("/:id", deleteOrder);

// callback можно вынести и в отдельный payment.routes.js
router.post("/payments/comgate/callback", comgateCallback);

export default router;