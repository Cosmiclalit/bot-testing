// simple wrapper to call Gemini embeddings endpoint

const { GoogleGenAI } = require("@google/genai");

async function getEmbedding(text) {

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in env");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });


  return response.embeddings[0].values;
}



module.exports = { getEmbedding };
