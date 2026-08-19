import express from "express";

import {
  createGatePassRequest,
  getMyGatePassRequests,
  getAllGatePassRequests,
  getGatePassRequestById,
  parentApproveGatePass,
  markStudentExit,
  markStudentReturn,
  rejectGatePassRequest,
  sendParentOtp,
  verifyParentOtp,
  verifyQrToken,
  getParentApprovalRequest,
  parentApproveByToken,
  parentRejectByToken,
  verifyParentOtpByToken,
  wardenApproveGatePass
} from "../controllers/gatePassController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("student"),
  createGatePassRequest
);

router.get(
  "/my",
  protect,
  allowRoles("student"),
  getMyGatePassRequests
);

router.get(
  "/",
  protect,
  allowRoles("warden", "admin", "superadmin"),
  getAllGatePassRequests
);
router.post(
  "/:id/send-parent-otp",
  protect,
  allowRoles("student", "admin", "superadmin"),
  sendParentOtp
);

router.post(
  "/:id/verify-parent-otp",
  verifyParentOtp
);

router.post(
  "/:id/parent-approve",
  parentApproveGatePass
);

router.post(
  "/:id/warden-approve",
  protect,
  allowRoles("warden", "admin", "superadmin"),
  wardenApproveGatePass
);

router.get(
  "/verify-qr/:qrToken",
  protect,
  allowRoles("guard", "admin", "superadmin"),
  verifyQrToken
);

router.post(
  "/verify-qr/:qrToken/exit",
  protect,
  allowRoles("guard", "admin", "superadmin"),
  markStudentExit
);
router.post(
  "/verify-qr/:qrToken/return",
  protect,
  allowRoles("guard", "admin", "superadmin"),
  markStudentReturn
);
router.post(
  "/:id/reject",
  protect,
  allowRoles("warden", "admin", "superadmin"),
  rejectGatePassRequest
);
router.get(
  "/parent/:parentToken",
  getParentApprovalRequest
);

router.post(
  "/parent/:parentToken/verify-otp",
  verifyParentOtpByToken
);

router.post(
  "/parent/:parentToken/approve",
  parentApproveByToken
);

router.post(
  "/parent/:parentToken/reject",
  parentRejectByToken
);



router.get(
  "/:id",
  protect,
  allowRoles("warden", "admin", "superadmin"),
  getGatePassRequestById
);

export default router;