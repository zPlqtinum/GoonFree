/* ============================================
   GOONFREE - Quotes Engine
   Supabase-powered quotes with like system
   ============================================ */

const QuotesEngine = (() => {
  const LIKED_KEY = 'goonFree_likedQuotes';
  let supabase = null;
  let pool = [];
  let poolIndex = 0;
  let fetching = false;

  function init() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') return false;
    supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return true;
  }

  function getLikedIds() {
    try {
      return JSON.parse(localStorage.getItem(LIKED_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLikedIds(ids) {
    localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
  }

  // Fetch a batch of 100 random quotes, excluding liked ones
  async function fetchBatch() {
    if (!supabase || fetching) return;
    fetching = true;

    const liked = getLikedIds();
    let query = supabase.rpc('get_random_quotes', { amount: 100, excluded: liked.length > 0 ? liked : [0] });

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      pool = data;
      poolIndex = 0;
    } else {
      // Fallback: fetch without RPC
      const { count } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        // Grab 100 random offsets
        const indices = new Set();
        while (indices.size < Math.min(100, count)) {
          indices.add(Math.floor(Math.random() * count));
        }

        const promises = [];
        for (const offset of indices) {
          promises.push(
            supabase.from('quotes').select('*').range(offset, offset).then(r => r.data?.[0]).catch(() => null)
          );
        }

        const results = (await Promise.all(promises)).filter(Boolean);
        // Filter out liked
        pool = results.filter(q => !liked.includes(q.id));
        if (pool.length === 0) pool = results; // if all liked, show anyway
        poolIndex = 0;
      }
    }

    fetching = false;
  }

  function getNextFromPool() {
    if (pool.length === 0) return null;
    if (poolIndex >= pool.length) {
      poolIndex = 0;
      return null; // signal to fetch new batch
    }
    return pool[poolIndex++];
  }

  function isLiked(id) {
    return getLikedIds().includes(id);
  }

  function toggleLike(id) {
    const ids = getLikedIds();
    const index = ids.indexOf(id);
    if (index === -1) {
      ids.push(id);
    } else {
      ids.splice(index, 1);
    }
    saveLikedIds(ids);
    return index === -1;
  }

  function hasLikedQuotes() {
    return getLikedIds().length > 0;
  }

  async function getRandomLiked() {
    const liked = getLikedIds();
    if (liked.length === 0 || !supabase) return null;
    const randomId = liked[Math.floor(Math.random() * liked.length)];
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', randomId)
      .single();
    return data || null;
  }

  return {
    init,
    fetchBatch,
    getNextFromPool,
    isLiked,
    toggleLike,
    hasLikedQuotes,
    getRandomLiked
  };
})();
