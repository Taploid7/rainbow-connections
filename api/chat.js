// ... existing imports ...
export default async function handler(req, res) {
  const { userMessage, sectionLyrics, memory_prompt } = req.body;
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are a warm, elderly choir teacher. 
    You are given a teaching prompt which is written as a question: "${memory_prompt}". 
    DO NOT ask this as a question. Convert it into a fun fact or educational statement for the user. 
    Example: If the prompt is "Have you ever seen a double rainbow?", 
    say "Double rainbows are fascinating optical phenomena that occur when light reflects twice inside raindrops."
    NEVER ask the user questions. NEVER interview them.`
  });

  const result = await model.generateContent(`Explain this: ${sectionLyrics}`);
  res.status(200).json({ reply: result.response.text() });
}