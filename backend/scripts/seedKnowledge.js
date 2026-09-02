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
    title: "Exit Verification Procedure",
    content:
      "When a student wants to leave the hostel, the student displays the approved gate pass QR code to the guard. The guard scans the QR code. The system verifies the QR token and displays the student's name, college ID, room number, destination, reason, approved timings, and gate pass status. If the request status is QR Generated, the guard can select Mark Exit. The system records the exit time and changes the request status to Exited."
  },
 {
    title: "Return Verification Procedure",
    content:
      "When a student returns to the hostel, the guard scans the same approved gate pass QR code again. The system verifies that the student's current gate pass status is Exited. The student's gate pass details and exit information are displayed to the guard. The guard selects Mark Return. The system records the actual return time and changes the request status to Returned."
  },
  {
    title: "Late Return Rule",
    content:
      "The system compares the student's actual return time with the expected return time specified in the gate pass request. If the student returns after the expected return time, the system marks the request as a late return and calculates the number of minutes the student was late. If the student returns on or before the expected return time, the request is not marked as a late return."
  },
   {
    title: "Parent OTP Verification",
    content:
      "The parent receives an OTP through the registered parent email address after a student creates a gate pass request. The parent must enter the OTP on the parent approval page. The OTP is required to verify that the parent is approving the request. The OTP has a limited validity period. After successful OTP verification, the parent can approve or reject the gate pass request. Students should not share the parent OTP with other people."
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