const API_URL = 'https://rainbow-connections.vercel.app/api/chat';
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
    ui.status.style.display = 'none';
    ui.appContent.style.display = 'block';
    loadSection(0);
  } catch (e) { ui.status.innerText = "Error: Check Console."; console.error(e); }
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
  setTimeout(() => { audioObj.pause(); ui.btnNext.disabled = false; }, (section.end - section.start) * 1000);
};

ui.btnNext.onclick = () => {
  document.getElementById(`arc-${currentSectionIndex}`).style.stroke = rainbowColors[currentSectionIndex];
  currentSectionIndex++;
  currentSectionIndex < songData.sections.length ? loadSection(currentSectionIndex) : alert("Song Finished!");
};

async function sendToAI(userText) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userMessage: userText, sectionLyrics: songData.sections[currentSectionIndex].lyrics, memoryPrompt: songData.sections[currentSectionIndex].memory_prompt})
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
ui.btnMic.onclick = () => rec.start();
rec.onresult = (e) => sendToAI(e.results[0][0].transcript);

document.addEventListener('DOMContentLoaded', init);