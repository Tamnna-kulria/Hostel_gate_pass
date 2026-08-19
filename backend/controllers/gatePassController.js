import crypto from "crypto";
import GatePassRequest from "../models/GatePassRequest.js";
import StudentProfile from "../models/StudentProfile.js";
import { formatIndianTime } from "../utils/dateUtils.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateQrCodeImage } from "../utils/qrCodeUtils.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { analyzeGatePassRisk } from "../utils/aiRiskAnalyzer.js";

function addIndianTimes(request) {
  const obj = request.toObject ? request.toObject() : request;

  return {
    ...obj,
    indianTimes: {
      createdAt: formatIndianTime(obj.createdAt),
      updatedAt: formatIndianTime(obj.updatedAt),
      goingDate: formatIndianTime(obj.goingDate),
      outTime: formatIndianTime(obj.outTime),
      expectedInTime: formatIndianTime(obj.expectedInTime),
      parentOtpExpiresAt: formatIndianTime(obj.parentOtpExpiresAt),
      parentOtpVerifiedAt: formatIndianTime(obj.parentOtpVerifiedAt),
      parentApprovedAt: formatIndianTime(obj.parentApprovedAt),
      wardenApprovedAt: formatIndianTime(obj.wardenApprovedAt),
      qrExpiresAt: formatIndianTime(obj.qrExpiresAt),
      exitTime: formatIndianTime(obj.exitTime),
      returnTime: formatIndianTime(obj.returnTime),
      rejectedAt: formatIndianTime(obj.rejectedAt)
    }
  };
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpExpiryTime() {
  const fiveMinutes = 5 * 60 * 1000;
  return new Date(Date.now() + fiveMinutes);
}

function generateQrToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getQrExpiryTime(expectedInTime) {
  const extraHours = 2 * 60 * 60 * 1000;
  return new Date(new Date(expectedInTime).getTime() + extraHours);
}

async function findRequestByQrToken(qrToken) {
  return GatePassRequest.findOne({ qrToken })
    .populate("student", "name email phone role")
    .populate("studentProfile");
}
function canRejectRequest(status) {
  return [
    "Student Requested",
    "Parent OTP Sent",
    "Parent Verified",
    "Parent Approved",
    "QR Generated"
  ].includes(status);
}


function generateParentApprovalToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function findRequestByParentToken(parentToken) {
  return GatePassRequest.findOne({ parentApprovalToken: parentToken })
    .populate("student", "name email phone role")
    .populate("studentProfile");
}

function calculateLateMinutes(expectedInTime, actualReturnTime) {
  const expected = new Date(expectedInTime).getTime();
  const actual = new Date(actualReturnTime).getTime();

  if (actual <= expected) {
    return 0;
  }

  const diffInMilliseconds = actual - expected;
  return Math.ceil(diffInMilliseconds / (60 * 1000));
}



export async function createGatePassRequest(req, res) {
  try {
    const {
      goingDate,
      destination,
      reason,
      leaveDays,
      goingWith,
      luggageDetails,
      outTime,
      expectedInTime
    } = req.body;

    const studentProfile = await StudentProfile.findOne({
      user: req.user._id
    });

    if (!studentProfile) {
      return res.status(404).json({
        message: "Student profile not found. Contact admin."
      });
    }

    if (!studentProfile.isVerifiedByAdmin) {
      return res.status(403).json({
        message: "Student profile is not verified by admin"
      });
    }
    

    const pastRequestsCount = await GatePassRequest.countDocuments({
      student: req.user._id
    });

    const aiAnalysis = await analyzeGatePassRisk({
      studentName: req.user.name,
      collegeId: studentProfile.collegeId,
      branch: studentProfile.branch,
      year: studentProfile.year,
      destination,
      reason,
      leaveDays,
      goingWith,
      luggageDetails,
      outTime,
      expectedInTime,
      pastRequestsCount
    });

    const parentApprovalToken = generateParentApprovalToken();
    const parentOtp = generateOtp();
    const parentApprovalUrl = `http://localhost:5173/parent/approve/${parentApprovalToken}`;



    const request = await GatePassRequest.create({
      student: req.user._id,
      studentProfile: studentProfile._id,
      parentApprovalToken,
      parentOtp,
      parentOtpExpiresAt: getOtpExpiryTime(),
      status: "Parent OTP Sent",
      goingDate,
      destination,
      reason,
      leaveDays,
      goingWith,
      luggageDetails,
      outTime,
      expectedInTime,
      aiSummary: aiAnalysis.summary,
      aiRiskLevel: aiAnalysis.riskLevel,
      aiFlags: aiAnalysis.flags
    });


    const populatedRequest = await GatePassRequest.findById(request._id)
      .populate("student", "name email phone role")
      .populate("studentProfile");
    
      const outTimeIST = formatIndianTime(outTime);
      const expectedInTimeIST = formatIndianTime(expectedInTime);
      const goingDateIST = formatIndianTime(goingDate);

      await sendEmail({
          to: studentProfile.parentEmail,
          subject: "Hostel Gate Pass Approval Required",
          text: `
        Smart Hostel Gate Pass

        Student: ${req.user.name}
        Destination: ${destination}
        Reason: ${reason}
        Leave Days: ${leaveDays}

        Your OTP: ${parentOtp}

        Open this link to approve or reject:
        ${parentApprovalUrl}
          `,
          html: `
            <h2>Smart Hostel Gate Pass</h2>
            <p><strong>Student:</strong> ${req.user.name}</p>
            <p><strong>College ID:</strong> ${studentProfile.collegeId}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Leave Days:</strong> ${leaveDays}</p>
            <p><strong>Going Date:</strong> ${goingDateIST}</p>
            <p><strong>Out Time:</strong> ${outTimeIST}</p>
            <p><strong>Expected In Time:</strong> ${expectedInTimeIST}</p>

            <p>Your OTP:</p>
            <h1>${parentOtp}</h1>

            <p>This OTP is valid for 5 minutes.</p>

            <a href="${parentApprovalUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
              View Request
            </a>
          `
        });


      await createAuditLog({
        action: "GATE_PASS_CREATED",
        actor: req.user._id,
        actorRole: req.user.role,
        gatePassRequest: request._id,
        oldStatus: "",
        newStatus: request.status,
        details: {
          destination,
          reason,
          leaveDays,
          goingWith
        }
    });

     res.status(201).json({
        message: "Gate pass request created successfully. Parent approval email sent.",
        parentApprovalUrl,
        demoOtp: parentOtp,
        request: addIndianTimes(populatedRequest)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getMyGatePassRequests(req, res) {
  try {
    const requests = await GatePassRequest.find({
      student: req.user._id
    })
      .populate("studentProfile")
      .sort({ createdAt: -1 });

  res.json({
    message: "My gate pass requests fetched successfully",
    count: requests.length,
    requests: requests.map(addIndianTimes)
  });


  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getAllGatePassRequests(req, res) {
  try {
    const requests = await GatePassRequest.find()
      .populate("student", "name email phone role")
      .populate("studentProfile")
      .sort({ createdAt: -1 });

  res.json({
    message: "Gate pass requests fetched successfully",
    count: requests.length,
    requests: requests.map(addIndianTimes)
  });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getGatePassRequestById(req, res) {
  try {
    const request = await GatePassRequest.findById(req.params.id)
      .populate("student", "name email phone role")
      .populate("studentProfile");

    if (!request) {
      return res.status(404).json({
        message: "Gate pass request not found"
      });
    }

    res.json({
    message: "Gate pass request fetched successfully",
    request: addIndianTimes(request)
  });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function sendParentOtp(req, res) {
  try {
    const request = await GatePassRequest.findById(req.params.id)
      .populate("student", "name email phone role")
      .populate("studentProfile");

    if (!request) {
      return res.status(404).json({
        message: "Gate pass request not found"
      });
    }

    if (request.status !== "Student Requested") {
      return res.status(400).json({
        message: `OTP cannot be sent when status is ${request.status}`
      });
    }

    if (!request.studentProfile.parentEmail) {
      return res.status(400).json({
        message: "Parent email is not added in student profile"
      });
    }

    const otp = generateOtp();
    const oldStatus = request.status;

    request.parentOtp = otp;
    request.parentOtpExpiresAt = getOtpExpiryTime();
    request.status = "Parent OTP Sent";

    await request.save();

    await createAuditLog({
      action: "PARENT_OTP_SENT",
      actor: req.user._id,
      actorRole: req.user.role,
      gatePassRequest: request._id,
      oldStatus,
      newStatus: request.status,
      details: {
        parentEmail: request.studentProfile.parentEmail
      }
    });

    await sendEmail({
      to: request.studentProfile.parentEmail,
      subject: "Hostel Gate Pass Parent OTP",
      text: `Your OTP for ${request.student.name}'s hostel gate pass request is ${otp}. This OTP is valid for 5 minutes.`,
      html: `
        <h2>Hostel Gate Pass OTP</h2>
        <p>Student: <strong>${request.student.name}</strong></p>
        <p>Destination: <strong>${request.destination}</strong></p>
        <p>Reason: <strong>${request.reason}</strong></p>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

    res.json({
      message: `OTP sent to parent email ${request.studentProfile.parentEmail}`,
      demoOtp: otp,
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function verifyParentOtp(req, res) {
  try {
    const { otp } = req.body;

    const request = await GatePassRequest.findById(req.params.id)
      .populate("studentProfile");

    if (!request) {
      return res.status(404).json({
        message: "Gate pass request not found"
      });
    }

    if (request.status !== "Parent OTP Sent") {
      return res.status(400).json({
        message: `OTP cannot be verified when status is ${request.status}`
      });
    }

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required"
      });
    }

    if (!request.parentOtp || request.parentOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (request.parentOtpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired. Please send OTP again."
      });
    }
    const oldStatus = request.status;

    request.parentOtpVerifiedAt = new Date();
    request.status = "Parent Verified";

    await request.save();
    await createAuditLog({
    action: "PARENT_OTP_VERIFIED",
    actorRole: "parent",
    gatePassRequest: request._id,
    oldStatus,
    newStatus: request.status,
    details: {
      parentEmail: request.studentProfile.parentEmail
    }
  });

    res.json({
      message: "Parent OTP verified successfully",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function parentApproveGatePass(req, res) {
  try {
    const request = await GatePassRequest.findById(req.params.id)
      .populate("studentProfile");

    if (!request) {
      return res.status(404).json({
        message: "Gate pass request not found"
      });
    }

    if (request.status !== "Parent Verified") {
      return res.status(400).json({
        message: `Parent approval requires Parent Verified status. Current status is ${request.status}`
      });
    }
    const oldStatus = request.status;
    request.parentApprovedAt = new Date();
    request.status = "Parent Approved";
    request.parentOtp = undefined;

    await request.save();

    await createAuditLog({
      action: "PARENT_APPROVED",
      actorRole: "parent",
      gatePassRequest: request._id,
      oldStatus,
      newStatus: request.status,
      details: {
        parentEmail: request.studentProfile.parentEmail
      }
    });


    res.json({
      message: "Parent approved gate pass request successfully",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
export async function wardenApproveGatePass(req, res) {
  try {
    const { wardenRemark } = req.body;

    const request = await GatePassRequest.findById(req.params.id)
      .populate("student", "name email phone role")
      .populate("studentProfile");

    if (!request) {
      return res.status(404).json({
        message: "Gate pass request not found"
      });
    }

    if (request.status !== "Parent Approved") {
      return res.status(400).json({
        message: `Warden approval requires Parent Approved status. Current status is ${request.status}`
      });
    }
   
    const oldStatus = request.status;

    request.wardenApprovedAt = new Date();
    request.wardenRemark = wardenRemark || "";
    request.qrToken = generateQrToken();
    request.qrExpiresAt = getQrExpiryTime(request.expectedInTime);
    request.status = "QR Generated";

    await request.save();

    await createAuditLog({
      action: "WARDEN_APPROVED_QR_GENERATED",
      actor: req.user._id,
      actorRole: req.user.role,
      gatePassRequest: request._id,
      oldStatus,
      newStatus: request.status,
      details: {
        wardenRemark: request.wardenRemark,
        qrExpiresAt: request.qrExpiresAt
      }
    });


    const qrVerificationUrl = `http://localhost:5173/guard/verify/${request.qrToken}`;
    const qrCodeImage = await generateQrCodeImage(qrVerificationUrl);

    res.json({
      message: "Warden approved request and QR code generated",
      qrVerificationUrl,
      qrCodeImage,
      request: addIndianTimes(request)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function verifyQrToken(req, res) {
  try {
    const request = await findRequestByQrToken(req.params.qrToken);

    if (!request) {
      return res.status(404).json({
        message: "Invalid QR token"
      });
    }

    if (request.qrExpiresAt && request.qrExpiresAt < new Date()) {
      request.status = "Expired";
      await request.save();

      return res.status(400).json({
        message: "QR code has expired",
        request: addIndianTimes(request)
      });
    }

    if (request.status !== "QR Generated") {
      return res.status(400).json({
        message: `QR cannot be used when status is ${request.status}`,
        request: addIndianTimes(request)
      });
    }

    res.json({
      message: "QR token is valid",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
export async function markStudentExit(req, res) {
  try {
    const request = await findRequestByQrToken(req.params.qrToken);

    if (!request) {
      return res.status(404).json({
        message: "Invalid QR token"
      });
    }

    if (request.qrExpiresAt && request.qrExpiresAt < new Date()) {
      request.status = "Expired";
      await request.save();

      return res.status(400).json({
        message: "QR code has expired",
        request: addIndianTimes(request)
      });
    }

    if (request.status !== "QR Generated") {
      return res.status(400).json({
        message: `Student exit cannot be marked when status is ${request.status}`,
        request: addIndianTimes(request)
      });
    }

    const oldStatus = request.status;

    request.exitTime = new Date();
    request.verifiedExitBy = req.user._id;
    request.status = "Exited";

    await request.save();
    await createAuditLog({
      action: "EXIT_MARKED",
      actor: req.user._id,
      actorRole: req.user.role,
      gatePassRequest: request._id,
      oldStatus,
      newStatus: request.status,
      details: {
        exitTime: request.exitTime
      }
    });


    res.json({
      message: "Student exit marked successfully",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function markStudentReturn(req, res) {
  try {
    const request = await findRequestByQrToken(req.params.qrToken);

    if (!request) {
      return res.status(404).json({
        message: "Invalid QR token"
      });
    }

    if (request.status !== "Exited") {
      return res.status(400).json({
        message: `Student return cannot be marked when status is ${request.status}`,
        request: addIndianTimes(request)
      });
    }
    const oldStatus = request.status;

    const returnTime = new Date();
    const lateMinutes = calculateLateMinutes(
      request.expectedInTime,
      returnTime
    );

    request.returnTime = returnTime;
    request.verifiedReturnBy = req.user._id;
    request.isLateReturn = lateMinutes > 0;
    request.lateByMinutes = lateMinutes;
    request.status = "Returned";

    await request.save();
    await createAuditLog({
      action: "RETURN_MARKED",
      actor: req.user._id,
      actorRole: req.user.role,
      gatePassRequest: request._id,
      oldStatus,
      newStatus: request.status,
      details: {
        returnTime: request.returnTime,
        isLateReturn: request.isLateReturn,
        lateByMinutes: request.lateByMinutes
      }
    });


    res.json({
      message: lateMinutes > 0
        ? `Student return marked successfully. Late by ${lateMinutes} minutes.`
        : "Student return marked successfully. Student returned on time.",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function rejectGatePassRequest(req, res) {
  try {
    const { rejectReason } = req.body;

    const request = await GatePassRequest.findById(req.params.id)
      .populate("student", "name email phone role")
      .populate("studentProfile");

    if (!request) {
      return res.status(404).json({
        message: "Gate pass request not found"
      });
    }

    if (!canRejectRequest(request.status)) {
      return res.status(400).json({
        message: `Request cannot be rejected when status is ${request.status}`,
        request: addIndianTimes(request)
      });
    }

    if (!rejectReason || rejectReason.trim() === "") {
      return res.status(400).json({
        message: "Reject reason is required"
      });
    }
    const oldStatus = request.status;

    request.status = "Rejected";
    request.rejectedAt = new Date();
    request.rejectedBy = req.user._id;
    request.rejectReason = rejectReason;

    await request.save();
    await createAuditLog({
      action: "REQUEST_REJECTED",
      actor: req.user._id,
      actorRole: req.user.role,
      gatePassRequest: request._id,
      oldStatus,
      newStatus: request.status,
      details: {
        rejectReason
      }
    });

    res.json({
      message: "Gate pass request rejected successfully",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getParentApprovalRequest(req, res) {
  try {
    const request = await findRequestByParentToken(req.params.parentToken);

    if (!request) {
      return res.status(404).json({
        message: "Invalid parent approval link"
      });
    }

    res.json({
      message: "Parent approval request fetched successfully",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function verifyParentOtpByToken(req, res) {
  try {
    const { otp } = req.body;
    const request = await findRequestByParentToken(req.params.parentToken);

    if (!request) {
      return res.status(404).json({
        message: "Invalid parent approval link"
      });
    }

    if (request.status !== "Parent OTP Sent") {
      return res.status(400).json({
        message: `OTP cannot be verified when status is ${request.status}`
      });
    }

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required"
      });
    }

    if (!request.parentOtp || request.parentOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (request.parentOtpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired. Please create/send request again."
      });
    }

    request.parentOtpVerifiedAt = new Date();
    request.status = "Parent Verified";

    await request.save();

    res.json({
      message: "Parent OTP verified successfully",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function parentApproveByToken(req, res) {
  try {
    const request = await findRequestByParentToken(req.params.parentToken);

    if (!request) {
      return res.status(404).json({
        message: "Invalid parent approval link"
      });
    }

    if (request.status !== "Parent Verified") {
      return res.status(400).json({
        message: `Parent approval requires Parent Verified status. Current status is ${request.status}`
      });
    }

    request.parentApprovedAt = new Date();
    request.status = "Parent Approved";
    request.parentOtp = undefined;

    await request.save();

    res.json({
      message: "Parent approved gate pass request successfully",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function parentRejectByToken(req, res) {
  try {
    const { rejectReason } = req.body;
    const request = await findRequestByParentToken(req.params.parentToken);

    if (!request) {
      return res.status(404).json({
        message: "Invalid parent approval link"
      });
    }

    if (!["Parent OTP Sent", "Parent Verified"].includes(request.status)) {
      return res.status(400).json({
        message: `Parent cannot reject when status is ${request.status}`
      });
    }

    if (!rejectReason || rejectReason.trim() === "") {
      return res.status(400).json({
        message: "Reject reason is required"
      });
    }

    request.status = "Rejected";
    request.parentRejectedAt = new Date();
    request.parentRejectReason = rejectReason;
    request.rejectedAt = new Date();
    request.rejectReason = rejectReason;

    await request.save();

    res.json({
      message: "Parent rejected gate pass request",
      request: addIndianTimes(request)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}