/* ============================================
   GOONFREE — Application Logic
   Streak tracking, levels, badges, UI
   ============================================ */

(function () {
  'use strict';

  // ---- Level System (16 levels, 0–15) ----
  const MAX_LEVEL = 15;

  const LEVELS = [
    { level: 0,  days: 0,    title: 'Unlit',          tier: null,            icon: '💀' },
    { level: 1,  days: 3,    title: 'Spark',          tier: 'copper',        icon: '✦' },
    { level: 2,  days: 7,    title: 'Ignited',        tier: 'copper',        icon: '🔥' },
    { level: 3,  days: 14,   title: 'Burning',        tier: 'bronze',        icon: '⚔️' },
    { level: 4,  days: 30,   title: 'Disciplined',    tier: 'bronze',        icon: '🛡️' },
    { level: 5,  days: 60,   title: 'Resilient',      tier: 'silver',        icon: '⚡' },
    { level: 6,  days: 90,   title: 'Forged',         tier: 'silver',        icon: '⭐' },
    { level: 7,  days: 180,  title: 'Unbreakable',    tier: 'gold',          icon: '💎' },
    { level: 8,  days: 365,  title: 'Elite',          tier: 'gold',          icon: '🌀' },
    { level: 9,  days: 500,  title: 'Ascended',       tier: 'platinum',      icon: '👁️' },
    { level: 10, days: 730,  title: 'Mythic',         tier: 'sapphire',      icon: '🐉' },
    { level: 11, days: 1095, title: 'Legendary',      tier: 'amethyst',      icon: '🔮' },
    { level: 12, days: 1460, title: 'Transcendent',   tier: 'emerald',       icon: '🌿' },
    { level: 13, days: 1825, title: 'Eternal',        tier: 'ruby',          icon: '❤️‍🔥' },
    { level: 14, days: 2555, title: 'Celestial',      tier: 'diamond',       icon: '✨' },
    { level: 15, days: 3650, title: 'GoonFree', tier: 'ultra-diamond', icon: '👑' }
  ];

  const FLAME_COLORS = [
    '#661a1a',  // 0  - Dark ember
    '#FF8C42',  // 1  - Dull orange
    '#FF6A00',  // 2  - Strong orange
    '#FFB300',  // 3  - Amber
    '#FFD700',  // 4  - Gold
    '#FFEE58',  // 5  - Bright yellow
    '#FFFFFF',  // 6  - White-hot
    '#2979FF',  // 7  - Blue
    '#00E5FF',  // 8  - Electric blue
    '#7C4DFF',  // 9  - Violet
    '#651FFF',  // 10 - Deep purple
    '#FF4081',  // 11 - Pink plasma
    '#00E676',  // 12 - Emerald green
    '#FF1744',  // 13 - Crimson
    '#FFFFFF',  // 14 - White prism
    '#FFFFFF'   // 15 - Ultra celestial
  ];

  const FLAME_GLOWS = [
    'rgba(80,20,20,0.3)',
    'rgba(255,140,66,0.4)',
    'rgba(255,106,0,0.45)',
    'rgba(255,179,0,0.45)',
    'rgba(255,215,0,0.5)',
    'rgba(255,238,88,0.5)',
    'rgba(255,255,255,0.5)',
    'rgba(41,121,255,0.5)',
    'rgba(0,229,255,0.5)',
    'rgba(124,77,255,0.5)',
    'rgba(101,31,255,0.55)',
    'rgba(255,64,129,0.5)',
    'rgba(0,230,118,0.5)',
    'rgba(255,23,68,0.55)',
    'rgba(255,255,255,0.6)',
    'rgba(255,255,255,0.7)'
  ];

  // ---- Storage ----
  const STORAGE_KEY = 'goonFree';

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getDefaultData() {
    return {
      startDate: new Date().toISOString(),
      highestStreak: 0,
      lastResetTimestamp: null
    };
  }

  // ---- Streak Calculation ----
  function calculateStreak(startDateISO) {
    const start = new Date(startDateISO);
    const now = new Date();

    // Use local dates so streak ticks over at local midnight
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const diffMs = nowDay - startDay;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  function getLevelForDays(days) {
    let result = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (days >= LEVELS[i].days) {
        result = LEVELS[i];
        break;
      }
    }
    return result;
  }

  function getNextLevel(currentLevel) {
    if (currentLevel >= MAX_LEVEL) return null;
    return LEVELS[currentLevel + 1];
  }

  // ---- DOM References ----
  const dom = {};

  function cacheDom() {
    dom.streakNumber = document.getElementById('streak-number');
    dom.streakLabel = document.getElementById('streak-label');
    dom.levelTitle = document.getElementById('level-title');
    dom.levelIndicator = document.getElementById('level-indicator');
    dom.badge = document.getElementById('badge');
    dom.badgeIcon = document.getElementById('badge-icon');
    dom.badgeTier = document.getElementById('badge-tier');
    dom.highestStreak = document.getElementById('highest-streak');
    dom.nextLevelText = document.getElementById('next-level-text');
    dom.progressBar = document.getElementById('progress-bar');
    dom.resetBtn = document.getElementById('reset-btn');
    dom.resetModal = document.getElementById('reset-modal');
    dom.confirmReset = document.getElementById('confirm-reset');
    dom.cancelReset = document.getElementById('cancel-reset');
    dom.modalBackdrop = dom.resetModal.querySelector('.modal-backdrop');
    dom.bgGlow = document.getElementById('bg-glow');
    dom.levelUpNotification = document.getElementById('level-up-notification');
    dom.levelUpTitle = document.getElementById('level-up-title');
    dom.flameContainer = document.getElementById('flame-container');
    dom.canvas = document.getElementById('fire-canvas');
    // Levels
    dom.levelsBtn = document.getElementById('levels-btn');
    dom.levelsModal = document.getElementById('levels-modal');
    dom.levelsModalBackdrop = dom.levelsModal.querySelector('.modal-backdrop');
    dom.levelsList = document.getElementById('levels-list');
    dom.levelsClose = document.getElementById('levels-close');
    // Sync
    dom.syncBtn = document.getElementById('sync-btn');
    dom.syncModal = document.getElementById('sync-modal');
    dom.syncModalBackdrop = dom.syncModal.querySelector('.modal-backdrop');
    dom.syncClose = document.getElementById('sync-close');
    dom.syncUnlinked = document.getElementById('sync-unlinked');
    dom.syncLinked = document.getElementById('sync-linked');
    dom.syncGenerate = document.getElementById('sync-generate');
    dom.syncInput = document.getElementById('sync-input');
    dom.syncRestore = document.getElementById('sync-restore');
    dom.syncError = document.getElementById('sync-error');
    dom.syncCodeText = document.getElementById('sync-code-text');
    dom.syncCopy = document.getElementById('sync-copy');
    dom.syncDownload = document.getElementById('sync-download');
    dom.syncStatus = document.getElementById('sync-status');
    dom.syncUnlink = document.getElementById('sync-unlink');
    dom.toast = document.getElementById('toast');
    // Quotes
    dom.quotesBtn = document.getElementById('quotes-btn');
    dom.quotesModal = document.getElementById('quotes-modal');
    dom.quotesModalBackdrop = dom.quotesModal.querySelector('.modal-backdrop');
    dom.quotesClose = document.getElementById('quotes-close');
    dom.quotesText = document.getElementById('quotes-text');
    dom.quotesAuthor = document.getElementById('quotes-author');
    dom.quotesPrev = document.getElementById('quotes-prev');
    dom.quotesNext = document.getElementById('quotes-next');
    dom.quotesLike = document.getElementById('quotes-like');
    // QOTD
    dom.qotdPopup = document.getElementById('qotd-popup');
    dom.qotdText = document.getElementById('qotd-text');
    dom.qotdAuthor = document.getElementById('qotd-author');
  }

  // ---- UI Updates ----
  let displayedLevel = -1;

  function updateUI(streak, data, skipCountUp) {
    const levelInfo = getLevelForDays(streak);
    const nextLevel = getNextLevel(levelInfo.level);

    // Update highest streak
    if (streak > data.highestStreak) {
      data.highestStreak = streak;
      saveData(data);
      syncToCloud();
    }
    dom.highestStreak.textContent = data.highestStreak;

    // Streak number with count-up animation
    if (skipCountUp) {
      dom.streakNumber.textContent = streak;
    } else {
      animateCountUp(dom.streakNumber, streak);
    }

    // Singular/plural label
    dom.streakLabel.textContent = streak === 1 ? 'day strong' : 'days strong';

    // Level title and indicator
    dom.levelTitle.textContent = levelInfo.title;
    dom.levelIndicator.textContent = levelInfo.level === 0 ? '' : `Level ${levelInfo.level}`;

    // Badge
    dom.badge.className = '';
    if (levelInfo.tier) {
      dom.badge.classList.add(levelInfo.tier);
    }
    dom.badgeIcon.textContent = levelInfo.icon;
    dom.badgeTier.textContent = levelInfo.tier
      ? levelInfo.tier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : '';

    // Next level progress
    if (nextLevel) {
      const prevThreshold = levelInfo.days;
      const nextThreshold = nextLevel.days;
      const progress = ((streak - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
      const daysLeft = nextThreshold - streak;

      dom.nextLevelText.textContent = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to ${nextLevel.title}`;
      dom.progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    } else {
      dom.nextLevelText.textContent = 'Maximum level achieved';
      dom.progressBar.style.width = '100%';
    }

    // CSS custom properties for colors
    const color = FLAME_COLORS[levelInfo.level];
    const glow = FLAME_GLOWS[levelInfo.level];
    const intensity = levelInfo.level / MAX_LEVEL; // 0 to 1
    document.documentElement.style.setProperty('--flame-color', color);
    document.documentElement.style.setProperty('--flame-glow', glow);
    document.documentElement.style.setProperty('--level-intensity', intensity);

    // Body pulse class for high levels
    document.body.classList.toggle('high-level', levelInfo.level >= 7);
    document.body.classList.toggle('max-level', levelInfo.level >= 14);

    // Fire engine level
    FireEngine.setLevel(levelInfo.level);

    // Level-up animation
    if (displayedLevel !== -1 && levelInfo.level > displayedLevel) {
      triggerLevelUpAnimation(levelInfo.title);
    }
    displayedLevel = levelInfo.level;
  }

  // ---- Count-up Animation ----
  function animateCountUp(element, target) {
    const duration = 1500;
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(from + (target - from) * eased);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  // ---- Level Up Animation ----
  function triggerLevelUpAnimation(title) {
    const level = getLevelForDays(calculateStreak((loadData() || getDefaultData()).startDate)).level;
    const duration = level >= 10 ? 4000 : level >= 7 ? 3500 : 2500;

    dom.levelUpTitle.textContent = title;
    dom.levelUpNotification.classList.add('active');
    dom.flameContainer.classList.add('level-up-pulse');

    // Screen flash for high levels
    if (level >= 5) {
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;z-index:999;pointer-events:none;background:' + FLAME_COLORS[level] + ';opacity:0.3;transition:opacity 1s ease;';
      document.body.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '0'; });
      setTimeout(() => flash.remove(), 1200);
    }

    setTimeout(() => {
      dom.levelUpNotification.classList.remove('active');
    }, duration);

    setTimeout(() => {
      dom.flameContainer.classList.remove('level-up-pulse');
    }, 1000);
  }

  // ---- Modal ----
  function openModal() {
    dom.resetModal.classList.add('active');
    dom.resetModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    dom.resetModal.classList.remove('active');
    dom.resetModal.setAttribute('aria-hidden', 'true');
  }

  // ---- Reset ----
  function resetStreak() {
    closeModal();

    // Extinguish animation
    FireEngine.extinguish(() => {
      const data = loadData() || getDefaultData();
      data.startDate = new Date().toISOString();
      data.lastResetTimestamp = new Date().toISOString();
      saveData(data);
      syncToCloud();

      displayedLevel = -1;

      // Brief pause, then re-init at level 0
      setTimeout(() => {
        updateUI(0, data, true);
        FireEngine.setLevel(0);
      }, 300);
    });
  }

  // ---- Toast ----
  let toastTimer = null;
  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove('active'), 2500);
  }

  // ---- Sync UI ----
  function openSyncModal() {
    const code = CloudSync.getSavedCode();
    if (code) {
      dom.syncUnlinked.style.display = 'none';
      dom.syncLinked.style.display = '';
      dom.syncCodeText.textContent = code;
      dom.syncStatus.textContent = '';
    } else {
      dom.syncUnlinked.style.display = '';
      dom.syncLinked.style.display = 'none';
      dom.syncError.textContent = '';
      dom.syncInput.value = '';
    }
    dom.syncModal.classList.add('active');
    dom.syncModal.setAttribute('aria-hidden', 'false');
  }

  function closeSyncModal() {
    dom.syncModal.classList.remove('active');
    dom.syncModal.setAttribute('aria-hidden', 'true');
  }

  async function handleGenerate() {
    const code = CloudSync.generateCode();
    const data = loadData() || getDefaultData();

    if (CloudSync.isConfigured()) {
      const { error } = await CloudSync.saveToCloud(code, data);
      if (error) {
        dom.syncError.textContent = 'Failed to save. Try again.';
        return;
      }
    }

    CloudSync.saveCode(code);
    showToast('Code generated — streak backed up');
    openSyncModal(); // refresh to linked state
  }

  async function handleRestore() {
    const raw = dom.syncInput.value.trim();
    const code = CloudSync.normalizeCode(raw);

    if (!code) {
      dom.syncError.textContent = 'Enter a valid 24-digit code.';
      return;
    }

    if (!CloudSync.isConfigured()) {
      dom.syncError.textContent = 'Supabase not configured.';
      return;
    }

    const { data: cloudData, error } = await CloudSync.loadFromCloud(code);
    if (error || !cloudData) {
      dom.syncError.textContent = 'Code not found. Check and try again.';
      return;
    }

    // Merge: take the longer streak, keep highest of both
    let localData = loadData() || getDefaultData();
    const localStreak = calculateStreak(localData.startDate);
    const cloudStreak = calculateStreak(cloudData.startDate);

    if (cloudStreak >= localStreak) {
      localData.startDate = cloudData.startDate;
    }
    localData.highestStreak = Math.max(localData.highestStreak, cloudData.highestStreak);
    localData.lastResetTimestamp = cloudData.lastResetTimestamp || localData.lastResetTimestamp;

    saveData(localData);
    CloudSync.saveCode(code);

    // Refresh UI
    displayedLevel = -1;
    const streak = calculateStreak(localData.startDate);
    updateUI(streak, localData, true);

    showToast('Streak restored successfully');
    openSyncModal(); // refresh to linked state
  }

  function handleCopy() {
    const code = dom.syncCodeText.textContent;
    navigator.clipboard.writeText(code).then(() => {
      showToast('Code copied to clipboard');
    }).catch(() => {
      // Fallback: select the text
      showToast('Copy the code manually');
    });
  }

  function handleDownload() {
    const code = dom.syncCodeText.textContent;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'goonfree-backup.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup code downloaded');
  }

  // ---- Levels Modal ----
  function openLevelsModal() {
    const data = loadData() || getDefaultData();
    const streak = calculateStreak(data.startDate);
    const currentLevel = getLevelForDays(streak).level;

    dom.levelsList.innerHTML = '';
    const nextLevel = currentLevel + 1;
    LEVELS.forEach((lvl) => {
      const row = document.createElement('div');
      let rowClass = 'level-row';
      if (lvl.level <= currentLevel) rowClass += ' unlocked';
      if (lvl.level === currentLevel) rowClass += ' current';
      if (lvl.level === nextLevel) rowClass += ' next';
      if (lvl.level > nextLevel) rowClass += ' locked';
      row.className = rowClass;

      const daysText = lvl.days === 0 ? 'Day 0' : lvl.days + ' days';
      row.innerHTML =
        '<span class="level-row-icon">' + lvl.icon + '</span>' +
        '<div class="level-row-info">' +
          '<span class="level-row-title">Lv. ' + lvl.level + ' — ' + lvl.title + '</span>' +
          '<span class="level-row-tier">' + (lvl.tier ? lvl.tier.split('-').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ') : '') + '</span>' +
        '</div>' +
        '<span class="level-row-days">' + daysText + '</span>';

      dom.levelsList.appendChild(row);
    });

    dom.levelsModal.classList.add('active');
    dom.levelsModal.setAttribute('aria-hidden', 'false');

    // Scroll current level into view
    const current = dom.levelsList.querySelector('.current');
    if (current) current.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function closeLevelsModal() {
    dom.levelsModal.classList.remove('active');
    dom.levelsModal.setAttribute('aria-hidden', 'true');
  }

  // ---- Quotes Modal ----
  let currentQuote = null;
  let quotesReady = false;

  async function openQuotesModal() {
    dom.quotesModal.classList.add('active');
    dom.quotesModal.setAttribute('aria-hidden', 'false');
    if (!quotesReady) {
      dom.quotesText.textContent = '...';
      dom.quotesAuthor.textContent = '';
      await QuotesEngine.fetchBatch();
      quotesReady = true;
    }
    showNextQuote();
  }

  function closeQuotesModal() {
    dom.quotesModal.classList.remove('active');
    dom.quotesModal.setAttribute('aria-hidden', 'true');
  }

  function renderCurrentQuote() {
    if (!currentQuote) {
      dom.quotesText.textContent = 'No more quotes to show.';
      dom.quotesAuthor.textContent = '';
      dom.quotesLike.style.display = 'none';
      return;
    }
    dom.quotesText.textContent = '\u201C' + currentQuote.text + '\u201D';
    dom.quotesAuthor.textContent = '\u2014 ' + currentQuote.author;
    dom.quotesLike.style.display = '';
    dom.quotesLike.innerHTML = QuotesEngine.isLiked(currentQuote.id) ? '&#9829;' : '&#9825;';
    dom.quotesLike.classList.toggle('liked', QuotesEngine.isLiked(currentQuote.id));
  }

  async function showNextQuote() {
    let quote = QuotesEngine.getNextFromPool();
    if (!quote) {
      // Pool exhausted, fetch new batch
      dom.quotesText.textContent = '...';
      dom.quotesAuthor.textContent = '';
      await QuotesEngine.fetchBatch();
      quote = QuotesEngine.getNextFromPool();
    }
    currentQuote = quote;
    renderCurrentQuote();
  }

  function toggleQuoteLike() {
    if (!currentQuote) return;
    const nowLiked = QuotesEngine.toggleLike(currentQuote.id);
    dom.quotesLike.innerHTML = nowLiked ? '&#9829;' : '&#9825;';
    dom.quotesLike.classList.toggle('liked', nowLiked);
    if (nowLiked) {
      setTimeout(() => showNextQuote(), 300);
    }
  }

  // ---- QOTD Popup ----
  async function showQotdPopup() {
    if (!QuotesEngine.hasLikedQuotes()) return;
    const quote = await QuotesEngine.getRandomLiked();
    if (!quote) return;

    dom.qotdText.textContent = '\u201C' + quote.text + '\u201D';
    dom.qotdAuthor.textContent = '\u2014 ' + quote.author;
    dom.qotdPopup.classList.add('active');
    dom.qotdPopup.setAttribute('aria-hidden', 'false');

    dom.qotdPopup.addEventListener('click', dismissQotd, { once: true });
  }

  function dismissQotd() {
    dom.qotdPopup.classList.remove('active');
    dom.qotdPopup.setAttribute('aria-hidden', 'true');
  }

  function handleUnlink() {
    CloudSync.clearCode();
    showToast('Unlinked — streak is local only');
    openSyncModal(); // refresh to unlinked state
  }

  // Sync to cloud (called after any data change)
  async function syncToCloud() {
    const code = CloudSync.getSavedCode();
    if (!code || !CloudSync.isConfigured()) return;
    const data = loadData();
    if (data) await CloudSync.saveToCloud(code, data);
  }

  // ---- Initialization ----
  function init() {
    cacheDom();

    // Load or create data
    let data = loadData();
    if (!data) {
      data = getDefaultData();
      saveData(data);
    }

    // Calculate current streak
    const streak = calculateStreak(data.startDate);

    // Update highest streak if needed
    if (streak > data.highestStreak) {
      data.highestStreak = streak;
      saveData(data);
    }

    // Initialize fire engine
    FireEngine.init(dom.canvas);
    FireEngine.start();

    // Set initial level without level-up animation
    const levelInfo = getLevelForDays(streak);
    displayedLevel = levelInfo.level;
    FireEngine.setLevel(levelInfo.level);

    // Update UI
    updateUI(streak, data, false);

    // Event listeners
    dom.resetBtn.addEventListener('click', openModal);
    dom.confirmReset.addEventListener('click', resetStreak);
    dom.cancelReset.addEventListener('click', closeModal);
    dom.modalBackdrop.addEventListener('click', closeModal);

    // Levels event listeners
    dom.levelsBtn.addEventListener('click', openLevelsModal);
    dom.levelsClose.addEventListener('click', closeLevelsModal);
    dom.levelsModalBackdrop.addEventListener('click', closeLevelsModal);

    // Sync event listeners
    dom.syncBtn.addEventListener('click', openSyncModal);
    dom.syncClose.addEventListener('click', closeSyncModal);
    dom.syncModalBackdrop.addEventListener('click', closeSyncModal);
    dom.syncGenerate.addEventListener('click', handleGenerate);
    dom.syncRestore.addEventListener('click', handleRestore);
    dom.syncCopy.addEventListener('click', handleCopy);
    dom.syncDownload.addEventListener('click', handleDownload);
    dom.syncUnlink.addEventListener('click', handleUnlink);
    dom.syncInput.addEventListener('input', () => {
      const digits = dom.syncInput.value.replace(/\D/g, '').slice(0, 24);
      const groups = digits.match(/.{1,6}/g) || [];
      dom.syncInput.value = groups.join('-');
    });
    dom.syncInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRestore();
    });

    // Quotes event listeners
    dom.quotesBtn.addEventListener('click', openQuotesModal);
    dom.quotesClose.addEventListener('click', closeQuotesModal);
    dom.quotesModalBackdrop.addEventListener('click', closeQuotesModal);
    dom.quotesNext.addEventListener('click', showNextQuote);
    dom.quotesPrev.addEventListener('click', showNextQuote);
    dom.quotesLike.addEventListener('click', toggleQuoteLike);

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeModal(); closeSyncModal(); closeLevelsModal(); closeQuotesModal(); dismissQotd(); }
    });

    // Arrow keys for quotes navigation
    document.addEventListener('keydown', (e) => {
      if (!dom.quotesModal.classList.contains('active')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') showNextQuote();
    });

    // Init cloud sync
    CloudSync.init();

    // Init quotes engine
    QuotesEngine.init();

    // Show QOTD popup
    showQotdPopup();

    // If linked, sync from cloud on load
    const savedCode = CloudSync.getSavedCode();
    if (savedCode && CloudSync.isConfigured()) {
      CloudSync.loadFromCloud(savedCode).then(({ data: cloudData }) => {
        if (cloudData) {
          let localData = loadData() || getDefaultData();
          const localStreak = calculateStreak(localData.startDate);
          const cloudStreak = calculateStreak(cloudData.startDate);
          if (cloudStreak > localStreak) {
            localData.startDate = cloudData.startDate;
          }
          localData.highestStreak = Math.max(localData.highestStreak, cloudData.highestStreak);
          saveData(localData);
          const newStreak = calculateStreak(localData.startDate);
          if (newStreak !== streak) {
            displayedLevel = -1;
            updateUI(newStreak, localData, true);
          }
        }
      });
    }

    // Periodic streak check (every minute) for day rollover
    setInterval(() => {
      const currentData = loadData();
      if (currentData) {
        const currentStreak = calculateStreak(currentData.startDate);
        const displayed = parseInt(dom.streakNumber.textContent, 10);
        if (currentStreak !== displayed) {
          updateUI(currentStreak, currentData, true);
        }
      }
    }, 60000);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
