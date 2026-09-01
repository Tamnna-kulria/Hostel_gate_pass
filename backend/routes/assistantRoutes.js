import express from "express";
import { chatWithAssistant } from "../controllers/assistantController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protect, allowRoles("student"), chatWithAssistant);

export default router;