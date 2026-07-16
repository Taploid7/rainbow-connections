const API_URL = '/api/chat'; // Using relative path for Vercel
let songData = null, currentSectionIndex = 0, audioObj = null;

async function init() {
  try {
    const res = await fetch('lyrics.json');
    songData = await res.json();
    
    // Create audio object
    audioObj = new Audio(songData.audio);
    
    // Listen for errors loading the audio
    audioObj.onerror = () => {
        alert("Audio file could not be found. Check that the filename in lyrics.json matches the actual file.");
    };

    document.getElementById('teacher-status').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';
    loadSection(0);
  } catch (e) {
    console.error("Initialization error:", e);
    document.getElementById('teacher-status').innerText = "Error loading. Check console.";
  }
}

// ... rest of your existing functions (loadSection, btnPlay, etc) ...
document.addEventListener('DOMContentLoaded', init);