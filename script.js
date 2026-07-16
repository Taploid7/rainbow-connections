let songData = null, currentSectionIndex = 0, audioObj = null;

const ui = {
  btnPlay: document.getElementById('btn-play'),
  btnNext: document.getElementById('btn-next'),
  aiResponse: document.getElementById('ai-response'),
  title: document.getElementById('section-title'),
  lyrics: document.getElementById('section-lyrics')
};

async function init() {
  const res = await fetch('lyrics.json');
  songData = await res.json();
  audioObj = new Audio(songData.audio);
  loadSection(0);
}

function loadSection(index) {
  const section = songData.sections[index];
  ui.title.innerText = section.name || `Part ${index + 1}`;
  ui.lyrics.innerText = section.lyrics || "";
  ui.aiResponse.innerText = "Listening for your voice... / 正在聆聽...";
  ui.btnNext.disabled = true;
  ui.btnPlay.disabled = false;
  ui.btnPlay.innerText = "Play / 播放";
}

ui.btnPlay.onclick = () => {
  const section = songData.sections[currentSectionIndex];
  audioObj.currentTime = section.start;
  audioObj.play();
  
  ui.btnPlay.innerText = "Playing... / 播放中...";
  ui.btnPlay.disabled = true;

  // --- THE FIX: ADD A WATCHDOG ---
  const checkTime = () => {
    if (audioObj.currentTime >= section.end) {
      audioObj.pause();
      // Remove the listener so it doesn't keep running in the background
      audioObj.removeEventListener('timeupdate', checkTime);
      
      // Unlock UI
      ui.btnPlay.innerText = "Play / 播放";
      ui.btnPlay.disabled = false;
      ui.btnNext.disabled = false;
    }
  };

  // Listen to the audio progress and trigger checkTime()
  audioObj.addEventListener('timeupdate', checkTime);
};

ui.btnNext.onclick = () => {
  // Rainbow Animation Trigger
  const arc = document.getElementById(`arc-${currentSectionIndex}`);
  if(arc) {
    arc.style.animation = 'none';
    void arc.offsetWidth; 
    arc.style.animation = 'drawRainbow 1s ease forwards';
    arc.style.stroke = ['#ff7675', '#fd9644', '#f1c40f', '#2ecc71', '#0984e3'][currentSectionIndex % 5];
  }
  
  currentSectionIndex++;
  if(currentSectionIndex < songData.sections.length) {
    loadSection(currentSectionIndex);
  } else {
    ui.btnNext.innerText = "Completed! / 完成！";
  }
};

document.addEventListener('DOMContentLoaded', init);