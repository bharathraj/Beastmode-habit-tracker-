/* ===== EXERCISE FORM GUIDES ===== */

const EXERCISE_GUIDES = {
  'Barbell Squat': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Bar -->
      <rect x="20" y="38" width="160" height="6" rx="3" fill="#cc0000"/>
      <!-- Head -->
      <circle cx="100" cy="28" r="10" fill="#f0f0f0"/>
      <!-- Torso (upright) -->
      <line x1="100" y1="44" x2="100" y2="90" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Arms on bar -->
      <line x1="60" y1="44" x2="78" y2="55" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="140" y1="44" x2="122" y2="55" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Thighs (parallel) -->
      <line x1="100" y1="90" x2="75" y2="118" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="90" x2="125" y2="118" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Shins -->
      <line x1="75" y1="118" x2="70" y2="148" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="125" y1="118" x2="130" y2="148" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Feet -->
      <rect x="58" y="147" width="20" height="6" rx="3" fill="#aaa"/>
      <rect x="122" y="147" width="20" height="6" rx="3" fill="#aaa"/>
      <!-- Depth arrow -->
      <text x="8" y="120" fill="#cc0000" font-size="9" font-family="sans-serif">↕ ATG</text>
      <!-- Knee tracking -->
      <circle cx="75" cy="118" r="4" fill="none" stroke="#ffaa00" stroke-width="2"/>
      <circle cx="125" cy="118" r="4" fill="none" stroke="#ffaa00" stroke-width="2"/>
    </svg>`,
    cues: ['Feet shoulder-width, toes 30° out', 'Bar on rear delts, not neck', 'Chest up, core braced', 'Knees track over toes', 'Break parallel depth', 'Drive through heels'],
    tips: 'ATG (ass to grass) builds full ROM. Start light and prioritize form.',
    category: 'Strength'
  },
  'Deadlift': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Bar on floor -->
      <rect x="20" y="120" width="160" height="6" rx="3" fill="#cc0000"/>
      <!-- Plates -->
      <rect x="16" y="108" width="10" height="24" rx="3" fill="#555"/>
      <rect x="174" y="108" width="10" height="24" rx="3" fill="#555"/>
      <!-- Head -->
      <circle cx="100" cy="30" r="10" fill="#f0f0f0"/>
      <!-- Spine (neutral) -->
      <line x1="100" y1="40" x2="95" y2="90" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Hips hinge -->
      <line x1="95" y1="90" x2="85" y2="118" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="95" y1="90" x2="115" y2="118" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Shins vertical -->
      <line x1="85" y1="118" x2="88" y2="142" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="115" y1="118" x2="112" y2="142" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Arms down -->
      <line x1="95" y1="55" x2="93" y2="123" stroke="#f0f0f0" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="55" x2="107" y2="123" stroke="#f0f0f0" stroke-width="3" stroke-linecap="round"/>
      <!-- Neutral spine arrow -->
      <text x="108" y="65" fill="#00cc66" font-size="8" font-family="sans-serif">Neutral</text>
    </svg>`,
    cues: ['Bar over mid-foot at setup', 'Hip hinge — push floor away', 'Neutral spine throughout', 'Lats engaged (protect armpits)', 'Lock out hips at top', 'Control the descent'],
    tips: 'Never round the lower back. If you cannot keep neutral spine, reduce weight.',
    category: 'Strength'
  },
  'Bench Press': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Bench -->
      <rect x="30" y="110" width="140" height="12" rx="4" fill="#333"/>
      <rect x="40" y="122" width="10" height="25" rx="2" fill="#555"/>
      <rect x="150" y="122" width="10" height="25" rx="2" fill="#555"/>
      <!-- Bar -->
      <rect x="20" y="55" width="160" height="5" rx="2.5" fill="#cc0000"/>
      <!-- Person lying -->
      <circle cx="100" cy="95" r="9" fill="#f0f0f0"/>
      <line x1="100" y1="104" x2="100" y2="112" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Arms pressing -->
      <line x1="100" y1="108" x2="65" y2="58" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="108" x2="135" y2="58" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Arch indicator -->
      <path d="M 85 112 Q 100 105 115 112" stroke="#ffaa00" stroke-width="2" fill="none" stroke-dasharray="3,2"/>
      <text x="88" y="102" fill="#ffaa00" font-size="7" font-family="sans-serif">arch</text>
    </svg>`,
    cues: ['Retract & depress scapula', 'Slight natural arch in lower back', 'Grip just outside shoulder-width', 'Bar to lower chest (nipple line)', 'Feet flat, drive through heels', 'Full lockout at top'],
    tips: 'Leg drive transfers force through the entire kinetic chain. Do not neglect it.',
    category: 'Strength'
  },
  'Pull-Ups': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Bar -->
      <rect x="30" y="15" width="140" height="6" rx="3" fill="#cc0000"/>
      <!-- Head -->
      <circle cx="100" cy="38" r="10" fill="#f0f0f0"/>
      <!-- Torso -->
      <line x1="100" y1="48" x2="100" y2="95" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Arms -->
      <line x1="65" y1="18" x2="82" y2="50" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="135" y1="18" x2="118" y2="50" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Legs hanging straight -->
      <line x1="100" y1="95" x2="93" y2="135" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="95" x2="107" y2="135" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="93" y1="135" x2="90" y2="155" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="107" y1="135" x2="110" y2="155" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Chin over bar arrow -->
      <text x="112" y="35" fill="#00cc66" font-size="8" font-family="sans-serif">Chin ↑</text>
    </svg>`,
    cues: ['Dead hang — full arm extension', 'Depress scapula before pulling', 'Lead with elbows down & back', 'Chin clears the bar', 'Squeeze lats at top', 'Control the negative 3s'],
    tips: 'Scapular pull-ups are great to build the initial strength. Avoid kipping unless for CrossFit.',
    category: 'Calisthenics'
  },
  'Overhead Press': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Bar overhead -->
      <rect x="20" y="18" width="160" height="5" rx="2.5" fill="#cc0000"/>
      <!-- Head -->
      <circle cx="100" cy="42" r="10" fill="#f0f0f0"/>
      <!-- Torso -->
      <line x1="100" y1="52" x2="100" y2="105" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Arms overhead -->
      <line x1="100" y1="65" x2="55" y2="22" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="65" x2="145" y2="22" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Legs standing -->
      <line x1="100" y1="105" x2="88" y2="148" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="105" x2="112" y2="148" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Core brace indicator -->
      <text x="108" y="80" fill="#ffaa00" font-size="8" font-family="sans-serif">Brace!</text>
    </svg>`,
    cues: ['Feet hip-width, core tight', 'Bar rests on front delts at start', 'Press straight up — head moves back', 'Bar stacked over spine at top', 'Squeeze glutes to protect spine', 'Lower controlled to clavicle'],
    tips: 'The OHP is the truest test of shoulder strength. Never hyperextend the lower back.',
    category: 'Strength'
  },
  'Push-Ups': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Floor -->
      <rect x="0" y="145" width="200" height="4" fill="#333"/>
      <!-- Body plank -->
      <circle cx="40" cy="95" r="9" fill="#f0f0f0"/>
      <line x1="49" y1="100" x2="155" y2="110" stroke="#f0f0f0" stroke-width="6" stroke-linecap="round"/>
      <!-- Arms -->
      <line x1="49" y1="100" x2="35" y2="140" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="49" y1="100" x2="100" y2="125" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="125" x2="102" y2="142" stroke="#f0f0f0" stroke-width="3" stroke-linecap="round"/>
      <!-- Legs -->
      <line x1="155" y1="110" x2="168" y2="143" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Plank line -->
      <line x1="40" y1="100" x2="165" y2="113" stroke="#ffaa00" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="158" y="108" fill="#ffaa00" font-size="7" font-family="sans-serif">plank</text>
    </svg>`,
    cues: ['Straight plank from head to heels', 'Hands slightly wider than shoulders', 'Elbows 45° from body', 'Lower chest to 1 fist from ground', 'Do not let hips sag or pike', 'Full lockout at top'],
    tips: 'Elevate hands on a surface to regress. Add a weight plate on back to progress.',
    category: 'Calisthenics'
  },
  'Dumbbell Curl': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Person -->
      <circle cx="100" cy="30" r="10" fill="#f0f0f0"/>
      <line x1="100" y1="40" x2="100" y2="95" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Curling arm -->
      <line x1="100" y1="60" x2="130" y2="75" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="130" y1="75" x2="118" y2="50" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Dumbbell -->
      <rect x="112" y="40" width="16" height="8" rx="3" fill="#cc0000"/>
      <!-- Other arm hanging -->
      <line x1="100" y1="60" x2="68" y2="80" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="68" y1="80" x2="65" y2="110" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <rect x="58" y="108" width="14" height="6" rx="2" fill="#555"/>
      <!-- Legs -->
      <line x1="100" y1="95" x2="90" y2="148" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="95" x2="110" y2="148" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Arc -->
      <path d="M 130 75 Q 125 55 118 50" stroke="#00cc66" stroke-width="1.5" fill="none" stroke-dasharray="3,2"/>
    </svg>`,
    cues: ['Upper arms pinned at sides', 'Supinate wrist as you curl up', 'Squeeze bicep hard at peak', 'Do not swing torso', 'Full extension at bottom', 'Slow 3-second negative'],
    tips: 'Alternate arms or do both together. Hammer curls hit the brachialis differently.',
    category: 'Hypertrophy'
  },
  'Lat Pulldown': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Cable machine top -->
      <rect x="70" y="5" width="60" height="8" rx="3" fill="#555"/>
      <line x1="100" y1="13" x2="60" y2="38" stroke="#aaa" stroke-width="2"/>
      <line x1="100" y1="13" x2="140" y2="38" stroke="#aaa" stroke-width="2"/>
      <!-- Bar -->
      <rect x="50" y="35" width="100" height="5" rx="2.5" fill="#cc0000"/>
      <!-- Person seated -->
      <circle cx="100" cy="65" r="10" fill="#f0f0f0"/>
      <line x1="100" y1="75" x2="100" y2="115" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Arms pulling -->
      <line x1="60" y1="38" x2="82" y2="75" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="140" y1="38" x2="118" y2="75" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Legs on pads -->
      <line x1="100" y1="115" x2="75" y2="130" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="115" x2="125" y2="130" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <rect x="62" y="128" width="20" height="6" rx="2" fill="#333"/>
      <rect x="118" y="128" width="20" height="6" rx="2" fill="#333"/>
    </svg>`,
    cues: ['Grip wider than shoulders', 'Slight lean back (10-15°)', 'Pull elbows to hips — not down', 'Bar to upper chest, not behind neck', 'Squeeze lats 1s at bottom', 'Full stretch at top'],
    tips: 'Think "pull the bar to your chest" not "pull your hands down". Leads to better lat activation.',
    category: 'Hypertrophy'
  },
  'Burpees': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Phase 1: Stand -->
      <circle cx="30" cy="28" r="8" fill="#f0f0f0" opacity="0.5"/>
      <line x1="30" y1="36" x2="30" y2="65" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
      <text x="22" y="78" fill="#aaa" font-size="7" font-family="sans-serif">Start</text>
      <!-- Phase 2: Squat down -->
      <circle cx="80" cy="60" r="8" fill="#f0f0f0" opacity="0.7"/>
      <line x1="80" y1="68" x2="80" y2="90" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <line x1="80" y1="90" x2="65" y2="105" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <line x1="80" y1="90" x2="95" y2="105" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <text x="68" y="118" fill="#aaa" font-size="7" font-family="sans-serif">Squat</text>
      <!-- Phase 3: Plank -->
      <circle cx="140" cy="98" r="8" fill="#f0f0f0"/>
      <line x1="148" y1="102" x2="178" y2="110" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="148" y1="102" x2="135" y2="130" stroke="#f0f0f0" stroke-width="3" stroke-linecap="round"/>
      <line x1="135" y1="130" x2="133" y2="145" stroke="#f0f0f0" stroke-width="3" stroke-linecap="round"/>
      <line x1="178" y1="110" x2="180" y2="130" stroke="#f0f0f0" stroke-width="3" stroke-linecap="round"/>
      <line x1="180" y1="130" x2="182" y2="145" stroke="#f0f0f0" stroke-width="3" stroke-linecap="round"/>
      <!-- Jump arrow -->
      <text x="18" y="15" fill="#cc0000" font-size="9" font-family="sans-serif">↑ Jump!</text>
      <text x="122" y="90" fill="#00cc66" font-size="7" font-family="sans-serif">Plank</text>
    </svg>`,
    cues: ['Start standing — feet hip-width', 'Squat down, place hands on floor', 'Jump feet back to plank', 'Perform a push-up (optional)', 'Jump feet forward to hands', 'Explode up — full extension & clap'],
    tips: 'For HIIT, prioritize speed. For strength-endurance, add the push-up. Scale by stepping instead of jumping.',
    category: 'HIIT'
  },
  'Hip Thrust': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Bench -->
      <rect x="20" y="95" width="80" height="14" rx="4" fill="#333"/>
      <!-- Floor -->
      <rect x="0" y="150" width="200" height="5" fill="#333"/>
      <!-- Bar -->
      <rect x="60" y="75" width="120" height="5" rx="2.5" fill="#cc0000"/>
      <!-- Person -->
      <circle cx="70" cy="72" r="9" fill="#f0f0f0"/>
      <!-- Torso leaning on bench -->
      <line x1="70" y1="81" x2="55" y2="100" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Hips thrust up -->
      <line x1="55" y1="100" x2="90" y2="95" stroke="#f0f0f0" stroke-width="6" stroke-linecap="round"/>
      <!-- Thighs -->
      <line x1="90" y1="95" x2="110" y2="130" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <!-- Shins vertical -->
      <line x1="110" y1="130" x2="108" y2="150" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <!-- Hip lock arrow -->
      <text x="88" y="88" fill="#cc0000" font-size="8" font-family="sans-serif">↑ Lock!</text>
    </svg>`,
    cues: ['Upper back rests on bench edge', 'Feet flat, shoulder-width apart', 'Drive through heels', 'Squeeze glutes hard at top', 'Full hip extension — neutral spine', 'Control the descent'],
    tips: 'Hip thrusts are the single best glute isolation. Use a pad for barbell comfort.',
    category: 'Hypertrophy'
  },
  'DEFAULT': {
    svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <!-- Generic person -->
      <circle cx="100" cy="30" r="12" fill="#f0f0f0"/>
      <line x1="100" y1="42" x2="100" y2="100" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="60" x2="70" y2="85" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="60" x2="130" y2="85" stroke="#f0f0f0" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="80" y2="148" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="120" y2="148" stroke="#f0f0f0" stroke-width="5" stroke-linecap="round"/>
      <text x="62" y="10" fill="#cc0000" font-size="10" font-family="sans-serif">FORM CHECK</text>
    </svg>`,
    cues: ['Maintain proper form throughout', 'Control the weight in both directions', 'Breathe out on the exertion phase', 'Keep core engaged', 'Full range of motion', 'Quality over quantity'],
    tips: 'Focus on the mind-muscle connection. Feel the target muscle working on every rep.',
    category: 'General'
  }
};

/* ===== RENDER FORM GUIDE ===== */
let _formGuideVisible = true;

function renderFormGuide(exercise) {
  const guide = EXERCISE_GUIDES[exercise.name] || EXERCISE_GUIDES['DEFAULT'];
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const textCol = isDark ? '#f0f0f0' : '#111';
  const svgStr = guide.svg.replace(/fill="#f0f0f0"/g, `fill="${textCol}"`).replace(/stroke="#f0f0f0"/g, `stroke="${textCol}"`);

  document.getElementById('formGuideVisual').innerHTML = svgStr;

  const cuesEl = document.getElementById('formGuideCues');
  cuesEl.innerHTML = `
    <div class="fg-cues-list">
      ${guide.cues.map(c => `<div class="fg-cue"><span class="fg-cue-dot"></span>${c}</div>`).join('')}
    </div>
    <div class="fg-tip">💡 ${guide.tips}</div>
  `;
}

/* ===== TOGGLE GUIDE VISIBILITY ===== */
document.getElementById('formGuideToggle').addEventListener('click', () => {
  _formGuideVisible = !_formGuideVisible;
  const body = document.getElementById('formGuideBody');
  const btn = document.getElementById('formGuideToggle');
  body.style.display = _formGuideVisible ? '' : 'none';
  btn.textContent = _formGuideVisible ? 'Hide ▲' : 'Show ▼';
});
