/* ===== APP.JS — Main Controller (Phase 3 Upgrade) ===== */

/* ===========================
   PIN LOCK SCREEN
=========================== */
let pinBuffer = '';
let _unlocked = false;

function initLockScreen() {
  pinBuffer = '';
  updatePinDots();

  const hasLaunched = localStorage.getItem('bm90_launched');
  if (!hasLaunched) {
    // Very first launch — auto-unlock, set start date
    localStorage.setItem('bm90_launched', '1');
    DB.set(d => { if (!d.startDate) d.startDate = todayKey(); });
    doUnlock();
  } else {
    showLock();
  }
}

function showLock() {
  document.getElementById('lockScreen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function doUnlock() {
  _unlocked = true;
  document.getElementById('lockScreen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  initApp();
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pd' + i);
    if (!dot) continue;
    dot.classList.remove('filled', 'error');
    if (i < pinBuffer.length) dot.classList.add('filled');
  }
}

function pinError() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pd' + i);
    if (dot) { dot.classList.remove('filled'); dot.classList.add('error'); }
  }
  const wrap = document.getElementById('pinDisplay');
  if (wrap) {
    wrap.classList.add('pin-shake');
    setTimeout(() => { wrap.classList.remove('pin-shake'); }, 500);
  }
  const hint = document.getElementById('pinHint');
  if (hint) hint.textContent = 'Wrong PIN. Try again.';
  setTimeout(() => { pinBuffer = ''; updatePinDots(); }, 600);
}

function handlePinKey(n) {
  if (n === 'clear') { pinBuffer = ''; updatePinDots(); return; }
  if (n === 'back')  { pinBuffer = pinBuffer.slice(0, -1); updatePinDots(); return; }
  if (pinBuffer.length >= 4) return;
  pinBuffer += String(n);
  updatePinDots();
  if (pinBuffer.length === 4) {
    setTimeout(verifyPin, 200);
  }
}

function verifyPin() {
  const stored = DB.get().pin || '0000';
  if (pinBuffer === stored) {
    document.getElementById('pinHint').textContent = '';
    doUnlock();
  } else {
    pinError();
  }
}

// Wire numpad buttons
document.querySelectorAll('.num-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    handlePinKey(this.dataset.n);
  });
});

/* ===========================
   SCREEN NAVIGATION (Phase 3 — Extended)
=========================== */
const SCREENS = {
  Dashboard: { el: 'screenDashboard', title: 'DASHBOARD',       render: renderDashboard },
  Habits:    { el: 'screenHabits',    title: 'DAILY HABITS',    render: renderHabits },
  Body:      { el: 'screenBody',      title: 'BODY TRACKER',    render: renderBodyScreen },
  Workout:   { el: 'screenWorkout',   title: 'WORKOUT TRACKER', render: renderWorkoutScreen },
  Money:     { el: 'screenMoney',     title: 'MONEY TRACKER',   render: renderMoneyScreen },
  Calorie:   { el: 'screenCalorie',   title: 'CALORIE TRACKER', render: renderCalorieScreen },
  Mind:      { el: 'screenMind',      title: 'MIND TRACKER',    render: renderMindScreen },
  Weekly:    { el: 'screenWeekly',    title: 'WEEKLY REVIEW',   render: renderWeeklyScreen },
  Progress:  { el: 'screenProgress',  title: '90-DAY PROGRESS', render: renderProgressScreen },
  Analytics: { el: 'screenAnalytics', title: 'ANALYTICS',       render: () => { document.getElementById('analyticsDate').textContent = formatDate(todayKey()); renderAnalyticsScreen(); initAnalyticsFilters(); } },
  Profile:   { el: 'screenProfile',   title: 'NINJA PROFILE',   render: () => { renderProfileScreen(); updateAuthUI(!!currentUser); } },
};

let currentScreen = 'Dashboard';

function navigateTo(name) {
  if (!SCREENS[name]) return;
  Object.values(SCREENS).forEach(s => {
    const el = document.getElementById(s.el);
    if (el) el.classList.remove('active');
  });
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  currentScreen = name;
  const screenEl = document.getElementById(SCREENS[name].el);
  if (screenEl) screenEl.classList.add('active');
  document.getElementById('topBarTitle').textContent = SCREENS[name].title;
  const navBtn = document.getElementById('nav' + name);
  if (navBtn) navBtn.classList.add('active');

  try { SCREENS[name].render(); } catch(e) { console.error('Render error:', name, e); }

  const scrollEl = screenEl ? screenEl.querySelector('.scroll-area') : null;
  if (scrollEl) scrollEl.scrollTop = 0;
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', function() { navigateTo(this.dataset.screen); });
});

const goHabitsBtn = document.getElementById('goHabitsFromDash');
if (goHabitsBtn) goHabitsBtn.addEventListener('click', () => navigateTo('Habits'));

/* ===========================
   SWIPE NAVIGATION
=========================== */
let _swipeX = 0, _swipeY = 0;
const appEl = document.getElementById('app');

appEl.addEventListener('touchstart', e => {
  _swipeX = e.touches[0].clientX;
  _swipeY = e.touches[0].clientY;
}, { passive: true });

appEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - _swipeX;
  const dy = e.changedTouches[0].clientY - _swipeY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 70) {
    const keys = Object.keys(SCREENS);
    const idx  = keys.indexOf(currentScreen);
    if (dx < 0 && idx < keys.length - 1) navigateTo(keys[idx + 1]);
    if (dx > 0 && idx > 0)               navigateTo(keys[idx - 1]);
  }
}, { passive: true });

/* ===========================
   NOTIFICATIONS
=========================== */
function scheduleNotifications() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(p => {
    if (p !== 'granted') return;
    setInterval(() => {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes();
      if (h === 6 && m === 0) {
        new Notification('🔥 Beast Mode 90', { body: 'WIN THE DAY. Get up and attack your habits!' });
      }
      if (h === 21 && m === 30) {
        const score = HABITS.filter(hh => (DB.get().habits[todayKey()] || {})[hh.id]).length;
        new Notification('📋 Beast Mode 90', { body: `Log your score! ${score}/10 habits done today.` });
      }
    }, 60000);
  }).catch(() => {});
}

/* ===========================
   VISIBILITY RE-LOCK
=========================== */
let _hiddenAt = null;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    _hiddenAt = Date.now();
  } else if (_unlocked && _hiddenAt && Date.now() - _hiddenAt > 5 * 60 * 1000) {
    _unlocked = false;
    pinBuffer  = '';
    updatePinDots();
    document.getElementById('pinHint').textContent = '';
    showLock();
    _hiddenAt = null;
  } else {
    _hiddenAt = null;
  }
});

/* ===========================
   INIT (Phase 3 Enhanced)
=========================== */
function initApp() {
  initTheme();
  navigateTo('Dashboard');
  scheduleNotifications();

  // Initialize Supabase
  try { initSupabase(); } catch(e) { console.log('Supabase offline mode'); }

  // Check achievements on load
  setTimeout(() => { try { checkAchievements(); } catch(e) {} }, 2000);

  // Periodic achievement check
  setInterval(() => { try { checkAchievements(); } catch(e) {} }, 60000);
}

// Boot
window.addEventListener('DOMContentLoaded', initLockScreen);
