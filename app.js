const STORAGE_KEY = "technotex-production-prototype-v1";

const PRIORITY_OPTIONS = ["Niski", "Standard", "Wysoki", "Krytyczny"];
const FABRIC_SETUP_OPTIONS = ["Tak", "Nie"];
const WARPING_OPTIONS = ["taśmowe", "zespołowe"];
const LOOM_COLORS = ["#3653f8", "#16a34a", "#f97316", "#8b5cf6", "#ef4444", "#06b6d4", "#eab308", "#64748b", "#ec4899"];

function createInitialState() {
  return {
    currentView: "dashboard",
    selectedArticleId: "art-1",
    selectedOrderId: "ord-1",
    selectedWorkerId: "wrk-1",
    selectedLoomId: "loom-1",
    selectedLoomTypeId: "type-1",
    loomTypes: [
      { id: "type-1", name: "Sulzer", color: "#3653f8" },
      { id: "type-2", name: "Picanol", color: "#16a34a" },
      { id: "type-3", name: "Toyota AirJet", color: "#f97316" }
    ],
    looms: [
      { id: "loom-1", name: "Krosno A-12", width: 220, loomTypeId: "type-1", status: "Pracuje" },
      { id: "loom-2", name: "Krosno B-07", width: 180, loomTypeId: "type-2", status: "Przezbrojenie" },
      { id: "loom-3", name: "Krosno C-03", width: 260, loomTypeId: "type-3", status: "Pracuje" }
    ],
    articles: [
      {
        id: "art-1",
        name: "TK-401",
        watkiCm: 34,
        fabricWidth: 165,
        rozpinka: "Tak",
        rodzajSnucia: "taśmowe",
        uwagi: "Artykuł eksportowy, kontrola końcowa 100%."
      },
      {
        id: "art-2",
        name: "TK-402",
        watkiCm: 28,
        fabricWidth: 145,
        rozpinka: "Nie",
        rodzajSnucia: "zespołowe",
        uwagi: "Dodatkowa próbka kolorystyczna dla klienta."
      },
      {
        id: "art-3",
        name: "TK-403",
        watkiCm: 31,
        fabricWidth: 190,
        rozpinka: "Tak",
        rodzajSnucia: "taśmowe",
        uwagi: "Stabilizacja po pierwszej partii."
      }
    ],
    productionOrders: [
      {
        id: "ord-1",
        number: "ZP/07/001",
        articleId: "art-1",
        quantity: 3200,
        dueDate: "2026-07-12",
        priority: "Wysoki",
        status: "Nowe",
        uwagi: "Priorytet dla uruchomienia klienta premium.",
        forwardedTo: null
      },
      {
        id: "ord-2",
        number: "ZP/07/002",
        articleId: "art-2",
        quantity: 1800,
        dueDate: "2026-07-16",
        priority: "Standard",
        status: "Nowe",
        uwagi: "Do potwierdzenia partia próbna.",
        forwardedTo: null
      },
      {
        id: "ord-3",
        number: "ZP/07/003",
        articleId: "art-3",
        quantity: 4200,
        dueDate: "2026-07-09",
        priority: "Krytyczny",
        status: "Przygotowanie",
        uwagi: "Wymagana synchronizacja z planem tkalni.",
        forwardedTo: "Snowalnia"
      }
    ],
    workers: [
      {
        id: "wrk-1",
        name: "Anna Kurek",
        role: "Tkaczka",
        shift: "I zmiana",
        experience: "8 lat",
        stats: {
          efficiency: "96%",
          quality: "99,1%",
          output: "1 240 m / tydz.",
          downtime: "38 min / tydz."
        },
        recentActivity: [
          "3 przezbrojenia bez przestoju krytycznego",
          "0 reklamacji w ostatnich 30 dniach",
          "Najlepszy wynik wydajności na hali A"
        ]
      },
      {
        id: "wrk-2",
        name: "Piotr Nowak",
        role: "Operator snowalni",
        shift: "II zmiana",
        experience: "5 lat",
        stats: {
          efficiency: "91%",
          quality: "98,4%",
          output: "18 belek / tydz.",
          downtime: "54 min / tydz."
        },
        recentActivity: [
          "2 interwencje serwisowe zakończone w czasie < 20 min",
          "Stabilna realizacja zleceń taśmowych",
          "Podwyższona dyspozycyjność w weekend"
        ]
      },
      {
        id: "wrk-3",
        name: "Karolina Lis",
        role: "Planistka produkcji",
        shift: "I zmiana",
        experience: "6 lat",
        stats: {
          efficiency: "94%",
          quality: "100%",
          output: "27 planów / tydz.",
          downtime: "12 min / tydz."
        },
        recentActivity: [
          "Bez kolizji terminów w ostatnich 14 dniach",
          "Skrócenie czasu reakcji na pilne zmiany klienta",
          "Aktualizacja harmonogramów w czasie rzeczywistym"
        ]
      }
    ]
  };
}

function loadState() {
  const fallback = createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch (error) {
    return fallback;
  }
}

const state = loadState();

function persistState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(updater) {
  updater();
  persistState();
  renderApp();
}

function getArticle(articleId) {
  return state.articles.find((article) => article.id === articleId);
}

function getLoomType(loomTypeId) {
  return state.loomTypes.find((loomType) => loomType.id === loomTypeId);
}

function forwardingTarget(article) {
  return article?.rodzajSnucia === "zespołowe" ? "Klejarnia" : "Snowalnia";
}

function getVisibleOrders() {
  return state.productionOrders.filter((order) => !order.forwardedTo);
}

function getForwardedOrders(target) {
  return state.productionOrders.filter((order) => order.forwardedTo === target);
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function routeClass(route) {
  return route === "Klejarnia" ? "route-klejarnia" : "route-snowalnia";
}

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function renderApp() {
  updateNavigation();
  const app = document.getElementById("app");
  app.innerHTML = `
    ${renderDashboard()}
    ${state.currentView === "orders" ? renderOrdersView() : ""}
    ${state.currentView === "articles" ? renderArticlesView() : ""}
    ${state.currentView === "workers" ? renderWorkersView() : ""}
    ${state.currentView === "weaving" ? renderWeavingView() : ""}
    ${state.currentView === "settings" ? renderSettingsView() : ""}
  `;
  bindViewControls();
}

function updateNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === state.currentView);
  });
}

function renderDashboard() {
  if (state.currentView !== "dashboard") {
    return "";
  }
  const visibleOrders = getVisibleOrders();
  const articlesWithTaśmowe = state.articles.filter((article) => article.rodzajSnucia === "taśmowe").length;
  return `
    <section class="hero">
      <div>
        <p class="eyebrow">Stan prototypu</p>
        <h2>Aktualny widok korekt produkcyjnych</h2>
        <p class="section-subtitle">Priorytety zleceń, poprawione artykuły, klikalne statystyki pracowników i konfiguracja typów krosien działają na danych mockowych bez backendu.</p>
      </div>
      <div class="hero-grid">
        <article class="stat-card">
          <span class="stat-label">Aktywne zlecenia</span>
          <span class="stat-value">${visibleOrders.length}</span>
        </article>
        <article class="stat-card">
          <span class="stat-label">Zlecenia w Snowalni</span>
          <span class="stat-value">${getForwardedOrders("Snowalnia").length}</span>
        </article>
        <article class="stat-card">
          <span class="stat-label">Zlecenia w Klejarni</span>
          <span class="stat-value">${getForwardedOrders("Klejarnia").length}</span>
        </article>
        <article class="stat-card">
          <span class="stat-label">Artykuły taśmowe</span>
          <span class="stat-value">${articlesWithTaśmowe}</span>
        </article>
      </div>
    </section>
  `;
}

function renderOrdersView() {
  const visibleOrders = getVisibleOrders();
  const selectedOrder = state.selectedOrderId === "new"
    ? null
    : visibleOrders.find((order) => order.id === state.selectedOrderId) || visibleOrders[0] || null;
  const selectedArticle = selectedOrder ? getArticle(selectedOrder.articleId) : getArticle(state.selectedArticleId);
  const route = forwardingTarget(selectedArticle);

  return `
    <section class="split-layout">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>Zlecenia produkcyjne</h2>
            <p class="section-subtitle">Na liście są widoczne wyłącznie zlecenia, które nie zostały jeszcze przekazane dalej.</p>
          </div>
          <button type="button" class="secondary-button" id="new-order-button">Nowe zlecenie</button>
        </div>
        <div class="list">
          ${visibleOrders.length ? visibleOrders.map((order) => renderOrderListItem(order, selectedOrder?.id)).join("") : `<div class="empty-state">Wszystkie zlecenia zostały już przekazane do kolejnych działów.</div>`}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>${selectedOrder ? `Edycja ${selectedOrder.number}` : "Nowe zlecenie"}</h2>
            <p class="section-subtitle">Priorytet jest niezależnym polem i pozostaje widoczny w liście oraz szczegółach.</p>
          </div>
        </div>
        ${renderOrderForm(selectedOrder, route)}
      </article>
    </section>

    <section class="queues-grid">
      <article class="panel queue-column">
        <div class="section-header">
          <h3>Snowalnia</h3>
          <span class="badge route-snowalnia">${getForwardedOrders("Snowalnia").length}</span>
        </div>
        <div class="queue-list">
          ${renderForwardedList("Snowalnia")}
        </div>
      </article>
      <article class="panel queue-column">
        <div class="section-header">
          <h3>Klejarnia</h3>
          <span class="badge route-klejarnia">${getForwardedOrders("Klejarnia").length}</span>
        </div>
        <div class="queue-list">
          ${renderForwardedList("Klejarnia")}
        </div>
      </article>
    </section>
  `;
}

function renderOrderListItem(order, selectedId) {
  const article = getArticle(order.articleId);
  const route = forwardingTarget(article);
  return `
    <button type="button" class="list-item ${order.id === selectedId ? "is-selected" : ""}" data-select-order="${order.id}">
      <div class="list-item-top">
        <strong>${order.number}</strong>
        <div class="badge-row">
          <span class="badge ${priorityClass(order.priority)}">${order.priority}</span>
          <span class="badge ${routeClass(route)}">${route}</span>
        </div>
      </div>
      <p><strong>Artykuł:</strong> ${article?.name || "—"}</p>
      <p><strong>Termin:</strong> ${order.dueDate}</p>
      <p><strong>Ilość:</strong> ${order.quantity} m</p>
      <p class="muted">${order.uwagi || "Brak uwag."}</p>
    </button>
  `;
}

function renderOrderForm(order, route) {
  const values = order || {
    number: "",
    articleId: state.articles[0]?.id || "",
    quantity: 1000,
    dueDate: "2026-07-20",
    priority: "Standard",
    status: "Nowe",
    uwagi: ""
  };
  const article = getArticle(values.articleId);
  const currentRoute = forwardingTarget(article) || route;
  return `
    <form id="order-form">
      <input type="hidden" name="orderId" value="${order?.id || ""}">
      <div class="form-grid">
        <label class="form-field">
          <span>Numer zlecenia</span>
          <input type="text" name="number" value="${values.number}" required>
        </label>
        <label class="form-field">
          <span>Artykuł</span>
          <select name="articleId">
            ${state.articles.map((articleOption) => `
              <option value="${articleOption.id}" ${articleOption.id === values.articleId ? "selected" : ""}>
                ${articleOption.name} · ${articleOption.rodzajSnucia}
              </option>
            `).join("")}
          </select>
        </label>
        <label class="form-field">
          <span>Ilość [m]</span>
          <input type="number" min="1" name="quantity" value="${values.quantity}" required>
        </label>
        <label class="form-field">
          <span>Termin</span>
          <input type="date" name="dueDate" value="${values.dueDate}" required>
        </label>
        <label class="form-field">
          <span>Priorytet</span>
          <select name="priority">
            ${PRIORITY_OPTIONS.map((priority) => `<option value="${priority}" ${priority === values.priority ? "selected" : ""}>${priority}</option>`).join("")}
          </select>
        </label>
        <label class="form-field">
          <span>Status</span>
          <select name="status">
            ${["Nowe", "Przygotowanie"].map((status) => `<option value="${status}" ${status === values.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <div class="meta-card">
          <span class="stat-label">Kierunek przekazania</span>
          <strong data-order-route>${currentRoute}</strong>
          <p class="muted">Wynika z rodzaju snucia artykułu: <strong data-order-warping>${article?.rodzajSnucia || "—"}</strong>.</p>
        </div>
        <div class="meta-card">
          <span class="stat-label">Rozpinka</span>
          <strong data-order-rozpinka>${article?.rozpinka || "—"}</strong>
          <p class="muted">Pole w artykule pozostaje wyłącznie wartością Tak/Nie.</p>
        </div>
        <label class="form-field full-width">
          <span>Uwagi</span>
          <textarea name="uwagi">${values.uwagi}</textarea>
        </label>
      </div>
      <div class="form-actions">
        ${order ? `<button type="button" class="ghost-button" id="forward-order-button">Przekaż do ${currentRoute}</button>` : ""}
        <button type="submit" class="primary-button">Zapisz zlecenie</button>
      </div>
    </form>
  `;
}

function renderForwardedList(target) {
  const orders = getForwardedOrders(target);
  if (!orders.length) {
    return `<div class="empty-state">Brak zleceń przekazanych do ${target.toLowerCase()}.</div>`;
  }
  return orders.map((order) => {
    const article = getArticle(order.articleId);
    return `
      <div class="timeline-item">
        <strong>${order.number}</strong>
        <p>${article?.name || "—"} · ${order.quantity} m</p>
        <span class="badge ${priorityClass(order.priority)}">${order.priority}</span>
      </div>
    `;
  }).join("");
}

function renderArticlesView() {
  const selectedArticle = state.selectedArticleId === "new"
    ? null
    : state.articles.find((article) => article.id === state.selectedArticleId) || state.articles[0] || null;
  return `
    <section class="split-layout">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>Artykuły</h2>
            <p class="section-subtitle">Rozpinka ma wyłącznie wartości Tak/Nie, rodzaj snucia tylko taśmowe lub zespołowe.</p>
          </div>
          <button type="button" class="secondary-button" id="new-article-button">Nowy artykuł</button>
        </div>
        <div class="list">
          ${state.articles.map((article) => `
            <button type="button" class="list-item ${article.id === selectedArticle?.id ? "is-selected" : ""}" data-select-article="${article.id}">
              <div class="list-item-top">
                <strong>${article.name}</strong>
                <span class="badge ${routeClass(forwardingTarget(article))}">${article.rodzajSnucia}</span>
              </div>
              <p><strong>Szerokość tkaniny:</strong> ${article.fabricWidth} cm</p>
              <p><strong>Rozpinka:</strong> ${article.rozpinka}</p>
              <p class="muted">${article.uwagi || "Brak uwag."}</p>
            </button>
          `).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>${selectedArticle ? `Edycja ${selectedArticle.name}` : "Nowy artykuł"}</h2>
            <p class="section-subtitle">Dodatkowa szerokość tkaniny jest dostępna w danych artykułu.</p>
          </div>
        </div>
        ${renderArticleForm(selectedArticle)}
      </article>
    </section>
  `;
}

function renderArticleForm(article) {
  const values = article || {
    name: "",
    watkiCm: 0,
    fabricWidth: 150,
    rozpinka: "Nie",
    rodzajSnucia: "taśmowe",
    uwagi: ""
  };
  return `
    <form id="article-form">
      <input type="hidden" name="articleId" value="${article?.id || ""}">
      <div class="form-grid">
        <label class="form-field">
          <span>Nazwa artykułu</span>
          <input type="text" name="name" value="${values.name}" required>
        </label>
        <label class="form-field">
          <span>Wątki / cm</span>
          <input type="number" min="1" name="watkiCm" value="${values.watkiCm}" required>
        </label>
        <label class="form-field">
          <span>Szerokość tkaniny [cm]</span>
          <input type="number" min="1" name="fabricWidth" value="${values.fabricWidth}" required>
        </label>
        <label class="form-field">
          <span>Rozpinka</span>
          <select name="rozpinka">
            ${FABRIC_SETUP_OPTIONS.map((option) => `<option value="${option}" ${option === values.rozpinka ? "selected" : ""}>${option}</option>`).join("")}
          </select>
        </label>
        <label class="form-field">
          <span>Rodzaj snucia</span>
          <select name="rodzajSnucia">
            ${WARPING_OPTIONS.map((option) => `<option value="${option}" ${option === values.rodzajSnucia ? "selected" : ""}>${option}</option>`).join("")}
          </select>
        </label>
        <div class="meta-card">
          <span class="stat-label">Kierunek dla zleceń</span>
          <strong data-article-route>${forwardingTarget(values)}</strong>
          <p class="muted">Zlecenia dla tego artykułu trafią dalej zgodnie z rodzajem snucia.</p>
        </div>
        <label class="form-field full-width">
          <span>Uwagi</span>
          <textarea name="uwagi">${values.uwagi}</textarea>
        </label>
      </div>
      <div class="form-actions">
        <button type="submit" class="primary-button">Zapisz artykuł</button>
      </div>
    </form>
  `;
}

function renderWorkersView() {
  const selectedWorker = state.workers.find((worker) => worker.id === state.selectedWorkerId) || state.workers[0];
  return `
    <section class="split-layout">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>Pracownicy</h2>
            <p class="section-subtitle">Kafelki są klikalne i otwierają szczegóły wraz ze statystykami pracy.</p>
          </div>
        </div>
        <div class="list">
          ${state.workers.map((worker) => `
            <button type="button" class="worker-button ${worker.id === selectedWorker.id ? "is-selected" : ""}" data-select-worker="${worker.id}">
              <div>
                <strong>${worker.name}</strong>
                <p>${worker.role}</p>
              </div>
              <span class="badge">${worker.shift}</span>
            </button>
          `).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>${selectedWorker.name}</h2>
            <p class="section-subtitle">${selectedWorker.role} · ${selectedWorker.shift} · doświadczenie ${selectedWorker.experience}</p>
          </div>
        </div>
        <div class="worker-stats">
          ${Object.entries(selectedWorker.stats).map(([label, value]) => `
            <div class="worker-stat">
              <span class="stat-label">${translateWorkerStat(label)}</span>
              <strong>${value}</strong>
            </div>
          `).join("")}
        </div>
        <div class="timeline">
          ${selectedWorker.recentActivity.map((entry) => `<div class="timeline-item">${entry}</div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function translateWorkerStat(key) {
  const labels = {
    efficiency: "Wydajność",
    quality: "Jakość",
    output: "Wynik pracy",
    downtime: "Przestoje"
  };
  return labels[key] || key;
}

function renderWeavingView() {
  const selectedLoom = state.selectedLoomId === "new"
    ? null
    : state.looms.find((loom) => loom.id === state.selectedLoomId) || state.looms[0] || null;
  return `
    <section class="split-layout">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>Tkalnia</h2>
            <p class="section-subtitle">Kolor bloczka wynika z typu krosna, a rozmiar nadal z szerokości krosna.</p>
          </div>
          <button type="button" class="secondary-button" id="new-loom-button">Nowe krosno</button>
        </div>
        <div class="loom-grid">
          ${state.looms.map((loom) => renderLoomCard(loom, selectedLoom?.id)).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>${selectedLoom ? `Edycja ${selectedLoom.name}` : "Nowe krosno"}</h2>
            <p class="section-subtitle">Typ krosna wybierasz z ustawień, bez dodatkowych pól poza nazwą i kolorem.</p>
          </div>
        </div>
        ${renderLoomForm(selectedLoom)}
      </article>
    </section>
  `;
}

function renderLoomCard(loom, selectedId) {
  const loomType = getLoomType(loom.loomTypeId);
  const blockWidth = Math.max(120, Math.round(loom.width * 1.2));
  return `
    <button type="button" class="loom-card ${loom.id === selectedId ? "is-selected" : ""}" data-select-loom="${loom.id}">
      <div class="loom-block" style="background:${loomType?.color || "#cbd5e1"}; width:${blockWidth}px;"></div>
      <div class="loom-caption">
        <div>
          <strong>${loom.name}</strong>
          <p>${loomType?.name || "Brak typu"} · ${loom.width} cm</p>
        </div>
        <span class="badge">${loom.status}</span>
      </div>
    </button>
  `;
}

function renderLoomForm(loom) {
  const values = loom || {
    name: "",
    width: 180,
    loomTypeId: state.loomTypes[0]?.id || "",
    status: "Pracuje"
  };
  return `
    <form id="loom-form">
      <input type="hidden" name="loomId" value="${loom?.id || ""}">
      <div class="form-grid">
        <label class="form-field">
          <span>Nazwa krosna</span>
          <input type="text" name="name" value="${values.name}" required>
        </label>
        <label class="form-field">
          <span>Szerokość [cm]</span>
          <input type="number" min="1" name="width" value="${values.width}" required>
        </label>
        <label class="form-field">
          <span>Typ krosna</span>
          <select name="loomTypeId">
            ${state.loomTypes.map((loomType) => `<option value="${loomType.id}" ${loomType.id === values.loomTypeId ? "selected" : ""}>${loomType.name}</option>`).join("")}
          </select>
        </label>
        <label class="form-field">
          <span>Status</span>
          <select name="status">
            ${["Pracuje", "Przezbrojenie", "Postój"].map((status) => `<option value="${status}" ${status === values.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="form-actions">
        <button type="submit" class="primary-button">Zapisz krosno</button>
      </div>
    </form>
  `;
}

function renderSettingsView() {
  const selectedLoomType = state.selectedLoomTypeId === "new"
    ? null
    : state.loomTypes.find((loomType) => loomType.id === state.selectedLoomTypeId) || state.loomTypes[0] || null;
  return `
    <section class="split-layout">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>Ustawienia · Typy krosien</h2>
            <p class="section-subtitle">Każdy typ ma tylko nazwę i kolor z palety.</p>
          </div>
          <button type="button" class="secondary-button" id="new-loom-type-button">Nowy typ</button>
        </div>
        <div class="list">
          ${state.loomTypes.map((loomType) => `
            <button type="button" class="list-item ${loomType.id === selectedLoomType?.id ? "is-selected" : ""}" data-select-loom-type="${loomType.id}">
              <div class="list-item-top">
                <strong>${loomType.name}</strong>
                <span class="badge" style="background:${loomType.color}; color:#fff;">${loomType.color}</span>
              </div>
              <div class="loom-block" style="background:${loomType.color}; width:150px; min-height:42px;"></div>
            </button>
          `).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h2>${selectedLoomType ? `Edycja ${selectedLoomType.name}` : "Nowy typ krosna"}</h2>
            <p class="section-subtitle">Kolor z tej palety jest potem widoczny na bloczkach krosien na tkalni.</p>
          </div>
        </div>
        ${renderLoomTypeForm(selectedLoomType)}
      </article>
    </section>
  `;
}

function renderLoomTypeForm(loomType) {
  const values = loomType || { name: "", color: LOOM_COLORS[0] };
  return `
    <form id="loom-type-form">
      <input type="hidden" name="loomTypeId" value="${loomType?.id || ""}">
      <div class="form-grid">
        <label class="form-field full-width">
          <span>Nazwa typu</span>
          <input type="text" name="name" value="${values.name}" required>
        </label>
        <div class="form-field full-width">
          <span>Kolor z palety</span>
          <div class="palette">
            ${LOOM_COLORS.map((color) => `
              <button
                type="button"
                class="palette-button ${color === values.color ? "is-selected" : ""}"
                style="background:${color};"
                data-select-color="${color}"
                aria-label="Wybierz kolor ${color}"
              ></button>
            `).join("")}
          </div>
          <input type="hidden" name="color" value="${values.color}">
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="primary-button">Zapisz typ</button>
      </div>
    </form>
  `;
}

function bindViewControls() {
  document.querySelectorAll("[data-select-order]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedOrderId = button.dataset.selectOrder;
      renderApp();
    });
  });

  document.querySelectorAll("[data-select-article]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedArticleId = button.dataset.selectArticle;
      renderApp();
    });
  });

  document.querySelectorAll("[data-select-worker]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedWorkerId = button.dataset.selectWorker;
      renderApp();
    });
  });

  document.querySelectorAll("[data-select-loom]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLoomId = button.dataset.selectLoom;
      renderApp();
    });
  });

  document.querySelectorAll("[data-select-loom-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLoomTypeId = button.dataset.selectLoomType;
      renderApp();
    });
  });

  document.querySelectorAll("[data-select-color]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = button.closest("form");
      form.querySelector('input[name="color"]').value = button.dataset.selectColor;
      form.querySelectorAll("[data-select-color]").forEach((paletteButton) => {
        paletteButton.classList.toggle("is-selected", paletteButton.dataset.selectColor === button.dataset.selectColor);
      });
    });
  });

  document.getElementById("new-order-button")?.addEventListener("click", () => {
    state.selectedOrderId = "new";
    renderApp();
  });

  document.getElementById("new-article-button")?.addEventListener("click", () => {
    state.selectedArticleId = "new";
    renderApp();
  });

  document.getElementById("new-loom-button")?.addEventListener("click", () => {
    state.selectedLoomId = "new";
    renderApp();
  });

  document.getElementById("new-loom-type-button")?.addEventListener("click", () => {
    state.selectedLoomTypeId = "new";
    renderApp();
  });

  document.querySelector('#order-form select[name="articleId"]')?.addEventListener("change", updateOrderRoutePreview);
  document.querySelector('#article-form select[name="rodzajSnucia"]')?.addEventListener("change", updateArticleRoutePreview);

  document.getElementById("order-form")?.addEventListener("submit", handleOrderSubmit);
  document.getElementById("article-form")?.addEventListener("submit", handleArticleSubmit);
  document.getElementById("loom-form")?.addEventListener("submit", handleLoomSubmit);
  document.getElementById("loom-type-form")?.addEventListener("submit", handleLoomTypeSubmit);
  document.getElementById("forward-order-button")?.addEventListener("click", handleOrderForward);
}

function handleOrderSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const orderId = formData.get("orderId");
  const payload = {
    id: orderId || generateId("ord"),
    number: formData.get("number").trim(),
    articleId: formData.get("articleId"),
    quantity: Number(formData.get("quantity")),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    uwagi: formData.get("uwagi").trim(),
    forwardedTo: orderId ? state.productionOrders.find((order) => order.id === orderId)?.forwardedTo || null : null
  };

  setState(() => {
    const index = state.productionOrders.findIndex((order) => order.id === payload.id);
    if (index >= 0) {
      state.productionOrders[index] = payload;
    } else {
      state.productionOrders.unshift(payload);
    }
    state.selectedOrderId = payload.id;
  });
}

function updateOrderRoutePreview(event) {
  const article = getArticle(event.currentTarget.value);
  const route = forwardingTarget(article);
  document.querySelector("[data-order-route]")?.replaceChildren(document.createTextNode(route));
  document.querySelector("[data-order-warping]")?.replaceChildren(document.createTextNode(article?.rodzajSnucia || "—"));
  document.querySelector("[data-order-rozpinka]")?.replaceChildren(document.createTextNode(article?.rozpinka || "—"));
  const forwardButton = document.getElementById("forward-order-button");
  if (forwardButton) {
    forwardButton.textContent = `Przekaż do ${route}`;
  }
}

function handleOrderForward() {
  const order = state.productionOrders.find((entry) => entry.id === state.selectedOrderId);
  if (!order) {
    return;
  }
  const route = forwardingTarget(getArticle(order.articleId));
  setState(() => {
    order.forwardedTo = route;
    const firstVisible = getVisibleOrders()[0];
    state.selectedOrderId = firstVisible?.id || "";
  });
}

function handleArticleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const articleId = formData.get("articleId");
  const payload = {
    id: articleId || generateId("art"),
    name: formData.get("name").trim(),
    watkiCm: Number(formData.get("watkiCm")),
    fabricWidth: Number(formData.get("fabricWidth")),
    rozpinka: formData.get("rozpinka"),
    rodzajSnucia: formData.get("rodzajSnucia"),
    uwagi: formData.get("uwagi").trim()
  };

  setState(() => {
    const index = state.articles.findIndex((article) => article.id === payload.id);
    if (index >= 0) {
      state.articles[index] = payload;
    } else {
      state.articles.unshift(payload);
    }
    state.selectedArticleId = payload.id;
  });
}

function updateArticleRoutePreview(event) {
  const route = forwardingTarget({ rodzajSnucia: event.currentTarget.value });
  document.querySelector("[data-article-route]")?.replaceChildren(document.createTextNode(route));
}

function handleLoomSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const loomId = formData.get("loomId");
  const payload = {
    id: loomId || generateId("loom"),
    name: formData.get("name").trim(),
    width: Number(formData.get("width")),
    loomTypeId: formData.get("loomTypeId"),
    status: formData.get("status")
  };

  setState(() => {
    const index = state.looms.findIndex((loom) => loom.id === payload.id);
    if (index >= 0) {
      state.looms[index] = payload;
    } else {
      state.looms.unshift(payload);
    }
    state.selectedLoomId = payload.id;
  });
}

function handleLoomTypeSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const loomTypeId = formData.get("loomTypeId");
  const payload = {
    id: loomTypeId || generateId("type"),
    name: formData.get("name").trim(),
    color: formData.get("color")
  };

  setState(() => {
    const index = state.loomTypes.findIndex((loomType) => loomType.id === payload.id);
    if (index >= 0) {
      state.loomTypes[index] = payload;
    } else {
      state.loomTypes.unshift(payload);
    }
    state.selectedLoomTypeId = payload.id;
  });
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.currentView = button.dataset.view;
    renderApp();
  });
});

renderApp();
