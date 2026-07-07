// ============================================================
// data.js – Mock data and application state
// Technotex – Plan produkcji
// ============================================================

// ---- Typy krosien ----
const TYPY_KROSIEN_INIT = [
  { id: 1, nazwa: 'PICANOL GTM-A', kolor: '#2980b9' },
  { id: 2, nazwa: 'PICANOL GTM-B', kolor: '#27ae60' },
  { id: 3, nazwa: 'PICANOL OMNI', kolor: '#d4a017' },
  { id: 4, nazwa: 'DORNIER', kolor: '#8e44ad' },
  { id: 5, nazwa: 'SULZER P7200', kolor: '#16a085' },
  { id: 6, nazwa: 'TOYOTA JAT', kolor: '#2c3e50' },
  { id: 7, nazwa: 'VAMATEX', kolor: '#c0392b' },
  { id: 8, nazwa: 'SOMET', kolor: '#d35400' },
  { id: 9, nazwa: 'LINDAUER', kolor: '#5d4037' },
];

// ---- Initial articles (9 artykuły) ----
const ARTYKULY_INIT = [
  { id: 1, nazwa: 'BT 367', watkiNaCm: 18, rozpinka: 'tak', rodzajSnucia: 'taśmowe', szerokoscTkaniny: 150, uwagi: 'Artykuł bazowy do stałych zamówień.' },
  { id: 2, nazwa: 'BT 773/150', watkiNaCm: 22, rozpinka: 'nie', rodzajSnucia: 'taśmowe', szerokoscTkaniny: 148, uwagi: '' },
  { id: 3, nazwa: 'BTR 130', watkiNaCm: 42, rozpinka: 'tak', rodzajSnucia: 'zespołowe', szerokoscTkaniny: 130, uwagi: 'Wymaga dokładnego planowania partii.' },
  { id: 4, nazwa: 'AT 210', watkiNaCm: 28, rozpinka: 'nie', rodzajSnucia: 'taśmowe', szerokoscTkaniny: 200, uwagi: '' },
  { id: 5, nazwa: 'AT 155', watkiNaCm: 35, rozpinka: 'tak', rodzajSnucia: 'zespołowe', szerokoscTkaniny: 155, uwagi: 'Często łączony z pilniejszymi zleceniami.' },
  { id: 6, nazwa: 'BT 500', watkiNaCm: 20, rozpinka: 'nie', rodzajSnucia: 'taśmowe', szerokoscTkaniny: 215, uwagi: '' },
  { id: 7, nazwa: 'BT 220', watkiNaCm: 24, rozpinka: 'tak', rodzajSnucia: 'taśmowe', szerokoscTkaniny: 140, uwagi: '' },
  { id: 8, nazwa: 'BTR 200', watkiNaCm: 38, rozpinka: 'nie', rodzajSnucia: 'zespołowe', szerokoscTkaniny: 188, uwagi: 'Seria z mniejszymi partiami.' },
  { id: 9, nazwa: 'AT 300', watkiNaCm: 30, rozpinka: 'tak', rodzajSnucia: 'taśmowe', szerokoscTkaniny: 180, uwagi: '' },
];

// ---- Initial warps (30 osnów in various locations) ----
// lokalizacja: 'magazyn' | 'przewlekalnia' | 'krosno' | 'snowalnia' | 'klejarnia'
// statusPrzew: 'przewleczona' | 'nieprzewleczona'
// statusPrzerobki (only when lokalizacja==='przewlekalnia'): 'w_kolejce' | 'w_przygotowaniu' | 'przewleczona'
const OSNOWY_INIT = [
  // On looms
  { id:  1, numer: 'O-001/2026', artId: 1, metry: 720,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid:  1, statusPrzerobki: null },
  { id:  2, numer: 'O-002/2026', artId: 2, metry: 860,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid:  2, statusPrzerobki: null },
  { id:  3, numer: 'O-003/2026', artId: 3, metry: 540,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid:  3, statusPrzerobki: null },
  { id:  4, numer: 'O-004/2026', artId: 4, metry: 1200, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid:  5, statusPrzerobki: null },
  { id:  5, numer: 'O-005/2026', artId: 5, metry: 680,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid:  6, statusPrzerobki: null },
  { id:  6, numer: 'O-006/2026', artId: 6, metry: 950,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid:  9, statusPrzerobki: null },
  { id:  7, numer: 'O-007/2026', artId: 7, metry: 440,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 10, statusPrzerobki: null },
  { id:  8, numer: 'O-008/2026', artId: 8, metry: 1100, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 11, statusPrzerobki: null },
  { id:  9, numer: 'O-009/2026', artId: 9, metry: 320,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 12, statusPrzerobki: null },
  { id: 10, numer: 'O-010/2026', artId: 1, metry: 890,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 15, statusPrzerobki: null },
  { id: 11, numer: 'O-011/2026', artId: 2, metry: 760,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 16, statusPrzerobki: null },
  { id: 12, numer: 'O-012/2026', artId: 3, metry: 610,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 17, statusPrzerobki: null },
  { id: 13, numer: 'O-013/2026', artId: 4, metry: 1050, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 19, statusPrzerobki: null },
  { id: 14, numer: 'O-014/2026', artId: 5, metry: 830,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 20, statusPrzerobki: null },
  { id: 15, numer: 'O-015/2026', artId: 6, metry: 490,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 22, statusPrzerobki: null },
  { id: 16, numer: 'O-016/2026', artId: 7, metry: 1300, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 23, statusPrzerobki: null },
  { id: 17, numer: 'O-017/2026', artId: 8, metry: 670,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 24, statusPrzerobki: null },
  { id: 18, numer: 'O-018/2026', artId: 9, metry: 580,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 25, statusPrzerobki: null },
  { id: 19, numer: 'O-019/2026', artId: 1, metry: 920,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 27, statusPrzerobki: null },
  { id: 20, numer: 'O-020/2026', artId: 2, metry: 740,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',       krosnoid: 28, statusPrzerobki: null },
  // In magazyn osnów
  { id: 21, numer: 'O-021/2026', artId: 3, metry: 1200, statusPrzew: 'przewleczona',    lokalizacja: 'magazyn',      krosnoid: null, statusPrzerobki: null },
  { id: 22, numer: 'O-022/2026', artId: 4, metry: null,  statusPrzew: 'nieprzewleczona', lokalizacja: 'magazyn',     krosnoid: null, statusPrzerobki: null }, // długość jeszcze do pomiaru
  { id: 23, numer: 'O-023/2026', artId: 5, metry: 800,  statusPrzew: 'nieprzewleczona', lokalizacja: 'magazyn',      krosnoid: null, statusPrzerobki: null },
  { id: 24, numer: 'O-024/2026', artId: 6, metry: 650,  statusPrzew: 'przewleczona',    lokalizacja: 'magazyn',      krosnoid: null, statusPrzerobki: null },
  { id: 25, numer: 'O-025/2026', artId: 7, metry: 450,  statusPrzew: 'nieprzewleczona', lokalizacja: 'magazyn',      krosnoid: null, statusPrzerobki: null },
  // In przewlekalnia
  { id: 26, numer: 'O-026/2026', artId: 8, metry: 1100, statusPrzew: 'nieprzewleczona', lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'w_kolejce' },
  { id: 27, numer: 'O-027/2026', artId: 9, metry: 900,  statusPrzew: 'nieprzewleczona', lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'w_przygotowaniu' },
  { id: 28, numer: 'O-028/2026', artId: 1, metry: 1050, statusPrzew: 'przewleczona',    lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'przewleczona' },
  { id: 29, numer: 'O-029/2026', artId: 2, metry: 780,  statusPrzew: 'nieprzewleczona', lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'w_kolejce' },
  { id: 30, numer: 'O-030/2026', artId: 4, metry: 960,  statusPrzew: 'przewleczona',    lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'przewleczona' },
];

// ---- Initial 39 looms ----
// status: 'pracuje' | 'awaria' | 'zatrzymane' | 'wiazanie' | 'brak'
// szerokoscCm: used for visual block width
// artIdOverride: manual article override (null = use article from osnowa)
const KROSNA_INIT = [
  // PICANOL GTM-A (type 1), pneumatyk, 160 cm
  { id:  1, numer: 'K1',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  1, artIdOverride: null },
  { id:  2, numer: 'K2',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'awaria',     osnowId:  2, artIdOverride: 3    },
  { id:  3, numer: 'K3',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  3, artIdOverride: null },
  { id:  4, numer: 'K4',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'zatrzymane', osnowId: null, artIdOverride: null },
  { id:  5, numer: 'K5',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  4, artIdOverride: null },
  { id:  6, numer: 'K6',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  5, artIdOverride: null },
  { id:  7, numer: 'K7',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'brak',       osnowId: null, artIdOverride: null },
  { id:  8, numer: 'K8',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'brak',       osnowId: null, artIdOverride: null },
  // PICANOL GTM-B (type 2), pneumatyk, 180 cm
  { id:  9, numer: 'K9',  typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'pracuje',    osnowId:  6, artIdOverride: null },
  { id: 10, numer: 'K10', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'pracuje',    osnowId:  7, artIdOverride: null },
  { id: 11, numer: 'K11', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'zatrzymane', osnowId:  8, artIdOverride: null },
  { id: 12, numer: 'K12', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'pracuje',    osnowId:  9, artIdOverride: null },
  { id: 13, numer: 'K13', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'wiazanie',   osnowId: null, artIdOverride: null },
  { id: 14, numer: 'K14', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'brak',       osnowId: null, artIdOverride: null },
  // PICANOL OMNI (type 3), pneumatyk, 200 cm
  { id: 15, numer: 'K15', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'pracuje',    osnowId: 10, artIdOverride: null },
  { id: 16, numer: 'K16', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'awaria',     osnowId: 11, artIdOverride: null },
  { id: 17, numer: 'K17', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'pracuje',    osnowId: 12, artIdOverride: null },
  { id: 18, numer: 'K18', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'brak',       osnowId: null, artIdOverride: null },
  // DORNIER (type 4), rapier, 190 cm
  { id: 19, numer: 'K19', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'pracuje',    osnowId: 13, artIdOverride: null },
  { id: 20, numer: 'K20', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'pracuje',    osnowId: 14, artIdOverride: null },
  { id: 21, numer: 'K21', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'wiazanie',   osnowId: null, artIdOverride: null },
  { id: 22, numer: 'K22', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'zatrzymane', osnowId: 15, artIdOverride: null },
  // SULZER P7200 (type 5), rapier, 210 cm
  { id: 23, numer: 'K23', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'pracuje',    osnowId: 16, artIdOverride: null },
  { id: 24, numer: 'K24', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'pracuje',    osnowId: 17, artIdOverride: null },
  { id: 25, numer: 'K25', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'awaria',     osnowId: 18, artIdOverride: null },
  { id: 26, numer: 'K26', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'brak',       osnowId: null, artIdOverride: null },
  // TOYOTA JAT (type 6), pneumatyk, 170 cm
  { id: 27, numer: 'K27', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'pracuje',    osnowId: 19, artIdOverride: null },
  { id: 28, numer: 'K28', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'pracuje',    osnowId: 20, artIdOverride: null },
  { id: 29, numer: 'K29', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'zatrzymane', osnowId: null, artIdOverride: null },
  { id: 30, numer: 'K30', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'brak',       osnowId: null, artIdOverride: null },
  // VAMATEX (type 7), rapier, 150 cm
  { id: 31, numer: 'K31', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'pracuje',    osnowId: null, artIdOverride: null },
  { id: 32, numer: 'K32', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'pracuje',    osnowId: null, artIdOverride: null },
  { id: 33, numer: 'K33', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'wiazanie',   osnowId: null, artIdOverride: null },
  { id: 34, numer: 'K34', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'brak',       osnowId: null, artIdOverride: null },
  // SOMET (type 8), rapier, 220 cm
  { id: 35, numer: 'K35', typId: 8, rodzaj: 'rapier',    szerokoscCm: 220, status: 'pracuje',    osnowId: null, artIdOverride: null },
  { id: 36, numer: 'K36', typId: 8, rodzaj: 'rapier',    szerokoscCm: 220, status: 'awaria',     osnowId: null, artIdOverride: null },
  { id: 37, numer: 'K37', typId: 8, rodzaj: 'rapier',    szerokoscCm: 220, status: 'brak',       osnowId: null, artIdOverride: null },
  // LINDAUER (type 9), rapier, 230 cm
  { id: 38, numer: 'K38', typId: 9, rodzaj: 'rapier',    szerokoscCm: 230, status: 'pracuje',    osnowId: null, artIdOverride: null },
  { id: 39, numer: 'K39', typId: 9, rodzaj: 'rapier',    szerokoscCm: 230, status: 'brak',       osnowId: null, artIdOverride: null },
];

// ---- Workers ----
const PRACOWNICY_INIT = [
  { id: 1,  imie: 'Jan',       nazwisko: 'Kowalski',     stanowisko: 'tkalnia' },
  { id: 2,  imie: 'Anna',      nazwisko: 'Nowak',        stanowisko: 'snowalnia' },
  { id: 3,  imie: 'Piotr',     nazwisko: 'Wiśniewski',   stanowisko: 'tkalnia' },
  { id: 4,  imie: 'Maria',     nazwisko: 'Wójcik',       stanowisko: 'klejarnia' },
  { id: 5,  imie: 'Tomasz',    nazwisko: 'Kowalczyk',    stanowisko: 'tkalnia' },
  { id: 6,  imie: 'Agnieszka', nazwisko: 'Kamińska',     stanowisko: 'przewlekalnia' },
  { id: 7,  imie: 'Marek',     nazwisko: 'Lewandowski',  stanowisko: 'tkalnia' },
  { id: 8,  imie: 'Ewa',       nazwisko: 'Zielińska',    stanowisko: 'snowalnia' },
  { id: 9,  imie: 'Krzysztof', nazwisko: 'Szymański',    stanowisko: 'klejarnia' },
  { id: 10, imie: 'Barbara',   nazwisko: 'Woźniak',      stanowisko: 'tkalnia' },
];

// ---- Weekly shift assignments { pracownikId: zmiana (1|2) } ----
const ZMIANY_INIT = { 1: 1, 2: 2, 3: 1, 4: 2, 5: 1, 6: 1, 7: 2, 8: 2, 9: 1, 10: 2 };

// ---- Planned absences ----
const NIEOBECNOSCI_INIT = [
  { id: 1, pracownikId: 2, typ: 'urlop', od: '2026-07-07', do: '2026-07-18' },
  { id: 2, pracownikId: 7, typ: 'chory', od: '2026-07-06', do: '2026-07-10' },
];

function rec(pracownikId, status, stanowisko) {
  return { pracownikId, status, stanowisko };
}

function buildAttendanceHistory() {
  return {
    '2026-06-30_1': [
      rec(1, 'obecny', 'tkalnia'),
      rec(3, 'obecny', 'tkalnia'),
      rec(5, 'obecny', 'przewlekalnia'),
      rec(6, 'obecny', 'przewlekalnia'),
      rec(9, 'obecny', 'klejarnia'),
    ],
    '2026-06-30_2': [
      rec(2, 'obecny', 'snowalnia'),
      rec(4, 'obecny', 'klejarnia'),
      rec(7, 'obecny', 'tkalnia'),
      rec(8, 'obecny', 'snowalnia'),
      rec(10, 'obecny', 'tkalnia'),
    ],
    '2026-07-01_1': [
      rec(1, 'obecny', 'snowalnia'),
      rec(3, 'obecny', 'tkalnia'),
      rec(5, 'obecny', 'tkalnia'),
      rec(6, 'obecny', 'przewlekalnia'),
      rec(9, 'obecny', 'klejarnia'),
    ],
    '2026-07-01_2': [
      rec(2, 'obecny', 'snowalnia'),
      rec(4, 'obecny', 'klejarnia'),
      rec(7, 'obecny', 'tkalnia'),
      rec(8, 'obecny', 'tkalnia'),
      rec(10, 'obecny', 'tkalnia'),
    ],
    '2026-07-02_1': [
      rec(1, 'obecny', 'tkalnia'),
      rec(3, 'urlop', 'tkalnia'),
      rec(5, 'obecny', 'tkalnia'),
      rec(6, 'obecny', 'przewlekalnia'),
      rec(9, 'obecny', 'klejarnia'),
    ],
    '2026-07-02_2': [
      rec(2, 'obecny', 'snowalnia'),
      rec(4, 'obecny', 'klejarnia'),
      rec(7, 'obecny', 'przewlekalnia'),
      rec(8, 'obecny', 'snowalnia'),
      rec(10, 'nieobecny', 'tkalnia'),
    ],
    '2026-07-03_1': [
      rec(1, 'obecny', 'tkalnia'),
      rec(3, 'obecny', 'tkalnia'),
      rec(5, 'obecny', 'tkalnia'),
      rec(6, 'obecny', 'tkalnia'),
      rec(9, 'chory', 'klejarnia'),
    ],
    '2026-07-03_2': [
      rec(2, 'obecny', 'snowalnia'),
      rec(4, 'chory', 'klejarnia'),
      rec(7, 'obecny', 'tkalnia'),
      rec(8, 'obecny', 'snowalnia'),
      rec(10, 'obecny', 'tkalnia'),
    ],
    '2026-07-06_1': [
      rec(1, 'chory', 'tkalnia'),
      rec(3, 'obecny', 'tkalnia'),
      rec(5, 'obecny', 'tkalnia'),
      rec(6, 'nieobecny', 'przewlekalnia'),
      rec(9, 'obecny', 'klejarnia'),
    ],
    '2026-07-06_2': [
      rec(2, 'obecny', 'snowalnia'),
      rec(4, 'obecny', 'klejarnia'),
      rec(7, 'chory', 'tkalnia'),
      rec(8, 'obecny', 'snowalnia'),
      rec(10, 'obecny', 'tkalnia'),
    ],
    '2026-07-07_1': [
      rec(1, 'obecny', 'tkalnia'),
      rec(3, 'obecny', 'snowalnia'),
      rec(5, 'obecny', 'tkalnia'),
      rec(6, 'obecny', 'przewlekalnia'),
      rec(9, 'obecny', 'klejarnia'),
    ],
    '2026-07-07_2': [
      rec(2, 'urlop', 'snowalnia'),
      rec(4, 'obecny', 'klejarnia'),
      rec(7, 'chory', 'tkalnia'),
      rec(8, 'obecny', 'snowalnia'),
      rec(10, 'obecny', 'tkalnia'),
    ],
  };
}

const OBECNOSCI_INIT = buildAttendanceHistory();

// ---- Production orders ----
const ZLECENIA_INIT = [
  { id: 1, numer: 'ZL-001/2026', artId: 1, iloscM: 5000, status: 'w_trakcie', dataUtworzenia: '2026-06-01', terminRealizacji: '2026-07-31', priorytet: 'wysoki', uwagi: 'Stały odbiorca.', przekazaneDo: null },
  { id: 2, numer: 'ZL-002/2026', artId: 3, iloscM: 3000, status: 'w_trakcie', dataUtworzenia: '2026-06-15', terminRealizacji: '2026-08-15', priorytet: 'standard', uwagi: '', przekazaneDo: null },
  { id: 3, numer: 'ZL-003/2026', artId: 5, iloscM: 2000, status: 'zrealizowane', dataUtworzenia: '2026-05-01', terminRealizacji: '2026-06-30', priorytet: 'niski', uwagi: 'Partia zamknięta.', przekazaneDo: null },
  { id: 4, numer: 'ZL-004/2026', artId: 2, iloscM: 4000, status: 'nowe', dataUtworzenia: '2026-07-01', terminRealizacji: '2026-09-01', priorytet: 'standard', uwagi: '', przekazaneDo: null },
  { id: 5, numer: 'ZL-005/2026', artId: 7, iloscM: 1500, status: 'w_trakcie', dataUtworzenia: '2026-06-20', terminRealizacji: '2026-07-25', priorytet: 'wysoki', uwagi: 'Do skoordynowania z planem zmian.', przekazaneDo: null },
  { id: 6, numer: 'ZL-006/2026', artId: 4, iloscM: 6000, status: 'nowe', dataUtworzenia: '2026-07-05', terminRealizacji: '2026-10-01', priorytet: 'standard', uwagi: '', przekazaneDo: null },
];

// ---- Snowalnia batches ----
const SNOWALNIA_INIT = [
  { id: 1, numer: 'SN-001/2026', artId: 1, metry: 1200, status: 'gotowe',    dataPlanowana: '2026-07-01', uwagi: '' },
  { id: 2, numer: 'SN-002/2026', artId: 3, metry: 900,  status: 'w_trakcie', dataPlanowana: '2026-07-06', uwagi: 'Priorytetowe' },
  { id: 3, numer: 'SN-003/2026', artId: 5, metry: 1100, status: 'w_kolejce', dataPlanowana: '2026-07-08', uwagi: '' },
  { id: 4, numer: 'SN-004/2026', artId: 2, metry: 800,  status: 'w_trakcie', dataPlanowana: '2026-07-07', uwagi: '' },
  { id: 5, numer: 'SN-005/2026', artId: 7, metry: 600,  status: 'gotowe',    dataPlanowana: '2026-06-28', uwagi: '' },
  { id: 6, numer: 'SN-006/2026', artId: 9, metry: 1000, status: 'w_kolejce', dataPlanowana: '2026-07-09', uwagi: '' },
];

// ---- Klejarnia batches (only klejone articles) ----
const KLEJARNIA_INIT = [
  { id: 1, numer: 'KL-001/2026', artId: 3, metry: 900,  status: 'gotowe',    dataPlanowana: '2026-07-03', uwagi: '' },
  { id: 2, numer: 'KL-002/2026', artId: 5, metry: 1100, status: 'w_trakcie', dataPlanowana: '2026-07-06', uwagi: '' },
  { id: 3, numer: 'KL-003/2026', artId: 8, metry: 700,  status: 'w_kolejce', dataPlanowana: '2026-07-08', uwagi: '' },
  { id: 4, numer: 'KL-004/2026', artId: 3, metry: 800,  status: 'w_kolejce', dataPlanowana: '2026-07-10', uwagi: 'Pilne' },
];

// ---- Loom history { krosnoid: [ { data, typ, opis, uzytkownik } ] } ----
const HISTORIA_KROSIEN_INIT = {
  1: [
    { data: '2026-06-20', typ: 'zdjecie_osnowy',  opis: 'Zdjęto osnowę O-000/2026 (530 m pozostałych). Osnowa zwrócona do magazynu.',  uzytkownik: 'T. Kowalczyk' },
    { data: '2026-07-01', typ: 'zalozenie_osnowy', opis: 'Założono osnowę O-001/2026 – Osnowa BT 367.',                                 uzytkownik: 'J. Kowalski' },
    { data: '2026-07-01', typ: 'zmiana_statusu',   opis: 'Status zmieniony na: pracuje.',                                               uzytkownik: 'J. Kowalski' },
  ],
  2: [
    { data: '2026-07-02', typ: 'zalozenie_osnowy', opis: 'Założono osnowę O-002/2026 – Osnowa BT 773/150.',                             uzytkownik: 'J. Kowalski' },
    { data: '2026-07-02', typ: 'zmiana_artykulu',  opis: 'Ręczna zmiana artykułu: BT 773/150 → BTR 130.',                              uzytkownik: 'J. Kowalski' },
    { data: '2026-07-05', typ: 'zmiana_statusu',   opis: 'Status zmieniony na: awaria.',                                                uzytkownik: 'P. Wiśniewski' },
  ],
  15: [
    { data: '2026-06-15', typ: 'zdjecie_osnowy',  opis: 'Zdjęto osnowę O-009/2025 (80 m pozostałych). Osnowa zwrócona do magazynu.',   uzytkownik: 'A. Kamińska' },
    { data: '2026-06-16', typ: 'zalozenie_osnowy', opis: 'Założono osnowę O-010/2026 – Osnowa BT 367.',                                 uzytkownik: 'A. Kamińska' },
  ],
  19: [
    { data: '2026-06-28', typ: 'zalozenie_osnowy', opis: 'Założono osnowę O-013/2026 – Osnowa AT 210.',                                 uzytkownik: 'M. Wójcik' },
    { data: '2026-07-01', typ: 'zmiana_statusu',   opis: 'Status zmieniony na: pracuje.',                                               uzytkownik: 'M. Wójcik' },
  ],
};

// ---- Application state (mutated at runtime, never persisted) ----
const state = {
  artykuly:         JSON.parse(JSON.stringify(ARTYKULY_INIT)),
  typyKrosien:      JSON.parse(JSON.stringify(TYPY_KROSIEN_INIT)),
  krosna:           JSON.parse(JSON.stringify(KROSNA_INIT)),
  osnowy:           JSON.parse(JSON.stringify(OSNOWY_INIT)),
  pracownicy:       JSON.parse(JSON.stringify(PRACOWNICY_INIT)),
  zmianyTygodniowe: JSON.parse(JSON.stringify(ZMIANY_INIT)),
  nieobecnosci:     JSON.parse(JSON.stringify(NIEOBECNOSCI_INIT)),
  zlecenia:         JSON.parse(JSON.stringify(ZLECENIA_INIT)),
  snowalnia:        JSON.parse(JSON.stringify(SNOWALNIA_INIT)),
  klejarnia:        JSON.parse(JSON.stringify(KLEJARNIA_INIT)),
  historiaKrosien:  JSON.parse(JSON.stringify(HISTORIA_KROSIEN_INIT)),
  obecnosci:        JSON.parse(JSON.stringify(OBECNOSCI_INIT)),   // { 'YYYY-MM-DD_zmiana': [ { pracownikId, status, stanowisko } ] }
  nextId: {
    artykul: 10,
    typKrosna: 10,
    krosno: 40,
    osnowa:  31,
    pracownik: 11,
    zlecenie:  7,
    snowalnia: 7,
    klejarnia: 5,
    nieobecnosc: 3,
  },
  // UI state
  currentView: 'tkalnia',
  obecnosciTab: 'pracownicy',
  obecnosciData: new Date().toISOString().split('T')[0],
  obecnosciZmiana: null,
};

// ---- Helpers (used by app.js) ----
function getArtykul(id)      { return state.artykuly.find(a => a.id === id) || null; }
function getKrosno(id)       { return state.krosna.find(k => k.id === id) || null; }
function getOsnowa(id)       { return state.osnowy.find(o => o.id === id) || null; }
function getLoomType(id)     { return state.typyKrosien.find(t => t.id === id) || null; }
function getPracownik(id)    { return state.pracownicy.find(p => p.id === id) || null; }

function getOsnowaName(osnowa) {
  const art = getArtykul(osnowa.artId);
  return 'Osnowa ' + (art ? art.nazwa : '?');
}

function getKrosnoArtykul(krosno) {
  if (krosno.artIdOverride !== null) return getArtykul(krosno.artIdOverride);
  if (krosno.osnowId !== null) {
    const osnowa = getOsnowa(krosno.osnowId);
    if (osnowa) return getArtykul(osnowa.artId);
  }
  return null;
}

function addKrosnoHistory(krosnoid, typ, opis, uzytkownik) {
  if (!state.historiaKrosien[krosnoid]) state.historiaKrosien[krosnoid] = [];
  state.historiaKrosien[krosnoid].unshift({
    data: new Date().toISOString().split('T')[0],
    typ, opis, uzytkownik: uzytkownik || 'Operator',
  });
}

function getPlannedAbsence(pracownikId, dateStr) {
  return state.nieobecnosci.find(n =>
    n.pracownikId === pracownikId && n.od <= dateStr && n.do >= dateStr
  ) || null;
}

function getObecnoscKey(dateStr, zmiana) { return dateStr + '_' + zmiana; }

function getObecnosc(pracownikId, dateStr, zmiana) {
  const key = getObecnoscKey(dateStr, zmiana);
  const records = state.obecnosci[key] || [];
  return records.find(r => r.pracownikId === pracownikId) || null;
}

function today() { return new Date().toISOString().split('T')[0]; }
