// ============================================================
// app.js – Technotex Plan produkcji
// Frontend-only prototype (no backend)
// ============================================================

// ---- DOM shortcuts ----
function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return day + '.' + m + '.' + y;
}

function stanowiskoLabel(s) {
  return { tkalnia: 'Tkalnia', snowalnia: 'Snowalnia', klejarnia: 'Klejarnia', przewlekalnia: 'Przewlekalnia' }[s] || s;
}

function statusZleceniaHtml(s) {
  const map = { nowe: ['badge-info','Nowe'], w_trakcie: ['badge-warning','W trakcie'], zrealizowane: ['badge-success','Zrealizowane'] };
  const [cls, lbl] = map[s] || ['badge-grey', s];
  return `<span class="badge ${cls}">${lbl}</span>`;
}

function statusSnHtml(s) {
  const map = { w_kolejce: ['badge-grey','W kolejce'], w_trakcie: ['badge-warning','W trakcie'], gotowe: ['badge-success','Gotowe'], zarchiwizowane: ['badge-info','Zarchiwizowane'] };
  const [cls, lbl] = map[s] || ['badge-grey', s];
  return `<span class="badge ${cls}">${lbl}</span>`;
}

function statusSnLabel(s) {
  return {
    w_kolejce: 'W kolejce',
    w_trakcie: 'W trakcie',
    gotowe: 'Gotowe',
    zarchiwizowane: 'Zarchiwizowane',
  }[s] || s;
}

function statusPrzerobkiHtml(s) {
  const map = { w_kolejce: ['badge-grey','W kolejce'], w_przygotowaniu: ['badge-warning','W przygotowaniu'], przewleczona: ['badge-success','Przewleczona'] };
  const [cls, lbl] = map[s] || ['badge-grey', s];
  return `<span class="badge ${cls}">${lbl}</span>`;
}

function statusObecnosci(s) {
  const map = { obecny: ['badge-success','Obecny'], nieobecny: ['badge-danger','Nieobecny'], chory: ['badge-warning','Chory'], urlop: ['badge-info','Urlop'] };
  const [cls, lbl] = map[s] || ['badge-grey', s];
  return `<span class="badge ${cls}">${lbl}</span>`;
}

const PRIORYTETY = ['niski', 'standard', 'wysoki', 'krytyczny'];
const PALETA_KOLOROW = ['#2980b9', '#27ae60', '#d4a017', '#8e44ad', '#16a085', '#2c3e50', '#c0392b', '#d35400', '#5d4037', '#0f766e'];

function rozpinkaLabel(value) {
  return value === 'tak' ? 'Tak' : 'Nie';
}

function priorytetLabel(value) {
  return {
    niski: 'Niski',
    standard: 'Standard',
    wysoki: 'Wysoki',
    krytyczny: 'Krytyczny',
  }[value] || 'Standard';
}

function priorytetBadgeClass(value) {
  return {
    niski: 'badge-grey',
    standard: 'badge-info',
    wysoki: 'badge-warning',
    krytyczny: 'badge-danger',
  }[value] || 'badge-grey';
}

function getKierunekZlecenia(artykul) {
  return artykul && artykul.rodzajSnucia === 'zespołowe' ? 'Klejarnia' : 'Snowalnia';
}

function getWidoczneZlecenia() {
  return state.zlecenia.filter(z => !z.przekazaneDo);
}

const undoStack = [];
const UNDO_LIMIT = 60; // enough to undo several batch/layout steps without growing snapshots indefinitely
let draggedLoomId = null;
let suppressLoomClick = false;
const UNDO_KEYS = [
  'artykuly',
  'typyKrosien',
  'krosna',
  'osnowy',
  'pracownicy',
  'zmianyTygodniowe',
  'nieobecnosci',
  'zlecenia',
  'snowalnia',
  'klejarnia',
  'historiaArtykulow',
  'historiaKrosien',
  'obecnosci',
  'nextId',
];

function saveUndoPoint(label) {
  const snapshot = {};
  UNDO_KEYS.forEach((key) => {
    snapshot[key] = JSON.parse(JSON.stringify(state[key]));
  });
  undoStack.push({ label, snapshot });
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
}

function normalizeSplitLengths(raw, count) {
  const values = String(raw || '')
    .split(/[\n,;\s]+/)
    .map(v => parseInt(v.trim(), 10))
    .filter(v => Number.isFinite(v) && v > 0);
  if (values.length !== count) return null;
  return values;
}

function splitTokenCount(raw) {
  return String(raw || '')
    .split(/[\n,;\s]+/)
    .map(v => v.trim())
    .filter(Boolean).length;
}

function getSplitLengths(item) {
  if (Array.isArray(item.splitLengths) && item.splitLengths.length) {
    return item.splitLengths
      .map(v => parseInt(v, 10))
      .filter(v => Number.isFinite(v) && v > 0);
  }
  return [];
}

function hasSplitPlan(item) {
  return getSplitLengths(item).length > 0;
}

function splitSummary(item) {
  const lengths = getSplitLengths(item);
  if (!lengths.length) return 'Brak podziału';
  return `${lengths.length} osn. (${lengths.join(' / ')} m)`;
}

function getArticleTimeline(id) {
  const timeline = [];
  (state.historiaArtykulow[id] || []).forEach(event => timeline.push({ ...event }));

  state.zlecenia
    .filter(z => z.artId === id)
    .forEach(z => {
      timeline.push({
        data: z.dataUtworzenia || z.terminRealizacji || today(),
        typ: 'zlecenie',
        opis: `Utworzono zlecenie ${z.numer} (${z.iloscM} m, priorytet: ${priorytetLabel(z.priorytet)}).`,
        uzytkownik: 'Planista',
      });
      if (z.przekazaneDo) {
        timeline.push({
          data: z.terminRealizacji || z.dataUtworzenia || today(),
          typ: 'proces',
          opis: `Przekazano do ${z.przekazaneDo === 'klejarnia' ? 'Klejarni' : 'Snowalni'}.`,
          uzytkownik: 'Planista',
        });
      }
    });

  state.snowalnia
    .filter(item => item.artId === id && item.dataPlanowana)
    .forEach(item => {
      timeline.push({
        data: item.dataPlanowana,
        typ: 'proces',
        opis: `Snowalnia: ${item.numer} (${statusSnLabel(item.status)}, ${splitSummary(item)}).`,
        uzytkownik: 'Snowalnia',
      });
    });

  state.klejarnia
    .filter(item => item.artId === id && item.dataPlanowana)
    .forEach(item => {
      timeline.push({
        data: item.dataPlanowana,
        typ: 'proces',
        opis: `Klejarnia: ${item.numer} (${statusSnLabel(item.status)}, ${splitSummary(item)}).`,
        uzytkownik: 'Klejarnia',
      });
    });

  return timeline
    .filter(event => event && event.data)
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));
}

function renderTimeline(events, emptyText) {
  if (!events.length) return `<p class="text-muted text-sm">${emptyText}</p>`;
  return `
    <div class="timeline">
      ${events.map(event => `
        <div class="timeline-item ttype-${event.typ}">
          <div class="timeline-date">${formatDate(event.data)}</div>
          <div class="timeline-body">
            <div class="timeline-type">${escHtml(event.typ.replace(/_/g, ' '))}</div>
            <div class="timeline-opis">${escHtml(event.opis)}</div>
            <div class="timeline-user">${escHtml(event.uzytkownik || 'System')}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function parseSafeInlineArgs(raw) {
  const input = String(raw || '').trim();
  if (!input) return [];
  const args = [];
  let current = '';
  let quote = null;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quote) {
      if (char === '\\' && i + 1 < input.length) {
        current += input[i + 1];
        i += 1;
        continue;
      }
      if (char === quote) {
        args.push(current);
        current = '';
        quote = null;
        continue;
      }
      current += char;
      continue;
    }

    if (char === '\'' || char === '"') {
      quote = char;
      continue;
    }
    if (char === ',') {
      const token = current.trim();
      if (token) args.push(token);
      current = '';
      continue;
    }
    current += char;
  }

  if (quote) return null;
  const tail = current.trim();
  if (tail) args.push(tail);

  return args.map((arg) => {
    if (typeof arg !== 'string') return arg;
    if (/^-?\d+$/.test(arg)) return parseInt(arg, 10);
    if (arg === 'true') return true;
    if (arg === 'false') return false;
    if (arg === 'null') return null;
    return arg;
  });
}

function isSafeInlineCall(expression) {
  const input = String(expression || '').trim();
  const openIndex = input.indexOf('(');
  if (openIndex <= 0 || !input.endsWith(')')) return false;
  const fnName = input.slice(0, openIndex).trim();
  if (!/^[A-Za-z_$][\w$]*$/.test(fnName)) return false;
  return parseSafeInlineArgs(input.slice(openIndex + 1, -1)) !== null;
}

function runSafeInlineCall(expression) {
  const input = String(expression || '').trim();
  const openIndex = input.indexOf('(');
  if (openIndex <= 0 || !input.endsWith(')')) return false;
  const fnName = input.slice(0, openIndex).trim();
  const fn = window[fnName];
  if (typeof fn !== 'function') return false;
  const args = parseSafeInlineArgs(input.slice(openIndex + 1, -1));
  if (args === null) return false;
  fn(...args);
  return true;
}

function stripUnsafeModalMarkup(html) {
  return String(html || '')
    .replace(/<\s*(script|iframe|object|embed)\b[\s\S]*?(?:<\/\s*\1\s*>|\/>)/gi, '')
    .replace(/<\s*link\b[^>]*rel\s*=\s*["']import["'][^>]*>/gi, '')
    .replace(/\s(on(?!click\b)\w+)\s*=\s*(['"])[\s\S]*?\2/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*(?:javascript|data|vbscript):[\s\S]*?\2/gi, '');
}

// ============================================================
// MODAL
// ============================================================
const modalOverlay = qs('#modal-overlay');
const modalContent = qs('#modal-content');

function sanitizeModalHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stripUnsafeModalMarkup(html), 'text/html');
  doc.body.querySelectorAll('script, iframe, object, embed, link[rel="import"]').forEach(node => node.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || '').trim().toLowerCase();
      if (name === 'onclick') {
        const action = String(attr.value || '').trim();
        if (isSafeInlineCall(action)) {
          el.setAttribute('data-onclick', action);
        }
        el.removeAttribute(attr.name);
        return;
      }
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }
      if ((name === 'href' || name === 'src') && /^(javascript|data|vbscript):/.test(value)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body;
}

function showModal(html, wide) {
  const safeBody = sanitizeModalHtml(`<div class="modal${wide ? ' modal-wide' : ''}">${html}</div>`);
  const nodes = [...safeBody.childNodes].map(node => document.importNode(node, true));
  modalContent.replaceChildren(...nodes);
  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalContent.replaceChildren();
}

modalContent.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-onclick]');
  if (!actionEl) return;
  event.preventDefault();
  runSafeInlineCall(actionEl.dataset.onclick);
});

function confirm(message, onYes, detail) {
  showModal(`
    <h3>Potwierdzenie</h3>
    <p style="font-size:.9rem;line-height:1.6">${escHtml(message)}</p>
    ${detail ? `<p style="font-size:.8rem;color:#64748b;margin-top:8px">${escHtml(detail)}</p>` : ''}
    <div class="modal-actions">
      <button class="btn btn-secondary" id="confirm-no">Nie</button>
      <button class="btn btn-primary" id="confirm-yes">Tak</button>
    </div>
  `);
  qs('#confirm-yes').addEventListener('click', () => { closeModal(); onYes(); });
  qs('#confirm-no').addEventListener('click', closeModal);
}

window.undoLastChange = function() {
  if (!undoStack.length) {
    alert('Brak zmian do cofnięcia.');
    return;
  }
  const last = undoStack.pop();
  UNDO_KEYS.forEach((key) => {
    state[key] = JSON.parse(JSON.stringify(last.snapshot[key]));
  });
  renderView();
};

// Close modal when clicking overlay background
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

// ============================================================
// ROUTING
// ============================================================
const VIEWS = ['artykuly','zlecenia','snowalnia','klejarnia','magazyn','przewlekalnia','tkalnia','obecnosci','ustawienia'];

function navigate(view) {
  if (!VIEWS.includes(view)) view = 'tkalnia';
  state.currentView = view;
  window.location.hash = view;
  renderView();
  updateNav();
}

function updateNav() {
  qsa('.nav-item').forEach(a => {
    a.classList.toggle('active', a.dataset.view === state.currentView);
  });
}

function renderView() {
  const main = qs('#main-content');
  const renders = {
    artykuly:      renderArtykuly,
    zlecenia:      renderZlecenia,
    snowalnia:     renderSnowalnioView,
    klejarnia:     renderKlejarnia,
    magazyn:       renderMagazyn,
    przewlekalnia: renderPrzewlekalnia,
    tkalnia:       renderTkalnia,
    obecnosci:     renderObecnosci,
    ustawienia:    renderUstawienia,
  };
  main.innerHTML = (renders[state.currentView] || renderTkalnia)();
  attachViewEvents();
}

// ============================================================
// VIEW: ARTYKUŁY
// ============================================================
function renderArtykuly() {
  const rows = state.artykuly.map(a => `
    <tr>
      <td class="fw-600">${escHtml(a.nazwa)}</td>
      <td>${a.watkiNaCm}</td>
      <td>${rozpinkaLabel(a.rozpinka)}</td>
      <td>${escHtml(a.rodzajSnucia)}</td>
      <td>${a.szerokoscTkaniny || '—'} cm</td>
      <td>${escHtml(a.uwagi) || '—'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary" onclick="showArtykulHistory(${a.id})">Historia</button>
          <button class="btn btn-sm btn-secondary" onclick="editArtykul(${a.id})">Edytuj</button>
          <button class="btn btn-sm btn-danger" onclick="deleteArtykul(${a.id})">Usuń</button>
        </div>
      </td>
    </tr>`).join('');

  return `
    <div class="view-header">
      <h2>Artykuły</h2>
      <p>Definicje artykułów produkowanych na tkalni</p>
    </div>
    <div class="card">
      <div class="section-header">
        <h3>Lista artykułów (${state.artykuly.length})</h3>
        <button class="btn btn-primary" onclick="addArtykul()">+ Dodaj artykuł</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Wątki/cm</th>
              <th>Rozpinka</th>
              <th>Rodzaj snucia</th>
              <th>Szerokość tkaniny</th>
              <th>Uwagi</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

window.addArtykul = function() {
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Nowy artykuł</h3>
    <div class="form-group"><label>Nazwa artykułu</label><input class="form-control" id="fa-nazwa" placeholder="np. BT 367"></div>
    <div class="grid-2">
      <div class="form-group"><label>Wątki na cm</label><input class="form-control" type="number" id="fa-watki" placeholder="np. 18"></div>
      <div class="form-group"><label>Rozpinka</label>
        <select class="form-control" id="fa-rozpinka">
          <option value="tak">Tak</option>
          <option value="nie">Nie</option>
        </select>
      </div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Rodzaj snucia</label>
        <select class="form-control" id="fa-snucie">
          <option value="taśmowe">Taśmowe</option>
          <option value="zespołowe">Zespołowe</option>
        </select>
      </div>
      <div class="form-group"><label>Szerokość tkaniny (cm)</label><input class="form-control" type="number" id="fa-szerokosc" placeholder="np. 150"></div>
    </div>
    <div class="form-group"><label>Uwagi</label><textarea class="form-control" id="fa-uwagi" rows="3"></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveArtykul()">Zapisz</button>
    </div>`);
};

window.saveArtykul = function() {
  const nazwa = qs('#fa-nazwa').value.trim();
  if (!nazwa) { alert('Podaj nazwę artykułu.'); return; }
  saveUndoPoint('Dodanie artykułu');
  const artykul = {
    id: state.nextId.artykul++,
    nazwa,
    watkiNaCm: parseInt(qs('#fa-watki').value) || 0,
    rozpinka: qs('#fa-rozpinka').value,
    rodzajSnucia: qs('#fa-snucie').value,
    szerokoscTkaniny: parseInt(qs('#fa-szerokosc').value) || 0,
    uwagi: qs('#fa-uwagi').value.trim(),
  };
  state.artykuly.push(artykul);
  addArtykulHistory(artykul.id, 'utworzenie', `Dodano artykuł ${artykul.nazwa} do kartoteki.`, 'Planista');
  closeModal();
  renderView();
};

window.editArtykul = function(id) {
  const a = getArtykul(id); if (!a) return;
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj artykuł</h3>
    <div class="form-group"><label>Nazwa artykułu</label><input class="form-control" id="fa-nazwa" value="${escHtml(a.nazwa)}"></div>
    <div class="grid-2">
      <div class="form-group"><label>Wątki na cm</label><input class="form-control" type="number" id="fa-watki" value="${a.watkiNaCm}"></div>
      <div class="form-group"><label>Rozpinka</label>
        <select class="form-control" id="fa-rozpinka">
          <option value="tak" ${a.rozpinka==='tak'?'selected':''}>Tak</option>
          <option value="nie" ${a.rozpinka==='nie'?'selected':''}>Nie</option>
        </select>
      </div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Rodzaj snucia</label>
        <select class="form-control" id="fa-snucie">
          <option value="taśmowe" ${a.rodzajSnucia==='taśmowe'?'selected':''}>Taśmowe</option>
          <option value="zespołowe" ${a.rodzajSnucia==='zespołowe'?'selected':''}>Zespołowe</option>
        </select>
      </div>
      <div class="form-group"><label>Szerokość tkaniny (cm)</label><input class="form-control" type="number" id="fa-szerokosc" value="${a.szerokoscTkaniny || ''}"></div>
    </div>
    <div class="form-group"><label>Uwagi</label><textarea class="form-control" id="fa-uwagi" rows="3">${escHtml(a.uwagi || '')}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updateArtykul(${id})">Zapisz</button>
    </div>`);
};

window.updateArtykul = function(id) {
  const a = getArtykul(id); if (!a) return;
  const nazwa = qs('#fa-nazwa').value.trim();
  if (!nazwa) { alert('Podaj nazwę.'); return; }
  saveUndoPoint('Edycja artykułu');
  const oldName = a.nazwa;
  a.nazwa       = nazwa;
  a.watkiNaCm   = parseInt(qs('#fa-watki').value) || 0;
  a.rozpinka    = qs('#fa-rozpinka').value;
  a.rodzajSnucia = qs('#fa-snucie').value;
  a.szerokoscTkaniny = parseInt(qs('#fa-szerokosc').value) || 0;
  a.uwagi = qs('#fa-uwagi').value.trim();
  addArtykulHistory(
    id,
    'aktualizacja',
    `Zapisano zmiany artykułu${oldName !== a.nazwa ? `: ${oldName} → ${a.nazwa}` : ` ${a.nazwa}`}.`,
    'Planista'
  );
  closeModal();
  renderView();
};

window.deleteArtykul = function(id) {
  const a = getArtykul(id); if (!a) return;
  confirm(`Usunąć artykuł "${a.nazwa}"?`, () => {
    saveUndoPoint('Usunięcie artykułu');
    state.artykuly = state.artykuly.filter(x => x.id !== id);
    delete state.historiaArtykulow[id];
    renderView();
  });
};

window.showArtykulHistory = function(id) {
  const a = getArtykul(id); if (!a) return;
  const zleceniaCount = state.zlecenia.filter(z => z.artId === id).length;
  const osnowyCount = state.osnowy.filter(o => o.artId === id).length;
  const timeline = getArticleTimeline(id);
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>${escHtml(a.nazwa)}</h3>
    <div class="detail-section">
      <div class="detail-section-title">Dane artykułu</div>
      <div class="grid-2">
        <div><strong>Wątki/cm:</strong> ${a.watkiNaCm}</div>
        <div><strong>Rozpinka:</strong> ${rozpinkaLabel(a.rozpinka)}</div>
        <div><strong>Rodzaj snucia:</strong> ${escHtml(a.rodzajSnucia)}</div>
        <div><strong>Szerokość:</strong> ${a.szerokoscTkaniny || '—'} cm</div>
        <div><strong>Zlecenia:</strong> ${zleceniaCount}</div>
        <div><strong>Osnowy w obiegu:</strong> ${osnowyCount}</div>
      </div>
      ${a.uwagi ? `<p class="text-muted text-sm mt-8">${escHtml(a.uwagi)}</p>` : ''}
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Historia artykułu</div>
      ${renderTimeline(timeline, 'Brak historii artykułu.')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Zamknij</button>
    </div>`);
};

// ============================================================
// VIEW: ZLECENIA PRODUKCYJNE
// ============================================================
function renderZlecenia() {
  const visibleOrders = getWidoczneZlecenia();
  const rows = visibleOrders.map(z => {
    const art = getArtykul(z.artId);
    const kierunek = getKierunekZlecenia(art);
    return `<tr>
      <td class="fw-600">${escHtml(z.numer)}</td>
      <td>${escHtml(art ? art.nazwa : '—')}</td>
      <td>${z.iloscM} m</td>
      <td><span class="badge ${priorytetBadgeClass(z.priorytet)}">${priorytetLabel(z.priorytet)}</span></td>
      <td>${statusZleceniaHtml(z.status)}</td>
      <td>${formatDate(z.dataUtworzenia)}</td>
      <td>${formatDate(z.terminRealizacji)}</td>
      <td>${escHtml(z.uwagi) || '—'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-primary" onclick="przekazZlecenie(${z.id})">→ ${kierunek}</button>
          <button class="btn btn-sm btn-secondary" onclick="editZlecenie(${z.id})">Edytuj</button>
          <button class="btn btn-sm btn-danger" onclick="deleteZlecenie(${z.id})">Usuń</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  const summary = {
    nowe: visibleOrders.filter(z => z.status === 'nowe').length,
    w_trakcie: visibleOrders.filter(z => z.status === 'w_trakcie').length,
    zrealizowane: visibleOrders.filter(z => z.status === 'zrealizowane').length,
  };

  return `
    <div class="view-header">
      <h2>Zlecenia produkcyjne</h2>
      <p>Zarządzanie zleceniami produkcji</p>
    </div>
    <div class="card" style="padding:16px 20px">
      <div class="flex gap-12">
        <div class="info-item"><div class="lbl">Nowe</div><div class="val" style="font-size:1.4rem">${summary.nowe}</div></div>
        <div class="info-item"><div class="lbl">W trakcie</div><div class="val" style="font-size:1.4rem;color:var(--warning)">${summary.w_trakcie}</div></div>
        <div class="info-item"><div class="lbl">Zrealizowane</div><div class="val" style="font-size:1.4rem;color:var(--success)">${summary.zrealizowane}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="section-header">
        <h3>Zlecenia (${visibleOrders.length})</h3>
        <button class="btn btn-primary" onclick="addZlecenie()">+ Nowe zlecenie</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Numer</th><th>Artykuł</th><th>Ilość</th><th>Priorytet</th><th>Status</th><th>Data utw.</th><th>Termin</th><th>Uwagi</th><th>Akcje</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="9" class="empty-state">Brak aktywnych zleceń produkcyjnych.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

function syncZlecenieRoute() {
  const art = getArtykul(parseInt(qs('#fz-art')?.value));
  const input = qs('#fz-kierunek');
  if (input) input.value = getKierunekZlecenia(art);
}

window.addZlecenie = function() {
  const artOptions = state.artykuly.map(a => `<option value="${a.id}">${escHtml(a.nazwa)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Nowe zlecenie produkcyjne</h3>
    <div class="form-group"><label>Artykuł</label><select class="form-control" id="fz-art">${artOptions}</select></div>
    <div class="grid-2">
      <div class="form-group"><label>Ilość (m)</label><input class="form-control" type="number" id="fz-ilosc" placeholder="np. 3000"></div>
      <div class="form-group"><label>Termin realizacji</label><input class="form-control" type="date" id="fz-termin"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Priorytet</label>
        <select class="form-control" id="fz-priorytet">
          ${PRIORYTETY.map(p => `<option value="${p}">${priorytetLabel(p)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Kierunek przekazania</label><input class="form-control" id="fz-kierunek" readonly></div>
    </div>
    <div class="form-group"><label>Uwagi</label><textarea class="form-control" id="fz-uwagi" rows="3"></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveZlecenie()">Utwórz</button>
    </div>`);
  syncZlecenieRoute();
  qs('#fz-art')?.addEventListener('change', syncZlecenieRoute);
};

window.saveZlecenie = function() {
  const artId = parseInt(qs('#fz-art').value);
  const ilosc = parseInt(qs('#fz-ilosc').value);
  if (!ilosc) { alert('Podaj ilość.'); return; }
  saveUndoPoint('Dodanie zlecenia');
  const id = state.nextId.zlecenie++;
  const numer = 'ZL-' + String(id).padStart(3,'0') + '/' + new Date().getFullYear();
  state.zlecenia.push({ id, numer, artId, iloscM: ilosc, status: 'nowe',
    dataUtworzenia: today(), terminRealizacji: qs('#fz-termin').value,
    priorytet: qs('#fz-priorytet').value, uwagi: qs('#fz-uwagi').value.trim(), przekazaneDo: null });
  closeModal(); renderView();
};

window.editZlecenie = function(id) {
  const z = state.zlecenia.find(x => x.id === id); if (!z) return;
  const artOptions = state.artykuly.map(a => `<option value="${a.id}" ${a.id===z.artId?'selected':''}>${escHtml(a.nazwa)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj zlecenie ${escHtml(z.numer)}</h3>
    <div class="form-group"><label>Artykuł</label><select class="form-control" id="fz-art">${artOptions}</select></div>
    <div class="grid-2">
      <div class="form-group"><label>Ilość (m)</label><input class="form-control" type="number" id="fz-ilosc" value="${z.iloscM}"></div>
      <div class="form-group"><label>Termin realizacji</label><input class="form-control" type="date" id="fz-termin" value="${z.terminRealizacji||''}"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Priorytet</label>
        <select class="form-control" id="fz-priorytet">
          ${PRIORYTETY.map(p => `<option value="${p}" ${z.priorytet===p?'selected':''}>${priorytetLabel(p)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Kierunek przekazania</label><input class="form-control" id="fz-kierunek" value="${getKierunekZlecenia(getArtykul(z.artId))}" readonly></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="fz-status">
        <option value="nowe" ${z.status==='nowe'?'selected':''}>Nowe</option>
        <option value="w_trakcie" ${z.status==='w_trakcie'?'selected':''}>W trakcie</option>
        <option value="zrealizowane" ${z.status==='zrealizowane'?'selected':''}>Zrealizowane</option>
      </select>
    </div>
    <div class="form-group"><label>Uwagi</label><textarea class="form-control" id="fz-uwagi" rows="3">${escHtml(z.uwagi || '')}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updateZlecenie(${id})">Zapisz</button>
    </div>`);
  syncZlecenieRoute();
  qs('#fz-art')?.addEventListener('change', syncZlecenieRoute);
};

window.updateZlecenie = function(id) {
  const z = state.zlecenia.find(x => x.id === id); if (!z) return;
  saveUndoPoint('Edycja zlecenia');
  z.artId   = parseInt(qs('#fz-art').value);
  z.iloscM  = parseInt(qs('#fz-ilosc').value) || z.iloscM;
  z.terminRealizacji = qs('#fz-termin').value;
  z.priorytet = qs('#fz-priorytet').value;
  z.status  = qs('#fz-status').value;
  z.uwagi = qs('#fz-uwagi').value.trim();
  closeModal(); renderView();
};

window.deleteZlecenie = function(id) {
  const z = state.zlecenia.find(x => x.id === id); if (!z) return;
  confirm(`Usunąć zlecenie ${z.numer}?`, () => {
    saveUndoPoint('Usunięcie zlecenia');
    state.zlecenia = state.zlecenia.filter(x => x.id !== id);
    renderView();
  });
};

window.przekazZlecenie = function(id) {
  const z = state.zlecenia.find(x => x.id === id); if (!z || z.przekazaneDo) return;
  const art = getArtykul(z.artId);
  const kierunek = getKierunekZlecenia(art);
  confirm(`Przekazać zlecenie ${z.numer} do ${kierunek}?`, () => {
    saveUndoPoint('Przekazanie zlecenia do przygotowania');
    const batch = {
      id: state.nextId[kierunek === 'Klejarnia' ? 'klejarnia' : 'snowalnia']++,
      numer: (kierunek === 'Klejarnia' ? 'KL-' : 'SN-') + String(kierunek === 'Klejarnia' ? state.nextId.klejarnia - 1 : state.nextId.snowalnia - 1).padStart(3, '0') + '/' + new Date().getFullYear(),
      artId: z.artId,
      metry: z.iloscM,
      status: 'w_kolejce',
      dataPlanowana: z.terminRealizacji,
      uwagi: z.uwagi || '',
      zlecenieId: z.id,
      splitLengths: [],
    };
    if (kierunek === 'Klejarnia') state.klejarnia.unshift(batch);
    else state.snowalnia.unshift(batch);
    z.przekazaneDo = kierunek;
    renderView();
  }, `Rodzaj snucia artykułu: ${art ? art.rodzajSnucia : '—'}`);
};

// ============================================================
// VIEW: SNOWALNIA
// ============================================================
function openSplitPlanModal(stage, id) {
  const list = stage === 'klejarnia' ? state.klejarnia : state.snowalnia;
  const item = list.find(x => x.id === id);
  if (!item) return;
  const lengths = getSplitLengths(item);
  const count = lengths.length || 1;
  const defaultLengths = lengths.length ? lengths.join(', ') : (item.metry ? String(item.metry) : '');
  const title = stage === 'klejarnia' ? 'Rozpoczęcie klejenia' : 'Rozpoczęcie snucia';
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>${title} – podział na osnowy</h3>
    <p class="text-muted text-sm">Zdefiniuj podział zlecenia na konkretne osnowy przed przekazaniem do magazynu.</p>
    <div class="form-group"><label>Liczba osnów</label><input class="form-control" type="number" min="1" id="fsp-count" value="${count}"></div>
    <div class="form-group"><label>Długości osnów (m)</label><textarea class="form-control" id="fsp-lengths" rows="3" placeholder="np. 500, 500, 600">${escHtml(defaultLengths)}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveSplitPlan('${stage}', ${id})">Zapisz podział</button>
    </div>`);
}

window.saveSplitPlan = function(stage, id) {
  const list = stage === 'klejarnia' ? state.klejarnia : state.snowalnia;
  const item = list.find(x => x.id === id);
  if (!item) return;
  const count = parseInt(qs('#fsp-count').value, 10);
  if (!count || count < 1) {
    alert('Podaj poprawną liczbę osnów.');
    return;
  }
  const lengths = normalizeSplitLengths(qs('#fsp-lengths').value, count);
  if (!lengths) {
    alert(`Podaj dokładnie ${count} dodatnich długości (liczba osnów).`);
    return;
  }
  saveUndoPoint('Podział zlecenia na osnowy');
  item.splitLengths = lengths;
  item.metry = lengths.reduce((sum, value) => sum + value, 0);
  if (item.status === 'w_kolejce') item.status = 'w_trakcie';
  closeModal();
  renderView();
};

function prepActions(stage, item) {
  const actions = [];
  if (item.status === 'w_kolejce') {
    actions.push(`<button class="btn btn-sm btn-primary" onclick="openSplitPlanModal('${stage}', ${item.id})">▶ Rozpocznij</button>`);
  }
  if (item.status === 'w_trakcie') {
    actions.push(`<button class="btn btn-sm btn-success" onclick="prepMarkReady('${stage}', ${item.id})">✓ Zakończ</button>`);
    actions.push(`<button class="btn btn-sm btn-secondary" onclick="prepBackToQueue('${stage}', ${item.id})">↩ W kolejce</button>`);
  }
  if (item.status === 'gotowe') {
    const transferFn = stage === 'klejarnia' ? 'klejarniaTworzOsnowe' : 'snowalniaTworzOsnowe';
    actions.push(`<button class="btn btn-sm btn-success" onclick="${transferFn}(${item.id})">→ Magazyn</button>`);
    actions.push(`<button class="btn btn-sm btn-secondary" onclick="prepBackToInProgress('${stage}', ${item.id})">↩ W trakcie</button>`);
  }
  actions.push(`<button class="btn btn-sm btn-secondary" onclick="openSplitPlanModal('${stage}', ${item.id})">Podział osnów</button>`);
  actions.push(`<button class="btn btn-sm btn-warning" onclick="prepReturnToOrders('${stage}', ${item.id})">↩ Zlecenia</button>`);
  actions.push(`<button class="btn btn-sm btn-secondary" onclick="${stage === 'klejarnia' ? 'editKlejarnia' : 'editSnowalnio'}(${item.id})">Edytuj</button>`);
  return `<div class="btn-group">${actions.join('')}</div>`;
}

window.prepMarkReady = function(stage, id) {
  const list = stage === 'klejarnia' ? state.klejarnia : state.snowalnia;
  const item = list.find(x => x.id === id);
  if (!item) return;
  if (!hasSplitPlan(item)) {
    openSplitPlanModal(stage, id);
    return;
  }
  confirm(`Zakończyć ${item.numer} i oznaczyć jako "Gotowe"?`, () => {
    saveUndoPoint(`Zakończenie etapu w ${stage === 'klejarnia' ? 'Klejarni' : 'Snowalni'}`);
    item.status = 'gotowe';
    closeModal();
    renderView();
  }, `Po zakończeniu będzie można od razu przekazać osnowy do magazynu.`);
};

window.prepBackToQueue = function(stage, id) {
  const list = stage === 'klejarnia' ? state.klejarnia : state.snowalnia;
  const item = list.find(x => x.id === id);
  if (!item) return;
  confirm(`Cofnąć ${item.numer} do statusu "W kolejce"?`, () => {
    saveUndoPoint(`Cofnięcie statusu w ${stage === 'klejarnia' ? 'Klejarni' : 'Snowalni'}`);
    item.status = 'w_kolejce';
    renderView();
  });
};

window.prepBackToInProgress = function(stage, id) {
  const list = stage === 'klejarnia' ? state.klejarnia : state.snowalnia;
  const item = list.find(x => x.id === id);
  if (!item) return;
  confirm(`Cofnąć ${item.numer} do statusu "W trakcie"?`, () => {
    saveUndoPoint(`Cofnięcie gotowego etapu w ${stage === 'klejarnia' ? 'Klejarni' : 'Snowalni'}`);
    item.status = 'w_trakcie';
    renderView();
  });
};

window.prepReturnToOrders = function(stage, id) {
  const list = stage === 'klejarnia' ? state.klejarnia : state.snowalnia;
  const item = list.find(x => x.id === id);
  if (!item) return;
  const kierunek = stage === 'klejarnia' ? 'Klejarnia' : 'Snowalnia';
  confirm(`Cofnąć ${item.numer} z ${kierunek} do listy zleceń?`, () => {
    saveUndoPoint(`Powrót z ${kierunek} do zleceń`);
    let zlecenie = item.zlecenieId ? state.zlecenia.find(z => z.id === item.zlecenieId) : null;
    if (zlecenie) {
      zlecenie.przekazaneDo = null;
      if (zlecenie.status === 'zrealizowane') zlecenie.status = 'w_trakcie';
      if (!zlecenie.terminRealizacji) zlecenie.terminRealizacji = item.dataPlanowana || '';
    } else {
      const zid = state.nextId.zlecenie++;
      zlecenie = {
        id: zid,
        numer: 'ZL-' + String(zid).padStart(3, '0') + '/' + new Date().getFullYear(),
        artId: item.artId,
        iloscM: item.metry || 0,
        status: 'w_trakcie',
        dataUtworzenia: today(),
        terminRealizacji: item.dataPlanowana || '',
        priorytet: 'standard',
        uwagi: item.uwagi || '',
        przekazaneDo: null,
      };
      state.zlecenia.unshift(zlecenie);
    }
    if (item.uwagi && !zlecenie.uwagi) zlecenie.uwagi = item.uwagi;
    const index = list.findIndex(x => x.id === id);
    if (index >= 0) list.splice(index, 1);
    renderView();
  }, 'To działanie możesz odwrócić przyciskiem "Cofnij ostatnią zmianę".');
};

function renderSnowalnioView() {
  const rows = state.snowalnia.map(s => {
    const art = getArtykul(s.artId);
    return `<tr>
      <td class="fw-600">${escHtml(s.numer)}</td>
      <td>${escHtml(art ? art.nazwa : '—')}</td>
      <td>${s.metry} m<br><span class="text-muted text-sm">${escHtml(splitSummary(s))}</span></td>
      <td>${statusSnHtml(s.status)}</td>
      <td>${formatDate(s.dataPlanowana)}</td>
      <td>${escHtml(s.uwagi) || '—'}</td>
      <td>${prepActions('snowalnia', s)}</td>
    </tr>`;
  }).join('');

  return `
    <div class="view-header">
      <h2>Snowalnia</h2>
      <p>Plan i realizacja snucia osnów</p>
    </div>
    <div class="card">
      <div class="section-header">
        <h3>Zlecenia snowalni (${state.snowalnia.length})</h3>
        <div class="btn-group">
          <button class="btn btn-secondary" onclick="undoLastChange()">↶ Cofnij ostatnią zmianę</button>
          <button class="btn btn-primary" onclick="addSnowalnio()">+ Nowe snucie</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Numer</th><th>Artykuł</th><th>Metry</th><th>Status</th><th>Data plan.</th><th>Uwagi</th><th>Akcje</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

window.addSnowalnio = function() {
  const artOpts = state.artykuly.filter(a => a.rodzajSnucia === 'taśmowe')
    .map(a => `<option value="${a.id}">${escHtml(a.nazwa)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Nowe zlecenie snowalni</h3>
    <div class="form-group"><label>Artykuł (taśmowe)</label><select class="form-control" id="fsn-art">${artOpts || '<option disabled>Brak artykułów taśmowych</option>'}</select></div>
    <div class="grid-2">
      <div class="form-group"><label>Metry</label><input class="form-control" type="number" id="fsn-metry" placeholder="np. 1200"></div>
      <div class="form-group"><label>Data planowana</label><input class="form-control" type="date" id="fsn-data"></div>
    </div>
    <div class="form-group"><label>Uwagi</label><input class="form-control" id="fsn-uwagi"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveSnowalnio()">Zapisz</button>
    </div>`);
};

window.saveSnowalnio = function() {
  saveUndoPoint('Dodanie zlecenia Snowalni');
  const id = state.nextId.snowalnia++;
  state.snowalnia.push({
    id, numer: 'SN-' + String(id).padStart(3,'0') + '/' + new Date().getFullYear(),
    artId: parseInt(qs('#fsn-art').value),
    metry: parseInt(qs('#fsn-metry').value) || 0,
    status: 'w_kolejce',
    dataPlanowana: qs('#fsn-data').value,
    uwagi: qs('#fsn-uwagi').value.trim(),
    splitLengths: [],
  });
  closeModal(); renderView();
};

window.editSnowalnio = function(id) {
  const s = state.snowalnia.find(x => x.id === id); if (!s) return;
  const artOpts = state.artykuly.map(a => `<option value="${a.id}" ${a.id===s.artId?'selected':''}>${escHtml(a.nazwa)}</option>`).join('');
  const splitValue = getSplitLengths(s).join(', ');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj ${escHtml(s.numer)}</h3>
    <div class="form-group"><label>Artykuł</label><select class="form-control" id="fsn-art">${artOpts}</select></div>
    <div class="grid-2">
      <div class="form-group"><label>Metry</label><input class="form-control" type="number" id="fsn-metry" value="${s.metry}"></div>
      <div class="form-group"><label>Data planowana</label><input class="form-control" type="date" id="fsn-data" value="${s.dataPlanowana||''}"></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="fsn-status">
        <option value="w_kolejce" ${s.status==='w_kolejce'?'selected':''}>W kolejce</option>
        <option value="w_trakcie" ${s.status==='w_trakcie'?'selected':''}>W trakcie</option>
        <option value="gotowe" ${s.status==='gotowe'?'selected':''}>Gotowe</option>
      </select>
    </div>
    <div class="form-group"><label>Uwagi</label><input class="form-control" id="fsn-uwagi" value="${escHtml(s.uwagi)}"></div>
    <div class="form-group"><label>Podział osnów (m)</label><input class="form-control" id="fsn-split" value="${escHtml(splitValue)}" placeholder="np. 400, 400, 300"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updateSnowalnio(${id})">Zapisz</button>
    </div>`);
};

window.updateSnowalnio = function(id) {
  const s = state.snowalnia.find(x => x.id === id); if (!s) return;
  saveUndoPoint('Edycja zlecenia Snowalni');
  s.artId  = parseInt(qs('#fsn-art').value);
  s.metry  = parseInt(qs('#fsn-metry').value) || s.metry;
  s.status = qs('#fsn-status').value;
  s.dataPlanowana = qs('#fsn-data').value;
  s.uwagi  = qs('#fsn-uwagi').value.trim();
  const splitRaw = qs('#fsn-split').value.trim();
  if (splitRaw) {
    const lengths = normalizeSplitLengths(splitRaw, splitTokenCount(splitRaw));
    if (!lengths) {
      alert('Podział osnów musi zawierać dodatnie długości.');
      return;
    }
    s.splitLengths = lengths;
    s.metry = lengths.reduce((sum, value) => sum + value, 0);
  } else {
    s.splitLengths = [];
  }
  closeModal(); renderView();
};

window.snowalniaTworzOsnowe = function(id) {
  const s = state.snowalnia.find(x => x.id === id); if (!s) return;
  const art = getArtykul(s.artId);
  if (!hasSplitPlan(s)) {
    openSplitPlanModal('snowalnia', id);
    return;
  }
  const lengths = getSplitLengths(s);
  confirm(
    `Przekazać ${lengths.length} osn. do magazynu?`,
    () => {
      saveUndoPoint('Przekazanie osnów ze Snowalni do magazynu');
      lengths.forEach((metry, idx) => {
        const osnId = state.nextId.osnowa++;
        state.osnowy.push({
          id: osnId,
          numer: 'O-' + String(osnId).padStart(3,'0') + '/' + new Date().getFullYear(),
          artId: s.artId,
          metry,
          statusPrzew: 'nieprzewleczona',
          lokalizacja: 'magazyn',
          krosnoid: null,
          statusPrzerobki: null,
          partia: s.numer,
          nrWPartii: idx + 1,
        });
      });
      state.snowalnia = state.snowalnia.filter(item => item.id !== id);
      closeModal(); renderView();
    },
    `Artykuł: ${art ? art.nazwa : '?'}, Podział: ${lengths.join(' / ')} m`
  );
};

// ============================================================
// VIEW: KLEJARNIA
// ============================================================
function renderKlejarnia() {
  const rows = state.klejarnia.map(k => {
    const art = getArtykul(k.artId);
    return `<tr>
      <td class="fw-600">${escHtml(k.numer)}</td>
      <td>${escHtml(art ? art.nazwa : '—')}</td>
      <td>${k.metry} m<br><span class="text-muted text-sm">${escHtml(splitSummary(k))}</span></td>
      <td>${statusSnHtml(k.status)}</td>
      <td>${formatDate(k.dataPlanowana)}</td>
      <td>${escHtml(k.uwagi) || '—'}</td>
      <td>${prepActions('klejarnia', k)}</td>
    </tr>`;
  }).join('');

  return `
    <div class="view-header">
      <h2>Klejarnia</h2>
      <p>Plan i realizacja klejenia osnów</p>
    </div>
    <div class="card">
      <div class="section-header">
        <h3>Zlecenia klejenia (${state.klejarnia.length})</h3>
        <div class="btn-group">
          <button class="btn btn-secondary" onclick="undoLastChange()">↶ Cofnij ostatnią zmianę</button>
          <button class="btn btn-primary" onclick="addKlejarnia()">+ Nowe klejenie</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Numer</th><th>Artykuł</th><th>Metry</th><th>Status</th><th>Data plan.</th><th>Uwagi</th><th>Akcje</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

window.addKlejarnia = function() {
  const artOpts = state.artykuly.filter(a => a.rodzajSnucia === 'zespołowe')
    .map(a => `<option value="${a.id}">${escHtml(a.nazwa)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Nowe zlecenie klejenia</h3>
    <div class="form-group"><label>Artykuł (zespołowe)</label><select class="form-control" id="fkl-art">${artOpts || '<option disabled>Brak artykułów zespołowych</option>'}</select></div>
    <div class="grid-2">
      <div class="form-group"><label>Metry</label><input class="form-control" type="number" id="fkl-metry"></div>
      <div class="form-group"><label>Data planowana</label><input class="form-control" type="date" id="fkl-data"></div>
    </div>
    <div class="form-group"><label>Uwagi</label><input class="form-control" id="fkl-uwagi"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveKlejarnia()">Zapisz</button>
    </div>`);
};

window.saveKlejarnia = function() {
  saveUndoPoint('Dodanie zlecenia Klejarni');
  const id = state.nextId.klejarnia++;
  state.klejarnia.push({
    id, numer: 'KL-' + String(id).padStart(3,'0') + '/' + new Date().getFullYear(),
    artId: parseInt(qs('#fkl-art').value),
    metry: parseInt(qs('#fkl-metry').value) || 0,
    status: 'w_kolejce',
    dataPlanowana: qs('#fkl-data').value,
    uwagi: qs('#fkl-uwagi').value.trim(),
    splitLengths: [],
  });
  closeModal(); renderView();
};

window.editKlejarnia = function(id) {
  const k = state.klejarnia.find(x => x.id === id); if (!k) return;
  const artOpts = state.artykuly.map(a => `<option value="${a.id}" ${a.id===k.artId?'selected':''}>${escHtml(a.nazwa)}</option>`).join('');
  const splitValue = getSplitLengths(k).join(', ');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj ${escHtml(k.numer)}</h3>
    <div class="form-group"><label>Artykuł</label><select class="form-control" id="fkl-art">${artOpts}</select></div>
    <div class="grid-2">
      <div class="form-group"><label>Metry</label><input class="form-control" type="number" id="fkl-metry" value="${k.metry}"></div>
      <div class="form-group"><label>Data planowana</label><input class="form-control" type="date" id="fkl-data" value="${k.dataPlanowana||''}"></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="fkl-status">
        <option value="w_kolejce" ${k.status==='w_kolejce'?'selected':''}>W kolejce</option>
        <option value="w_trakcie" ${k.status==='w_trakcie'?'selected':''}>W trakcie</option>
        <option value="gotowe" ${k.status==='gotowe'?'selected':''}>Gotowe</option>
      </select>
    </div>
    <div class="form-group"><label>Uwagi</label><input class="form-control" id="fkl-uwagi" value="${escHtml(k.uwagi)}"></div>
    <div class="form-group"><label>Podział osnów (m)</label><input class="form-control" id="fkl-split" value="${escHtml(splitValue)}" placeholder="np. 400, 400, 300"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updateKlejarnia(${id})">Zapisz</button>
    </div>`);
};

window.updateKlejarnia = function(id) {
  const k = state.klejarnia.find(x => x.id === id); if (!k) return;
  saveUndoPoint('Edycja zlecenia Klejarni');
  k.artId = parseInt(qs('#fkl-art').value);
  k.metry = parseInt(qs('#fkl-metry').value) || k.metry;
  k.status = qs('#fkl-status').value;
  k.dataPlanowana = qs('#fkl-data').value;
  k.uwagi  = qs('#fkl-uwagi').value.trim();
  const splitRaw = qs('#fkl-split').value.trim();
  if (splitRaw) {
    const lengths = normalizeSplitLengths(splitRaw, splitTokenCount(splitRaw));
    if (!lengths) {
      alert('Podział osnów musi zawierać dodatnie długości.');
      return;
    }
    k.splitLengths = lengths;
    k.metry = lengths.reduce((sum, value) => sum + value, 0);
  } else {
    k.splitLengths = [];
  }
  closeModal(); renderView();
};

window.klejarniaTworzOsnowe = function(id) {
  const k = state.klejarnia.find(x => x.id === id); if (!k) return;
  const art = getArtykul(k.artId);
  if (!hasSplitPlan(k)) {
    openSplitPlanModal('klejarnia', id);
    return;
  }
  const lengths = getSplitLengths(k);
  confirm(
    `Przekazać ${lengths.length} osn. do magazynu?`,
    () => {
      saveUndoPoint('Przekazanie osnów z Klejarni do magazynu');
      lengths.forEach((metry, idx) => {
        const osnId = state.nextId.osnowa++;
        state.osnowy.push({
          id: osnId,
          numer: 'O-' + String(osnId).padStart(3,'0') + '/' + new Date().getFullYear(),
          artId: k.artId,
          metry,
          statusPrzew: 'nieprzewleczona',
          lokalizacja: 'magazyn',
          krosnoid: null,
          statusPrzerobki: null,
          partia: k.numer,
          nrWPartii: idx + 1,
        });
      });
      state.klejarnia = state.klejarnia.filter(item => item.id !== id);
      closeModal(); renderView();
    },
    `Artykuł: ${art ? art.nazwa : '?'}, Podział: ${lengths.join(' / ')} m`
  );
};

// ============================================================
// VIEW: MAGAZYN OSNÓW
// ============================================================
function renderMagazyn() {
  const inMag = state.osnowy.filter(o => o.lokalizacja === 'magazyn');
  const rows = inMag.map(o => {
    const art = getArtykul(o.artId);
    const przew = o.statusPrzew === 'przewleczona'
      ? `<span class="badge badge-success">Przewleczona</span>`
      : `<span class="badge badge-grey">Nieprzewleczona</span>`;
    return `<tr>
      <td class="fw-600">${escHtml(o.numer)}</td>
      <td>${escHtml(getOsnowaName(o))}</td>
      <td>${escHtml(art ? art.nazwa : '—')}</td>
      <td>${o.metry != null ? o.metry + ' m' : '—'}</td>
      <td>${przew}</td>
      <td><div class="btn-group">
        ${o.statusPrzew === 'nieprzewleczona'
          ? `<button class="btn btn-sm btn-primary" onclick="sendToPrzewlekalnia(${o.id})">→ Przewlekalnia</button>`
          : `<button class="btn btn-sm btn-success" onclick="magazynAssignToLoom(${o.id})">→ Krosno</button>`}
        <button class="btn btn-sm btn-secondary" onclick="editOsnowa(${o.id})">Edytuj</button>
        <button class="btn btn-sm btn-danger" onclick="deleteOsnowa(${o.id})">Usuń</button>
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-state">Brak osnów w magazynie</td></tr>';

  return `
    <div class="view-header">
      <h2>Magazyn osnów</h2>
      <p>Osnowy oczekujące na przewleczenie lub założenie na krosno</p>
    </div>
    <div class="card" style="padding:14px 20px">
      <div class="flex gap-12">
        <div class="info-item"><div class="lbl">Łącznie</div><div class="val" style="font-size:1.4rem">${inMag.length}</div></div>
        <div class="info-item"><div class="lbl">Przewleczone</div><div class="val" style="font-size:1.4rem;color:var(--success)">${inMag.filter(o => o.statusPrzew==='przewleczona').length}</div></div>
        <div class="info-item"><div class="lbl">Nieprzewleczone</div><div class="val" style="font-size:1.4rem;color:var(--text-muted)">${inMag.filter(o => o.statusPrzew==='nieprzewleczona').length}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="section-header">
        <h3>Stany magazynowe</h3>
        <button class="btn btn-primary" onclick="addManualOsnowa()">+ Ręczna osnowa</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Numer</th><th>Nazwa osnowy</th><th>Artykuł</th><th>Metry</th><th>Przewleczenie</th><th>Akcje</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function getOsnowaStageOptions(selectedValue) {
  const options = [
    { value: 'magazyn:nieprzewleczona', label: 'Magazyn – nieprzewleczona' },
    { value: 'magazyn:przewleczona', label: 'Magazyn – przewleczona' },
    { value: 'przewlekalnia:w_kolejce', label: 'Przewlekalnia – w kolejce' },
    { value: 'przewlekalnia:w_przygotowaniu', label: 'Przewlekalnia – w przygotowaniu' },
    { value: 'przewlekalnia:przewleczona', label: 'Przewlekalnia – przewleczona' },
  ];
  return options.map(option =>
    `<option value="${option.value}" ${option.value === selectedValue ? 'selected' : ''}>${option.label}</option>`
  ).join('');
}

function getOsnowaStageValue(osnowa) {
  if (osnowa.lokalizacja === 'przewlekalnia' && osnowa.statusPrzerobki) {
    return `przewlekalnia:${osnowa.statusPrzerobki}`;
  }
  return `magazyn:${osnowa.statusPrzew || 'nieprzewleczona'}`;
}

function readOsnowaStage() {
  const [lokalizacja, status] = qs('#fo-stage').value.split(':');
  return { lokalizacja, status };
}

window.addManualOsnowa = function() {
  const artOpts = state.artykuly.map(a => `<option value="${a.id}">${escHtml(a.nazwa)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Ręczne dodanie osnowy</h3>
    <p class="text-muted text-sm mb-16">Dodaj osnowę bez przechodzenia przez zlecenie, snowalnię lub klejarnię.</p>
    <div class="grid-2">
      <div class="form-group"><label>Numer (opcjonalnie)</label><input class="form-control" id="fo-numer" placeholder="automatycznie jeśli puste"></div>
      <div class="form-group"><label>Artykuł</label><select class="form-control" id="fo-art">${artOpts}</select></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Metry</label><input class="form-control" type="number" id="fo-metry-manual" placeholder="np. 850"></div>
      <div class="form-group"><label>Stan początkowy</label><select class="form-control" id="fo-stage">${getOsnowaStageOptions('magazyn:nieprzewleczona')}</select></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveManualOsnowa()">Zapisz</button>
    </div>`);
};

window.saveManualOsnowa = function() {
  const artId = parseInt(qs('#fo-art').value, 10);
  const metry = parseInt(qs('#fo-metry-manual').value, 10);
  if (!Number.isFinite(metry) || metry <= 0) {
    alert('Podaj dodatnią długość osnowy.');
    return;
  }

  saveUndoPoint('Ręczne dodanie osnowy');
  const id = state.nextId.osnowa++;
  const { lokalizacja, status } = readOsnowaStage();
  state.osnowy.unshift({
    id,
    numer: qs('#fo-numer').value.trim() || 'O-' + String(id).padStart(3, '0') + '/' + new Date().getFullYear(),
    artId,
    metry,
    statusPrzew: status === 'przewleczona' ? 'przewleczona' : 'nieprzewleczona',
    lokalizacja,
    krosnoid: null,
    statusPrzerobki: lokalizacja === 'przewlekalnia' ? status : null,
    partia: 'Ręczne',
    nrWPartii: null,
  });
  closeModal();
  renderView();
};

window.editOsnowa = function(id) {
  const o = getOsnowa(id); if (!o) return;
  const artOpts = state.artykuly.map(a => `<option value="${a.id}" ${a.id === o.artId ? 'selected' : ''}>${escHtml(a.nazwa)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj osnowę ${escHtml(o.numer)}</h3>
    <div class="grid-2">
      <div class="form-group"><label>Numer</label><input class="form-control" id="fo-numer" value="${escHtml(o.numer)}"></div>
      <div class="form-group"><label>Artykuł</label><select class="form-control" id="fo-art">${artOpts}</select></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Metry</label><input class="form-control" type="number" id="fo-metry-manual" value="${o.metry != null ? o.metry : ''}"></div>
      <div class="form-group"><label>Stan</label><select class="form-control" id="fo-stage">${getOsnowaStageOptions(getOsnowaStageValue(o))}</select></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updateOsnowa(${id})">Zapisz</button>
    </div>`);
};

window.updateOsnowa = function(id) {
  const o = getOsnowa(id); if (!o) return;
  const numer = qs('#fo-numer').value.trim();
  const metry = parseInt(qs('#fo-metry-manual').value, 10);
  if (!numer) {
    alert('Podaj numer osnowy.');
    return;
  }
  if (!Number.isFinite(metry) || metry <= 0) {
    alert('Podaj dodatnią długość osnowy.');
    return;
  }

  saveUndoPoint('Edycja osnowy');
  const { lokalizacja, status } = readOsnowaStage();
  o.numer = numer;
  o.artId = parseInt(qs('#fo-art').value, 10);
  o.metry = metry;
  o.lokalizacja = lokalizacja;
  o.statusPrzew = status === 'przewleczona' ? 'przewleczona' : 'nieprzewleczona';
  o.statusPrzerobki = lokalizacja === 'przewlekalnia' ? status : null;

  if (o.krosnoid != null && lokalizacja !== 'krosno') {
    const loom = getKrosno(o.krosnoid);
    if (loom && loom.osnowId === o.id) {
      loom.osnowId = null;
      loom.artIdOverride = null;
    }
    o.krosnoid = null;
  }

  closeModal();
  renderView();
};

window.deleteOsnowa = function(id) {
  const o = getOsnowa(id); if (!o) return;
  confirm(`Usunąć osnowę ${o.numer}?`, () => {
    saveUndoPoint('Usunięcie osnowy');
    if (o.krosnoid != null) {
      const loom = getKrosno(o.krosnoid);
      if (loom && loom.osnowId === o.id) {
        loom.osnowId = null;
        loom.artIdOverride = null;
      }
    }
    state.osnowy = state.osnowy.filter(item => item.id !== id);
    closeModal();
    renderView();
  });
};

window.sendToPrzewlekalnia = function(id) {
  const o = getOsnowa(id); if (!o) return;
  confirm(
    `Wysłać osnowę ${o.numer} do przewlekalni?`,
    () => {
      saveUndoPoint('Przekazanie osnowy do przewlekalni');
      o.lokalizacja = 'przewlekalnia';
      o.statusPrzerobki = 'w_kolejce';
      closeModal(); renderView();
    },
    `Osnowa trafi do kolejki w przewlekalni.`
  );
};

window.magazynAssignToLoom = function(id) {
  const o = getOsnowa(id); if (!o) return;
  const freeLooms = state.krosna.filter(k => k.osnowId === null);
  if (!freeLooms.length) { alert('Brak wolnych krosien.'); return; }
  const opts = freeLooms.map(k => `<option value="${k.id}">${escHtml(k.numer)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Przypisz osnowę ${escHtml(o.numer)} do krosna</h3>
    <div class="form-group"><label>Wybierz krosno</label>
      <select class="form-control" id="fm-krosno">${opts}</select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="magazynDoLoomConfirm(${id})">Dalej</button>
    </div>`);
};

window.magazynDoLoomConfirm = function(osnId) {
  const krosnoid = parseInt(qs('#fm-krosno').value);
  const o = getOsnowa(osnId);
  const k = getKrosno(krosnoid);
  confirm(
    `Założyć osnowę ${o.numer} na krosno ${k.numer}?`,
    () => {
      saveUndoPoint('Założenie osnowy z magazynu na krosno');
      k.osnowId = osnId;
      k.artIdOverride = null;
      o.lokalizacja = 'krosno';
      o.krosnoid    = krosnoid;
      o.statusPrzerobki = null;
      addKrosnoHistory(krosnoid, 'zalozenie_osnowy', `Założono osnowę ${o.numer} – ${getOsnowaName(o)}.`);
      closeModal(); renderView();
    }
  );
};

// ============================================================
// VIEW: PRZEWLEKALNIA
// ============================================================
function renderPrzewlekalnia() {
  const inPrzew = state.osnowy.filter(o => o.lokalizacja === 'przewlekalnia');

  const sections = [
    { key: 'w_kolejce',       label: 'W kolejce',       badge: 'badge-grey' },
    { key: 'w_przygotowaniu', label: 'W przygotowaniu', badge: 'badge-warning' },
    { key: 'przewleczona',    label: 'Przewleczone',    badge: 'badge-success' },
  ];

  const sectionHtml = sections.map(sec => {
    const items = inPrzew.filter(o => o.statusPrzerobki === sec.key);
    if (!items.length) return '';
    const rows = items.map(o => {
      const art = getArtykul(o.artId);
      const actions = [];
      if (sec.key === 'w_kolejce')
        actions.push(`<button class="btn btn-sm btn-warning" onclick="przewZmienStatus(${o.id},'w_przygotowaniu')">→ W przygotowaniu</button>`);
      if (sec.key === 'w_przygotowaniu')
        actions.push(`<button class="btn btn-sm btn-success" onclick="przewZmienStatus(${o.id},'przewleczona')">→ Przewleczona</button>`);
      if (sec.key === 'przewleczona') {
        actions.push(`<button class="btn btn-sm btn-primary" onclick="przewDoMagazynu(${o.id})">→ Magazyn</button>`);
        actions.push(`<button class="btn btn-sm btn-success" onclick="przewDoKrosna(${o.id})">→ Krosno</button>`);
      }
      actions.push(`<button class="btn btn-sm btn-secondary" onclick="editOsnowa(${o.id})">Edytuj</button>`);
      return `<tr>
        <td class="fw-600">${escHtml(o.numer)}</td>
        <td>${escHtml(getOsnowaName(o))}</td>
        <td>${escHtml(art ? art.nazwa : '—')}</td>
        <td>${o.metry != null ? o.metry + ' m' : '—'}</td>
        <td><div class="btn-group">${actions.join('')}</div></td>
      </tr>`;
    }).join('');

    return `
      <div class="card">
        <div class="section-header">
          <h3>${sec.label} <span class="badge ${sec.badge}">${items.length}</span></h3>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Numer</th><th>Nazwa</th><th>Artykuł</th><th>Metry</th><th>Akcje</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="view-header">
      <h2>Przewlekalnia</h2>
      <p>Przewleczenie osnów przez płochę i łamacze</p>
    </div>
    <div class="card" style="padding:14px 20px">
      <div class="flex gap-12">
        ${sections.map(s => {
          const cnt = inPrzew.filter(o => o.statusPrzerobki === s.key).length;
          return `<div class="info-item"><div class="lbl">${s.label}</div><div class="val" style="font-size:1.4rem">${cnt}</div></div>`;
        }).join('')}
      </div>
    </div>
    ${sectionHtml || '<div class="empty-state">Brak osnów w przewlekalni</div>'}`;
}

window.przewZmienStatus = function(id, newStatus) {
  const o = getOsnowa(id); if (!o) return;
  const labels = { w_przygotowaniu: 'W przygotowaniu', przewleczona: 'Przewleczona' };
  confirm(
    `Zmienić status osnowy ${o.numer} na "${labels[newStatus]}"?`,
    () => {
      saveUndoPoint('Zmiana statusu osnowy w przewlekalni');
      o.statusPrzerobki = newStatus;
      if (newStatus === 'przewleczona') o.statusPrzew = 'przewleczona';
      closeModal(); renderView();
    }
  );
};

window.przewDoMagazynu = function(id) {
  const o = getOsnowa(id); if (!o) return;
  confirm(
    `Wysłać osnowę ${o.numer} z powrotem do magazynu?`,
    () => {
      saveUndoPoint('Powrót osnowy do magazynu');
      o.lokalizacja = 'magazyn';
      o.statusPrzerobki = null;
      closeModal(); renderView();
    }
  );
};

window.przewDoKrosna = function(id) {
  const o = getOsnowa(id); if (!o) return;
  const freeLooms = state.krosna.filter(k => k.osnowId === null);
  if (!freeLooms.length) { alert('Brak wolnych krosien.'); return; }
  const opts = freeLooms.map(k => `<option value="${k.id}">${escHtml(k.numer)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Przypisz osnowę ${escHtml(o.numer)} do krosna</h3>
    <div class="form-group"><label>Wybierz krosno</label>
      <select class="form-control" id="fpk-krosno">${opts}</select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="przewDoKrosnaConfirm(${id})">Dalej</button>
    </div>`);
};

window.przewDoKrosnaConfirm = function(osnId) {
  const krosnoid = parseInt(qs('#fpk-krosno').value);
  const o = getOsnowa(osnId);
  const k = getKrosno(krosnoid);
  confirm(
    `Założyć osnowę ${o.numer} na krosno ${k.numer}?`,
    () => {
      saveUndoPoint('Założenie osnowy z przewlekalni na krosno');
      k.osnowId = osnId;
      k.artIdOverride = null;
      o.lokalizacja = 'krosno';
      o.krosnoid    = krosnoid;
      o.statusPrzerobki = null;
      addKrosnoHistory(krosnoid, 'zalozenie_osnowy', `Założono osnowę ${o.numer} – ${getOsnowaName(o)}.`);
      closeModal(); renderView();
    }
  );
};

// ============================================================
// VIEW: TKALNIA
// ============================================================
function lampClass(status) {
  return { pracuje: 'lamp-pracuje', awaria: 'lamp-awaria', zatrzymane: 'lamp-zatrzymane', wiazanie: 'lamp-wiazanie', brak: 'lamp-brak' }[status] || 'lamp-brak';
}

function lampTitle(status) {
  return { pracuje: 'Pracuje', awaria: 'Awaria', zatrzymane: 'Zatrzymane', wiazanie: 'Wiązanie/Przeróbka', brak: 'Brak statusu' }[status] || '—';
}

function loomWidth(szerokoscCm) {
  // map 150–230 cm → 110–162 px
  return Math.round(110 + (szerokoscCm - 150) * 0.65);
}

function renderLoomBlock(k) {
  const typ   = getLoomType(k.typId);
  const art   = getKrosnoArtykul(k);
  const color = typ ? typ.kolor : '#666';
  const w     = loomWidth(k.szerokoscCm);
  const artName = art ? art.nazwa : null;
  const isOverride = k.artIdOverride !== null;

  return `
    <div class="loom-block" style="background:${color};width:${w}px"
         draggable="true"
         data-krosno="${k.id}" title="${escHtml(lampTitle(k.status))} | ${escHtml(k.numer)}">
      <div>
        <div class="loom-header">
          <div class="loom-num">${escHtml(k.numer)}</div>
          <span class="status-lamp ${lampClass(k.status)}" title="${escHtml(lampTitle(k.status))}"></span>
        </div>
        <div class="loom-kind">${escHtml(k.rodzaj)}</div>
      </div>
      <div>
        ${artName
          ? `<div class="loom-article">${isOverride ? '✏ ' : ''}${escHtml(artName)}</div>`
          : `<div class="loom-no-article">brak osnowy</div>`}
      </div>
    </div>`;
}

function renderTkalnia() {
  const loomHtml = state.krosna.map(k => renderLoomBlock(k)).join('');

  const legendHtml = state.typyKrosien.map(t => `
    <div class="legend-item">
      <div class="legend-color" style="background:${t.kolor}"></div>
      <span>${escHtml(t.nazwa)}</span>
    </div>`).join('');

  const statusLegend = [
    { cls: 'lamp-pracuje',    lbl: 'Pracuje' },
    { cls: 'lamp-awaria',     lbl: 'Awaria' },
    { cls: 'lamp-zatrzymane', lbl: 'Zatrzymane' },
    { cls: 'lamp-wiazanie',   lbl: 'Wiązanie/Przeróbka' },
    { cls: 'lamp-brak',       lbl: 'Brak statusu' },
  ].map(s => `
    <div class="legend-item">
      <span class="status-lamp ${s.cls}"></span>
      <span>${s.lbl}</span>
    </div>`).join('');

  const counts = {
    pracuje:    state.krosna.filter(k => k.status === 'pracuje').length,
    awaria:     state.krosna.filter(k => k.status === 'awaria').length,
    zatrzymane: state.krosna.filter(k => k.status === 'zatrzymane').length,
    wiazanie:   state.krosna.filter(k => k.status === 'wiazanie').length,
    brak:       state.krosna.filter(k => k.status === 'brak').length,
  };

  return `
    <div class="view-header">
      <h2>Tkalnia – Plan hali</h2>
      <p>${state.krosna.length} krosien • kliknij krosno aby zobaczyć szczegóły • przeciągnij blok, aby zmienić układ</p>
    </div>
    <div class="card" style="padding:14px 20px;margin-bottom:12px">
      <div class="flex gap-12" style="flex-wrap:wrap">
        <div class="info-item"><div class="lbl">Pracuje</div><div class="val" style="color:var(--success);font-size:1.3rem">${counts.pracuje}</div></div>
        <div class="info-item"><div class="lbl">Awaria</div><div class="val" style="color:var(--danger);font-size:1.3rem">${counts.awaria}</div></div>
        <div class="info-item"><div class="lbl">Zatrzymane</div><div class="val" style="color:var(--warning);font-size:1.3rem">${counts.zatrzymane}</div></div>
        <div class="info-item"><div class="lbl">Wiązanie</div><div class="val" style="color:var(--info);font-size:1.3rem">${counts.wiazanie}</div></div>
        <div class="info-item"><div class="lbl">Brak statusu</div><div class="val" style="color:var(--grey);font-size:1.3rem">${counts.brak}</div></div>
      </div>
      <div class="btn-group mt-12">
        <button class="btn btn-secondary" onclick="undoLastChange()">↶ Cofnij ostatnią zmianę</button>
        <button class="btn btn-primary" onclick="addKrosno()">+ Dodaj krosno</button>
      </div>
    </div>
    <div class="card">
      <div style="margin-bottom:10px">
        <div class="loom-legend">${legendHtml}</div>
        <div class="loom-legend" style="margin-top:6px">${statusLegend}</div>
      </div>
      <div class="loom-hall" id="loom-hall">
        ${loomHtml}
      </div>
    </div>
    <!-- Loom detail panel (slide-in) -->
    <div id="loom-detail-panel" class="worker-detail"></div>`;
}

function openLoomDetail(id) {
  const k = getKrosno(id); if (!k) return;
  const typ  = getLoomType(k.typId);
  const osnowa = k.osnowId ? getOsnowa(k.osnowId) : null;
  const art  = getKrosnoArtykul(k);
  const artOsnowy = osnowa ? getArtykul(osnowa.artId) : null;
  const isOverride = k.artIdOverride !== null;

  const statusOpts = ['pracuje','awaria','zatrzymane','wiazanie','brak'].map(s =>
    `<option value="${s}" ${k.status===s?'selected':''}>${lampTitle(s)}</option>`).join('');

  const history = (state.historiaKrosien[k.id] || []).slice(0, 15);
  const histHtml = history.length
    ? history.map(h => `
        <div class="timeline-item ttype-${h.typ}">
          <div class="timeline-date">${formatDate(h.data)}</div>
          <div class="timeline-body">
            <div class="timeline-type">${h.typ.replace(/_/g,' ')}</div>
            <div class="timeline-opis">${escHtml(h.opis)}</div>
            <div class="timeline-user">${escHtml(h.uzytkownik)}</div>
          </div>
        </div>`).join('')
    : '<p class="text-muted text-sm">Brak historii</p>';

  const panelHtml = `
    <button class="close-panel" onclick="closeLoomDetail()">×</button>
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <span class="status-lamp ${lampClass(k.status)}"></span>
        <strong style="font-size:1.1rem">${escHtml(k.numer)}</strong>
        <span class="badge badge-grey">${escHtml(typ ? typ.nazwa : '—')}</span>
      </div>
      <div class="flex gap-6" style="margin-top:6px">
        <span class="tag tag-${k.rodzaj}">${escHtml(k.rodzaj)}</span>
        <span class="badge badge-grey">${k.szerokoscCm} cm</span>
        ${isOverride ? '<span class="badge badge-purple">Ręczny artykuł</span>' : ''}
      </div>
    </div>

    <!-- Status change -->
    <div class="detail-section">
      <div class="detail-section-title">Status krosna</div>
      <div class="flex gap-8 items-center">
        <select class="form-control" id="kdetail-status" style="max-width:180px">${statusOpts}</select>
        <button class="btn btn-sm btn-primary" onclick="saveKrosnoStatus(${k.id})">Zapisz</button>
        <button class="btn btn-sm btn-secondary" onclick="editKrosno(${k.id})">Edytuj krosno</button>
        <button class="btn btn-sm btn-danger" onclick="deleteKrosno(${k.id})">Usuń krosno</button>
      </div>
    </div>

    <!-- Osnowa section -->
    <div class="detail-section">
      <div class="detail-section-title">Dane osnowy</div>
      ${osnowa ? `
        <div class="info-grid">
          <div class="info-item"><div class="lbl">Numer</div><div class="val">${escHtml(osnowa.numer)}</div></div>
          <div class="info-item"><div class="lbl">Nazwa</div><div class="val">${escHtml(getOsnowaName(osnowa))}</div></div>
          <div class="info-item"><div class="lbl">Metry</div><div class="val">${osnowa.metry != null ? osnowa.metry + ' m' : '—'}</div></div>
          <div class="info-item"><div class="lbl">Przewleczenie</div><div class="val">
            ${osnowa.statusPrzew === 'przewleczona'
              ? '<span class="badge badge-success">Przewleczona</span>'
              : '<span class="badge badge-grey">Nieprzewleczona</span>'}
          </div></div>
        </div>
        <div class="btn-group mt-8">
          <button class="btn btn-sm btn-danger" onclick="zdejmijOsnowe(${k.id})">Zdejmij osnowę</button>
        </div>` : `
        <p class="text-muted text-sm">Brak osnowy na krośnie.</p>
        <button class="btn btn-sm btn-primary mt-8" onclick="zalozOsnowe(${k.id})">Załóż osnowę</button>`}
    </div>

    <!-- Article section -->
    <div class="detail-section">
      <div class="detail-section-title">Dane artykułu</div>
      ${art ? `
        <div class="info-grid">
          <div class="info-item"><div class="lbl">Artykuł</div><div class="val">${escHtml(art.nazwa)}</div></div>
          <div class="info-item"><div class="lbl">Wątki/cm</div><div class="val">${art.watkiNaCm}</div></div>
          <div class="info-item"><div class="lbl">Rozpinka</div><div class="val">${rozpinkaLabel(art.rozpinka)}</div></div>
          <div class="info-item"><div class="lbl">Rodzaj snucia</div><div class="val">${escHtml(art.rodzajSnucia)}</div></div>
          <div class="info-item"><div class="lbl">Szerokość tkaniny</div><div class="val">${art.szerokoscTkaniny || '—'} cm</div></div>
          <div class="info-item"><div class="lbl">Uwagi</div><div class="val">${escHtml(art.uwagi) || '—'}</div></div>
          ${isOverride ? `<div class="info-item"><div class="lbl">Źródło</div><div class="val"><span class="badge badge-purple">Ręczna zmiana</span></div></div>` : ''}
        </div>
        <div class="btn-group mt-8">
          <button class="btn btn-sm btn-warning" onclick="zmienArtykul(${k.id})">Zmień artykuł</button>
          ${isOverride ? `<button class="btn btn-sm btn-secondary" onclick="resetArtykul(${k.id})">Przywróć z osnowy</button>` : ''}
        </div>` : `
        <p class="text-muted text-sm">Brak danych artykułu.</p>
        ${osnowa ? `<button class="btn btn-sm btn-warning mt-8" onclick="zmienArtykul(${k.id})">Ustaw artykuł</button>` : ''}`}
    </div>

    <!-- History -->
    <div class="detail-section">
      <div class="detail-section-title">Historia zmian</div>
      <div class="timeline">${histHtml}</div>
    </div>`;

  const panel = qs('#loom-detail-panel');
  panel.innerHTML = panelHtml;
  panel.classList.add('open');
}

window.closeLoomDetail = function() {
  qs('#loom-detail-panel').classList.remove('open');
};

window.saveKrosnoStatus = function(id) {
  const k = getKrosno(id); if (!k) return;
  const newStatus = qs('#kdetail-status').value;
  const old = k.status;
  if (old === newStatus) return;
  confirm(
    `Zmienić status krosna ${k.numer} na "${lampTitle(newStatus)}"?`,
    () => {
      saveUndoPoint('Zmiana statusu krosna');
      k.status = newStatus;
      addKrosnoHistory(id, 'zmiana_statusu', `Status zmieniony: ${lampTitle(old)} → ${lampTitle(newStatus)}.`);
      renderView(); openLoomDetail(id);
    }
  );
};

window.zdejmijOsnowe = function(krosnoid) {
  const k = getKrosno(krosnoid); if (!k || !k.osnowId) return;
  const o = getOsnowa(k.osnowId); if (!o) return;

  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Zdejmij osnowę z krosna ${escHtml(k.numer)}</h3>
    <p class="text-muted text-sm mb-16">Osnowa: <strong>${escHtml(o.numer)}</strong> – ${escHtml(getOsnowaName(o))}</p>
    <div class="form-group">
      <label>Pozostałe metry (lub puste jeśli nieznane)</label>
      <input class="form-control" type="number" id="fo-metry" value="${o.metry != null ? o.metry : ''}" placeholder="Pozostaw puste jeśli nieznane">
    </div>
    <div class="form-group">
      <label>Status przewleczenia po zdjęciu</label>
      <select class="form-control" id="fo-przew">
        <option value="przewleczona" ${o.statusPrzew==='przewleczona'?'selected':''}>Przewleczona</option>
        <option value="nieprzewleczona" ${o.statusPrzew==='nieprzewleczona'?'selected':''}>Nieprzewleczona</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-danger" onclick="zdejmijOsnoweConfirm(${krosnoid})">Zdejmij i zwróć do magazynu</button>
    </div>`);
};

window.zdejmijOsnoweConfirm = function(krosnoid) {
  const k = getKrosno(krosnoid); if (!k) return;
  const osnId = k.osnowId;
  const o = getOsnowa(osnId); if (!o) return;
  const metrVal = qs('#fo-metry').value.trim();
  const newMetry = metrVal !== '' ? parseInt(metrVal) : null;
  const newPrzew = qs('#fo-przew').value;

  confirm(
    `Potwierdzenie: zdjąć osnowę ${o.numer} z krosna ${k.numer} i zwrócić do magazynu?`,
    () => {
      saveUndoPoint('Zdjęcie osnowy z krosna');
      const metrStr = newMetry != null ? `${newMetry} m` : 'nieznane';
      addKrosnoHistory(krosnoid, 'zdjecie_osnowy',
        `Zdjęto osnowę ${o.numer} (${metrStr} pozostałych). Osnowa zwrócona do magazynu.`);
      o.metry = newMetry;
      o.statusPrzew = newPrzew;
      o.lokalizacja = 'magazyn';
      o.krosnoid    = null;
      o.statusPrzerobki = null;
      k.osnowId = null;
      k.artIdOverride = null;
      closeModal(); renderView(); openLoomDetail(krosnoid);
    }
  );
};

window.zalozOsnowe = function(krosnoid) {
  const available = state.osnowy.filter(o => o.lokalizacja === 'magazyn' && o.statusPrzew === 'przewleczona');
  if (!available.length) {
    alert('Brak przewleczonych osnów w magazynie. Wyślij osnowę do przewlekalni lub przypisz z magazynu.');
    return;
  }
  const opts = available.map(o => {
    const art = getArtykul(o.artId);
    return `<option value="${o.id}">${escHtml(o.numer)} – ${escHtml(art ? art.nazwa : '?')} (${o.metry != null ? o.metry + 'm' : '?'})</option>`;
  }).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Załóż osnowę na krosno ${escHtml(getKrosno(krosnoid).numer)}</h3>
    <div class="form-group"><label>Wybierz osnowę</label>
      <select class="form-control" id="fza-osnowa">${opts}</select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="zalozOsnoweConfirm(${krosnoid})">Dalej</button>
    </div>`);
};

window.zalozOsnoweConfirm = function(krosnoid) {
  const osnId = parseInt(qs('#fza-osnowa').value);
  const o = getOsnowa(osnId);
  const k = getKrosno(krosnoid);
  confirm(
    `Założyć osnowę ${o.numer} na krosno ${k.numer}?`,
    () => {
      saveUndoPoint('Założenie osnowy na krosno');
      k.osnowId = osnId;
      k.artIdOverride = null;
      o.lokalizacja = 'krosno';
      o.krosnoid    = krosnoid;
      addKrosnoHistory(krosnoid, 'zalozenie_osnowy', `Założono osnowę ${o.numer} – ${getOsnowaName(o)}.`);
      closeModal(); renderView(); openLoomDetail(krosnoid);
    },
    `Artykuł zostanie pobrany z osnowy: ${getOsnowaName(o)}.`
  );
};

window.zmienArtykul = function(krosnoid) {
  const k = getKrosno(krosnoid); if (!k) return;
  const current = getKrosnoArtykul(k);
  const opts = state.artykuly.map(a =>
    `<option value="${a.id}" ${(current && a.id===current.id)?'selected':''}>${escHtml(a.nazwa)}</option>`).join('');
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Ręczna zmiana artykułu – ${escHtml(k.numer)}</h3>
    <p class="text-muted text-sm mb-16">Aktualny artykuł: <strong>${escHtml(current ? current.nazwa : '—')}</strong></p>
    <div class="form-group"><label>Nowy artykuł</label>
      <select class="form-control" id="fca-art">${opts}</select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-warning" onclick="zmienArtykulConfirm(${krosnoid})">Zmień artykuł</button>
    </div>`);
};

window.zmienArtykulConfirm = function(krosnoid) {
  const newArtId = parseInt(qs('#fca-art').value);
  const k = getKrosno(krosnoid);
  const oldArt = getKrosnoArtykul(k);
  const newArt = getArtykul(newArtId);
  confirm(
    `Ręcznie zmienić artykuł na "${newArt ? newArt.nazwa : '?'}"?`,
    () => {
      saveUndoPoint('Ręczna zmiana artykułu krosna');
      k.artIdOverride = newArtId;
      addKrosnoHistory(krosnoid, 'zmiana_artykulu',
        `Ręczna zmiana artykułu: ${oldArt ? oldArt.nazwa : '—'} → ${newArt ? newArt.nazwa : '—'}.`);
      closeModal(); renderView(); openLoomDetail(krosnoid);
    },
    `Ta zmiana zostanie zapisana w historii krosna.`
  );
};

window.resetArtykul = function(krosnoid) {
  const k = getKrosno(krosnoid); if (!k) return;
  const osnowa = k.osnowId ? getOsnowa(k.osnowId) : null;
  const osnArt = osnowa ? getArtykul(osnowa.artId) : null;
  confirm(
    `Przywrócić artykuł z osnowy?`,
    () => {
      saveUndoPoint('Przywrócenie artykułu z osnowy');
      k.artIdOverride = null;
      addKrosnoHistory(krosnoid, 'zmiana_artykulu', `Przywrócono artykuł z osnowy: ${osnArt ? osnArt.nazwa : '—'}.`);
      closeModal(); renderView(); openLoomDetail(krosnoid);
    },
    `Artykuł zostanie ustawiony na: ${osnArt ? osnArt.nazwa : '—'}.`
  );
};

function renderUstawienia() {
  const rows = state.typyKrosien.map(t => `
    <tr>
      <td class="fw-600">${escHtml(t.nazwa)}</td>
      <td><span class="color-chip" style="background:${t.kolor}"></span> ${escHtml(t.kolor)}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary" onclick="editTypKrosna(${t.id})">Edytuj</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTypKrosna(${t.id})">Usuń</button>
        </div>
      </td>
    </tr>`).join('');

  return `
    <div class="view-header">
      <h2>Ustawienia</h2>
      <p>Zachowane ustawienia prototypu z minimalnym rozszerzeniem o typy krosien.</p>
    </div>
    <div class="tabs">
      <button class="tab-btn active" type="button">Typy krosien</button>
    </div>
    <div class="card">
      <div class="section-header">
        <h3>Typy krosien (${state.typyKrosien.length})</h3>
        <button class="btn btn-primary" onclick="addTypKrosna()">+ Dodaj typ</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Nazwa</th><th>Kolor</th><th>Akcje</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function getTypyKrosienOptions(selectedId) {
  return state.typyKrosien.map(t => `<option value="${t.id}" ${t.id===selectedId?'selected':''}>${escHtml(t.nazwa)}</option>`).join('');
}

function getKoloryOptions(selectedColor) {
  return PALETA_KOLOROW.map(kolor => `<option value="${kolor}" ${kolor===selectedColor?'selected':''}>${kolor}</option>`).join('');
}

window.addTypKrosna = function() {
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Nowy typ krosna</h3>
    <div class="form-group"><label>Nazwa</label><input class="form-control" id="ftk-nazwa"></div>
    <div class="form-group"><label>Kolor z palety</label><select class="form-control" id="ftk-kolor">${getKoloryOptions(PALETA_KOLOROW[0])}</select></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveTypKrosna()">Zapisz</button>
    </div>`);
};

window.saveTypKrosna = function() {
  const nazwa = qs('#ftk-nazwa').value.trim();
  if (!nazwa) { alert('Podaj nazwę typu krosna.'); return; }
  saveUndoPoint('Dodanie typu krosna');
  state.typyKrosien.push({ id: state.nextId.typKrosna++, nazwa, kolor: qs('#ftk-kolor').value });
  closeModal();
  renderView();
};

window.editTypKrosna = function(id) {
  const typ = getLoomType(id); if (!typ) return;
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj typ krosna</h3>
    <div class="form-group"><label>Nazwa</label><input class="form-control" id="ftk-nazwa" value="${escHtml(typ.nazwa)}"></div>
    <div class="form-group"><label>Kolor z palety</label><select class="form-control" id="ftk-kolor">${getKoloryOptions(typ.kolor)}</select></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updateTypKrosna(${id})">Zapisz</button>
    </div>`);
};

window.updateTypKrosna = function(id) {
  const typ = getLoomType(id); if (!typ) return;
  const nazwa = qs('#ftk-nazwa').value.trim();
  if (!nazwa) { alert('Podaj nazwę typu krosna.'); return; }
  saveUndoPoint('Edycja typu krosna');
  typ.nazwa = nazwa;
  typ.kolor = qs('#ftk-kolor').value;
  closeModal();
  renderView();
};

window.deleteTypKrosna = function(id) {
  const typ = getLoomType(id); if (!typ) return;
  if (state.krosna.some(k => k.typId === id)) {
    alert('Nie można usunąć typu przypisanego do krosna.');
    return;
  }
  confirm(`Usunąć typ krosna "${typ.nazwa}"?`, () => {
    saveUndoPoint('Usunięcie typu krosna');
    state.typyKrosien = state.typyKrosien.filter(t => t.id !== id);
    renderView();
  });
};

window.addKrosno = function() {
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Nowe krosno</h3>
    <div class="grid-2">
      <div class="form-group"><label>Numer</label><input class="form-control" id="fk-numer" placeholder="np. K40"></div>
      <div class="form-group"><label>Typ krosna</label><select class="form-control" id="fk-typ">${getTypyKrosienOptions(state.typyKrosien[0]?.id)}</select></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Rodzaj</label>
        <select class="form-control" id="fk-rodzaj">
          <option value="pneumatyk">Pneumatyk</option>
          <option value="rapier">Rapier</option>
        </select>
      </div>
      <div class="form-group"><label>Szerokość (cm)</label><input class="form-control" type="number" id="fk-szerokosc" value="180"></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="fk-status">
        <option value="pracuje">Pracuje</option>
        <option value="awaria">Awaria</option>
        <option value="zatrzymane">Zatrzymane</option>
        <option value="wiazanie">Wiązanie</option>
        <option value="brak">Brak statusu</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveKrosno()">Zapisz</button>
    </div>`);
};

window.saveKrosno = function() {
  const numer = qs('#fk-numer').value.trim();
  if (!numer) { alert('Podaj numer krosna.'); return; }
  saveUndoPoint('Dodanie krosna');
  state.krosna.push({
    id: state.nextId.krosno++,
    numer,
    typId: parseInt(qs('#fk-typ').value),
    rodzaj: qs('#fk-rodzaj').value,
    szerokoscCm: parseInt(qs('#fk-szerokosc').value) || 180,
    status: qs('#fk-status').value,
    osnowId: null,
    artIdOverride: null,
  });
  closeModal();
  renderView();
};

window.editKrosno = function(id) {
  const k = getKrosno(id); if (!k) return;
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj krosno ${escHtml(k.numer)}</h3>
    <div class="grid-2">
      <div class="form-group"><label>Numer</label><input class="form-control" id="fk-numer" value="${escHtml(k.numer)}"></div>
      <div class="form-group"><label>Typ krosna</label><select class="form-control" id="fk-typ">${getTypyKrosienOptions(k.typId)}</select></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Rodzaj</label>
        <select class="form-control" id="fk-rodzaj">
          <option value="pneumatyk" ${k.rodzaj==='pneumatyk'?'selected':''}>Pneumatyk</option>
          <option value="rapier" ${k.rodzaj==='rapier'?'selected':''}>Rapier</option>
        </select>
      </div>
      <div class="form-group"><label>Szerokość (cm)</label><input class="form-control" type="number" id="fk-szerokosc" value="${k.szerokoscCm}"></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="fk-status">
        <option value="pracuje" ${k.status==='pracuje'?'selected':''}>Pracuje</option>
        <option value="awaria" ${k.status==='awaria'?'selected':''}>Awaria</option>
        <option value="zatrzymane" ${k.status==='zatrzymane'?'selected':''}>Zatrzymane</option>
        <option value="wiazanie" ${k.status==='wiazanie'?'selected':''}>Wiązanie</option>
        <option value="brak" ${k.status==='brak'?'selected':''}>Brak statusu</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updateKrosno(${id})">Zapisz</button>
    </div>`);
};

window.updateKrosno = function(id) {
  const k = getKrosno(id); if (!k) return;
  const numer = qs('#fk-numer').value.trim();
  if (!numer) { alert('Podaj numer krosna.'); return; }
  saveUndoPoint('Edycja krosna');
  k.numer = numer;
  k.typId = parseInt(qs('#fk-typ').value);
  k.rodzaj = qs('#fk-rodzaj').value;
  k.szerokoscCm = parseInt(qs('#fk-szerokosc').value) || k.szerokoscCm;
  k.status = qs('#fk-status').value;
  closeModal();
  renderView();
  openLoomDetail(id);
};

window.deleteKrosno = function(id) {
  const k = getKrosno(id); if (!k) return;
  const osnowa = k.osnowId ? getOsnowa(k.osnowId) : null;
  confirm(
    `Usunąć krosno ${k.numer}?`,
    () => {
      saveUndoPoint('Usunięcie krosna');
      if (osnowa) {
        osnowa.lokalizacja = 'magazyn';
        osnowa.krosnoid = null;
        osnowa.statusPrzerobki = null;
      }
      state.krosna = state.krosna.filter(item => item.id !== id);
      delete state.historiaKrosien[id];
      closeLoomDetail();
      renderView();
    },
    osnowa ? `Osnowa ${osnowa.numer} zostanie zwrócona do magazynu.` : ''
  );
};

function moveKrosnoBefore(draggedId, targetId) {
  const fromIndex = state.krosna.findIndex(k => k.id === draggedId);
  const toIndex = state.krosna.findIndex(k => k.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
  saveUndoPoint('Zmiana układu krosien');
  const [loom] = state.krosna.splice(fromIndex, 1);
  const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  state.krosna.splice(insertIndex, 0, loom);
  renderView();
}

// ============================================================
// VIEW: OBECNOŚCI
// ============================================================
function renderObecnosci() {
  const tabs = [
    { id: 'pracownicy', label: 'Pracownicy' },
    { id: 'zmiany',     label: 'Plan zmian' },
    { id: 'obecnosc',   label: 'Obecność dzienna' },
    { id: 'nieobecnosci', label: 'Planowane nieobecności' },
  ];

  const tabHtml = tabs.map(t =>
    `<button class="tab-btn ${state.obecnosciTab === t.id ? 'active' : ''}" onclick="switchObecnosciTab('${t.id}')">${t.label}</button>`
  ).join('');

  let content = '';
  if (state.obecnosciTab === 'pracownicy')     content = renderPracownicy();
  else if (state.obecnosciTab === 'zmiany')    content = renderPlanZmian();
  else if (state.obecnosciTab === 'obecnosc')  content = renderDziennaObecnosc();
  else if (state.obecnosciTab === 'nieobecnosci') content = renderNieobecnosci();

  return `
    <div class="view-header">
      <h2>Obecności</h2>
      <p>Pracownicy, zmiany i codzienne sprawdzanie obecności</p>
    </div>
    <div class="tabs">${tabHtml}</div>
    ${content}`;
}

window.switchObecnosciTab = function(tab) {
  state.obecnosciTab = tab;
  renderView();
};

// ---- Tab: Pracownicy ----
function renderPracownicy() {
  const rows = state.pracownicy.map(p => `
    <tr class="table-clickable" onclick="openWorkerDetail(${p.id})" style="cursor:pointer">
      <td class="fw-600">${escHtml(p.imie)} ${escHtml(p.nazwisko)}</td>
      <td>${stanowiskoLabel(p.stanowisko)}</td>
      <td>Zmiana ${state.zmianyTygodniowe[p.id] || '—'}</td>
      <td>
        <div class="btn-group" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-secondary" onclick="editPracownik(${p.id})">Edytuj</button>
          <button class="btn btn-sm btn-danger" onclick="deletePracownik(${p.id})">Usuń</button>
        </div>
      </td>
    </tr>`).join('');

  return `
    <div class="card">
      <div class="section-header">
        <h3>Lista pracowników (${state.pracownicy.length})</h3>
        <button class="btn btn-primary" onclick="addPracownik()">+ Dodaj pracownika</button>
      </div>
      <div class="table-wrapper">
        <table class="table table-clickable">
          <thead><tr><th>Imię i nazwisko</th><th>Stanowisko</th><th>Aktualna zmiana</th><th>Akcje</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

window.addPracownik = function() {
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Nowy pracownik</h3>
    <div class="grid-2">
      <div class="form-group"><label>Imię</label><input class="form-control" id="fp-imie"></div>
      <div class="form-group"><label>Nazwisko</label><input class="form-control" id="fp-nazwisko"></div>
    </div>
    <div class="form-group"><label>Domyślne stanowisko</label>
      <select class="form-control" id="fp-stanowisko">
        <option value="tkalnia">Tkalnia</option>
        <option value="snowalnia">Snowalnia</option>
        <option value="klejarnia">Klejarnia</option>
        <option value="przewlekalnia">Przewlekalnia</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="savePracownik()">Dodaj</button>
    </div>`);
};

window.savePracownik = function() {
  const imie     = qs('#fp-imie').value.trim();
  const nazwisko = qs('#fp-nazwisko').value.trim();
  if (!imie || !nazwisko) { alert('Podaj imię i nazwisko.'); return; }
  const id = state.nextId.pracownik++;
  state.pracownicy.push({ id, imie, nazwisko, stanowisko: qs('#fp-stanowisko').value });
  state.zmianyTygodniowe[id] = 1;
  closeModal(); renderView();
};

window.editPracownik = function(id) {
  const p = getPracownik(id); if (!p) return;
  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Edytuj pracownika</h3>
    <div class="grid-2">
      <div class="form-group"><label>Imię</label><input class="form-control" id="fp-imie" value="${escHtml(p.imie)}"></div>
      <div class="form-group"><label>Nazwisko</label><input class="form-control" id="fp-nazwisko" value="${escHtml(p.nazwisko)}"></div>
    </div>
    <div class="form-group"><label>Domyślne stanowisko</label>
      <select class="form-control" id="fp-stanowisko">
        <option value="tkalnia" ${p.stanowisko==='tkalnia'?'selected':''}>Tkalnia</option>
        <option value="snowalnia" ${p.stanowisko==='snowalnia'?'selected':''}>Snowalnia</option>
        <option value="klejarnia" ${p.stanowisko==='klejarnia'?'selected':''}>Klejarnia</option>
        <option value="przewlekalnia" ${p.stanowisko==='przewlekalnia'?'selected':''}>Przewlekalnia</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="updatePracownik(${id})">Zapisz</button>
    </div>`);
};

window.updatePracownik = function(id) {
  const p = getPracownik(id); if (!p) return;
  const imie     = qs('#fp-imie').value.trim();
  const nazwisko = qs('#fp-nazwisko').value.trim();
  if (!imie || !nazwisko) { alert('Podaj imię i nazwisko.'); return; }
  p.imie      = imie;
  p.nazwisko  = nazwisko;
  p.stanowisko = qs('#fp-stanowisko').value;
  closeModal(); renderView();
};

window.deletePracownik = function(id) {
  const p = getPracownik(id); if (!p) return;
  confirm(`Usunąć pracownika ${p.imie} ${p.nazwisko}?`, () => {
    state.pracownicy = state.pracownicy.filter(x => x.id !== id);
    delete state.zmianyTygodniowe[id];
    closeModal(); renderView();
  });
};

function getPracownikStats(id) {
  const stats = {
    przepracowaneDni: 0,
    dniChorobowe: 0,
    dniUrlopu: 0,
    dniNieobecne: 0,
    tkalnia: 0,
    snowalnia: 0,
    klejarnia: 0,
    przewlekalnia: 0,
    zmiana1: 0,
    zmiana2: 0,
  };
  const seenDays = new Set();

  for (const [key, records] of Object.entries(state.obecnosci)) {
    const rec = records.find(r => r.pracownikId === id);
    if (!rec) continue;
    const [date, zmiana] = key.split('_');
    const dayKey = `${date}:${rec.status}`;
    if (!seenDays.has(dayKey)) {
      if (rec.status === 'obecny') stats.przepracowaneDni += 1;
      if (rec.status === 'chory') stats.dniChorobowe += 1;
      if (rec.status === 'urlop') stats.dniUrlopu += 1;
      if (rec.status === 'nieobecny') stats.dniNieobecne += 1;
      seenDays.add(dayKey);
    }
    if (rec.status === 'obecny') {
      if (rec.stanowisko === 'tkalnia') stats.tkalnia += 1;
      if (rec.stanowisko === 'snowalnia') stats.snowalnia += 1;
      if (rec.stanowisko === 'klejarnia') stats.klejarnia += 1;
      if (rec.stanowisko === 'przewlekalnia') stats.przewlekalnia += 1;
      if (zmiana === '1') stats.zmiana1 += 1;
      if (zmiana === '2') stats.zmiana2 += 1;
    }
  }

  return stats;
}

window.openWorkerDetail = function(id) {
  const p = getPracownik(id); if (!p) return;
  const zmiana = state.zmianyTygodniowe[id] || '—';
  const nieo = state.nieobecnosci.filter(n => n.pracownikId === id);
  const stats = getPracownikStats(id);

  // Collect attendance history
  const attHistory = [];
  for (const [key, records] of Object.entries(state.obecnosci)) {
    const rec = records.find(r => r.pracownikId === id);
    if (rec) {
      const [date, zmStr] = key.split('_');
      attHistory.push({ date, zmiana: zmStr, status: rec.status, stanowisko: rec.stanowisko });
    }
  }
  attHistory.sort((a,b) => b.date.localeCompare(a.date));

  const nieoHtml = nieo.length
    ? nieo.map(n => `<div class="absence-row">
        <div>${n.typ === 'urlop' ? '<span class="badge badge-info">Urlop</span>' : '<span class="badge badge-warning">Chory</span>'}</div>
        <div class="absence-period">${formatDate(n.od)} – ${formatDate(n.do)}</div>
        <button class="btn btn-sm btn-danger" onclick="deleteNieobecnosc(${n.id})">Usuń</button>
      </div>`).join('')
    : '<p class="text-muted text-sm">Brak zaplanowanych nieobecności.</p>';

  const attHtml = attHistory.length
    ? attHistory.slice(0, 10).map(a => `
        <div class="timeline-item">
          <div class="timeline-date">${formatDate(a.date)}</div>
          <div class="timeline-body">
            <div class="timeline-type">Zmiana ${a.zmiana}</div>
            <div class="timeline-opis">${statusObecnosci(a.status)} ${stanowiskoLabel(a.stanowisko)}</div>
          </div>
        </div>`).join('')
    : '<p class="text-muted text-sm">Brak historii obecności.</p>';

  const statsHtml = [
    ['Pracował', stats.przepracowaneDni],
    ['Chory', stats.dniChorobowe],
    ['Urlop', stats.dniUrlopu],
    ['Nieobecny', stats.dniNieobecne],
    ['Na tkalni', stats.tkalnia],
    ['Na snowalni', stats.snowalnia],
    ['Na klejarni', stats.klejarnia],
    ['Na przewlekalni', stats.przewlekalnia],
    ['Zmiana 1', stats.zmiana1],
    ['Zmiana 2', stats.zmiana2],
  ].map(([label, value]) => `
    <div class="info-item">
      <div class="lbl">${label}</div>
      <div class="val">${value}</div>
    </div>`).join('');

  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>${escHtml(p.imie)} ${escHtml(p.nazwisko)}</h3>
    <div class="info-grid mb-16">
      <div class="info-item"><div class="lbl">Stanowisko</div><div class="val">${stanowiskoLabel(p.stanowisko)}</div></div>
      <div class="info-item"><div class="lbl">Aktualna zmiana</div><div class="val">Zmiana ${zmiana}</div></div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Statystyki pracownika</div>
      <div class="info-grid">${statsHtml}</div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Planowane nieobecności</div>
      ${nieoHtml}
      <button class="btn btn-sm btn-primary mt-8" onclick="addNieobecnosc(${id})">+ Dodaj nieobecność</button>
    </div>
    <div class="detail-section mt-16">
      <div class="detail-section-title">Historia obecności</div>
      <div class="timeline">${attHtml}</div>
    </div>`, true);
};

// ---- Tab: Plan zmian ----
function renderPlanZmian() {
  const rows = state.pracownicy.map(p => {
    const zmiana = state.zmianyTygodniowe[p.id] || 1;
    return `
      <div class="shift-row">
        <div>
          <div class="shift-name">${escHtml(p.imie)} ${escHtml(p.nazwisko)}</div>
          <div class="shift-stanowisko">${stanowiskoLabel(p.stanowisko)}</div>
        </div>
        <div class="shift-toggle-wrap">
          <span class="shift-z1">Z1</span>
          <label class="toggle">
            <input type="checkbox" ${zmiana === 2 ? 'checked' : ''}
              onchange="toggleZmiana(${p.id}, this.checked)">
            <span class="toggle-slider"></span>
          </label>
          <span class="shift-z2">Z2</span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="card">
      <div class="section-header">
        <h3>Tygodniowy plan zmian</h3>
        <span class="text-muted text-sm">Przełącznik: Z1 / Z2</span>
      </div>
      ${rows || '<div class="empty-state">Brak pracowników.</div>'}
    </div>`;
}

window.toggleZmiana = function(pracownikId, isZ2) {
  state.zmianyTygodniowe[pracownikId] = isZ2 ? 2 : 1;
};

// ---- Tab: Obecność dzienna ----
function renderDziennaObecnosc() {
  return `
    <div class="card">
      <div class="section-header">
        <h3>Sprawdź obecność</h3>
      </div>
      <div class="flex gap-8 items-center mb-16" style="flex-wrap:wrap">
        <div class="flex gap-6 items-center">
          <label style="font-size:.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Data:</label>
          <input class="form-control" type="date" id="obd-date" value="${state.obecnosciData}" style="width:160px"
            onchange="state.obecnosciData=this.value">
        </div>
        <button class="btn btn-primary" onclick="openAttendance(1)">Sprawdź obecność – Zmiana 1</button>
        <button class="btn btn-warning" onclick="openAttendance(2)">Sprawdź obecność – Zmiana 2</button>
      </div>
      ${renderAttendanceSummary()}
    </div>`;
}

function renderAttendanceSummary() {
  const dateStr = state.obecnosciData;
  const z1key = getObecnoscKey(dateStr, 1);
  const z2key = getObecnoscKey(dateStr, 2);
  const z1 = state.obecnosci[z1key] || [];
  const z2 = state.obecnosci[z2key] || [];

  if (!z1.length && !z2.length) {
    return `<p class="text-muted text-sm">Brak zapisanej obecności na ${formatDate(dateStr)}.</p>`;
  }

  const renderZmianaBlock = (records, zmLabel) => {
    if (!records.length) return '';
    return `
      <div class="mt-12">
        <div style="font-weight:700;font-size:.85rem;margin-bottom:8px">Zmiana ${zmLabel}</div>
        ${records.map(r => {
          const p = getPracownik(r.pracownikId);
          return `<div class="flex gap-8 items-center" style="margin-bottom:6px">
            <span style="min-width:160px;font-weight:600">${p ? p.imie + ' ' + p.nazwisko : '?'}</span>
            ${statusObecnosci(r.status)}
            <span class="text-muted text-sm">${stanowiskoLabel(r.stanowisko)}</span>
          </div>`;
        }).join('')}
      </div>`;
  };

  return `
    <div>
      <div style="font-weight:700;margin-bottom:10px">Zapisana obecność: ${formatDate(dateStr)}</div>
      ${renderZmianaBlock(z1, '1')}
      ${renderZmianaBlock(z2, '2')}
    </div>`;
}

window.openAttendance = function(zmiana) {
  const dateStr = qs('#obd-date').value || state.obecnosciData;
  state.obecnosciData = dateStr;
  const key = getObecnoscKey(dateStr, zmiana);
  const workers = state.pracownicy.filter(p => state.zmianyTygodniowe[p.id] === zmiana);

  if (!workers.length) { alert(`Brak pracowników przypisanych do zmiany ${zmiana}.`); return; }

  const rowsHtml = workers.map(p => {
    const existing = getObecnosc(p.id, dateStr, zmiana);
    const planned  = getPlannedAbsence(p.id, dateStr);
    const autoFill = planned && !existing;
    const status   = existing ? existing.status : (planned ? planned.typ : 'obecny');
    const stanow   = existing ? existing.stanowisko : p.stanowisko;

    const statusBtns = ['obecny','nieobecny','chory','urlop'].map(s =>
      `<button class="status-btn ${status===s?'sel-'+s:''}" data-p="${p.id}" data-s="${s}"
        onclick="setAttStatus(${p.id}, '${s}', ${zmiana})">${s}</button>`
    ).join('');

    const stanowOpts = ['tkalnia','snowalnia','klejarnia','przewlekalnia'].map(st =>
      `<option value="${st}" ${stanow===st?'selected':''}>${stanowiskoLabel(st)}</option>`).join('');

    return `
      <div class="att-row" id="attrow-${p.id}">
        <div class="att-name">${escHtml(p.imie)} ${escHtml(p.nazwisko)}</div>
        <div class="att-status-btns">${statusBtns}</div>
        <div class="att-stanowisko">
          <select class="form-control" style="font-size:.78rem;padding:4px 7px" id="att-st-${p.id}"
            onchange="setAttStanowisko(${p.id}, this.value, ${zmiana})">
            ${stanowOpts}
          </select>
        </div>
        ${autoFill ? `<span class="att-auto-badge">Auto (${planned.typ})</span>` : ''}
      </div>`;
  }).join('');

  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Obecność – Zmiana ${zmiana} – ${escHtml(formatDate(dateStr))}</h3>
    <p class="text-muted text-sm mb-16">${workers.length} pracowników w tej zmianie</p>
    <div>${rowsHtml}</div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Zamknij</button>
      <button class="btn btn-primary" onclick="saveAttendance(${zmiana}, ${JSON.stringify(dateStr)})">Zapisz obecność</button>
    </div>`, true);

  // Pre-populate state for auto-filled entries
  if (!state.obecnosci[key]) state.obecnosci[key] = [];
  workers.forEach(p => {
    const existing = getObecnosc(p.id, dateStr, zmiana);
    if (!existing) {
      const planned = getPlannedAbsence(p.id, dateStr);
      const status  = planned ? planned.typ : 'obecny';
      const recs = state.obecnosci[key];
      const idx = recs.findIndex(r => r.pracownikId === p.id);
      if (idx === -1) recs.push({ pracownikId: p.id, status, stanowisko: p.stanowisko });
    }
  });
};

window.setAttStatus = function(pracownikId, status, zmiana) {
  const dateStr = state.obecnosciData;
  const key = getObecnoscKey(dateStr, zmiana);
  if (!state.obecnosci[key]) state.obecnosci[key] = [];
  const recs = state.obecnosci[key];
  const idx = recs.findIndex(r => r.pracownikId === pracownikId);
  const stanowisko = qs('#att-st-' + pracownikId) ? qs('#att-st-' + pracownikId).value : getPracownik(pracownikId).stanowisko;
  if (idx === -1) recs.push({ pracownikId, status, stanowisko });
  else { recs[idx].status = status; recs[idx].stanowisko = stanowisko; }
  // Update UI
  const row = qs('#attrow-' + pracownikId);
  if (row) {
    row.querySelectorAll('.status-btn').forEach(b => {
      b.className = 'status-btn' + (b.dataset.s === status ? ' sel-' + status : '');
    });
  }
};

window.setAttStanowisko = function(pracownikId, stanowisko, zmiana) {
  const dateStr = state.obecnosciData;
  const key = getObecnoscKey(dateStr, zmiana);
  if (!state.obecnosci[key]) state.obecnosci[key] = [];
  const recs = state.obecnosci[key];
  const idx = recs.findIndex(r => r.pracownikId === pracownikId);
  if (idx >= 0) recs[idx].stanowisko = stanowisko;
};

window.saveAttendance = function(zmiana, dateStr) {
  confirm(
    `Zapisać obecność dla zmiany ${zmiana} na ${formatDate(dateStr)}?`,
    () => {
      closeModal(); renderView();
    }
  );
};

// ---- Tab: Nieobecności ----
function renderNieobecnosci() {
  const rows = state.nieobecnosci.map(n => {
    const p = getPracownik(n.pracownikId);
    return `
      <div class="absence-row">
        <div class="absence-name">${p ? escHtml(p.imie + ' ' + p.nazwisko) : '—'}</div>
        <div>${n.typ === 'urlop' ? '<span class="badge badge-info">Urlop</span>' : '<span class="badge badge-warning">Chory</span>'}</div>
        <div class="absence-period">${formatDate(n.od)} – ${formatDate(n.do)}</div>
        <button class="btn btn-sm btn-danger" onclick="deleteNieobecnosc(${n.id})">Usuń</button>
      </div>`;
  }).join('') || '<div class="empty-state">Brak planowanych nieobecności.</div>';

  return `
    <div class="card">
      <div class="section-header">
        <h3>Planowane nieobecności</h3>
        <button class="btn btn-primary" onclick="addNieobecnosc(null)">+ Dodaj nieobecność</button>
      </div>
      ${rows}
    </div>`;
}

window.addNieobecnosc = function(pracownikId) {
  const pracOpts = state.pracownicy.map(p =>
    `<option value="${p.id}" ${p.id===pracownikId?'selected':''}>${escHtml(p.imie + ' ' + p.nazwisko)}</option>`).join('');

  showModal(`
    <button class="modal-close-btn" onclick="closeModal()">×</button>
    <h3>Dodaj planowaną nieobecność</h3>
    <div class="form-group"><label>Pracownik</label><select class="form-control" id="fn-prac">${pracOpts}</select></div>
    <div class="form-group"><label>Typ</label>
      <select class="form-control" id="fn-typ">
        <option value="urlop">Urlop</option>
        <option value="chory">Chory / L4</option>
      </select>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Od</label><input class="form-control" type="date" id="fn-od"></div>
      <div class="form-group"><label>Do</label><input class="form-control" type="date" id="fn-do"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Anuluj</button>
      <button class="btn btn-primary" onclick="saveNieobecnosc()">Zapisz</button>
    </div>`);
};

window.saveNieobecnosc = function() {
  const od = qs('#fn-od').value;
  const doDate = qs('#fn-do').value;
  if (!od || !doDate) { alert('Podaj daty.'); return; }
  if (new Date(od) > new Date(doDate)) { alert('Data rozpoczęcia musi być przed datą zakończenia.'); return; }
  const id = state.nextId.nieobecnosc++;
  state.nieobecnosci.push({
    id,
    pracownikId: parseInt(qs('#fn-prac').value),
    typ: qs('#fn-typ').value,
    od, do: doDate,
  });
  closeModal(); renderView();
};

window.deleteNieobecnosc = function(id) {
  confirm('Usunąć zaplanowaną nieobecność?', () => {
    state.nieobecnosci = state.nieobecnosci.filter(x => x.id !== id);
    closeModal(); renderView();
  });
};

// ============================================================
// EVENT LISTENERS
// ============================================================
function attachViewEvents() {
  // Loom block clicks (delegated to hall)
  const hall = qs('#loom-hall');
  if (hall) {
    hall.addEventListener('click', e => {
      if (suppressLoomClick) {
        suppressLoomClick = false;
        return;
      }
      const block = e.target.closest('[data-krosno]');
      if (block) openLoomDetail(parseInt(block.dataset.krosno));
    });
    hall.addEventListener('dragstart', (e) => {
      const block = e.target.closest('[data-krosno]');
      if (!block) return;
      draggedLoomId = parseInt(block.dataset.krosno, 10);
      suppressLoomClick = true;
      block.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(draggedLoomId));
      }
    });
    hall.addEventListener('dragover', (e) => {
      const block = e.target.closest('[data-krosno]');
      if (!block || draggedLoomId == null) return;
      const targetId = parseInt(block.dataset.krosno, 10);
      if (targetId === draggedLoomId) return;
      e.preventDefault();
      qsa('.loom-block.drag-over', hall).forEach(el => el.classList.remove('drag-over'));
      block.classList.add('drag-over');
    });
    hall.addEventListener('drop', (e) => {
      const block = e.target.closest('[data-krosno]');
      if (!block || draggedLoomId == null) return;
      e.preventDefault();
      const targetId = parseInt(block.dataset.krosno, 10);
      qsa('.loom-block.drag-over', hall).forEach(el => el.classList.remove('drag-over'));
      if (targetId !== draggedLoomId) moveKrosnoBefore(draggedLoomId, targetId);
      draggedLoomId = null;
    });
    hall.addEventListener('dragend', () => {
      qsa('.loom-block.dragging, .loom-block.drag-over', hall).forEach(el => el.classList.remove('dragging', 'drag-over'));
      draggedLoomId = null;
      setTimeout(() => { suppressLoomClick = false; }, 0);
    });
  }
}

// ============================================================
// INIT
// ============================================================
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#','');
  const safeHash = VIEWS.find(v => v === hash);
  if (safeHash) navigate(safeHash);
});

document.addEventListener('DOMContentLoaded', () => {
  qsa('.nav-item').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(a.dataset.view);
    });
  });

  const hash = window.location.hash.replace('#','');
  navigate(VIEWS.find(v => v === hash) || 'tkalnia');
});
