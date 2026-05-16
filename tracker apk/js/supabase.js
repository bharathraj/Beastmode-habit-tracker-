/* ===== SUPABASE.JS — Supabase Integration Layer ===== */
/* 
 * Supabase provides:
 * - User authentication (email/password + Google OAuth)
 * - Cloud data persistence
 * - Realtime-ready architecture
 * 
 * Tables needed in Supabase:
 * - users, habits, workouts, expenses, achievements, streaks, beast_scores, xp_progress
 * 
 * SETUP: Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values.
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;
let currentUser = null;
let syncEnabled = false;

/* ─── Initialize Supabase ─────────────────────── */
function initSupabase() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.log('⚠️ Supabase not configured. Running in offline mode.');
    syncEnabled = false;
    return;
  }

  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase client initialized');
      checkSession();
    }
  } catch (e) {
    console.warn('Supabase init failed, running offline:', e);
    syncEnabled = false;
  }
}

/* ─── Auth: Check Session ─────────────────────── */
async function checkSession() {
  if (!supabaseClient) return;

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      currentUser = session.user;
      syncEnabled = true;
      updateAuthUI(true);
      syncFromCloud();
    }
  } catch (e) {
    console.warn('Session check failed:', e);
  }
}

/* ─── Auth: Sign Up ───────────────────────────── */
async function signUpWithEmail(email, password) {
  if (!supabaseClient) { showToast('⚠️ Supabase not configured'); return; }

  showLoadingState(true);
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    currentUser = data.user;
    syncEnabled = true;
    showToast('✅ Account created! Check your email to verify.');
    updateAuthUI(true);
    await syncToCloud();
  } catch (e) {
    showToast('❌ ' + e.message);
  } finally {
    showLoadingState(false);
  }
}

/* ─── Auth: Sign In ───────────────────────────── */
async function signInWithEmail(email, password) {
  if (!supabaseClient) { showToast('⚠️ Supabase not configured'); return; }

  showLoadingState(true);
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    currentUser = data.user;
    syncEnabled = true;
    showToast('✅ Welcome back!');
    updateAuthUI(true);
    await syncFromCloud();
  } catch (e) {
    showToast('❌ ' + e.message);
  } finally {
    showLoadingState(false);
  }
}

/* ─── Auth: Google Sign In ────────────────────── */
async function signInWithGoogle() {
  if (!supabaseClient) { showToast('⚠️ Supabase not configured'); return; }

  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  } catch (e) {
    showToast('❌ ' + e.message);
  }
}

/* ─── Auth: Sign Out ──────────────────────────── */
async function signOut() {
  if (!supabaseClient) return;

  try {
    await supabaseClient.auth.signOut();
    currentUser = null;
    syncEnabled = false;
    updateAuthUI(false);
    showToast('Signed out');
  } catch (e) {
    showToast('❌ Sign out failed');
  }
}

/* ─── Sync: Push to Cloud ─────────────────────── */
async function syncToCloud() {
  if (!supabaseClient || !currentUser || !syncEnabled) return;

  const d = DB.get();
  const userId = currentUser.id;

  try {
    const payload = {
      user_id: userId,
      data: JSON.stringify(d),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseClient
      .from('user_data')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) throw error;
    console.log('☁️ Data synced to cloud');
  } catch (e) {
    console.warn('Sync to cloud failed:', e);
  }
}

/* ─── Sync: Pull from Cloud ───────────────────── */
async function syncFromCloud() {
  if (!supabaseClient || !currentUser || !syncEnabled) return;

  try {
    const { data, error } = await supabaseClient
      .from('user_data')
      .select('data, updated_at')
      .eq('user_id', currentUser.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data && data.data) {
      const cloudData = JSON.parse(data.data);
      const localData = DB.get();

      // Merge strategy: cloud wins if newer, but preserve local-only fields
      const localTimestamp = localData._lastSync || 0;
      const cloudTimestamp = new Date(data.updated_at).getTime();

      if (cloudTimestamp > localTimestamp) {
        // Cloud is newer - merge
        const merged = { ...DB.defaults(), ...cloudData, ...{ _lastSync: Date.now() } };
        DB._cache = merged;
        DB.save(merged);
        console.log('☁️ Synced from cloud');
        showToast('☁️ Data synced from cloud');
      }
    } else {
      // No cloud data - push local
      await syncToCloud();
    }
  } catch (e) {
    console.warn('Sync from cloud failed:', e);
  }
}

/* ─── Auto-sync on data changes ───────────────── */
let _syncDebounce = null;
function scheduleSyncToCloud() {
  if (!syncEnabled) return;
  clearTimeout(_syncDebounce);
  _syncDebounce = setTimeout(syncToCloud, 5000); // Debounce 5s
}

/* ─── UI Helpers ──────────────────────────────── */
function updateAuthUI(loggedIn) {
  const authSection = document.getElementById('authSection');
  const syncBadge = document.getElementById('syncBadge');

  if (authSection) {
    if (loggedIn && currentUser) {
      authSection.innerHTML = `
        <div class="auth-logged-in">
          <span class="auth-email">${currentUser.email || 'Google User'}</span>
          <span class="auth-sync-status">☁️ Cloud Sync Active</span>
          <button class="btn-secondary" id="syncNowBtn">🔄 SYNC NOW</button>
          <button class="btn-ghost" id="signOutBtn">SIGN OUT</button>
        </div>
      `;
      document.getElementById('syncNowBtn')?.addEventListener('click', async () => {
        showToast('Syncing...');
        await syncToCloud();
        showToast('✅ Synced!');
      });
      document.getElementById('signOutBtn')?.addEventListener('click', signOut);
    } else {
      authSection.innerHTML = `
        <div class="auth-form">
          <input type="email" class="form-input" id="authEmail" placeholder="Email" />
          <input type="password" class="form-input" id="authPassword" placeholder="Password" />
          <button class="btn-primary" id="authSignInBtn">SIGN IN</button>
          <button class="btn-secondary" id="authSignUpBtn">CREATE ACCOUNT</button>
          <div class="auth-divider"><span>or</span></div>
          <button class="btn-google" id="authGoogleBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            CONTINUE WITH GOOGLE
          </button>
        </div>
      `;
      document.getElementById('authSignInBtn')?.addEventListener('click', () => {
        const email = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPassword').value;
        if (!email || !pass) { showToast('⚠️ Enter email and password'); return; }
        signInWithEmail(email, pass);
      });
      document.getElementById('authSignUpBtn')?.addEventListener('click', () => {
        const email = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPassword').value;
        if (!email || !pass) { showToast('⚠️ Enter email and password'); return; }
        if (pass.length < 6) { showToast('⚠️ Password must be at least 6 characters'); return; }
        signUpWithEmail(email, pass);
      });
      document.getElementById('authGoogleBtn')?.addEventListener('click', signInWithGoogle);
    }
  }

  if (syncBadge) {
    syncBadge.style.display = loggedIn ? 'inline-flex' : 'none';
  }
}

function showLoadingState(show) {
  const loader = document.getElementById('globalLoader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

/* ─── Enhanced DB.set with auto-sync ──────────── */
const _originalDBSet = DB.set.bind(DB);
DB.set = function(updater) {
  _originalDBSet(updater);
  scheduleSyncToCloud();
};
