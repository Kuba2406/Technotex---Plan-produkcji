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
  dashboard: "Szybki przegląd kluczowych sygnałów z hali i działów przygotowania produkcji.",
  "plan-hali": "Realistyczniejszy plan hali z rozmieszczeniem krosien i trybem ustawiania układu.",
  krosna: "Lista stanowisk z filtrowaniem, statusem pracy i szybkim wejściem do szczegółów.",
  osnowy: "Podgląd przepływu osnów między magazynem, przewlekalnią i aktywnymi krosnami.",
  przewlekalnia: "Kolejka zadań przygotowawczych i gotowych osnów do montażu na hali.",
  klejarnia: "Monitoring zleceń klejarni w formie lekkiego prototypu demonstracyjnego.",
  snowalnia: "Podgląd zleceń snowalni oraz efektów zasilających magazyn osnów.",
  pracownicy: "Szybki wgląd w obecność, zmianę i obciążenie pracowników."
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

const state = {
  looms: [
    { id: 1, number: "K-01", name: "BT 367/155", type: "Rapier", model: "Model A", status: "PRACUJE", article: "ART-101", activeWarpId: 101, queue: ["ART-120"], notes: "Stabilna praca", history: ["Uruchomienie zmiany 1"] },
    { id: 2, number: "K-02", name: "BT 403/130", type: "Pneumatyk", model: "Model B", status: "AWARIA", article: "ART-088", activeWarpId: null, queue: ["ART-102", "ART-111"], notes: "Sprawdzenie zaworu", history: ["Awaria zgłoszona"] },
    { id: 3, number: "K-03", name: "TOR 21", type: "Rapier", model: "Model C", status: "ZMIANA OSNOWY", article: "ART-090", activeWarpId: 103, queue: [], notes: "W toku przezbrojenie", history: ["Rozpoczęto zmianę osnowy"] },
    { id: 4, number: "K-04", name: "PNEU 7", type: "Pneumatyk", model: "Model D", status: "ZATRZYMANE", article: "ART-011", activeWarpId: null, queue: ["ART-015"], notes: "Czeka na osnowę", history: [] }
  ],
  warps: [
    { id: 101, number: "OS-0001", name: "Osnowa bawełna 30", rollerType: "A", meters: 2400, status: "NA KROŚNIE", loomId: 1, createdFrom: "Klejarnia", timeline: ["Utworzono", "Założono na K-01"] },
    { id: 102, number: "OS-0002", name: "Osnowa poliester 12", rollerType: "B", meters: 1900, status: "W MAGAZYNIE", loomId: null, createdFrom: "Snowalnia", timeline: ["Utworzono"] },
    { id: 103, number: "OS-0003", name: "Osnowa mix 18", rollerType: "A", meters: 2100, status: "NA KROŚNIE", loomId: 3, createdFrom: "Klejarnia", timeline: ["Utworzono", "Założono na K-03"] },
    { id: 104, number: "OS-0004", name: "Osnowa test 20", rollerType: "C", meters: 1750, status: "PRZYGOTOWANA", loomId: null, createdFrom: "Przewlekalnia", timeline: ["Przeniesiono na przewlekalnię", "Przygotowana"] },
    { id: 105, number: "OS-0005", name: "Osnowa archiwalna", rollerType: "B", meters: 1200, status: "ZUŻYTA", loomId: 2, createdFrom: "Klejarnia", timeline: ["Założona na K-02", "Zużyta"] }
  ],
  loomWarpHistory: [{ loomNumber: "K-02", warpNumber: "OS-0005", status: "ZUŻYTA", when: "2026-06-28" }],
  globalWarpHistory: [{ warpNumber: "OS-0005", action: "ZUŻYTA", loomNumber: "K-02", when: "2026-06-28" }],
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
    { id: 1, name: "Anna Kowalska", shift: 1, branch: "Hala", attendance: "OBECNY", stats: { totalDays: 220, branchDays: 180, sick: 4, vacation: 18, absent: 2 }, history: ["2026-07-01 OBECNY", "2026-06-30 OBECNY"] },
    { id: 2, name: "Piotr Nowak", shift: 2, branch: "Przewlekalnia", attendance: "CHORY", stats: { totalDays: 197, branchDays: 130, sick: 8, vacation: 20, absent: 3 }, history: ["2026-07-01 CHORY", "2026-06-30 OBECNY"] },
    { id: 3, name: "Ewa Zielińska", shift: 1, branch: "Klejarnia", attendance: "URLOP", stats: { totalDays: 160, branchDays: 99, sick: 3, vacation: 15, absent: 1 }, history: ["2026-07-01 URLOP", "2026-06-30 OBECNY"] }
  ],
  activeScreen: "dashboard",
  selectedLoomId: null,
  layoutEditing: false,
  hallLayout: {}
};

let hallDrag = null;

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

function hallPositionFor(loomId) {
  return state.hallLayout[loomId] || defaultHallLayout[loomId] || { x: 50, y: 50 };
}

function normalizeHallLayout(rawLayout = {}) {
  return Object.fromEntries(
    state.looms.map((loom) => {
      const fallback = defaultHallLayout[loom.id] || { x: 50, y: 50 };
      const raw = rawLayout[loom.id] || rawLayout[String(loom.id)] || {};
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
    const saved = window.localStorage.getItem(hallLayoutStorageKey);
    if (!saved) return normalizeHallLayout();
    return normalizeHallLayout(JSON.parse(saved));
  } catch {
    return normalizeHallLayout();
  }
}

function persistHallLayout() {
  try {
    window.localStorage.setItem(hallLayoutStorageKey, JSON.stringify(state.hallLayout));
  } catch {}
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

function updateTopbar() {
  const active = screens.find((screen) => screen.id === state.activeScreen);
  $("#screen-title").textContent = active?.label || "Technotex";
  $("#screen-subtitle").textContent =
    screenSubtitles[state.activeScreen] || "Demonstracyjny podgląd przepływu pracy.";
}

function renderNav() {
  const main = $("#main-nav");
  const bottom = $("#bottom-nav");
  main.innerHTML = "";
  bottom.innerHTML = "";

  screens.forEach((screen) => {
    const button = document.createElement("button");
    button.className = `nav-btn ${state.activeScreen === screen.id ? "active" : ""}`;
    button.textContent = screen.label;
    button.onclick = () => switchScreen(screen.id);
    main.appendChild(button);

    const mobileButton = button.cloneNode(true);
    mobileButton.className = button.className;
    mobileButton.onclick = button.onclick;
    bottom.appendChild(mobileButton);
  });
}

function switchScreen(id) {
  state.activeScreen = id;
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  updateTopbar();
  renderNav();
  renderAll();
  closeDrawer();
  $("#sidebar").classList.remove("open");
}

function statusCount(status) {
  return state.looms.filter((loom) => loom.status === status).length;
}

function dashboardFeed() {
  return [
    ...state.looms
      .flatMap((loom) =>
        loom.history.slice(0, 1).map((entry) => ({
          title: `${loom.number} · ${loom.name}`,
          detail: entry
        }))
      )
      .slice(0, 3),
    ...state.globalWarpHistory.slice(0, 2).map((entry) => ({
      title: `${entry.warpNumber} · ${entry.loomNumber || "-"}`,
      detail: `${entry.when} · ${entry.action}`
    }))
  ].slice(0, 4);
}

function renderDashboard() {
  const openOrders = ["Przewlekalnia", "Klejarnia", "Snowalnia"]
    .flatMap((key) => state.departments[key])
    .filter((job) => job.status !== "UKOŃCZONE").length;

  const feed = dashboardFeed();

  $("#dashboard").innerHTML = `
    <div class="screen-stack">
      <div class="hero-layout">
        <article class="hero-card">
          <span class="eyebrow">Podgląd operacyjny</span>
          <h3>Wizualny prototyp hali produkcyjnej</h3>
          <p>
            Aplikacja BETA skupia się teraz na czytelności, statusach pracy oraz bardziej realistycznym
            obrazie hali. Najważniejsze krosna, osnowy i działy przygotowawcze pozostają w jednym miejscu.
          </p>
          <ul>
            <li>Plan hali pokazuje krosna w przestrzeni, a nie w zwykłej siatce kafli.</li>
            <li>Statusy i karty są mocniej uporządkowane wizualnie pod szybki odczyt na zmianie.</li>
            <li>Układ hali można edytować lokalnie, aby przygotować warianty rozmieszczenia.</li>
          </ul>
        </article>

        <article class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h3>Szybkie sygnały</h3>
              <p>Najświeższe wpisy z hali i obiegu osnów.</p>
            </div>
          </div>
          ${feed
            .map(
              (item) => `
                <div class="detail-stat">
                  <span>${escapeHtml(item.title)}</span>
                  <strong>${escapeHtml(item.detail)}</strong>
                </div>`
            )
            .join("")}
        </article>
      </div>

      <div class="stats-grid">
        <article class="metric-card">
          <div>
            <h4>Krosna pracujące</h4>
            <div class="metric-value">${statusCount("PRACUJE")}</div>
          </div>
          <div class="metric-footnote">Stan aktywnych stanowisk w produkcji.</div>
        </article>
        <article class="metric-card">
          <div>
            <h4>Postoje / awarie</h4>
            <div class="metric-value">${statusCount("ZATRZYMANE") + statusCount("AWARIA")}</div>
          </div>
          <div class="metric-footnote">Wymagające uwagi technicznej lub przygotowania.</div>
        </article>
        <article class="metric-card">
          <div>
            <h4>Osnowy w magazynie</h4>
            <div class="metric-value">${state.warps.filter((warp) => warp.status === "W MAGAZYNIE").length}</div>
          </div>
          <div class="metric-footnote">Gotowe do przekazania na kolejny etap.</div>
        </article>
        <article class="metric-card">
          <div>
            <h4>Otwarte zlecenia</h4>
            <div class="metric-value">${openOrders}</div>
          </div>
          <div class="metric-footnote">Łącznie w przewlekalni, klejarni i snowalni.</div>
        </article>
        <article class="metric-card">
          <div>
            <h4>Pracownicy obecni</h4>
            <div class="metric-value">${state.employees.filter((employee) => employee.attendance === "OBECNY").length}</div>
          </div>
          <div class="metric-footnote">Na aktualnie zarejestrowanej zmianie.</div>
        </article>
      </div>
    </div>`;
}

function planLegend() {
  return ["PRACUJE", "ZATRZYMANE", "AWARIA", "ZMIANA OSNOWY"].map(
    (status) =>
      `<span class="legend-pill"><span class="status-dot status-${statusSlug(status)}"></span>${escapeHtml(status)}</span>`
  );
}

function renderPlan() {
  const hallLooms = state.looms
    .map((loom) => {
      const position = hallPositionFor(loom.id);
      const activeWarp = state.warps.find((warp) => warp.id === loom.activeWarpId);
      return `
        <button
          class="loom-spot ${state.layoutEditing ? "editing" : ""}"
          style="left:${position.x}%; top:${position.y}%; --loom-accent:${modelColors[loom.model] || "#93c5fd"};"
          data-loom-id="${loom.id}"
          type="button"
        >
          <div class="loom-topline">
            <div class="chip-group">
              <span class="status-dot status-${statusSlug(loom.status)}"></span>
              <span class="loom-number">${escapeHtml(loom.number)}</span>
            </div>
            ${state.layoutEditing ? '<span class="drag-chip">Przesuń</span>' : ""}
          </div>
          <strong class="loom-title">${escapeHtml(loom.name)}</strong>
          <span class="loom-meta">${escapeHtml(loom.type)} · ${escapeHtml(loom.model)}</span>
          <div class="loom-tags">
            <span class="mini-pill">${escapeHtml(loom.article)}</span>
            ${statusBadge(loom.status)}
          </div>
          <span class="loom-warp">${activeWarp ? `Osnowa ${escapeHtml(activeWarp.number)}` : "Bez aktywnej osnowy"}</span>
        </button>`;
    })
    .join("");

  $("#plan-hali").innerHTML = `
    <div class="screen-stack">
      <article class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <h3>Plan hali produkcyjnej</h3>
            <p>Układ przypomina przestrzeń hali z sektorami, alejami i punktami pracy.</p>
          </div>
          <div class="panel-actions">
            <button id="toggle-layout-edit" class="${state.layoutEditing ? "primary" : "ghost"}" type="button">
              ${state.layoutEditing ? "Zakończ edycję" : "Edytuj układ"}
            </button>
            <button id="reset-layout" class="ghost" type="button">Reset układu</button>
          </div>
        </div>
        <p class="layout-note">
          ${state.layoutEditing
            ? "Przeciągaj krosna po hali. Zmiany zapisują się lokalnie w tej przeglądarce."
            : "Kliknij krosno, aby otworzyć panel szczegółów. W trybie edycji możesz ustawić własny układ hali."}
        </p>
      </article>

      <article class="hall-board panel">
        <div class="hall-board-header">
          <div class="panel-title">
            <h3>Strefy i statusy</h3>
            <p>Kolor listwy oznacza model stanowiska, a badge i dioda pokazują status pracy.</p>
          </div>
          <div class="legend">${planLegend().join("")}</div>
        </div>

        <div class="hall-surface ${state.layoutEditing ? "editing" : ""}" id="hall-surface">
          <div class="hall-outline"></div>
          <div class="hall-zone zone-a">Sektor A<span>Krosna rapierowe · ciąg północny</span></div>
          <div class="hall-zone zone-b">Sektor B<span>Krosna pneumatyczne · ciąg północny</span></div>
          <div class="hall-zone zone-service">Zaplecze serwisowe<span>Przezbrojenia, kontrola, odkład</span></div>
          <div class="hall-aisle vertical"></div>
          <div class="hall-aisle horizontal"></div>
          <div class="aisle-label vertical">Aleja główna</div>
          <div class="aisle-label horizontal">Przejście technologiczne</div>
          ${hallLooms}
        </div>
      </article>
    </div>`;

  $("#toggle-layout-edit").onclick = toggleHallEditMode;
  $("#reset-layout").onclick = resetHallLayout;

  $("#plan-hali").querySelectorAll("[data-loom-id]").forEach((button) => {
    const loomId = Number(button.dataset.loomId);
    if (state.layoutEditing) {
      button.onpointerdown = startHallDrag;
      button.onpointermove = moveHallDrag;
      button.onpointerup = endHallDrag;
      button.onpointercancel = cancelHallDrag;
      button.onkeydown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLoomDrawer(loomId);
        }
      };
    } else {
      button.onclick = () => openLoomDrawer(loomId);
    }
  });
}

function startHallDrag(event) {
  if (!state.layoutEditing || event.button !== 0) return;
  const button = event.currentTarget;
  const surface = $("#hall-surface");
  if (!surface) return;

  hallDrag = {
    loomId: Number(button.dataset.loomId),
    button,
    rect: surface.getBoundingClientRect(),
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };

  button.classList.add("dragging");
  button.setPointerCapture?.(event.pointerId);
}

function applyHallPointerPosition(clientX, clientY, loomId) {
  if (!hallDrag?.rect) return;
  const x = clamp(((clientX - hallDrag.rect.left) / hallDrag.rect.width) * 100, 14, 86);
  const y = clamp(((clientY - hallDrag.rect.top) / hallDrag.rect.height) * 100, 18, 84);
  state.hallLayout[loomId] = { x, y };
  hallDrag.button.style.left = `${x}%`;
  hallDrag.button.style.top = `${y}%`;
}

function moveHallDrag(event) {
  if (!hallDrag || hallDrag.loomId !== Number(event.currentTarget.dataset.loomId)) return;
  const movedEnough =
    Math.abs(event.clientX - hallDrag.startX) > 5 || Math.abs(event.clientY - hallDrag.startY) > 5;
  hallDrag.moved = hallDrag.moved || movedEnough;
  if (!hallDrag.moved) return;
  applyHallPointerPosition(event.clientX, event.clientY, hallDrag.loomId);
}

function finishHallDrag(pointerId) {
  if (!hallDrag) return;
  hallDrag.button.releasePointerCapture?.(pointerId);
  hallDrag.button.classList.remove("dragging");
}

function endHallDrag(event) {
  if (!hallDrag || hallDrag.loomId !== Number(event.currentTarget.dataset.loomId)) return;
  const { loomId, moved } = hallDrag;
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

function queueChips(queue) {
  if (!queue.length) return '<span class="empty-state">Brak pozycji w kolejce.</span>';
  return queue.map((item) => `<span class="mini-pill">${escapeHtml(item)}</span>`).join("");
}

function detailStat(label, value) {
  return `<div class="detail-stat"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`;
}

function historyList(items) {
  if (!items.length) return "<p class=\"empty-state\">Brak wpisów.</p>";
  return `<ul>${items
    .map((entry) => `<li>${escapeHtml(entry.when)} — ${escapeHtml(entry.warpNumber)} (${escapeHtml(entry.status)})</li>`)
    .join("")}</ul>`;
}

function loomDetailsHtml(loom) {
  const activeWarp = state.warps.find((warp) => warp.id === loom.activeWarpId);
  const loomHistory = state.loomWarpHistory.filter((entry) => entry.loomNumber === loom.number);

  return `
    <div class="drawer-stack">
      <article class="hero-card">
        <span class="eyebrow">Stanowisko hali</span>
        <h3>${escapeHtml(loom.number)} — ${escapeHtml(loom.name)}</h3>
        <p>${escapeHtml(loom.type)} · ${escapeHtml(loom.model)} · ${escapeHtml(loom.article)}</p>
        <div class="chip-group">
          ${statusBadge(loom.status)}
          <span class="mini-pill">${activeWarp ? `Aktywna ${escapeHtml(activeWarp.number)}` : "Bez aktywnej osnowy"}</span>
        </div>
      </article>

      <div class="detail-grid">
        ${detailStat("Typ maszyny", escapeHtml(loom.type))}
        ${detailStat("Model", escapeHtml(loom.model))}
        ${detailStat("Artykuł", escapeHtml(loom.article))}
        ${detailStat("Notatki", escapeHtml(loom.notes || "-"))}
      </div>

      <article class="panel detail-panel">
        <div class="panel-title">
          <h3>Kolejka i obsługa</h3>
          <p>Najważniejsze działania operacyjne dostępne bezpośrednio z widoku krosna.</p>
        </div>
        <div class="chip-group" style="margin-top:0.85rem;">
          ${queueChips(loom.queue)}
        </div>
        <div class="controls" style="margin-top:0.95rem;">
          <button class="primary" onclick="mountPreparedWarp(${loom.id})">Użyj / wybierz osnowę</button>
          <button onclick="removeWarp(${loom.id})">Zdejmij osnowę</button>
          <button onclick="returnWarpToStore(${loom.id})">Zwróć do magazynu</button>
        </div>
      </article>

      <article class="panel detail-panel">
        <div class="panel-title">
          <h3>Historia osnów</h3>
          <p>Filtruj wpisy przypisane do tego stanowiska.</p>
        </div>
        <div class="controls" style="margin-top:0.8rem;">
          <input id="loom-history-search" placeholder="Szukaj w historii osnów" oninput="renderLoomHistory(${loom.id}, this.value)" />
        </div>
        <div id="loom-history-list">${historyList(loomHistory)}</div>
      </article>

      <article class="panel detail-panel">
        <div class="panel-title">
          <h3>Historia zmian</h3>
          <p>Ostatnie zdarzenia zapisane dla krosna.</p>
        </div>
        <ul>${loom.history.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Brak</li>"}</ul>
      </article>
    </div>`;
}

function renderLoomHistory(loomId, query = "") {
  const loom = state.looms.find((item) => item.id === loomId);
  const filtered = state.loomWarpHistory.filter(
    (entry) =>
      entry.loomNumber === loom.number &&
      [entry.warpNumber, entry.status, entry.when].join(" ").toLowerCase().includes(query.toLowerCase())
  );
  $("#loom-history-list").innerHTML = historyList(filtered);
}

function openLoomDrawer(loomId) {
  state.selectedLoomId = loomId;
  const loom = state.looms.find((item) => item.id === loomId);
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

function addHistoryEntry(loom, action, warpNumber) {
  const today = new Date().toISOString().slice(0, 10);
  loom.history.unshift(`${today} — ${action}`);
  if (warpNumber) {
    const entry = { loomNumber: loom.number, warpNumber, status: action, when: today };
    state.loomWarpHistory.unshift(entry);
    state.globalWarpHistory.unshift({ warpNumber, action, loomNumber: loom.number, when: today });
  }
}

function mountPreparedWarp(loomId) {
  const loom = state.looms.find((item) => item.id === loomId);
  const readyWarps = state.warps.filter((warp) => warp.status === "PRZYGOTOWANA");
  if (!readyWarps.length) return alert("Brak osnów gotowych do założenia.");

  const choice = prompt(
    `Wpisz numer osnowy do założenia na ${loom.number}:\n${readyWarps
      .map((warp) => `${warp.number} (${warp.status})`)
      .join("\n")}`
  );
  if (!choice) return;
  const warp = readyWarps.find((item) => item.number === choice.trim());
  if (!warp) return alert("Nie znaleziono osnowy.");
  if (warp.status !== "PRZYGOTOWANA") return alert("Na krosno można założyć tylko osnowę PRZYGOTOWANA.");

  if (loom.activeWarpId) {
    const previousWarp = state.warps.find((item) => item.id === loom.activeWarpId);
    if (previousWarp) {
      previousWarp.status = "ZDJĘTA Z KROSNA";
      previousWarp.loomId = null;
      previousWarp.timeline.push(`Zdjęta z ${loom.number}`);
      addHistoryEntry(loom, "ZDJĘTA Z KROSNA", previousWarp.number);
    }
  }

  loom.activeWarpId = warp.id;
  warp.status = "NA KROŚNIE";
  warp.loomId = loom.id;
  warp.timeline.push(`Założona na ${loom.number}`);
  addHistoryEntry(loom, "NA KROŚNIE", warp.number);
  renderAll();
  openLoomDrawer(loomId);
}

function removeWarp(loomId) {
  const loom = state.looms.find((item) => item.id === loomId);
  if (!loom.activeWarpId) return alert("To krosno nie ma aktywnej osnowy.");
  const warp = state.warps.find((item) => item.id === loom.activeWarpId);
  loom.activeWarpId = null;
  warp.status = "ZDJĘTA Z KROSNA";
  warp.loomId = null;
  warp.timeline.push(`Zdjęta z ${loom.number}`);
  addHistoryEntry(loom, "ZDJĘTA Z KROSNA", warp.number);
  renderAll();
  openLoomDrawer(loomId);
}

function returnWarpToStore(loomId) {
  const loom = state.looms.find((item) => item.id === loomId);
  if (!loom.activeWarpId) return alert("Brak osnowy do zwrotu.");
  const warp = state.warps.find((item) => item.id === loom.activeWarpId);
  loom.activeWarpId = null;
  warp.status = "W MAGAZYNIE";
  warp.loomId = null;
  warp.timeline.push(`Zwrócona do magazynu z ${loom.number}`);
  addHistoryEntry(loom, "W MAGAZYNIE", warp.number);
  renderAll();
  openLoomDrawer(loomId);
}

function renderLoomsTable() {
  const root = $("#krosna");
  const query = (root.querySelector("#loom-search")?.value || "").toLowerCase();
  const safeQuery = escapeHtml(query);
  const status = root.querySelector("#loom-status-filter")?.value || "ALL";
  const filtered = state.looms.filter((loom) => {
    const inQuery = [loom.number, loom.type, loom.model, loom.status, loom.article].join(" ").toLowerCase().includes(query);
    return inQuery && (status === "ALL" || status === loom.status);
  });

  root.innerHTML = `
    <div class="screen-stack">
      <article class="table-card">
        <div class="table-toolbar">
          <div class="panel-title">
            <h3>Lista krosien</h3>
            <p>Filtruj po numerze, statusie lub modelu i otwieraj szczegóły kliknięciem w wiersz.</p>
          </div>
          <div class="controls">
            <input id="loom-search" placeholder="Szukaj krosna" value="${safeQuery}" />
            <select id="loom-status-filter">
              <option value="ALL">Wszystkie statusy</option>
              ${["PRACUJE", "ZATRZYMANE", "AWARIA", "ZMIANA OSNOWY", "ZMIANA ARTYKUŁU", "ROZEBRANE"]
                .map((item) => `<option value="${item}" ${status === item ? "selected" : ""}>${item}</option>`)
                .join("")}
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Numer</th><th>Typ</th><th>Model</th><th>Status</th><th>Artykuł</th><th>Aktywna osnowa</th></tr>
            </thead>
            <tbody>
              ${filtered
                .map((loom) => {
                  const warp = state.warps.find((item) => item.id === loom.activeWarpId);
                  return `
                    <tr class="clickable-row" data-loom-id="${loom.id}">
                      <td><strong>${escapeHtml(loom.number)}</strong></td>
                      <td>${escapeHtml(loom.type)}</td>
                      <td>${escapeHtml(loom.model)}</td>
                      <td>${statusBadge(loom.status)}</td>
                      <td>${escapeHtml(loom.article)}</td>
                      <td>${warp ? escapeHtml(warp.number) : "-"}</td>
                    </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
    </div>`;

  root.querySelector("#loom-search").oninput = renderLoomsTable;
  root.querySelector("#loom-status-filter").onchange = renderLoomsTable;
  root.querySelectorAll("tbody tr").forEach((row) => {
    row.onclick = () => openLoomDrawer(Number(row.dataset.loomId));
  });
}

function warpActionButtons(warp) {
  const actions = [];
  if (warp.status === "W MAGAZYNIE") actions.push(`<button onclick="moveToThreading(${warp.id})">Przenieś na przewlekalnię</button>`);
  if (warp.status === "PRZYGOTOWANA") actions.push(`<button onclick="useWarpFromTable(${warp.id})">Użyj osnowę</button>`);
  if (warp.status === "ZDJĘTA Z KROSNA") {
    actions.push(`<button onclick="setWarpStatus(${warp.id}, 'W MAGAZYNIE')">Zwróć do magazynu</button>`);
    actions.push(`<button onclick="setWarpStatus(${warp.id}, 'ZUŻYTA')">Oznacz zużytą</button>`);
  }
  return actions.join(" ") || '<span class="empty-state">Brak</span>';
}

function setWarpStatus(warpId, status) {
  const warp = state.warps.find((item) => item.id === warpId);
  warp.status = status;
  warp.loomId = status === "W MAGAZYNIE" ? null : warp.loomId;
  warp.timeline.push(status);
  renderAll();
}

function useWarpFromTable(warpId) {
  const warp = state.warps.find((item) => item.id === warpId);
  const loomChoice = prompt(`Podaj numer krosna dla ${warp.number}:\n${state.looms.map((loom) => loom.number).join(", ")}`);
  if (!loomChoice) return;
  const loom = state.looms.find((item) => item.number === loomChoice.trim());
  if (!loom) return alert("Nie znaleziono krosna.");
  if (warp.status !== "PRZYGOTOWANA") return alert("Tylko osnowa PRZYGOTOWANA może być założona na krosno.");
  loom.activeWarpId = warp.id;
  warp.status = "NA KROŚNIE";
  warp.loomId = loom.id;
  addHistoryEntry(loom, "NA KROŚNIE", warp.number);
  renderAll();
}

function moveToThreading(warpId) {
  const warp = state.warps.find((item) => item.id === warpId);
  warp.status = "W KOLEJCE";
  warp.timeline.push("Przeniesiona na przewlekalnię");
  state.departments.Przewlekalnia.push({
    id: Date.now(),
    title: `${warp.number} przygotowanie`,
    status: "W KOLEJCE",
    linkedWarpId: warp.id
  });
  renderAll();
}

function renderWarps() {
  const root = $("#osnowy");
  const query = (root.querySelector("#warp-search")?.value || "").toLowerCase();
  const safeQuery = escapeHtml(query);
  const status = root.querySelector("#warp-status-filter")?.value || "ALL";
  const sort = root.querySelector("#warp-sort")?.value || "number";
  const historyQuery = root.querySelector("#history-search")?.value || "";
  const safeHistoryQuery = escapeHtml(historyQuery);

  const filtered = state.warps
    .filter((warp) => {
      const match = [warp.number, warp.name, warp.rollerType, warp.status].join(" ").toLowerCase().includes(query);
      return match && (status === "ALL" || warp.status === status);
    })
    .sort((a, b) =>
      sort === "meters" ? a.meters - b.meters : String(a[sort]).localeCompare(String(b[sort]), "pl")
    );

  const history = state.globalWarpHistory.filter((entry) =>
    [entry.warpNumber, entry.action, entry.loomNumber, entry.when].join(" ").toLowerCase().includes(historyQuery.toLowerCase())
  );

  root.innerHTML = `
    <div class="screen-stack">
      <article class="table-card">
        <div class="table-toolbar">
          <div class="panel-title">
            <h3>Osnowy</h3>
            <p>Wspólny widok stanów magazynowych, przygotowania i przypisań do krosien.</p>
          </div>
          <div class="controls">
            <input id="warp-search" placeholder="Szukaj osnowy" value="${safeQuery}" />
            <select id="warp-status-filter">
              <option value="ALL">Wszystkie statusy</option>
              ${["W MAGAZYNIE", "W KOLEJCE", "W PRZYGOTOWANIU", "PRZYGOTOWANA", "NA KROŚNIE", "ZDJĘTA Z KROSNA", "ZUŻYTA"]
                .map((item) => `<option value="${item}" ${status === item ? "selected" : ""}>${item}</option>`)
                .join("")}
            </select>
            <select id="warp-sort">
              <option value="number" ${sort === "number" ? "selected" : ""}>Sortuj: numer</option>
              <option value="name" ${sort === "name" ? "selected" : ""}>Sortuj: nazwa</option>
              <option value="meters" ${sort === "meters" ? "selected" : ""}>Sortuj: metry</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Numer</th><th>Nazwa</th><th>Wałek</th><th>Metry</th><th>Status</th><th>Krosno</th><th>Akcje</th></tr></thead>
            <tbody>
              ${filtered
                .map((warp) => {
                  const loom = state.looms.find((item) => item.id === warp.loomId);
                  return `
                    <tr>
                      <td><strong>${escapeHtml(warp.number)}</strong></td>
                      <td>${escapeHtml(warp.name)}</td>
                      <td>${escapeHtml(warp.rollerType)}</td>
                      <td>${warp.meters}</td>
                      <td>${statusBadge(warp.status)}</td>
                      <td>${loom ? escapeHtml(loom.number) : "-"}</td>
                      <td>${warpActionButtons(warp)}</td>
                    </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </article>

      <article class="table-card">
        <div class="table-toolbar">
          <div class="panel-title">
            <h3>Historia osnów</h3>
            <p>Wyszukiwanie po numerze, akcji, krośnie i dacie.</p>
          </div>
          <div class="controls">
            <input id="history-search" placeholder="Szukaj historii osnów" value="${safeHistoryQuery}" />
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>Osnowa</th><th>Akcja</th><th>Krosno</th></tr></thead>
            <tbody>
              ${history
                .map(
                  (entry) => `
                    <tr>
                      <td>${escapeHtml(entry.when)}</td>
                      <td>${escapeHtml(entry.warpNumber)}</td>
                      <td>${escapeHtml(entry.action)}</td>
                      <td>${escapeHtml(entry.loomNumber || "-")}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
    </div>`;

  root.querySelector("#warp-search").oninput = renderWarps;
  root.querySelector("#warp-status-filter").onchange = renderWarps;
  root.querySelector("#warp-sort").onchange = renderWarps;
  root.querySelector("#history-search").oninput = renderWarps;
}

function renderDepartment(screenId, key, showInstall = false) {
  const root = document.getElementById(screenId);
  const jobs = state.departments[key];
  const finished = state.departmentHistory[key];

  root.innerHTML = `
    <div class="screen-stack">
      <article class="table-card">
        <div class="table-toolbar">
          <div class="panel-title">
            <h3>${escapeHtml(key)}</h3>
            <p>Demonstracyjny widok zadań bieżących oraz prostych przejść statusów.</p>
          </div>
          <div class="controls">
            <button class="primary" onclick="addDepartmentJob('${key}')">Dodaj zlecenie</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Zlecenie</th><th>Status</th><th>Akcje</th></tr></thead>
            <tbody>
              ${jobs
                .map((job) => {
                  const threading = key === "Przewlekalnia";
                  const nextStatus = threading
                    ? job.status === "W KOLEJCE"
                      ? "W PRZYGOTOWANIU"
                      : job.status === "W PRZYGOTOWANIU"
                        ? "PRZYGOTOWANA"
                        : ""
                    : job.status === "W KOLEJCE"
                      ? "W TRAKCIE"
                      : "UKOŃCZONE";
                  const linkedWarp = job.linkedWarpId ? state.warps.find((warp) => warp.id === job.linkedWarpId) : null;
                  const installButton =
                    showInstall && job.linkedWarpId && linkedWarp?.status === "PRZYGOTOWANA"
                      ? `<button onclick="installPreparedFromThreading(${job.linkedWarpId})">Załóż na krosno</button>`
                      : "";
                  const nextButton = nextStatus
                    ? `<button onclick="updateDepartmentStatus('${key}', ${job.id}, '${nextStatus}')">${nextStatus}</button>`
                    : "";
                  return `
                    <tr>
                      <td>${escapeHtml(job.title)}</td>
                      <td>${statusBadge(job.status)}</td>
                      <td>${nextButton}${installButton}</td>
                    </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </article>

      <article class="table-card">
        <div class="panel-title">
          <h3>Historia ukończonych</h3>
          <p>Lista zakończonych pozycji dla działu ${escapeHtml(key)}.</p>
        </div>
        <div class="table-wrap" style="margin-top:0.9rem;">
          <table>
            <thead><tr><th>Zlecenie</th><th>Status</th></tr></thead>
            <tbody>
              ${finished
                .map((job) => `<tr><td>${escapeHtml(job.title)}</td><td>${statusBadge(job.status)}</td></tr>`)
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
    </div>`;
}

function addDepartmentJob(key) {
  const title = prompt(`Podaj nazwę nowego zlecenia dla ${key}:`);
  if (!title) return;
  state.departments[key].unshift({ id: Date.now(), title, status: "W KOLEJCE" });
  renderAll();
}

function updateDepartmentStatus(key, jobId, status) {
  const list = state.departments[key];
  const job = list.find((item) => item.id === jobId);
  if (!job) return;
  job.status = status;

  if (key === "Przewlekalnia" && job.linkedWarpId) {
    const warp = state.warps.find((item) => item.id === job.linkedWarpId);
    if (warp) warp.status = status;
  }

  if (status === "UKOŃCZONE") {
    state.departmentHistory[key].unshift({ ...job });
    state.departments[key] = list.filter((item) => item.id !== jobId);

    if (["Klejarnia", "Snowalnia"].includes(key)) {
      const newId = Math.max(...state.warps.map((warp) => warp.id)) + 1;
      const newWarpNumber = `OS-${String(newId).padStart(4, "0")}`;
      state.warps.unshift({
        id: newId,
        number: newWarpNumber,
        name: `Nowa osnowa ${key} ${newWarpNumber}`,
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
        when: new Date().toISOString().slice(0, 10)
      });
    }
  }

  renderAll();
}

function installPreparedFromThreading(warpId) {
  const warp = state.warps.find((item) => item.id === warpId);
  if (!warp || warp.status !== "PRZYGOTOWANA") return alert("Tylko osnowa PRZYGOTOWANA może być założona na krosno.");
  useWarpFromTable(warpId);
  const job = state.departments.Przewlekalnia.find((item) => item.linkedWarpId === warpId);
  if (job) {
    state.departmentHistory.Przewlekalnia.unshift({ ...job, status: "UKOŃCZONE" });
    state.departments.Przewlekalnia = state.departments.Przewlekalnia.filter((item) => item.id !== job.id);
  }
  renderAll();
}

function renderEmployees() {
  const root = $("#pracownicy");
  const query = (root.querySelector("#emp-search")?.value || "").toLowerCase();
  const safeQuery = escapeHtml(query);
  const shift = root.querySelector("#emp-shift")?.value || "ALL";
  const attendance = root.querySelector("#emp-attendance")?.value || "ALL";

  const list = state.employees.filter((employee) => {
    const match = [employee.name, employee.branch, employee.attendance].join(" ").toLowerCase().includes(query);
    return match && (shift === "ALL" || String(employee.shift) === shift) && (attendance === "ALL" || employee.attendance === attendance);
  });

  root.innerHTML = `
    <div class="screen-stack">
      <article class="table-card">
        <div class="table-toolbar">
          <div class="panel-title">
            <h3>Pracownicy</h3>
            <p>Filtr po nazwie, zmianie i obecności z podglądem karty wybranej osoby.</p>
          </div>
          <div class="controls">
            <input id="emp-search" placeholder="Szukaj pracownika" value="${safeQuery}" />
            <select id="emp-shift">
              <option value="ALL">Zmiana: wszystkie</option>
              <option value="1" ${shift === "1" ? "selected" : ""}>1</option>
              <option value="2" ${shift === "2" ? "selected" : ""}>2</option>
            </select>
            <select id="emp-attendance">
              <option value="ALL">Obecność: wszystkie</option>
              ${["OBECNY", "CHORY", "URLOP", "NIEOBECNY"]
                .map((item) => `<option value="${item}" ${attendance === item ? "selected" : ""}>${item}</option>`)
                .join("")}
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Imię i nazwisko</th><th>Zmiana</th><th>Oddział</th><th>Obecność</th></tr></thead>
            <tbody>
              ${list
                .map(
                  (employee) => `
                    <tr class="clickable-row" data-emp-id="${employee.id}">
                      <td>${escapeHtml(employee.name)}</td>
                      <td>${employee.shift}</td>
                      <td>${escapeHtml(employee.branch)}</td>
                      <td>${badge(employee.attendance, `badge-${statusSlug(employee.attendance)}`)}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
      <div id="employee-card"></div>
    </div>`;

  root.querySelector("#emp-search").oninput = renderEmployees;
  root.querySelector("#emp-shift").onchange = renderEmployees;
  root.querySelector("#emp-attendance").onchange = renderEmployees;

  root.querySelectorAll("tbody tr").forEach((row) => {
    row.onclick = () => {
      const employee = state.employees.find((item) => item.id === Number(row.dataset.empId));
      $("#employee-card").innerHTML = `
        <article class="panel">
          <div class="panel-title">
            <h3>${escapeHtml(employee.name)}</h3>
            <p>Zmiana ${employee.shift} · ${escapeHtml(employee.branch)} · ${badge(employee.attendance, `badge-${statusSlug(employee.attendance)}`)}</p>
          </div>
          <div class="detail-grid" style="margin-top:0.9rem;">
            ${detailStat("Dni łącznie", employee.stats.totalDays)}
            ${detailStat("Na oddziale", employee.stats.branchDays)}
            ${detailStat("Dni chorobowe", employee.stats.sick)}
            ${detailStat("Urlop", employee.stats.vacation)}
          </div>
          <article class="detail-panel" style="margin-top:1rem;">
            <h4>Historia</h4>
            <ul>${employee.history.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
          </article>
        </article>`;
    };
  });
}

function renderAll() {
  renderDashboard();
  renderPlan();
  renderLoomsTable();
  renderWarps();
  renderDepartment("przewlekalnia", "Przewlekalnia", true);
  renderDepartment("klejarnia", "Klejarnia");
  renderDepartment("snowalnia", "Snowalnia");
  renderEmployees();
}

function setupPwa() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
}

function setupUi() {
  $("#close-drawer").onclick = closeDrawer;
  $("#drawer-backdrop").onclick = closeDrawer;
  $("#mobile-menu-btn").onclick = () => $("#sidebar").classList.toggle("open");
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
      $("#sidebar").classList.remove("open");
    }
  });
}

state.hallLayout = loadHallLayout();

setupUi();
renderNav();
updateTopbar();
renderAll();
setupPwa();

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
