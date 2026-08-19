import GatePassRequest from "../models/GatePassRequest.js";

export async function getDashboardReport(req, res) {
  try {
    const [
      totalRequests,
      studentRequested,
      parentOtpSent,
      parentVerified,
      parentApproved,
      qrGenerated,
      exited,
      returned,
      rejected,
      expired,
      lateReturns,
      highRiskRequests
    ] = await Promise.all([
      GatePassRequest.countDocuments(),
      GatePassRequest.countDocuments({ status: "Student Requested" }),
      GatePassRequest.countDocuments({ status: "Parent OTP Sent" }),
      GatePassRequest.countDocuments({ status: "Parent Verified" }),
      GatePassRequest.countDocuments({ status: "Parent Approved" }),
      GatePassRequest.countDocuments({ status: "QR Generated" }),
      GatePassRequest.countDocuments({ status: "Exited" }),
      GatePassRequest.countDocuments({ status: "Returned" }),
      GatePassRequest.countDocuments({ status: "Rejected" }),
      GatePassRequest.countDocuments({ status: "Expired" }),
      GatePassRequest.countDocuments({ isLateReturn: true }),
      GatePassRequest.countDocuments({ aiRiskLevel: "High" })
    ]);

    const studentsCurrentlyOutside = await GatePassRequest.find({
      status: "Exited"
    })
      .populate("student", "name email phone")
      .populate("studentProfile", "collegeId branch year roomNumber hostelBlock parentContact parentEmail")
      .sort({ exitTime: -1 });

    const latestHighRiskRequests = await GatePassRequest.find({
      aiRiskLevel: "High"
    })
      .populate("student", "name email phone")
      .populate("studentProfile", "collegeId branch year roomNumber hostelBlock")
      .sort({ createdAt: -1 })
      .limit(10);

    const latestLateReturns = await GatePassRequest.find({
      isLateReturn: true
    })
      .populate("student", "name email phone")
      .populate("studentProfile", "collegeId branch year roomNumber hostelBlock")
      .sort({ returnTime: -1 })
      .limit(10);

    res.json({
      message: "Dashboard report fetched successfully",
      summary: {
        totalRequests,
        studentRequested,
        parentOtpSent,
        parentVerified,
        parentApproved,
        qrGenerated,
        exited,
        returned,
        rejected,
        expired,
        lateReturns,
        highRiskRequests
      },
      studentsCurrentlyOutside,
      latestHighRiskRequests,
      latestLateReturns
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}