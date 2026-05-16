/* ===== ROUTINES.JS — Routine Management & Session Tracking ===== */

/* ─── State ─────────────────────────────────────────── */
let _activeRoutineId = null;   // which routine is being viewed
let _editingRoutineId = null;  // null = create, string = edit
let _routineSelectedExercises = []; // [{name,icon,muscle,sets,reps,rest}]

let _activeSession = null;     // { routineId, routineName, completedIds:Set, startedAt }
let _sessionTimerInterval = null;

/* ─── Default Starter Routines ─────────────────────── */
const DEFAULT_ROUTINES = [
  {
    id: 'default_push',
    name: 'Push Day',
    category: 'Push',
    exercises: [
      { name: 'Bench Press',          icon: '💪', muscle: 'Chest, Triceps, Delts',   sets: 4, reps: '6-8',  rest: 90 },
      { name: 'Overhead Press',        icon: '🙌', muscle: 'Delts, Triceps, Core',    sets: 3, reps: '8-10', rest: 90 },
      { name: 'Incline Dumbbell Press',icon: '📐', muscle: 'Upper Chest, Delts',      sets: 3, reps: '10-12',rest: 60 },
      { name: 'Lateral Raise',         icon: '↔️', muscle: 'Lateral Delts',           sets: 3, reps: '12-15',rest: 60 },
      { name: 'Tricep Pushdown',       icon: '⬇️', muscle: 'Triceps',                 sets: 3, reps: '12-15',rest: 60 },
    ]
  },
  {
    id: 'default_pull',
    name: 'Pull Day',
    category: 'Pull',
    exercises: [
      { name: 'Deadlift',      icon: '🏋️', muscle: 'Hamstrings, Back, Glutes',   sets: 4, reps: '4-6',  rest: 120 },
      { name: 'Pull-Ups',      icon: '🔝', muscle: 'Lats, Biceps, Core',          sets: 4, reps: '6-10', rest: 90  },
      { name: 'Barbell Row',   icon: '🔙', muscle: 'Back, Biceps, Rear Delt',     sets: 3, reps: '8-10', rest: 90  },
      { name: 'Lat Pulldown',  icon: '⬇️', muscle: 'Lats, Biceps',                sets: 3, reps: '10-12',rest: 60  },
      { name: 'Dumbbell Curl', icon: '💪', muscle: 'Biceps, Brachialis',           sets: 3, reps: '12-15',rest: 60  },
      { name: 'Face Pull',     icon: '🎯', muscle: 'Rear Delt, Rotator Cuff',      sets: 3, reps: '15-20',rest: 45  },
    ]
  },
  {
    id: 'default_legs',
    name: 'Leg Day',
    category: 'Legs',
    exercises: [
      { name: 'Barbell Squat',       icon: '🦵', muscle: 'Quads, Glutes, Core',  sets: 4, reps: '6-8',  rest: 120 },
      { name: 'Romanian Deadlift',   icon: '🦵', muscle: 'Hamstrings, Glutes',   sets: 3, reps: '8-10', rest: 90  },
      { name: 'Leg Press',           icon: '🦵', muscle: 'Quads, Glutes',        sets: 3, reps: '10-12',rest: 90  },
      { name: 'Hip Thrust',          icon: '🍑', muscle: 'Glutes, Hamstrings',   sets: 3, reps: '12-15',rest: 60  },
      { name: 'Leg Curl',            icon: '🦿', muscle: 'Hamstrings',           sets: 3, reps: '12-15',rest: 60  },
      { name: 'Calf Raise',          icon: '🦶', muscle: 'Calves',               sets: 4, reps: '15-20',rest: 45  },
    ]
  },
];

/* ─── Init: seed default routines on first run ──────── */
function initRoutines() {
  DB.set(d => {
    if (!d.routines) d.routines = [];
    if (!d.sessions) d.sessions = {};
    if (d.routines.length === 0) {
      d.routines = [...DEFAULT_ROUTINES];
    }
  });
}

/* ─── Main Tabs ─────────────────────────────────────── */
document.querySelectorAll('.wt-main-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.wt-main-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.wt-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('wpanel' + capFirst(this.dataset.wtab)).classList.add('active');
    if (this.dataset.wtab === 'routines') renderRoutinesList();
    if (this.dataset.wtab === 'session') renderSessionView();
  });
});

function capFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ─── Render Routines List ──────────────────────────── */
function renderRoutinesList() {
  const d = DB.get();
  const list = document.getElementById('routinesList');
  list.innerHTML = '';

  const routines = d.routines || [];
  if (!routines.length) {
    list.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:12px 16px">No routines yet. Tap "+ New" to create one!</p>';
    return;
  }

  const CATEGORY_ICONS = { Push:'💪', Pull:'🔄', Legs:'🦵', 'Full Body':'⚡', Upper:'🙌', Lower:'🦿', Cardio:'🏃', HIIT:'🔥', Custom:'🎯' };

  routines.forEach(r => {
    // Count sessions this week
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      days.push(dt.toISOString().split('T')[0]);
    }
    const weekSessions = days.reduce((n, k) => {
      const dayS = (d.sessions[k] || []);
      return n + dayS.filter(s => s.routineId === r.id).length;
    }, 0);

    const card = document.createElement('div');
    card.className = 'routine-card';
    card.innerHTML = `
      <div class="routine-card-left">
        <span class="routine-cat-icon">${CATEGORY_ICONS[r.category] || '🎯'}</span>
        <div class="routine-card-info">
          <span class="routine-card-name">${r.name}</span>
          <span class="routine-card-meta">${r.exercises.length} exercises · ${r.category}</span>
          ${weekSessions > 0 ? `<span class="routine-week-badge">${weekSessions}× this week</span>` : ''}
        </div>
      </div>
      <div class="routine-card-actions">
        <button class="routine-start-btn" data-id="${r.id}">▶ START</button>
        <button class="routine-view-btn" data-id="${r.id}">···</button>
      </div>
    `;
    card.querySelector('.routine-start-btn').addEventListener('click', e => { e.stopPropagation(); startSession(r.id); });
    card.querySelector('.routine-view-btn').addEventListener('click', e => { e.stopPropagation(); openViewRoutineModal(r.id); });
    card.addEventListener('click', () => openViewRoutineModal(r.id));
    list.appendChild(card);
  });
}

/* ─── Create / Edit Routine Modal ───────────────────── */
document.getElementById('createRoutineBtn').addEventListener('click', () => openCreateRoutineModal(null));

function openCreateRoutineModal(routineId) {
  _editingRoutineId = routineId;
  _routineSelectedExercises = [];

  if (routineId) {
    const r = (DB.get().routines || []).find(r => r.id === routineId);
    if (r) {
      document.getElementById('createRoutineTitle').textContent = 'EDIT ROUTINE';
      document.getElementById('routineNameInput').value = r.name;
      document.getElementById('routineCategorySelect').value = r.category;
      _routineSelectedExercises = r.exercises.map(e => ({ ...e }));
    }
  } else {
    document.getElementById('createRoutineTitle').textContent = 'CREATE ROUTINE';
    document.getElementById('routineNameInput').value = '';
    document.getElementById('routineCategorySelect').value = 'Push';
  }

  renderRoutineExPicker('');
  renderRoutineSelectedList();
  document.getElementById('createRoutineModal').classList.remove('hidden');
}

document.getElementById('closeCreateRoutineBtn').addEventListener('click', () => {
  document.getElementById('createRoutineModal').classList.add('hidden');
});
document.getElementById('createRoutineBackdrop').addEventListener('click', () => {
  document.getElementById('createRoutineModal').classList.add('hidden');
});

/* Exercise picker search */
document.getElementById('routineExSearch').addEventListener('input', function () {
  renderRoutineExPicker(this.value.trim());
});

function renderRoutineExPicker(query) {
  const allEx = Object.values(EXERCISES_DB).flat();
  const filtered = query
    ? allEx.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : allEx.slice(0, 30);

  const container = document.getElementById('routineExPickerList');
  container.innerHTML = '';
  filtered.forEach(ex => {
    const alreadyAdded = _routineSelectedExercises.some(s => s.name === ex.name);
    const row = document.createElement('div');
    row.className = 'routine-ex-pick-row' + (alreadyAdded ? ' added' : '');
    row.innerHTML = `
      <span class="rep-icon">${ex.icon}</span>
      <div class="rep-info">
        <span class="rep-name">${ex.name}</span>
        <span class="rep-muscle">${ex.muscle}</span>
      </div>
      <button class="rep-add-btn" ${alreadyAdded ? 'disabled' : ''}>${alreadyAdded ? '✓' : '+'}</button>
    `;
    if (!alreadyAdded) {
      row.querySelector('.rep-add-btn').addEventListener('click', () => {
        _routineSelectedExercises.push({ name: ex.name, icon: ex.icon, muscle: ex.muscle, sets: 3, reps: '8-12', rest: 60 });
        renderRoutineExPicker(query);
        renderRoutineSelectedList();
      });
    }
    container.appendChild(row);
  });
}

function renderRoutineSelectedList() {
  const container = document.getElementById('routineSelectedList');
  document.getElementById('routineSelectedCount').textContent = _routineSelectedExercises.length;
  container.innerHTML = '';

  if (!_routineSelectedExercises.length) {
    container.innerHTML = '<p style="color:var(--text3);font-size:12px;padding:8px 16px">No exercises added yet.</p>';
    return;
  }

  _routineSelectedExercises.forEach((ex, idx) => {
    const row = document.createElement('div');
    row.className = 'routine-sel-row';
    row.innerHTML = `
      <span class="rsr-icon">${ex.icon}</span>
      <div class="rsr-info">
        <span class="rsr-name">${ex.name}</span>
        <div class="rsr-inputs">
          <label class="rsr-lbl">Sets</label>
          <input type="number" class="rsr-input" value="${ex.sets}" min="1" max="20" data-field="sets" data-idx="${idx}"/>
          <label class="rsr-lbl">Reps</label>
          <input type="text" class="rsr-input rsr-reps" value="${ex.reps}" placeholder="8-12" data-field="reps" data-idx="${idx}"/>
          <label class="rsr-lbl">Rest(s)</label>
          <input type="number" class="rsr-input" value="${ex.rest}" min="0" max="600" step="15" data-field="rest" data-idx="${idx}"/>
        </div>
      </div>
      <button class="rsr-remove" data-idx="${idx}">✕</button>
    `;
    row.querySelectorAll('.rsr-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const i = parseInt(inp.dataset.idx);
        const field = inp.dataset.field;
        _routineSelectedExercises[i][field] = field === 'reps' ? inp.value : (parseFloat(inp.value) || 0);
      });
    });
    row.querySelector('.rsr-remove').addEventListener('click', () => {
      _routineSelectedExercises.splice(idx, 1);
      renderRoutineExPicker(document.getElementById('routineExSearch').value);
      renderRoutineSelectedList();
    });
    container.appendChild(row);
  });
}

document.getElementById('saveRoutineBtn').addEventListener('click', () => {
  const name = document.getElementById('routineNameInput').value.trim();
  const category = document.getElementById('routineCategorySelect').value;
  if (!name) { showToast('⚠️ Enter a routine name!'); return; }
  if (!_routineSelectedExercises.length) { showToast('⚠️ Add at least 1 exercise!'); return; }

  DB.set(d => {
    if (!d.routines) d.routines = [];
    if (_editingRoutineId) {
      const idx = d.routines.findIndex(r => r.id === _editingRoutineId);
      if (idx >= 0) d.routines[idx] = { ...d.routines[idx], name, category, exercises: _routineSelectedExercises };
    } else {
      d.routines.push({ id: 'r_' + Date.now(), name, category, exercises: _routineSelectedExercises });
    }
  });

  document.getElementById('createRoutineModal').classList.add('hidden');
  showToast(`✅ "${name}" saved!`);
  renderRoutinesList();
});

/* ─── View Routine Modal ─────────────────────────────── */
function openViewRoutineModal(routineId) {
  _activeRoutineId = routineId;
  const r = (DB.get().routines || []).find(r => r.id === routineId);
  if (!r) return;

  document.getElementById('viewRoutineTitle').textContent = r.name.toUpperCase();
  document.getElementById('viewRoutineMeta').innerHTML = `
    <span class="vr-tag">${r.category}</span>
    <span class="vr-tag">${r.exercises.length} exercises</span>
  `;

  const exList = document.getElementById('viewRoutineExList');
  exList.innerHTML = '';
  r.exercises.forEach((ex, i) => {
    const row = document.createElement('div');
    row.className = 'view-ex-row';
    row.innerHTML = `
      <span class="ver-num">${i + 1}</span>
      <span class="ver-icon">${ex.icon}</span>
      <div class="ver-info">
        <span class="ver-name">${ex.name}</span>
        <span class="ver-detail">${ex.sets} sets × ${ex.reps} reps · ${ex.rest}s rest</span>
      </div>
    `;
    exList.appendChild(row);
  });

  document.getElementById('viewRoutineModal').classList.remove('hidden');
}

document.getElementById('closeViewRoutineBtn').addEventListener('click', () => {
  document.getElementById('viewRoutineModal').classList.add('hidden');
});
document.getElementById('viewRoutineBackdrop').addEventListener('click', () => {
  document.getElementById('viewRoutineModal').classList.add('hidden');
});
document.getElementById('editRoutineBtn').addEventListener('click', () => {
  document.getElementById('viewRoutineModal').classList.add('hidden');
  openCreateRoutineModal(_activeRoutineId);
});
document.getElementById('deleteRoutineBtn').addEventListener('click', () => {
  const r = (DB.get().routines || []).find(r => r.id === _activeRoutineId);
  if (!r) return;
  if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
  DB.set(d => { d.routines = (d.routines || []).filter(r => r.id !== _activeRoutineId); });
  document.getElementById('viewRoutineModal').classList.add('hidden');
  showToast('Routine deleted');
  renderRoutinesList();
});

/* ─── Start Session ─────────────────────────────────── */
document.getElementById('startSessionBtn').addEventListener('click', () => {
  document.getElementById('viewRoutineModal').classList.add('hidden');
  startSession(_activeRoutineId);
});

function startSession(routineId) {
  const r = (DB.get().routines || []).find(r => r.id === routineId);
  if (!r) return;

  _activeSession = {
    routineId: r.id,
    routineName: r.name,
    exercises: r.exercises,
    completedIds: new Set(),
    startedAt: Date.now(),
    loggedSets: {} // { exIndex: [{reps, weight}] }
  };

  // Switch to session tab
  document.querySelectorAll('.wt-main-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.wt-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('wtabSession').classList.add('active');
  document.getElementById('wpanelSession').classList.add('active');

  renderSessionView();
  startSessionTimer();
  showToast(`🏃 ${r.name} started!`);
}

/* ─── Render Active Session ─────────────────────────── */
function renderSessionView() {
  const emptyEl = document.getElementById('sessionEmptyState');
  const activeEl = document.getElementById('sessionActiveView');

  if (!_activeSession) {
    emptyEl.style.display = '';
    activeEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  activeEl.style.display = '';

  const { exercises, completedIds, routineName } = _activeSession;
  const doneCount = completedIds.size;
  const total = exercises.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  document.getElementById('sessionRoutineName').textContent = routineName.toUpperCase();
  document.getElementById('sessionProgress').textContent = `${doneCount}/${total} done`;
  document.getElementById('sessionProgressBar').style.width = pct + '%';

  const list = document.getElementById('sessionExerciseList');
  list.innerHTML = '';

  exercises.forEach((ex, idx) => {
    const done = completedIds.has(idx);
    const loggedSets = (_activeSession.loggedSets[idx] || []);

    const card = document.createElement('div');
    card.className = 'session-ex-card' + (done ? ' done' : '');
    const setsHtml = loggedSets.map((s, si) =>
      `<span class="ses-set-chip">${si + 1}: ${s.reps}×${s.weight}kg</span>`
    ).join('');

    card.innerHTML = `
      <div class="sec-header">
        <div class="sec-check ${done ? 'done' : ''}" data-idx="${idx}">${done ? '✓' : ''}</div>
        <span class="sec-icon">${ex.icon}</span>
        <div class="sec-info">
          <span class="sec-name">${ex.name}</span>
          <span class="sec-meta">${ex.sets} sets × ${ex.reps} · Rest ${ex.rest}s</span>
        </div>
        <button class="sec-guide-btn" data-idx="${idx}" title="Form Guide">📐</button>
      </div>
      ${loggedSets.length ? `<div class="sec-sets-row">${setsHtml}</div>` : ''}
      <div class="sec-log-area" id="secLogArea_${idx}" style="display:none">
        <div class="sec-log-inputs">
          <div>
            <label class="form-label">Reps</label>
            <input type="number" class="form-input sec-reps-in" placeholder="0" min="0"/>
          </div>
          <div>
            <label class="form-label">Weight (kg)</label>
            <input type="number" class="form-input sec-weight-in" placeholder="0" step="0.5"/>
          </div>
          <button class="sec-log-btn" data-idx="${idx}">+Set</button>
        </div>
      </div>
    `;

    // Toggle check (mark done)
    card.querySelector('.sec-check').addEventListener('click', () => {
      if (completedIds.has(idx)) completedIds.delete(idx);
      else completedIds.add(idx);
      renderSessionView();
    });

    // Toggle log area
    card.querySelector('.sec-icon').addEventListener('click', () => {
      const area = document.getElementById(`secLogArea_${idx}`);
      area.style.display = area.style.display === 'none' ? '' : 'none';
    });
    card.querySelector('.sec-name').addEventListener('click', () => {
      const area = document.getElementById(`secLogArea_${idx}`);
      area.style.display = area.style.display === 'none' ? '' : 'none';
    });

    // Add set
    card.querySelector('.sec-log-btn').addEventListener('click', () => {
      const reps = parseFloat(card.querySelector('.sec-reps-in').value) || 0;
      const weight = parseFloat(card.querySelector('.sec-weight-in').value) || 0;
      if (reps <= 0) { showToast('Enter reps!'); return; }
      if (!_activeSession.loggedSets[idx]) _activeSession.loggedSets[idx] = [];
      _activeSession.loggedSets[idx].push({ reps, weight });
      // Auto-mark done when sets completed
      if (_activeSession.loggedSets[idx].length >= ex.sets) completedIds.add(idx);
      renderSessionView();
    });

    // Form guide button
    card.querySelector('.sec-guide-btn').addEventListener('click', e => {
      e.stopPropagation();
      openExerciseModal(ex);
    });

    list.appendChild(card);
  });
}

/* ─── Session Timer ─────────────────────────────────── */
function startSessionTimer() {
  clearInterval(_sessionTimerInterval);
  _sessionTimerInterval = setInterval(() => {
    if (!_activeSession) { clearInterval(_sessionTimerInterval); return; }
    const elapsed = Math.floor((Date.now() - _activeSession.startedAt) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('sessionTimer');
    if (el) el.textContent = `${mm}:${ss}`;
  }, 1000);
}

/* ─── Finish Session ─────────────────────────────────── */
document.getElementById('finishSessionBtn').addEventListener('click', () => {
  if (!_activeSession) return;
  const notes = document.getElementById('sessionNotes').value.trim();
  const dur = parseInt(document.getElementById('sessionDuration').value) || Math.round((Date.now() - _activeSession.startedAt) / 60000);
  const today = todayKey();

  // Build exercises array for workout log (reuse existing format)
  const exercises = _activeSession.exercises.map((ex, idx) => {
    const sets = (_activeSession.loggedSets[idx] || [{ reps: ex.reps, weight: 0 }]);
    return {
      name: ex.name, icon: ex.icon, muscle: ex.muscle,
      category: _activeSession.routineName,
      sets: sets.map(s => ({ reps: parseFloat(s.reps) || 0, weight: s.weight || 0 })),
      id: Date.now() + idx
    };
  });

  DB.set(d => {
    // Save as workout log
    if (!d.workout[today]) d.workout[today] = { exercises: [], notes: '', duration: 0 };
    d.workout[today].exercises.push(...exercises);
    d.workout[today].notes = notes;
    d.workout[today].duration = dur;

    // Save session record
    if (!d.sessions) d.sessions = {};
    if (!d.sessions[today]) d.sessions[today] = [];
    d.sessions[today].push({
      routineId: _activeSession.routineId,
      routineName: _activeSession.routineName,
      completedIds: [..._activeSession.completedIds],
      completedCount: _activeSession.completedIds.size,
      totalCount: _activeSession.exercises.length,
      notes, duration: dur,
      startedAt: _activeSession.startedAt,
      finishedAt: Date.now()
    });
  });

  clearInterval(_sessionTimerInterval);
  _activeSession = null;

  showToast('🏆 Session saved!');

  // Grant XP for workout completion
  try { grantXP(XP_REWARDS.WORKOUT_COMPLETE, 'workout'); } catch(e) {}
  setTimeout(() => { try { checkAchievements(); } catch(e) {} }, 500);

  renderWorkoutSummary();
  renderWorkoutChart();
  renderWorkoutHistory();
  renderRoutinesList();

  // Switch back to routines tab
  document.querySelectorAll('.wt-main-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.wt-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('wtabRoutines').classList.add('active');
  document.getElementById('wpanelRoutines').classList.add('active');
});

document.getElementById('cancelSessionBtn').addEventListener('click', () => {
  if (!confirm('Cancel this session? All progress will be lost.')) return;
  clearInterval(_sessionTimerInterval);
  _activeSession = null;
  renderSessionView();
  showToast('Session cancelled');
});
