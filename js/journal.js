/* ============================================
   GOONFREE - Journal Module
   Local entries with optional Supabase sync
   ============================================ */

const Journal = (() => {
  const STORAGE_KEY = 'goonFree_journal';

  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function createEntry(streakDay) {
    const entries = getEntries();
    const now = new Date();
    const dateStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    const entry = {
      id: 'j_' + Date.now(),
      date: dateStr,
      title: 'Day ' + streakDay + ' - ' + String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getDate()).padStart(2, '0') + '/' + now.getFullYear(),
      content: '',
      updatedAt: now.toISOString()
    };

    entries.unshift(entry);
    saveEntries(entries);
    return entry;
  }

  function updateEntry(id, changes) {
    const entries = getEntries();
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) return null;

    if (changes.title !== undefined) entries[idx].title = changes.title;
    if (changes.content !== undefined) entries[idx].content = changes.content;
    entries[idx].updatedAt = new Date().toISOString();

    saveEntries(entries);
    return entries[idx];
  }

  function deleteEntry(id) {
    const entries = getEntries().filter(e => e.id !== id);
    saveEntries(entries);
  }

  function getEntry(id) {
    return getEntries().find(e => e.id === id) || null;
  }

  // Supabase sync
  async function syncToCloud(code) {
    if (!CloudSync.isConfigured() || !code) return;
    const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    const entries = getEntries();

    // Delete all entries for this code, then re-insert current ones
    await supabase.from('journal_entries').delete().eq('code', code);

    for (const entry of entries) {
      await supabase.from('journal_entries').insert({
        id: entry.id,
        code: code,
        date: entry.date,
        title: entry.title,
        content: entry.content,
        updated_at: entry.updatedAt
      });
    }
  }

  async function syncFromCloud(code) {
    if (!CloudSync.isConfigured() || !code) return;
    const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('code', code)
      .order('date', { ascending: false });

    if (error || !data) return;

    const local = getEntries();
    const localMap = {};
    local.forEach(e => { localMap[e.id] = e; });

    // Merge: cloud wins if newer
    data.forEach(cloud => {
      const localEntry = localMap[cloud.id];
      if (!localEntry || new Date(cloud.updated_at) > new Date(localEntry.updatedAt)) {
        localMap[cloud.id] = {
          id: cloud.id,
          date: cloud.date,
          title: cloud.title,
          content: cloud.content,
          updatedAt: cloud.updated_at
        };
      }
    });

    const merged = Object.values(localMap).sort((a, b) => b.date.localeCompare(a.date));
    saveEntries(merged);
  }

  return {
    getEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    syncToCloud,
    syncFromCloud
  };
})();
