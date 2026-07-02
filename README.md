# Technotex — Plan produkcji (BETA)

Responsywny prototyp web/PWA do podglądu układu i głównych przepływów:
Dashboard, Plan hali, Krosna, Osnowy, Przewlekalnia, Klejarnia, Snowalnia, Pracownicy.

## Uruchomienie

To statyczna aplikacja (HTML/CSS/JS). Uruchom lokalny serwer w katalogu repozytorium:

```bash
python -m http.server 8080
```

Następnie otwórz:

- `http://localhost:8080`

## Zakres BETA

- Mockowe dane i lokalny stan (bez backendu)
- Plan hali z bloczkami krosien, kolorami modelu i diodą statusu
- Drawer szczegółów krosna z akcjami osnów i historią
- Lista krosien z wyszukiwaniem i filtrem
- Osnowy z filtrowaniem/sortowaniem/wyszukiwaniem + historia
- Przewlekalnia, Klejarnia, Snowalnia jako listy zleceń + historia
- Pracownicy z filtrami i kartą statystyk
- Podstawy PWA: manifest + service worker
