// ========================
// CONSTANTS
// ========================

const screens = [
  { id: "dashboard", label: "Dashboard" },
  { id: "plan-hali", label: "Plan hali" },
  { id: "krosna", label: "Krosna" },
  { id: "osnowy", label: "Osnowy" },
  { id: "przewlekalnia", label: "Przewlekalnia" },
  { id: "klejarnia", label: "Klejarnia" },
  { id: "snowalnia", label: "Snowalnia" },
  { id: "pracownicy", label: "Pracownicy" }
];

const screenSubtitles = {
  dashboard: "Szybki przegląd kluczowych sygnałów z hali, danych dnia i dziennika zdarzeń.",
  "plan-hali": "Realistyczniejszy plan hali z rozmieszczeniem krosien i trybem ustawiania układu.",
  krosna: "Lista stanowisk z filtrowaniem, statusem pracy i szybkim wejściem do szczegółów.",
  osnowy: "Podgląd przepływu osnów między magazynem, przewlekalnią i aktywnymi krosnami.",
  przewlekalnia: "Kolejka zadań przygotowawczych i gotowych osnów do montażu na hali.",
  klejarnia: "Monitoring zleceń klejarni w formie lekkiego prototypu demonstracyjnego.",
  snowalnia: "Podgląd zleceń snowalni oraz efektów zasilających magazyn osnów.",
  pracownicy: "Szybki wgląd w obecność, zmianę i statystyki pracowników z filtrem okresu."
};

const modelColors = {
  "Model A": "#60a5fa",
  "Model B": "#f87171",
  "Model C": "#34d399",
  "Model D": "#fbbf24"
};

const hallLayoutStorageKey = "technotex-beta-hall-layout-v2";
const defaultHallLayout = {
  1: { x: 24, y: 28 },
  2: { x: 72, y: 28 },
  3: { x: 24, y: 68 },
  4: { x: 72, y: 68 }
};

const ATTENDANCE_RESET_KEY = "technotex-attendance-reset-date";
const DEPT_LABELS = ["Hala/Tkalnia", "Przewlekalnia", "Klejarnia", "Snowalnia"];

// ========================
// UTILITY FUNCTIONS
// ========================

const $ = (selector) => document.querySelector(selector);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function statusSlug(status) {
  return status.replaceAll(" ", "-");
}

function badge(label, className = "") {
  return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

function statusBadge(status) {
  return badge(status, `badge-status badge-${statusSlug(status)}`);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateTime(d) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatDateShort(d) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function nowTs() {
  return formatDateTime(new Date());
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ========================
// MOCK DATA GENERATOR
// ========================

function makeMockDailyHistory(seed, primaryBranch, days) {
  days = days || 90;
  let s = (seed >>> 0) || 12345;
  function rng() {
    s = ((s * 1664525 + 1013904223) >>> 0);
    return s / 4294967296;
  }

  const history = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 1; i <= days; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const r = rng();
    let status, dept;

    if (r < 0.80) {
      status = "OBECNY";
      dept = rng() < 0.70 ? primaryBranch : DEPT_LABELS[Math.floor(rng() * DEPT_LABELS.length)];
    } else if (r < 0.88) {
      status = "CHORY";
      dept = primaryBranch;
    } else if (r < 0.95) {
      status = "URLOP";
      dept = primaryBranch;
    } else {
      status = "NIEOBECNY";
      dept = primaryBranch;
    }

    history.push({ date: d.toISOString().slice(0, 10), department: dept, status });
  }

  return history;
}

// ========================
// STATE
// ========================

const state = {
  looms: [
    { id: 1, number: "1", name: "BT 367/155", type: "Rapier", model: "Model A", status: "PRACUJE", article: "ART-101", activeWarpId: 101, queue: ["ART-120"], notes: "Stabilna praca", history: [] },
    { id: 2, number: "2", name: "BT 403/130", type: "Pneumatyk", model: "Model B", status: "AWARIA", article: "ART-088", activeWarpId: null, queue: ["ART-102", "ART-111"], notes: "Sprawdzenie zaworu", history: [] },
    { id: 3, number: "3", name: "TOR 21", type: "Rapier", model: "Model C", status: "ZMIANA OSNOWY", article: "ART-090", activeWarpId: 103, queue: [], notes: "W toku przezbrojenie", history: [] },
    { id: 4, number: "4", name: "PNEU 7", type: "Pneumatyk", model: "Model D", status: "ZATRZYMANE", article: "ART-011", activeWarpId: null, queue: ["ART-015"], notes: "Czeka na osnowę", history: [] }
  ],
  warps: [
    { id: 101, number: "OS-0001", name: "Osnowa bawełna 30", rollerType: "A", meters: 2400, status: "NA KROŚNIE", loomId: 1, createdFrom: "Klejarnia", timeline: ["Utworzono", "Założono na krosno 1"] },
    { id: 102, number: "OS-0002", name: "Osnowa poliester 12", rollerType: "B", meters: 1900, status: "W MAGAZYNIE", loomId: null, createdFrom: "Snowalnia", timeline: ["Utworzono"] },
    { id: 103, number: "OS-0003", name: "Osnowa mix 18", rollerType: "A", meters: 2100, status: "NA KROŚNIE", loomId: 3, createdFrom: "Klejarnia", timeline: ["Utworzono", "Założono na krosno 3"] },
    { id: 104, number: "OS-0004", name: "Osnowa test 20", rollerType: "C", meters: 1750, status: "PRZYGOTOWANA", loomId: null, createdFrom: "Przewlekalnia", timeline: ["Przeniesiono na przewlekalnię", "Przygotowana"] },
    { id: 105, number: "OS-0005", name: "Osnowa archiwalna", rollerType: "B", meters: 1200, status: "ZUŻYTA", loomId: 2, createdFrom: "Klejarnia", timeline: ["Założona na krosno 2", "Zużyta"] }
  ],
  loomWarpHistory: [{ loomNumber: "2", warpNumber: "OS-0005", status: "ZUŻYTA", when: "28.06.2026 06:45" }],
  globalWarpHistory: [{ warpNumber: "OS-0005", action: "ZUŻYTA", loomNumber: "2", when: "28.06.2026 06:45" }],
  departments: {
    Przewlekalnia: [
      { id: 1, title: "OS-0002 przygotowanie", status: "W KOLEJCE", linkedWarpId: 102 },
      { id: 2, title: "OS-0010 przygotowanie", status: "W PRZYGOTOWANIU", linkedWarpId: null }
    ],
    Klejarnia: [
      { id: 3, title: "Zlecenie KL-77", status: "W TRAKCIE" },
      { id: 4, title: "Zlecenie KL-76", status: "W KOLEJCE" }
    ],
    Snowalnia: [
      { id: 5, title: "Zlecenie SN-11", status: "W TRAKCIE" },
      { id: 6, title: "Zlecenie SN-10", status: "UKOŃCZONE" }
    ]
  },
  departmentHistory: {
    Przewlekalnia: [{ id: 99, title: "OS-0009", status: "UKOŃCZONE" }],
    Klejarnia: [],
    Snowalnia: [{ id: 98, title: "SN-08", status: "UKOŃCZONE" }]
  },
  employees: [
    { id: 1, name: "Anna Kowalska", shift: 1, branch: "Hala/Tkalnia", attendance: "OBECNY", dailyHistory: makeMockDailyHistory(1001, "Hala/Tkalnia") },
    { id: 2, name: "Piotr Nowak", shift: 2, branch: "Przewlekalnia", attendance: "CHORY", dailyHistory: makeMockDailyHistory(2002, "Przewlekalnia") },
    { id: 3, name: "Ewa Zielińska", shift: 1, branch: "Klejarnia", attendance: "URLOP", dailyHistory: makeMockDailyHistory(3003, "Klejarnia") },
    { id: 4, name: "Marek Wiśniewski", shift: 1, branch: "Hala/Tkalnia", attendance: "BRAK STATUSU", dailyHistory: makeMockDailyHistory(4004, "Hala/Tkalnia") },
    { id: 5, name: "Katarzyna Dąbrowska", shift: 2, branch: "Snowalnia", attendance: "BRAK STATUSU", dailyHistory: makeMockDailyHistory(5005, "Snowalnia") },
    { id: 6, name: "Tomasz Kowalczyk", shift: 1, branch: "Przewlekalnia", attendance: "OBECNY", dailyHistory: makeMockDailyHistory(6006, "Przewlekalnia") },
    { id: 7, name: "Magdalena Nowak", shift: 2, branch: "Hala/Tkalnia", attendance: "BRAK STATUSU", dailyHistory: makeMockDailyHistory(7007, "Hala/Tkalnia") }
  ],
  eventLog: [],
  activeScreen: "dashboard",
  selectedLoomId: null,
  layoutEditing: false,
  hallLayout: {}
};

// Initialize mock event log with historical entries
;(function () {
  const now = Date.now();
  [
    [35, "attendance", "Anna Kowalska → OBECNY"],
    [52, "attendance", "Tomasz Kowalczyk → OBECNY"],
    [75, "loom", "Krosno 3 → ZMIANA OSNOWY"],
    [90, "warp", "OS-0002 przeniesiona do Przewlekalnia"],
    [125, "loom", "Krosno 2 → AWARIA (zawór)"],
    [195, "system", "Zmiana 1 uruchomiona — aplikacja aktywna"]
  ].forEach(function (item) {
    var minutesAgo = item[0], cat = item[1], desc = item[2];
    state.eventLog.push({
      id: state.eventLog.length + 1,
      ts: formatDateShort(new Date(now - minutesAgo * 60000)),
      cat: cat,
      desc: desc
    });
  });
})();

// Initialize loom history with timestamped entries
;(function () {
  const now = Date.now();
  const ts = function (m) { return formatDateTime(new Date(now - m * 60000)); };
  state.looms[0].history = [ts(35) + " — Zmiana 1 uruchomiona"];
  state.looms[1].history = [ts(125) + " — Awaria zgłoszona · sprawdzenie zaworu"];
  state.looms[2].history = [ts(75) + " — Rozpoczęto zmianę osnowy"];
  state.looms[3].history = [ts(210) + " — Zatrzymane · oczekiwanie na osnowę"];
})();

// ========================
// EVENT LOG
// ========================

function addEvent(cat, desc) {
  state.eventLog.unshift({
    id: Date.now(),
    ts: formatDateShort(new Date()),
    cat: cat,
    desc: desc
  });
  if (state.eventLog.length > 30) {
    state.eventLog.pop();
  }
}

// ========================
// CLOCK & DAILY RESET
// ========================

function updateClock() {
  var now = new Date();
  var timeEl = document.getElementById("clock-time");
  var dateEl = document.getElementById("clock-date");
  if (timeEl) timeEl.textContent = pad2(now.getHours()) + ":" + pad2(now.getMinutes()) + ":" + pad2(now.getSeconds());
  if (dateEl) dateEl.textContent = pad2(now.getDate()) + "." + pad2(now.getMonth() + 1) + "." + now.getFullYear();
}

function checkDailyReset() {
  var today = todayStr();
  var lastReset = "";
  try { lastReset = window.localStorage.getItem(ATTENDANCE_RESET_KEY) || ""; } catch (e) {}
  if (lastReset !== today) {
    state.employees.forEach(function (emp) { emp.attendance = "BRAK STATUSU"; });
    try { window.localStorage.setItem(ATTENDANCE_RESET_KEY, today); } catch (e) {}
    addEvent("system", "Dzienny reset obecności → BRAK STATUSU (" + today + ")");
    renderAll();
  }
}

function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
  checkDailyReset();
  setInterval(checkDailyReset, 60000);
}

// ========================
// HALL LAYOUT
// ========================

function hallPositionFor(loomId) {
  return state.hallLayout[loomId] || defaultHallLayout[loomId] || { x: 50, y: 50 };
}

function normalizeHallLayout(rawLayout) {
  rawLayout = rawLayout || {};
  return Object.fromEntries(
    state.looms.map(function (loom) {
      var fallback = defaultHallLayout[loom.id] || { x: 50, y: 50 };
      var raw = rawLayout[loom.id] || rawLayout[String(loom.id)] || {};
      return [
        loom.id,
        {
          x: clamp(Number(raw.x) || fallback.x, 14, 86),
          y: clamp(Number(raw.y) || fallback.y, 18, 84)
        }
      ];
    })
  );
}

function loadHallLayout() {
  try {
    var saved = window.localStorage.getItem(hallLayoutStorageKey);
    if (!saved) return normalizeHallLayout();
    return normalizeHallLayout(JSON.parse(saved));
  } catch (e) {
    return normalizeHallLayout();
  }
}

function persistHallLayout() {
  try { window.localStorage.setItem(hallLayoutStorageKey, JSON.stringify(state.hallLayout)); } catch (e) {}
}

function toggleHallEditMode() {
  state.layoutEditing = !state.layoutEditing;
  renderPlan();
}

function resetHallLayout() {
  state.hallLayout = normalizeHallLayout();
  persistHallLayout();
  renderPlan();
}

// ========================
// NAVIGATION
// ========================

function updateTopbar() {
  var active = screens.find(function (s) { return s.id === state.activeScreen; });
  $("#screen-title").textContent = active ? active.label : "Technotex";
  $("#screen-subtitle").textContent = screenSubtitles[state.activeScreen] || "Demonstracyjny podgląd.";
}

function renderNav() {
  var main = $("#main-nav");
  var bottom = $("#bottom-nav");
  main.innerHTML = "";
  bottom.innerHTML = "";

  screens.forEach(function (screen) {
    var button = document.createElement("button");
    button.className = "nav-btn" + (state.activeScreen === screen.id ? " active" : "");
    button.textContent = screen.label;
    button.onclick = function () { switchScreen(screen.id); };
    main.appendChild(button);

    var mobileButton = button.cloneNode(true);
    mobileButton.onclick = button.onclick;
    bottom.appendChild(mobileButton);
  });
}

function switchScreen(id) {
  state.activeScreen = id;
  document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
  document.getElementById(id).classList.add("active");
  updateTopbar();
  renderNav();
  renderAll();
  closeDrawer();
  $("#sidebar").classList.remove("open");
}

function statusCount(status) {
  return state.looms.filter(function (l) { return l.status === status; }).length;
}

// ========================
// EVENT LOG RENDER
// ========================

function renderEventLog() {
  if (!state.eventLog.length) return "<p class=\"empty-state\">Brak zdarzeń.</p>";
  var catIcon = { attendance: "👤", loom: "🔧", warp: "🧵", department: "🏭", system: "ℹ️" };
  return state.eventLog.slice(0, 10).map(function (ev) {
    var icon = catIcon[ev.cat] || "·";
    return "<div class=\"event-log-item\">"
      + "<span class=\"event-log-ts\">" + escapeHtml(ev.ts) + "</span>"
      + "<span class=\"event-log-icon\">" + icon + "</span>"
      + "<span class=\"event-log-desc\">" + escapeHtml(ev.desc) + "</span>"
      + "</div>";
  }).join("");
}

// ========================
// DASHBOARD
// ========================

function currentShiftLabel() {
  var h = new Date().getHours();
  if (h >= 6 && h < 14) return "Zmiana 1 (06:00–14:00)";
  if (h >= 14 && h < 22) return "Zmiana 2 (14:00–22:00)";
  return "Zmiana nocna (22:00–06:00)";
}

function renderDashboard() {
  var openOrders = ["Przewlekalnia", "Klejarnia", "Snowalnia"]
    .flatMap(function (key) { return state.departments[key]; })
    .filter(function (job) { return job.status !== "UKOŃCZONE"; }).length;

  var presentCount = state.employees.filter(function (e) { return e.attendance === "OBECNY"; }).length;
  var noStatusCount = state.employees.filter(function (e) { return e.attendance === "BRAK STATUSU"; }).length;

  $("#dashboard").innerHTML =
    "<div class=\"screen-stack\">"

    + "<div class=\"stats-grid\">"
    + "<article class=\"metric-card\">"
    + "<div><h4>Krosna pracujące</h4><div class=\"metric-value\">" + statusCount("PRACUJE") + "</div></div>"
    + "<div class=\"metric-footnote\">Aktywne stanowiska w produkcji.</div>"
    + "</article>"

    + "<article class=\"metric-card\">"
    + "<div><h4>Awarie / postoje</h4><div class=\"metric-value\">" + (statusCount("ZATRZYMANE") + statusCount("AWARIA")) + "</div></div>"
    + "<div class=\"metric-footnote\">Wymagają uwagi technicznej.</div>"
    + "</article>"

    + "<article class=\"metric-card metric-card-present\">"
    + "<div><h4>Pracownicy obecni</h4><div class=\"metric-value\">" + presentCount + "</div></div>"
    + "<div class=\"metric-footnote\">Zarejestrowanych dziś na zmianie.</div>"
    + "</article>"

    + "<article class=\"metric-card metric-card-warn\">"
    + "<div><h4>Brak statusu</h4><div class=\"metric-value metric-value-warn\">" + noStatusCount + "</div></div>"
    + "<div class=\"metric-footnote warn-copy\">Pracownicy bez ustawionej obecności.</div>"
    + "</article>"

    + "<article class=\"metric-card\">"
    + "<div><h4>Otwarte zlecenia</h4><div class=\"metric-value\">" + openOrders + "</div></div>"
    + "<div class=\"metric-footnote\">Łącznie w działach przygotowania.</div>"
    + "</article>"

    + "<article class=\"metric-card\">"
    + "<div><h4>Osnowy w magazynie</h4><div class=\"metric-value\">"
    + state.warps.filter(function (w) { return w.status === "W MAGAZYNIE"; }).length
    + "</div></div>"
    + "<div class=\"metric-footnote\">Gotowe do przekazania.</div>"
    + "</article>"
    + "</div>"

    + "<div class=\"hero-layout\">"

    + "<article class=\"hero-card\">"
    + "<span class=\"eyebrow\">Podgląd operacyjny — " + escapeHtml(currentShiftLabel()) + "</span>"
    + "<h3>Wizualny prototyp hali produkcyjnej</h3>"
    + "<p>Wersja BETA z zegarem, dziennym resetem obecności, statystykami per oddział i dziennikiem zdarzeń.</p>"
    + "<ul>"
    + "<li>Krosna oznaczone prostymi numerami zgodnie z układem tkalni.</li>"
    + "<li>Zegar wyświetla aktualny czas — znaczniki zdarzeń są dokładne co do minuty.</li>"
    + "<li>Obecności resetują się codziennie o 00:00 do stanu <strong>BRAK STATUSU</strong>.</li>"
    + "<li>Karta pracownika zawiera statystyki per oddział z filtrem okresu.</li>"
    + "</ul>"
    + "</article>"

    + "<article class=\"panel\">"
    + "<div class=\"panel-header\">"
    + "<div class=\"panel-title\"><h3>Dziennik zdarzeń</h3><p>Ostatnie aktywności w systemie.</p></div>"
    + "</div>"
    + "<div class=\"event-log\" style=\"margin-top:0.75rem;\">" + renderEventLog() + "</div>"
    + "</article>"

    + "</div>"
    + "</div>";
}

// ========================
// PLAN HALI
// ========================

function planLegend() {
  return ["PRACUJE", "ZATRZYMANE", "AWARIA", "ZMIANA OSNOWY"].map(function (status) {
    return "<span class=\"legend-pill\"><span class=\"status-dot status-" + statusSlug(status) + "\"></span>"
      + escapeHtml(status) + "</span>";
  });
}

function renderPlan() {
  var hallLooms = state.looms.map(function (loom) {
    var position = hallPositionFor(loom.id);
    var activeWarp = state.warps.find(function (w) { return w.id === loom.activeWarpId; });
    return "<button"
      + " class=\"loom-spot " + (state.layoutEditing ? "editing" : "") + "\""
      + " style=\"left:" + position.x + "%; top:" + position.y + "%; --loom-accent:" + (modelColors[loom.model] || "#93c5fd") + ";\""
      + " data-loom-id=\"" + loom.id + "\""
      + " type=\"button\">"
      + "<div class=\"loom-topline\">"
      + "<div class=\"chip-group\">"
      + "<span class=\"status-dot status-" + statusSlug(loom.status) + "\"></span>"
      + "<span class=\"loom-number\">" + escapeHtml(loom.number) + "</span>"
      + "</div>"
      + (state.layoutEditing ? "<span class=\"drag-chip\">Przesuń</span>" : "")
      + "</div>"
      + "<strong class=\"loom-title\">" + escapeHtml(loom.name) + "</strong>"
      + "<span class=\"loom-meta\">" + escapeHtml(loom.type) + " · " + escapeHtml(loom.model) + "</span>"
      + "<div class=\"loom-tags\">"
      + "<span class=\"mini-pill\">" + escapeHtml(loom.article) + "</span>"
      + statusBadge(loom.status)
      + "</div>"
      + "<span class=\"loom-warp\">" + (activeWarp ? "Osnowa " + escapeHtml(activeWarp.number) : "Bez aktywnej osnowy") + "</span>"
      + "</button>";
  }).join("");

  $("#plan-hali").innerHTML =
    "<div class=\"screen-stack\">"
    + "<article class=\"panel\">"
    + "<div class=\"panel-header\">"
    + "<div class=\"panel-title\"><h3>Plan hali produkcyjnej</h3><p>Układ krosien w przestrzeni hali. Numery zgodne z realnym oznaczeniem na tkalni.</p></div>"
    + "<div class=\"panel-actions\">"
    + "<button id=\"toggle-layout-edit\" class=\"" + (state.layoutEditing ? "primary" : "ghost") + "\" type=\"button\">"
    + (state.layoutEditing ? "Zakończ edycję" : "Edytuj układ")
    + "</button>"
    + "<button id=\"reset-layout\" class=\"ghost\" type=\"button\">Reset układu</button>"
    + "</div>"
    + "</div>"
    + "<p class=\"layout-note\">"
    + (state.layoutEditing
        ? "Przeciągaj krosna po hali. Zmiany zapisują się lokalnie w tej przeglądarce."
        : "Kliknij krosno, aby otworzyć panel szczegółów. Numery 1, 2, 3… zgodne z oznaczeniami na tkalni.")
    + "</p>"
    + "</article>"

    + "<article class=\"hall-board panel\">"
    + "<div class=\"hall-board-header\">"
    + "<div class=\"panel-title\"><h3>Strefy i statusy</h3><p>Kolor listwy oznacza model stanowiska, a badge i dioda pokazują status pracy.</p></div>"
    + "<div class=\"legend\">" + planLegend().join("") + "</div>"
    + "</div>"
    + "<div class=\"hall-surface " + (state.layoutEditing ? "editing" : "") + "\" id=\"hall-surface\">"
    + "<div class=\"hall-outline\"></div>"
    + "<div class=\"hall-zone zone-a\">Sektor A<span>Krosna rapierowe · ciąg północny</span></div>"
    + "<div class=\"hall-zone zone-b\">Sektor B<span>Krosna pneumatyczne · ciąg północny</span></div>"
    + "<div class=\"hall-zone zone-service\">Zaplecze serwisowe<span>Przezbrojenia, kontrola, odkład</span></div>"
    + "<div class=\"hall-aisle vertical\"></div>"
    + "<div class=\"hall-aisle horizontal\"></div>"
    + "<div class=\"aisle-label vertical\">Aleja główna</div>"
    + "<div class=\"aisle-label horizontal\">Przejście technologiczne</div>"
    + hallLooms
    + "</div>"
    + "</article>"
    + "</div>";

  $("#toggle-layout-edit").onclick = toggleHallEditMode;
  $("#reset-layout").onclick = resetHallLayout;

  $("#plan-hali").querySelectorAll("[data-loom-id]").forEach(function (button) {
    var loomId = Number(button.dataset.loomId);
    if (state.layoutEditing) {
      button.onpointerdown = startHallDrag;
      button.onpointermove = moveHallDrag;
      button.onpointerup = endHallDrag;
      button.onpointercancel = cancelHallDrag;
      button.onkeydown = function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLoomDrawer(loomId);
        }
      };
    } else {
      button.onclick = function () { openLoomDrawer(loomId); };
    }
  });
}

// ========================
// HALL DRAG
// ========================

let hallDrag = null;

function startHallDrag(event) {
  if (!state.layoutEditing || event.button !== 0) return;
  var button = event.currentTarget;
  var surface = $("#hall-surface");
  if (!surface) return;

  hallDrag = {
    loomId: Number(button.dataset.loomId),
    button: button,
    rect: surface.getBoundingClientRect(),
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };

  button.classList.add("dragging");
  if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
}

function applyHallPointerPosition(clientX, clientY, loomId) {
  if (!hallDrag || !hallDrag.rect) return;
  var x = clamp(((clientX - hallDrag.rect.left) / hallDrag.rect.width) * 100, 14, 86);
  var y = clamp(((clientY - hallDrag.rect.top) / hallDrag.rect.height) * 100, 18, 84);
  state.hallLayout[loomId] = { x: x, y: y };
  hallDrag.button.style.left = x + "%";
  hallDrag.button.style.top = y + "%";
}

function moveHallDrag(event) {
  if (!hallDrag || hallDrag.loomId !== Number(event.currentTarget.dataset.loomId)) return;
  var movedEnough = Math.abs(event.clientX - hallDrag.startX) > 5 || Math.abs(event.clientY - hallDrag.startY) > 5;
  hallDrag.moved = hallDrag.moved || movedEnough;
  if (!hallDrag.moved) return;
  applyHallPointerPosition(event.clientX, event.clientY, hallDrag.loomId);
}

function finishHallDrag(pointerId) {
  if (!hallDrag) return;
  if (hallDrag.button.releasePointerCapture) hallDrag.button.releasePointerCapture(pointerId);
  hallDrag.button.classList.remove("dragging");
}

function endHallDrag(event) {
  if (!hallDrag || hallDrag.loomId !== Number(event.currentTarget.dataset.loomId)) return;
  var loomId = hallDrag.loomId;
  var moved = hallDrag.moved;
  finishHallDrag(event.pointerId);
  hallDrag = null;

  if (moved) {
    persistHallLayout();
    renderPlan();
    return;
  }
  openLoomDrawer(loomId);
}

function cancelHallDrag(event) {
  if (!hallDrag || hallDrag.loomId !== Number(event.currentTarget.dataset.loomId)) return;
  finishHallDrag(event.pointerId);
  hallDrag = null;
  renderPlan();
}

// ========================
// LOOM DRAWER
// ========================

function queueChips(queue) {
  if (!queue.length) return "<span class=\"empty-state\">Brak pozycji w kolejce.</span>";
  return queue.map(function (item) { return "<span class=\"mini-pill\">" + escapeHtml(item) + "</span>"; }).join("");
}

function detailStat(label, value) {
  return "<div class=\"detail-stat\"><span>" + escapeHtml(label) + "</span><strong>" + value + "</strong></div>";
}

function historyList(items) {
  if (!items.length) return "<p class=\"empty-state\">Brak wpisów.</p>";
  return "<ul>" + items.map(function (entry) {
    return "<li>" + escapeHtml(entry.when) + " — " + escapeHtml(entry.warpNumber) + " (" + escapeHtml(entry.status) + ")</li>";
  }).join("") + "</ul>";
}

function loomDetailsHtml(loom) {
  var activeWarp = state.warps.find(function (w) { return w.id === loom.activeWarpId; });
  var loomHistory = state.loomWarpHistory.filter(function (e) { return e.loomNumber === loom.number; });

  return "<div class=\"drawer-stack\">"
    + "<article class=\"hero-card\">"
    + "<span class=\"eyebrow\">Stanowisko hali · Krosno " + escapeHtml(loom.number) + "</span>"
    + "<h3>Krosno " + escapeHtml(loom.number) + " — " + escapeHtml(loom.name) + "</h3>"
    + "<p>" + escapeHtml(loom.type) + " · " + escapeHtml(loom.model) + " · " + escapeHtml(loom.article) + "</p>"
    + "<div class=\"chip-group\">"
    + statusBadge(loom.status)
    + "<span class=\"mini-pill\">" + (activeWarp ? "Aktywna " + escapeHtml(activeWarp.number) : "Bez aktywnej osnowy") + "</span>"
    + "</div>"
    + "</article>"

    + "<div class=\"detail-grid\">"
    + detailStat("Typ maszyny", escapeHtml(loom.type))
    + detailStat("Model", escapeHtml(loom.model))
    + detailStat("Artykuł", escapeHtml(loom.article))
    + detailStat("Notatki", escapeHtml(loom.notes || "-"))
    + "</div>"

    + "<article class=\"panel detail-panel\">"
    + "<div class=\"panel-title\"><h3>Kolejka i obsługa</h3><p>Najważniejsze działania operacyjne.</p></div>"
    + "<div class=\"chip-group\" style=\"margin-top:0.85rem;\">" + queueChips(loom.queue) + "</div>"
    + "<div class=\"controls\" style=\"margin-top:0.95rem;\">"
    + "<button class=\"primary\" onclick=\"mountPreparedWarp(" + loom.id + ")\">Użyj / wybierz osnowę</button>"
    + "<button onclick=\"removeWarp(" + loom.id + ")\">Zdejmij osnowę</button>"
    + "<button onclick=\"returnWarpToStore(" + loom.id + ")\">Zwróć do magazynu</button>"
    + "</div>"
    + "</article>"

    + "<article class=\"panel detail-panel\">"
    + "<div class=\"panel-title\"><h3>Historia osnów</h3><p>Filtruj wpisy przypisane do tego stanowiska.</p></div>"
    + "<div class=\"controls\" style=\"margin-top:0.8rem;\">"
    + "<input id=\"loom-history-search\" placeholder=\"Szukaj w historii osnów\" oninput=\"renderLoomHistory(" + loom.id + ", this.value)\" />"
    + "</div>"
    + "<div id=\"loom-history-list\">" + historyList(loomHistory) + "</div>"
    + "</article>"

    + "<article class=\"panel detail-panel\">"
    + "<div class=\"panel-title\"><h3>Historia zmian</h3><p>Ostatnie zdarzenia z dokładną godziną.</p></div>"
    + "<ul>" + (loom.history.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") || "<li>Brak</li>") + "</ul>"
    + "</article>"
    + "</div>";
}

function renderLoomHistory(loomId, query) {
  query = query || "";
  var loom = state.looms.find(function (item) { return item.id === loomId; });
  var filtered = state.loomWarpHistory.filter(function (entry) {
    return entry.loomNumber === loom.number &&
      [entry.warpNumber, entry.status, entry.when].join(" ").toLowerCase().includes(query.toLowerCase());
  });
  var el = $("#loom-history-list");
  if (el) el.innerHTML = historyList(filtered);
}

function openLoomDrawer(loomId) {
  state.selectedLoomId = loomId;
  var loom = state.looms.find(function (item) { return item.id === loomId; });
  $("#drawer-content").innerHTML = loomDetailsHtml(loom);
  $("#loom-drawer").classList.remove("hidden");
  $("#loom-drawer").setAttribute("aria-hidden", "false");
  $("#drawer-backdrop").classList.remove("hidden");
}

function closeDrawer() {
  $("#loom-drawer").classList.add("hidden");
  $("#loom-drawer").setAttribute("aria-hidden", "true");
  $("#drawer-backdrop").classList.add("hidden");
}

// ========================
// LOOM ACTIONS
// ========================

function addHistoryEntry(loom, action, warpNumber) {
  var ts = nowTs();
  loom.history.unshift(ts + " — " + action);
  if (warpNumber) {
    var entry = { loomNumber: loom.number, warpNumber: warpNumber, status: action, when: ts };
    state.loomWarpHistory.unshift(entry);
    state.globalWarpHistory.unshift({ warpNumber: warpNumber, action: action, loomNumber: loom.number, when: ts });
  }
  addEvent("loom", "Krosno " + loom.number + " — " + action + (warpNumber ? " (" + warpNumber + ")" : ""));
}

function mountPreparedWarp(loomId) {
  var loom = state.looms.find(function (item) { return item.id === loomId; });
  var readyWarps = state.warps.filter(function (w) { return w.status === "PRZYGOTOWANA"; });
  if (!readyWarps.length) { alert("Brak osnów gotowych do założenia."); return; }

  var choice = prompt(
    "Wpisz numer osnowy do założenia na krosno " + loom.number + ":\n" +
    readyWarps.map(function (w) { return w.number + " (" + w.status + ")"; }).join("\n")
  );
  if (!choice) return;
  var warp = readyWarps.find(function (item) { return item.number === choice.trim(); });
  if (!warp) { alert("Nie znaleziono osnowy."); return; }
  if (warp.status !== "PRZYGOTOWANA") { alert("Na krosno można założyć tylko osnowę PRZYGOTOWANA."); return; }

  if (loom.activeWarpId) {
    var previousWarp = state.warps.find(function (item) { return item.id === loom.activeWarpId; });
    if (previousWarp) {
      previousWarp.status = "ZDJĘTA Z KROSNA";
      previousWarp.loomId = null;
      previousWarp.timeline.push("Zdjęta z krosna " + loom.number);
      addHistoryEntry(loom, "ZDJĘTA Z KROSNA", previousWarp.number);
    }
  }

  loom.activeWarpId = warp.id;
  warp.status = "NA KROŚNIE";
  warp.loomId = loom.id;
  warp.timeline.push("Założona na krosno " + loom.number);
  addHistoryEntry(loom, "NA KROŚNIE", warp.number);
  renderAll();
  openLoomDrawer(loomId);
}

function removeWarp(loomId) {
  var loom = state.looms.find(function (item) { return item.id === loomId; });
  if (!loom.activeWarpId) { alert("To krosno nie ma aktywnej osnowy."); return; }
  var warp = state.warps.find(function (item) { return item.id === loom.activeWarpId; });
  loom.activeWarpId = null;
  warp.status = "ZDJĘTA Z KROSNA";
  warp.loomId = null;
  warp.timeline.push("Zdjęta z krosna " + loom.number);
  addHistoryEntry(loom, "ZDJĘTA Z KROSNA", warp.number);
  renderAll();
  openLoomDrawer(loomId);
}

function returnWarpToStore(loomId) {
  var loom = state.looms.find(function (item) { return item.id === loomId; });
  if (!loom.activeWarpId) { alert("Brak osnowy do zwrotu."); return; }
  var warp = state.warps.find(function (item) { return item.id === loom.activeWarpId; });
  loom.activeWarpId = null;
  warp.status = "W MAGAZYNIE";
  warp.loomId = null;
  warp.timeline.push("Zwrócona do magazynu z krosna " + loom.number);
  addHistoryEntry(loom, "W MAGAZYNIE", warp.number);
  renderAll();
  openLoomDrawer(loomId);
}

// ========================
// LOOMS TABLE
// ========================

function renderLoomsTable() {
  var root = $("#krosna");
  var query = (root.querySelector("#loom-search") ? root.querySelector("#loom-search").value : "").toLowerCase();
  var safeQuery = escapeHtml(query);
  var status = root.querySelector("#loom-status-filter") ? root.querySelector("#loom-status-filter").value : "ALL";

  var filtered = state.looms.filter(function (loom) {
    var inQuery = [loom.number, loom.type, loom.model, loom.status, loom.article].join(" ").toLowerCase().includes(query);
    return inQuery && (status === "ALL" || status === loom.status);
  });

  root.innerHTML =
    "<div class=\"screen-stack\">"
    + "<article class=\"table-card\">"
    + "<div class=\"table-toolbar\">"
    + "<div class=\"panel-title\"><h3>Lista krosien</h3><p>Numery zgodne z oznaczeniami na tkalni (1, 2, 3…). Kliknij wiersz dla szczegółów.</p></div>"
    + "<div class=\"controls\">"
    + "<input id=\"loom-search\" placeholder=\"Szukaj krosna\" value=\"" + safeQuery + "\" />"
    + "<select id=\"loom-status-filter\">"
    + "<option value=\"ALL\">Wszystkie statusy</option>"
    + ["PRACUJE", "ZATRZYMANE", "AWARIA", "ZMIANA OSNOWY", "ZMIANA ARTYKUŁU", "ROZEBRANE"]
      .map(function (item) { return "<option value=\"" + item + "\"" + (status === item ? " selected" : "") + ">" + item + "</option>"; })
      .join("")
    + "</select>"
    + "</div>"
    + "</div>"
    + "<div class=\"table-wrap\"><table>"
    + "<thead><tr><th>Krosno nr</th><th>Typ</th><th>Model</th><th>Status</th><th>Artykuł</th><th>Aktywna osnowa</th></tr></thead>"
    + "<tbody>"
    + filtered.map(function (loom) {
        var warp = state.warps.find(function (item) { return item.id === loom.activeWarpId; });
        return "<tr class=\"clickable-row\" data-loom-id=\"" + loom.id + "\">"
          + "<td><strong>" + escapeHtml(loom.number) + "</strong></td>"
          + "<td>" + escapeHtml(loom.type) + "</td>"
          + "<td>" + escapeHtml(loom.model) + "</td>"
          + "<td>" + statusBadge(loom.status) + "</td>"
          + "<td>" + escapeHtml(loom.article) + "</td>"
          + "<td>" + (warp ? escapeHtml(warp.number) : "-") + "</td>"
          + "</tr>";
      }).join("")
    + "</tbody></table></div>"
    + "</article></div>";

  root.querySelector("#loom-search").oninput = renderLoomsTable;
  root.querySelector("#loom-status-filter").onchange = renderLoomsTable;
  root.querySelectorAll("tbody tr").forEach(function (row) {
    row.onclick = function () { openLoomDrawer(Number(row.dataset.loomId)); };
  });
}

// ========================
// WARPS
// ========================

function warpActionButtons(warp) {
  var actions = [];
  if (warp.status === "W MAGAZYNIE") actions.push("<button onclick=\"moveToThreading(" + warp.id + ")\">Przenieś na przewlekalnię</button>");
  if (warp.status === "PRZYGOTOWANA") actions.push("<button onclick=\"useWarpFromTable(" + warp.id + ")\">Użyj osnowę</button>");
  if (warp.status === "ZDJĘTA Z KROSNA") {
    actions.push("<button onclick=\"setWarpStatus(" + warp.id + ", 'W MAGAZYNIE')\">Zwróć do magazynu</button>");
    actions.push("<button onclick=\"setWarpStatus(" + warp.id + ", 'ZUŻYTA')\">Oznacz zużytą</button>");
  }
  return actions.join(" ") || "<span class=\"empty-state\">Brak</span>";
}

function setWarpStatus(warpId, status) {
  var warp = state.warps.find(function (item) { return item.id === warpId; });
  warp.status = status;
  warp.loomId = status === "W MAGAZYNIE" ? null : warp.loomId;
  warp.timeline.push(nowTs() + " — " + status);
  addEvent("warp", warp.number + " → " + status);
  renderAll();
}

function useWarpFromTable(warpId) {
  var warp = state.warps.find(function (item) { return item.id === warpId; });
  var loomChoice = prompt(
    "Podaj numer krosna dla " + warp.number + ":\n" +
    state.looms.map(function (l) { return l.number; }).join(", ")
  );
  if (!loomChoice) return;
  var loom = state.looms.find(function (item) { return item.number === loomChoice.trim(); });
  if (!loom) { alert("Nie znaleziono krosna."); return; }
  if (warp.status !== "PRZYGOTOWANA") { alert("Tylko osnowa PRZYGOTOWANA może być założona na krosno."); return; }
  loom.activeWarpId = warp.id;
  warp.status = "NA KROŚNIE";
  warp.loomId = loom.id;
  warp.timeline.push(nowTs() + " — Założona na krosno " + loom.number);
  addHistoryEntry(loom, "NA KROŚNIE", warp.number);
  renderAll();
}

function moveToThreading(warpId) {
  var warp = state.warps.find(function (item) { return item.id === warpId; });
  warp.status = "W KOLEJCE";
  warp.timeline.push(nowTs() + " — Przeniesiona na przewlekalnię");
  state.departments.Przewlekalnia.push({
    id: Date.now(),
    title: warp.number + " przygotowanie",
    status: "W KOLEJCE",
    linkedWarpId: warp.id
  });
  addEvent("warp", warp.number + " przeniesiona do Przewlekalnia");
  renderAll();
}

function renderWarps() {
  var root = $("#osnowy");
  var query = (root.querySelector("#warp-search") ? root.querySelector("#warp-search").value : "").toLowerCase();
  var safeQuery = escapeHtml(query);
  var status = root.querySelector("#warp-status-filter") ? root.querySelector("#warp-status-filter").value : "ALL";
  var sort = root.querySelector("#warp-sort") ? root.querySelector("#warp-sort").value : "number";
  var historyQuery = root.querySelector("#history-search") ? root.querySelector("#history-search").value : "";
  var safeHistoryQuery = escapeHtml(historyQuery);

  var filtered = state.warps
    .filter(function (warp) {
      var match = [warp.number, warp.name, warp.rollerType, warp.status].join(" ").toLowerCase().includes(query);
      return match && (status === "ALL" || warp.status === status);
    })
    .sort(function (a, b) {
      return sort === "meters" ? a.meters - b.meters : String(a[sort]).localeCompare(String(b[sort]), "pl");
    });

  var history = state.globalWarpHistory.filter(function (entry) {
    return [entry.warpNumber, entry.action, entry.loomNumber, entry.when].join(" ").toLowerCase().includes(historyQuery.toLowerCase());
  });

  root.innerHTML =
    "<div class=\"screen-stack\">"
    + "<article class=\"table-card\">"
    + "<div class=\"table-toolbar\">"
    + "<div class=\"panel-title\"><h3>Osnowy</h3><p>Wspólny widok stanów magazynowych, przygotowania i przypisań do krosien.</p></div>"
    + "<div class=\"controls\">"
    + "<input id=\"warp-search\" placeholder=\"Szukaj osnowy\" value=\"" + safeQuery + "\" />"
    + "<select id=\"warp-status-filter\">"
    + "<option value=\"ALL\">Wszystkie statusy</option>"
    + ["W MAGAZYNIE", "W KOLEJCE", "W PRZYGOTOWANIU", "PRZYGOTOWANA", "NA KROŚNIE", "ZDJĘTA Z KROSNA", "ZUŻYTA"]
      .map(function (item) { return "<option value=\"" + item + "\"" + (status === item ? " selected" : "") + ">" + item + "</option>"; })
      .join("")
    + "</select>"
    + "<select id=\"warp-sort\">"
    + "<option value=\"number\"" + (sort === "number" ? " selected" : "") + ">Sortuj: numer</option>"
    + "<option value=\"name\"" + (sort === "name" ? " selected" : "") + ">Sortuj: nazwa</option>"
    + "<option value=\"meters\"" + (sort === "meters" ? " selected" : "") + ">Sortuj: metry</option>"
    + "</select>"
    + "</div>"
    + "</div>"
    + "<div class=\"table-wrap\"><table>"
    + "<thead><tr><th>Numer</th><th>Nazwa</th><th>Wałek</th><th>Metry</th><th>Status</th><th>Krosno</th><th>Akcje</th></tr></thead>"
    + "<tbody>"
    + filtered.map(function (warp) {
        var loom = state.looms.find(function (item) { return item.id === warp.loomId; });
        return "<tr>"
          + "<td><strong>" + escapeHtml(warp.number) + "</strong></td>"
          + "<td>" + escapeHtml(warp.name) + "</td>"
          + "<td>" + escapeHtml(warp.rollerType) + "</td>"
          + "<td>" + warp.meters + "</td>"
          + "<td>" + statusBadge(warp.status) + "</td>"
          + "<td>" + (loom ? escapeHtml(loom.number) : "-") + "</td>"
          + "<td>" + warpActionButtons(warp) + "</td>"
          + "</tr>";
      }).join("")
    + "</tbody></table></div>"
    + "</article>"

    + "<article class=\"table-card\">"
    + "<div class=\"table-toolbar\">"
    + "<div class=\"panel-title\"><h3>Historia osnów</h3><p>Wyszukiwanie po numerze, akcji, krośnie i dacie.</p></div>"
    + "<div class=\"controls\"><input id=\"history-search\" placeholder=\"Szukaj historii osnów\" value=\"" + safeHistoryQuery + "\" /></div>"
    + "</div>"
    + "<div class=\"table-wrap\"><table>"
    + "<thead><tr><th>Data i czas</th><th>Osnowa</th><th>Akcja</th><th>Krosno</th></tr></thead>"
    + "<tbody>"
    + history.map(function (entry) {
        return "<tr>"
          + "<td>" + escapeHtml(entry.when) + "</td>"
          + "<td>" + escapeHtml(entry.warpNumber) + "</td>"
          + "<td>" + escapeHtml(entry.action) + "</td>"
          + "<td>" + escapeHtml(entry.loomNumber || "-") + "</td>"
          + "</tr>";
      }).join("")
    + "</tbody></table></div>"
    + "</article>"
    + "</div>";

  root.querySelector("#warp-search").oninput = renderWarps;
  root.querySelector("#warp-status-filter").onchange = renderWarps;
  root.querySelector("#warp-sort").onchange = renderWarps;
  root.querySelector("#history-search").oninput = renderWarps;
}

// ========================
// DEPARTMENTS
// ========================

function renderDepartment(screenId, key, showInstall) {
  var root = document.getElementById(screenId);
  var jobs = state.departments[key];
  var finished = state.departmentHistory[key];

  root.innerHTML =
    "<div class=\"screen-stack\">"
    + "<article class=\"table-card\">"
    + "<div class=\"table-toolbar\">"
    + "<div class=\"panel-title\"><h3>" + escapeHtml(key) + "</h3><p>Demonstracyjny widok zadań bieżących oraz prostych przejść statusów.</p></div>"
    + "<div class=\"controls\"><button class=\"primary\" onclick=\"addDepartmentJob('" + key + "')\">Dodaj zlecenie</button></div>"
    + "</div>"
    + "<div class=\"table-wrap\"><table>"
    + "<thead><tr><th>Zlecenie</th><th>Status</th><th>Akcje</th></tr></thead>"
    + "<tbody>"
    + jobs.map(function (job) {
        var threading = key === "Przewlekalnia";
        var nextStatus = threading
          ? (job.status === "W KOLEJCE" ? "W PRZYGOTOWANIU" : job.status === "W PRZYGOTOWANIU" ? "PRZYGOTOWANA" : "")
          : (job.status === "W KOLEJCE" ? "W TRAKCIE" : "UKOŃCZONE");
        var linkedWarp = job.linkedWarpId ? state.warps.find(function (w) { return w.id === job.linkedWarpId; }) : null;
        var installButton = (showInstall && job.linkedWarpId && linkedWarp && linkedWarp.status === "PRZYGOTOWANA")
          ? "<button onclick=\"installPreparedFromThreading(" + job.linkedWarpId + ")\">Załóż na krosno</button>"
          : "";
        var nextButton = nextStatus
          ? "<button onclick=\"updateDepartmentStatus('" + key + "', " + job.id + ", '" + nextStatus + "')\">" + nextStatus + "</button>"
          : "";
        return "<tr>"
          + "<td>" + escapeHtml(job.title) + "</td>"
          + "<td>" + statusBadge(job.status) + "</td>"
          + "<td>" + nextButton + installButton + "</td>"
          + "</tr>";
      }).join("")
    + "</tbody></table></div>"
    + "</article>"

    + "<article class=\"table-card\">"
    + "<div class=\"panel-title\"><h3>Historia ukończonych</h3><p>Lista zakończonych pozycji dla działu " + escapeHtml(key) + ".</p></div>"
    + "<div class=\"table-wrap\" style=\"margin-top:0.9rem;\"><table>"
    + "<thead><tr><th>Zlecenie</th><th>Status</th></tr></thead>"
    + "<tbody>"
    + finished.map(function (job) {
        return "<tr><td>" + escapeHtml(job.title) + "</td><td>" + statusBadge(job.status) + "</td></tr>";
      }).join("")
    + "</tbody></table></div>"
    + "</article>"
    + "</div>";
}

function addDepartmentJob(key) {
  var title = prompt("Podaj nazwę nowego zlecenia dla " + key + ":");
  if (!title) return;
  state.departments[key].unshift({ id: Date.now(), title: title, status: "W KOLEJCE" });
  addEvent("department", key + ": nowe zlecenie — " + title);
  renderAll();
}

function updateDepartmentStatus(key, jobId, status) {
  var list = state.departments[key];
  var job = list.find(function (item) { return item.id === jobId; });
  if (!job) return;
  job.status = status;

  if (key === "Przewlekalnia" && job.linkedWarpId) {
    var warp = state.warps.find(function (item) { return item.id === job.linkedWarpId; });
    if (warp) warp.status = status;
  }

  addEvent("department", key + ": " + job.title + " → " + status);

  if (status === "UKOŃCZONE") {
    state.departmentHistory[key].unshift(Object.assign({}, job));
    state.departments[key] = list.filter(function (item) { return item.id !== jobId; });

    if (key === "Klejarnia" || key === "Snowalnia") {
      var newId = Math.max.apply(null, state.warps.map(function (w) { return w.id; })) + 1;
      var newWarpNumber = "OS-" + String(newId).padStart(4, "0");
      state.warps.unshift({
        id: newId,
        number: newWarpNumber,
        name: "Nowa osnowa " + key + " " + newWarpNumber,
        rollerType: "A",
        meters: 2000,
        status: "W MAGAZYNIE",
        loomId: null,
        createdFrom: key,
        timeline: ["Ukończono zlecenie", "Dodano do magazynu"]
      });
      state.globalWarpHistory.unshift({
        warpNumber: newWarpNumber,
        action: "W MAGAZYNIE",
        loomNumber: "-",
        when: nowTs()
      });
    }
  }

  renderAll();
}

function installPreparedFromThreading(warpId) {
  var warp = state.warps.find(function (item) { return item.id === warpId; });
  if (!warp || warp.status !== "PRZYGOTOWANA") { alert("Tylko osnowa PRZYGOTOWANA może być założona na krosno."); return; }
  useWarpFromTable(warpId);
  var job = state.departments.Przewlekalnia.find(function (item) { return item.linkedWarpId === warpId; });
  if (job) {
    state.departmentHistory.Przewlekalnia.unshift(Object.assign({}, job, { status: "UKOŃCZONE" }));
    state.departments.Przewlekalnia = state.departments.Przewlekalnia.filter(function (item) { return item.id !== job.id; });
  }
  renderAll();
}

// ========================
// EMPLOYEES
// ========================

var empCardState = { empId: null, period: "30d", customFrom: "", customTo: "" };

function getDateRange(period, customFrom, customTo) {
  var today = new Date();
  today.setHours(23, 59, 59, 999);
  var todayISO = today.toISOString().slice(0, 10);
  var from;

  if (period === "today") {
    var f = new Date();
    f.setHours(0, 0, 0, 0);
    return { from: f.toISOString().slice(0, 10), to: todayISO };
  }
  if (period === "7d") {
    from = new Date(today);
    from.setDate(from.getDate() - 7);
    return { from: from.toISOString().slice(0, 10), to: todayISO };
  }
  if (period === "30d") {
    from = new Date(today);
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString().slice(0, 10), to: todayISO };
  }
  if (period === "month") {
    var y = today.getFullYear();
    var m = today.getMonth() + 1;
    return { from: y + "-" + pad2(m) + "-01", to: todayISO };
  }
  if (period === "custom") {
    return { from: customFrom || "2000-01-01", to: customTo || todayISO };
  }
  // "all"
  return { from: "2000-01-01", to: todayISO };
}

function calcEmployeeStats(dailyHistory, from, to) {
  var filtered = dailyHistory.filter(function (e) { return e.date >= from && e.date <= to; });
  var deptCounts = {};
  DEPT_LABELS.forEach(function (d) { deptCounts[d] = 0; });
  var present = 0, sick = 0, vacation = 0, absent = 0;

  filtered.forEach(function (entry) {
    if (entry.status === "OBECNY") {
      present++;
      if (deptCounts[entry.department] !== undefined) {
        deptCounts[entry.department]++;
      }
    } else if (entry.status === "CHORY") {
      sick++;
    } else if (entry.status === "URLOP") {
      vacation++;
    } else if (entry.status === "NIEOBECNY") {
      absent++;
    }
  });

  return { present: present, sick: sick, vacation: vacation, absent: absent, deptCounts: deptCounts, total: filtered.length };
}

function periodLabel(period) {
  var map = { today: "Dziś", "7d": "7 dni", "30d": "30 dni", month: "Ten miesiąc", all: "Całość", custom: "Zakres własny" };
  return map[period] || period;
}

function renderEmployeeCard() {
  var container = $("#employee-card");
  if (!container) return;
  if (!empCardState.empId) { container.innerHTML = ""; return; }

  var emp = state.employees.find(function (e) { return e.id === empCardState.empId; });
  if (!emp) { container.innerHTML = ""; return; }

  var range = getDateRange(empCardState.period, empCardState.customFrom, empCardState.customTo);
  var stats = calcEmployeeStats(emp.dailyHistory, range.from, range.to);
  var pLabel = periodLabel(empCardState.period);

  var historyItems = emp.dailyHistory
    .filter(function (e) { return e.date >= range.from && e.date <= range.to; })
    .slice(0, 20);

  var periodButtons = [["today","Dziś"],["7d","7 dni"],["30d","30 dni"],["month","Ten miesiąc"],["all","Całość"],["custom","Własny"]]
    .map(function (pair) {
      var v = pair[0], l = pair[1];
      var isActive = empCardState.period === v;
      return "<button class=\"ghost period-btn" + (isActive ? " period-btn-active" : "") + "\" onclick=\"setEmpCardPeriod('" + v + "')\">" + escapeHtml(l) + "</button>";
    }).join("");

  var customRangeHtml = empCardState.period === "custom"
    ? "<div class=\"custom-range\">"
      + "<label>Od: <input type=\"date\" id=\"emp-date-from\" value=\"" + escapeHtml(empCardState.customFrom) + "\" /></label>"
      + "<label>Do: <input type=\"date\" id=\"emp-date-to\" value=\"" + escapeHtml(empCardState.customTo) + "\" /></label>"
      + "<button onclick=\"applyCustomEmpRange()\">Zastosuj</button>"
      + "</div>"
    : "";

  var attendanceBtns = ["OBECNY", "CHORY", "URLOP", "NIEOBECNY", "BRAK STATUSU"]
    .map(function (s) {
      var isActive = emp.attendance === s;
      return "<button class=\"ghost" + (isActive ? " att-btn-active" : "") + "\" onclick=\"setEmployeeAttendance(" + emp.id + ", '" + s + "')\">" + escapeHtml(s) + "</button>";
    }).join("");

  container.innerHTML =
    "<article class=\"panel emp-card\">"
    + "<div class=\"panel-header\">"
    + "<div class=\"panel-title\">"
    + "<h3>" + escapeHtml(emp.name) + "</h3>"
    + "<p>Zmiana " + emp.shift + " · " + escapeHtml(emp.branch) + " · " + badge(emp.attendance, "badge-status badge-" + statusSlug(emp.attendance)) + "</p>"
    + "</div>"
    + "<button class=\"ghost icon-btn\" onclick=\"empCardState.empId=null;renderEmployeeCard();\">✕</button>"
    + "</div>"

    + "<div class=\"emp-controls\">"
    + "<span class=\"emp-controls-label\">Ustaw obecność:</span>"
    + "<div class=\"chip-group\">" + attendanceBtns + "</div>"
    + "</div>"

    + "<div class=\"period-filter\">"
    + "<span class=\"period-filter-label\">Okres statystyk:</span>"
    + "<div class=\"chip-group\">" + periodButtons + "</div>"
    + "</div>"

    + customRangeHtml

    + "<h4 class=\"emp-section-title\">Statystyki — " + escapeHtml(pLabel) + "</h4>"
    + "<div class=\"detail-grid\">"
    + detailStat("Łącznie obecny", stats.present + " dni")
    + detailStat("Chorobowe", stats.sick + " dni")
    + detailStat("Urlop", stats.vacation + " dni")
    + detailStat("Nieobecny", stats.absent + " dni")
    + "</div>"

    + "<h4 class=\"emp-section-title\">Dni wg oddziałów — " + escapeHtml(pLabel) + "</h4>"
    + "<div class=\"detail-grid\">"
    + DEPT_LABELS.map(function (d) { return detailStat(d, stats.deptCounts[d] + " dni"); }).join("")
    + "</div>"

    + "<article class=\"detail-panel\" style=\"margin-top:1rem;\">"
    + "<h4>Historia — " + escapeHtml(pLabel) + "</h4>"
    + "<div class=\"table-wrap\" style=\"margin-top:0.5rem;\"><table>"
    + "<thead><tr><th>Data</th><th>Oddział</th><th>Status</th></tr></thead>"
    + "<tbody>"
    + (historyItems.length
        ? historyItems.map(function (e) {
            return "<tr><td>" + escapeHtml(e.date) + "</td><td>" + escapeHtml(e.department) + "</td><td>" + statusBadge(e.status) + "</td></tr>";
          }).join("")
        : "<tr><td colspan=\"3\" class=\"empty-state\" style=\"text-align:center;\">Brak wpisów w wybranym okresie.</td></tr>")
    + "</tbody></table></div>"
    + "</article>"
    + "</article>";
}

function setEmployeeAttendance(empId, status) {
  var emp = state.employees.find(function (e) { return e.id === empId; });
  if (!emp) return;
  emp.attendance = status;

  if (status !== "BRAK STATUSU") {
    var today = todayStr();
    var existingEntry = emp.dailyHistory.find(function (e) { return e.date === today; });
    if (existingEntry) {
      existingEntry.status = status;
    } else {
      emp.dailyHistory.unshift({ date: today, department: emp.branch, status: status });
    }
  }

  addEvent("attendance", emp.name + " → " + status);
  renderAll();
  renderEmployeeCard();
}

function renderEmployees() {
  var root = $("#pracownicy");
  var query = (root.querySelector("#emp-search") ? root.querySelector("#emp-search").value : "").toLowerCase();
  var safeQuery = escapeHtml(query);
  var shift = root.querySelector("#emp-shift") ? root.querySelector("#emp-shift").value : "ALL";
  var attendance = root.querySelector("#emp-attendance") ? root.querySelector("#emp-attendance").value : "ALL";

  var list = state.employees.filter(function (employee) {
    var match = [employee.name, employee.branch, employee.attendance].join(" ").toLowerCase().includes(query);
    return match && (shift === "ALL" || String(employee.shift) === shift) && (attendance === "ALL" || employee.attendance === attendance);
  });

  root.innerHTML =
    "<div class=\"screen-stack\">"
    + "<article class=\"table-card\">"
    + "<div class=\"table-toolbar\">"
    + "<div class=\"panel-title\">"
    + "<h3>Pracownicy</h3>"
    + "<p>Kliknij wiersz, aby otworzyć kartę z statystykami per oddział i filtrem okresu. "
    + "<span class=\"brak-statusu-legend\">⚠ BRAK STATUSU</span> — nie ustawiono obecności dziś.</p>"
    + "</div>"
    + "<div class=\"controls\">"
    + "<input id=\"emp-search\" placeholder=\"Szukaj pracownika\" value=\"" + safeQuery + "\" />"
    + "<select id=\"emp-shift\">"
    + "<option value=\"ALL\">Zmiana: wszystkie</option>"
    + "<option value=\"1\"" + (shift === "1" ? " selected" : "") + ">1</option>"
    + "<option value=\"2\"" + (shift === "2" ? " selected" : "") + ">2</option>"
    + "</select>"
    + "<select id=\"emp-attendance\">"
    + "<option value=\"ALL\">Obecność: wszystkie</option>"
    + ["OBECNY", "CHORY", "URLOP", "NIEOBECNY", "BRAK STATUSU"]
      .map(function (item) { return "<option value=\"" + item + "\"" + (attendance === item ? " selected" : "") + ">" + item + "</option>"; })
      .join("")
    + "</select>"
    + "</div>"
    + "</div>"
    + "<div class=\"table-wrap\"><table>"
    + "<thead><tr><th>Imię i nazwisko</th><th>Zmiana</th><th>Oddział</th><th>Obecność dziś</th></tr></thead>"
    + "<tbody>"
    + list.map(function (employee) {
        var isMissing = employee.attendance === "BRAK STATUSU";
        return "<tr class=\"clickable-row" + (isMissing ? " emp-row-no-status" : "") + "\" data-emp-id=\"" + employee.id + "\">"
          + "<td>" + (isMissing ? "<span class=\"no-status-icon\">⚠</span> " : "") + escapeHtml(employee.name) + "</td>"
          + "<td>" + employee.shift + "</td>"
          + "<td>" + escapeHtml(employee.branch) + "</td>"
          + "<td>" + badge(employee.attendance, "badge-status badge-" + statusSlug(employee.attendance)) + "</td>"
          + "</tr>";
      }).join("")
    + "</tbody></table></div>"
    + "</article>"
    + "<div id=\"employee-card\"></div>"
    + "</div>";

  root.querySelector("#emp-search").oninput = renderEmployees;
  root.querySelector("#emp-shift").onchange = renderEmployees;
  root.querySelector("#emp-attendance").onchange = renderEmployees;

  root.querySelectorAll("tbody tr").forEach(function (row) {
    row.onclick = function () {
      empCardState.empId = Number(row.dataset.empId);
      renderEmployeeCard();
    };
  });

  if (empCardState.empId) {
    renderEmployeeCard();
  }
}

// ========================
// RENDER ALL
// ========================

function renderAll() {
  if (state.activeScreen === "dashboard") renderDashboard();
  if (state.activeScreen === "plan-hali") renderPlan();
  if (state.activeScreen === "krosna") renderLoomsTable();
  if (state.activeScreen === "osnowy") renderWarps();
  if (state.activeScreen === "przewlekalnia") renderDepartment("przewlekalnia", "Przewlekalnia", true);
  if (state.activeScreen === "klejarnia") renderDepartment("klejarnia", "Klejarnia", false);
  if (state.activeScreen === "snowalnia") renderDepartment("snowalnia", "Snowalnia", false);
  if (state.activeScreen === "pracownicy") renderEmployees();
}

// ========================
// PWA & UI SETUP
// ========================

function setupPwa() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }
}

function setupUi() {
  $("#close-drawer").onclick = closeDrawer;
  $("#drawer-backdrop").onclick = closeDrawer;
  $("#mobile-menu-btn").onclick = function () { $("#sidebar").classList.toggle("open"); };
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDrawer();
      $("#sidebar").classList.remove("open");
    }
  });
}

// ========================
// INIT
// ========================

state.hallLayout = loadHallLayout();

setupUi();
renderNav();
updateTopbar();

// Render active screen
renderDashboard();
document.getElementById("dashboard").classList.add("active");

startClock();
setupPwa();

// Expose globals for inline onclick handlers
window.mountPreparedWarp = mountPreparedWarp;
window.removeWarp = removeWarp;
window.returnWarpToStore = returnWarpToStore;
window.renderLoomHistory = renderLoomHistory;
window.moveToThreading = moveToThreading;
window.useWarpFromTable = useWarpFromTable;
window.setWarpStatus = setWarpStatus;
window.updateDepartmentStatus = updateDepartmentStatus;
window.installPreparedFromThreading = installPreparedFromThreading;
window.addDepartmentJob = addDepartmentJob;
window.setEmployeeAttendance = setEmployeeAttendance;
window.empCardState = empCardState;
window.setEmpCardPeriod = function (period) {
  empCardState.period = period;
  renderEmployeeCard();
};
window.applyCustomEmpRange = function () {
  var fromEl = document.getElementById("emp-date-from");
  var toEl = document.getElementById("emp-date-to");
  empCardState.customFrom = fromEl ? fromEl.value : "";
  empCardState.customTo = toEl ? toEl.value : "";
  renderEmployeeCard();
};
window.renderEmployeeCard = renderEmployeeCard;
