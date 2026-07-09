// ============================================================
// types/domain.ts – Domain types for Technotex Plan produkcji
// All entities mirror the existing frontend data model.
// ============================================================

// ---- Artykuły ----
export interface Artykul {
  id: number;
  nazwa: string;
  watkiNaCm: number;
  /** 'tak' | 'nie' */
  rozpinka: 'tak' | 'nie';
  /** 'taśmowe' | 'zespołowe' */
  rodzajSnucia: 'taśmowe' | 'zespołowe';
  szerokoscTkaniny: number;
  uwagi: string;
}

// ---- Typy krosien ----
export interface TypKrosna {
  id: number;
  nazwa: string;
  /** CSS colour string, e.g. '#2980b9' */
  kolor: string;
}

// ---- Krosna ----
export type StatusKrosna = 'pracuje' | 'awaria' | 'zatrzymane' | 'wiazanie' | 'brak';

export interface Krosno {
  id: number;
  numer: string;
  typId: number;
  /** 'pneumatyk' | 'rapier' */
  rodzaj: 'pneumatyk' | 'rapier';
  szerokoscCm: number;
  status: StatusKrosna;
  /** ID osnowy currently on this loom, or null */
  osnowId: number | null;
  /** Manual article override (overrides the article from the osnowa), or null */
  artIdOverride: number | null;
}

// ---- Osnowy ----
export type LokalizacjaOsnowy = 'magazyn' | 'przewlekalnia' | 'krosno' | 'snowalnia' | 'klejarnia';
export type StatusPrzew = 'przewleczona' | 'nieprzewleczona';
export type StatusPrzerobki = 'w_kolejce' | 'w_przygotowaniu' | 'przewleczona' | null;

export interface Osnowa {
  id: number;
  numer: string;
  artId: number;
  /** Length in metres (null = not yet measured) */
  metry: number | null;
  statusPrzew: StatusPrzew;
  lokalizacja: LokalizacjaOsnowy;
  krosnoid: number | null;
  statusPrzerobki: StatusPrzerobki;
  /** ID of the zlecenie this osnowa was split from (if any) */
  zlecenieId?: number | null;
}

// ---- Zlecenia produkcyjne ----
export type StatusZlecenia = 'nowe' | 'w_trakcie' | 'zrealizowane';
export type Priorytet = 'niski' | 'standard' | 'wysoki' | 'krytyczny';

export interface Zlecenie {
  id: number;
  numer: string;
  artId: number;
  iloscM: number;
  status: StatusZlecenia;
  dataUtworzenia: string; // ISO date string YYYY-MM-DD
  terminRealizacji: string; // ISO date string YYYY-MM-DD
  priorytet: Priorytet;
  uwagi: string;
  /** Department this order has been forwarded to ('snowalnia' | 'klejarnia' | null) */
  przekazaneDo: 'snowalnia' | 'klejarnia' | null;
  /** Planned split lengths in metres (for snowalnia/klejarnia batches) */
  splitLengths?: number[];
}

// ---- Snowalnia batches ----
export type StatusPartii = 'w_kolejce' | 'w_trakcie' | 'gotowe' | 'zarchiwizowane';

export interface PartiaSnowalnia {
  id: number;
  numer: string;
  artId: number;
  metry: number;
  status: StatusPartii;
  dataPlanowana: string; // ISO date string YYYY-MM-DD
  uwagi: string;
  zlecenieId?: number | null;
  splitLengths?: number[];
}

// ---- Klejarnia batches ----
export interface PartiaKlejarnia {
  id: number;
  numer: string;
  artId: number;
  metry: number;
  status: StatusPartii;
  dataPlanowana: string; // ISO date string YYYY-MM-DD
  uwagi: string;
  zlecenieId?: number | null;
  splitLengths?: number[];
}

// ---- Pracownicy ----
export type Stanowisko = 'tkalnia' | 'snowalnia' | 'klejarnia' | 'przewlekalnia';

export interface Pracownik {
  id: number;
  imie: string;
  nazwisko: string;
  stanowisko: Stanowisko;
}

// ---- Zmiany tygodniowe ----
/** Map of pracownikId → shift number (1 or 2) */
export type ZmianyTygodniowe = Record<number, 1 | 2>;

// ---- Nieobecności (planned absences) ----
export type TypNieobecnosci = 'urlop' | 'chory' | 'inne';

export interface Nieobecnosc {
  id: number;
  pracownikId: number;
  typ: TypNieobecnosci;
  od: string; // ISO date
  do: string; // ISO date
}

// ---- Obecności (attendance records) ----
export type StatusObecnosci = 'obecny' | 'nieobecny' | 'chory' | 'urlop';

export interface RecordObecnosci {
  pracownikId: number;
  status: StatusObecnosci;
  stanowisko: Stanowisko;
}

/** Key format: 'YYYY-MM-DD_1' or 'YYYY-MM-DD_2' */
export type ObecnosciMap = Record<string, RecordObecnosci[]>;

// ---- Historia zmian ----
export type TypZdarzenia =
  | 'utworzenie'
  | 'aktualizacja'
  | 'usuniecie'
  | 'zlecenie'
  | 'proces'
  | 'zmiana_statusu'
  | 'zalozenie_osnowy'
  | 'zdjecie_osnowy'
  | 'zmiana_artykulu'
  | string;

export interface ZdarzenieHistorii {
  data: string; // ISO date
  typ: TypZdarzenia;
  opis: string;
  uzytkownik?: string;
}

/** Map of entity id → array of history events */
export type HistoriaMap = Record<number, ZdarzenieHistorii[]>;

// ---- Full application state ----
export interface AppState {
  artykuly: Artykul[];
  typyKrosien: TypKrosna[];
  krosna: Krosno[];
  osnowy: Osnowa[];
  pracownicy: Pracownik[];
  zmianyTygodniowe: ZmianyTygodniowe;
  nieobecnosci: Nieobecnosc[];
  zlecenia: Zlecenie[];
  snowalnia: PartiaSnowalnia[];
  klejarnia: PartiaKlejarnia[];
  historiaArtykulow: HistoriaMap;
  historiaKrosien: HistoriaMap;
  obecnosci: ObecnosciMap;
  nextId: {
    artykul: number;
    typKrosna: number;
    krosno: number;
    osnowa: number;
    pracownik: number;
    zlecenie: number;
    snowalnia: number;
    klejarnia: number;
    nieobecnosc: number;
  };
}

// ---- API response types ----
export interface ApiSuccess<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
