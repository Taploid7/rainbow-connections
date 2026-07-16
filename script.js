const API_URL = '/api/chat'; // Relative path for Vercel
// Reversed colors so bottom arc (Part 1) unlocks first visually
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
        console.error("Audio loading failed.");
    };

    ui.status.style.display = 'none';
    ui.appContent.style.display = 'grid'; // Match CSS display
    loadSection(0);
    setupSpeechRecognition();
  } catch (e) { 
    ui.status.innerText = "Error loading data. Check console."; 
    console.error(e);
  }
}

function loadSection(index) {
  const section = songData.sections[index];
  ui.title.innerText = `Part ${index + 1}`;
  ui.lyrics.innerText = section.lyrics;
  ui.btnNext.innerText = `Unlock Next Color (${index + 1}/5)`;
  ui.btnNext.disabled = true;
  ui.btnNext.classList.remove('color-unlocked');
  
  // Set the initial color for the sun to match current section's rainbow part
  ui.sun.style.background = `radial-gradient(circle, #fff 0%, ${rainbowColors[index]} 70%)`;

  // Initial greeting from the teacher
  speak(`Hello! Let's talk about the lyrics: "${section.lyrics.substring(0,50)}..." ${section.memory_prompt}`);
}

ui.btnPlay.onclick = () => {
  const section = songData.sections[currentSectionIndex];
  audioObj.currentTime = section.start;
  audioObj.play();
  ui.btnPlay.innerText = "Playing...";
  ui.btnPlay.disabled = true;
  
  // Pause automatically after duration
  setTimeout(() => { 
      audioObj.pause(); 
      ui.btnNext.disabled = false; 
      ui.btnPlay.innerText = "Play Section";
      ui.btnPlay.disabled = false;
  }, (section.end - section.start) * 1000);
};

ui.btnNext.onclick = () => {
  // 1. Animate the corresponding SVG path
  const arcPath = document.getElementById(`arc-${currentSectionIndex}`);
  arcPath.style.stroke = rainbowColors[currentSectionIndex];
  arcPath.classList.add('animate-fill');

  // 2. Move to next section
  currentSectionIndex++;
  
  if (currentSectionIndex < songData.sections.length) {
      // Small delay before loading next lyrics so animation can be seen
      setTimeout(() => loadSection(currentSectionIndex), 1500);
  } else {
      ui.btnNext.innerText = "Song Finished!";
      ui.btnNext.classList.add('color-unlocked');
      ui.btnNext.disabled = true;
      speak("You have completed the whole song! Wonderful singing.");
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
        chineseFun