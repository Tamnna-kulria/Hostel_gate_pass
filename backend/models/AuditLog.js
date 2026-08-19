import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    actorRole: {
      type: String,
      trim: true
    },

    gatePassRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GatePassRequest"
    },

    oldStatus: {
      type: String,
      trim: true
    },

    newStatus: {
      type: String,
      trim: true
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;