/**
 * DEV CYCLE - Supabase Configuration Provider
 * Supports environment variables (.env via window.__ENV__ or import.meta.env),
 * local overrides, and runtime updates.
 */

(function () {
  // Verified real Supabase project credentials for DEV CYCLE
  const DEFAULT_CONFIG = {
    url: 'https://wzjqntgujuptcfxklcxt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6anFudGd1anVwdGNmeGtsY3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzk5MDUsImV4cCI6MjEwNzY1NTkwNX0.T3BZ_QPrXUcww0nByZLWxa-hB6dhH7yqkH9ItWPQFyc'
  };

  const STORAGE_KEY = 'devcycle_supabase_custom_config_v1';

  function getEnvConfig() {
    // 1. Check window.__ENV__ (injected dynamically from .env by server)
    if (typeof window !== 'undefined' && window.__ENV__) {
      const url = window.__ENV__.VITE_SUPABASE_URL;
      const anonKey = window.__ENV__.VITE_SUPABASE_ANON_KEY;
      if (url && anonKey) {
        return { url: url.trim(), anonKey: anonKey.trim() };
      }
    }

    // 2. Check process.env (Node/Webpack environments)
    if (typeof process !== 'undefined' && process.env) {
      const url = process.env.VITE_SUPABASE_URL;
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
      if (url && anonKey) {
        return { url: url.trim(), anonKey: anonKey.trim() };
      }
    }

    return null;
  }

  function getSavedConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Auto-heal any stale typo from previous versions
        if (parsed.url && parsed.url.includes('wzjntgujuptcfxklcxt')) {
          parsed.url = parsed.url.replace('wzjntgujuptcfxklcxt', 'wzjqntgujuptcfxklcxt');
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        if (parsed.url && parsed.anonKey) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Supabase Config] Failed to read from localStorage:', e);
    }
    return null;
  }

  // Priority order: 1) LocalStorage custom override, 2) Environment variables (.env), 3) DEFAULT_CONFIG
  const activeConfig = getSavedConfig() || getEnvConfig() || { ...DEFAULT_CONFIG };

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
      const envCfg = getEnvConfig();
      activeConfig.url = envCfg?.url || DEFAULT_CONFIG.url;
      activeConfig.anonKey = envCfg?.anonKey || DEFAULT_CONFIG.anonKey;
      window.dispatchEvent(new CustomEvent('supabase:config_changed', { detail: activeConfig }));
    }
  };
})();
