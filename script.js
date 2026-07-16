// --- Global State ---
let songData = null;
let currentSectionIndex = 0;
let audioObj = null;

const ui = {
  appContent: document.getElementById('app-content'),
  btnPlay: document.getElementById('btn-play'),
  btnMic: document.getElementById('btn-mic'),
  btnNext: document.getElementById('btn-next'),
  aiResponse: document.getElementById('ai-response'),
  title: document.getElementById('section-title'),
  lyrics: document.getElementById('section-lyrics')
};

// --- Initialization ---
async function init() {
  try {
    const res = await fetch('lyrics.json');
    songData = await res.json();
    
    // Create audio object
    audioObj = new Audio(songData.audio);

    ui.appContent.style.display = 'block';
    loadSection(0);
  } catch (err) {
    console.error("Initialization error:", err);
    ui.aiResponse.innerText = "Error loading data. Please check your JSON file.";
  }
}

// --- Section Manager ---
function loadSection(index) {
  const section = songData.sections[index];
  
  // Set UI elements with fallbacks
  ui.title.innerText = section.name || `Part ${index + 1}`;
  ui.lyrics.innerText = section.lyrics || "No lyrics available.";
  ui.aiResponse.innerText = "Press Play to listen! / 按下播放來聆聽！";
  
  // Reset buttons
  ui.btnNext.disabled = true;
  ui.btnPlay.disabled = false;
  ui.btnPlay.innerText = "Play / 播放";
}

// --- Audio Playback with Watchdog (stops at section.end) ---
ui.btnPlay.onclick = () => {
  if (!audioObj) return;
  const section = songData.sections[currentSectionIndex];
  
  audioObj.currentTime = section.start;
  audioObj.play();
  
  ui.btnPlay.innerText = "Playing... / 播放中...";
  ui.btnPlay.disabled = true;

  // Watchdog function to stop audio at the end timestamp
  const checkTime = () => {
    if (audioObj.currentTime >= section.end) {
      audioObj.pause();
      audioObj.removeEventListener('timeupdate', checkTime); // Stop the watcher
      
      ui.btnPlay.innerText = "Play / 播放";
      ui.btnPlay.disabled = false;
      ui.btnNext.disabled = false; // Enable next section
    }
  };

  audioObj.addEventListener('timeupdate', checkTime);
};

// --- Progress Logic ---
ui.btnNext.onclick = () => {
  // 1. Trigger Rainbow Animation
  const arc = document.getElementById(`arc-${currentSectionIndex}`);
  if (arc) {
    arc.classList.add('drawing'); // Triggers the CSS animation
    arc.style.stroke = ['#ff7675', '#fd9644', '#f1c40f', '#2ecc71', '#0984e3'][currentSectionIndex % 5];
  }

  // 2. Advance section
  currentSectionIndex++;
  
  if (currentSectionIndex < songData.sections.length) {
    loadSection(currentSectionIndex);
  } else {
    ui.btnNext.innerText = "Journey Complete! / 旅程結束！";
    ui.btnNext.disabled = true;
  }
};

// --- AI Interaction ---
ui.btnMic.onclick = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Browser not supported.");
  
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  ui.aiResponse.innerText = "Listening... / 聆聽中...";
  rec.start();
  
  rec.onresult = (e) => sendToAI(e.results[0][0].transcript);
};

async function sendToAI(userText) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userMessage: userText, 
        sectionLyrics: songData.sections[currentSectionIndex].lyrics,
        memory_prompt: songData.sections[currentSectionIndex].memory_prompt 
      })
    });
    
    const data = await res.json();
    ui.aiResponse.innerText = data.reply;
    
    // Voice output
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(data.reply);
    window.speechSynthesis.speak(utterance);
    
  } catch (err) { 
    ui.aiResponse.innerText = "Lovely effort! Keep singing.";
  }
}

document.addEventListener('DOMContentLoaded', init);