const API_URL = '/api/chat';
const rainbowColors = ['#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']; 
let songData = null, currentSectionIndex = 0, audioObj = null;

const ui = {
  appContent: document.getElementById('app-content'),
  status: document.getElementById('teacher-status'),
  title: document.getElementById('section-title'),
  lyrics: document.getElementById('section-lyrics'),
  aiResponse: document.getElementById('ai-response'),
  btnPlay: document.getElementById('btn-play'),
  btnMic: document.getElementById('btn-mic'),
  btnNext: document.getElementById('btn-next'),
  sun: document.querySelector('.sun')
};

async function init() {
  try {
    const res = await fetch('lyrics.json');
    songData = await res.json();
    audioObj = new Audio(songData.audio);
    
    audioObj.onerror = () => {
        ui.status.innerText = "Error: File song.mp3 not found.";
    };

    ui.status.style.display = 'none';
    ui.appContent.style.display = 'grid';
    loadSection(0);
  } catch (e) { 
    ui.status.innerText = "Error loading data."; 
    console.error(e);
  }
}

function loadSection(index) {
  const section = songData.sections[index];
  ui.title.innerText = "Part " + (index + 1);
  ui.lyrics.innerText = section.lyrics;
  ui.btnNext.innerText = "Unlock Next Color (" + (index + 1) + "/5)";
  ui.btnNext.disabled = true;
  ui.btnNext.classList.remove('color-unlocked');
  ui.sun.style.background = "radial-gradient(circle, #fff 0%, " + rainbowColors[index] + " 70%)";

  speak("Hello. Let us talk about the lyrics: " + section.lyrics.substring(0, 50) + ". " + section.memory_prompt);
}

ui.btnPlay.onclick = () => {
  const section = songData.sections[currentSectionIndex];
  audioObj.currentTime = section.start;
  audioObj.play();
  ui.btnPlay.innerText = "Playing...";
  ui.btnPlay.disabled = true;
  
  setTimeout(() => { 
      audioObj.pause(); 
      ui.btnNext.disabled = false; 
      ui.btnPlay.innerText = "Play Section";
      ui.btnPlay.disabled = false;
  }, (section.end - section.start) * 1000);
};

ui.btnNext.onclick = () => {
  const arcPath = document.getElementById("arc-" + currentSectionIndex);
  arcPath.style.stroke = rainbowColors[currentSectionIndex];
  arcPath.classList.add('animate-fill');

  currentSectionIndex++;
  
  if (currentSectionIndex < songData.sections.length) {
      setTimeout(() => loadSection(currentSectionIndex), 1500);
  } else {
      ui.btnNext.innerText = "Song Finished!";
      ui.btnNext.classList.add('color-unlocked');
      ui.btnNext.disabled = true;
      speak("You have completed the whole song. Well done.");
  }
};

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
        memoryPrompt: section.memory_prompt,
        chineseFunFact: section.chineseFunFact
      })
    });
    
    const data = await res.json();
    speak(data.reply);
  } catch (err) {
    console.error(err);
    speak("I am having trouble thinking right now, but you are doing wonderfully.");
  }
}

function speak(text) {
  ui.aiResponse.innerText = text;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.lang = 'en-US'; // Set to native English
  window.speechSynthesis.speak(utterance);
}

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'en-US'; // Expecting English input from the user
        ui.btnMic.onclick = () => {
            ui.aiResponse.innerText = "Listening...";
            rec.start();
        };
        rec.onresult = (e) => sendToAI(e.results[0][0].transcript);
    } else {
        ui.btnMic.innerText = "Mic Not Supported";
        ui.btnMic.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    setupSpeechRecognition();
});