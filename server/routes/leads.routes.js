// ================================
// routes/leads.routes.js
// ================================
import { Router } from "express";
import { sendLeadToTelegram } from "../controllers/leads.controller.js";

const router = Router();

router.post("/send", sendLeadToTelegram);

export default router;
