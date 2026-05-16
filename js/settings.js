/* ===== SETTINGS.JS ===== */

function openSettings() {
  const d = DB.get();
  document.getElementById('startDateInput').value = d.startDate || '';
  document.getElementById('currencyInput').value  = d.currency  || '₹';
  document.getElementById('newPinInput').value    = '';
  document.getElementById('calorieGoalInput').value = d.calorieGoal || 2000;

  // Set theme toggle state
  const isLight = d.theme === 'light';
  document.getElementById('themeToggle').checked = isLight;

  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}

document.getElementById('settingsBtn').addEventListener('click', openSettings);
document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
document.getElementById('modalBackdrop').addEventListener('click', closeSettings);

/* ===== THEME TOGGLE ===== */
document.getElementById('themeToggle').addEventListener('change', function () {
  const theme = this.checked ? 'light' : 'dark';
  applyTheme(theme);
  DB.set(d => { d.theme = theme; });
});

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#f5f5f5');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0a0a0a');
  }
}

function initTheme() {
  const d = DB.get();
  applyTheme(d.theme || 'dark');
}

/* ===== PIN ===== */
document.getElementById('savePinBtn').addEventListener('click', () => {
  const val = document.getElementById('newPinInput').value.trim();
  if (!/^\d{4}$/.test(val)) {
    alert('PIN must be exactly 4 digits.'); return;
  }
  DB.set(d => { d.pin = val; });
  flashBtn('savePinBtn', 'SAVED ✓');
});

/* ===== START DATE ===== */
document.getElementById('saveStartDateBtn').addEventListener('click', () => {
  const val = document.getElementById('startDateInput').value;
  if (!val) return;
  DB.set(d => { d.startDate = val; });
  flashBtn('saveStartDateBtn', 'SAVED ✓');
  renderDashboard();
});

/* ===== CURRENCY ===== */
document.getElementById('saveCurrencyBtn').addEventListener('click', () => {
  const val = document.getElementById('currencyInput').value.trim() || '₹';
  DB.set(d => { d.currency = val; });
  flashBtn('saveCurrencyBtn', 'SAVED ✓');
  updateMoneySummary();
});

/* ===== CALORIE GOAL ===== */
document.getElementById('saveCalorieGoalBtn').addEventListener('click', () => {
  const val = parseInt(document.getElementById('calorieGoalInput').value) || 2000;
  if (val < 500 || val > 10000) {
    showToast('⚠️ Calorie goal must be between 500 and 10000'); return;
  }
  DB.set(d => { d.calorieGoal = val; });
  flashBtn('saveCalorieGoalBtn', 'SAVED ✓');
  // Refresh calorie screen if active
  const calScreen = document.getElementById('screenCalorie');
  if (calScreen && calScreen.classList.contains('active')) {
    renderCalorieScreen();
  }
});

/* ===== RESET ===== */
document.getElementById('resetDataBtn').addEventListener('click', () => {
  if (confirm('⚠ This will permanently delete ALL your data. Are you sure?')) {
    DB.reset();
    closeSettings();
    location.reload();
  }
});

/* ===== UTILITY ===== */
function flashBtn(id, text) {
  const btn = document.getElementById(id);
  const orig = btn.textContent;
  btn.textContent = text;
  btn.style.background = 'var(--green)';
  btn.style.color = '#fff';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.style.color = '';
  }, 1500);
}

function showToast(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}
