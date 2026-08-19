import mongoose from "mongoose";

const gatePassRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true
    },

    goingDate: {
      type: Date,
      required: true
    },

    destination: {
      type: String,
      required: true,
      trim: true
    },

    reason: {
      type: String,
      required: true,
      trim: true
    },

    leaveDays: {
      type: Number,
      required: true,
      min: 1
    },

    goingWith: {
      type: String,
      enum: ["Parent", "Guardian", "Friend", "Relative", "Own Responsibility"],
      required: true
    },

    luggageDetails: {
      type: String,
      trim: true,
      default: "No luggage"
    },

    outTime: {
      type: Date,
      required: true
    },

    expectedInTime: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Student Requested",
        "Parent OTP Sent",
        "Parent Verified",
        "Parent Approved",
        "Warden Approved",
        "QR Generated",
        "Exited",
        "Returned",
        "Rejected",
        "Expired"
      ],
      default: "Student Requested"
    },
    parentApprovalToken: {
      type: String,
      unique: true,
      sparse: true
    },

    parentOtp: {
      type: String
    },

    parentOtpExpiresAt: {
      type: Date
    },

    parentOtpVerifiedAt: {
      type: Date
    },

    parentApprovedAt: {
      type: Date
    },

    parentRejectedAt: {
     type: Date
    },

    parentRejectReason: {
      type: String,
      trim: true
    },

    wardenApprovedAt: {
      type: Date
    },

    wardenRemark: {
      type: String,
      trim: true
    },

    rejectedAt: {
      type: Date
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    rejectReason: {
      type: String,
      trim: true
    },

    qrToken: {
      type: String
    },

    qrExpiresAt: {
      type: Date
    },

    exitTime: {
      type: Date
    },

    returnTime: {
      type: Date
    },

    verifiedExitBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verifiedReturnBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isLateReturn: {
      type: Boolean,
      default: false
    },

    lateByMinutes: {
      type: Number,
      default: 0
    },

    aiSummary: {
      type: String
    },

    aiRiskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },

    aiFlags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const GatePassRequest = mongoose.model(
  "GatePassRequest",
  gatePassRequestSchema
);

export default GatePassRequest;.0
0