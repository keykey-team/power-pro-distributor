import { Router } from "express";
import {
  createInventoryReceipt,
  createInventoryRecount,
  createInventoryWriteoff,
  getInventorySummary,
  listInventoryMovements,
  listInventoryPositions,
} from "../controllers/admin.inventory.controller.js";

const router = Router();

router.get("/summary", getInventorySummary);
router.get("/positions", listInventoryPositions);
router.get("/movements", listInventoryMovements);
router.post("/receipts", createInventoryReceipt);
router.post("/writeoffs", createInventoryWriteoff);
router.post("/recounts", createInventoryRecount);

export default router;