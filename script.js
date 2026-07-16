let songData = null, currentSectionIndex = 0, audioObj = null;

const ui = {
  btnPlay: document.getElementById('btn-play'),
  btnNext: document.getElementById('btn-next'),
  aiResponse: document.getElementById('ai-response'),
  title: document.getElementById('section-title'),
  lyrics: document.getElementById('section-lyrics'),
  appContent: document.getElementById('app-content')
};

async function init() {
  const res = await fetch('lyrics.json');
  songData = await res.json();
  audioObj = new Audio(songData.audio);
  loadSection(0);
}

function loadSection(index) {
  currentSectionIndex = index;
  const section = songData.sections[index];
  
  ui.title.innerText = section.name;
  ui.lyrics.innerText = section.lyrics;
  ui.aiResponse.innerText = `💡 小知識: ${section.funFact}`;
  
  ui.btnNext.disabled = true;
  ui.btnPlay.disabled = false;
  ui.btnPlay.innerText = "播放 / Play";
}

function playSection(index) {
  audioObj.pause();
  currentSectionIndex = index;
  loadSection(index);
  audioObj.currentTime = songData.sections[index].start;
  audioObj.play();
  
  const checkTime = () => {
    if (audioObj.currentTime >= songData.sections[index].end) {
      audioObj.pause();
      audioObj.removeEventListener('timeupdate', checkTime);
      ui.btnNext.disabled = false;
    }
  };
  audioObj.addEventListener('timeupdate', checkTime);
}

ui.btnPlay.onclick = () => playSection(currentSectionIndex);

ui.btnNext.onclick = () => {
  const arc = document.getElementById(`arc-${currentSectionIndex}`);
  if(arc) {
    arc.classList.add('drawing');
    arc.style.stroke = ['#ff7675', '#fd9644', '#f1c40f', '#2ecc71', '#0984e3'][currentSectionIndex % 5];
  }
  
  currentSectionIndex++;
  if(currentSectionIndex < songData.sections.length) {
    loadSection(currentSectionIndex);
  } else {
    showRestartMenu();
  }
};

function showRestartMenu() {
  ui.lyrics.innerText = "旅程已完成。您想再去聽聽哪一段呢？";
  ui.aiResponse.innerText = "太棒了！請選擇一個段落重新欣賞。";
  ui.btnNext.style.display = 'none';
  
  const menu = document.createElement('div');
  menu.className = 'controls';
  
  songData.sections.forEach((section, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn secondary';
    btn.innerText = section.name;
    btn.onclick = () => {
      menu.remove();
      ui.btnNext.style.display = 'block';
      playSection(idx);
    };
    menu.appendChild(btn);
  });
  ui.appContent.appendChild(menu);
}

document.addEventListener('DOMContentLoaded', init);