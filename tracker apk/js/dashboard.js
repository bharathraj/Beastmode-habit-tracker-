/* ===== DASHBOARD.JS — Beast Score + Naruto Edition ===== */

/* ─── Beast Score Engine ────────────────────────────── */
const BEAST_TIERS = [
  { min: 90, tier: 'S', label: '👑 BEAST MODE ACTIVATED',  sub: 'You are operating at the highest level', color: '#ffd700' },
  { min: 75, tier: 'A', label: '🔥 STRONG MOMENTUM',       sub: 'Elite performance — keep the standard',  color: '#cc0000' },
  { min: 60, tier: 'B', label: '⚡ WARRIOR DISCIPLINE',     sub: 'Warrior discipline — push harder',        color: '#ff6600' },
  { min: 45, tier: 'C', label: '💪 RISING SHINOBI',         sub: 'Building the foundation — more consistency', color: '#ccaa00' },
  { min: 30, tier: 'D', label: '😤 RECRUIT',               sub: 'Recruit level — build the foundation',   color: '#888888' },
  { min: 0,  tier: 'F', label: '💀 GET BACK ON TRACK',      sub: 'You know what needs to change',           color: '#550000' },
];

function getBeastTier(score) {
  return BEAST_TIERS.find(t => score >= t.min) || BEAST_TIERS[BEAST_TIERS.length - 1];
}

function calcBeastScore(date) {
  const d    = DB.get();
  const allH = (typeof HABITS !== 'undefined' ? HABITS : []).concat(d.customHabits || []);
  const dayH = d.habits[date] || {};
  const streak = calcStreak();

  // Habit %
  const habitPct    = allH.length > 0 ? allH.filter(h => dayH[h.id]).length / allH.length : 0;
  const streakPct   = Math.min(streak, 30) / 30;
  const sleep       = (dayH['wake'] || dayH['sleep']) ? 1 : 0;
  const deepHrs     = (d.mind && d.mind[date]) ? (d.mind[date].deepWork || 0) : 0;
  const deepWorkPct = Math.min(deepHrs, 4) / 4;
  const clean       = (dayH['nobad'] || dayH['noBadHabits']) ? 1 : 0;

  // Finance discipline: check if expenses are under control
  const txns = d.transactions || [];
  const todayExpenses = txns.filter(t => t.type === 'expense' && t.date === date).reduce((s,t) => s + t.amount, 0);
  const financePct = todayExpenses > 0 ? Math.max(0, 1 - (todayExpenses / 5000)) : 1; // Under 5000 = disciplined

  const parts = {
    habits:   Math.round(habitPct * 30 * 10) / 10,
    streak:   Math.round(streakPct * 20 * 10) / 10,
    sleep:    sleep * 15,
    deepWork: Math.round(deepWorkPct * 15 * 10) / 10,
    clean:    clean * 10,
    finance:  Math.round(financePct * 10 * 10) / 10,
  };
  const score = Math.min(100, Math.round(parts.habits + parts.streak + parts.sleep + parts.deepWork + parts.clean + parts.finance));
  const tier  = getBeastTier(score);
  return { score, tier, parts };
}

/* ─── Main Render ────────────────────────────────────── */
function renderDashboard() {
  const d     = DB.get();
  const today = todayKey();
  const xp    = d.xp || 0;
  const rank  = getNarutoRank(xp);
  const level = getNarutoLevel(xp);
  const info  = getXPForNextLevel(xp);
  const streak     = calcStreak();
  const bestStreak = calcBestStreak();
  const avgScore   = calcAvgScore();
  const daysLogged = Object.keys(d.habits).length;
  const allH = [...HABITS, ...(d.customHabits || [])];
  const totalScore = Object.values(d.habits).reduce((s, dh) => s + allH.filter(h => dh[h.id]).length, 0);

  // Day number
  document.getElementById('dayNumber').textContent = getDayNumber();

  // Compute Beast Score
  const { score, tier, parts } = calcBeastScore(today);

  // Persist score (deferred)
  setTimeout(() => {
    DB.set(data => {
      if (!data.beastScore) data.beastScore = {};
      data.beastScore[today] = { score, tier: tier.tier, parts, ts: Date.now() };
    });
  }, 0);

  // Animate Beast Ring
  animateBeastRing(score, parts.habits / 30);

  // Tier badge — use Naruto rank
  document.getElementById('brTier').textContent          = tier.tier;
  document.getElementById('beastTierBadge').textContent  = `${rank.icon} ${rank.title}`;
  document.getElementById('beastTierBadge').style.color  = rank.chakra;
  document.getElementById('beastTierSub').textContent    = tier.sub;

  // Animate score counter
  animateCounter('brScore', 0, score, 800);

  // Breakdown bars
  setBreakdownBar('bbHabits', 'bbHabitsVal', parts.habits, 30);
  setBreakdownBar('bbStreak', 'bbStreakVal', parts.streak, 20);
  setBreakdownBar('bbSleep',  'bbSleepVal',  parts.sleep,  15);
  setBreakdownBar('bbDeep',   'bbDeepVal',   parts.deepWork, 15);
  setBreakdownBar('bbClean',  'bbCleanVal',  parts.clean,  10);

  // Stats row — now shows Naruto rank info
  document.getElementById('statStreak').innerHTML = streak > 0
    ? `${streak} <span class="flame-icon">🔥</span>` : streak;
  document.getElementById('statXP').textContent    = xp.toLocaleString();
  document.getElementById('statLevel').textContent = `Lv.${level}`;

  // XP bar — chakra themed
  const xpPct = info.xpNeeded > 0 ? (info.xpInLevel / info.xpNeeded) * 100 : 100;
  const xpFill = document.getElementById('xpBarFill');
  const xpLabel = document.getElementById('xpBarLabel');
  if (xpFill) {
    xpFill.style.width = Math.min(xpPct, 100) + '%';
    xpFill.style.background = `linear-gradient(90deg, ${rank.chakra}, ${rank.chakra}aa)`;
  }
  if (xpLabel) {
    xpLabel.textContent = `${rank.icon} ${rank.title}  —  ${xp.toLocaleString()} / ${info.totalForNext.toLocaleString()} XP`;
  }

  // 7-day sparkline
  renderScoreSparkline();

  // AI Coach
  renderCoachCard();

  // Quote
  const q = getDailyQuote();
  document.getElementById('quoteText').textContent  = `"${q.text}"`;
  document.getElementById('quoteAuthor').textContent = `— ${q.author}`;

  // Weekly chart + Habit preview
  renderWeeklyChart();
  renderHabitPreview();

  // Quick stats
  document.getElementById('qsTotalScore').textContent = totalScore;
  document.getElementById('qsBestStreak').textContent = bestStreak;
  document.getElementById('qsDaysLogged').textContent = daysLogged;
  document.getElementById('qsAvgScore').textContent   = avgScore + '%';
}

/* ─── Beast Ring Animation ──────────────────────────── */
function animateBeastRing(score, habitRatio) {
  const OUTER_CIRC = 364.4;
  const INNER_CIRC = 289.0;

  const outerOffset = OUTER_CIRC - (score / 100) * OUTER_CIRC;
  const innerOffset = INNER_CIRC - (habitRatio) * INNER_CIRC;

  const tier  = getBeastTier(score);
  const fill  = document.getElementById('brFill');
  const habit = document.getElementById('brHabit');

  if (fill) {
    fill.style.strokeDashoffset = outerOffset;
    fill.style.stroke = tier.color;
  }
  if (habit) {
    habit.style.strokeDashoffset = innerOffset;
  }
}

/* ─── Counter Animation ─────────────────────────────── */
function animateCounter(id, from, to, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ─── Breakdown Bars ─────────────────────────────────── */
function setBreakdownBar(barId, valId, value, max) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const bar = document.getElementById(barId);
  const val = document.getElementById(valId);
  if (bar) bar.style.width = pct + '%';
  if (val) val.textContent = Math.round(value * 10) / 10;
}

/* ─── Dashboard Ring Update (called from habits toggle) ─ */
function updateDashboardRing() {
  const today = todayKey();
  const { score, parts } = calcBeastScore(today);
  animateBeastRing(score, parts.habits / 30);
  animateCounter('brScore', parseInt(document.getElementById('brScore')?.textContent || 0), score, 400);
}

/* ─── 7-Day Score Sparkline ─────────────────────────── */
function renderScoreSparkline() {
  const d    = DB.get();
  const days = getLast7Days();
  const container = document.getElementById('scoreSparkline');
  if (!container) return;
  container.innerHTML = '';

  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  days.forEach(key => {
    const saved = d.beastScore?.[key];
    const score = saved ? saved.score : (key === todayKey() ? calcBeastScore(key).score : 0);
    const isToday = key === todayKey();
    const tier  = getBeastTier(score);

    const dt    = new Date(key + 'T00:00:00');
    const label = DAY_LABELS[dt.getDay()];

    const col = document.createElement('div');
    col.className = 'sparkline-col';
    col.innerHTML = `
      <div class="sl-bar-bg">
        <div class="sl-bar-fill" style="height:${score}%;background:${tier.color}" title="${score}"></div>
      </div>
      <span class="sl-score ${isToday ? 'today' : ''}">${score || '—'}</span>
      <span class="sl-day  ${isToday ? 'today' : ''}">${label}</span>
    `;
    container.appendChild(col);
  });
}

/* ─── AI Coach Engine ────────────────────────────────── */
const COACH_RULES = [
  { if: c => c.streak >= 30,
    say: '🏆 30 DAYS STRAIGHT. You are in the top 1% of humans who keep promises to themselves. Don\'t stop.' },
  { if: c => c.streak === 21,
    say: '🔥 21 days in. Neuroscience says the habit loop is now wired. You are who you said you\'d be.' },
  { if: c => c.streak === 7,
    say: '⚡ One full week locked. The foundation is set. Now build the wall.' },
  { if: c => c.streak === 0 && c.prevStreak > 7,
    say: c => `💀 You broke a ${c.prevStreak}-day streak. That pain is data. Reset TODAY — not tomorrow.` },
  { if: c => c.habitsToday === c.habitsTotal && c.habitsTotal > 0,
    say: '✅ PERFECT DAY. Every single habit done. This is the identity you\'re building. Lock it in.' },
  { if: c => c.habitsToday === 0 && new Date().getHours() > 14,
    say: '⚠️ It\'s after 2PM. Zero habits done. You are choosing mediocrity. Fix it in the next hour.' },
  { if: c => c.score >= 90,
    say: '👑 Beast Score 90+. Beast Mode Activated! You are operating at your highest level.' },
  { if: c => c.score >= 75,
    say: '🔥 Strong Momentum! Proof that the system works when you work the system.' },
  { if: c => c.score < 40 && c.day > 7,
    say: '📉 Beast Score under 40. Get back on track. What specifically will you fix today?' },
  { if: c => c.weekExpenses > c.weekIncome * 0.8 && c.weekIncome > 0,
    say: '💸 You\'re burning 80%+ of your income. Your future self is watching every purchase.' },
  { if: () => true,
    say: c => `Day ${c.day}/90. ${90 - c.day} days left. Every rep, every habit, every decision compounds.` },
];

function buildCoachContext() {
  const d       = DB.get();
  const today   = todayKey();
  const allH    = [...HABITS, ...(d.customHabits || [])];
  const dayH    = d.habits[today] || {};
  const txns    = d.transactions || [];

  const days7   = getLast7Days();
  const weekIncome  = txns.filter(t => t.type === 'income'  && days7.includes(t.date)).reduce((s,t) => s+t.amount, 0);
  const weekExpenses= txns.filter(t => t.type === 'expense' && days7.includes(t.date)).reduce((s,t) => s+t.amount, 0);

  return {
    day:         getDayNumber(),
    streak:      calcStreak(),
    prevStreak:  d.prevStreak || 0,
    habitsToday: allH.filter(h => dayH[h.id]).length,
    habitsTotal: allH.length,
    score:       d.beastScore?.[today]?.score || 0,
    weekIncome, weekExpenses,
  };
}

function renderCoachCard() {
  const d     = DB.get();
  const today = todayKey();
  const card  = document.getElementById('coachCard');
  const msgEl = document.getElementById('coachMsg');

  if (d.coachDismissed === today) {
    if (card) card.style.display = 'none';
    return;
  }
  if (card) card.style.display = '';

  const ctx  = buildCoachContext();
  const rule = COACH_RULES.find(r => r.if(ctx));
  const msg  = rule ? (typeof rule.say === 'function' ? rule.say(ctx) : rule.say) : `Day ${ctx.day}/90. Keep grinding.`;

  if (msgEl) msgEl.textContent = msg;

  setTimeout(() => {
    DB.set(data => { if (!data.coachMsg) data.coachMsg = {}; data.coachMsg[today] = msg; });
  }, 0);
}

document.getElementById('coachDismiss').addEventListener('click', () => {
  DB.set(d => { d.coachDismissed = todayKey(); });
  document.getElementById('coachCard').style.display = 'none';
});

/* ─── Weekly Chart ─────────────────────────────────── */
function renderWeeklyChart() {
  const days = getLast7Days();
  const d    = DB.get();
  const allH = [...HABITS, ...(d.customHabits || [])];
  const chart = document.getElementById('weeklyChart');
  chart.innerHTML = '';
  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  days.forEach(key => {
    const dayH  = d.habits[key] || {};
    const score = allH.length > 0 ? allH.filter(h => dayH[h.id]).length / allH.length * 100 : 0;
    const saved = d.beastScore?.[key];
    const bScore = saved ? saved.score : 0;
    const tierColor = bScore > 0 ? getBeastTier(bScore).color : 'var(--red)';
    const dt    = new Date(key + 'T00:00:00');
    const label = DAY_LABELS[dt.getDay()];
    const isToday = key === todayKey();

    const wrap = document.createElement('div');
    wrap.className = 'wc-bar-wrap';
    wrap.innerHTML = `
      <div class="wc-bar-bg">
        <div class="wc-bar-fill" style="height:${score}%;background:${tierColor}"></div>
      </div>
      <span class="wc-day${isToday ? ' today' : ''}">${label}</span>
    `;
    chart.appendChild(wrap);
  });
}

/* ─── Fireworks for Level Up ─────────────────────────── */
function spawnFireworks() {
  const container = document.getElementById('levelupFireworks');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#ffd700', '#cc0000', '#00cc66', '#4488ff', '#ff6600', '#8b00ff'];
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 'fw-dot';
    dot.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[i % colors.length]};
      animation-delay: ${Math.random() * 0.5}s;
      animation-duration: ${0.8 + Math.random() * 0.6}s;
    `;
    container.appendChild(dot);
  }
}
