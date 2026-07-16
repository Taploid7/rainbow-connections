import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { userMessage, sectionLyrics } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`User sang: ${userMessage}. Provide short, warm encouragement as a choir teacher.`);
    res.status(200).json({ reply: result.response.text() });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
}