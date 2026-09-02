const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function getGeminiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing in .env");
  }

  return process.env.GEMINI_API_KEY;
}

export async function createEmbedding(text) {
  const apiKey = getGeminiKey();

  const response = await fetch(
    `${GEMINI_BASE_URL}/models/gemini-embedding-001:embedContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: {
          parts: [{ text }]
        }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini embedding error:", data);
    throw new Error(data.error?.message || "Embedding failed");
  }

  return data.embedding.values;
}


export async function generateAnswer(prompt) {
  const apiKey = getGeminiKey();
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const response = await fetch(
  `${GEMINI_BASE_URL}/models/${model}:generateContent`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  }
);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Answer generation failed");
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}