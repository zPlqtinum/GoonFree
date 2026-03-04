/* ============================================
   GOONFREE — Panic Mode
   Breathing exercise + quote for urge moments
   ============================================ */

const PanicMode = (() => {
  let active = false;
  let timerInterval = null;
  let startTime = 0;

  const PHASES = [
    { name: 'Breathe in', duration: 4000, scale: 1.5 },
    { name: 'Hold', duration: 7000, scale: 1.5 },
    { name: 'Breathe out', duration: 8000, scale: 1.0 }
  ];

  let dom = {};

  function cacheDom() {
    dom.overlay = document.getElementById('panic-overlay');
    dom.circle = document.getElementById('panic-circle');
    dom.phaseText = document.getElementById('panic-phase');
    dom.timer = document.getElementById('panic-timer');
    dom.quote = document.getElementById('panic-quote');
    dom.quoteAuthor = document.getElementById('panic-quote-author');
    dom.exitBtn = document.getElementById('panic-exit');
    dom.fab = document.getElementById('panic-fab');
  }

  function init() {
    cacheDom();
    dom.fab.addEventListener('click', open);
    dom.exitBtn.addEventListener('click', close);
  }

  async function open() {
    if (active) return;
    active = true;
    startTime = Date.now();

    // Load a quote
    if (QuotesEngine.hasLikedQuotes()) {
      const q = await QuotesEngine.getRandomLiked();
      if (q) {
        dom.quote.textContent = '\u201C' + q.text + '\u201D';
        dom.quoteAuthor.textContent = '\u2014 ' + q.author;
      }
    } else {
      // Fetch any random quote
      await QuotesEngine.fetchBatch();
      const q = QuotesEngine.getNextFromPool();
      if (q) {
        dom.quote.textContent = '\u201C' + q.text + '\u201D';
        dom.quoteAuthor.textContent = '\u2014 ' + q.author;
      }
    }

    dom.overlay.classList.add('active');
    startBreathing();
    startTimer();
  }

  function close() {
    active = false;
    dom.overlay.classList.remove('active');
    stopBreathing();
    stopTimer();
  }

  // Breathing cycle
  let breathingTimeout = null;
  let currentPhase = 0;

  function startBreathing() {
    currentPhase = 0;
    runPhase();
  }

  function runPhase() {
    if (!active) return;
    const phase = PHASES[currentPhase];
    dom.phaseText.textContent = phase.name;
    dom.circle.style.transform = 'scale(' + phase.scale + ') translateX(-1px)';
    dom.circle.style.transition = 'transform ' + phase.duration + 'ms ease-in-out';

    breathingTimeout = setTimeout(() => {
      currentPhase = (currentPhase + 1) % PHASES.length;
      runPhase();
    }, phase.duration);
  }

  function stopBreathing() {
    clearTimeout(breathingTimeout);
    dom.circle.style.transform = 'scale(1) translateX(-1px)';
    dom.circle.style.transition = 'transform 0.3s ease';
  }

  // Timer
  function startTimer() {
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    dom.timer.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function isActive() {
    return active;
  }

  return { init, open, close, isActive };
})();
