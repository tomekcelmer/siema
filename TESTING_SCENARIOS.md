# Scenariusze Testowe - Aplikacja Negocjacyjna

## Przygotowanie do Testów

### Wymagania:
- Co najmniej 2 okna przeglądarki (najlepiej jedno normalne, jedno incognito)
- Hasło gospodarza: **Pandka123**
- Różne kody eksperymentów dla testów izolacji

---

## TEST 1: Pełny Flow Wariant A (Bez pytania, bez tabeli)

### Krok 1: Logowanie Gospodarza
1. Otwórz aplikację w oknie 1
2. Kliknij "Gospodarz"
3. Wpisz hasło: `Pandka123`
4. Wpisz kod eksperymentu: `test1`
5. Kliknij "Zaloguj"
6. ✅ Sprawdź: Widzisz pustą listę uczestników

### Krok 2: Rejestracja Uczestników (2 osoby)
1. Otwórz aplikację w oknie 2 (incognito)
2. Kliknij "Uczestnik"
3. Wpisz kod: `test1`
4. Kliknij "Dołącz"
5. Strona 1: Kliknij "Dalej"
6. Strona 2: Wypełnij:
   - Imię: Jan
   - Nazwisko: Kowalski
   - ✅ Zaznacz checkbox zgody
   - Kliknij "Dalej"
7. Strona 3: Widzisz "Oczekiwanie na start"
8. ✅ Zapisz sobie ID sesji!

9. Otwórz aplikację w oknie 3 (nowa karta incognito)
10. Powtórz kroki 2-8 dla drugiej osoby:
    - Imię: Anna
    - Nazwisko: Nowak

### Krok 3: Sprawdzenie Listy Gospodarza
1. Wróć do okna gospodarza
2. ✅ Sprawdź: Widzisz 2 uczestników z pełnymi ID sesji
3. ✅ Sprawdź: Widzisz imiona i nazwiska

### Krok 4: Start Eksperymentu 1 (Anonimowy)
1. Kliknij "Start Eksperymentu 1"
2. ✅ Sprawdź panel gospodarza:
   - Widzisz 1 pokój czatowy
   - Widzisz przypisanie ról (Sprzedający/Kupujący)
   - Widzisz wariant (może być A, B, C lub D)
   - Widzisz timer 10:00

### Krok 5: Instrukcje (Uczestnicy)
1. Wróć do okien uczestników
2. ✅ Sprawdź Stronę 4:
   - Widzisz instrukcje dla swojego wariantu
   - Jeśli wariant A lub B: BEZ informacji o pytaniu
   - Jeśli wariant B lub D: Z informacją o tabeli cen (800-1000 zł)
   - Jeśli wariant C lub D: Z informacją o pytaniu
3. Wpisz cenę zadeklarowaną (np. 800 dla sprzedającego, 1000 dla kupującego)
4. Kliknij "Dalej"
5. Strona 5: Widzisz "Czekanie na parę"

### Krok 6: Chat i Negocjacje
1. Po połączeniu pary → Strona 6
2. ✅ Sprawdź:
   - Timer startuje od 10:00
   - W Eksperymencie 1: Widoczne jako "Sprzedający" i "Kupujący" (anonimowo)
   - Jeśli wariant C lub D: Sprzedający automatycznie wysyła pytanie: "Jaka jest najwyższa cena, którą byś zaakceptował?"

3. Przetestuj czat:
   - Wyślij wiadomość tekstową
   - ✅ Sprawdź timestamp
   - ✅ Sprawdź: Gospodarz widzi wiadomości w czasie rzeczywistym

4. Przetestuj ofertę:
   - Kliknij "Wyślij Ofertę Transakcji"
   - Wpisz cenę: 900
   - Wyślij
   - ✅ Druga osoba widzi przyciski "Potwierdź" / "Odrzuć"

5. Odrzuć pierwszą ofertę
   - ✅ Sprawdź: Czat trwa dalej

6. Wyślij nową ofertę i zaakceptuj
   - ✅ Sprawdź: Oba okna przechodzą do Strony 8

### Krok 7: Strona Zakończenia
✅ Sprawdź Stronę 8:
- Widzisz "Transakcja Zawarta"
- Wynegocjowana cena: 900 zł
- Nagroda sprzedającego: 900 - 700 = 200 zł
- Nagroda kupującego: 1100 - 900 = 200 zł
- Widoczna rola i wariant
- Widoczna zadeklarowana cena

### Krok 8: Panel Gospodarza - Wyniki
✅ Sprawdź panel gospodarza:
1. Pokój ma status "Zakończony"
2. Widoczna cena finalna
3. Kliknij "Eksport Wyników" → Plik CSV z:
   - Imiona, nazwiska
   - Role, warianty
   - Ceny zadeklarowane
   - Cena finalna
   - Nagrody
   - Czas transakcji
4. Kliknij "Eksport Czatów" → Plik JSON z całą historią

---

## TEST 2: Eksperyment 2 (Z imionami)

### Wykonaj Test 1, ale:
1. W kroku 4 kliknij "Start Eksperymentu 2"
2. ✅ Sprawdź w czacie: Widoczne są imiona uczestników (np. "Jan Kowalski")
3. ✅ Sprawdź panel gospodarza: Imiona widoczne w monitoringu

---

## TEST 3: Timeout (Brak Transakcji)

1. Wykonaj kroki 1-6 z Testu 1
2. NIE wysyłaj żadnej oferty
3. Czekaj aż timer zejdzie do 2:00
4. ✅ Sprawdź: Pojawia się ostrzeżenie "Pozostały 2 minuty!"
5. Czekaj aż timer dojdzie do 0:00
6. ✅ Sprawdź Stronę 8:
   - "Brak Transakcji"
   - Nagroda: 0.00 zł

---

## TEST 4: Warianty C i D (Automatyczne pytanie)

### Przygotowanie:
1. Zarejestruj co najmniej 6-8 uczestników z kodem `test4`
2. Start eksperymentu
3. ✅ System losuje równo do wariantów A, B, C, D

### Testowanie:
1. Znajdź parę z wariantem C lub D
2. ✅ Sprawdź: Po wejściu do czatu, sprzedający AUTOMATYCZNIE wysyła pytanie: "Jaka jest najwyższa cena, którą byś zaakceptował?"
3. ✅ Sprawdź: Kupujący widzi to pytanie jako pierwszą wiadomość

---

## TEST 5: Recovery (Awaria uczestnika)

1. Zarejestruj uczestnika (np. "Test User")
2. Zapisz jego **pełne ID sesji** z panelu gospodarza
3. Zamknij okno uczestnika
4. Otwórz nowe okno przeglądarki
5. Przejdź na: `/recovery?id=[PEŁNE_ID]`
6. ✅ Sprawdź: Uczestnik wraca dokładnie do miejsca, gdzie był

---

## TEST 6: Izolacja Eksperymentów

1. Gospodarz 1: Hasło `Pandka123`, kod `arbuz`
2. Gospodarz 2 (inna karta): Hasło `Pandka123`, kod `gruszka`
3. Uczestnik A: Dołącza do `arbuz`
4. Uczestnik B: Dołącza do `gruszka`
5. ✅ Sprawdź:
   - Gospodarz 1 widzi tylko uczestnika A
   - Gospodarz 2 widzi tylko uczestnika B
   - Eksperymenty są całkowicie oddzielone

---

## TEST 7: Równomierne Losowanie

### Dla 8 uczestników:
1. Zarejestruj 8 uczestników z tym samym kodem
2. Start eksperymentu
3. ✅ Sprawdź rozkład wariantów:
   - Powinno być: 2xA, 2xB, 2xC, 2xD (4 pary)
   - W każdym wariancie: 1 sprzedający + 1 kupujący

### Dla 10 uczestników:
1. Zarejestruj 10 uczestników
2. Start eksperymentu
3. ✅ Sprawdź rozkład:
   - Możliwe: 3xA, 3xB, 2xC, 2xD lub podobne równe rozkłady
   - W każdym wariancie: równo S i K

---

## TEST 8: Wszystkie Warianty

### Wariant A: Bez pytania, bez tabeli
✅ Instrukcje: Brak informacji o cenie rynkowej, brak automatycznego pytania

### Wariant B: Bez pytania, z tabelą
✅ Instrukcje: "Po wstępnym rozeznaniu udało się ocenić, że taki smartfon może być wart od 800 do 1000 zł."

### Wariant C: Z pytaniem, bez tabeli
✅ Instrukcje: "W związku z tym, na początku negocjacji zostanie zadane pytanie..."
✅ Czat: Automatyczne pytanie od sprzedającego

### Wariant D: Z pytaniem, z tabelą
✅ Instrukcje: Informacja o tabeli cen + informacja o pytaniu
✅ Czat: Automatyczne pytanie od sprzedającego

---

## TEST 9: Validacja Cen

### Cena Zadeklarowana (Strona 4):
1. Wpisz tekst → ✅ Nie pozwala dalej
2. Wpisz liczbę ujemną → ✅ Nie pozwala dalej
3. Wpisz 850.123 (3 miejsca) → ✅ Nie pozwala dalej
4. Wpisz 850.50 → ✅ Pozwala dalej

### Oferta w Czacie:
1. Wpisz tekst → ✅ Nie wysyła
2. Wpisz 900.123 → ✅ Nie wysyła
3. Wpisz 900.50 → ✅ Wysyła poprawnie

---

## TEST 10: Monitoring Gospodarza

✅ Sprawdź panel aktywnego eksperymentu:
1. Widoczne wszystkie pokoje
2. Każdy pokój pokazuje:
   - Numer pokoju
   - Wariant (A/B/C/D)
   - Status (Aktywny/Zakończony/Brak transakcji)
   - Timer (dla aktywnych)
   - Imiona sprzedającego i kupującego
   - Ceny zadeklarowane (min dla S, max dla K)
   - Cena finalna (jeśli zakończony)
3. Kliknięcie na pokój → Wgląd do czatu
4. Czat aktualizuje się w czasie rzeczywistym
5. Widać wszystkie wiadomości z timestampami
6. Widać status ofert (oczekuje/zaakceptowana/odrzucona)

---

## Podsumowanie Checklisty

### Funkcjonalność podstawowa:
- [ ] Logowanie gospodarza z hasłem
- [ ] Kody eksperymentów działają
- [ ] Izolacja eksperymentów
- [ ] Rejestracja uczestników
- [ ] Pełne ID sesji widoczne dla gospodarza
- [ ] Recovery przez URL

### Losowanie i parowanie:
- [ ] Równe rozkłady wariantów A, B, C, D
- [ ] Równe rozkłady ról (S/K) w każdym wariancie
- [ ] Parowanie tylko S-K w tym samym wariancie

### Instrukcje:
- [ ] Wariant A: Bez pytania, bez tabeli
- [ ] Wariant B: Bez pytania, z tabelą (800-1000)
- [ ] Wariant C: Z pytaniem, bez tabeli
- [ ] Wariant D: Z pytaniem, z tabelą

### Chat i timer:
- [ ] Timer 10 minut startuje po połączeniu
- [ ] Ostrzeżenie przy 2 minutach
- [ ] Automatyczne pytanie w C i D
- [ ] Wiadomości tekstowe działają
- [ ] Timestampy są poprawne

### Oferty:
- [ ] Wysyłanie oferty z ceną
- [ ] Potwierdzenie → Transakcja + Strona 8
- [ ] Odrzucenie → Kontynuacja czatu
- [ ] Timeout → Brak transakcji + Strona 8

### Nagrody:
- [ ] Sprzedający: Cena - 700
- [ ] Kupujący: 1100 - Cena
- [ ] Brak transakcji: 0

### Tożsamość:
- [ ] Eksperyment 1: Anonimowo (sprzedający/kupujący)
- [ ] Eksperyment 2: Z imionami

### Panel gospodarza:
- [ ] Lista uczestników z pełnymi ID
- [ ] Monitoring pokoi z timerami
- [ ] Wgląd do czatów w czasie rzeczywistym
- [ ] Eksport wyników (CSV)
- [ ] Eksport czatów (JSON)

### Validacja:
- [ ] Cena zadeklarowana: dodatnia, max 2 miejsca po przecinku
- [ ] Oferta: dodatnia, max 2 miejsca po przecinku

---

## Znane Ograniczenia

1. **Komunikacja w czasie rzeczywistym**: Używa localStorage + events (nie WebSockets)
2. **Single device**: Wszystkie okna muszą być na tym samym urządzeniu
3. **Brak autentyfikacji**: Hasło gospodarza przechowywane lokalnie

---

## Wsparcie

W razie problemów:
1. Sprawdź Console (F12) w przeglądarce
2. Sprawdź localStorage: Application → Local Storage
3. Użyj Recovery URL z pełnym ID sesji uczestnika
