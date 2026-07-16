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
  
  // Safe display for your JSON fields
  ui.title.innerText = section.name || `Part ${index + 1}`;
  ui.lyrics.innerText = section.lyrics || "";
  
  // Set the context for the AI
  ui.aiResponse.innerText = "Listening for your voice... / 正在聆聽您的聲音...";
  ui.btnNext.disabled = true;
}

ui.btnPlay.onclick = () => {
  audioObj.currentTime = songData.sections[currentSectionIndex].start;
  audioObj.play();
  ui.btnPlay.disabled = true;
  audioObj.onended = () => { 
    ui.btnPlay.disabled = false;
    ui.btnNext.disabled = false; 
  };
};

ui.btnNext.onclick = () => {
  // Rainbow Animation Trigger
  const arc = document.getElementById(`arc-${currentSectionIndex}`);
  arc.style.stroke = ['#ff7675', '#fd9644', '#f1c40f', '#2ecc71', '#0984e3'][currentSectionIndex % 5];
  
  currentSectionIndex++;
  if(currentSectionIndex < songData.sections.length) {
    loadSection(currentSectionIndex);
  } else {
    ui.btnNext.innerText = "Completed! / 完成！";
  }
};

document.addEventListener('DOMContentLoaded', init);