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
  title: "QR Exit Verification",
  content:
    "Student uses the generated QR code only for exit from the hostel. The guard scans the student's QR code to verify the gate pass and mark the student's exit. The QR code is valid for one-time use only."
},
{
  title: "Return Verification",
  content:
    "For returning to the hostel, the guard uses the generated return link and return code. The student does not use the QR code for return. The return code is valid for one-time use only."
},
{
  title: "Exit and Return Security",
  content:
    "The exit QR code and return code are separate one-time-use credentials. After successful exit verification, the QR cannot be reused. After successful return verification, the return code cannot be reused."
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