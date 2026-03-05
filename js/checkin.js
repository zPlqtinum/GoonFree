/* ============================================
   GOONFREE - Daily Check-In System
   Opt-in accountability with 3-day miss reset
   ============================================ */

const CheckIn = (() => {
  const STORAGE_KEY = 'goonFree_checkin';

  function getData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function isFirstVisit() {
    return getData() === null;
  }

  function isEnabled() {
    const data = getData();
    return data && data.enabled === true;
  }

  function enable() {
    const data = getData() || {};
    data.enabled = true;
    if (!data.lastCheckIn) data.lastCheckIn = getTodayString();
    if (!data.history) data.history = [getTodayString()];
    saveData(data);
  }

  function disable() {
    const data = getData() || {};
    data.enabled = false;
    saveData(data);
  }

  function dismiss() {
    // User saw onboarding but chose "Maybe Later"
    saveData({ enabled: false, lastCheckIn: null, history: [] });
  }

  function getTodayString() {
    const now = new Date();
    return now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
  }

  function hasCheckedInToday() {
    const data = getData();
    if (!data || !data.lastCheckIn) return false;
    return data.lastCheckIn === getTodayString();
  }

  function checkIn(mood) {
    const data = getData() || { enabled: true, history: [] };
    const today = getTodayString();
    data.lastCheckIn = today;
    data.lastMood = mood || null;
    if (!data.history) data.history = [];
    // Remove old entry for today if exists
    data.history = data.history.filter(function(e) {
      return typeof e === 'string' ? e !== today : e.date !== today;
    });
    data.history.push({ date: today, mood: mood || null });
    // Keep last 30 entries
    if (data.history.length > 30) data.history = data.history.slice(-30);
    saveData(data);
  }

  function getTodayMood() {
    const data = getData();
    if (!data || data.lastCheckIn !== getTodayString()) return null;
    return data.lastMood || null;
  }

  function getTodayAttempts() {
    const data = getData();
    if (!data || !data.attempts) return 0;
    if (data.attempts.date !== getTodayString()) return 0;
    return data.attempts.count || 0;
  }

  function incrementAttempts() {
    const data = getData() || { enabled: true };
    const today = getTodayString();
    if (!data.attempts || data.attempts.date !== today) {
      data.attempts = { date: today, count: 0 };
    }
    data.attempts.count++;
    saveData(data);
  }

  // Returns number of days since last check-in (0 if today)
  function daysSinceLastCheckIn() {
    const data = getData();
    if (!data || !data.lastCheckIn) return 999;

    const last = new Date(data.lastCheckIn + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());

    const diff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // Check if streak should auto-reset (3+ missed days)
  function shouldAutoReset() {
    if (!isEnabled()) return false;
    return daysSinceLastCheckIn() >= 3;
  }

  return {
    isFirstVisit,
    isEnabled,
    enable,
    disable,
    dismiss,
    hasCheckedInToday,
    checkIn,
    getTodayMood,
    getTodayAttempts,
    incrementAttempts,
    daysSinceLastCheckIn,
    shouldAutoReset,
    getData
  };
})();
