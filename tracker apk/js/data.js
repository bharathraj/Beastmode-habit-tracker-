/* ===== DATA.JS — Central Storage Layer ===== */

const DB = {
  KEY: 'bm90_data',

  defaults() {
    return {
      pin: '0000',
      startDate: new Date().toISOString().split('T')[0],
      currency: '₹',
      theme: 'dark',
      calorieGoal: 2000,
      habits: {},   // { "YYYY-MM-DD": { wake:bool, gym:bool, ... } }
      body: {},     // { "YYYY-MM-DD": { weight, chest, waist, arms, notes } }
      money: {},    // { "YYYY-MM-DD": { earned, spent, notes } }
      mind: {},     // { "YYYY-MM-DD": { mood, energy, stress, reflection } }
      weekly: {},   // { "YYYY-MM-WW": { wins, mistakes, lessons, focus } }
      calorie: {},
      workout: {},
      customHabits: [],
      routines: [],
      sessions: {},
      transactions: [],
      beastScore: {},    // { 'YYYY-MM-DD': { score, tier, parts, ts } }
      xp: 0,             // total XP earned
      xpHistory: [],     // [{ amount, source, date, ts, total }]
      prevStreak: 0,     // last known streak before it broke
      coachMsg: {},      // { 'YYYY-MM-DD': 'message string' }
      coachDismissed: null, // 'YYYY-MM-DD' — dismissed date
      achievements: {},  // { 'achievement_id': { unlockedAt, date } }
      _lastSync: 0,      // timestamp of last cloud sync
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaults();
      return { ...this.defaults(), ...JSON.parse(raw) };
    } catch { return this.defaults(); }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  get() {
    if (!this._cache) this._cache = this.load();
    return this._cache;
  },

  set(updater) {
    const d = this.get();
    updater(d);
    this._cache = d;
    this.save(d);
  },

  reset() {
    this._cache = this.defaults();
    this.save(this._cache);
  }
};

/* ===== HELPERS ===== */
function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
}

function getDayNumber() {
  const d = DB.get();
  const start = new Date(d.startDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.floor((today - start) / 86400000);
  return Math.max(1, Math.min(diff + 1, 90));
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/* ===== HABIT DEFINITIONS ===== */
const HABITS = [
  { id: 'wake',     icon: '🌅', name: 'Wake Early',       sub: 'Before 6:30 AM' },
  { id: 'gym',      icon: '🏋️', name: 'Gym / Workout',    sub: 'Min 45 min session' },
  { id: 'reading',  icon: '📖', name: 'Reading',           sub: 'Min 20 pages' },
  { id: 'deepwork', icon: '🎯', name: 'Deep Work',         sub: '2+ hours of focus' },
  { id: 'meditation',icon:'🧘', name: 'Meditation',        sub: 'Min 10 minutes' },
  { id: 'nobad',    icon: '🚫', name: 'No Bad Habits',     sub: 'Zero vices today' },
  { id: 'sleep',    icon: '💤', name: 'Sleep on Time',     sub: 'Before 11 PM' },
  { id: 'skill',    icon: '⚡', name: 'Skill Growth',      sub: 'Learn something new' },
  { id: 'journal',  icon: '📓', name: 'Journal',           sub: 'Write your thoughts' },
  { id: 'dopamine', icon: '🧠', name: 'Dopamine Control',  sub: 'No mindless scrolling' },
];

/* ===== GAMIFICATION ===== */
const LEVELS = [
  { name: 'Rookie',   min: 0,    icon: '🥉' },
  { name: 'Warrior',  min: 100,  icon: '⚔️' },
  { name: 'Beast',    min: 300,  icon: '🔥' },
  { name: 'Elite',    min: 600,  icon: '💎' },
  { name: 'Legend',   min: 1000, icon: '👑' },
];

function calcXP() {
  const d = DB.get();
  const allH = [...HABITS, ...(d.customHabits || [])];
  let xp = 0;
  Object.values(d.habits).forEach(day => {
    allH.forEach(h => { if (day[h.id]) xp += 10; });
  });
  return xp;
}

function getLevel(xp) {
  let level = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.min) level = l; }
  return level;
}

function calcStreak() {
  const d = DB.get();
  const allH = [...HABITS, ...(d.customHabits || [])];
  const minDone = Math.max(5, Math.floor(allH.length * 0.5));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().split('T')[0];
    const dayH = d.habits[key] || {};
    const score = allH.filter(h => dayH[h.id]).length;
    if (score >= minDone) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function calcBestStreak() {
  const d = DB.get();
  const start = new Date(d.startDate + 'T00:00:00');
  let best = 0, cur = 0;
  for (let i = 0; i < 90; i++) {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + i);
    const key = dt.toISOString().split('T')[0];
    const dayH = d.habits[key] || {};
    const score = HABITS.filter(h => dayH[h.id]).length;
    if (score >= 5) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }
  return best;
}

function calcAvgScore() {
  const d = DB.get();
  const allH = [...HABITS, ...(d.customHabits || [])];
  const keys = Object.keys(d.habits);
  if (!keys.length) return 0;
  const total = keys.reduce((sum, k) => {
    const score = allH.filter(h => d.habits[k][h.id]).length;
    return sum + score;
  }, 0);
  return Math.round((total / (keys.length * allH.length)) * 100);
}

/* ===== QUOTES ===== */
const QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Hard days build strong men. Don't wish it was easier, wish you were better.", author: "Beast Mode 90" },
  { text: "Discipline is doing what needs to be done, even when you don't want to do it.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Your future self is watching you right now through your memories.", author: "Aubrey De Grey" },
  { text: "The only person you should try to be better than is who you were yesterday.", author: "Unknown" },
  { text: "It never gets easier. You just get stronger.", author: "Beast Mode 90" },
  { text: "Motivation gets you started. Discipline keeps you going.", author: "Jim Ryun" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "The best project you'll ever work on is you.", author: "Beast Mode 90" },
  { text: "Comfort is the enemy of growth.", author: "Unknown" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "You have to be odd to be number one.", author: "Dr. Seuss" },
  { text: "The harder you work, the luckier you get.", author: "Gary Player" },
  { text: "Be the hardest working person you know.", author: "Beast Mode 90" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
];

function getDailyQuote() {
  const day = getDayNumber() - 1;
  return QUOTES[day % QUOTES.length];
}
