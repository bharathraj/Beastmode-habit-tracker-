/* ===== WEEKLY.JS ===== */

function renderWeeklyScreen() {
  const today = todayKey();
  const weekKey = getWeekKey(today);
  document.getElementById('weeklyDate').textContent = `Week ${weekKey}`;

  const d = DB.get();
  const log = d.weekly[weekKey] || {};

  document.getElementById('winsInput').value     = log.wins     || '';
  document.getElementById('mistakesInput').value = log.mistakes || '';
  document.getElementById('lessonsInput').value  = log.lessons  || '';
  document.getElementById('focusInput').value    = log.focus    || '';

  renderWeeklyLogList();
}

document.getElementById('saveWeeklyBtn').addEventListener('click', () => {
  const weekKey = getWeekKey(todayKey());
  DB.set(d => {
    d.weekly[weekKey] = {
      wins:     document.getElementById('winsInput').value.trim(),
      mistakes: document.getElementById('mistakesInput').value.trim(),
      lessons:  document.getElementById('lessonsInput').value.trim(),
      focus:    document.getElementById('focusInput').value.trim(),
      ts: Date.now()
    };
  });
  flashBtn('saveWeeklyBtn', 'SAVED ✓');
  renderWeeklyLogList();
});

function renderWeeklyLogList() {
  const d = DB.get();
  const list = document.getElementById('weeklyLogList');
  list.innerHTML = '';

  const entries = Object.entries(d.weekly)
    .sort(([a],[b]) => b.localeCompare(a))
    .slice(0, 12);

  if (!entries.length) {
    list.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:0 16px">No weekly reviews yet.</p>';
    return;
  }

  entries.forEach(([key, val]) => {
    const card = document.createElement('div');
    card.className = 'log-item';
    card.innerHTML = `
      <div class="log-item-date">${key}</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px">
        ${val.wins ? `<div><div class="wr-section-title">🏆 WINS</div><div class="wr-section-body">${val.wins}</div></div>` : ''}
        ${val.mistakes ? `<div><div class="wr-section-title">⚡ MISTAKES</div><div class="wr-section-body">${val.mistakes}</div></div>` : ''}
        ${val.lessons ? `<div><div class="wr-section-title">📚 LESSONS</div><div class="wr-section-body">${val.lessons}</div></div>` : ''}
        ${val.focus ? `<div><div class="wr-section-title">🎯 NEXT WEEK FOCUS</div><div class="wr-section-body">${val.focus}</div></div>` : ''}
      </div>
    `;
    list.appendChild(card);
  });
}
