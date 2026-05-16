/* ===== NARUTO.JS — Naruto-Inspired Level & Rank System ===== */

const NARUTO_RANKS = [
  { level: 1,   title: 'Academy Student',   icon: '🎓', chakra: '#87ceeb', minXP: 0,     unlock: 'Basic tracking unlocked' },
  { level: 5,   title: 'Genin',              icon: '🍃', chakra: '#00cc66', minXP: 500,   unlock: 'Custom habits (5 max)' },
  { level: 10,  title: 'Chunin',             icon: '⚔️', chakra: '#ff8800', minXP: 1500,  unlock: 'Advanced analytics' },
  { level: 15,  title: 'Jonin',              icon: '🌀', chakra: '#cc0000', minXP: 3000,  unlock: 'AI Coach insights' },
  { level: 20,  title: 'ANBU',               icon: '🎭', chakra: '#8b00ff', minXP: 5000,  unlock: 'Profile badges' },
  { level: 25,  title: 'Rogue Ninja',        icon: '💀', chakra: '#ff0066', minXP: 8000,  unlock: 'Dark mode themes' },
  { level: 30,  title: 'Akatsuki Member',    icon: '☁️', chakra: '#cc0000', minXP: 12000, unlock: 'Beast Score history' },
  { level: 40,  title: 'Sage Warrior',       icon: '🐸', chakra: '#ff6600', minXP: 18000, unlock: 'Sage mode effects' },
  { level: 50,  title: 'Mangekyo User',      icon: '👁️', chakra: '#ff0000', minXP: 26000, unlock: 'Sharingan effects' },
  { level: 60,  title: 'Eternal Mangekyo',   icon: '🔴', chakra: '#990000', minXP: 36000, unlock: 'Eternal effects' },
  { level: 75,  title: 'Six Paths Warrior',  icon: '✨', chakra: '#ffd700', minXP: 50000, unlock: 'Six paths mode' },
  { level: 100, title: 'Hokage Candidate',   icon: '🔥', chakra: '#ff4500', minXP: 70000, unlock: 'Hokage seal' },
  { level: 150, title: 'Shadow Hokage',      icon: '👤', chakra: '#1a1a2e', minXP: 100000,unlock: 'Shadow cloak' },
  { level: 200, title: 'Uchiha Legend',      icon: '⚡', chakra: '#8a2be2', minXP: 150000,unlock: 'Legendary status' },
];

/* Get current Naruto rank from XP */
function getNarutoRank(xp) {
  let rank = NARUTO_RANKS[0];
  for (const r of NARUTO_RANKS) {
    if (xp >= r.minXP) rank = r;
  }
  return rank;
}

/* Get numeric level from XP (continuous, not just rank thresholds) */
function getNarutoLevel(xp) {
  // Each level needs progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 220 XP, etc
  // Formula: XP needed = 80 * level + 20 * level^1.2
  let level = 1;
  let totalXP = 0;
  while (true) {
    const needed = Math.floor(80 * level + 20 * Math.pow(level, 1.2));
    if (totalXP + needed > xp) break;
    totalXP += needed;
    level++;
  }
  return level;
}

/* Get XP needed for next level */
function getXPForNextLevel(xp) {
  let level = 1;
  let totalXP = 0;
  while (true) {
    const needed = Math.floor(80 * level + 20 * Math.pow(level, 1.2));
    if (totalXP + needed > xp) {
      return { currentLevel: level, xpInLevel: xp - totalXP, xpNeeded: needed, totalForNext: totalXP + needed };
    }
    totalXP += needed;
    level++;
  }
}

/* Get next rank from current XP */
function getNextNarutoRank(xp) {
  for (const r of NARUTO_RANKS) {
    if (r.minXP > xp) return r;
  }
  return null; // Max rank reached
}

/* Render Naruto rank badge HTML */
function renderNarutoRankBadge(xp) {
  const rank = getNarutoRank(xp);
  return `<span class="naruto-rank-badge" style="--chakra-color:${rank.chakra}">${rank.icon} ${rank.title}</span>`;
}

/* Trigger Naruto level-up animation */
function triggerNarutoLevelUp(oldLevel, newLevel, rank) {
  const modal = document.getElementById('levelUpModal');
  if (!modal) return;

  const icon = document.getElementById('levelupIcon');
  const title = document.getElementById('levelupTitle');
  const unlock = document.getElementById('levelupUnlock');

  if (icon) icon.textContent = rank.icon;
  if (title) {
    title.textContent = `Level ${newLevel} — ${rank.title}`;
    title.style.color = rank.chakra;
  }
  if (unlock) unlock.textContent = `🔓 ${rank.unlock}`;

  // Add chakra glow effect
  const sheet = modal.querySelector('.levelup-sheet');
  if (sheet) {
    sheet.style.setProperty('--chakra-glow', rank.chakra);
    sheet.classList.add('naruto-levelup');
  }

  modal.classList.remove('hidden');
  spawnFireworks();
  spawnChakraParticles(rank.chakra);
}

/* Spawn chakra particles for level-up */
function spawnChakraParticles(color) {
  const container = document.getElementById('levelupFireworks');
  if (!container) return;

  for (let i = 0; i < 16; i++) {
    const particle = document.createElement('div');
    particle.className = 'chakra-particle';
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      background: ${color};
      box-shadow: 0 0 12px ${color}, 0 0 24px ${color};
      animation-delay: ${Math.random() * 0.6}s;
      animation-duration: ${1 + Math.random() * 0.8}s;
    `;
    container.appendChild(particle);
  }
}

/* Build chakra XP progress bar HTML */
function renderChakraBar(xp) {
  const info = getXPForNextLevel(xp);
  const pct = info.xpNeeded > 0 ? (info.xpInLevel / info.xpNeeded) * 100 : 100;
  const rank = getNarutoRank(xp);
  const nextRank = getNextNarutoRank(xp);

  return `
    <div class="chakra-bar-wrap">
      <div class="chakra-bar-track">
        <div class="chakra-bar-fill" style="width:${Math.min(pct, 100)}%;background:linear-gradient(90deg, ${rank.chakra}, ${rank.chakra}cc)">
          <div class="chakra-bar-glow"></div>
        </div>
      </div>
      <div class="chakra-bar-labels">
        <span class="chakra-bar-level">${rank.icon} Lv.${info.currentLevel}</span>
        <span class="chakra-bar-xp">${xp.toLocaleString()} / ${info.totalForNext.toLocaleString()} XP</span>
        ${nextRank ? `<span class="chakra-bar-next">Next: ${nextRank.icon} ${nextRank.title}</span>` : '<span class="chakra-bar-next">✨ MAX RANK</span>'}
      </div>
    </div>
  `;
}
