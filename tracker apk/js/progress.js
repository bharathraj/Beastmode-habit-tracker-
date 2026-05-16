/* ===== PROGRESS.JS ===== */

function renderProgressScreen() {
  const d = DB.get();
  const daysLogged = Object.keys(d.habits).length;
  const bestStreak = calcBestStreak();
  const avgScore   = calcAvgScore();

  document.getElementById('progDaysLogged').textContent = daysLogged;
  document.getElementById('progBestStreak').textContent = bestStreak;
  document.getElementById('progAvgScore').textContent   = avgScore + '%';

  renderHeatmap();
  renderHabitBars();
  renderImproveList();
}

function renderHeatmap() {
  const d = DB.get();
  const start = new Date(d.startDate + 'T00:00:00');
  const heatmap = document.getElementById('heatmap');
  heatmap.innerHTML = '';

  for (let i = 0; i < 90; i++) {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + i);
    const key = dt.toISOString().split('T')[0];
    const today = todayKey();
    const cell = document.createElement('div');
    cell.className = 'hm-cell';

    if (key > today) {
      cell.classList.add('future');
    } else {
      const dayH = d.habits[key] || {};
      const score = HABITS.filter(h => dayH[h.id]).length;
      if      (score === 0)        { /* stays bg */ }
      else if (score <= 2)         cell.classList.add('level-1');
      else if (score <= 4)         cell.classList.add('level-2');
      else if (score <= 6)         cell.classList.add('level-3');
      else if (score <= 8)         cell.classList.add('level-4');
      else                         cell.classList.add('level-5');
    }

    const dtStr = dt.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    cell.title = dtStr;
    heatmap.appendChild(cell);
  }
}

function renderHabitBars() {
  const d = DB.get();
  const container = document.getElementById('habitBars');
  container.innerHTML = '';
  const loggedDays = Object.keys(d.habits).length;
  if (!loggedDays) {
    container.innerHTML = '<p style="color:var(--text3);font-size:13px">No habit data yet.</p>';
    return;
  }

  HABITS.forEach(h => {
    const count = Object.values(d.habits).filter(day => day[h.id]).length;
    const pct   = Math.round((count / loggedDays) * 100);
    const row   = document.createElement('div');
    row.className = 'hb-row';
    row.innerHTML = `
      <div class="hb-label">
        <span>${h.icon} ${h.name}</span>
        <span class="hb-pct">${pct}%</span>
      </div>
      <div class="hb-track">
        <div class="hb-fill" style="width:${pct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderImproveList() {
  const d = DB.get();
  const container = document.getElementById('improveList');
  container.innerHTML = '';
  const loggedDays = Object.keys(d.habits).length;
  if (!loggedDays) {
    container.innerHTML = '<p style="color:var(--text3);font-size:13px">Track habits first.</p>';
    return;
  }

  const weakHabits = HABITS
    .map(h => {
      const count = Object.values(d.habits).filter(day => day[h.id]).length;
      const pct   = Math.round((count / loggedDays) * 100);
      return { ...h, pct };
    })
    .filter(h => h.pct < 70)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 5);

  if (!weakHabits.length) {
    const el = document.createElement('div');
    el.className = 'improve-item';
    el.textContent = '🏆 All habits above 70%! You are a BEAST!';
    container.appendChild(el);
    return;
  }

  weakHabits.forEach(h => {
    const el = document.createElement('div');
    el.className = 'improve-item';
    el.innerHTML = `${h.icon} <strong>${h.name}</strong> — only ${h.pct}% completion. Push harder.`;
    container.appendChild(el);
  });
}
