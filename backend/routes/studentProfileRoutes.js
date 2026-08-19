import express from "express";
import {
  createStudentProfile,
  getAllStudentProfiles,
  getMyStudentProfile,
  getStudentProfileById,
  updateStudentProfile
} from "../controllers/studentProfileController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();



router.post(
  "/",
  protect,
  allowRoles("admin", "superadmin"),
  createStudentProfile
);

router.get(
  "/",
  protect,
  allowRoles("admin", "superadmin"),
  getAllStudentProfiles
);

router.get(
  "/me",
  protect,
  allowRoles("student"),
  getMyStudentProfile
);

router.get(
  "/:id",
  protect,
  allowRoles("admin", "superadmin"),
  getStudentProfileById
);

router.put(
  "/:id",
  protect,
  allowRoles("admin", "superadmin"),
  updateStudentProfile
);

export default router;