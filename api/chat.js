import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  const { userMessage, sectionLyrics, funFact } = req.body;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `您是一位溫暖、極具耐心的音樂老師，專門指導長輩。
    - 您的口吻必須親切、尊崇且給予極大鼓勵。
    - 請使用繁體中文。
    - 任務：將我們提供的冷知識「${funFact}」融入您的回覆中，用簡單的方式解釋給長輩聽。
    - 絕對禁止：不要向長輩提問，不要訪問長輩。
    - 目的：讓長輩感到自信與快樂。`
  });

  const result = await model.generateContent(`學生唱了這段歌詞: "${sectionLyrics}"。請給予鼓勵並分享這個知識: ${funFact}`);
  res.status(200).json({ reply: result.response.text() });
}