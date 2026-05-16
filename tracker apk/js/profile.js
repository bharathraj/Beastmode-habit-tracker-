/* ===== PROFILE.JS — Profile & Achievements Page ===== */

function renderProfileScreen() {
  const d = DB.get();
  const xp = d.xp || 0;
  const rank = getNarutoRank(xp);
  const level = getNarutoLevel(xp);
  const info = getXPForNextLevel(xp);
  const streak = calcStreak();
  const bestStreak = calcBestStreak();
  const daysLogged = Object.keys(d.habits || {}).length;
  const totalWorkouts = Object.keys(d.sessions || {}).length;
  const beastScores = Object.values(d.beastScore || {});
  const avgBeast = beastScores.length > 0
    ? Math.round(beastScores.reduce((s, b) => s + b.score, 0) / beastScores.length)
    : 0;
  const bestBeast = beastScores.length > 0
    ? Math.max(...beastScores.map(b => b.score))
    : 0;
  const unlockedAchievements = getUnlockedCount();
  const totalAchievements = ACHIEVEMENT_DEFS.length;

  const profileContent = document.getElementById('profileContent');
  if (!profileContent) return;

  profileContent.innerHTML = `
    <!-- Rank Card -->
    <div class="profile-rank-card" style="--chakra:${rank.chakra}">
      <div class="profile-rank-glow"></div>
      <div class="profile-rank-icon">${rank.icon}</div>
      <div class="profile-rank-title">${rank.title}</div>
      <div class="profile-rank-level">Level ${level}</div>
      ${renderChakraBar(xp)}
    </div>

    <!-- Stats Grid -->
    <div class="section-header"><span>NINJA STATS</span></div>
    <div class="profile-stats-grid">
      <div class="profile-stat-card">
        <span class="profile-stat-icon">🔥</span>
        <span class="profile-stat-val">${streak}</span>
        <span class="profile-stat-lbl">Current Streak</span>
      </div>
      <div class="profile-stat-card">
        <span class="profile-stat-icon">🏆</span>
        <span class="profile-stat-val">${bestStreak}</span>
        <span class="profile-stat-lbl">Best Streak</span>
      </div>
      <div class="profile-stat-card">
        <span class="profile-stat-icon">⚡</span>
        <span class="profile-stat-val">${xp.toLocaleString()}</span>
        <span class="profile-stat-lbl">Total XP</span>
      </div>
      <div class="profile-stat-card">
        <span class="profile-stat-icon">📅</span>
        <span class="profile-stat-val">${daysLogged}</span>
        <span class="profile-stat-lbl">Days Logged</span>
      </div>
      <div class="profile-stat-card">
        <span class="profile-stat-icon">💪</span>
        <span class="profile-stat-val">${totalWorkouts}</span>
        <span class="profile-stat-lbl">Workouts</span>
      </div>
      <div class="profile-stat-card">
        <span class="profile-stat-icon">🎯</span>
        <span class="profile-stat-val">${avgBeast}</span>
        <span class="profile-stat-lbl">Avg Beast Score</span>
      </div>
    </div>

    <!-- Beast Score -->
    <div class="section-header"><span>BEAST SCORE</span></div>
    <div class="profile-beast-row">
      <div class="profile-beast-card">
        <span class="profile-beast-label">Average</span>
        <span class="profile-beast-value">${avgBeast}</span>
      </div>
      <div class="profile-beast-card">
        <span class="profile-beast-label">Personal Best</span>
        <span class="profile-beast-value" style="color:var(--red)">${bestBeast}</span>
      </div>
    </div>

    <!-- Achievements -->
    <div class="section-header">
      <span>ACHIEVEMENTS</span>
      <span class="ach-counter">${unlockedAchievements}/${totalAchievements}</span>
    </div>
    <div class="profile-achievements-grid">
      ${renderAllAchievements()}
    </div>

    <!-- Rank Progression -->
    <div class="section-header"><span>RANK JOURNEY</span></div>
    <div class="rank-journey">
      ${renderRankJourney(xp)}
    </div>
  `;
}

function renderAllAchievements() {
  const all = getAchievementsWithStatus();

  return all.map(a => `
    <div class="ach-card ${a.unlocked ? 'unlocked' : 'locked'}">
      <div class="ach-card-icon">${a.unlocked ? a.icon : '🔒'}</div>
      <div class="ach-card-info">
        <span class="ach-card-title">${a.title}</span>
        <span class="ach-card-desc">${a.desc}</span>
      </div>
      ${a.unlocked ? `<span class="ach-card-date">${formatDate(a.unlockedDate)}</span>` : ''}
    </div>
  `).join('');
}

function renderRankJourney(currentXP) {
  return NARUTO_RANKS.map(rank => {
    const achieved = currentXP >= rank.minXP;
    return `
      <div class="rank-journey-item ${achieved ? 'achieved' : 'locked'}">
        <div class="rank-journey-dot" style="background:${achieved ? rank.chakra : '#333'}"></div>
        <div class="rank-journey-line"></div>
        <div class="rank-journey-info">
          <span class="rank-journey-icon">${rank.icon}</span>
          <span class="rank-journey-title">${rank.title}</span>
          <span class="rank-journey-xp">${rank.minXP.toLocaleString()} XP</span>
        </div>
      </div>
    `;
  }).join('');
}
