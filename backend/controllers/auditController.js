import AuditLog from "../models/AuditLog.js";

export async function getAuditLogs(req, res) {
  try {
    const logs = await AuditLog.find()
      .populate("actor", "name email role")
      .populate("gatePassRequest")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      message: "Audit logs fetched successfully",
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}