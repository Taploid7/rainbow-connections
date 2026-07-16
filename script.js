const API_URL = '/api/chat';
const rainbowColors = ['#ff7675', '#fd9644', '#f1c40f', '#2ecc71', '#0984e3'];
let songData = null, currentSectionIndex = 0, audioObj = null;

const ui = {
  appContent: document.getElementById('app-content'),
  btnPlay: document.getElementById('btn-play'),
  btnMic: document.getElementById('btn-mic'),
  btnNext: document.getElementById('btn-next'),
  aiResponse: document.getElementById('ai-response'),
  title: document.getElementById('section-title'),
  lyrics: document.getElementById('section-lyrics')
};

async function init() {
  try {
    const res = await fetch('lyrics.json');
    songData = await res.json();
    audioObj = new Audio(songData.audio);
    
    audioObj.onended = () => {
      ui.btnPlay.innerText = "Play / 播放";
      ui.btnPlay.disabled = false;
      // Only unlock next button if there is more song to play
      if (currentSectionIndex < songData.sections.length - 1) {
          ui.btnNext.disabled = false;
          ui.btnNext.classList.add('color-unlocked');
      } else {
          ui.btnNext.disabled = false; // Last section
          ui.btnNext.innerText = "Finish / 完成";
      }
    };

    ui.appContent.style.display = 'grid';
    loadSection(0);
  } catch (err) {
    console.error("Initialization error:", err);
  }
}

function loadSection(index) {
  const section = songData.sections[index];
  ui.btnNext.disabled = true;
  ui.btnNext.classList.remove('color-unlocked');
  ui.btnPlay.disabled = false;
  ui.title.innerText = `Part ${index + 1} / 第一部分`;
  ui.lyrics.innerText = section.lyrics;
  
  // Clean up undefined text
  const funFact = section.chineseFunFact || "";
  const prompt = section.memory_prompt || "";
  const teachingText = `${funFact} ${prompt}`;
  
  ui.aiResponse.innerText = teachingText;
  speak(teachingText);
}

ui.btnPlay.onclick = () => {
  if (!audioObj) return;
  audioObj.currentTime = songData.sections[currentSectionIndex].start;
  audioObj.play();
  ui.btnPlay.innerText = "Playing... / 播放中...";
  ui.btnPlay.disabled = true;
  ui.btnNext.disabled = true;
};

ui.btnNext.onclick = () => {
  // 1. Trigger Animation for the CURRENT arc
  const arc = document.getElementById(`arc-${currentSectionIndex}`);
  if (arc) {
    arc.style.animation = 'none';
    void arc.offsetWidth; // Trigger reflow to restart CSS animation
    arc.style.animation = 'drawRainbow 2s ease-out forwards';
    arc.style.stroke = rainbowColors[currentSectionIndex];
  }

  // 2. Advance to next section
  currentSectionIndex++;
  
  if (currentSectionIndex < songData.sections.length) {
    loadSection(currentSectionIndex);
  } else {
    ui.btnNext.innerText = "Journey Complete! / 旅程結束！";
    ui.btnNext.disabled = true;
  }
};

ui.btnMic.onclick = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Browser not supported");
  
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  ui.aiResponse.innerText = "Listening... / 聆聽中...";
  rec.start();
  
  rec.onresult = (e) => sendToAI(e.results[0][0].transcript);
};

async function sendToAI(userText) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userMessage: userText, 
        sectionLyrics: songData.sections[currentSectionIndex].lyrics,
        funFact: songData.sections[currentSectionIndex].chineseFunFact 
      })
    });
    const data = await res.json();
    ui.aiResponse.innerText = data.reply;
    speak(data.reply);
  } catch (err) { 
    ui.aiResponse.innerText = "Lovely effort! Keep going.";
    speak("Lovely effort! Keep going.");
  }
}

function speak(text) {
  // Stop previous speech if any
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

document.addEventListener('DOMContentLoaded', init);