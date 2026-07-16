import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userMessage, sectionLyrics, memoryPrompt } = req.body;

    const systemPrompt = `You are a gentle, encouraging choir teacher and storyteller guiding an elderly group through a song. 
    Your goal is to be warm, validate their memories, and gently encourage them to read or hum along. 
    NEVER criticize their singing or speaking. Keep your responses short (2-3 sentences), easy to understand, and conversational.
    Current section lyrics: "${sectionLyrics}"
    Current memory prompt to discuss: "${memoryPrompt}"`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    res.status(200).json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}