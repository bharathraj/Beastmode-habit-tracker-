/* ===== WORKOUT.JS ===== */

let _workoutChart = null;
let _selectedCategory = 'Strength';
let _currentExercise = null;
let _tempSets = [];

/* ===== EXERCISE DATABASE ===== */
const WORKOUT_CATEGORIES = [
  { id: 'Strength', icon: '🏋️', label: 'Strength' },
  { id: 'Hypertrophy', icon: '💪', label: 'Hypertrophy' },
  { id: 'Cardio', icon: '🏃', label: 'Cardio' },
  { id: 'Calisthenics', icon: '🤸', label: 'Calisthenics' },
  { id: 'HIIT', icon: '⚡', label: 'HIIT' },
  { id: 'Flexibility', icon: '🧘', label: 'Flexibility' },
  { id: 'Sports', icon: '⚽', label: 'Sports' },
  { id: 'Recovery', icon: '🛌', label: 'Recovery' },
];

const EXERCISES_DB = {
  Strength: [
    { name: 'Barbell Squat', muscle: 'Quads, Glutes, Core', icon: '🦵' },
    { name: 'Deadlift', muscle: 'Hamstrings, Back, Glutes', icon: '🏋️' },
    { name: 'Bench Press', muscle: 'Chest, Triceps, Delts', icon: '💪' },
    { name: 'Overhead Press', muscle: 'Delts, Triceps, Core', icon: '🙌' },
    { name: 'Barbell Row', muscle: 'Back, Biceps, Rear Delt', icon: '🔙' },
    { name: 'Romanian Deadlift', muscle: 'Hamstrings, Glutes', icon: '🦵' },
    { name: 'Front Squat', muscle: 'Quads, Core, Glutes', icon: '🦵' },
    { name: 'Sumo Deadlift', muscle: 'Inner Thighs, Glutes', icon: '🏋️' },
    { name: 'Power Clean', muscle: 'Full Body Explosive', icon: '⚡' },
    { name: 'Snatch', muscle: 'Full Body Olympic Lift', icon: '🎯' },
  ],
  Hypertrophy: [
    { name: 'Incline Dumbbell Press', muscle: 'Upper Chest, Delts', icon: '📐' },
    { name: 'Cable Flyes', muscle: 'Chest, Inner Pec', icon: '🔄' },
    { name: 'Lat Pulldown', muscle: 'Lats, Biceps', icon: '⬇️' },
    { name: 'Seated Row', muscle: 'Mid Back, Biceps', icon: '🚣' },
    { name: 'Dumbbell Curl', muscle: 'Biceps, Brachialis', icon: '💪' },
    { name: 'Tricep Pushdown', muscle: 'Triceps', icon: '⬇️' },
    { name: 'Skull Crushers', muscle: 'Triceps Long Head', icon: '💀' },
    { name: 'Lateral Raise', muscle: 'Lateral Delts', icon: '↔️' },
    { name: 'Face Pull', muscle: 'Rear Delt, Rotator Cuff', icon: '🎯' },
    { name: 'Leg Press', muscle: 'Quads, Glutes', icon: '🦵' },
    { name: 'Leg Curl', muscle: 'Hamstrings', icon: '🦿' },
    { name: 'Calf Raise', muscle: 'Calves', icon: '🦶' },
    { name: 'Hip Thrust', muscle: 'Glutes, Hamstrings', icon: '🍑' },
    { name: 'Preacher Curl', muscle: 'Biceps Peak', icon: '💪' },
    { name: 'Chest Dip', muscle: 'Lower Chest, Triceps', icon: '🔽' },
  ],
  Cardio: [
    { name: 'Running', muscle: 'Full Body Cardio', icon: '🏃' },
    { name: 'Treadmill', muscle: 'Cardio, Legs', icon: '🏃' },
    { name: 'Cycling', muscle: 'Quads, Calves, Cardio', icon: '🚴' },
    { name: 'Rowing', muscle: 'Back, Arms, Cardio', icon: '🚣' },
    { name: 'Jump Rope', muscle: 'Full Body, Calves', icon: '➿' },
    { name: 'Swimming', muscle: 'Full Body', icon: '🏊' },
    { name: 'Elliptical', muscle: 'Low Impact Cardio', icon: '🔄' },
    { name: 'Stair Climber', muscle: 'Glutes, Quads', icon: '🪜' },
  ],
  Calisthenics: [
    { name: 'Pull-Ups', muscle: 'Lats, Biceps, Core', icon: '🔝' },
    { name: 'Push-Ups', muscle: 'Chest, Triceps, Core', icon: '⬆️' },
    { name: 'Dips', muscle: 'Triceps, Chest, Shoulders', icon: '🔽' },
    { name: 'Pistol Squats', muscle: 'Quads, Balance', icon: '🦵' },
    { name: 'Muscle Ups', muscle: 'Full Upper Body', icon: '⚡' },
    { name: 'L-Sit', muscle: 'Core, Hip Flexors', icon: '📐' },
    { name: 'Handstand Push-Up', muscle: 'Delts, Triceps', icon: '🙃' },
    { name: 'Dragon Flag', muscle: 'Core, Lower Back', icon: '🐉' },
    { name: 'Human Flag', muscle: 'Core, Lateral Delts', icon: '🚩' },
    { name: 'Front Lever', muscle: 'Lats, Core', icon: '↔️' },
    { name: 'Planche', muscle: 'Full Upper Body, Core', icon: '🔮' },
  ],
  HIIT: [
    { name: 'Burpees', muscle: 'Full Body Explosive', icon: '💥' },
    { name: 'Box Jumps', muscle: 'Quads, Glutes, Explosive', icon: '📦' },
    { name: 'Battle Ropes', muscle: 'Arms, Core, Cardio', icon: '🌊' },
    { name: 'Kettlebell Swings', muscle: 'Glutes, Core, Power', icon: '🫙' },
    { name: 'Sprints', muscle: 'Full Body Explosive', icon: '⚡' },
    { name: 'Mountain Climbers', muscle: 'Core, Shoulders, Cardio', icon: '🏔️' },
    { name: 'Sled Push', muscle: 'Quads, Core, Total Body', icon: '🛷' },
    { name: 'Assault Bike', muscle: 'Full Body Max Effort', icon: '🚴' },
  ],
  Flexibility: [
    { name: 'Hip Flexor Stretch', muscle: 'Hips, Lower Back', icon: '🧘' },
    { name: 'Hamstring Stretch', muscle: 'Hamstrings', icon: '🦵' },
    { name: 'Shoulder Stretch', muscle: 'Shoulders, Rotator Cuff', icon: '🙆' },
    { name: 'Pigeon Pose', muscle: 'Hip Flexors, Glutes', icon: '🕊️' },
    { name: 'Cat-Cow Stretch', muscle: 'Spine, Core', icon: '🐱' },
    { name: 'Thoracic Rotation', muscle: 'Upper Back Mobility', icon: '🔄' },
    { name: 'Foam Rolling', muscle: 'Myofascial Release', icon: '🛞' },
    { name: 'Yoga Flow', muscle: 'Full Body Flexibility', icon: '🧘' },
  ],
  Sports: [
    { name: 'Football', muscle: 'Full Body', icon: '⚽' },
    { name: 'Basketball', muscle: 'Full Body, Jumps', icon: '🏀' },
    { name: 'Tennis', muscle: 'Arms, Core, Legs', icon: '🎾' },
    { name: 'Badminton', muscle: 'Full Body, Agility', icon: '🏸' },
    { name: 'Cricket', muscle: 'Full Body', icon: '🏏' },
    { name: 'MMA / Boxing', muscle: 'Full Body, Explosive', icon: '🥊' },
    { name: 'Rock Climbing', muscle: 'Full Body, Grip', icon: '🧗' },
    { name: 'Wrestling', muscle: 'Full Body, Core', icon: '🤼' },
  ],
  Recovery: [
    { name: 'Active Recovery Walk', muscle: 'Light Cardio', icon: '🚶' },
    { name: 'Ice Bath', muscle: 'Recovery, CNS', icon: '🧊' },
    { name: 'Massage', muscle: 'Full Body Recovery', icon: '💆' },
    { name: 'Sauna', muscle: 'Cardiovascular, Recovery', icon: '🌡️' },
    { name: 'Sleep Optimization', muscle: 'Full Body Recovery', icon: '💤' },
    { name: 'Breathing Exercises', muscle: 'Nervous System', icon: '🌬️' },
  ],
};

/* ===== RENDER WORKOUT SCREEN ===== */
function renderWorkoutScreen() {
  const today = todayKey();
  document.getElementById('workoutDate').textContent = formatDate(today);

  initRoutines();
  renderWorkoutCategories();
  renderExerciseList('');
  renderWorkoutLog();
  renderWorkoutSummary();
  renderWorkoutChart();
  renderWorkoutHistory();
  renderRoutinesList();
}

/* ===== CATEGORY GRID ===== */
function renderWorkoutCategories() {
  const grid = document.getElementById('workoutCategoryGrid');
  grid.innerHTML = '';
  WORKOUT_CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'workout-cat-btn' + (cat.id === _selectedCategory ? ' active' : '');
    btn.innerHTML = `<span class="cat-icon">${cat.icon}</span><span class="cat-label">${cat.label}</span>`;
    btn.addEventListener('click', () => {
      _selectedCategory = cat.id;
      document.querySelectorAll('.workout-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExerciseList(document.getElementById('exerciseSearch').value);
    });
    grid.appendChild(btn);
  });
}

/* ===== EXERCISE SEARCH ===== */
document.getElementById('exerciseSearch').addEventListener('input', function () {
  renderExerciseList(this.value);
});

function renderExerciseList(query = '') {
  const list = document.getElementById('exerciseList');
  list.innerHTML = '';
  const exercises = EXERCISES_DB[_selectedCategory] || [];
  const filtered = query
    ? Object.values(EXERCISES_DB).flat().filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : exercises;

  if (!filtered.length) {
    list.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:16px">No exercises found.</p>';
    return;
  }

  filtered.slice(0, 20).forEach(ex => {
    const item = document.createElement('div');
    item.className = 'exercise-item';
    item.innerHTML = `
      <span class="ex-icon">${ex.icon}</span>
      <div class="ex-info">
        <span class="ex-name">${ex.name}</span>
        <span class="ex-muscle">${ex.muscle}</span>
      </div>
      <button class="ex-add-btn">+ LOG</button>
    `;
    item.querySelector('.ex-add-btn').addEventListener('click', () => openExerciseModal(ex));
    list.appendChild(item);
  });
}

/* ===== EXERCISE LOG MODAL ===== */
function openExerciseModal(exercise) {
  _currentExercise = exercise;
  _tempSets = [{ reps: '', weight: '' }];
  document.getElementById('exerciseModalTitle').textContent = exercise.name.toUpperCase();
  renderSetsContainer();
  renderFormGuide(exercise);
  _formGuideVisible = true;
  const body = document.getElementById('formGuideBody');
  if (body) body.style.display = '';
  const btn = document.getElementById('formGuideToggle');
  if (btn) btn.textContent = 'Hide ▲';
  document.getElementById('exerciseLogModal').classList.remove('hidden');
}

function renderSetsContainer() {
  const container = document.getElementById('exerciseSetsContainer');
  container.innerHTML = '';
  _tempSets.forEach((set, idx) => {
    const row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML = `
      <span class="set-num">Set ${idx + 1}</span>
      <div class="set-inputs">
        <div class="set-field">
          <label class="form-label">Reps</label>
          <input type="number" class="form-input set-reps" data-idx="${idx}" value="${set.reps}" placeholder="0" min="0"/>
        </div>
        <div class="set-field">
          <label class="form-label">Weight (kg)</label>
          <input type="number" class="form-input set-weight" data-idx="${idx}" value="${set.weight}" placeholder="0" min="0" step="0.5"/>
        </div>
        <button class="set-delete" data-idx="${idx}">✕</button>
      </div>
    `;
    container.appendChild(row);
  });
  // Wire events
  container.querySelectorAll('.set-reps').forEach(inp => {
    inp.addEventListener('change', () => { _tempSets[inp.dataset.idx].reps = inp.value; });
  });
  container.querySelectorAll('.set-weight').forEach(inp => {
    inp.addEventListener('change', () => { _tempSets[inp.dataset.idx].weight = inp.value; });
  });
  container.querySelectorAll('.set-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      _tempSets.splice(parseInt(btn.dataset.idx), 1);
      renderSetsContainer();
    });
  });
}

document.getElementById('addSetBtn').addEventListener('click', () => {
  _tempSets.push({ reps: '', weight: '' });
  renderSetsContainer();
});

document.getElementById('saveExerciseSetsBtn').addEventListener('click', () => {
  if (!_currentExercise) return;
  // Collect values from inputs
  const repsInputs = document.querySelectorAll('.set-reps');
  const weightInputs = document.querySelectorAll('.set-weight');
  repsInputs.forEach((inp, i) => { if (_tempSets[i]) _tempSets[i].reps = parseFloat(inp.value) || 0; });
  weightInputs.forEach((inp, i) => { if (_tempSets[i]) _tempSets[i].weight = parseFloat(inp.value) || 0; });

  const validSets = _tempSets.filter(s => s.reps > 0);
  if (!validSets.length) { showToast('⚠️ Add at least 1 set with reps!'); return; }

  const today = todayKey();
  DB.set(d => {
    if (!d.workout[today]) d.workout[today] = { exercises: [], notes: '', duration: 0 };
    d.workout[today].exercises.push({
      name: _currentExercise.name,
      category: _selectedCategory,
      icon: _currentExercise.icon,
      muscle: _currentExercise.muscle,
      sets: validSets,
      id: Date.now()
    });
  });

  document.getElementById('exerciseLogModal').classList.add('hidden');
  showToast(`✅ ${_currentExercise.name} logged!`);
  renderWorkoutLog();
  renderWorkoutSummary();
});

document.getElementById('closeExerciseModal').addEventListener('click', () => {
  document.getElementById('exerciseLogModal').classList.add('hidden');
});
document.getElementById('exerciseModalBackdrop').addEventListener('click', () => {
  document.getElementById('exerciseLogModal').classList.add('hidden');
});

/* ===== TODAY'S WORKOUT LOG ===== */
function renderWorkoutLog() {
  const today = todayKey();
  const d = DB.get();
  const exercises = (d.workout[today] || {}).exercises || [];
  const list = document.getElementById('workoutLogList');
  list.innerHTML = '';

  if (!exercises.length) {
    list.innerHTML = '<p class="workout-empty">No exercises logged today. Start training! 💪</p>';
    return;
  }

  exercises.forEach(ex => {
    const el = document.createElement('div');
    el.className = 'workout-log-item';
    const volume = ex.sets.reduce((s, set) => s + (set.reps || 0) * (set.weight || 0), 0);
    const setsHtml = ex.sets.map((set, i) =>
      `<span class="wl-set">${i + 1}: ${set.reps}×${set.weight}kg</span>`
    ).join('');
    el.innerHTML = `
      <div class="wl-header">
        <span class="wl-icon">${ex.icon}</span>
        <div class="wl-info">
          <span class="wl-name">${ex.name}</span>
          <span class="wl-muscle">${ex.muscle}</span>
        </div>
        <div class="wl-right">
          <span class="wl-vol">${volume}kg vol</span>
          <button class="wl-delete" data-id="${ex.id}">✕</button>
        </div>
      </div>
      <div class="wl-sets">${setsHtml}</div>
    `;
    el.querySelector('.wl-delete').addEventListener('click', () => {
      DB.set(d => {
        const dayW = d.workout[today];
        if (dayW) dayW.exercises = dayW.exercises.filter(e => e.id !== ex.id);
      });
      renderWorkoutLog();
      renderWorkoutSummary();
    });
    list.appendChild(el);
  });
}

/* ===== SUMMARY CARDS ===== */
function renderWorkoutSummary() {
  const today = todayKey();
  const d = DB.get();
  const dayW = d.workout[today] || {};
  const exercises = dayW.exercises || [];

  const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const totalVolume = exercises.reduce((s, ex) =>
    s + ex.sets.reduce((ss, set) => ss + (set.reps || 0) * (set.weight || 0), 0), 0);
  const duration = dayW.duration || 0;

  document.getElementById('wtExercises').textContent = exercises.length;
  document.getElementById('wtSets').textContent = totalSets;
  document.getElementById('wtVolume').textContent = Math.round(totalVolume);
  document.getElementById('wtDuration').textContent = duration + 'm';
}

/* ===== SAVE WORKOUT ===== */
document.getElementById('saveWorkoutBtn').addEventListener('click', () => {
  const today = todayKey();
  const notes = document.getElementById('workoutSessionNotes').value.trim();
  const duration = parseInt(document.getElementById('workoutDuration').value) || 0;

  const d = DB.get();
  if (!(d.workout[today] || {}).exercises?.length && !notes) {
    showToast('⚠️ Add some exercises before saving!'); return;
  }

  DB.set(d => {
    if (!d.workout[today]) d.workout[today] = { exercises: [], notes: '', duration: 0 };
    d.workout[today].notes = notes;
    d.workout[today].duration = duration;
    d.workout[today].savedAt = Date.now();
  });

  showToast('💪 Workout saved!');
  renderWorkoutSummary();
  renderWorkoutChart();
  renderWorkoutHistory();
});

/* ===== CLEAR WORKOUT ===== */
document.getElementById('clearWorkoutBtn').addEventListener('click', () => {
  if (!confirm('Clear today\'s workout log?')) return;
  const today = todayKey();
  DB.set(d => { d.workout[today] = { exercises: [], notes: '', duration: 0 }; });
  renderWorkoutLog();
  renderWorkoutSummary();
  showToast('Workout cleared');
});

/* ===== VOLUME CHART ===== */
function renderWorkoutChart() {
  const d = DB.get();
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    days.push(dt.toISOString().split('T')[0]);
  }
  const labels = days.map(k => new Date(k + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' }));
  const volumes = days.map(k => {
    const exs = (d.workout[k] || {}).exercises || [];
    return Math.round(exs.reduce((s, ex) =>
      s + ex.sets.reduce((ss, set) => ss + (set.reps || 0) * (set.weight || 0), 0), 0));
  });

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const tickColor = isDark ? '#666' : '#888';

  const canvas = document.getElementById('workoutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (_workoutChart) { _workoutChart.destroy(); _workoutChart = null; }

  _workoutChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Volume (kg)',
        data: volumes,
        borderColor: '#cc0000',
        backgroundColor: 'rgba(204,0,0,0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#cc0000',
        pointRadius: 4,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tickColor, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => `Volume: ${ctx.raw} kg` } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 }, maxRotation: 45 } },
        y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } }, beginAtZero: true }
      }
    }
  });
}

/* ===== HISTORY ===== */
function renderWorkoutHistory() {
  const d = DB.get();
  const list = document.getElementById('workoutHistoryList');
  list.innerHTML = '';

  const entries = Object.entries(d.workout)
    .filter(([,v]) => v.exercises && v.exercises.length)
    .sort(([a],[b]) => b.localeCompare(a))
    .slice(0, 10);

  if (!entries.length) {
    list.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:0 16px">No workout history yet.</p>';
    return;
  }

  entries.forEach(([date, val]) => {
    const el = document.createElement('div');
    el.className = 'log-item';
    const totalVol = val.exercises.reduce((s, ex) =>
      s + ex.sets.reduce((ss, set) => ss + (set.reps || 0) * (set.weight || 0), 0), 0);
    const exNames = val.exercises.map(e => e.name).join(', ');
    el.innerHTML = `
      <div class="log-item-date">${formatDate(date)}</div>
      <div class="log-item-val">${val.exercises.length} exercises · ${Math.round(totalVol)}kg vol${val.duration ? ` · ${val.duration}m` : ''}</div>
      <div class="log-item-body" style="margin-top:4px">${exNames}</div>
      ${val.notes ? `<div class="log-item-body" style="color:var(--text3);margin-top:4px">${val.notes}</div>` : ''}
    `;
    list.appendChild(el);
  });
}
