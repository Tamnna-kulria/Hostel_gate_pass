import { GoogleGenAI } from "@google/genai";

function ruleBasedRiskAnalysis({ reason, leaveDays, goingWith, pastRequestsCount = 0 }) {
  const flags = [];
  let riskLevel = "Low";

  const lowerReason = reason.toLowerCase();

  if (lowerReason.includes("medical") || lowerReason.includes("hospital") || lowerReason.includes("emergency")) {
    flags.push("Emergency or medical reason detected");
    riskLevel = "Medium";
  }

  if (leaveDays > 3) {
    flags.push("Leave duration is more than 3 days");
    riskLevel = "Medium";
  }

  if (goingWith === "Own Responsibility") {
    flags.push("Student is going on own responsibility");
  }

  if (pastRequestsCount >= 5) {
    flags.push("Student has frequent leave requests");
    riskLevel = "High";
  }

  return {
    summary: `Student requested leave for: ${reason}`,
    riskLevel,
    flags
  };
}

function parseAiJson(text) {
  try {
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch {
    return null;
  }
}

export async function analyzeGatePassRisk({
  studentName,
  collegeId,
  branch,
  year,
  destination,
  reason,
  leaveDays,
  goingWith,
  luggageDetails,
  outTime,
  expectedInTime,
  pastRequestsCount = 0
}) {
  const fallback = ruleBasedRiskAnalysis({
    reason,
    leaveDays,
    goingWith,
    pastRequestsCount
  });

  if (!process.env.GEMINI_API_KEY) {
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
You are an AI assistant for a hostel gate pass approval system.

Analyze this student gate pass request for warden review.

Return only valid JSON with this exact shape:
{
  "summary": "short summary for warden",
  "riskLevel": "Low or Medium or High",
  "flags": ["short warning flag 1", "short warning flag 2"]
}

Rules:
- Do not approve or reject. Only assist.
- Use Low for normal requests.
- Use Medium for emergency, medical, long leave, own responsibility, unclear reason, or luggage.
- Use High for suspicious, unsafe, repeated, conflicting, or risky requests.
- Keep summary short and professional.

Student:
Name: ${studentName}
College ID: ${collegeId}
Branch: ${branch}
Year: ${year}

Request:
Destination: ${destination}
Reason: ${reason}
Leave days: ${leaveDays}
Going with: ${goingWith}
Luggage: ${luggageDetails || "No luggage"}
Out time: ${outTime}
Expected in time: ${expectedInTime}
Past request count: ${pastRequestsCount}
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt
    });

    const parsed = parseAiJson(response.text);

    if (!parsed || !parsed.summary || !parsed.riskLevel || !Array.isArray(parsed.flags)) {
      return fallback;
    }

    if (!["Low", "Medium", "High"].includes(parsed.riskLevel)) {
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.error("Gemini AI analysis failed:", error.message);
    return fallback;
  }
}