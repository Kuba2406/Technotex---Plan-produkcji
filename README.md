# Technotex---Plan-produkcji

Frontend-only prototype for a production planning flow in Technotex.

## Run locally

This repository is a static HTML/CSS/JS app.

```bash
cd /home/runner/work/Technotex---Plan-produkcji/Technotex---Plan-produkcji
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Prototype scope

- Zlecenia produkcyjne with editable `priorytet`, `uwagi`, and forwarding based on article `rodzaj snucia`
- Artykuły with `szerokość tkaniny`, `Rozpinka` (`Tak` / `Nie`), `Rodzaj snucia` (`taśmowe` / `zespołowe`) and `Uwagi`
- Pracownicy with clickable detail cards and mock `statystyki pracy`
- Ustawienia → Typy krosien with name + palette color used by Tkalnia loom blocks
