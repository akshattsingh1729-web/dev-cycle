/**
 * DEV CYCLE - Supabase Configuration Provider
 * Supports environment variables, local overrides, and runtime updates.
 */

(function () {
  const DEFAULT_CONFIG = {
    url: 'https://wzjntgujuptcfxklcxt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6anFudGd1anVwdGNmeGtsY3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzk5MDUsImV4cCI6MjEwNzY1NTkwNX0.T3BZ_QPrXUcww0nByZLWxa-hB6dhH7yqkH9ItWPQFyc'
  };

  const STORAGE_KEY = 'devcycle_supabase_custom_config_v1';

  function getSavedConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Supabase Config] Failed to read from localStorage:', e);
    }
    return null;
  }

  const activeConfig = getSavedConfig() || { ...DEFAULT_CONFIG };

  window.__SUPABASE_CONFIG__ = {
    get url() {
      return activeConfig.url;
    },
    get anonKey() {
      return activeConfig.anonKey;
    },
    isDefault() {
      return !localStorage.getItem(STORAGE_KEY);
    },
    save(newUrl, newAnonKey) {
      if (!newUrl || !newAnonKey) {
        throw new Error('Both URL and anon key are required.');
      }
      activeConfig.url = newUrl.trim();
      activeConfig.anonKey = newAnonKey.trim();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeConfig));
      window.dispatchEvent(new CustomEvent('supabase:config_changed', { detail: activeConfig }));
    },
    resetToDefault() {
      localStorage.removeItem(STORAGE_KEY);
      activeConfig.url = DEFAULT_CONFIG.url;
      activeConfig.anonKey = DEFAULT_CONFIG.anonKey;
      window.dispatchEvent(new CustomEvent('supabase:config_changed', { detail: activeConfig }));
    }
  };
})();
