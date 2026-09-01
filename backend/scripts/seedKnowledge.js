import dotenv from "dotenv";
import mongoose from "mongoose";
import KnowledgeDocument from "../models/KnowlegeDocument.js";
import { createEmbedding } from "../utils/geminiClient.js";

dotenv.config();

const documents = [
  {
    title: "Gate Pass Procedure",
    content:
      "Student fills a gate pass request. Parent verifies OTP and approves. Warden approves. Gate pass or QR code is generated. Guard verifies at the gate."
  },
  {
    title: "Parent Approval",
    content:
      "Parent approval is required before warden approval. Parent receives an email link and OTP. After OTP verification, parent can approve or reject."
  },
  {
    title: "Warden Approval",
    content:
      "Warden can approve only after parent approval. After warden approval, QR code is generated for guard verification."
  },
  {
    title: "QR Verification",
    content:
      "Student shows QR code to gate guard. Guard scans QR, verifies the pass, marks exit, and later marks return."
  },
  {
    title: "Return Rule",
    content:
      "Student must return before the approved expected in time. Late return can be reported to warden or admin."
  },
  {
    title: "Security Rule",
    content:
      "Students should not share OTP, QR code, password, or login details with anyone."
  }
];

async function seedKnowledge() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const doc of documents) {
    const embedding = await createEmbedding(`${doc.title}\n${doc.content}`);

    await KnowledgeDocument.findOneAndUpdate(
      { title: doc.title },
      {
        title: doc.title,
        content: doc.content,
        embedding,
        isActive: true
      },
      { upsert: true }
    );

    console.log(`Saved: ${doc.title}`);
  }

  await mongoose.disconnect();
  console.log("Knowledge base completed");
}

seedKnowledge();