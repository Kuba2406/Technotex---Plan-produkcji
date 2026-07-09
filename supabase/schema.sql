-- ============================================================
-- supabase/schema.sql – PostgreSQL schema for Technotex MVP v1
--
-- Run this in the Supabase SQL editor after creating a new project.
-- See README.md for full setup instructions.
-- ============================================================

-- ---- App state table (single-table JSON approach for MVP v1) ----
-- Stores the full application state as a single JSON row.
-- Simple, low-overhead, suitable for a small team.
-- Can be migrated to normalised tables in v2.

CREATE TABLE IF NOT EXISTS app_state (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  payload     JSONB        NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (single shared login)
CREATE POLICY "Allow all for authenticated users"
  ON app_state
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow read for anon key (so the frontend can load data without JWT in dev)
-- Remove or tighten this policy when you add proper auth.
CREATE POLICY "Allow read for anon"
  ON app_state
  FOR SELECT
  TO anon
  USING (true);


-- ============================================================
-- Future normalised schema (v2 reference – not active yet)
-- Uncomment and migrate when ready to move away from the
-- single JSON blob approach.
-- ============================================================

/*

-- ---- Artykuły ----
CREATE TABLE artykuly (
  id                  SERIAL PRIMARY KEY,
  nazwa               TEXT        NOT NULL,
  watki_na_cm         NUMERIC     NOT NULL,
  rozpinka            BOOLEAN     NOT NULL DEFAULT false,
  rodzaj_snucia       TEXT        NOT NULL CHECK (rodzaj_snucia IN ('taśmowe','zespołowe')),
  szerokosc_tkaniny   NUMERIC,
  uwagi               TEXT        NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Typy krosien ----
CREATE TABLE typy_krosien (
  id      SERIAL PRIMARY KEY,
  nazwa   TEXT NOT NULL,
  kolor   TEXT NOT NULL DEFAULT '#2980b9'
);

-- ---- Krosna ----
CREATE TABLE krosna (
  id              SERIAL PRIMARY KEY,
  numer           TEXT    NOT NULL,
  typ_id          INTEGER NOT NULL REFERENCES typy_krosien(id),
  rodzaj          TEXT    NOT NULL CHECK (rodzaj IN ('pneumatyk','rapier')),
  szerokosc_cm    NUMERIC NOT NULL,
  status          TEXT    NOT NULL CHECK (status IN ('pracuje','awaria','zatrzymane','wiazanie','brak')),
  osnow_id        INTEGER REFERENCES osnowy(id) ON DELETE SET NULL,
  art_id_override INTEGER REFERENCES artykuly(id) ON DELETE SET NULL,
  pozycja         INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Osnowy ----
CREATE TABLE osnowy (
  id               SERIAL PRIMARY KEY,
  numer            TEXT    NOT NULL,
  art_id           INTEGER NOT NULL REFERENCES artykuly(id),
  metry            NUMERIC,
  status_przew     TEXT    NOT NULL CHECK (status_przew IN ('przewleczona','nieprzewleczona')),
  lokalizacja      TEXT    NOT NULL CHECK (lokalizacja IN ('magazyn','przewlekalnia','krosno','snowalnia','klejarnia')),
  krosno_id        INTEGER REFERENCES krosna(id) ON DELETE SET NULL,
  status_przerobki TEXT    CHECK (status_przerobki IN ('w_kolejce','w_przygotowaniu','przewleczona')),
  zlecenie_id      INTEGER REFERENCES zlecenia(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Zlecenia produkcyjne ----
CREATE TABLE zlecenia (
  id               SERIAL PRIMARY KEY,
  numer            TEXT    NOT NULL,
  art_id           INTEGER NOT NULL REFERENCES artykuly(id),
  ilosc_m          NUMERIC NOT NULL,
  status           TEXT    NOT NULL CHECK (status IN ('nowe','w_trakcie','zrealizowane')),
  data_utworzenia  DATE    NOT NULL DEFAULT CURRENT_DATE,
  termin_realizacji DATE   NOT NULL,
  priorytet        TEXT    NOT NULL CHECK (priorytet IN ('niski','standard','wysoki','krytyczny')) DEFAULT 'standard',
  uwagi            TEXT    NOT NULL DEFAULT '',
  przekazane_do    TEXT    CHECK (przekazane_do IN ('snowalnia','klejarnia')),
  split_lengths    INTEGER[],
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Pracownicy ----
CREATE TABLE pracownicy (
  id          SERIAL PRIMARY KEY,
  imie        TEXT NOT NULL,
  nazwisko    TEXT NOT NULL,
  stanowisko  TEXT NOT NULL CHECK (stanowisko IN ('tkalnia','snowalnia','klejarnia','przewlekalnia')),
  zmiana      SMALLINT CHECK (zmiana IN (1,2)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Nieobecności ----
CREATE TABLE nieobecnosci (
  id            SERIAL PRIMARY KEY,
  pracownik_id  INTEGER NOT NULL REFERENCES pracownicy(id) ON DELETE CASCADE,
  typ           TEXT    NOT NULL CHECK (typ IN ('urlop','chory','inne')),
  od            DATE    NOT NULL,
  do            DATE    NOT NULL,
  CONSTRAINT valid_range CHECK (od <= do)
);

-- ---- Obecności ----
CREATE TABLE obecnosci (
  id            SERIAL PRIMARY KEY,
  pracownik_id  INTEGER NOT NULL REFERENCES pracownicy(id) ON DELETE CASCADE,
  data          DATE    NOT NULL,
  zmiana        SMALLINT NOT NULL CHECK (zmiana IN (1,2)),
  status        TEXT     NOT NULL CHECK (status IN ('obecny','nieobecny','chory','urlop')),
  stanowisko    TEXT     NOT NULL,
  UNIQUE (pracownik_id, data, zmiana)
);

-- ---- Snowalnia batches ----
CREATE TABLE snowalnia (
  id              SERIAL PRIMARY KEY,
  numer           TEXT    NOT NULL,
  art_id          INTEGER NOT NULL REFERENCES artykuly(id),
  metry           NUMERIC NOT NULL,
  status          TEXT    NOT NULL CHECK (status IN ('w_kolejce','w_trakcie','gotowe','zarchiwizowane')),
  data_planowana  DATE    NOT NULL,
  uwagi           TEXT    NOT NULL DEFAULT '',
  zlecenie_id     INTEGER REFERENCES zlecenia(id) ON DELETE SET NULL,
  split_lengths   INTEGER[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Klejarnia batches ----
CREATE TABLE klejarnia (
  id              SERIAL PRIMARY KEY,
  numer           TEXT    NOT NULL,
  art_id          INTEGER NOT NULL REFERENCES artykuly(id),
  metry           NUMERIC NOT NULL,
  status          TEXT    NOT NULL CHECK (status IN ('w_kolejce','w_trakcie','gotowe','zarchiwizowane')),
  data_planowana  DATE    NOT NULL,
  uwagi           TEXT    NOT NULL DEFAULT '',
  zlecenie_id     INTEGER REFERENCES zlecenia(id) ON DELETE SET NULL,
  split_lengths   INTEGER[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Historia zmian ----
CREATE TABLE historia (
  id          SERIAL PRIMARY KEY,
  encja       TEXT    NOT NULL,  -- 'artykul' | 'krosno' | 'osnowa' | ...
  encja_id    INTEGER NOT NULL,
  data        DATE    NOT NULL DEFAULT CURRENT_DATE,
  typ         TEXT    NOT NULL,
  opis        TEXT    NOT NULL,
  uzytkownik  TEXT    NOT NULL DEFAULT 'System',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

*/
