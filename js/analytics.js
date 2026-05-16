/* ===== ANALYTICS.JS — Advanced Analytics Page ===== */

let analyticsCharts = {};

function renderAnalyticsScreen() {
  const d = DB.get();
  const container = document.getElementById('analyticsContent');
  if (!container) return;

  const filter = document.querySelector('.analytics-filter-btn.active')?.dataset?.filter || 'week';
  const days = filter === 'month' ? getLast30Days() : getLast7Days();

  container.innerHTML = `
    ${renderWorkoutFrequencyChart(d, days, filter)}
    ${renderHabitTrendsChart(d, days, filter)}
    ${renderFinanceTrendsChart(d, days, filter)}
    ${renderStreakHistory(d)}
    ${renderXPGrowthChart(d, days, filter)}
  `;

  // Render charts after DOM is updated
  setTimeout(() => {
    drawWorkoutChart(d, days, filter);
    drawHabitTrendChart(d, days, filter);
    drawFinanceTrendChart(d, days, filter);
    drawXPGrowthChart(d, days, filter);
  }, 100);
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/* ─── Workout Frequency ───────────────────────── */
function renderWorkoutFrequencyChart(d, days, filter) {
  const sessions = d.sessions || {};
  const workoutDays = days.filter(day =>
    Object.values(sessions).some(s => s.date === day)
  ).length;

  return `
    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-icon">🏋️</span>
        <span class="analytics-card-title">Workout Frequency</span>
        <span class="analytics-card-value">${workoutDays}/${days.length} days</span>
      </div>
      <div class="analytics-chart-wrap">
        <canvas id="analyticsWorkoutChart" height="180"></canvas>
      </div>
    </div>
  `;
}

function drawWorkoutChart(d, days, filter) {
  const canvas = document.getElementById('analyticsWorkoutChart');
  if (!canvas) return;

  // Destroy existing
  if (analyticsCharts.workout) analyticsCharts.workout.destroy();

  const sessions = d.sessions || {};
  const data = days.map(day =>
    Object.values(sessions).filter(s => s.date === day).length
  );

  const labels = days.map(day => {
    const dt = new Date(day + 'T00:00:00');
    return filter === 'month'
      ? dt.getDate().toString()
      : dt.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  analyticsCharts.workout = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: data.map(v => v > 0 ? '#cc000088' : '#222222'),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: getChartOptions('Sessions')
  });
}

/* ─── Habit Completion Trends ─────────────────── */
function renderHabitTrendsChart(d, days, filter) {
  const allH = [...HABITS, ...(d.customHabits || [])];
  const totalPossible = days.length * allH.length;
  const totalDone = days.reduce((sum, day) => {
    const dayH = d.habits[day] || {};
    return sum + allH.filter(h => dayH[h.id]).length;
  }, 0);
  const avgPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return `
    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-icon">✅</span>
        <span class="analytics-card-title">Habit Completion</span>
        <span class="analytics-card-value">${avgPct}% avg</span>
      </div>
      <div class="analytics-chart-wrap">
        <canvas id="analyticsHabitChart" height="180"></canvas>
      </div>
    </div>
  `;
}

function drawHabitTrendChart(d, days, filter) {
  const canvas = document.getElementById('analyticsHabitChart');
  if (!canvas) return;
  if (analyticsCharts.habit) analyticsCharts.habit.destroy();

  const allH = [...HABITS, ...(d.customHabits || [])];
  const data = days.map(day => {
    const dayH = d.habits[day] || {};
    return allH.length > 0 ? Math.round((allH.filter(h => dayH[h.id]).length / allH.length) * 100) : 0;
  });

  const labels = days.map(day => {
    const dt = new Date(day + 'T00:00:00');
    return filter === 'month' ? dt.getDate().toString() : dt.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  analyticsCharts.habit = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#00cc66',
        backgroundColor: 'rgba(0,204,102,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: filter === 'month' ? 0 : 4,
        pointBackgroundColor: '#00cc66',
        borderWidth: 2,
      }]
    },
    options: getChartOptions('Completion %', 100)
  });
}

/* ─── Finance Trends ──────────────────────────── */
function renderFinanceTrendsChart(d, days, filter) {
  const txns = d.transactions || [];
  const totalIncome = txns.filter(t => t.type === 'income' && days.includes(t.date)).reduce((s,t) => s + t.amount, 0);
  const totalExpense = txns.filter(t => t.type === 'expense' && days.includes(t.date)).reduce((s,t) => s + t.amount, 0);
  const curr = d.currency || '₹';

  return `
    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-icon">💰</span>
        <span class="analytics-card-title">Finance Trends</span>
        <span class="analytics-card-value">${curr}${(totalIncome - totalExpense).toLocaleString()}</span>
      </div>
      <div class="analytics-chart-wrap">
        <canvas id="analyticsFinanceChart" height="180"></canvas>
      </div>
    </div>
  `;
}

function drawFinanceTrendChart(d, days, filter) {
  const canvas = document.getElementById('analyticsFinanceChart');
  if (!canvas) return;
  if (analyticsCharts.finance) analyticsCharts.finance.destroy();

  const txns = d.transactions || [];

  const incomeData = days.map(day =>
    txns.filter(t => t.type === 'income' && t.date === day).reduce((s,t) => s + t.amount, 0)
  );
  const expenseData = days.map(day =>
    txns.filter(t => t.type === 'expense' && t.date === day).reduce((s,t) => s + t.amount, 0)
  );

  const labels = days.map(day => {
    const dt = new Date(day + 'T00:00:00');
    return filter === 'month' ? dt.getDate().toString() : dt.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  analyticsCharts.finance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income', data: incomeData, backgroundColor: '#00cc6688', borderRadius: 4, borderSkipped: false },
        { label: 'Expenses', data: expenseData, backgroundColor: '#cc000088', borderRadius: 4, borderSkipped: false }
      ]
    },
    options: {
      ...getChartOptions('Amount'),
      plugins: { ...getChartOptions('Amount').plugins, legend: { display: true, labels: { color: '#888', font: { size: 10 } } } }
    }
  });
}

/* ─── Streak History ──────────────────────────── */
function renderStreakHistory(d) {
  const allH = [...HABITS, ...(d.customHabits || [])];
  const today = new Date();
  const streakData = [];

  for (let i = 29; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().split('T')[0];
    const dayH = d.habits[key] || {};
    const done = allH.filter(h => dayH[h.id]).length;
    const pct = allH.length > 0 ? Math.round((done / allH.length) * 100) : 0;
    streakData.push({ date: key, pct, done });
  }

  const cellsHtml = streakData.map(s => {
    const level = s.pct >= 80 ? 'high' : s.pct >= 50 ? 'mid' : s.pct > 0 ? 'low' : 'none';
    return `<div class="streak-cell ${level}" title="${s.date}: ${s.pct}%"></div>`;
  }).join('');

  return `
    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-icon">🔥</span>
        <span class="analytics-card-title">30-Day Streak Map</span>
        <span class="analytics-card-value">${calcStreak()} day streak</span>
      </div>
      <div class="streak-grid">${cellsHtml}</div>
      <div class="streak-legend">
        <span><div class="streak-cell none"></div> None</span>
        <span><div class="streak-cell low"></div> &lt;50%</span>
        <span><div class="streak-cell mid"></div> 50-79%</span>
        <span><div class="streak-cell high"></div> 80%+</span>
      </div>
    </div>
  `;
}

/* ─── XP Growth ───────────────────────────────── */
function renderXPGrowthChart(d, days, filter) {
  const xp = d.xp || 0;
  const level = getNarutoLevel(xp);
  const rank = getNarutoRank(xp);

  return `
    <div class="analytics-card">
      <div class="analytics-card-header">
        <span class="analytics-card-icon">⚡</span>
        <span class="analytics-card-title">XP Growth</span>
        <span class="analytics-card-value">${rank.icon} Lv.${level}</span>
      </div>
      <div class="analytics-chart-wrap">
        <canvas id="analyticsXPChart" height="180"></canvas>
      </div>
    </div>
  `;
}

function drawXPGrowthChart(d, days, filter) {
  const canvas = document.getElementById('analyticsXPChart');
  if (!canvas) return;
  if (analyticsCharts.xpGrowth) analyticsCharts.xpGrowth.destroy();

  const history = d.xpHistory || [];
  const data = days.map(day => {
    const dayEntries = history.filter(h => h.date === day);
    return dayEntries.reduce((s, h) => s + h.amount, 0);
  });

  const labels = days.map(day => {
    const dt = new Date(day + 'T00:00:00');
    return filter === 'month' ? dt.getDate().toString() : dt.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  analyticsCharts.xpGrowth = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#8b00ff',
        backgroundColor: 'rgba(139,0,255,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: filter === 'month' ? 0 : 4,
        pointBackgroundColor: '#8b00ff',
        borderWidth: 2,
      }]
    },
    options: getChartOptions('XP Earned')
  });
}

/* ─── Chart Options Helper ────────────────────── */
function getChartOptions(yLabel, maxY) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { size: 10 } },
        border: { display: false }
      },
      y: {
        grid: { color: '#1a1a1a' },
        ticks: { color: '#666', font: { size: 10 } },
        border: { display: false },
        max: maxY || undefined,
        beginAtZero: true,
        title: { display: false }
      }
    }
  };
}

/* ─── Analytics Filter Handlers ───────────────── */
function initAnalyticsFilters() {
  document.querySelectorAll('.analytics-filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.analytics-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderAnalyticsScreen();
    });
  });
}
