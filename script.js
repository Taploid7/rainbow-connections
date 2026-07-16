// Change this to your deployed Vercel URL when you go live. 
// For local testing without Vercel, this will throw an error when you try to talk to the AI, 
// but the music and UI will still function.
const API_URL = 'https://YOUR-VERCEL-DOMAIN.vercel.app/api/chat'; 

const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF']; // 5 colors
let songData = null;
let currentSectionIndex = 0;
let audioObj = null;
let audioCheckInterval = null;

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

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synth = window.speechSynthesis;

async function init() {
  try {
    // Fetches from the same folder
    const res = await fetch('lyrics.json');
    songData = await res.json();
    audioObj = new Audio(songData.audio);
    
    ui.status.style.display = 'none';
    ui.appContent.style.display = 'block';
    
    loadSection(0);
    setupEventListeners();
  } catch (error) {
    ui.status.innerText = "Error loading lyrics.json. (Note: If opening index.html directly in Chrome, you must use a local server like VS Code Live Server for fetch() to work!)";
    console.error(error);
  }
}

function loadSection(index) {
  const section = songData.sections[index];
  ui.title.innerText = `Part ${index + 1}: ${section.name}`;
  ui.lyrics.innerText = section.lyrics;
  ui.btnNext.disabled = true; 
  
  speakAndShow(`Let's look at part ${index + 1}. ${section.memory_prompt}`);
}

function playSectionAudio() {
  const section = songData.sections[currentSectionIndex];
  audioObj.currentTime = section.start;
  audioObj.play();
  
  ui.btnPlay.disabled = true;
  ui.btnPlay.innerText = "🎶 Playing...";

  clearInterval(audioCheckInterval);
  audioCheckInterval = setInterval(() => {
    if (audioObj.currentTime >= section.end) {
      audioObj.pause();
      clearInterval(audioCheckInterval);
      ui.btnPlay.disabled = false;
      ui.btnPlay.innerText = "🎵 Play Music Again";
      ui.btnNext.disabled = false; 
    }
  }, 100);
}

function setupEventListeners() {
  ui.btnPlay.addEventListener('click', playSectionAudio);
  
  ui.btnNext.addEventListener('click', () => {
    document.getElementById(`arc-${currentSectionIndex}`).style.stroke = rainbowColors[currentSectionIndex];
    
    currentSectionIndex++;
    if (currentSectionIndex < songData.sections.length) {
      loadSection(currentSectionIndex);
    } else {
      finishSong();
    }
  });

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;

    ui.btnMic.addEventListener('click', () => {
      recognition.start();
      ui.btnMic.classList.add('recording');
      ui.btnMic.innerText = "Listening...";
    });

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      ui.btnMic.classList.remove('recording');
      ui.btnMic.innerText = "🎤 Speak to Teacher";
      await sendToAI(transcript);
    };

    recognition.onerror = () => {
      ui.btnMic.classList.remove('recording');
      ui.btnMic.innerText = "🎤 Speak to Teacher";
      speakAndShow("I'm sorry, I didn't quite catch that. Try clicking the button again.");
    };
  } else {
    ui.btnMic.style.display = 'none'; 
  }
}

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
    speakAndShow("I couldn't reach the AI brain right now, but you are doing wonderfully! (Check your Vercel setup)");
    ui.btnNext.disabled = false;
  }
}

function speakAndShow(text) {
  ui.aiResponse.innerText = text;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 0.85; 
  synth.speak(utterance);
}

function finishSong() {
  ui.title.innerText = "You Did It!";
  ui.lyrics.innerText = "The rainbow is complete.";
  document.querySelector('.controls').style.display = 'none';
  ui.btnNext.style.display = 'none';
  speakAndShow("Beautiful. We have built the whole rainbow together. Thank you for sharing your memories and music with me today.");
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (speechSynthesis.getVoices().length > 0) {
    init();
  } else {
    speechSynthesis.onvoiceschanged = init;
  }
});