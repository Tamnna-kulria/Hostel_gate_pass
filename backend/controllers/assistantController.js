import GatePass from "../models/GatePassRequest.js";
import { generateAnswer } from "../utils/geminiClient.js";
import { retrieveRelevantDocuments } from "../utils/ragUtils.js";

function containsSecretQuestion(question) {
  const text = question.toLowerCase();

  return (
    text.includes("password") ||
    text.includes("otp") ||
    text.includes("jwt") ||
    text.includes("token") ||
    text.includes("api key")
  );
}

export async function chatWithAssistant(req, res) {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required"
      });
    }

    if (containsSecretQuestion(question)) {
      return res.json({
        answer: "I cannot share passwords, OTPs, tokens, API keys, or secret information. Please contact the warden/admin.",
        sources: []
      });
    }

    const documents = await retrieveRelevantDocuments(question);

    if (documents.length === 0) {
      return res.json({
        answer: "I do not have this rule in my knowledge base. Please contact the warden/admin.",
        sources: []
      });
    }

    const recentPasses = await GatePass.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const knowledgeText = documents
      .map((doc) => `Title: ${doc.title}\nContent: ${doc.content}`)
      .join("\n\n");

    const passText = recentPasses
      .map((pass) => {
        return `
Name: ${pass.name}
College ID: ${pass.collegeId}
Destination: ${pass.destination}
Reason: ${pass.reason}
Status: ${pass.status}
`;
      })
      .join("\n");

    const prompt = `
You are a hostel gate pass assistant.

Answer only using the given context.
If answer is not in context, say contact warden/admin.
Do not reveal passwords, OTPs, JWTs, tokens, API keys, or secrets.
Keep answer short and simple.

Knowledge Context:
${knowledgeText}

Student Gate Pass Context:
${passText}

Student Question:
${question}
`;

    const answer = await generateAnswer(prompt);

    res.json({
      answer,
      sources: documents.map((doc) => doc.title)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}