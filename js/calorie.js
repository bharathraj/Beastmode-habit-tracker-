/* ===== CALORIE.JS ===== */

let _calorieChart = null;
let _barcodeScanner = null;
let _scannedProduct = null;
let _pendingExercise = null; // shared with workout

// Quick-add common foods database
const QUICK_FOODS = [
  { name: 'Egg (whole)', cal: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Chicken Breast (100g)', cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Rice (1 cup cooked)', cal: 206, protein: 4.3, carbs: 44.5, fat: 0.4 },
  { name: 'Chapati (1 piece)', cal: 70, protein: 2.5, carbs: 13, fat: 1.4 },
  { name: 'Dal (1 cup)', cal: 230, protein: 17, carbs: 39, fat: 1 },
  { name: 'Milk (200ml)', cal: 122, protein: 6.5, carbs: 9.6, fat: 5 },
  { name: 'Banana (1 medium)', cal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Apple (1 medium)', cal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Almonds (28g)', cal: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Paneer (100g)', cal: 265, protein: 18, carbs: 1.2, fat: 20 },
  { name: 'Oats (1 cup dry)', cal: 303, protein: 13, carbs: 52, fat: 5 },
  { name: 'Whey Protein (1 scoop)', cal: 120, protein: 24, carbs: 4, fat: 1.5 },
  { name: 'Curd (1 cup)', cal: 150, protein: 8.5, carbs: 11, fat: 8 },
  { name: 'Peanut Butter (2 tbsp)', cal: 190, protein: 7, carbs: 7, fat: 16 },
  { name: 'Sweet Potato (100g)', cal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Salmon (100g)', cal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Broccoli (100g)', cal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'White Bread (1 slice)', cal: 66, protein: 2.9, carbs: 13, fat: 0.6 },
  { name: 'Orange Juice (200ml)', cal: 84, protein: 1.3, carbs: 19.5, fat: 0.4 },
  { name: 'Dosa (1 medium)', cal: 133, protein: 3.5, carbs: 21, fat: 3.5 },
];

function renderCalorieScreen() {
  const today = todayKey();
  document.getElementById('calorieDate').textContent = formatDate(today);

  const d = DB.get();
  document.getElementById('calGoalDisplay').textContent = d.calorieGoal || 2000;

  renderCalorieSummary();
  renderMacros();
  renderCalorieLogList();
  renderCalorieChart();
  renderQuickFoods();
}

/* ===== SUMMARY RING ===== */
function renderCalorieSummary() {
  const d = DB.get();
  const today = todayKey();
  const entries = (d.calorie[today] || {}).entries || [];
  const goal = d.calorieGoal || 2000;

  const totalCal = entries.reduce((s, e) => s + (e.cal || 0), 0);
  const remaining = Math.max(0, goal - totalCal);
  const pct = Math.min(1, totalCal / goal);

  document.getElementById('calConsumed').textContent = totalCal;
  document.getElementById('calGoalDisplay').textContent = goal;
  document.getElementById('calRemaining').textContent = remaining;
  document.getElementById('calEntries').textContent = entries.length;
  document.getElementById('calTodayTotal').textContent = totalCal + ' kcal';

  // Update ring
  const circumference = 326.7;
  const offset = circumference - pct * circumference;
  const ring = document.getElementById('calRingFill');
  if (ring) {
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = pct >= 1 ? 'var(--red)' : 'var(--green)';
  }
}

/* ===== MACROS ===== */
function renderMacros() {
  const d = DB.get();
  const today = todayKey();
  const entries = (d.calorie[today] || {}).entries || [];

  let protein = 0, carbs = 0, fat = 0;
  entries.forEach(e => {
    protein += e.protein || 0;
    carbs += e.carbs || 0;
    fat += e.fat || 0;
  });

  const total = protein + carbs + fat || 1;

  const updateMacroCard = (id, val, pct, suffix) => {
    const card = document.getElementById(id);
    if (!card) return;
    card.querySelector('.macro-val').textContent = Math.round(val) + suffix;
    card.querySelector('.macro-fill').style.width = Math.min(100, pct * 100) + '%';
  };

  updateMacroCard('macroProtein', protein, protein / total, 'g');
  updateMacroCard('macroCarbs', carbs, carbs / total, 'g');
  updateMacroCard('macroFat', fat, fat / total, 'g');
}

/* ===== TABS ===== */
document.querySelectorAll('.cal-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.cal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cal-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('calPanel' + capitalize(this.dataset.tab)).classList.add('active');
  });
});

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ===== MANUAL ADD ===== */
document.getElementById('addFoodBtn').addEventListener('click', () => {
  const name = document.getElementById('foodNameInput').value.trim();
  const cal = parseFloat(document.getElementById('foodCalInput').value) || 0;
  const protein = parseFloat(document.getElementById('foodProteinInput').value) || 0;
  const carbs = parseFloat(document.getElementById('foodCarbsInput').value) || 0;
  const fat = parseFloat(document.getElementById('foodFatInput').value) || 0;
  const meal = document.getElementById('mealTypeSelect').value;

  if (!name) { showToast('⚠️ Enter food name!'); return; }
  if (cal <= 0) { showToast('⚠️ Enter valid calorie count!'); return; }
  if (cal > 5000) { showToast('⚠️ Calorie value seems too high!'); return; }

  addCalorieEntry({ name, cal, protein, carbs, fat, meal });

  // Clear form
  document.getElementById('foodNameInput').value = '';
  document.getElementById('foodCalInput').value = '';
  document.getElementById('foodProteinInput').value = '';
  document.getElementById('foodCarbsInput').value = '';
  document.getElementById('foodFatInput').value = '';
});

function addCalorieEntry(entry) {
  const today = todayKey();
  DB.set(d => {
    if (!d.calorie[today]) d.calorie[today] = { entries: [] };
    d.calorie[today].entries.push({ ...entry, id: Date.now() });
  });
  showToast(`✅ ${entry.name} added!`);
  renderCalorieSummary();
  renderMacros();
  renderCalorieLogList();
  renderCalorieChart();
}

/* ===== QUICK FOODS ===== */
function renderQuickFoods() {
  const grid = document.getElementById('quickFoodsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  QUICK_FOODS.forEach(food => {
    const btn = document.createElement('button');
    btn.className = 'quick-food-btn';
    btn.innerHTML = `
      <span class="qf-name">${food.name}</span>
      <span class="qf-cal">${food.cal} kcal</span>
    `;
    btn.addEventListener('click', () => {
      addCalorieEntry({ ...food, meal: 'snack' });
    });
    grid.appendChild(btn);
  });
}

/* ===== BARCODE SCANNER ===== */
document.getElementById('startScanBtn').addEventListener('click', startBarcodeScanner);
document.getElementById('stopScanBtn').addEventListener('click', stopBarcodeScanner);

async function startBarcodeScanner() {
  const scannerArea = document.getElementById('barcodeScannerArea');
  const hint = document.getElementById('scannerHint');
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');

  // Check if BarcodeDetector API is available
  if (!('BarcodeDetector' in window)) {
    // Fallback: manual barcode input
    showManualBarcodeInput();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', true);
    video.style.cssText = 'width:100%;border-radius:12px;max-height:200px;object-fit:cover;';
    video.play();

    const frame = document.getElementById('scannerFrame');
    frame.innerHTML = '';
    frame.appendChild(video);

    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    hint.textContent = 'Point camera at barcode...';

    const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });

    _barcodeScanner = { stream, video };

    const scanLoop = async () => {
      if (!_barcodeScanner) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0) {
          const barcode = codes[0].rawValue;
          stopBarcodeScanner();
          await lookupBarcode(barcode);
          return;
        }
      } catch (e) {}
      requestAnimationFrame(scanLoop);
    };
    requestAnimationFrame(scanLoop);
  } catch (e) {
    showToast('📷 Camera not available. Use manual entry.');
    showManualBarcodeInput();
  }
}

function stopBarcodeScanner() {
  if (_barcodeScanner) {
    _barcodeScanner.stream.getTracks().forEach(t => t.stop());
    _barcodeScanner = null;
  }
  const frame = document.getElementById('scannerFrame');
  frame.innerHTML = `
    <div class="scanner-line"></div>
    <span class="scanner-corner tl"></span>
    <span class="scanner-corner tr"></span>
    <span class="scanner-corner bl"></span>
    <span class="scanner-corner br"></span>
  `;
  document.getElementById('startScanBtn').style.display = 'block';
  document.getElementById('stopScanBtn').style.display = 'none';
  document.getElementById('scannerHint').textContent = 'Tap to start barcode scanner';
}

function showManualBarcodeInput() {
  const area = document.getElementById('barcodeScannerArea');
  const existing = document.getElementById('manualBarcodeInput');
  if (existing) return;
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.id = 'manualBarcodeInput';
  inp.className = 'form-input';
  inp.placeholder = 'Enter barcode number (e.g. 8901030000001)';
  inp.style.marginTop = '12px';
  const btn = document.createElement('button');
  btn.className = 'btn-secondary';
  btn.textContent = 'LOOKUP BARCODE';
  btn.style.marginTop = '8px';
  btn.addEventListener('click', () => {
    const val = inp.value.trim();
    if (val) lookupBarcode(val);
  });
  area.appendChild(inp);
  area.appendChild(btn);
}

async function lookupBarcode(barcode) {
  document.getElementById('scannerHint').textContent = `🔍 Looking up barcode ${barcode}...`;
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const nutriments = p.nutriments || {};
      const product = {
        name: p.product_name || 'Unknown Product',
        cal: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
        protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
        barcode
      };
      _scannedProduct = product;
      showBarcodeResult(product);
    } else {
      document.getElementById('scannerHint').textContent = '❌ Product not found. Try manual entry.';
      showToast('Product not found in database');
    }
  } catch (e) {
    document.getElementById('scannerHint').textContent = '❌ Network error. Check connection.';
    showToast('Network error looking up barcode');
  }
}

function showBarcodeResult(product) {
  const result = document.getElementById('barcodeResult');
  const info = document.getElementById('barcodeProductInfo');
  result.classList.remove('hidden');
  info.innerHTML = `
    <div class="barcode-product-name">${product.name}</div>
    <div class="barcode-product-macros">
      <span>🔥 ${product.cal} kcal/100g</span>
      <span>🥩 ${product.protein}g protein</span>
      <span>🍞 ${product.carbs}g carbs</span>
      <span>🧈 ${product.fat}g fat</span>
    </div>
    <div style="margin-top:8px">
      <label class="form-label">Serving size (g)</label>
      <input type="number" class="form-input" id="barcodeServingSize" value="100" min="1"/>
    </div>
  `;
  document.getElementById('scannerHint').textContent = `✅ Found: ${product.name}`;
}

document.getElementById('addBarcodeFood').addEventListener('click', () => {
  if (!_scannedProduct) return;
  const serving = parseFloat(document.getElementById('barcodeServingSize')?.value) || 100;
  const factor = serving / 100;
  addCalorieEntry({
    name: `${_scannedProduct.name} (${serving}g)`,
    cal: Math.round(_scannedProduct.cal * factor),
    protein: Math.round(_scannedProduct.protein * factor * 10) / 10,
    carbs: Math.round(_scannedProduct.carbs * factor * 10) / 10,
    fat: Math.round(_scannedProduct.fat * factor * 10) / 10,
    meal: 'snack',
    barcode: _scannedProduct.barcode
  });
  _scannedProduct = null;
  document.getElementById('barcodeResult').classList.add('hidden');
  stopBarcodeScanner();
});

/* ===== CALORIE LOG LIST ===== */
function renderCalorieLogList() {
  const d = DB.get();
  const today = todayKey();
  const entries = (d.calorie[today] || {}).entries || [];
  const list = document.getElementById('calorieLogList');
  list.innerHTML = '';

  if (!entries.length) {
    list.innerHTML = '<p class="cal-empty">No food logged yet today. Add your first meal! 🍽️</p>';
    return;
  }

  const mealGroups = {};
  entries.forEach(e => {
    if (!mealGroups[e.meal]) mealGroups[e.meal] = [];
    mealGroups[e.meal].push(e);
  });

  const mealIcons = { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snack:'🍎' };
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

  mealOrder.forEach(meal => {
    if (!mealGroups[meal]) return;
    const mealEl = document.createElement('div');
    mealEl.className = 'cal-meal-group';
    const mealTotal = mealGroups[meal].reduce((s, e) => s + e.cal, 0);
    mealEl.innerHTML = `
      <div class="cal-meal-header">
        <span>${mealIcons[meal] || '🍽️'} ${meal.toUpperCase()}</span>
        <span style="color:var(--red);font-weight:700">${mealTotal} kcal</span>
      </div>
    `;
    mealGroups[meal].forEach(entry => {
      const item = document.createElement('div');
      item.className = 'cal-item';
      item.innerHTML = `
        <div class="cal-item-info">
          <span class="cal-item-name">${entry.name}</span>
          <span class="cal-item-macros">P:${entry.protein||0}g C:${entry.carbs||0}g F:${entry.fat||0}g</span>
        </div>
        <div class="cal-item-right">
          <span class="cal-item-cal">${entry.cal}</span>
          <button class="cal-delete-btn" data-id="${entry.id}">✕</button>
        </div>
      `;
      item.querySelector('.cal-delete-btn').addEventListener('click', () => {
        DB.set(d => {
          const dayLog = d.calorie[today];
          if (dayLog) dayLog.entries = dayLog.entries.filter(e => e.id !== entry.id);
        });
        renderCalorieSummary();
        renderMacros();
        renderCalorieLogList();
        renderCalorieChart();
      });
      mealEl.appendChild(item);
    });
    list.appendChild(mealEl);
  });
}

/* ===== WEEKLY CHART ===== */
function renderCalorieChart() {
  const d = DB.get();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    days.push(dt.toISOString().split('T')[0]);
  }
  const labels = days.map(k => new Date(k + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'short' }));
  const data = days.map(k => {
    const entries = (d.calorie[k] || {}).entries || [];
    return entries.reduce((s, e) => s + (e.cal || 0), 0);
  });
  const goal = d.calorieGoal || 2000;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const tickColor = isDark ? '#666' : '#888';

  const canvas = document.getElementById('calorieChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (_calorieChart) { _calorieChart.destroy(); _calorieChart = null; }

  _calorieChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Calories',
          data,
          backgroundColor: data.map(v => v > goal ? 'rgba(204,0,0,0.7)' : 'rgba(0,204,102,0.7)'),
          borderColor: data.map(v => v > goal ? '#cc0000' : '#00cc66'),
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Goal',
          data: Array(7).fill(goal),
          type: 'line',
          borderColor: 'rgba(255,170,0,0.8)',
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tickColor, font: { size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw} kcal` } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
        y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } }
      }
    }
  });
}
