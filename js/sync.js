/* ============================================
   GOONFREE — Cloud Sync Module
   Recovery code + Supabase persistence
   ============================================ */

const CloudSync = (() => {
  let supabase = null;
  const CODE_STORAGE_KEY = 'goonFree_code';

  function init() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' ||
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
      console.warn('Supabase not configured — cloud sync disabled.');
      return false;
    }
    supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return true;
  }

  function isConfigured() {
    return supabase !== null;
  }

  // Generate a 24-digit recovery code: XXXXXX-XXXXXX-XXXXXX-XXXXXX
  function generateCode() {
    const groups = [];
    for (let g = 0; g < 4; g++) {
      let chunk = '';
      for (let i = 0; i < 6; i++) {
        chunk += Math.floor(Math.random() * 10);
      }
      groups.push(chunk);
    }
    return groups.join('-');
  }

  // Normalize user input (strip spaces, add dashes if missing)
  function normalizeCode(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 24) return null;
    return `${digits.slice(0,6)}-${digits.slice(6,12)}-${digits.slice(12,18)}-${digits.slice(18,24)}`;
  }

  function getSavedCode() {
    return localStorage.getItem(CODE_STORAGE_KEY);
  }

  function saveCode(code) {
    localStorage.setItem(CODE_STORAGE_KEY, code);
  }

  function clearCode() {
    localStorage.removeItem(CODE_STORAGE_KEY);
  }

  // Save streak data to Supabase (upsert)
  async function saveToCloud(code, data) {
    if (!supabase) return { error: 'Not configured' };

    // Delete existing row first (ignore error if it doesn't exist)
    await supabase.from('streaks').delete().eq('code', code);

    const { error } = await supabase
      .from('streaks')
      .insert({
        code: code,
        start_date: data.startDate,
        highest_streak: data.highestStreak,
        last_reset_timestamp: data.lastResetTimestamp,
        updated_at: new Date().toISOString()
      });

    return { error };
  }

  // Load streak data from Supabase by code
  async function loadFromCloud(code) {
    if (!supabase) return { data: null, error: 'Not configured' };

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) return { data: null, error: error || 'Not found' };

    return {
      data: {
        startDate: data.start_date,
        highestStreak: data.highest_streak,
        lastResetTimestamp: data.last_reset_timestamp
      },
      error: null
    };
  }

  return {
    init,
    isConfigured,
    generateCode,
    normalizeCode,
    getSavedCode,
    saveCode,
    clearCode,
    saveToCloud,
    loadFromCloud
  };
})();
