/**
 * DEV CYCLE - Central Supabase Client Initializer
 * Reusable Supabase client following official @supabase/supabase-js conventions.
 */

(function () {
  let clientInstance = null;

  function initClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      console.error('[DEV CYCLE] Supabase JS library not loaded. Make sure js/libs/supabase.js or CDN is included.');
      return null;
    }

    const config = window.__SUPABASE_CONFIG__ || {
      url: '',
      anonKey: ''
    };

    if (!config.url || !config.anonKey) {
      console.warn('[DEV CYCLE] Supabase URL or Anon Key is missing.');
      return null;
    }

    try {
      clientInstance = window.supabase.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          flowType: 'pkce'
        }
      });
      window.supabaseClient = clientInstance;
      return clientInstance;
    } catch (err) {
      console.error('[DEV CYCLE] Failed to initialize Supabase client:', err);
      return null;
    }
  }

  // Auto initialize when DOM and libraries are ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initClient();
    });
  } else {
    initClient();
  }

  // Re-initialize if configuration is updated
  window.addEventListener('supabase:config_changed', () => {
    initClient();
  });

  window.getSupabaseClient = function () {
    if (!clientInstance) {
      clientInstance = initClient();
    }
    return clientInstance;
  };
})();
