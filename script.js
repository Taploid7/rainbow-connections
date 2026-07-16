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
  lyrics: document.getElementById('section-lyrics'),
  sun: document.querySelector('.sun')
};

async function init() {
  const res = await fetch('lyrics.json');
  songData = await res.json();
  audioObj = new Audio(songData.audio);
  
  // Set global audio behavior
  audioObj.onended = () => {
    ui.btnPlay.innerText = "Play / 播放";
    ui.btnPlay.disabled = false;
    ui.btnNext.disabled = false; // ONLY enable now
    ui.btnNext.classList.add('color-unlocked');
  };

  ui.appContent.style.display = 'grid';
  loadSection(0);
}

function loadSection(index) {
  const section = songData.sections[index];
  // Reset UI
  ui.btnNext.disabled = true; // LOCK the button
  ui.btnNext.classList.remove('color-unlocked');
  ui.btnPlay.disabled = false;
  
  ui.title.innerText = `Part ${index + 1} / 第一部分`;
  ui.lyrics.innerText = section.lyrics;
  ui.sun.style.background = `radial-gradient(circle, #fff 0%, ${rainbowColors[index]} 70%)`;

  // The Teacher teaches immediately
  const intro = `Welcome to part ${index + 1}. ${section.chineseFunFact} ${section.memory_prompt}`;
  speak(intro);
}

// PLAY BUTTON: Only plays audio
ui.btnPlay.onclick = () => {
  const section = songData.sections[currentSectionIndex];
  audioObj.currentTime = section.start;
  audioObj.play();
  ui.btnPlay.disabled = true; // Cannot spam play
  ui.btnNext.disabled = true; // Cannot skip while playing
};

// MIC BUTTON: Only for Singing/Speaking
ui.btnMic.onclick = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Not supported");
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  ui.aiResponse.innerText = "Listening... / 聆聽中...";
  rec.start();
  rec.onresult = (e) => sendToAI(e.results[0][0].transcript);
};

// NEXT BUTTON: Transitions only
ui.btnNext.onclick = () => {
  document.getElementById(`arc-${currentSectionIndex}`).style.stroke = rainbowColors[currentSectionIndex];
  document.getElementById(`arc-${currentSectionIndex}`).classList.add('animate-fill');
  
  currentSectionIndex++;
  if (currentSectionIndex < songData.sections.length) {
    loadSection(currentSectionIndex);
  } else {
    speak("Congratulations, you finished the song! / 恭喜，你完成了這首歌！");
    ui.btnNext.innerText = "Finished / 完成";
  }
};

async function sendToAI(userText) {
  ui.aiResponse.innerText = "Teacher is listening... / 老師正在聽...";
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userMessage: `The user sang: ${userText}`, 
        sectionLyrics: songData.sections[currentSectionIndex].lyrics 
      })
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