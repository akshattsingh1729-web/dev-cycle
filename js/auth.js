/**
 * DEV CYCLE - Centralized Authentication Service
 * Manages Supabase Auth, Session Lifecycle, Form Validation, Protected Routes, and UI Synchronization.
 */

class DevCycleAuth {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
    this.isInitialized = false;
    this.listeners = [];
    this.init();
  }

  /**
   * Initializes auth state, registers listeners, and synchronizes the UI.
   */
  async init() {
    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!supabase) {
      console.warn('[DevCycleAuth] Supabase client not ready yet, retrying...');
      setTimeout(() => this.init(), 150);
      return;
    }

    try {
      // 1. Get initial active session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('[DevCycleAuth] Session check returned error:', error.message);
      }
      this.currentSession = session;
      this.currentUser = session?.user || null;
      this.isInitialized = true;

      // 2. Setup auth state change listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[DevCycleAuth] Auth event: ${event}`);
        this.currentSession = session;
        this.currentUser = session?.user || null;

        this.notifyListeners(event, session);
        this.syncNavbarAuth();

        if (event === 'SIGNED_OUT') {
          sessionStorage.removeItem('devcycle_auth_redirect');
        }
      });

      // 3. Sync UI with current auth state
      this.syncNavbarAuth();
      this.notifyListeners('INITIALIZED', this.currentSession);
    } catch (err) {
      console.error('[DevCycleAuth] Failed to initialize session:', err);
      this.isInitialized = true;
      this.syncNavbarAuth();
    }
  }

  getClient() {
    const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!client) {
      throw new Error('Supabase client is not configured. Please check your Supabase project settings.');
    }
    return client;
  }

  /**
   * Add listener for auth events
   */
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    // If already initialized, call immediately with current state
    if (this.isInitialized) {
      callback('CURRENT_STATE', this.currentSession);
    }
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(event, session) {
    this.listeners.forEach(cb => {
      try {
        cb(event, session);
      } catch (err) {
        console.error('[DevCycleAuth] Listener error:', err);
      }
    });
  }

  /**
   * Helper: Wait until initial session check finishes
   */
  async waitForInit() {
    if (this.isInitialized) return;
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (this.isInitialized) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Password strength evaluator
   */
  checkPasswordStrength(password) {
    if (!password) {
      return { score: 0, label: 'Empty', color: '#64748b', checks: {} };
    }

    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    let passed = 0;
    if (checks.length) passed++;
    if (checks.lowercase && checks.uppercase) passed++;
    if (checks.number) passed++;
    if (checks.special) passed++;

    let label = 'Weak';
    let color = '#ef4444'; // Red

    if (passed === 2) {
      label = 'Fair';
      color = '#f59e0b'; // Amber
    } else if (passed === 3) {
      label = 'Good';
      color = '#06b6d4'; // Cyan
    } else if (passed >= 4) {
      label = 'Strong';
      color = '#10b981'; // Lime
    }

    return { score: passed, label, color, checks };
  }

  /**
   * Sign Up with Email and Password
   */
  async signUp({ email, password, fullName }) {
    const supabase = this.getClient();

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    try {
      const origin = window.location.origin;
      const emailRedirectTo = `${origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName ? fullName.trim() : '',
            display_name: fullName ? fullName.trim() : email.split('@')[0]
          },
          emailRedirectTo: emailRedirectTo
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required (session is null when unverified)
      const isEmailConfirmationRequired = data.user && !data.session;

      return {
        success: true,
        data,
        isEmailConfirmationRequired,
        message: isEmailConfirmationRequired
          ? 'Registration successful! Please check your email for a verification link.'
          : 'Account created successfully! Welcome to Dev Cycle.'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred during registration. Please try again.'
      };
    }
  }

  /**
   * Sign In with Email and Password
   */
  async signIn({ email, password }) {
    const supabase = this.getClient();

    if (!email || !password) {
      return { success: false, error: 'Please enter both your email address and password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        let errorMsg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMsg = 'Incorrect email or password. Please verify your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg = 'Please verify your email address before signing in. Check your inbox for the confirmation link.';
        }
        return { success: false, error: errorMsg };
      }

      this.currentSession = data.session;
      this.currentUser = data.user;
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Unable to connect to authentication server. Please check your connection.'
      };
    }
  }

  /**
   * Sign In with Google OAuth
   */
  async signInWithGoogle(customRedirect = null) {
    const supabase = this.getClient();

    try {
      const origin = window.location.origin;
      const redirectTo = customRedirect || `${origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to initiate Google authentication.' };
    }
  }

  /**
   * Request Password Reset Email
   */
  async resetPasswordForEmail(email) {
    const supabase = this.getClient();

    if (!email) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/reset-password`;

      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectTo
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data,
        message: 'Password reset link sent! Check your inbox for instructions to set a new password.'
      };
    } catch (err) {
      return { success: false, error: err.message || 'Unable to send password reset email.' };
    }
  }

  /**
   * Update Password (e.g. from /reset-password or profile security)
   */
  async updatePassword(newPassword) {
    const supabase = this.getClient();

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, message: 'Password updated successfully!' };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update password.' };
    }
  }

  /**
   * Update Profile Details (Full Name, Display Name, Avatar)
   */
  async updateProfile({ fullName, avatarUrl }) {
    const supabase = this.getClient();

    try {
      const updates = {};
      if (fullName !== undefined) {
        updates.full_name = fullName;
        updates.display_name = fullName;
      }
      if (avatarUrl !== undefined) {
        updates.avatar_url = avatarUrl;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        return { success: false, error: error.message };
      }

      this.currentUser = data.user;
      this.syncNavbarAuth();
      return { success: true, data, message: 'Profile updated successfully!' };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update profile.' };
    }
  }

  /**
   * Sign Out
   */
  async signOut(redirectTo = '/login') {
    const supabase = this.getClient();

    try {
      await supabase.auth.signOut();
      this.currentSession = null;
      this.currentUser = null;
      this.syncNavbarAuth();

      if (window.store && typeof window.store.showToast === 'function') {
        window.store.showToast('You have been logged out successfully.', 'info');
      }

      if (redirectTo) {
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 300);
      }

      return { success: true };
    } catch (err) {
      console.error('[DevCycleAuth] Error signing out:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Protected Route Guard: Restricts page to authenticated users
   */
  async requireAuth({ redirectTo = '/login' } = {}) {
    await this.waitForInit();

    if (!this.currentUser) {
      // Save original URL to redirect back after sign in
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      sessionStorage.setItem('devcycle_auth_redirect', currentUrl);

      const target = `${redirectTo}?redirect=${encodeURIComponent(currentUrl)}`;
      window.location.replace(target);
      return false;
    }

    // Unhide page content if protected loader was shown
    const authLoader = document.getElementById('auth-guard-loader');
    if (authLoader) {
      authLoader.style.opacity = '0';
      setTimeout(() => authLoader.remove(), 250);
    }

    const protectedContainer = document.getElementById('protected-page-content');
    if (protectedContainer) {
      protectedContainer.style.display = 'block';
      protectedContainer.classList.add('fade-in');
    }

    return true;
  }

  /**
   * Guest Guard: Redirects logged-in users away from /login and /signup
   */
  async requireGuest({ defaultRedirect = '/dashboard' } = {}) {
    await this.waitForInit();

    if (this.currentUser) {
      // Check for query param or saved redirect
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');
      const savedRedirect = sessionStorage.getItem('devcycle_auth_redirect');
      const target = redirectParam || savedRedirect || defaultRedirect;

      sessionStorage.removeItem('devcycle_auth_redirect');
      window.location.replace(target);
      return false;
    }

    // Unhide guest page content
    const authLoader = document.getElementById('auth-guard-loader');
    if (authLoader) {
      authLoader.style.opacity = '0';
      setTimeout(() => authLoader.remove(), 250);
    }

    const guestContainer = document.getElementById('guest-page-content');
    if (guestContainer) {
      guestContainer.style.display = 'block';
    }

    return true;
  }

  /**
   * Synchronize the Navbar across all pages with user session state
   */
  syncNavbarAuth() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    let accountBtnWrap = document.getElementById('nav-auth-container');
    if (!accountBtnWrap) {
      accountBtnWrap = document.createElement('div');
      accountBtnWrap.id = 'nav-auth-container';
      accountBtnWrap.className = 'nav-auth-wrapper';

      // Insert before mobile toggle or at the end
      const mobileToggle = document.getElementById('btn-mobile-nav-toggle');
      if (mobileToggle) {
        navActions.insertBefore(accountBtnWrap, mobileToggle);
      } else {
        navActions.appendChild(accountBtnWrap);
      }
    }

    if (this.currentUser) {
      // Logged in state: Show user badge with dropdown
      const metadata = this.currentUser.user_metadata || {};
      const displayName = metadata.full_name || metadata.display_name || this.currentUser.email.split('@')[0];
      const initials = displayName.slice(0, 2).toUpperCase();
      const avatarUrl = metadata.avatar_url;

      accountBtnWrap.innerHTML = `
        <div class="user-menu-dropdown-wrap" id="user-menu-dropdown-wrap">
          <button class="nav-user-pill-btn" id="btn-user-dropdown-toggle" title="My Account (${displayName})">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="${displayName}" class="user-avatar-img">`
                : `<span class="user-avatar-initials">${initials}</span>`
            }
            <span class="user-display-name">${displayName}</span>
            <svg class="chevron-down-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          <div class="user-dropdown-menu" id="user-nav-dropdown-menu">
            <div class="user-dropdown-header">
              <div class="user-menu-avatar-large">
                ${
                  avatarUrl
                    ? `<img src="${avatarUrl}" alt="${displayName}" class="user-avatar-img">`
                    : `<span class="user-avatar-initials">${initials}</span>`
                }
              </div>
              <div class="user-menu-info">
                <div class="user-menu-name">${displayName}</div>
                <div class="user-menu-email">${this.currentUser.email}</div>
                <span class="user-verified-badge">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Verified Member
                </span>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <ul class="user-dropdown-links">
              <li>
                <a href="/dashboard" class="user-menu-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Showroom Dashboard
                </a>
              </li>
              <li>
                <a href="/profile" class="user-menu-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  My Profile &amp; Security
                </a>
              </li>
            </ul>
            <div class="dropdown-divider"></div>
            <button class="user-menu-logout-btn" id="btn-nav-logout">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      `;

      // Toggle dropdown on click
      const dropdownWrap = document.getElementById('user-menu-dropdown-wrap');
      const toggleBtn = document.getElementById('btn-user-dropdown-toggle');
      if (toggleBtn && dropdownWrap) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdownWrap.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
          if (!dropdownWrap.contains(e.target)) {
            dropdownWrap.classList.remove('open');
          }
        });
      }

      // Logout handler
      const logoutBtn = document.getElementById('btn-nav-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          this.signOut('/login');
        });
      }
    } else {
      // Logged out state: Show sign-in button
      accountBtnWrap.innerHTML = `
        <a href="/login" class="btn-nav-auth" id="btn-nav-login" title="Sign In or Register">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>SIGN IN</span>
        </a>
      `;
    }

    // Sync Mobile Navigation Drawer if present
    const mobileDrawerBody = document.querySelector('#mobile-nav-drawer .drawer-body');
    if (mobileDrawerBody) {
      let mobileAuthSection = document.getElementById('mobile-auth-links');
      if (!mobileAuthSection) {
        mobileAuthSection = document.createElement('div');
        mobileAuthSection.id = 'mobile-auth-links';
        mobileAuthSection.style.borderTop = '1px solid var(--border-subtle)';
        mobileAuthSection.style.paddingTop = '1.2rem';
        mobileAuthSection.style.marginTop = '1.2rem';

        const linksList = mobileDrawerBody.querySelector('.mega-links-list');
        if (linksList) {
          linksList.parentNode.insertBefore(mobileAuthSection, linksList.nextSibling);
        } else {
          mobileDrawerBody.appendChild(mobileAuthSection);
        }
      }

      if (this.currentUser) {
        const metadata = this.currentUser.user_metadata || {};
        const displayName = metadata.full_name || metadata.display_name || this.currentUser.email;
        mobileAuthSection.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
            <div class="user-avatar-initials">${displayName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div style="font-weight:700; color:#fff;">${displayName}</div>
              <div style="font-size:0.75rem; color:var(--metal-slate);">${this.currentUser.email}</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.6rem;">
            <a href="/dashboard" class="btn-secondary" style="text-align:center; padding:0.6rem;">MY DASHBOARD</a>
            <a href="/profile" class="btn-secondary" style="text-align:center; padding:0.6rem;">MY PROFILE</a>
            <button class="btn-secondary" id="mobile-logout-btn" style="color:#ef4444; border-color:rgba(239,68,68,0.3); padding:0.6rem;">LOG OUT</button>
          </div>
        `;
        const mobileLogout = document.getElementById('mobile-logout-btn');
        if (mobileLogout) {
          mobileLogout.addEventListener('click', () => this.signOut('/login'));
        }
      } else {
        mobileAuthSection.innerHTML = `
          <div style="display:flex; gap:0.8rem;">
            <a href="/login" class="btn-primary" style="flex:1; text-align:center; padding:0.6rem;">SIGN IN</a>
            <a href="/signup" class="btn-secondary" style="flex:1; text-align:center; padding:0.6rem;">REGISTER</a>
          </div>
        `;
      }
    }
  }
}

// Global Auth Instance
window.devAuth = new DevCycleAuth();
