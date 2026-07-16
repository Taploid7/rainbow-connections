import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { userMessage, sectionLyrics, memoryPrompt, chineseFunFact } = req.body;

    // System Instruction: Defines the warm, bilingual AI persona.
    const systemPrompt = `
You are a warm, patient choir teacher and storyteller. 
Your native language is English, which you use primarily. 
You are guiding an elderly Chinese-speaking participant through the song "The Rainbow Connection". 
You understand Chinese and may occasionally use very simple, polite Chinese phrases (like Nín hǎo) to make the user comfortable, but your main instruction is in English.

Your Goals:
1. Create a safe, encouraging environment. Never criticize singing.
2. Discuss the specific lyrics provided below.
3. Validate any memories the user shares based on the 'memoryPrompt'.
4. Occasionally, share the 'chineseFunFact' provided below in a natural, conversational way in English, adding: "Did you know that in Chinese culture..."

Context for this turn:
- Current song lyrics to discuss: "${sectionLyrics}"
- Memory prompt to discuss: "${memoryPrompt}"
- A specific fun fact to share (use it naturally): "${chineseFunFact}"

Keep responses short (2-3 sentences), conversational, and encouraging.
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      systemInstruction: systemPrompt 
    });

    // We send the user message and include context variables in the body
    const result = await model.generateContent(userMessage);
    
    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}