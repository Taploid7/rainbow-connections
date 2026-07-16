const API_URL = '/api/chat';
const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF'];
let songData = null, currentSectionIndex = 0, audioObj = null;

const ui = {
  appContent: document.getElementById('app-content'),
  status: document.getElementById('teacher-status'),
  title: document.getElementById('section-title'),
  lyrics: document.getElementById('section-lyrics'),
  aiResponse: document.getElementById('ai-response'),
  btnPlay: document.getElementById('btn-play'),
  btnMic: document.getElementById('btn-mic'),
  btnNext: document.getElementById('btn-next')
};

async function init() {
  try {
    const res = await fetch('lyrics.json');
    songData = await res.json();
    audioObj = new Audio(songData.audio);
    
    // Error handling for missing audio file
    audioObj.onerror = () => {
        ui.status.innerText = "Error: Cannot find song.mp3 / 找不到 song.mp3";
    };
    
    ui.status.style.display = 'none';
    ui.appContent.style.display = 'block';
    loadSection(0);
  } catch (e) { 
    ui.status.innerText = "Error loading / 載入錯誤"; 
    console.error(e);
  }
}

function loadSection(index) {
  const section = songData.sections[index];
  ui.title.innerText = `Part ${index + 1}: ${section.name}`;
  ui.lyrics.innerText = section.lyrics;
  ui.btnNext.disabled = true;
  speakAndShow(`Let's look at ${section.name}. ${section.memory_prompt}`);
}

ui.btnPlay.onclick = () => {
  const section = songData.sections[currentSectionIndex];
  audioObj.currentTime = section.start;
  audioObj.play();
  setTimeout(() => { 
      audioObj.pause(); 
      ui.btnNext.disabled = false; 
  }, (section.end - section.start) * 1000);
};

ui.btnNext.onclick = () => {
  document.getElementById(`arc-${currentSectionIndex}`).style.stroke = rainbowColors[currentSectionIndex];
  currentSectionIndex++;
  if (currentSectionIndex < songData.sections.length) {
      loadSection(currentSectionIndex);
  } else {
      ui.aiResponse.innerText = "Song finished. Well done. / 歌曲結束。做得好。";
  }
};

async function sendToAI(userText) {
  ui.aiResponse.innerText = "Teacher is listening... / 老師正在聆聽...";
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        userMessage: userText, 
        sectionLyrics: songData.sections[currentSectionIndex].lyrics, 
        memoryPrompt: songData.sections[currentSectionIndex].memory_prompt
    })
  });
  const data = await res.json();
  speakAndShow(data.reply);
  ui.btnNext.disabled = false;
}

function speakAndShow(text) {
  ui.aiResponse.innerText = text;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
ui.btnMic.onclick = () => {
    ui.aiResponse.innerText = "Listening... / 聆聽中...";
    rec.start();
};
rec.onresult = (e) => sendToAI(e.results[0][0].transcript);

document.addEventListener('DOMContentLoaded', init);