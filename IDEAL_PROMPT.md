# Idealny Prompt do Stworzenia Platformy Eksperymentu Negocjacyjnego

## Kontekst

Potrzebuję stworzyć zaawansowaną aplikację webową do przeprowadzania kontrolowanych eksperymentów negocjacyjnych na uniwersytecie. Aplikacja będzie używana przez badaczy (gospodarzy) do monitorowania i przez studentów (uczestników) do przeprowadzania negocjacji.

## Wymagania Techniczne

**Stack:**
- Frontend: React 18+ z TypeScript, Vite, Tailwind CSS, Lucide React
- Backend: Supabase (PostgreSQL + Realtime subscriptions)
- Deployment: Netlify
- Baza danych: PostgreSQL z Row Level Security i Realtime

**Środowisko:**
- Node.js 18+
- Supabase project już utworzony
- Zmienne środowiskowe: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## Funkcjonalności Aplikacji

### 1. Strona Główna (3 przyciski)

Utwórz stronę główną z trzema opcjami:
- **"Uczestnik"** - rozpoczyna przepływ uczestnika eksperymentu
- **"Przywróć Sesję"** - pozwala uczestnikowi wrócić używając session_id
- **"Gospodarz"** - otwiera panel administracyjny z hasłem

Design: Ciemne tło z gradientem, nowoczesne karty z ikonami, profesjonalny wygląd.

### 2. Baza Danych - Schemat

Utwórz 4 tabele w Supabase z pełnymi migracjami:

**experiments:**
```sql
- id (TEXT, PK) - kod eksperymentu (np. "arbuz")
- name (TEXT) - nazwa wyświetlana
- experiment_type (INTEGER) - 1 (anonimowy) lub 2 (z imionami)
- status (TEXT) - 'waiting', 'active', 'completed'
- host_password (TEXT) - domyślnie 'Pandka123'
- created_at, updated_at (TIMESTAMPTZ)
```

**participants:**
```sql
- id (UUID, PK)
- session_id (UUID) - unikalny klucz do recovery
- experiment_id (TEXT, FK) - CASCADE delete
- first_name, last_name (TEXT)
- role (TEXT) - 'seller' lub 'buyer'
- variant (TEXT) - 'A', 'B', 'C' lub 'D'
- current_page (INTEGER) - 1-8, określa postęp
- consent_given (BOOLEAN)
- declared_price (NUMERIC) - cena którą uczestnik deklaruje
- final_price (NUMERIC) - wynegocjowana cena
- reward (NUMERIC) - obliczona nagroda
- transaction_time (TIMESTAMPTZ)
- pair_id (UUID, FK)
- created_at, updated_at (TIMESTAMPTZ)
```

**chat_rooms:**
```sql
- id (UUID, PK)
- experiment_id (TEXT, FK) - CASCADE delete
- seller_id (UUID, FK) - CASCADE delete
- buyer_id (UUID, FK) - CASCADE delete
- variant (TEXT)
- status (TEXT) - 'active', 'completed', 'no_transaction'
- timer_ends_at (TIMESTAMPTZ) - kończy się po 10 minutach
- created_at, updated_at (TIMESTAMPTZ)
```

**chat_messages:**
```sql
- id (UUID, PK)
- room_id (UUID, FK) - CASCADE delete
- participant_id (UUID, FK) - CASCADE delete
- message_text (TEXT)
- message_type (TEXT) - 'chat' lub 'offer'
- offer_price (NUMERIC) - jeśli type='offer'
- offer_status (TEXT) - 'pending', 'accepted', 'rejected'
- created_at (TIMESTAMPTZ)
```

**RLS:** Włącz dla wszystkich tabel z politykami: SELECT, INSERT, UPDATE, DELETE dla wszystkich (true).
**Realtime:** Włącz replikację dla wszystkich tabel.
**Indeksy:** Dodaj na experiment_id, session_id, room_id dla wydajności.

### 3. Przepływ Uczestnika (8 Stron)

**Page 1 - Powitanie:**
- Przycisk "Dalej"
- Informacje o eksperymencie

**Page 2 - Rejestracja:**
- Pole: Kod eksperymentu (walidacja - sprawdź czy istnieje w bazie, jeśli nie, pokaż błąd)
- Pole: Imię
- Pole: Nazwisko
- Checkbox: Zgoda na udział
- Przycisk "Dalej" (aktywny gdy wszystko wypełnione)
- Zapisz uczestnika z current_page=3, wygeneruj session_id
- Przycisk "Zacznij od Nowa" - usuwa uczestnika z bazy i wraca do Page 1

**Page 3 - Oczekiwanie na Start:**
- Loader animowany
- Tekst: "Oczekiwanie na start eksperymentu..."
- Wyświetl session_id użytkownika (do recovery)
- Co sekundę sprawdź czy użytkownik dostał rolę i wariant (current_page się zmieni)
- Przycisk "Zacznij od Nowa"

**Page 4 - Instrukcje:**
- Wyświetl rolę (SPRZEDAJĄCY / KUPUJĄCY) i wariant (A/B/C/D) jako badges
- Wyświetl instrukcje specyficzne dla roli i wariantu (4 warianty × 2 role = 8 różnych tekstów)
- Pole: "Cena zadeklarowana" (walidacja: liczba dodatnia, max 2 miejsca po przecinku)
- Przycisk "Gotowy" (aktywny tylko gdy cena wpisana)
- Zapisz declared_price do bazy, ustaw current_page=5

**Page 5 - Oczekiwanie na Partnera:**
- Loader animowany
- Tekst: "Para utworzona! Oczekiwanie aż partner przeczyta instrukcje i wpisze cenę..."
- Co sekundę sprawdź czy partner (druga osoba w pair_id) ma declared_price !== null
- Dopiero gdy obaj są gotowi, uruchom timer pokoju i przejdź do current_page=6

**Page 6 - Czat / Negocjacje:**
- **Header:**
  - Wyświetl instrukcje (skrócone, 3 pierwsze linijki) i rolę/wariant
  - Timer (10 minut, orientacyjny, NIE blokuje czatu)
  - Ostrzeżenie gdy zostało < 2 minuty

- **Chat:**
  - Lista wiadomości (realtime subscription na chat_messages)
  - Wiadomości własne po prawej (niebieskie), partnera po lewej (szare)
  - Typ 1 (anonimowy): wyświetl rolę zamiast imienia
  - Typ 2 (z imionami): wyświetl imię

- **Wysyłanie:**
  - Pole tekstowe + przycisk "Wyślij" dla zwykłych wiadomości
  - Przycisk "Wyślij Ofertę" otwiera pole na cenę
  - Oferta wysyłana jako message_type='offer' z offer_status='pending'

- **Odbieranie oferty:**
  - Jeśli message_type='offer' i nie jesteś nadawcą, pokaż przyciski:
    - "Potwierdź" (zielony)
    - "Odrzuć" (czerwony)

- **Akceptacja oferty:**
  - Ustaw offer_status='accepted'
  - Ustaw room.status='completed' PRZED zapisaniem uczestników
  - Oblicz nagrody:
    - Sprzedający: (price - 1000) * 0.01
    - Kupujący: (1600 - price) * 0.01
  - Zapisz final_price, reward, transaction_time, current_page=8 dla OBUBU uczestników
  - Przejdź do Page 8

- **Odrzucenie oferty:**
  - Ustaw offer_status='rejected'
  - Wyślij dodatkową wiadomość typu 'chat' z tekstem "Odrzucono ofertę: X zł" (dla realtime)

- **Zakończenie przez gospodarza:**
  - Nasłuchuj na zmianę room.status na 'no_transaction'
  - Ustaw final_price=null, reward=0, current_page=8
  - Przejdź do Page 8

**Page 7 - (Pominięta, była strona oczekiwania przed czatem, teraz zastąpiona przez Page 5)**

**Page 8 - Zakończenie:**
- Jeśli final_price istnieje:
  - Pokaż: "Transakcja zawarta!"
  - Wyświetl cenę finalną
  - Wyświetl nagrodę
- Jeśli final_price === null:
  - Pokaż: "Nie zawarto transakcji"
  - Wyświetl nagrodę: 0 zł
- Podziękowanie za udział

### 4. Przepływ Przywracania Sesji

**Recovery Page:**
- Pole: Session ID (UUID)
- Przycisk "Przywróć Sesję"
- Walidacja: sprawdź czy uczestnik o tym session_id istnieje
- Jeśli tak: załaduj uczestnika i przekieruj do odpowiedniej strony (current_page)
- Jeśli nie: pokaż błąd "Nie znaleziono sesji"
- Przycisk "Powrót" do strony głównej

### 5. Panel Gospodarza

**Autoryzacja:**
- Pole: Hasło gospodarza
- Domyślne hasło: "Pandka123"
- Sprawdź czy jakikolwiek eksperyment ma to hasło (lub po prostu wpuść)

**Dashboard - Lista Eksperymentów:**
- Wyświetl wszystkie eksperymenty z tabeli
- Dla każdego: nazwa, kod, typ, status, data utworzenia
- Przycisk "Utwórz Nowy Eksperyment"
- Przycisk "Zobacz" dla każdego eksperymentu
- Przycisk "Usuń" (z potwierdzeniem, usuwa CASCADE)

**Tworzenie Eksperymentu:**
- Modal z polami:
  - Kod eksperymentu (krótki, np. "arbuz")
  - Nazwa (wyświetlana)
  - Typ: Radio buttons (1: anonimowy, 2: z imionami)
- Zapisz z status='waiting'

**Widok Eksperymentu - Status "waiting":**
- Wyświetl kod i nazwę
- **Lista Oczekujących Uczestników:**
  - Tabela: #, Imię, Nazwisko, Session ID, Czas rejestracji, Przycisk "Usuń"
  - Odświeżanie co 2 sekundy (lub realtime subscription)
  - Przycisk "Kopiuj" przy session_id
- **Przycisk "Rozpocznij Eksperyment":**
  - Zmień status na 'active'
  - Uruchom algorytm parowania

**Algorytm Parowania:**
1. Pobierz wszystkich uczestników z current_page=3
2. Wymieszaj losowo
3. Podziel na grupy po 4 (dla każdego wariantu A, B, C, D)
4. W każdej grupie:
   - 2 osoby = sprzedający
   - 2 osoby = kupujący
5. Stwórz pary: sprzedający[0] + kupujący[0], sprzedający[1] + kupujący[1]
6. Dla każdej pary:
   - Utwórz chat_room (variant, seller_id, buyer_id, timer_ends_at = now + 10 minut)
   - Zaktualizuj obu uczestników: role, variant, pair_id, current_page=4
7. Uczestnicy, którzy nie dostali par, zostają na current_page=3

**Widok Eksperymentu - Status "active":**
- **Lista Pokoi Czatowych:**
  - Dla każdego pokoju:
    - Numer pokoju, Wariant
    - Sprzedający: Imię, Nazwisko, Min (declared_price)
    - Kupujący: Imię, Nazwisko, Max (declared_price)
    - Status (aktywny/zakończony/brak transakcji)
    - Timer (czas pozostały)
    - Przycisk "Zakończ Czat" (czerwony, tylko dla aktywnych)
      - Zmienia room.status na 'no_transaction'
      - Ustawia current_page=8 dla obu uczestników
      - Ustawia final_price=null, reward=0
  - Odświeżanie co 2 sekundy
  - Możliwość kliknięcia na pokój by zobaczyć wiadomości

- **Wgląd do Czatu (po kliknięciu na pokój):**
  - Lista wszystkich wiadomości
  - Typ, Nadawca (imię lub rola), Treść, Czas
  - Dla ofert: cena, status (pending/accepted/rejected)
  - Realtime subscription

- **Tabela Kluczy Sesji Uczestników:**
  - Wszyscy uczestnicy eksperymentu
  - Kolumny: Imię, Nazwisko, Klucz Sesji (session_id), Status
  - Status: "W trakcie" / "Transakcja" / "Brak transakcji"
  - Przycisk "Kopiuj" przy każdym kluczu

- **Przyciski Akcji:**
  - "Eksportuj CSV" - wyniki uczestników (wszystkie pola participants)
  - "Eksportuj JSON" - wszystkie wiadomości z chat_messages
  - "Powrót" do dashboardu

**Eksport CSV:**
```
ID,SessionID,ExperimentID,FirstName,LastName,Role,Variant,DeclaredPrice,FinalPrice,Reward,TransactionTime
```

**Eksport JSON:**
```json
{
  "experiment": {...},
  "rooms": [
    {
      "room": {...},
      "messages": [...]
    }
  ]
}
```

### 6. Instrukcje (4 Warianty × 2 Role)

Stwórz plik `instructions.ts` z funkcją `getInstructions(role, variant)` zwracającą tablicę stringów.

**Struktura:**
- Każda instrukcja to 5-10 linijek tekstu
- Opisuje sytuację negocjacyjną
- Podaje zakresy cenowe
- Wyjaśnia system nagród

**Przykład dla Sprzedającego Wariantu A:**
```
"Jesteś sprzedającym produktu o wartości bazowej 1000 zł."
"Twoja nagroda to: (cena sprzedaży - 1000) * 0.01 zł"
"Im wyższa cena sprzedaży, tym wyższa Twoja nagroda."
"Maksymalna możliwa cena to 1600 zł."
"Masz 10 minut na negocjacje."
```

**Przykład dla Kupującego Wariantu A:**
```
"Jesteś kupującym produktu o maksymalnej wartości 1600 zł."
"Twoja nagroda to: (1600 - cena zakupu) * 0.01 zł"
"Im niższa cena zakupu, tym wyższa Twoja nagroda."
"Minimalna możliwa cena to 1000 zł."
"Masz 10 minut na negocjacje."
```

Stwórz podobne dla wariantów B, C, D (możesz używać podobnych tekstów, ale z innymi szczegółami).

### 7. Styling i UX

**Ogólne:**
- Profesjonalny, akademicki wygląd
- Ciemne tło dla strony głównej i panelu gospodarza
- Jasne tło dla przepływu uczestnika
- Responsywny design (mobile-friendly)
- Animacje: smooth transitions, loading spinners
- Ikony: Lucide React

**Kolory:**
- Niebieski jako główny akcent
- Zielony dla sukcesu/transakcji
- Czerwony dla błędów/braku transakcji
- Szary dla neutralnych elementów
- NIE używaj fioletowego, chyba że użytkownik prosi

**Typografia:**
- Font: domyślny system font stack
- Headingi: bold, duże (2xl-3xl)
- Tekst: regular, czytelny (sm-base)
- Font mono dla kodów, session_id

**Komponenty:**
- Karty z zaokrąglonymi rogami (rounded-2xl)
- Cienie dla głębi (shadow-xl)
- Buttony z hover effects i transitions
- Inputy z focus states (border-blue-500)

### 8. Realtime Subscriptions

**Dla Uczestnika:**
- Subscribe na własnego uczestnika (sprawdzanie current_page, pair_id)
- Subscribe na room (sprawdzanie statusu)
- Subscribe na wiadomości w roomie

**Dla Gospodarza:**
- Subscribe na listę uczestników eksperymentu
- Subscribe na listę pokoi eksperymentu
- Subscribe na wiadomości wybranego pokoju

**Implementacja:**
```typescript
const channel = supabase
  .channel('channel-name')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'table_name',
    filter: 'column=eq.value'
  }, (payload) => {
    // handle change
  })
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### 9. LocalStorage Persistence

**Dla Uczestnika:**
- Zapisz current participant do localStorage po rejestracji
- Przy refresh strony, sprawdź localStorage i załaduj uczestnika
- Wyczyść localStorage gdy uczestnik kończy (Page 8) lub klika "Zacznij od Nowa"

**Klucz:** `currentParticipant`
**Wartość:** JSON string obiektu Participant

### 10. Walidacja i Obsługa Błędów

**Walidacja:**
- Kod eksperymentu: sprawdź w bazie, pokaż błąd jeśli nie istnieje
- Cena: liczba dodatnia, max 2 miejsca po przecinku
- Session ID: format UUID
- Wszystkie wymagane pola wypełnione

**Błędy:**
- Komunikaty w czerwonych boxach
- Console.error dla błędów technicznych
- Alertu dla krytycznych błędów (opcjonalnie)
- Graceful degradation jeśli brak internetu

### 11. Optymalizacja i Wydajność

- Użyj React.memo dla komponentów list
- Debounce dla częstych operacji (np. typing)
- Pagination/virtualization dla długich list (opcjonalnie)
- Lazy loading dla komponentów route-owych
- Indeksy w bazie danych dla częstych queries

### 12. Deployment

**Netlify:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Redirects: `/*  /index.html  200` (dla SPA routing)

**Supabase:**
- Zastosuj wszystkie migracje
- Włącz Realtime dla wszystkich tabel
- Sprawdź RLS policies
- Backup bazy przed produkcją

### 13. Testy Manualne

Po zbudowaniu, przeprowadź pełny test:

1. Gospodarz tworzy eksperyment
2. 4+ uczestników się rejestruje
3. Gospodarz rozpoczyna eksperyment
4. Uczestnicy są sparowani
5. Każdy uczestnik czyta instrukcje i wpisuje cenę
6. Czekają aż partner jest gotowy
7. Negocjują w czacie
8. Wysyłają oferty, akceptują/odrzucają
9. Finalizują transakcję lub gospodarz kończy ręcznie
10. Sprawdź poprawność nagród
11. Eksportuj wyniki
12. Test przywracania sesji
13. Test "Zacznij od Nowa"
14. Usunięcie eksperymentu

### 14. Ważne Szczegóły Implementacyjne

**KRYTYCZNE:**
1. Przy akceptacji oferty, NAJPIERW ustaw `room.status = 'completed'`, POTEM zapisz uczestników
2. Przy odrzuceniu oferty, wyślij dodatkową wiadomość typu 'chat' dla realtime notification
3. Page 5 MUSI czekać aż partner ma `declared_price !== null` przed przejściem do czatu
4. Timer jest tylko orientacyjny, NIE kończy automatycznie czatu
5. Gospodarz MOŻE ręcznie zakończyć aktywne czaty
6. CASCADE delete włączone na wszystkich foreign keys
7. DELETE policies muszą być dodane do RLS (domyślnie są tylko SELECT/INSERT/UPDATE)

**Kolejność Stron:**
1. Powitanie
2. Rejestracja (z walidacją kodu)
3. Oczekiwanie na start
4. Instrukcje (z polem ceny i przyciskiem "Gotowy")
5. Oczekiwanie na partnera (aż obaj wpiszą ceny)
6. Czat (z instrukcjami u góry)
7. (Pominięta)
8. Zakończenie

**Struktura Plików:**
```
src/
├── components/
│   ├── Home.tsx
│   ├── Recovery.tsx
│   ├── HostDashboard.tsx
│   ├── ParticipantFlow.tsx
│   ├── host/
│   │   ├── ActiveExperiment.tsx
│   │   └── ParticipantsList.tsx
│   └── participant/
│       ├── Page1Welcome.tsx
│       ├── Page2Registration.tsx
│       ├── Page3Waiting.tsx
│       ├── Page4Instructions.tsx
│       ├── Page5WaitingPair.tsx
│       ├── Page6Chat.tsx
│       └── Page8Complete.tsx
├── lib/
│   ├── supabase.ts
│   ├── supabaseStorage.ts (CRUD operations)
│   ├── supabasePairing.ts (pairing algorithm)
│   ├── instructions.ts (instruction texts)
│   └── utils.ts
└── types.ts
```

---

## Podsumowanie

Stwórz profesjonalną, w pełni funkcjonalną platformę do eksperymentów negocjacyjnych z:
- Intuicyjnym interfejsem dla uczestników (8-stopniowy przepływ)
- Potężnym panelem administratora dla gospodarzy
- Realtime komunikacją między użytkownikami
- Solidnym schematem bazy danych z CASCADE delete
- Możliwością przywracania sesji i restartu
- Ręczną kontrolą gospodarza nad pokojami czatowymi
- Eksportem wyników do CSV i JSON
- Profesjonalnym, responsywnym designem
- Pełną walidacją i obsługą błędów

Wszystkie funkcje muszą działać w czasie rzeczywistym z użyciem Supabase Realtime subscriptions.

---

**Uwaga dla AI:** Ten prompt zawiera kompletną specyfikację. Zaimplementuj dokładnie według opisu, zwracając szczególną uwagę na sekcję "Ważne Szczegóły Implementacyjne". Testuj każdą funkcję przed kontynuacją.
