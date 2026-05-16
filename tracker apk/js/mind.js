/* ===== MIND.JS ===== */

function renderMindScreen() {
  const today = todayKey();
  document.getElementById('mindDate').textContent = formatDate(today);

  const d = DB.get();
  const log = d.mind[today] || {};

  const moodS    = document.getElementById('moodSlider');
  const energyS  = document.getElementById('energySlider');
  const stressS  = document.getElementById('stressSlider');

  moodS.value   = log.mood   || 5;
  energyS.value = log.energy || 5;
  stressS.value = log.stress || 5;

  document.getElementById('moodVal').textContent   = moodS.value;
  document.getElementById('energyVal').textContent = energyS.value;
  document.getElementById('stressVal').textContent = stressS.value;
  document.getElementById('reflectionInput').value = log.reflection || '';

  renderMoodChart();
}

// Slider live update
['mood','energy','stress'].forEach(id => {
  const el = document.getElementById(id + 'Slider');
  el.addEventListener('input', () => {
    document.getElementById(id + 'Val').textContent = el.value;
  });
});

document.getElementById('saveMindBtn').addEventListener('click', () => {
  const today = todayKey();
  DB.set(d => {
    d.mind[today] = {
      mood:       parseInt(document.getElementById('moodSlider').value),
      energy:     parseInt(document.getElementById('energySlider').value),
      stress:     parseInt(document.getElementById('stressSlider').value),
      reflection: document.getElementById('reflectionInput').value.trim(),
      ts: Date.now()
    };
  });
  flashBtn('saveMindBtn', 'SAVED ✓');
  renderMoodChart();
});

function renderMoodChart() {
  const d = DB.get();
  const chart = document.getElementById('moodChart');
  chart.innerHTML = '';

  const entries = Object.entries(d.mind)
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(-14);

  if (!entries.length) {
    chart.innerHTML = '<span style="color:var(--text3);font-size:12px;margin:auto">No mood data yet</span>';
    return;
  }

  const MOOD_COLORS = [
    '#cc0000','#dd2200','#ee4400','#ff6600',
    '#ff8800','#ffaa00','#cccc00','#88cc00',
    '#44cc44','#00cc88'
  ];

  entries.forEach(([, val]) => {
    const mood = val.mood || 5;
    const pct = (mood / 10) * 100;
    const bar = document.createElement('div');
    bar.className = 'mood-bar';
    bar.style.height = Math.max(10, pct) + '%';
    bar.style.background = MOOD_COLORS[mood - 1] || '#666';
    bar.title = `Mood: ${mood}/10`;
    chart.appendChild(bar);
  });
}
