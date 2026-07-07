# Technotex – Plan produkcji

Frontend-only prototype of a production planning application for a weaving plant.  
All data is mock (in-memory only, no backend, no persistence).

## Uruchomienie (How to run)

```bash
# Wymagania: Python 3
python -m http.server 8080
```

Otwórz w przeglądarce: [http://localhost:8080](http://localhost:8080)

Alternatywnie – otwórz plik `index.html` bezpośrednio w przeglądarce (file://), choć tryb `http.server` jest zalecany.

## Moduły aplikacji

Nawigacja boczna jest ułożona zgodnie z kolejnością procesów produkcyjnych:

| # | Moduł | Opis |
|---|-------|------|
| 1 | **Artykuły** | Definicje artykułów (wątki/cm, rozpinka, rodzaj snucia) |
| 2 | **Zlecenia produkcyjne** | Zarządzanie zleceniami produkcji |
| 3 | **Snowalnia** | Planowanie i realizacja snucia osnów |
| 4 | **Klejarnia** | Klejenie osnów (artykuły klejone) |
| 5 | **Magazyn osnów** | Stan magazynowy osnów gotowych lub oczekujących |
| 6 | **Przewlekalnia** | Kolejka przewleczenia (w kolejce → w przygotowaniu → przewleczona) |
| 7 | **Tkalnia** | Plan hali z 39 krosnami, 9 typami, statusy i historia |
| 8 | **Obecności** | Pracownicy, plan zmian, codzienna obecność, planowane nieobecności |

## Struktura plików

```
index.html   – Szkielet HTML z nawigacją
styles.css   – Cały arkusz stylów
data.js      – Mockowe dane i stan aplikacji
app.js       – Logika wszystkich widoków i interakcji
README.md    – Ten plik
```

## Stos technologiczny

- Vanilla HTML / CSS / JavaScript (ES2020+)
- Brak frameworka, brak zależności zewnętrznych
- Brak kroku budowania (no build step)
- Jedna strona (SPA) z nawigacją hash-based

## Sprawdzenie składni JS

```bash
node --check app.js
node --check data.js
```
