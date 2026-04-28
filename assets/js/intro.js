/* ═══════════════════════════════════════════════════════════════
   CB Grup Barna · Intro Experience
   Flux:
   P0 → Botó "Comença l'experiència"
   P1 → Typewriter (lletra per lletra, net)
   P2 → Carousel + Player VEUMANUAL (veu-jugadora)
        → quan acaba → CTA "Fes el primer pas →"  (o automàtic)
   → WEB
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── ÀUDIO ─────────────────────────────────────────────────── */
  let audJugadora, audMix, audMusica;
  let currentAudio = null;
  let isMuted = false;
  let progressRaf = null;

  function initAudios() {
    audJugadora = document.getElementById('audio-jugadora');
    audMix       = document.getElementById('audio-mix');
    audMusica    = document.getElementById('audio-musica');

    // Fade-in de 0.3s en el primer play
    [audJugadora, audMix, audMusica].forEach(a => {
      if (!a) return;
      a.volume = 0;
    });
  }

  function fadeIn(audio, targetVol, durationMs) {
    if (!audio) return;
    const steps = 30;
    const step  = targetVol / steps;
    const delay = durationMs / steps;
    let v = 0;
    const iv = setInterval(() => {
      v += step;
      audio.volume = Math.min(v, targetVol);
      if (audio.volume >= targetVol) clearInterval(iv);
    }, delay);
  }

  function fadeOut(audio, durationMs, cb) {
    if (!audio || audio.paused) { if (cb) cb(); return; }
    const startVol = audio.volume;
    const steps    = 20;
    const step     = startVol / steps;
    const delay    = durationMs / steps;
    const iv = setInterval(() => {
      audio.volume = Math.max(audio.volume - step, 0);
      if (audio.volume <= 0) {
        clearInterval(iv);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        if (cb) cb();
      }
    }, delay);
  }

  function stopAll(cb) {
    const all = [audJugadora, audMix, audMusica].filter(Boolean);
    let pending = all.length;
    if (!pending) { if (cb) cb(); return; }
    all.forEach(a => fadeOut(a, 400, () => { if (--pending === 0 && cb) cb(); }));
  }

  function playAudio(audio, vol) {
    if (!audio) return;
    currentAudio = audio;
    audio.currentTime = 0;
    audio.volume = 0;
    audio.play().catch(() => {});
    fadeIn(audio, vol || 0.92, 600);
    startProgressLoop();
  }

  /* ── PROGRESS BAR ───────────────────────────────────────────── */
  function startProgressLoop() {
    if (progressRaf) cancelAnimationFrame(progressRaf);
    const fill  = document.getElementById('progressFill');
    const tNow  = document.getElementById('timeNow');
    const tTot  = document.getElementById('timeTotal');
    const btn   = document.getElementById('mainPlayBtn');

    function loop() {
      const a = currentAudio;
      if (!a) return;
      if (fill && a.duration)
        fill.style.width = (a.currentTime / a.duration * 100) + '%';
      if (tNow) tNow.textContent = fmt(a.currentTime);
      if (tTot) tTot.textContent = fmt(a.duration);
      if (btn)  btn.innerHTML = a.paused ? '▶' : '⏸';

      // Auto-avançar quan acaba la veu
      if (!a.paused && a.duration && a.currentTime >= a.duration - 0.25) {
        handleAudioEnd();
        return;
      }
      progressRaf = requestAnimationFrame(loop);
    }
    progressRaf = requestAnimationFrame(loop);
  }

  function fmt(s) {
    if (!s || isNaN(s)) return '-:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /* ── FASE 0: PANTALLA INICIAL ───────────────────────────────── */
  window.startExperience = function () {
    const p0 = document.getElementById('p0-overlay');
    if (p0) {
      p0.classList.add('fade-out');
      setTimeout(() => { p0.style.display = 'none'; }, 900);
    }
    setTimeout(showPhase1, 700);
  };

  /* ── FASE 1: TYPEWRITER ─────────────────────────────────────── */
  function showPhase1() {
    const p1 = document.getElementById('p1-overlay');
    if (!p1) { showPhase2(); return; }
    p1.classList.add('show');
    startTypewriter(function () {
      // Quan acaba el typewriter, transició suau a P2
      setTimeout(() => {
        p1.classList.add('fade-out');
        setTimeout(() => {
          p1.style.display = 'none';
          showPhase2();
        }, 1000);
      }, 1200);
    });
  }

  /* Typewriter net: una línia cada vegada, sense solapament */
  function startTypewriter(onDone) {
    const lines = [
      { text: 'El 1965, al barri del Clot,', accent: false },
      { text: 'un grup de joves van crear un club de bàsquet.', accent: false },
      { text: '', accent: false },
      { text: 'Seixanta anys després,', accent: false },
      { text: '250 jugadores federades', accent: true },
      { text: 'entrenen cada setmana al Parc del Clot.', accent: false },
      { text: '', accent: false },
      { text: 'Sense subvencions dirigides.', accent: false },
      { text: 'Sense LF2 a la ciutat.', accent: false },
      { text: 'Sense referents propers.', accent: false },
      { text: '', accent: false },
      { text: 'Però amb el mètode.', accent: true },
      { text: 'I amb 60 anys de pràctica continuada.', accent: false },
    ];

    const container = document.getElementById('p1-typewriter');
    if (!container) { if (onDone) onDone(); return; }
    container.innerHTML = '';

    let li = 0;

    function nextLine() {
      if (li >= lines.length) { if (onDone) onDone(); return; }
      const data  = lines[li++];
      const div   = document.createElement('div');
      div.className = 'p1-line' + (data.accent ? ' accent' : '');

      if (!data.text) {
        div.innerHTML = '&nbsp;';
        div.style.minHeight = '0.9em';
        container.appendChild(div);
        requestAnimationFrame(() => div.classList.add('visible'));
        setTimeout(nextLine, 220);
        return;
      }

      container.appendChild(div);

      // Escriu caràcter per caràcter
      let ci = 0;
      const speed = 38; // ms per caràcter
      function typeChar() {
        if (ci <= data.text.length) {
          div.textContent = data.text.slice(0, ci);
          // Cursor parpellejant a l'última línia activa
          container.querySelectorAll('.p1-line.active').forEach(l => l.classList.remove('active'));
          div.classList.add('active');
          ci++;
          setTimeout(typeChar, speed);
        } else {
          div.classList.remove('active');
          requestAnimationFrame(() => div.classList.add('visible'));
          // Pausa entre línies: més llarga si és línia important
          const pause = data.accent ? 650 : (li % 3 === 0 ? 450 : 280);
          setTimeout(nextLine, pause);
        }
      }
      // Apareix suaument primer
      requestAnimationFrame(() => { div.classList.add('visible'); typeChar(); });
    }

    setTimeout(nextLine, 400);
  }

  /* ── FASE 2: CAROUSEL + PLAYER ──────────────────────────────── */
  function showPhase2() {
    const intro = document.getElementById('intro-overlay');
    if (!intro) { skipAll(); return; }
    intro.classList.add('show');
    intro.style.display = 'flex';

    // Carregar imatges del carousel
    initCarousel('carousel-track', 0.4, [
      '/cbgrupbarna/assets/img/players/p01.webp',
      '/cbgrupbarna/assets/img/players/p05.webp',
      '/cbgrupbarna/assets/img/players/p08.webp',
      '/cbgrupbarna/assets/img/players/p11.webp',
      '/cbgrupbarna/assets/img/players/p15.webp',
      '/cbgrupbarna/assets/img/players/p18.webp',
      '/cbgrupbarna/assets/img/alcalde/a01.webp',
      '/cbgrupbarna/assets/img/alcalde/a04.webp',
      '/cbgrupbarna/assets/img/alcalde/a09.webp',
    ]);

    // Auto-play la veu de la jugadora
    setTimeout(() => {
      switchTrack('jugadora');
    }, 600);

    // Mostrar hint CTA
    showNextStepHint(false);
  }

  /* ── CTA "FES EL PRIMER PAS" ────────────────────────────────── */
  function showNextStepHint(autoAdvance) {
    // Crea o mostra el botó de "Fes el primer pas →"
    let cta = document.getElementById('intro-cta-next');
    if (!cta) {
      cta = document.createElement('div');
      cta.id = 'intro-cta-next';
      cta.style.cssText = `
        position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);
        z-index:20;text-align:center;opacity:0;transition:opacity .6s ease;
        pointer-events:none;
      `;
      cta.innerHTML = `
        <div style="font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;
          color:rgba(242,237,230,.45);margin-bottom:.85rem;font-family:'Outfit',sans-serif;">
          La veu ha acabat
        </div>
        <button onclick="skipAll()" style="
          background:#C8102E;border:none;color:#F2EDE6;
          padding:1rem 2.4rem;font-family:'Outfit',sans-serif;
          font-size:.72rem;font-weight:500;letter-spacing:.25em;
          text-transform:uppercase;cursor:pointer;
          box-shadow:0 0 28px rgba(200,16,46,.45);
          transition:all .3s ease;animation:ctaPulse 2.4s ease-in-out infinite;
        " onmouseover="this.style.transform='scale(1.04)'"
           onmouseout="this.style.transform='scale(1)'">
          Fes el primer pas &nbsp;→
        </button>
        <div style="margin-top:1rem;">
          <a onclick="skipAll()" style="
            font-size:.52rem;letter-spacing:.2em;text-transform:uppercase;
            color:rgba(242,237,230,.3);cursor:pointer;text-decoration:underline;
            font-family:'Outfit',sans-serif;
          ">Saltar a la web →</a>
        </div>
      `;
      const intro = document.getElementById('intro-overlay');
      if (intro) intro.appendChild(cta);
    }

    if (autoAdvance) {
      // Apareix el botó i compta enrere 3s
      cta.style.pointerEvents = 'auto';
      requestAnimationFrame(() => { cta.style.opacity = '1'; });
      // Opcional: avançar automàticament als 5s
      setTimeout(() => {
        if (document.getElementById('intro-overlay') &&
            document.getElementById('intro-overlay').classList.contains('show')) {
          skipAll();
        }
      }, 5000);
    } else {
      // El botó apareixerà quan l'àudio acabi (handleAudioEnd)
    }
  }

  /* S'executa quan l'àudio de la jugadora acaba */
  function handleAudioEnd() {
    if (progressRaf) cancelAnimationFrame(progressRaf);
    progressRaf = null;

    // Fade out l'àudio
    if (currentAudio) fadeOut(currentAudio, 800, null);

    // Mostrar CTA amb compte enrere automàtic
    showNextStepHint(true);
  }

  /* ── CONTROLS PLAYER ────────────────────────────────────────── */
  window.switchTrack = function (type) {
    stopAll(() => {
      const map = { jugadora: audJugadora, mix: audMix, musica: audMusica };
      const audio = map[type];
      const nameMap = {
        jugadora: ['La veu d\'una jugadora', 'Des dels 5 anys fins als 18'],
        mix:      ['Presentació del projecte', 'Candidatura Premi Dona i Esport'],
        musica:   ['Música orquestral',       'Instrumental'],
      };
      // Highlight botó actiu
      ['jugadora','mix','musica'].forEach(k => {
        const b = document.getElementById('btn-' + k);
        if (!b) return;
        const active = (k === type);
        b.style.background    = active ? '#C8102E' : 'transparent';
        b.style.color         = active ? '#F2EDE6' : 'rgba(242,237,230,.4)';
        b.style.border        = active ? 'none'   : '1px solid rgba(242,237,230,.15)';
      });
      const tn = document.getElementById('trackName');
      const tt = document.getElementById('trackType');
      if (tn) tn.textContent = nameMap[type][0];
      if (tt) tt.textContent = nameMap[type][1];

      playAudio(audio, 0.92);
    });
  };

  window.toggleMainPlay = function () {
    if (!currentAudio) { window.switchTrack('jugadora'); return; }
    if (currentAudio.paused) {
      currentAudio.play().catch(() => {});
      fadeIn(currentAudio, 0.92, 400);
      startProgressLoop();
    } else {
      fadeOut(currentAudio, 300, null);
    }
  };

  window.toggleMute2 = function () {
    isMuted = !isMuted;
    [audJugadora, audMix, audMusica].forEach(a => { if (a) a.muted = isMuted; });
    const b = document.getElementById('muteBtn2');
    if (b) b.textContent = isMuted ? '🔇' : '🔊';
  };

  window.seekAudio = function (e) {
    if (!currentAudio || !currentAudio.duration) return;
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    const r = bar.getBoundingClientRect();
    currentAudio.currentTime = ((e.clientX - r.left) / r.width) * currentAudio.duration;
  };

  /* ── SKIP FUNCTIONS ─────────────────────────────────────────── */
  window.skipAll = function () {
    stopAll(null);
    ['p0-overlay','p1-overlay','intro-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.transition = 'opacity .7s ease';
      el.style.opacity    = '0';
      el.style.pointerEvents = 'none';
      setTimeout(() => { el.style.display = 'none'; }, 750);
    });
    const rb = document.getElementById('replay-btn');
    if (rb) rb.classList.add('show');
    localStorage.setItem('gbarna_intro_seen', '1');
  };

  window.skipToPhase2 = function () {
    const p1 = document.getElementById('p1-overlay');
    if (p1) {
      p1.style.transition = 'opacity .8s ease';
      p1.style.opacity = '0';
      p1.style.pointerEvents = 'none';
      setTimeout(() => { p1.classList.remove('show'); p1.style.display = 'none'; showPhase2(); }, 800);
    } else {
      showPhase2();
    }
  };

  window.skipIntro = window.skipAll;

  window.replayExperience = function () {
    const p0 = document.getElementById('p0-overlay');
    if (p0) { p0.style.display = 'flex'; p0.style.opacity = '1'; p0.classList.remove('fade-out'); }
    const rb = document.getElementById('replay-btn');
    if (rb) rb.classList.remove('show');
    ['p1-overlay','intro-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = 'none'; el.classList.remove('show'); el.style.opacity = '1'; }
    });
    stopAll(null);
  };

  /* ── CAROUSEL ───────────────────────────────────────────────── */
  window.initCarousel = function (trackId, speed, imgPaths) {
    const track = document.getElementById(trackId);
    if (!track || !imgPaths || !imgPaths.length) return;
    track.innerHTML = '';
    const all = [...imgPaths, ...imgPaths];
    all.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'CB Grup Barna';
      img.style.cssText = 'height:100%;width:auto;object-fit:cover;flex-shrink:0;filter:brightness(.85) saturate(1.1);';
      track.appendChild(img);
    });
    let pos = 0;
    (function animate() {
      pos += speed || 0.4;
      const half = track.scrollWidth / 2;
      if (pos >= half) pos = 0;
      track.style.transform = 'translateX(-' + pos + 'px)';
      requestAnimationFrame(animate);
    })();
  };

  /* ── INIT ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initAudios();
    // No auto-skip si ja s'ha vist — deixem la pantalla P0 sempre visible
    // (el botó "Reproduir experiència" permet tornar-hi)
  });

})();
