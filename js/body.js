/* ===== BODY.JS ===== */

function renderBodyScreen() {
  const today = todayKey();
  document.getElementById('bodyDate').textContent = formatDate(today);

  const d = DB.get();
  const todayLog = d.body[today] || {};

  document.getElementById('weightInput').value  = todayLog.weight  || '';
  document.getElementById('chestInput').value   = todayLog.chest   || '';
  document.getElementById('waistInput').value   = todayLog.waist   || '';
  document.getElementById('armsInput').value    = todayLog.arms    || '';
  document.getElementById('workoutNotes').value = todayLog.notes   || '';

  renderWeightChart();
  renderBodyLogList();
}

document.getElementById('saveBodyBtn').addEventListener('click', () => {
  const today = todayKey();
  const weight  = parseFloat(document.getElementById('weightInput').value)  || null;
  const chest   = parseFloat(document.getElementById('chestInput').value)   || null;
  const waist   = parseFloat(document.getElementById('waistInput').value)   || null;
  const arms    = parseFloat(document.getElementById('armsInput').value)    || null;
  const notes   = document.getElementById('workoutNotes').value.trim();

  DB.set(d => {
    d.body[today] = { weight, chest, waist, arms, notes, ts: Date.now() };
  });

  flashBtn('saveBodyBtn', 'SAVED ✓');
  renderWeightChart();
  renderBodyLogList();
});

function renderWeightChart() {
  const d = DB.get();
  const entries = Object.entries(d.body)
    .filter(([,v]) => v.weight)
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(-20);

  const chart = document.getElementById('weightChart');
  chart.innerHTML = '';
  if (!entries.length) {
    chart.innerHTML = '<span style="color:var(--text3);font-size:12px;margin:auto">No weight logs yet</span>';
    return;
  }

  const weights = entries.map(([,v]) => v.weight);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const range = maxW - minW || 1;

  entries.forEach(([key, val]) => {
    const pct = ((val.weight - minW) / range) * 100;
    const bar = document.createElement('div');
    bar.className = 'wt-bar';
    bar.style.height = Math.max(10, pct) + '%';
    bar.setAttribute('data-val', val.weight + 'kg');
    bar.title = `${formatDate(key)}: ${val.weight}kg`;
    chart.appendChild(bar);
  });
}

function renderBodyLogList() {
  const d = DB.get();
  const list = document.getElementById('bodyLogList');
  list.innerHTML = '';

  const entries = Object.entries(d.body)
    .sort(([a],[b]) => b.localeCompare(a))
    .slice(0, 10);

  if (!entries.length) {
    list.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:0 16px">No logs yet. Start tracking!</p>';
    return;
  }

  entries.forEach(([key, val]) => {
    const el = document.createElement('div');
    el.className = 'log-item';
    let body = '';
    if (val.weight) body += `<span class="log-item-val">${val.weight}kg</span> `;
    if (val.chest)  body += `Chest: ${val.chest}cm  `;
    if (val.waist)  body += `Waist: ${val.waist}cm  `;
    if (val.arms)   body += `Arms: ${val.arms}cm`;
    if (val.notes)  body += `<br><span style="color:var(--text3)">${val.notes}</span>`;
    el.innerHTML = `<div class="log-item-date">${formatDate(key)}</div><div class="log-item-body">${body || 'No data'}</div>`;
    list.appendChild(el);
  });
}
