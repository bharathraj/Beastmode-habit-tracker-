/* ===== MONEY.JS — Rebuilt with Transaction Model ===== */

let _moneyChart = null;
let _moneyBalanceChart = null;

/* ─── Migrate old data on first load ───────────────── */
function migrateLegacyMoneyData() {
  const d = DB.get();
  if (!d.money || !Object.keys(d.money).length) return;
  if (!d.transactions) d.transactions = [];
  // If we already have transactions, skip
  if (d.transactions.length > 0) return;

  DB.set(data => {
    if (!data.transactions) data.transactions = [];
    Object.entries(data.money || {}).forEach(([date, v]) => {
      if (v.earned > 0) {
        data.transactions.push({
          id: 'legacy_inc_' + date,
          type: 'income',
          date,
          amount: v.earned,
          desc: 'Imported income',
          category: 'Other',
          ts: new Date(date + 'T12:00:00').getTime()
        });
      }
      if (v.spent > 0) {
        data.transactions.push({
          id: 'legacy_exp_' + date,
          type: 'expense',
          date,
          amount: v.spent,
          desc: v.notes || 'Imported expense',
          category: 'Other',
          ts: new Date(date + 'T12:00:00').getTime()
        });
      }
    });
  });
}

/* ─── Render Screen ──────────────────────────────────── */
function renderMoneyScreen() {
  const today = todayKey();
  document.getElementById('moneyDate').textContent = formatDate(today);

  migrateLegacyMoneyData();

  // Pre-fill date fields with today
  const incDate = document.getElementById('incomeDate');
  const expDate = document.getElementById('expenseDate');
  if (incDate && !incDate.value) incDate.value = today;
  if (expDate && !expDate.value) expDate.value = today;

  // Money tab switching — wire once using a flag
  if (!window._moneyTabsWired) {
    window._moneyTabsWired = true;
    document.querySelectorAll('.money-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.money-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.money-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const key = this.dataset.mtab;
        const panel = document.getElementById('mpanel' + key.charAt(0).toUpperCase() + key.slice(1));
        if (panel) panel.classList.add('active');
      });
    });
  }

  updateMoneySummary();
  renderMoneyChart();
  renderMoneyBalanceChart();
  renderMoneyAnalysis();
  renderMoneyTimeline();
}

/* ─── Add Income ─────────────────────────────────────── */
document.getElementById('addIncomeBtn').addEventListener('click', () => {
  const date     = document.getElementById('incomeDate').value;
  const amount   = parseFloat(document.getElementById('incomeAmount').value);
  const desc     = document.getElementById('incomeDesc').value.trim() || 'Income';
  const category = document.getElementById('incomeCategory').value;

  if (!date)          { showToast('⚠️ Select a date!'); return; }
  if (!amount || amount <= 0) { showToast('⚠️ Enter a valid amount!'); return; }

  DB.set(d => {
    if (!d.transactions) d.transactions = [];
    d.transactions.push({ id: 'inc_' + Date.now(), type: 'income', date, amount, desc, category, ts: Date.now() });
  });

  document.getElementById('incomeAmount').value = '';
  document.getElementById('incomeDesc').value = '';
  showToast(`✅ +₹${amount.toLocaleString('en-IN')} income added!`);
  refreshMoneyViews();
});

/* ─── Add Expense ─────────────────────────────────────── */
document.getElementById('addExpenseBtn').addEventListener('click', () => {
  const date     = document.getElementById('expenseDate').value;
  const amount   = parseFloat(document.getElementById('expenseAmount').value);
  const desc     = document.getElementById('expenseDesc').value.trim() || 'Expense';
  const category = document.getElementById('expenseCategory').value;

  if (!date)          { showToast('⚠️ Select a date!'); return; }
  if (!amount || amount <= 0) { showToast('⚠️ Enter a valid amount!'); return; }

  DB.set(d => {
    if (!d.transactions) d.transactions = [];
    d.transactions.push({ id: 'exp_' + Date.now(), type: 'expense', date, amount, desc, category, ts: Date.now() });
  });

  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseDesc').value = '';
  showToast(`💸 -₹${amount.toLocaleString('en-IN')} expense logged!`);
  try { grantXP(XP_REWARDS.EXPENSE_LOG, 'expense'); } catch(e) {}
  refreshMoneyViews();
});

function refreshMoneyViews() {
  updateMoneySummary();
  renderMoneyChart();
  renderMoneyBalanceChart();
  renderMoneyAnalysis();
  renderMoneyTimeline();
}

/* ─── Summary Cards ──────────────────────────────────── */
function updateMoneySummary() {
  const d = DB.get();
  const cur = d.currency || '₹';
  const txns = d.transactions || [];

  const totalIncome  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  document.getElementById('totalEarned').textContent = `${cur}${totalIncome.toLocaleString('en-IN')}`;
  document.getElementById('totalSpent').textContent  = `${cur}${totalExpense.toLocaleString('en-IN')}`;
  const balEl = document.getElementById('totalSaved');
  balEl.textContent  = `${balance >= 0 ? '' : '-'}${cur}${Math.abs(balance).toLocaleString('en-IN')}`;
  balEl.style.color  = balance >= 0 ? 'var(--green)' : 'var(--red-bright)';
}

/* ─── Helper: get all unique dates from transactions, last N days ── */
function getChartDays(n = 30) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    days.push(dt.toISOString().split('T')[0]);
  }
  return days;
}

/* ─── Income vs Expense Bar Chart ───────────────────── */
function renderMoneyChart() {
  const d = DB.get();
  const txns = d.transactions || [];
  const cur  = d.currency || '₹';

  // Build days: show last 30 days that have any transaction, or all 30 days
  const days = getChartDays(30);
  // Only show days with data (or last 14 if none)
  const daysWithData = days.filter(k =>
    txns.some(t => t.date === k)
  );
  const chartDays = daysWithData.length >= 2 ? daysWithData.slice(-20) : days.slice(-14);

  const labels      = chartDays.map(k => new Date(k + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' }));
  const incomeData  = chartDays.map(k => txns.filter(t => t.type === 'income'  && t.date === k).reduce((s, t) => s + t.amount, 0));
  const expenseData = chartDays.map(k => txns.filter(t => t.type === 'expense' && t.date === k).reduce((s, t) => s + t.amount, 0));

  const isDark    = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const tickColor = isDark ? '#666' : '#888';

  const canvas = document.getElementById('moneyChartCanvas');
  if (!canvas) return;
  if (_moneyChart) { _moneyChart.destroy(); _moneyChart = null; }

  _moneyChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: incomeData,  backgroundColor: 'rgba(0,204,102,0.75)',  borderColor: '#00cc66', borderWidth: 1, borderRadius: 5 },
        { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(204,0,0,0.75)',    borderColor: '#cc0000', borderWidth: 1, borderRadius: 5 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tickColor, font: { size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${cur}${ctx.raw.toLocaleString('en-IN')}` } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 9 }, maxRotation: 45 } },
        y: { grid: { color: gridColor }, beginAtZero: true,
          ticks: { color: tickColor, font: { size: 10 }, callback: v => cur + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v) }
        }
      }
    }
  });
}

/* ─── Running Balance Line Chart ─────────────────────── */
function renderMoneyBalanceChart() {
  const d = DB.get();
  const txns = [...(d.transactions || [])].sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts);
  const cur  = d.currency || '₹';

  if (!txns.length) {
    const canvas = document.getElementById('moneyBalanceCanvas');
    if (canvas && _moneyBalanceChart) { _moneyBalanceChart.destroy(); _moneyBalanceChart = null; }
    return;
  }

  // Build timeline of running balance
  const allDates = [...new Set(txns.map(t => t.date))].sort();
  let runningBalance = 0;
  const labels = [];
  const balances = [];

  allDates.forEach(date => {
    const dayTxns = txns.filter(t => t.date === date);
    dayTxns.forEach(t => { runningBalance += t.type === 'income' ? t.amount : -t.amount; });
    labels.push(new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' }));
    balances.push(Math.round(runningBalance * 100) / 100);
  });

  const isDark    = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const tickColor = isDark ? '#666' : '#888';

  const canvas = document.getElementById('moneyBalanceCanvas');
  if (!canvas) return;
  if (_moneyBalanceChart) { _moneyBalanceChart.destroy(); _moneyBalanceChart = null; }

  _moneyBalanceChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: '#4488ff',
        backgroundColor: 'rgba(68,136,255,0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: balances.length <= 20 ? 4 : 2,
        pointBackgroundColor: balances.map(b => b >= 0 ? '#00cc66' : '#cc0000'),
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tickColor, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => `Balance: ${cur}${ctx.raw.toLocaleString('en-IN')}` } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 9 }, maxRotation: 45 } },
        y: { grid: { color: gridColor },
          ticks: { color: tickColor, font: { size: 10 }, callback: v => cur + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v < -1000 ? '-'+(Math.abs(v)/1000).toFixed(1)+'k' : v) }
        }
      }
    }
  });
}

/* ─── Spending Analysis ──────────────────────────────── */
function renderMoneyAnalysis() {
  const d = DB.get();
  const cur  = d.currency || '₹';
  const txns = d.transactions || [];
  const container = document.getElementById('moneyAnalysis');
  if (!container) return;

  if (!txns.length) {
    container.innerHTML = '<p style="color:var(--text3);font-size:13px">No transactions yet. Start logging your income and expenses!</p>';
    return;
  }

  const totalIncome  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net          = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Days with expenses (unique dates)
  const expDates = [...new Set(txns.filter(t => t.type === 'expense').map(t => t.date))];
  const avgDailySpend = expDates.length > 0 ? Math.round(totalExpense / expDates.length) : 0;

  // Top expense category
  const catTotals = {};
  txns.filter(t => t.type === 'expense').forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const topCat = Object.entries(catTotals).sort(([,a],[,b]) => b - a)[0];

  let insight = '';
  if (net < 0)              insight = '⚠️ Spending exceeds income! Review your expenses urgently.';
  else if (savingsRate >= 50) insight = '🏆 Excellent! You\'re saving over 50% of income.';
  else if (savingsRate >= 30) insight = '✅ Good savings discipline. Keep it up!';
  else if (savingsRate >= 10) insight = '⚡ Room to improve. Try cutting 1 expense category.';
  else                        insight = '💡 Very low savings rate. Budget more aggressively.';

  container.innerHTML = `
    <div class="analysis-grid">
      <div class="analysis-item">
        <span class="analysis-val" style="color:${savingsRate>=30?'var(--green)':savingsRate>=0?'var(--yellow)':'var(--red-bright)'}">${savingsRate}%</span>
        <span class="analysis-lbl">Savings Rate</span>
      </div>
      <div class="analysis-item">
        <span class="analysis-val">${cur}${avgDailySpend.toLocaleString('en-IN')}</span>
        <span class="analysis-lbl">Avg Daily Spend</span>
      </div>
      <div class="analysis-item">
        <span class="analysis-val" style="color:${net>=0?'var(--green)':'var(--red-bright)'}">${net>=0?'+':''}${cur}${Math.abs(net).toLocaleString('en-IN')}</span>
        <span class="analysis-lbl">Net Balance</span>
      </div>
    </div>
    ${topCat ? `<div class="analysis-insight" style="margin-bottom:8px">🏷️ Top expense: <strong>${topCat[0]}</strong> — ${cur}${topCat[1].toLocaleString('en-IN')}</div>` : ''}
    <div class="analysis-insight">${insight}</div>
  `;
}

/* ─── Transaction Timeline ───────────────────────────── */
const CAT_ICONS = {
  Salary:'💼', Freelance:'💻', Business:'🏪', Investment:'📈', Gift:'🎁', Refund:'↩️',
  Food:'🍽️', Transport:'🚗', Shopping:'🛒', Health:'💊', Entertainment:'🎬',
  Bills:'⚡', Rent:'🏠', Education:'📚', Fitness:'💪', Other:'📌'
};

function renderMoneyTimeline() {
  const d = DB.get();
  const cur  = d.currency || '₹';
  const txns = [...(d.transactions || [])].sort((a, b) =>
    b.date.localeCompare(a.date) || b.ts - a.ts
  );
  const list = document.getElementById('moneyLogList');
  const countEl = document.getElementById('moneyEntryCount');
  list.innerHTML = '';

  if (countEl) countEl.textContent = txns.length ? `${txns.length} entries` : '';

  if (!txns.length) {
    list.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:8px 16px">No transactions yet.</p>';
    return;
  }

  // Group by date for display
  let lastDate = null;
  // Running balance (calculate forward first)
  const sortedAsc = [...txns].sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts);
  const balanceMap = {}; // date → cumulative balance after all that day's txns
  let running = 0;
  sortedAsc.forEach(t => {
    running += t.type === 'income' ? t.amount : -t.amount;
    balanceMap[t.id] = running;
  });

  txns.forEach(t => {
    // Date group header
    if (t.date !== lastDate) {
      lastDate = t.date;
      const header = document.createElement('div');
      header.className = 'money-date-header';
      header.textContent = formatDate(t.date);
      list.appendChild(header);
    }

    const isIncome  = t.type === 'income';
    const balAfter  = balanceMap[t.id];
    const icon      = CAT_ICONS[t.category] || '📌';

    const row = document.createElement('div');
    row.className = `money-txn-row ${isIncome ? 'income' : 'expense'}`;
    row.innerHTML = `
      <div class="mtr-left">
        <span class="mtr-cat-icon">${icon}</span>
        <div class="mtr-info">
          <span class="mtr-desc">${t.desc}</span>
          <span class="mtr-cat">${t.category}</span>
        </div>
      </div>
      <div class="mtr-right">
        <span class="mtr-amount ${isIncome ? 'income' : 'expense'}">
          ${isIncome ? '+' : '-'}${cur}${t.amount.toLocaleString('en-IN')}
        </span>
        <span class="mtr-balance">Bal: ${balAfter >= 0 ? '' : '-'}${cur}${Math.abs(balAfter).toLocaleString('en-IN')}</span>
        <button class="mtr-delete" data-id="${t.id}" title="Delete">✕</button>
      </div>
    `;
    row.querySelector('.mtr-delete').addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm('Delete this transaction?')) return;
      DB.set(d => { d.transactions = (d.transactions || []).filter(tx => tx.id !== t.id); });
      showToast('Transaction deleted');
      refreshMoneyViews();
    });
    list.appendChild(row);
  });
}
