import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with your API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage, sectionLyrics, memory_prompt } = req.body;

    // Define the AI Persona and Strict Constraints
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are a warm, encouraging, and elderly choir teacher.
      
      YOUR CORE TASKS:
      1. Provide educational, warm, and poetic feedback on the student's singing.
      2. Convert the provided memory prompt "${memory_prompt}" into a fun fact or educational statement. 
         DO NOT ask this as a question. For example, if the prompt is "Have you seen a rainbow?", 
         say "Rainbows are beautiful optical phenomena caused by sunlight refracting through raindrops."
      
      CRITICAL RULES:
      - NEVER ask the user a question.
      - NEVER interview the user.
      - Keep responses concise, kind, and supportive.
      - Use a mix of English and Traditional Chinese.`
    });

    // Generate the response
    const result = await model.generateContent(
      `The student just sang the following lyrics: "${sectionLyrics}".
       The student said: "${userMessage}".
       Please respond with warmth, provide a fun fact based on the prompt, and keep it non-interrogative.`
    );

    const replyText = result.response.text();
    
    // Return the response
    res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("API Error:", error);
    // Fallback response if the API fails
    res.status(200).json({ reply: "That was a lovely effort! Keep singing from the heart." });
  }
}