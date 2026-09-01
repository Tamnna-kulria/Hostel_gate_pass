import mongoose from "mongoose";

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    content: {
      type: String,
      required: true
    },

    embedding: {
      type: [Number],
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("KnowledgeDocument", knowledgeDocumentSchema);