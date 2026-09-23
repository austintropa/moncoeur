(() => {
  // Prevent the legacy YouTube player from loading. The page now uses the local audio file.
  class SilentPlayer {
    constructor(_element, options = {}) {
      this.events = options.events || {};
      this.muted = false;
      setTimeout(() => this.events.onReady?.({ target: this }), 0);
    }
    playVideo() { this.events.onStateChange?.({ data: 1 }); }
    pauseVideo() { this.events.onStateChange?.({ data: 2 }); }
    mute() { this.muted = true; }
    unMute() { this.muted = false; }
    destroy() {}
    getPlayerState() { return 2; }
    isMuted() { return this.muted; }
  }
  window.YT = { Player: SilentPlayer };

  const extraFlowers = [
    { kind: 'babys-breath', x: 7,  h: 50, r: -29, delay: 7.4, sway: 7.4 },
    { kind: 'tulip',        x: 29, h: 67, r: -13, delay: 5.8, sway: 6.8 },
    { kind: 'babys-breath', x: 31, h: 54, r:  23, delay: 7.1, sway: 8.0 },
    { kind: 'sunflower',    x: 49, h: 74, r:   2, delay: 5.2, sway: 7.1 },
    { kind: 'tulip',        x: 64, h: 70, r:  13, delay: 6.0, sway: 8.3 },
    { kind: 'babys-breath', x: 69, h: 51, r: -19, delay: 7.6, sway: 7.7 },
    { kind: 'sunflower',    x: 88, h: 71, r:  18, delay: 5.7, sway: 8.6 },
    { kind: 'tulip',        x: 92, h: 58, r:  30, delay: 6.4, sway: 7.9 }
  ];

  function enrichBouquet(bouquet) {
    if (!(bouquet instanceof HTMLElement)) return;
    const existing = bouquet.querySelectorAll(':scope > .extra-plant');
    if (existing.length === extraFlowers.length) return;
    existing.forEach((node) => node.remove());

    for (const flower of extraFlowers) {
      const plant = document.createElement('div');
      plant.className = `plant plant-${flower.kind} extra-plant`;
      plant.style.setProperty('--x', `${flower.x}%`);
      plant.style.setProperty('--h', `${flower.h}%`);
      plant.style.setProperty('--r', `${flower.r}deg`);
      plant.style.setProperty('--delay', `${flower.delay}s`);
      plant.style.setProperty('--sway', `${flower.sway}s`);

      const growth = document.createElement('div');
      growth.className = 'plant-growth';
      const img = document.createElement('img');
      img.src = `./art/${flower.kind}.webp`;
      img.alt = '';
      img.draggable = false;
      growth.appendChild(img);
      plant.appendChild(growth);
      bouquet.appendChild(plant);
    }
  }

  function enrichAllBouquets() {
    document.querySelectorAll('.bouquet').forEach(enrichBouquet);
  }

  function setupMusic() {
    const audio = document.createElement('audio');
    audio.id = 'moncoeur-background-audio';
    audio.src = './audio/te-amo-y-mas.mp3';
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.52;
    audio.setAttribute('playsinline', '');
    document.body.appendChild(audio);

    const button = document.createElement('button');
    button.id = 'moncoeur-music-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Pausar o reproducir la música');
    button.innerHTML = '<span class="music-toggle-icon" aria-hidden="true">♪</span><span class="music-toggle-label">Reproducir música</span>';
    document.body.appendChild(button);

    const label = button.querySelector('.music-toggle-label');
    const icon = button.querySelector('.music-toggle-icon');
    let userPaused = false;

    const updateButton = () => {
      const isPlaying = !audio.paused && !audio.ended;
      label.textContent = isPlaying ? 'Pausar música' : 'Reproducir música';
      icon.textContent = isPlaying ? 'Ⅱ' : '♪';
      button.classList.toggle('is-playing', isPlaying);
      button.setAttribute('aria-pressed', String(isPlaying));
    };

    const play = async () => {
      if (userPaused) return false;
      try {
        await audio.play();
        updateButton();
        return true;
      } catch {
        updateButton();
        return false;
      }
    };

    button.addEventListener('click', async () => {
      if (audio.paused) {
        userPaused = false;
        try { await audio.play(); } catch {}
      } else {
        userPaused = true;
        audio.pause();
      }
      updateButton();
    });

    audio.addEventListener('play', updateButton);
    audio.addEventListener('pause', updateButton);
    audio.addEventListener('ended', updateButton);

    // Browsers may block audible autoplay. The first real interaction unlocks it.
    const resumeOnGesture = (event) => {
      if (event.target instanceof Element && event.target.closest('#moncoeur-music-toggle')) return;
      if (!userPaused && audio.paused) play();
    };
    document.addEventListener('pointerdown', resumeOnGesture, { passive: true });
    document.addEventListener('keydown', resumeOnGesture);

    // Do not pause on scroll, when the player leaves the viewport, or on tab visibility changes.
    play();
    updateButton();
  }

  function cleanLegacyMusicUi() {
    document.querySelectorAll('.music-status,.text-link,.music-note,.video-wrap,.music-controls').forEach((el) => {
      if (el instanceof HTMLElement) el.hidden = true;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMusic();
    enrichAllBouquets();
    cleanLegacyMusicUi();

    const observer = new MutationObserver(() => {
      enrichAllBouquets();
      cleanLegacyMusicUi();
    });
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  });
})();
