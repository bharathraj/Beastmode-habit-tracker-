/* ===== XP.JS — Global XP Engine ===== */

const XP_REWARDS = {
  HABIT_COMPLETE:    10,
  WORKOUT_COMPLETE:  20,
  GOAL_COMPLETED:    50,
  DAILY_STREAK:      25,
  ACHIEVEMENT:       100,
  PERFECT_DAY:       50,
  WEEKLY_REVIEW:     30,
  MIND_LOG:          15,
  BODY_LOG:          10,
  CALORIE_LOG:       5,
  EXPENSE_LOG:       5,
};

/* Award XP with level-up check */
function grantXP(amount, source) {
  if (!amount || amount <= 0) return;

  const d = DB.get();
  const oldXP = d.xp || 0;
  const newXP = oldXP + amount;

  // Check level before and after
  const oldLevel = getNarutoLevel(oldXP);
  const newLevel = getNarutoLevel(newXP);
  const oldRank = getNarutoRank(oldXP);
  const newRank = getNarutoRank(newXP);

  DB.set(data => {
    data.xp = newXP;
    // Track XP history
    if (!data.xpHistory) data.xpHistory = [];
    data.xpHistory.push({
      amount,
      source: source || 'unknown',
      date: todayKey(),
      ts: Date.now(),
      total: newXP
    });
    // Keep last 500 entries
    if (data.xpHistory.length > 500) {
      data.xpHistory = data.xpHistory.slice(-500);
    }
  });

  // Check rank change
  if (newRank.level > oldRank.level) {
    setTimeout(() => triggerNarutoLevelUp(oldLevel, newLevel, newRank), 400);
  } else if (newLevel > oldLevel) {
    // Level up within same rank
    setTimeout(() => {
      const rank = getNarutoRank(newXP);
      triggerNarutoLevelUp(oldLevel, newLevel, rank);
    }, 400);
  }

  // Check achievements
  setTimeout(() => checkXPAchievements(newXP), 600);

  return newXP;
}

/* Calculate daily XP from today's activities */
function calcDailyXP() {
  const d = DB.get();
  const today = todayKey();
  const allH = [...HABITS, ...(d.customHabits || [])];
  const dayH = d.habits[today] || {};

  let dailyXP = 0;

  // Habits
  const habitsCompleted = allH.filter(h => dayH[h.id]).length;
  dailyXP += habitsCompleted * XP_REWARDS.HABIT_COMPLETE;

  // Perfect day bonus
  if (habitsCompleted === allH.length && allH.length > 0) {
    dailyXP += XP_REWARDS.PERFECT_DAY;
  }

  // Streak bonus
  const streak = calcStreak();
  if (streak > 0) {
    dailyXP += XP_REWARDS.DAILY_STREAK;
  }

  // Workout today
  const sessions = d.sessions || {};
  const todaySessions = Object.values(sessions).filter(s => s.date === today);
  if (todaySessions.length > 0) {
    dailyXP += XP_REWARDS.WORKOUT_COMPLETE;
  }

  return dailyXP;
}

/* Recalculate total XP from scratch (for data integrity) */
function recalcTotalXP() {
  const d = DB.get();
  const allH = [...HABITS, ...(d.customHabits || [])];
  let totalXP = 0;

  // All habit completions
  Object.values(d.habits || {}).forEach(day => {
    allH.forEach(h => {
      if (day[h.id]) totalXP += XP_REWARDS.HABIT_COMPLETE;
    });
  });

  // Workout sessions
  const sessionCount = Object.keys(d.sessions || {}).length;
  totalXP += sessionCount * XP_REWARDS.WORKOUT_COMPLETE;

  // Streak bonuses (approximate)
  const daysLogged = Object.keys(d.habits || {}).length;
  totalXP += Math.floor(daysLogged * 0.5) * XP_REWARDS.DAILY_STREAK;

  return totalXP;
}

/* Check for XP-based achievements */
function checkXPAchievements(xp) {
  const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
  milestones.forEach(m => {
    if (xp >= m) {
      unlockAchievement(`xp_${m}`);
    }
  });
}

/* Update dashboard XP display */
function updateXPDisplay() {
  const d = DB.get();
  const xp = d.xp || 0;
  const rank = getNarutoRank(xp);
  const level = getNarutoLevel(xp);
  const info = getXPForNextLevel(xp);
  const pct = info.xpNeeded > 0 ? (info.xpInLevel / info.xpNeeded) * 100 : 100;

  // Update stat cards
  const statXP = document.getElementById('statXP');
  const statLevel = document.getElementById('statLevel');
  if (statXP) statXP.textContent = xp.toLocaleString();
  if (statLevel) statLevel.textContent = `Lv.${level}`;

  // Update XP bar
  const xpFill = document.getElementById('xpBarFill');
  const xpLabel = document.getElementById('xpBarLabel');
  if (xpFill) {
    xpFill.style.width = Math.min(pct, 100) + '%';
    xpFill.style.background = `linear-gradient(90deg, ${rank.chakra}, ${rank.chakra}aa)`;
  }
  if (xpLabel) {
    xpLabel.textContent = `${rank.icon} ${rank.title}  —  ${xp.toLocaleString()} / ${info.totalForNext.toLocaleString()} XP`;
  }
}
