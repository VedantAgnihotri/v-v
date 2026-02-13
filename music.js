// Music Player - Vinyl Record
document.addEventListener('DOMContentLoaded', () => {
  const recordPlayer = document.getElementById('record-player');
  const discImage = document.getElementById('disc-image');
  const audioPlayer = document.getElementById('audio-player');
  const songList = [
    './songs/song1.mp3',
    './songs/song2.mp3',
    './songs/song3.mp3'
  ];
  
  let currentSongIndex = 0;

  // Load album cover image
  discImage.src = './songs/cover.jpeg';
  discImage.onerror = () => {
    // Fallback if no cover image found
    discImage.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-2))';
  };

  // Initialize audio player
  audioPlayer.src = songList[currentSongIndex];

  // Auto-play on page load
  setTimeout(() => {
    audioPlayer.play().catch(err => {
      console.log('Auto-play prevented or no audio file:', err);
    });
  }, 500);

  // Click record player to play/pause
  recordPlayer.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(err => {
        console.log('Could not play audio:', err);
      });
    } else {
      audioPlayer.pause();
    }
  });

  // Handle play event
  audioPlayer.addEventListener('play', () => {
    discImage.classList.add('playing');
  });

  // Handle pause event
  audioPlayer.addEventListener('pause', () => {
    discImage.classList.remove('playing');
  });

  // Play next song when current ends
  audioPlayer.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songList.length;
    audioPlayer.src = songList[currentSongIndex];
    audioPlayer.play().catch(err => {
      console.log('Could not play next song:', err);
    });
  });
});
