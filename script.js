// Point this to your live Vercel URL
const API_URL = 'https://rainbow-connections.vercel.app/api/chat'; 

// ... [Keep your existing logic from previous code] ...

async function sendToAI(userText) {
  ui.aiResponse.innerText = "Teacher is thinking...";
  const section = songData.sections[currentSectionIndex];
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: userText,
        sectionLyrics: section.lyrics,
        memoryPrompt: section.memory_prompt
      })
    });
    
    const data = await res.json();
    speakAndShow(data.reply);
    ui.btnNext.disabled = false;
  } catch (err) {
    console.error(err);
    speakAndShow("I'm having a little trouble thinking right now, but you are doing wonderfully.");
    ui.btnNext.disabled = false;
  }
}