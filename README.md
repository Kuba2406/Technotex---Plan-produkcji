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
- Nowocześniejszy UI z odświeżonym sidebar, kartami, tabelami, badge'ami i drawerem
- Plan hali w formie przestrzeni produkcyjnej z sektorami, alejami i rozmieszczeniem krosien
- Tryb „Edytuj układ” do przeciągania krosien po hali
- Lokalny zapis ustawienia hali w `localStorage` oraz reset układu do domyślnego
- Drawer szczegółów krosna z akcjami osnów i historią
- Lista krosien z wyszukiwaniem i filtrem
- Osnowy z filtrowaniem/sortowaniem/wyszukiwaniem + historia
- Przewlekalnia, Klejarnia, Snowalnia jako listy zleceń + historia
- Pracownicy z filtrami i kartą statystyk
- Podstawy PWA: manifest + service worker
