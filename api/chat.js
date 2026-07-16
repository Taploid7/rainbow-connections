import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { userMessage, sectionLyrics, funFact } = req.body;
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are a warm, elderly choir teacher. Your goal is to explain the lyrics provided. 
        Share the following fact: "${funFact}". 
        DO NOT ask questions. DO NOT interview the user. Provide warm, factual, educational explanations.`
    });
    const result = await model.generateContent(`User sang: ${userMessage}. Explain this: ${sectionLyrics}`);
    res.status(200).json({ reply: result.response.text() });
  } catch (error) { res.status(500).json({ reply: "That was wonderful! Keep singing." }); }
}