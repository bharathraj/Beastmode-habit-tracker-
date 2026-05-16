/* ===== HABITS.JS — Enhanced with Add/Remove, Streaks, Progress ===== */

/* --------- HELPER: get all habits (built-in + custom) --------- */
function getAllHabits() {
  const d = DB.get();
  const custom = d.customHabits || [];
  return [...HABITS, ...custom];
}

/* --------- RENDER HABITS SCREEN --------- */
function renderHabits() {
  const today = todayKey();
  const d = DB.get();
  const todayHabits = d.habits[today] || {};
  const all = getAllHabits();
  const score = all.filter(h => todayHabits[h.id]).length;
  const total = all.length;
  const xp = score * 10;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  document.getElementById('habitsDate').textContent = formatDate(today);
  document.getElementById('habitScore').textContent = score;
  document.getElementById('habitScoreTotal').textContent = `/${total}`;
  document.getElementById('habitScoreLabel').textContent = getScoreLabel(score, total);
  document.getElementById('habitXpBadge').textContent = `+${xp} XP today`;

  // Progress bar
  const bar = document.getElementById('habitProgressBar');
  const pctEl = document.getElementById('habitProgressPct');
  if (bar) { bar.style.width = pct + '%'; bar.style.background = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)'; }
  if (pctEl) pctEl.textContent = pct + '%';

  renderHabitList();
  renderHabitProgress();
  renderManageHabits();
}

/* --------- TODAY LIST --------- */
function renderHabitList() {
  const today = todayKey();
  const d = DB.get();
  const todayHabits = d.habits[today] || {};
  const all = getAllHabits();
  const list = document.getElementById('habitsList');
  list.innerHTML = '';

  all.forEach((h, i) => {
    const done = !!todayHabits[h.id];
    const streak = calcHabitStreak(h.id);
    const item = document.createElement('div');
    item.className = `habit-item${done ? ' done' : ''}`;
    item.style.animationDelay = `${i * 40}ms`;
    item.innerHTML = `
      <span class="habit-item-icon">${h.icon}</span>
      <div style="flex:1">
        <div class="habit-item-name">${h.name}</div>
        <div class="habit-item-sub">${h.sub}</div>
      </div>
      ${streak > 0 ? `<span class="habit-streak-badge">🔥${streak}</span>` : ''}
      <div class="habit-toggle">${done ? '✓' : ''}</div>
    `;
    item.addEventListener('click', () => toggleHabit(h.id, item, all));
    list.appendChild(item);
  });
}

/* --------- TOGGLE HABIT --------- */
function toggleHabit(habitId, el, allHabits) {
  const today = todayKey();
  DB.set(d => {
    if (!d.habits[today]) d.habits[today] = {};
    d.habits[today][habitId] = !d.habits[today][habitId];
  });
  const done = DB.get().habits[today][habitId];
  el.classList.toggle('done', done);
  el.classList.add('just-done');
  el.querySelector('.habit-toggle').textContent = done ? '✓' : '';
  setTimeout(() => el.classList.remove('just-done'), 300);

  // Grant XP when habit completed
  if (done) {
    showXpFloat(el, '+10 XP');
    try { grantXP(XP_REWARDS.HABIT_COMPLETE, 'habit'); } catch(e) {}
  }

  // Recalculate
  const todayH = DB.get().habits[today] || {};
  const all = allHabits || getAllHabits();
  const score = all.filter(h => todayH[h.id]).length;
  const total = all.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  document.getElementById('habitScore').textContent = score;
  document.getElementById('habitScoreTotal').textContent = `/${total}`;
  document.getElementById('habitScoreLabel').textContent = getScoreLabel(score, total);
  document.getElementById('habitXpBadge').textContent = `+${score * 10} XP today`;

  const bar = document.getElementById('habitProgressBar');
  if (bar) { bar.style.width = pct + '%'; bar.style.background = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)'; }
  const pctEl = document.getElementById('habitProgressPct');
  if (pctEl) pctEl.textContent = pct + '%';

  updateDashboardRing();

  // Check for perfect day & streak achievements
  if (score === total && total > 0) {
    try { grantXP(XP_REWARDS.PERFECT_DAY, 'perfect_day'); } catch(e) {}
  }
  setTimeout(() => { try { checkAchievements(); } catch(e) {} }, 500);
}

/* --------- PROGRESS VIEW (streaks + 7-day grid) --------- */
function renderHabitProgress() {
  const all = getAllHabits();
  const list = document.getElementById('habitStreaksList');
  if (!list) return;
  list.innerHTML = '';

  // Last 7 day keys
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    days.push(dt.toISOString().split('T')[0]);
  }
  const dayLabels = days.map(k => new Date(k + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'narrow' }));

  const d = DB.get();

  all.forEach(h => {
    const streak = calcHabitStreak(h.id);
    const best = calcHabitBestStreak(h.id);
    const completionDays = days.map(k => !!(d.habits[k] || {})[h.id]);
    const weekPct = Math.round((completionDays.filter(Boolean).length / 7) * 100);

    const card = document.createElement('div');
    card.className = 'habit-streak-card';

    const dotsHtml = days.map((k, i) => {
      const done = completionDays[i];
      return `<div class="hsd-col">
        <div class="hsd-dot${done ? ' done' : ''}"></div>
        <span class="hsd-day">${dayLabels[i]}</span>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="hsc-header">
        <span class="hsc-icon">${h.icon}</span>
        <div class="hsc-info">
          <span class="hsc-name">${h.name}</span>
          <span class="hsc-week">${weekPct}% this week</span>
        </div>
        <div class="hsc-stats">
          <div class="hsc-stat">
            <span class="hsc-stat-val" style="color:var(--red)">${streak}</span>
            <span class="hsc-stat-lbl">🔥 Now</span>
          </div>
          <div class="hsc-stat">
            <span class="hsc-stat-val">${best}</span>
            <span class="hsc-stat-lbl">🏆 Best</span>
          </div>
        </div>
      </div>
      <div class="hsd-grid">${dotsHtml}</div>
      <div class="hsc-bar-wrap">
        <div class="hsc-bar-fill" style="width:${weekPct}%;background:${weekPct>=80?'var(--green)':weekPct>=50?'var(--yellow)':'var(--red)'}"></div>
      </div>
    `;
    list.appendChild(card);
  });
}

/* --------- MANAGE HABITS (Add / Remove) --------- */
function renderManageHabits() {
  const all = getAllHabits();
  const d = DB.get();
  const custom = d.customHabits || [];
  const list = document.getElementById('manageHabitsList');
  if (!list) return;
  list.innerHTML = '';

  all.forEach((h, i) => {
    const isBuiltIn = i < HABITS.length;
    const row = document.createElement('div');
    row.className = 'manage-habit-row';
    row.innerHTML = `
      <span class="mh-icon">${h.icon}</span>
      <div class="mh-info">
        <span class="mh-name">${h.name}</span>
        <span class="mh-sub">${h.sub}</span>
      </div>
      ${isBuiltIn
        ? `<span class="mh-built-in-badge">Built-in</span>`
        : `<button class="mh-delete-btn" data-id="${h.id}">🗑️</button>`
      }
    `;
    if (!isBuiltIn) {
      row.querySelector('.mh-delete-btn').addEventListener('click', () => removeCustomHabit(h.id));
    }
    list.appendChild(row);
  });
}

/* --------- ADD CUSTOM HABIT --------- */
document.getElementById('addHabitBtn').addEventListener('click', () => {
  const name = document.getElementById('newHabitName').value.trim();
  const sub  = document.getElementById('newHabitSub').value.trim() || 'Complete daily';
  const icon = document.getElementById('newHabitIcon').value;

  if (!name) { showToast('⚠️ Enter a habit name!'); return; }
  if (name.length > 40) { showToast('⚠️ Name too long (max 40 chars)'); return; }

  const d = DB.get();
  const custom = d.customHabits || [];
  if (custom.length + HABITS.length >= 20) { showToast('⚠️ Max 20 habits allowed'); return; }

  const id = 'custom_' + Date.now();
  DB.set(d => {
    if (!d.customHabits) d.customHabits = [];
    d.customHabits.push({ id, icon, name, sub });
  });

  document.getElementById('newHabitName').value = '';
  document.getElementById('newHabitSub').value = '';
  showToast(`✅ "${name}" added!`);
  renderHabits();
});

/* --------- REMOVE CUSTOM HABIT --------- */
function removeCustomHabit(id) {
  if (!confirm('Remove this habit? Completion history will be kept.')) return;
  DB.set(d => {
    d.customHabits = (d.customHabits || []).filter(h => h.id !== id);
  });
  showToast('Habit removed');
  renderHabits();
}

/* --------- HABIT TABS --------- */
document.querySelectorAll('.habit-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.habit-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.habit-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('hpanel' + capitalize(this.dataset.htab)).classList.add('active');
  });
});

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* --------- STREAK CALCULATIONS --------- */
function calcHabitStreak(habitId) {
  const d = DB.get();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().split('T')[0];
    if ((d.habits[key] || {})[habitId]) { streak++; }
    else if (i > 0) break;
  }
  return streak;
}

function calcHabitBestStreak(habitId) {
  const d = DB.get();
  const startDate = new Date(d.startDate + 'T00:00:00');
  let best = 0, cur = 0;
  for (let i = 0; i < 90; i++) {
    const dt = new Date(startDate);
    dt.setDate(dt.getDate() + i);
    if (dt > new Date()) break;
    const key = dt.toISOString().split('T')[0];
    if ((d.habits[key] || {})[habitId]) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }
  return best;
}

/* --------- SCORE LABEL --------- */
function getScoreLabel(score, total) {
  total = total || 10;
  const pct = score / total;
  if (pct >= 1) return '🏆 Perfect Day! BEAST!';
  if (pct >= 0.8) return '🔥 Crushing it!';
  if (pct >= 0.6) return '⚡ Good momentum';
  if (pct >= 0.4) return '💪 Keep pushing';
  if (pct >= 0.2) return '🎯 Stay focused';
  return '🌅 Get started!';
}

/* --------- XP FLOAT --------- */
function showXpFloat(el, text) {
  const rect = el.getBoundingClientRect();
  const div = document.createElement('div');
  div.className = 'xp-float';
  div.textContent = text;
  div.style.left = rect.left + rect.width / 2 + 'px';
  div.style.top = rect.top + 'px';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 900);
}

/* --------- DASHBOARD PREVIEW (uses all habits) --------- */
function renderHabitPreview() {
  const today = todayKey();
  const d = DB.get();
  const todayH = d.habits[today] || {};
  const all = getAllHabits();
  const preview = document.getElementById('habitPreview');
  preview.innerHTML = '';
  all.slice(0, 5).forEach(h => {
    const done = !!todayH[h.id];
    const el = document.createElement('div');
    el.className = 'habit-prev-item';
    el.innerHTML = `
      <span class="habit-prev-icon">${h.icon}</span>
      <span class="habit-prev-name">${h.name}</span>
      <div class="habit-prev-check${done ? ' done' : ''}">${done ? '✓' : ''}</div>
    `;
    preview.appendChild(el);
  });
}
