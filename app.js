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

const modelColors = {
  "Model A": "#93c5fd",
  "Model B": "#fecaca",
  "Model C": "#bbf7d0",
  "Model D": "#fde68a"
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
  loomWarpHistory: [
    { loomNumber: "K-02", warpNumber: "OS-0005", status: "ZUŻYTA", when: "2026-06-28" }
  ],
  globalWarpHistory: [
    { warpNumber: "OS-0005", action: "ZUŻYTA", loomNumber: "K-02", when: "2026-06-28" }
  ],
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
  selectedLoomId: null
};

const $ = (s) => document.querySelector(s);
const el = (tag, html = "") => {
  const node = document.createElement(tag);
  node.innerHTML = html;
  return node;
};
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

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
    bottom.appendChild(button.cloneNode(true));
    bottom.lastChild.onclick = button.onclick;
    bottom.lastChild.className = button.className;
  });
}

function switchScreen(id) {
  state.activeScreen = id;
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  const title = screens.find((s) => s.id === id)?.label || "Technotex";
  $("#screen-title").textContent = title;
  renderNav();
  renderAll();
  $("#sidebar").classList.remove("open");
}

function statusCount(status) {
  return state.looms.filter((l) => l.status === status).length;
}

function renderDashboard() {
  const openOrders = ["Przewlekalnia", "Klejarnia", "Snowalnia"]
    .flatMap((key) => state.departments[key])
    .filter((job) => job.status !== "UKOŃCZONE").length;

  const html = `
    <div class="grid">
      <article class="card"><h4>Krosna PRACUJE</h4><div>${statusCount("PRACUJE")}</div></article>
      <article class="card"><h4>Krosna ZATRZYMANE</h4><div>${statusCount("ZATRZYMANE")}</div></article>
      <article class="card"><h4>Krosna AWARIA</h4><div>${statusCount("AWARIA")}</div></article>
      <article class="card"><h4>Osnowy W MAGAZYNIE</h4><div>${state.warps.filter((w) => w.status === "W MAGAZYNIE").length}</div></article>
      <article class="card"><h4>Otwarte zlecenia</h4><div>${openOrders}</div></article>
      <article class="card"><h4>Pracownicy OBECNI</h4><div>${state.employees.filter((e) => e.attendance === "OBECNY").length}</div></article>
    </div>`;
  $("#dashboard").innerHTML = html;
}

function renderPlan() {
  const container = $("#plan-hali");
  const blocks = state.looms
    .map(
      (loom) => `
      <button class="loom" style="background:${modelColors[loom.model] || "#dbeafe"}" data-loom-id="${loom.id}">
        <span class="status-dot status-${loom.status.replaceAll(" ", "-")}"></span>
        <div>${loom.number}</div>
        <small>${loom.type}</small>
        <div>${loom.article}</div>
      </button>`
    )
    .join("");

  container.innerHTML = `<p>Kolor bloczka zależy od modelu krosna, dioda od statusu pracy.</p><div class="plan-grid">${blocks}</div>`;
  container.querySelectorAll("[data-loom-id]").forEach((button) => {
    button.onclick = () => openLoomDrawer(Number(button.dataset.loomId));
  });
}

function loomDetailsHtml(loom) {
  const activeWarp = state.warps.find((w) => w.id === loom.activeWarpId);
  const loomHistory = state.loomWarpHistory.filter((h) => h.loomNumber === loom.number);

  return `
    <div class="card">
      <strong>${loom.number} — ${loom.name}</strong>
      <p>Typ: ${loom.type}</p>
      <p>Model/Rodzaj: ${loom.model}</p>
      <p>Status: <span class="badge">${loom.status}</span></p>
      <p>Artykuł: ${loom.article}</p>
      <p>Aktywna osnowa: ${activeWarp ? activeWarp.number : "Brak"}</p>
      <p>Kolejka: ${loom.queue.join(", ") || "Brak"}</p>
      <p>Notatki: ${loom.notes || "-"}</p>
      <div class="controls">
        <button class="primary" onclick="mountPreparedWarp(${loom.id})">Użyj / Wybierz osnowę</button>
        <button onclick="removeWarp(${loom.id})">Zdejmij osnowę</button>
        <button onclick="returnWarpToStore(${loom.id})">Zwróć do magazynu</button>
      </div>
      <h4>Historia osnów</h4>
      <input id="loom-history-search" placeholder="Szukaj w historii osnów" oninput="renderLoomHistory(${loom.id}, this.value)" />
      <div id="loom-history-list">${historyList(loomHistory)}</div>
      <h4>Historia zmian</h4>
      <ul>${loom.history.map((item) => `<li>${item}</li>`).join("") || "<li>Brak</li>"}</ul>
    </div>`;
}

function historyList(items) {
  if (!items.length) return "<p>Brak wpisów.</p>";
  return `<ul>${items
    .map((h) => `<li>${h.when} — ${h.warpNumber} (${h.status})</li>`)
    .join("")}</ul>`;
}

function renderLoomHistory(loomId, query = "") {
  const loom = state.looms.find((l) => l.id === loomId);
  const filtered = state.loomWarpHistory.filter(
    (h) =>
      h.loomNumber === loom.number &&
      [h.warpNumber, h.status, h.when].join(" ").toLowerCase().includes(query.toLowerCase())
  );
  $("#loom-history-list").innerHTML = historyList(filtered);
}

function openLoomDrawer(loomId) {
  state.selectedLoomId = loomId;
  const loom = state.looms.find((l) => l.id === loomId);
  $("#drawer-content").innerHTML = loomDetailsHtml(loom);
  $("#loom-drawer").classList.remove("hidden");
  $("#loom-drawer").setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  $("#loom-drawer").classList.add("hidden");
  $("#loom-drawer").setAttribute("aria-hidden", "true");
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
  const loom = state.looms.find((l) => l.id === loomId);
  const readyWarps = state.warps.filter((w) => w.status === "PRZYGOTOWANA");
  if (!readyWarps.length) return alert("Brak osnów gotowych do założenia.");

  const choice = prompt(
    `Wpisz numer osnowy do założenia na ${loom.number}:\n${readyWarps
      .map((w) => `${w.number} (${w.status})`)
      .join("\n")}`
  );
  if (!choice) return;
  const warp = readyWarps.find((w) => w.number === choice.trim());
  if (!warp) return alert("Nie znaleziono osnowy.");

  if (warp.status !== "PRZYGOTOWANA") {
    return alert("Na krosno można założyć tylko osnowę PRZYGOTOWANA.");
  }

  if (loom.activeWarpId) {
    const prevWarp = state.warps.find((w) => w.id === loom.activeWarpId);
    if (prevWarp) {
      prevWarp.status = "ZDJĘTA Z KROSNA";
      prevWarp.loomId = null;
      prevWarp.timeline.push(`Zdjęta z ${loom.number}`);
      addHistoryEntry(loom, "ZDJĘTA Z KROSNA", prevWarp.number);
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
  const loom = state.looms.find((l) => l.id === loomId);
  if (!loom.activeWarpId) return alert("To krosno nie ma aktywnej osnowy.");
  const warp = state.warps.find((w) => w.id === loom.activeWarpId);
  loom.activeWarpId = null;
  warp.status = "ZDJĘTA Z KROSNA";
  warp.loomId = null;
  warp.timeline.push(`Zdjęta z ${loom.number}`);
  addHistoryEntry(loom, "ZDJĘTA Z KROSNA", warp.number);
  renderAll();
  openLoomDrawer(loomId);
}

function returnWarpToStore(loomId) {
  const loom = state.looms.find((l) => l.id === loomId);
  if (!loom.activeWarpId) return alert("Brak osnowy do zwrotu.");
  const warp = state.warps.find((w) => w.id === loom.activeWarpId);
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
  const filtered = state.looms.filter((l) => {
    const inQuery = [l.number, l.type, l.model, l.status, l.article].join(" ").toLowerCase().includes(query);
    return inQuery && (status === "ALL" || status === l.status);
  });

  root.innerHTML = `
    <div class="controls">
      <input id="loom-search" placeholder="Szukaj krosna" value="${safeQuery}" />
      <select id="loom-status-filter">
        <option value="ALL">Wszystkie statusy</option>
        ${["PRACUJE", "ZATRZYMANE", "AWARIA", "ZMIANA OSNOWY", "ZMIANA ARTYKUŁU", "ROZEBRANE"]
          .map((s) => `<option value="${s}" ${status === s ? "selected" : ""}>${s}</option>`)
          .join("")}
      </select>
    </div>
    <table>
      <thead><tr><th>Numer</th><th>Typ</th><th>Model</th><th>Status</th><th>Artykuł</th><th>Aktywna osnowa</th></tr></thead>
      <tbody>
      ${filtered
        .map((l) => {
          const warp = state.warps.find((w) => w.id === l.activeWarpId);
          return `<tr data-loom-id="${l.id}"><td>${l.number}</td><td>${l.type}</td><td>${l.model}</td><td>${l.status}</td><td>${l.article}</td><td>${warp?.number || "-"}</td></tr>`;
        })
        .join("")}
      </tbody>
    </table>`;

  root.querySelector("#loom-search").oninput = renderLoomsTable;
  root.querySelector("#loom-status-filter").onchange = renderLoomsTable;
  root.querySelectorAll("tbody tr").forEach((row) => (row.onclick = () => openLoomDrawer(Number(row.dataset.loomId))));
}

function warpActionButtons(warp) {
  const actions = [];
  if (warp.status === "W MAGAZYNIE") {
    actions.push(`<button onclick="moveToThreading(${warp.id})">Przenieś na przewlekalnię</button>`);
  }
  if (warp.status === "PRZYGOTOWANA") {
    actions.push(`<button onclick="useWarpFromTable(${warp.id})">Użyj osnowę</button>`);
  }
  if (warp.status === "ZDJĘTA Z KROSNA") {
    actions.push(`<button onclick="setWarpStatus(${warp.id}, 'W MAGAZYNIE')">Zwróć do magazynu</button>`);
    actions.push(`<button onclick="setWarpStatus(${warp.id}, 'ZUŻYTA')">Oznacz zużytą</button>`);
  }
  return actions.join(" ") || "-";
}

function setWarpStatus(warpId, status) {
  const warp = state.warps.find((w) => w.id === warpId);
  warp.status = status;
  warp.loomId = status === "W MAGAZYNIE" ? null : warp.loomId;
  warp.timeline.push(status);
  renderAll();
}

function useWarpFromTable(warpId) {
  const warp = state.warps.find((w) => w.id === warpId);
  const loomChoice = prompt(`Podaj numer krosna dla ${warp.number}:\n${state.looms.map((l) => l.number).join(", ")}`);
  if (!loomChoice) return;
  const loom = state.looms.find((l) => l.number === loomChoice.trim());
  if (!loom) return alert("Nie znaleziono krosna.");
  if (warp.status !== "PRZYGOTOWANA") return alert("Tylko osnowa PRZYGOTOWANA może być założona na krosno.");
  loom.activeWarpId = warp.id;
  warp.status = "NA KROŚNIE";
  warp.loomId = loom.id;
  addHistoryEntry(loom, "NA KROŚNIE", warp.number);
  renderAll();
}

function moveToThreading(warpId) {
  const warp = state.warps.find((w) => w.id === warpId);
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

  let filtered = state.warps.filter((w) => {
    const match = [w.number, w.name, w.rollerType, w.status].join(" ").toLowerCase().includes(query);
    return match && (status === "ALL" || w.status === status);
  });

  filtered.sort((a, b) =>
    sort === "meters" ? a.meters - b.meters : String(a[sort]).localeCompare(String(b[sort]), "pl")
  );

  const history = state.globalWarpHistory.filter((h) =>
    [h.warpNumber, h.action, h.loomNumber, h.when].join(" ").toLowerCase().includes(historyQuery.toLowerCase())
  );

  root.innerHTML = `
    <div class="controls">
      <input id="warp-search" placeholder="Szukaj osnowy" value="${safeQuery}" />
      <select id="warp-status-filter">
        <option value="ALL">Wszystkie statusy</option>
        ${["W MAGAZYNIE", "W KOLEJCE", "W PRZYGOTOWANIU", "PRZYGOTOWANA", "NA KROŚNIE", "ZDJĘTA Z KROSNA", "ZUŻYTA"]
          .map((s) => `<option value="${s}" ${status === s ? "selected" : ""}>${s}</option>`)
          .join("")}
      </select>
      <select id="warp-sort">
        <option value="number" ${sort === "number" ? "selected" : ""}>Sortuj: numer</option>
        <option value="name" ${sort === "name" ? "selected" : ""}>Sortuj: nazwa</option>
        <option value="meters" ${sort === "meters" ? "selected" : ""}>Sortuj: metry</option>
      </select>
    </div>
    <table>
      <thead><tr><th>Numer osnowy</th><th>Nazwa</th><th>Wałek</th><th>Metry</th><th>Status</th><th>Krosno</th><th>Akcje</th></tr></thead>
      <tbody>
        ${filtered
          .map((w) => {
            const loom = state.looms.find((l) => l.id === w.loomId);
            return `<tr><td>${w.number}</td><td>${w.name}</td><td>${w.rollerType}</td><td>${w.meters}</td><td>${w.status}</td><td>${loom?.number || "-"}</td><td>${warpActionButtons(w)}</td></tr>`;
          })
          .join("")}
      </tbody>
    </table>
    <h3>Historia osnów</h3>
    <div class="controls"><input id="history-search" placeholder="Szukaj historii osnów" value="${safeHistoryQuery}" /></div>
    <table>
      <thead><tr><th>Data</th><th>Osnowa</th><th>Akcja</th><th>Krosno</th></tr></thead>
      <tbody>
        ${history.map((h) => `<tr><td>${h.when}</td><td>${h.warpNumber}</td><td>${h.action}</td><td>${h.loomNumber || "-"}</td></tr>`).join("")}
      </tbody>
    </table>`;

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
    <div class="controls">
      <button class="primary" onclick="addDepartmentJob('${key}')">Dodaj zlecenie</button>
    </div>
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
            const linkedWarp = job.linkedWarpId ? state.warps.find((w) => w.id === job.linkedWarpId) : null;
            const installBtn =
              showInstall && job.linkedWarpId && linkedWarp?.status === "PRZYGOTOWANA"
                ? `<button onclick="installPreparedFromThreading(${job.linkedWarpId})">Załóż na krosno</button>`
                : "";
            const nextBtn = nextStatus
              ? `<button onclick="updateDepartmentStatus('${key}', ${job.id}, '${nextStatus}')">${nextStatus}</button>`
              : "";
            return `<tr><td>${escapeHtml(job.title)}</td><td>${escapeHtml(job.status)}</td><td>${nextBtn}${installBtn}</td></tr>`;
          })
          .join("")}
      </tbody>
    </table>
    <h3>Historia ukończonych</h3>
    <table>
      <thead><tr><th>Zlecenie</th><th>Status</th></tr></thead>
      <tbody>${finished.map((job) => `<tr><td>${escapeHtml(job.title)}</td><td>${escapeHtml(job.status)}</td></tr>`).join("")}</tbody>
    </table>`;
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
    const warp = state.warps.find((w) => w.id === job.linkedWarpId);
    if (warp) warp.status = status;
  }

  if (status === "UKOŃCZONE") {
    state.departmentHistory[key].unshift({ ...job });
    state.departments[key] = list.filter((item) => item.id !== jobId);

    if (["Klejarnia", "Snowalnia"].includes(key)) {
      const newId = Math.max(...state.warps.map((w) => w.id)) + 1;
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
      state.globalWarpHistory.unshift({ warpNumber: newWarpNumber, action: "W MAGAZYNIE", loomNumber: "-", when: new Date().toISOString().slice(0, 10) });
    }
  }

  renderAll();
}

function installPreparedFromThreading(warpId) {
  const warp = state.warps.find((w) => w.id === warpId);
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
  const q = (root.querySelector("#emp-search")?.value || "").toLowerCase();
  const safeQ = escapeHtml(q);
  const shift = root.querySelector("#emp-shift")?.value || "ALL";
  const attendance = root.querySelector("#emp-attendance")?.value || "ALL";

  const list = state.employees.filter((e) => {
    const match = [e.name, e.branch, e.attendance].join(" ").toLowerCase().includes(q);
    return match && (shift === "ALL" || String(e.shift) === shift) && (attendance === "ALL" || e.attendance === attendance);
  });

  root.innerHTML = `
    <div class="controls">
      <input id="emp-search" placeholder="Szukaj pracownika" value="${safeQ}" />
      <select id="emp-shift"><option value="ALL">Zmiana: wszystkie</option><option value="1" ${shift === "1" ? "selected" : ""}>1</option><option value="2" ${shift === "2" ? "selected" : ""}>2</option></select>
      <select id="emp-attendance">
        <option value="ALL">Obecność: wszystkie</option>
        ${["OBECNY", "CHORY", "URLOP", "NIEOBECNY"].map((s) => `<option ${attendance === s ? "selected" : ""}>${s}</option>`).join("")}
      </select>
    </div>
    <table>
      <thead><tr><th>Imię i nazwisko</th><th>Zmiana</th><th>Oddział</th><th>Obecność</th></tr></thead>
      <tbody>${list.map((e) => `<tr data-emp-id="${e.id}"><td>${e.name}</td><td>${e.shift}</td><td>${e.branch}</td><td>${e.attendance}</td></tr>`).join("")}</tbody>
    </table>
    <div id="employee-card"></div>`;

  root.querySelector("#emp-search").oninput = renderEmployees;
  root.querySelector("#emp-shift").onchange = renderEmployees;
  root.querySelector("#emp-attendance").onchange = renderEmployees;
  root.querySelectorAll("tbody tr").forEach((row) => {
    row.onclick = () => {
      const employee = state.employees.find((e) => e.id === Number(row.dataset.empId));
      $("#employee-card").innerHTML = `
        <article class="card" style="margin-top:0.75rem;">
          <h4>${employee.name}</h4>
          <p>Dni przepracowane łącznie: ${employee.stats.totalDays}</p>
          <p>Dni przepracowane na oddziale: ${employee.stats.branchDays}</p>
          <p>Dni chorobowe: ${employee.stats.sick}</p>
          <p>Urlop: ${employee.stats.vacation}</p>
          <p>Nieobecności: ${employee.stats.absent}</p>
          <h4>Historia</h4>
          <ul>${employee.history.map((h) => `<li>${h}</li>`).join("")}</ul>
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

$("#close-drawer").onclick = closeDrawer;
$("#mobile-menu-btn").onclick = () => $("#sidebar").classList.toggle("open");

renderNav();
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
