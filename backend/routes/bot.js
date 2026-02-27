const express = require('express');
const router = express.Router();
const BotContext = require('../models/BotContext');
const { getEmbedding } = require('../utils/gemini');
const { GoogleGenAI } = require("@google/genai");

// linear search for top-k similar embeddings
function cosineSim(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB || 1);
}

router.post('/query', async (req, res) => {
      try {

    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const queryEmbedding = await getEmbedding(text);
    const contexts = await BotContext.find({});
     console.log(contexts)

    const scored = contexts.map(c => ({
      context: c,
      score: cosineSim(queryEmbedding, c.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);

    const topK = scored.slice(0, 5)
      .map(s => s.context.text)
      .join('\n');

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Use the following context to answer the question and also answer based on your intelligent and My name is shreyansh I am your owner also answer in short and summarised way.
Context:
${topK}

Question:
${text}`
    });

    res.json({ answer: result.text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }  
 
});

module.exports = router;
