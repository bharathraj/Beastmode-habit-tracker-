/* ===== ACHIEVEMENTS.JS — Achievement Engine ===== */

const ACHIEVEMENT_DEFS = [
  // Habit achievements
  { id: 'first_habit',       icon: '🎯', title: 'First Mission Complete',    desc: 'Complete your first habit',          condition: d => Object.values(d.habits || {}).some(day => Object.values(day).some(v => v)) },
  { id: 'perfect_day',       icon: '⭐', title: 'Perfect Day',              desc: 'Complete all habits in one day',     condition: d => { const allH = [...HABITS, ...(d.customHabits||[])]; return Object.values(d.habits||{}).some(day => allH.every(h => day[h.id])); } },
  { id: 'streak_3',          icon: '🔥', title: 'Ignition',                 desc: '3-day streak',                       condition: d => calcStreak() >= 3 },
  { id: 'streak_7',          icon: '🌊', title: '7 Day Chakra Flow',        desc: '7-day consistency streak',           condition: d => calcStreak() >= 7 },
  { id: 'streak_14',         icon: '⚡', title: 'Discipline Shinobi',       desc: '14-day streak of consistency',       condition: d => calcStreak() >= 14 },
  { id: 'streak_21',         icon: '🦊', title: 'Beast Mode Ninja',         desc: '21-day streak — habit is wired',     condition: d => calcStreak() >= 21 },
  { id: 'streak_30',         icon: '👁️', title: 'Uchiha Persistence',       desc: '30-day unbroken streak',             condition: d => calcStreak() >= 30 },
  { id: 'streak_60',         icon: '💀', title: 'Shadow Grind Master',      desc: '60-day legendary streak',            condition: d => calcStreak() >= 60 },
  { id: 'streak_90',         icon: '👑', title: 'Immortal Discipline',      desc: 'Full 90-day perfect streak',         condition: d => calcStreak() >= 90 },

  // Workout achievements
  { id: 'first_workout',     icon: '💪', title: 'First Rep',                desc: 'Complete your first workout',        condition: d => Object.keys(d.sessions || {}).length >= 1 },
  { id: 'workout_10',        icon: '🏋️', title: 'Iron Will',                desc: 'Complete 10 workouts',               condition: d => Object.keys(d.sessions || {}).length >= 10 },
  { id: 'workout_50',        icon: '🔱', title: 'Training Sage',            desc: 'Complete 50 workouts',               condition: d => Object.keys(d.sessions || {}).length >= 50 },

  // Finance achievements
  { id: 'first_expense',     icon: '💰', title: 'Financial Awareness',      desc: 'Track your first expense',           condition: d => (d.transactions || []).filter(t => t.type === 'expense').length >= 1 },
  { id: 'savings_goal',      icon: '🏦', title: 'Savings Ninja',            desc: 'Save more than you spend in a month',condition: d => checkMonthlySavings(d) },

  // XP achievements
  { id: 'xp_100',            icon: '⚡', title: 'Chakra Awakening',         desc: 'Earn 100 XP',                        condition: d => (d.xp || 0) >= 100 },
  { id: 'xp_500',            icon: '🌀', title: 'Chakra Flow',              desc: 'Earn 500 XP',                        condition: d => (d.xp || 0) >= 500 },
  { id: 'xp_1000',           icon: '🔥', title: 'Thousand Jutsu',           desc: 'Earn 1,000 XP',                      condition: d => (d.xp || 0) >= 1000 },
  { id: 'xp_5000',           icon: '🦅', title: 'Summoning Mastery',        desc: 'Earn 5,000 XP',                      condition: d => (d.xp || 0) >= 5000 },
  { id: 'xp_10000',          icon: '👁️', title: 'Rinnegan Awakened',        desc: 'Earn 10,000 XP',                     condition: d => (d.xp || 0) >= 10000 },
  { id: 'xp_50000',          icon: '✨', title: 'Six Paths Power',          desc: 'Earn 50,000 XP',                     condition: d => (d.xp || 0) >= 50000 },
  { id: 'xp_100000',         icon: '🌟', title: 'Legend of Konoha',         desc: 'Earn 100,000 XP',                    condition: d => (d.xp || 0) >= 100000 },

  // Beast Score achievements
  { id: 'beast_90',          icon: '👑', title: 'Beast Mode Activated',     desc: 'Score 90+ Beast Score',              condition: d => Object.values(d.beastScore || {}).some(s => s.score >= 90) },
  { id: 'beast_100',         icon: '💎', title: 'Perfect Beast',            desc: 'Score a perfect 100 Beast Score',    condition: d => Object.values(d.beastScore || {}).some(s => s.score >= 100) },

  // Special
  { id: 'early_bird',        icon: '🌅', title: 'Early Bird Jutsu',         desc: 'Log habits before 7 AM',             condition: d => { const h = new Date().getHours(); return h < 7 && Object.keys(d.habits[todayKey()] || {}).length > 0; } },
  { id: 'night_grinder',     icon: '🌙', title: 'Night Grinder',            desc: 'Log habits after 11 PM',             condition: d => { const h = new Date().getHours(); return h >= 23 && Object.keys(d.habits[todayKey()] || {}).length > 0; } },
  { id: 'week_warrior',      icon: '📅', title: 'Week Warrior',             desc: 'Log every day for a full week',      condition: d => checkConsecutiveDays(d, 7) },
  { id: 'month_master',      icon: '📆', title: 'Month Master',             desc: 'Log every day for 30 days',          condition: d => checkConsecutiveDays(d, 30) },
];

function checkMonthlySavings(d) {
  const txns = d.transactions || [];
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthTxns = txns.filter(t => t.date && t.date.startsWith(monthKey));
  const income = monthTxns.filter(t => t.type === 'income').reduce((s,t) => s + (t.amount||0), 0);
  const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s,t) => s + (t.amount||0), 0);
  return income > 0 && expenses < income;
}

function checkConsecutiveDays(d, days) {
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().split('T')[0];
    if (!d.habits[key] || Object.keys(d.habits[key]).length === 0) return false;
  }
  return true;
}

/* Check and unlock achievements */
function checkAchievements() {
  const d = DB.get();
  if (!d.achievements) {
    DB.set(data => { data.achievements = {}; });
  }

  const newUnlocks = [];

  ACHIEVEMENT_DEFS.forEach(ach => {
    if (d.achievements && d.achievements[ach.id]) return; // Already unlocked

    try {
      if (ach.condition(d)) {
        newUnlocks.push(ach);
      }
    } catch(e) {
      // Skip if condition errors
    }
  });

  if (newUnlocks.length > 0) {
    DB.set(data => {
      if (!data.achievements) data.achievements = {};
      newUnlocks.forEach(ach => {
        data.achievements[ach.id] = {
          unlockedAt: Date.now(),
          date: todayKey()
        };
      });
    });

    // Show popups sequentially
    newUnlocks.forEach((ach, i) => {
      setTimeout(() => showAchievementPopup(ach), i * 2500);
    });
  }
}

/* Unlock a specific achievement by ID */
function unlockAchievement(id) {
  const d = DB.get();
  if (d.achievements && d.achievements[id]) return;

  const ach = ACHIEVEMENT_DEFS.find(a => a.id === id);
  if (!ach) return;

  DB.set(data => {
    if (!data.achievements) data.achievements = {};
    data.achievements[id] = {
      unlockedAt: Date.now(),
      date: todayKey()
    };
  });

  showAchievementPopup(ach);
}

/* Show achievement unlock popup */
function showAchievementPopup(ach) {
  // Remove existing
  const existing = document.querySelector('.achievement-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'achievement-popup';
  popup.innerHTML = `
    <div class="ach-popup-inner">
      <div class="ach-popup-glow"></div>
      <div class="ach-popup-icon">${ach.icon}</div>
      <div class="ach-popup-content">
        <span class="ach-popup-label">ACHIEVEMENT UNLOCKED</span>
        <span class="ach-popup-title">${ach.title}</span>
        <span class="ach-popup-desc">${ach.desc}</span>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // Animate in
  requestAnimationFrame(() => {
    popup.classList.add('show');
  });

  // Remove after animation
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 500);
  }, 3000);
}

/* Get all achievements with unlock status */
function getAchievementsWithStatus() {
  const d = DB.get();
  const unlocked = d.achievements || {};

  return ACHIEVEMENT_DEFS.map(ach => ({
    ...ach,
    unlocked: !!unlocked[ach.id],
    unlockedAt: unlocked[ach.id]?.unlockedAt || null,
    unlockedDate: unlocked[ach.id]?.date || null,
  }));
}

/* Count unlocked achievements */
function getUnlockedCount() {
  const d = DB.get();
  return Object.keys(d.achievements || {}).length;
}

/* Render achievement badges HTML */
function renderAchievementBadges(limit) {
  const all = getAchievementsWithStatus();
  const unlocked = all.filter(a => a.unlocked).sort((a,b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));
  const display = limit ? unlocked.slice(0, limit) : unlocked;

  if (display.length === 0) {
    return '<div class="empty-badges">No achievements yet. Keep grinding!</div>';
  }

  return display.map(a => `
    <div class="ach-badge unlocked" title="${a.title}: ${a.desc}">
      <span class="ach-badge-icon">${a.icon}</span>
      <span class="ach-badge-title">${a.title}</span>
    </div>
  `).join('');
}
