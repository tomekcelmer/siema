# Quick Start Guide - Platforma Eksperymentu Negocjacyjnego

## Szybki Start

### 1. Uruchomienie Aplikacji

```bash
npm run dev
```

Aplikacja otworzy się pod adresem: `http://localhost:5173`

### 2. Przeprowadzenie Testowego Eksperymentu

#### A. Przygotowanie (Gospodarz)
1. Otwórz `http://localhost:5173` w przeglądarce
2. Kliknij **"Gospodarz"**
3. Zostaw tę kartę otwartą

#### B. Rejestracja Uczestników
1. Otwórz **nowe karty** w trybie incognito (lub różnych przeglądarkach)
2. W każdej nowej karcie otwórz `http://localhost:5173`
3. Kliknij **"Uczestnik"**
4. Przejdź przez rejestrację:
   - Kliknij "Dalej" na stronie powitalnej
   - Wpisz imię i nazwisko (może być testowe)
   - Zaznacz checkbox zgody
   - Kliknij "Dalej"
5. **Skopiuj ID sesji** (przydatne na wypadek testowania recovery)
6. Powtórz dla min. 2 uczestników (zalecane 4-8 dla pełnego testu)

#### C. Start Eksperymentu (Gospodarz)
1. Wróć do karty gospodarza
2. Sprawdź listę zarejestrowanych uczestników
3. Kliknij **"Start Eksperymentu 1"** (anonimowy) lub **"Start Eksperymentu 2"** (z imionami)
4. System automatycznie:
   - Przypisze role (sprzedający/kupujący)
   - Przypisze warianty (A, B, C, D)
   - Utworzy pary
   - Uruchomi timery

#### D. Prowadzenie Negocjacji (Uczestnicy)
1. W kartach uczestników odśwież stronę lub czekaj na automatyczne przejście
2. Przeczytaj instrukcje specyficzne dla twojego wariantu
3. Wpisz cenę graniczną (np. 850)
4. Kliknij "Przejdź do Negocjacji"
5. Czekaj na parowanie
6. Kiedy czat się otworzy:
   - Pisz wiadomości tekstowe
   - Klikaj "Wyślij Ofertę Transakcji" aby zaproponować cenę
   - Partner może **Potwierdzić** lub **Odrzucić**
   - Obserwuj timer (10 minut, ostrzeżenie po 8 minutach)

#### E. Monitoring (Gospodarz)
1. W panelu gospodarza:
   - Kliknij **"Odśwież"** aby zaktualizować dane
   - Kliknij na pokój aby zobaczyć czat w czasie rzeczywistym
   - Obserwuj statusy pokoi
   - Sprawdź zadeklarowane ceny

#### F. Zakończenie i Eksport
1. Po zakończeniu negocjacji uczestnicy zobaczą:
   - Podsumowanie transakcji
   - Wyliczoną nagrodę
2. Gospodarz może:
   - Kliknąć **"Eksport Wyników"** → CSV z danymi
   - Kliknąć **"Eksport Czatów"** → JSON z logami

## Testowanie Funkcji Recovery

1. W trakcie negocjacji zamknij kartę uczestnika
2. W panelu gospodarza znajdź ID sesji uczestnika
3. Otwórz nową kartę: `http://localhost:5173/recovery?id=[SESSION_ID]`
4. Uczestnik wraca do swojego czatu

## Przykładowe Scenariusze

### Scenariusz 1: Szybki Test (2 uczestników)
- Zarejestruj 2 uczestników
- Start Eksperymentu 1
- Będą w tym samym wariancie i różnych rolach
- Przeprowadź szybką negocjację

### Scenariusz 2: Pełny Test (8 uczestników)
- Zarejestruj 8 uczestników
- Start Eksperymentu 2
- System utworzy 4 pary w różnych wariantach
- Test wszystkich funkcji

### Scenariusz 3: Test Timeoutu
- Zarejestruj parę uczestników
- Nie zawieraj transakcji
- Poczekaj 10 minut
- Sprawdź automatyczne zakończenie z nagrodą 0 zł

## Czyszczenie Danych

Aby zresetować eksperyment:
1. Otwórz DevTools (F12)
2. Application → Local Storage
3. Usuń wszystkie klucze lub:
```javascript
localStorage.clear();
location.reload();
```

## Tipsy

- Użyj **trybu incognito** dla każdego uczestnika (osobna sesja)
- **Ctrl+Shift+N** (Chrome) lub **Ctrl+Shift+P** (Firefox) → nowe okno incognito
- Dla szybkich testów: możesz używać prostych imion jak "Test1", "Test2"
- Panel gospodarza odświeża się co sekundę automatycznie
- Czat odświeża się w czasie rzeczywistym

## Warianty Eksperymentu

### Wariant A - Podstawowy
- Sprzedający: smartfon kupiony za 700 zł
- Kupujący: budżet 1100 zł
- Brak dodatkowych informacji

### Wariant B - Z informacją rynkową
- Jak A + informacja o wartości rynkowej (800-1000 zł)

### Wariant C - Z wymuszonym pytaniem
- Jak A + automatyczne pytanie: "Jaka jest najwyższa cena, którą byś zaakceptował?"

### Wariant D - Pełny
- Jak B + automatyczne pytanie

## Rozwiązywanie Problemów

### Problem: Uczestnik nie widzi pary
- Sprawdź czy gospodarz kliknął "Start Eksperymentu"
- Odśwież stronę uczestnika

### Problem: Czat nie działa
- Sprawdź konsolę przeglądarki (F12)
- Sprawdź czy timer nie wygasł
- Odśwież obie karty uczestników

### Problem: Dane się nie eksportują
- Sprawdź czy transakcje zostały zakończone
- Sprawdź uprawnienia przeglądarki do pobierania plików

## Pytania?

Sprawdź szczegółową dokumentację w `README.md`
