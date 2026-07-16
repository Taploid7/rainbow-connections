import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { userMessage, sectionLyrics, memoryPrompt } = req.body;

    const systemPrompt = `You are a gentle, warm choir teacher. Guide an elderly participant. 
    1. Validate memories and encourage them.
    2. NEVER criticize singing/speaking. 
    3. Keep responses short (2-3 sentences).
    Current Lyrics: "${sectionLyrics}"
    Topic: "${memoryPrompt}"`;

    // Initialize the model with the system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}