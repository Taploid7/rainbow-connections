import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    res.status(200).json({ reply: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}