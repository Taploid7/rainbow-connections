const API_URL = '/api/chat';
const rainbowColors = ['#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']; 
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
  const res = await fetch('lyrics.json');
  songData = await res.json();
  audioObj = new Audio(songData.audio);
  
  audioObj.onended = () => {
    ui.btnPlay.innerText = "Play / 播放";
    ui.btnPlay.disabled = false;
    if (currentSectionIndex < songData.sections.length) {
        ui.btnNext.disabled = false;
        ui.btnNext.classList.add('color-unlocked');
    }
  };

  ui.appContent.style.display = 'grid';
  loadSection(0);
}

function loadSection(index) {
  const section = songData.sections[index];
  ui.btnNext.disabled = true;
  ui.btnNext.classList.remove('color-unlocked');
  ui.btnPlay.disabled = false;
  
  ui.title.innerText = `Part ${index + 1} / 第一部分`;
  ui.lyrics.innerText = section.lyrics;
  
  speak(`Welcome to part ${index + 1}. ${section.chineseFunFact} ${section.memory_prompt}`);
}

ui.btnPlay.onclick = () => {
  audioObj.currentTime = songData.sections[currentSectionIndex].start;
  audioObj.play();
  ui.btnPlay.innerText = "Playing... / 播放中...";
  ui.btnPlay.disabled = true;
  ui.btnNext.disabled = true;
  ui.btnNext.classList.remove('color-unlocked');
};

ui.btnMic.onclick = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Not supported");
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  ui.aiResponse.innerText = "Listening... / 聆聽中...";
  rec.start();
  rec.onresult = (e) => sendToAI(e.results[0][0].transcript);
};

ui.btnNext.onclick = () => {
  const arc = document.getElementById(`arc-${currentSectionIndex}`);
  arc.style.stroke = rainbowColors[currentSectionIndex];
  arc.classList.add('color-active');
  
  currentSectionIndex++;
  if (currentSectionIndex < songData.sections.length) {
    loadSection(currentSectionIndex);
  } else {
    ui.btnNext.innerText = "Finished / 完成";
  }
};

async function sendToAI(userText) {
  ui.aiResponse.innerText = "Teacher is thinking... / 老師正在思考...";
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText, sectionLyrics: songData.sections[currentSectionIndex].lyrics })
    });
    const data = await res.json();
    speak("Great effort! " + data.reply);
  } catch (err) {
    speak("I heard you! That was lovely.");
  }
}

function speak(text) {
  ui.aiResponse.innerText = text;
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

document.addEventListener('DOMContentLoaded', init);