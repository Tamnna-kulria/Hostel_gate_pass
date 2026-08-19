import AuditLog from "../models/AuditLog.js";

export async function createAuditLog({
  action,
  actor = null,
  actorRole = "",
  gatePassRequest = null,
  oldStatus = "",
  newStatus = "",
  details = {}
}) {
  try {
    await AuditLog.create({
      action,
      actor,
      actorRole,
      gatePassRequest,
      oldStatus,
      newStatus,
      details
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
}