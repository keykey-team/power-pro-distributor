import { Router } from "express";
import {
  createOrderGoPayPayment,
  gopayReturn,
  gopayNotify,
} from "../controllers/gopay.controller.js";

const router = Router();

router.post("/create", createOrderGoPayPayment);
router.get("/return", gopayReturn);
router.get("/notify", gopayNotify);

export default router;