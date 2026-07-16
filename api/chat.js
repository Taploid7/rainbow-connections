import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { userMessage, sectionLyrics, memoryPrompt } = req.body;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are a gentle, warm choir teacher. Guide an elderly participant. Validate memories. NEVER criticize singing. Keep responses 2-3 sentences. Current Lyrics: "${sectionLyrics}" | Topic: "${memoryPrompt}"`
    });

    const result = await model.generateContent(userMessage);
    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}