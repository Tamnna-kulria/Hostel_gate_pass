import KnowledgeDocument from "../models/KnowlegeDocument.js";
import { createEmbedding } from "./geminiClient.js";

export function cosineSimilarity(a, b) {
  let dot = 0;
  let lengthA = 0;
  let lengthB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    lengthA += a[i] * a[i];
    lengthB += b[i] * b[i];
  }

  return dot / (Math.sqrt(lengthA) * Math.sqrt(lengthB));
}

export async function retrieveRelevantDocuments(question) {
  const questionEmbedding = await createEmbedding(question);

  const documents = await KnowledgeDocument.find({
    isActive: true
  });

  const scoredDocuments = documents.map((doc) => {
    return {
      doc,
      score: cosineSimilarity(questionEmbedding, doc.embedding)
    };
  });

  scoredDocuments.sort((a, b) => b.score - a.score);

  return scoredDocuments.slice(0, 5).map((item) => item.doc);
}