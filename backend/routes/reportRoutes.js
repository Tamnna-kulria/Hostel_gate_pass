import express from "express";
import { getDashboardReport } from "../controllers/reportController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  allowRoles("warden", "admin", "superadmin"),
  getDashboardReport
);

export default router;