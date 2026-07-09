# Technotex – Plan produkcji

System planowania produkcji dla tkalni. Śledzi artykuły, zlecenia, osnowy, krosna, pracowników i obecności przez kolejne działy produkcji.

---

## Architektura MVP v1

```
┌─────────────────────────────────────────────────────────┐
│                     Przeglądarka                        │
│  public/app.js + public/data.js + public/styles.css     │
│  Vanilla JS SPA – UI renderowany po stronie klienta     │
│  localStorage – trwałość między sesjami przeglądarki    │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch /api/*
┌──────────────────────────▼──────────────────────────────┐
│               Next.js API Routes (Node.js)              │
│  pages/api/artykuly, zlecenia, osnowy, krosna, ...      │
│  lib/repositories/* – logika CRUD                       │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
 ┌────────▼───────────┐           ┌─────────▼───────────┐
 │  In-memory store   │           │  Supabase / Postgres │
 │  (domyślne dev)    │           │  (produkcja, opcja.) │
 │  lib/db/store.ts   │           │  lib/db/client.ts    │
 └────────────────────┘           └─────────────────────┘
```

### Warstwy aplikacji

| Warstwa | Pliki | Opis |
|---|---|---|
| **Frontend** | `public/app.js`, `public/data.js`, `public/styles.css` | Istniejący prototyp Vanilla JS (UX zachowany) |
| **Typy domenowe** | `types/domain.ts` | TypeScript typy dla wszystkich encji |
| **API Routes** | `pages/api/*/index.ts`, `pages/api/*/[id].ts` | REST API dla operacji CRUD |
| **Repozytoria** | `lib/repositories/*.ts` | Logika dostępu do danych |
| **Store** | `lib/db/store.ts` | In-memory + file + Supabase store |
| **Klient Supabase** | `lib/db/client.ts` | Integracja Supabase (opcjonalna) |
| **Dane seed** | `seed/initial-data.ts` | Dane startowe i demo fixtures |
| **Schemat SQL** | `supabase/schema.sql` | Schemat PostgreSQL dla Supabase |

### Co jest prawdziwe vs co jest prototypem

| Funkcja | Status |
|---|---|
| Typy domenowe (TypeScript) | ✅ Produkcyjny |
| API Routes dla CRUD | ✅ Produkcyjny |
| Warstwa repozytoriów | ✅ Produkcyjny |
| In-memory store | ✅ Produkcyjny (dev) |
| File-based store | ✅ Produkcyjny (self-hosted) |
| Persystencja localStorage | ✅ Działa (klient) |
| Supabase integracja | 🚧 Szkielet (wymaga konfiguracji) |
| Frontend UX | ✅ Zachowany z prototypu |
| Multi-user auth | ⏳ Planowany w v2 |
| Schemat PostgreSQL v2 | 📋 Zaprojektowany w schema.sql |

---

## Uruchamianie lokalnie

### Wymagania

- Node.js 18+
- npm 9+

### Instalacja

```bash
npm install
```

### Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`.

> **Uwaga:** Bez konfiguracji backendu aplikacja używa in-memory store, który resetuje się przy restarcie serwera. Dane przeżywają reload strony dzięki localStorage w przeglądarce.

### Opcjonalnie: zapisywanie do pliku (prosty self-hosted backend)

```bash
# Skopiuj .env.example do .env.local
cp .env.example .env.local

# Ustaw w .env.local:
# STORAGE_BACKEND=file
# DATA_FILE_PATH=./data/app-state.json
```

Dane będą zapisywane do pliku JSON i przeżywają restart serwera.

### Sprawdzanie składni JavaScript

```bash
node --check public/app.js
```

---

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env.local` i uzupełnij wartości.

| Zmienna | Domyślnie | Opis |
|---|---|---|
| `STORAGE_BACKEND` | `memory` | `memory` \| `file` \| `supabase` |
| `DATA_FILE_PATH` | `./data/app-state.json` | Ścieżka do pliku (dla `file` backendu) |
| `NEXT_PUBLIC_SUPABASE_URL` | — | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Klucz anon Supabase |
| `API_ACCESS_TOKEN` | — | Opcjonalny token dostępu do API |

---

## Wdrożenie na Vercel + Supabase

### Krok 1 – Utwórz projekt Supabase

1. Wejdź na [supabase.com](https://supabase.com) i utwórz nowy projekt (plan darmowy: 2 projekty)
2. W panelu Supabase otwórz **SQL Editor**
3. Wklej i wykonaj zawartość pliku `supabase/schema.sql` (sekcja `app_state`)
4. Skopiuj **Project URL** i **anon key** z Settings → API

### Krok 2 – Wdróż na Vercel

1. Wejdź na [vercel.com](https://vercel.com) i połącz z repozytorium GitHub
2. Vercel automatycznie wykryje Next.js i skonfiguruje build
3. W ustawieniach projektu dodaj zmienne środowiskowe:
   - `STORAGE_BACKEND=supabase`
   - `NEXT_PUBLIC_SUPABASE_URL=<twój url>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<twój klucz>`

### Krok 3 – Seed danych

Po pierwszym wdrożeniu wywołaj endpoint resetu, aby załadować dane początkowe:

```bash
curl -X POST https://twoja-aplikacja.vercel.app/api/state?reset=true
```

---

## API Routes

Wszystkie endpointy zwracają `{ data: ... }` lub `{ error: "..." }`.

| Endpoint | GET | POST | PUT/PATCH | DELETE |
|---|---|---|---|---|
| `/api/artykuly` | lista | utwórz | — | — |
| `/api/artykuly/[id]` | jeden | — | edytuj | usuń |
| `/api/zlecenia` | lista | utwórz | — | — |
| `/api/zlecenia/[id]` | jeden | — | edytuj | usuń |
| `/api/osnowy` | lista | utwórz | — | — |
| `/api/osnowy/[id]` | jeden | — | edytuj | usuń |
| `/api/krosna` | lista | utwórz | — | — |
| `/api/krosna/[id]` | jeden | — | edytuj | usuń |
| `/api/typy-krosien` | lista | utwórz | — | — |
| `/api/typy-krosien/[id]` | jeden | — | edytuj | usuń |
| `/api/pracownicy` | lista | utwórz | — | — |
| `/api/pracownicy/[id]` | jeden | — | edytuj | usuń |
| `/api/obecnosci` | mapa | zapisz zmianę | zamień mapę | — |
| `/api/snowalnia` | lista | utwórz | — | — |
| `/api/snowalnia/[id]` | jeden | — | edytuj | usuń |
| `/api/klejarnia` | lista | utwórz | — | — |
| `/api/klejarnia/[id]` | jeden | — | edytuj | usuń |
| `/api/state` | pełny stan | zapisz stan | — | — |

---

## Model domenowy

### Artykuły
- `id`, `nazwa`, `watkiNaCm`
- `rozpinka`: `"tak"` \| `"nie"` (tylko te dwie wartości)
- `rodzajSnucia`: `"taśmowe"` \| `"zespołowe"`
- `szerokoscTkaniny` (cm), `uwagi`

### Zlecenia produkcyjne
- Routing zależy od artykułu: `zespołowe` → Klejarnia, `taśmowe` → Snowalnia
- `priorytet`: `niski` \| `standard` \| `wysoki` \| `krytyczny`
- `przekazaneDo`: `snowalnia` \| `klejarnia` \| `null`

### Osnowy
- Mogą powstać z podziału zlecenia lub zostać dodane ręcznie
- `lokalizacja`: `magazyn` \| `przewlekalnia` \| `krosno` \| `snowalnia` \| `klejarnia`
- Śledzenie etapu i historii zmian

### Krosna
- `status`: `pracuje` \| `awaria` \| `zatrzymane` \| `wiazanie` \| `brak`
- Kolor wizualizacji pochodzi z Typu krosna
- Historia operacji per krosno

### Pracownicy
- Przypisani do działu (`stanowisko`)
- Ewidencja obecności / zmian roboczych
- Statystyki lokalizacji

---

## Dalszy rozwój (v2)

1. **Normalizacja bazy** – migracja z JSON blob do tabel relacyjnych (schemat v2 w `supabase/schema.sql`)
2. **Auth** – Supabase Auth z jednym wspólnym loginem lub osobnymi kontami
3. **Real-time** – Supabase Realtime dla natychmiastowego odświeżania u wszystkich użytkowników
4. **PWA** – manifest i service worker dla instalacji na urządzeniach mobilnych
5. **Role** – uprawnienia per dział (tkalnia, snowalnia, klejarnia, przewlekalnia)
