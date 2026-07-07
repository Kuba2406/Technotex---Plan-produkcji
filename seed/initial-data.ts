// ============================================================
// seed/initial-data.ts – Development seed data
// Mirrors the mock data used in the original prototype.
// Used as the default state when no persistent backend is available.
// ============================================================

import type { AppState } from '../types/domain';

export const initialData: AppState = {
  // ---- Typy krosien ----
  typyKrosien: [
    { id: 1, nazwa: 'PICANOL GTM-A', kolor: '#2980b9' },
    { id: 2, nazwa: 'PICANOL GTM-B', kolor: '#27ae60' },
    { id: 3, nazwa: 'PICANOL OMNI',  kolor: '#d4a017' },
    { id: 4, nazwa: 'DORNIER',       kolor: '#8e44ad' },
    { id: 5, nazwa: 'SULZER P7200',  kolor: '#16a085' },
    { id: 6, nazwa: 'TOYOTA JAT',    kolor: '#2c3e50' },
    { id: 7, nazwa: 'VAMATEX',       kolor: '#c0392b' },
    { id: 8, nazwa: 'SOMET',         kolor: '#d35400' },
    { id: 9, nazwa: 'LINDAUER',      kolor: '#5d4037' },
  ],

  // ---- Artykuły ----
  artykuly: [
    { id: 1, nazwa: 'BT 367',      watkiNaCm: 18, rozpinka: 'tak', rodzajSnucia: 'taśmowe',  szerokoscTkaniny: 150, uwagi: 'Artykuł bazowy do stałych zamówień.' },
    { id: 2, nazwa: 'BT 773/150',  watkiNaCm: 22, rozpinka: 'nie', rodzajSnucia: 'taśmowe',  szerokoscTkaniny: 148, uwagi: '' },
    { id: 3, nazwa: 'BTR 130',     watkiNaCm: 42, rozpinka: 'tak', rodzajSnucia: 'zespołowe', szerokoscTkaniny: 130, uwagi: 'Wymaga dokładnego planowania partii.' },
    { id: 4, nazwa: 'AT 210',      watkiNaCm: 28, rozpinka: 'nie', rodzajSnucia: 'taśmowe',  szerokoscTkaniny: 200, uwagi: '' },
    { id: 5, nazwa: 'AT 155',      watkiNaCm: 35, rozpinka: 'tak', rodzajSnucia: 'zespołowe', szerokoscTkaniny: 155, uwagi: 'Często łączony z pilniejszymi zleceniami.' },
    { id: 6, nazwa: 'BT 500',      watkiNaCm: 20, rozpinka: 'nie', rodzajSnucia: 'taśmowe',  szerokoscTkaniny: 215, uwagi: '' },
    { id: 7, nazwa: 'BT 220',      watkiNaCm: 24, rozpinka: 'tak', rodzajSnucia: 'taśmowe',  szerokoscTkaniny: 140, uwagi: '' },
    { id: 8, nazwa: 'BTR 200',     watkiNaCm: 38, rozpinka: 'nie', rodzajSnucia: 'zespołowe', szerokoscTkaniny: 188, uwagi: 'Seria z mniejszymi partiami.' },
    { id: 9, nazwa: 'AT 300',      watkiNaCm: 30, rozpinka: 'tak', rodzajSnucia: 'taśmowe',  szerokoscTkaniny: 180, uwagi: '' },
  ],

  // ---- Krosna (39 looms) ----
  krosna: [
    { id:  1, numer: 'K1',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  1, artIdOverride: null },
    { id:  2, numer: 'K2',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'awaria',     osnowId:  2, artIdOverride: 3 },
    { id:  3, numer: 'K3',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  3, artIdOverride: null },
    { id:  4, numer: 'K4',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'zatrzymane', osnowId: null, artIdOverride: null },
    { id:  5, numer: 'K5',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  4, artIdOverride: null },
    { id:  6, numer: 'K6',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'pracuje',    osnowId:  5, artIdOverride: null },
    { id:  7, numer: 'K7',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'brak',       osnowId: null, artIdOverride: null },
    { id:  8, numer: 'K8',  typId: 1, rodzaj: 'pneumatyk', szerokoscCm: 160, status: 'brak',       osnowId: null, artIdOverride: null },
    { id:  9, numer: 'K9',  typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'pracuje',    osnowId:  6, artIdOverride: null },
    { id: 10, numer: 'K10', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'pracuje',    osnowId:  7, artIdOverride: null },
    { id: 11, numer: 'K11', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'zatrzymane', osnowId:  8, artIdOverride: null },
    { id: 12, numer: 'K12', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'pracuje',    osnowId:  9, artIdOverride: null },
    { id: 13, numer: 'K13', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'wiazanie',   osnowId: null, artIdOverride: null },
    { id: 14, numer: 'K14', typId: 2, rodzaj: 'pneumatyk', szerokoscCm: 180, status: 'brak',       osnowId: null, artIdOverride: null },
    { id: 15, numer: 'K15', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'pracuje',    osnowId: 10, artIdOverride: null },
    { id: 16, numer: 'K16', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'awaria',     osnowId: 11, artIdOverride: null },
    { id: 17, numer: 'K17', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'pracuje',    osnowId: 12, artIdOverride: null },
    { id: 18, numer: 'K18', typId: 3, rodzaj: 'pneumatyk', szerokoscCm: 200, status: 'brak',       osnowId: null, artIdOverride: null },
    { id: 19, numer: 'K19', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'pracuje',    osnowId: 13, artIdOverride: null },
    { id: 20, numer: 'K20', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'pracuje',    osnowId: 14, artIdOverride: null },
    { id: 21, numer: 'K21', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'wiazanie',   osnowId: null, artIdOverride: null },
    { id: 22, numer: 'K22', typId: 4, rodzaj: 'rapier',    szerokoscCm: 190, status: 'zatrzymane', osnowId: 15, artIdOverride: null },
    { id: 23, numer: 'K23', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'pracuje',    osnowId: 16, artIdOverride: null },
    { id: 24, numer: 'K24', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'pracuje',    osnowId: 17, artIdOverride: null },
    { id: 25, numer: 'K25', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'awaria',     osnowId: 18, artIdOverride: null },
    { id: 26, numer: 'K26', typId: 5, rodzaj: 'rapier',    szerokoscCm: 210, status: 'brak',       osnowId: null, artIdOverride: null },
    { id: 27, numer: 'K27', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'pracuje',    osnowId: 19, artIdOverride: null },
    { id: 28, numer: 'K28', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'pracuje',    osnowId: 20, artIdOverride: null },
    { id: 29, numer: 'K29', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'zatrzymane', osnowId: null, artIdOverride: null },
    { id: 30, numer: 'K30', typId: 6, rodzaj: 'pneumatyk', szerokoscCm: 170, status: 'brak',       osnowId: null, artIdOverride: null },
    { id: 31, numer: 'K31', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'pracuje',    osnowId: null, artIdOverride: null },
    { id: 32, numer: 'K32', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'pracuje',    osnowId: null, artIdOverride: null },
    { id: 33, numer: 'K33', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'wiazanie',   osnowId: null, artIdOverride: null },
    { id: 34, numer: 'K34', typId: 7, rodzaj: 'rapier',    szerokoscCm: 150, status: 'brak',       osnowId: null, artIdOverride: null },
    { id: 35, numer: 'K35', typId: 8, rodzaj: 'rapier',    szerokoscCm: 220, status: 'pracuje',    osnowId: null, artIdOverride: null },
    { id: 36, numer: 'K36', typId: 8, rodzaj: 'rapier',    szerokoscCm: 220, status: 'awaria',     osnowId: null, artIdOverride: null },
    { id: 37, numer: 'K37', typId: 8, rodzaj: 'rapier',    szerokoscCm: 220, status: 'brak',       osnowId: null, artIdOverride: null },
    { id: 38, numer: 'K38', typId: 9, rodzaj: 'rapier',    szerokoscCm: 230, status: 'pracuje',    osnowId: null, artIdOverride: null },
    { id: 39, numer: 'K39', typId: 9, rodzaj: 'rapier',    szerokoscCm: 230, status: 'brak',       osnowId: null, artIdOverride: null },
  ],

  // ---- Osnowy ----
  osnowy: [
    // On looms
    { id:  1, numer: 'O-001/2026', artId: 1, metry: 720,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid:  1, statusPrzerobki: null },
    { id:  2, numer: 'O-002/2026', artId: 2, metry: 860,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid:  2, statusPrzerobki: null },
    { id:  3, numer: 'O-003/2026', artId: 3, metry: 540,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid:  3, statusPrzerobki: null },
    { id:  4, numer: 'O-004/2026', artId: 4, metry: 1200, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid:  5, statusPrzerobki: null },
    { id:  5, numer: 'O-005/2026', artId: 5, metry: 680,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid:  6, statusPrzerobki: null },
    { id:  6, numer: 'O-006/2026', artId: 6, metry: 950,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid:  9, statusPrzerobki: null },
    { id:  7, numer: 'O-007/2026', artId: 7, metry: 440,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 10, statusPrzerobki: null },
    { id:  8, numer: 'O-008/2026', artId: 8, metry: 1100, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 11, statusPrzerobki: null },
    { id:  9, numer: 'O-009/2026', artId: 9, metry: 320,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 12, statusPrzerobki: null },
    { id: 10, numer: 'O-010/2026', artId: 1, metry: 890,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 15, statusPrzerobki: null },
    { id: 11, numer: 'O-011/2026', artId: 2, metry: 760,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 16, statusPrzerobki: null },
    { id: 12, numer: 'O-012/2026', artId: 3, metry: 610,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 17, statusPrzerobki: null },
    { id: 13, numer: 'O-013/2026', artId: 4, metry: 1050, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 19, statusPrzerobki: null },
    { id: 14, numer: 'O-014/2026', artId: 5, metry: 830,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 20, statusPrzerobki: null },
    { id: 15, numer: 'O-015/2026', artId: 6, metry: 490,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 22, statusPrzerobki: null },
    { id: 16, numer: 'O-016/2026', artId: 7, metry: 1300, statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 23, statusPrzerobki: null },
    { id: 17, numer: 'O-017/2026', artId: 8, metry: 670,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 24, statusPrzerobki: null },
    { id: 18, numer: 'O-018/2026', artId: 9, metry: 580,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 25, statusPrzerobki: null },
    { id: 19, numer: 'O-019/2026', artId: 1, metry: 920,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 27, statusPrzerobki: null },
    { id: 20, numer: 'O-020/2026', artId: 2, metry: 740,  statusPrzew: 'przewleczona',    lokalizacja: 'krosno',        krosnoid: 28, statusPrzerobki: null },
    // In magazyn
    { id: 21, numer: 'O-021/2026', artId: 3, metry: 1200, statusPrzew: 'przewleczona',    lokalizacja: 'magazyn',       krosnoid: null, statusPrzerobki: null },
    { id: 22, numer: 'O-022/2026', artId: 4, metry: null,  statusPrzew: 'nieprzewleczona', lokalizacja: 'magazyn',      krosnoid: null, statusPrzerobki: null },
    { id: 23, numer: 'O-023/2026', artId: 5, metry: 800,  statusPrzew: 'nieprzewleczona', lokalizacja: 'magazyn',       krosnoid: null, statusPrzerobki: null },
    { id: 24, numer: 'O-024/2026', artId: 6, metry: 650,  statusPrzew: 'przewleczona',    lokalizacja: 'magazyn',       krosnoid: null, statusPrzerobki: null },
    { id: 25, numer: 'O-025/2026', artId: 7, metry: 450,  statusPrzew: 'nieprzewleczona', lokalizacja: 'magazyn',       krosnoid: null, statusPrzerobki: null },
    // In przewlekalnia
    { id: 26, numer: 'O-026/2026', artId: 8, metry: 1100, statusPrzew: 'nieprzewleczona', lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'w_kolejce' },
    { id: 27, numer: 'O-027/2026', artId: 9, metry: 900,  statusPrzew: 'nieprzewleczona', lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'w_przygotowaniu' },
    { id: 28, numer: 'O-028/2026', artId: 1, metry: 1050, statusPrzew: 'przewleczona',    lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'przewleczona' },
    { id: 29, numer: 'O-029/2026', artId: 2, metry: 780,  statusPrzew: 'nieprzewleczona', lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'w_kolejce' },
    { id: 30, numer: 'O-030/2026', artId: 4, metry: 960,  statusPrzew: 'przewleczona',    lokalizacja: 'przewlekalnia', krosnoid: null, statusPrzerobki: 'przewleczona' },
  ],

  // ---- Pracownicy ----
  pracownicy: [
    { id:  1, imie: 'Jan',       nazwisko: 'Kowalski',    stanowisko: 'tkalnia' },
    { id:  2, imie: 'Anna',      nazwisko: 'Nowak',       stanowisko: 'snowalnia' },
    { id:  3, imie: 'Piotr',     nazwisko: 'Wiśniewski',  stanowisko: 'tkalnia' },
    { id:  4, imie: 'Maria',     nazwisko: 'Wójcik',      stanowisko: 'klejarnia' },
    { id:  5, imie: 'Tomasz',    nazwisko: 'Kowalczyk',   stanowisko: 'tkalnia' },
    { id:  6, imie: 'Agnieszka', nazwisko: 'Kamińska',    stanowisko: 'przewlekalnia' },
    { id:  7, imie: 'Marek',     nazwisko: 'Lewandowski', stanowisko: 'tkalnia' },
    { id:  8, imie: 'Ewa',       nazwisko: 'Zielińska',   stanowisko: 'snowalnia' },
    { id:  9, imie: 'Krzysztof', nazwisko: 'Szymański',   stanowisko: 'klejarnia' },
    { id: 10, imie: 'Barbara',   nazwisko: 'Woźniak',     stanowisko: 'tkalnia' },
  ],

  // ---- Zmiany tygodniowe ----
  zmianyTygodniowe: { 1: 1, 2: 2, 3: 1, 4: 2, 5: 1, 6: 1, 7: 2, 8: 2, 9: 1, 10: 2 },

  // ---- Nieobecności ----
  nieobecnosci: [
    { id: 1, pracownikId: 2, typ: 'urlop', od: '2026-07-07', do: '2026-07-18' },
    { id: 2, pracownikId: 7, typ: 'chory', od: '2026-07-06', do: '2026-07-10' },
  ],

  // ---- Zlecenia produkcyjne ----
  zlecenia: [
    { id: 1, numer: 'ZL-001/2026', artId: 1, iloscM: 5000, status: 'w_trakcie',    dataUtworzenia: '2026-06-01', terminRealizacji: '2026-07-31', priorytet: 'wysoki',   uwagi: 'Stały odbiorca.',                       przekazaneDo: null },
    { id: 2, numer: 'ZL-002/2026', artId: 3, iloscM: 3000, status: 'w_trakcie',    dataUtworzenia: '2026-06-15', terminRealizacji: '2026-08-15', priorytet: 'standard', uwagi: '',                                      przekazaneDo: null },
    { id: 3, numer: 'ZL-003/2026', artId: 5, iloscM: 2000, status: 'zrealizowane', dataUtworzenia: '2026-05-01', terminRealizacji: '2026-06-30', priorytet: 'niski',    uwagi: 'Partia zamknięta.',                      przekazaneDo: null },
    { id: 4, numer: 'ZL-004/2026', artId: 2, iloscM: 4000, status: 'nowe',         dataUtworzenia: '2026-07-01', terminRealizacji: '2026-09-01', priorytet: 'standard', uwagi: '',                                      przekazaneDo: null },
    { id: 5, numer: 'ZL-005/2026', artId: 7, iloscM: 1500, status: 'w_trakcie',    dataUtworzenia: '2026-06-20', terminRealizacji: '2026-07-25', priorytet: 'wysoki',   uwagi: 'Do skoordynowania z planem zmian.',      przekazaneDo: null },
    { id: 6, numer: 'ZL-006/2026', artId: 4, iloscM: 6000, status: 'nowe',         dataUtworzenia: '2026-07-05', terminRealizacji: '2026-10-01', priorytet: 'standard', uwagi: '',                                      przekazaneDo: null },
  ],

  // ---- Snowalnia ----
  snowalnia: [
    { id: 1, numer: 'SN-001/2026', artId: 1, metry: 1200, status: 'gotowe',    dataPlanowana: '2026-07-01', uwagi: '' },
    { id: 2, numer: 'SN-002/2026', artId: 3, metry: 900,  status: 'w_trakcie', dataPlanowana: '2026-07-06', uwagi: 'Priorytetowe' },
    { id: 3, numer: 'SN-003/2026', artId: 5, metry: 1100, status: 'w_kolejce', dataPlanowana: '2026-07-08', uwagi: '' },
    { id: 4, numer: 'SN-004/2026', artId: 2, metry: 800,  status: 'w_trakcie', dataPlanowana: '2026-07-07', uwagi: '' },
    { id: 5, numer: 'SN-005/2026', artId: 7, metry: 600,  status: 'gotowe',    dataPlanowana: '2026-06-28', uwagi: '' },
    { id: 6, numer: 'SN-006/2026', artId: 9, metry: 1000, status: 'w_kolejce', dataPlanowana: '2026-07-09', uwagi: '' },
  ],

  // ---- Klejarnia ----
  klejarnia: [
    { id: 1, numer: 'KL-001/2026', artId: 3, metry: 900,  status: 'gotowe',    dataPlanowana: '2026-07-03', uwagi: '' },
    { id: 2, numer: 'KL-002/2026', artId: 5, metry: 1100, status: 'w_trakcie', dataPlanowana: '2026-07-06', uwagi: '' },
    { id: 3, numer: 'KL-003/2026', artId: 8, metry: 700,  status: 'w_kolejce', dataPlanowana: '2026-07-08', uwagi: '' },
    { id: 4, numer: 'KL-004/2026', artId: 3, metry: 800,  status: 'w_kolejce', dataPlanowana: '2026-07-10', uwagi: 'Pilne' },
  ],

  // ---- Historia artykułów ----
  historiaArtykulow: {
    1:  [{ data: '2026-06-02', typ: 'utworzenie', opis: 'Dodano artykuł BT 367 do kartoteki technologicznej.',             uzytkownik: 'Planista' }, { data: '2026-06-11', typ: 'aktualizacja', opis: 'Zweryfikowano parametry technologiczne i szerokość tkaniny (150 cm).', uzytkownik: 'Technolog' }],
    2:  [{ data: '2026-06-03', typ: 'utworzenie', opis: 'Dodano artykuł BT 773/150 do kartoteki technologicznej.',         uzytkownik: 'Planista' }, { data: '2026-06-12', typ: 'aktualizacja', opis: 'Zweryfikowano parametry technologiczne i szerokość tkaniny (148 cm).', uzytkownik: 'Technolog' }],
    3:  [{ data: '2026-06-04', typ: 'utworzenie', opis: 'Dodano artykuł BTR 130 do kartoteki technologicznej.',            uzytkownik: 'Planista' }, { data: '2026-06-13', typ: 'aktualizacja', opis: 'Uzupełniono parametry i uwagi technologiczne (130 cm).',              uzytkownik: 'Technolog' }],
    4:  [{ data: '2026-06-05', typ: 'utworzenie', opis: 'Dodano artykuł AT 210 do kartoteki technologicznej.',             uzytkownik: 'Planista' }, { data: '2026-06-14', typ: 'aktualizacja', opis: 'Zweryfikowano parametry technologiczne i szerokość tkaniny (200 cm).', uzytkownik: 'Technolog' }],
    5:  [{ data: '2026-06-06', typ: 'utworzenie', opis: 'Dodano artykuł AT 155 do kartoteki technologicznej.',             uzytkownik: 'Planista' }, { data: '2026-06-15', typ: 'aktualizacja', opis: 'Uzupełniono parametry i uwagi technologiczne (155 cm).',              uzytkownik: 'Technolog' }],
    6:  [{ data: '2026-06-07', typ: 'utworzenie', opis: 'Dodano artykuł BT 500 do kartoteki technologicznej.',             uzytkownik: 'Planista' }, { data: '2026-06-16', typ: 'aktualizacja', opis: 'Zweryfikowano parametry technologiczne i szerokość tkaniny (215 cm).', uzytkownik: 'Technolog' }],
    7:  [{ data: '2026-06-08', typ: 'utworzenie', opis: 'Dodano artykuł BT 220 do kartoteki technologicznej.',             uzytkownik: 'Planista' }, { data: '2026-06-17', typ: 'aktualizacja', opis: 'Uzupełniono parametry i uwagi technologiczne (140 cm).',              uzytkownik: 'Technolog' }],
    8:  [{ data: '2026-06-09', typ: 'utworzenie', opis: 'Dodano artykuł BTR 200 do kartoteki technologicznej.',            uzytkownik: 'Planista' }, { data: '2026-06-18', typ: 'aktualizacja', opis: 'Uzupełniono parametry i uwagi technologiczne (188 cm).',              uzytkownik: 'Technolog' }],
    9:  [{ data: '2026-06-10', typ: 'utworzenie', opis: 'Dodano artykuł AT 300 do kartoteki technologicznej.',             uzytkownik: 'Planista' }, { data: '2026-06-19', typ: 'aktualizacja', opis: 'Zweryfikowano parametry technologiczne i szerokość tkaniny (180 cm).', uzytkownik: 'Technolog' }],
  },

  // ---- Historia krosien ----
  historiaKrosien: {
    1:  [{ data: '2026-07-01', typ: 'zalozenie_osnowy', opis: 'Założono osnowę O-001/2026 – Osnowa BT 367.',                                 uzytkownik: 'J. Kowalski' }, { data: '2026-06-20', typ: 'zdjecie_osnowy', opis: 'Zdjęto osnowę O-000/2026 (530 m pozostałych). Osnowa zwrócona do magazynu.', uzytkownik: 'T. Kowalczyk' }],
    2:  [{ data: '2026-07-05', typ: 'zmiana_statusu',   opis: 'Status zmieniony na: awaria.',                                                uzytkownik: 'P. Wiśniewski' }, { data: '2026-07-02', typ: 'zmiana_artykulu', opis: 'Ręczna zmiana artykułu: BT 773/150 → BTR 130.',                              uzytkownik: 'J. Kowalski' }],
    15: [{ data: '2026-06-16', typ: 'zalozenie_osnowy', opis: 'Założono osnowę O-010/2026 – Osnowa BT 367.',                                 uzytkownik: 'A. Kamińska' },  { data: '2026-06-15', typ: 'zdjecie_osnowy',  opis: 'Zdjęto osnowę O-009/2025 (80 m pozostałych). Osnowa zwrócona do magazynu.',   uzytkownik: 'A. Kamińska' }],
    19: [{ data: '2026-07-01', typ: 'zmiana_statusu',   opis: 'Status zmieniony na: pracuje.',                                               uzytkownik: 'M. Wójcik' },    { data: '2026-06-28', typ: 'zalozenie_osnowy', opis: 'Założono osnowę O-013/2026 – Osnowa AT 210.',                                 uzytkownik: 'M. Wójcik' }],
  },

  // ---- Obecności (sample attendance history) ----
  obecnosci: {
    '2026-07-07_1': [
      { pracownikId: 1, status: 'obecny',   stanowisko: 'tkalnia' },
      { pracownikId: 3, status: 'obecny',   stanowisko: 'snowalnia' },
      { pracownikId: 5, status: 'obecny',   stanowisko: 'tkalnia' },
      { pracownikId: 6, status: 'obecny',   stanowisko: 'przewlekalnia' },
      { pracownikId: 9, status: 'obecny',   stanowisko: 'klejarnia' },
    ],
    '2026-07-07_2': [
      { pracownikId: 2,  status: 'urlop',   stanowisko: 'snowalnia' },
      { pracownikId: 4,  status: 'obecny',  stanowisko: 'klejarnia' },
      { pracownikId: 7,  status: 'chory',   stanowisko: 'tkalnia' },
      { pracownikId: 8,  status: 'obecny',  stanowisko: 'snowalnia' },
      { pracownikId: 10, status: 'obecny',  stanowisko: 'tkalnia' },
    ],
  },

  // ---- ID counters ----
  nextId: {
    artykul:     10,
    typKrosna:   10,
    krosno:      40,
    osnowa:      31,
    pracownik:   11,
    zlecenie:     7,
    snowalnia:    7,
    klejarnia:    5,
    nieobecnosc:  3,
  },
};
