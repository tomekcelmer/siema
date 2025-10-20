# Dokumentacja Platformy Eksperymentu Negocjacyjnego

## Spis Treści

1. [Przegląd Aplikacji](#przegląd-aplikacji)
2. [Architektura Systemu](#architektura-systemu)
3. [Przepływ Użytkownika](#przepływ-użytkownika)
4. [Baza Danych](#baza-danych)
5. [Komponenty Kluczowe](#komponenty-kluczowe)
6. [Instrukcje Uruchomienia](#instrukcje-uruchomienia)
7. [Testowanie](#testowanie)
8. [Rozwiązywanie Problemów](#rozwiązywanie-problemów)

---

## Przegląd Aplikacji

Platforma Eksperymentu Negocjacyjnego to aplikacja internetowa zaprojektowana do przeprowadzania kontrolowanych eksperymentów negocjacyjnych między uczestnikami. Aplikacja obsługuje:

- **Dwie role użytkowników**: Gospodarz (prowadzący eksperyment) i Uczestnicy
- **Dwa typy eksperymentów**:
  - Typ 1: Negocjacje anonimowe (uczestnicy widzą tylko role)
  - Typ 2: Negocjacje z imionami (uczestnicy widzą imiona)
- **Cztery warianty** (A, B, C, D) z różnymi instrukcjami dla sprzedających i kupujących
- **Komunikację w czasie rzeczywistym** między sparowanymi uczestnikami
- **System nagród** oparty na wynegocjowanej cenie
- **Monitorowanie w czasie rzeczywistym** przez gospodarza

### Kluczowe Funkcje

- Rejestracja uczestników z kodem eksperymentu
- Automatyczne parowanie uczestników w pary sprzedający-kupujący
- Pokoje czatowe z timerem (orientacyjnym, nie blokującym)
- System propozycji cenowych z akceptacją/odrzuceniem
- Automatyczne obliczanie nagród
- Panel gospodarza z pełnym wglądem i kontrolą
- Export danych do CSV i JSON
- Możliwość przywrócenia sesji uczestnika
- Możliwość restartu przez uczestnika

---

## Architektura Systemu

### Stack Technologiczny

**Frontend:**
- React 18.3 z TypeScript
- Vite (bundler i dev server)
- Tailwind CSS (stylowanie)
- Lucide React (ikony)

**Backend:**
- Supabase (PostgreSQL + Realtime)
- Supabase Storage dla zarządzania stanem
- Row Level Security (RLS) dla bezpieczeństwa

**Deployment:**
- Netlify (hosting i CI/CD)

### Struktura Projektu

```
project/
├── src/
│   ├── components/           # Komponenty React
│   │   ├── Home.tsx         # Strona główna
│   │   ├── HostDashboard.tsx # Panel gospodarza
│   │   ├── ParticipantFlow.tsx # Przepływ uczestnika
│   │   ├── Recovery.tsx     # Przywracanie sesji
│   │   ├── host/           # Komponenty gospodarza
│   │   │   ├── ActiveExperiment.tsx
│   │   │   └── ParticipantsList.tsx
│   │   └── participant/    # Komponenty uczestnika
│   │       ├── Page1Welcome.tsx
│   │       ├── Page2Registration.tsx
│   │       ├── Page3Waiting.tsx
│   │       ├── Page4Instructions.tsx
│   │       ├── Page5WaitingPair.tsx
│   │       ├── Page6Chat.tsx
│   │       └── Page8Complete.tsx
│   ├── lib/                # Logika biznesowa
│   │   ├── supabase.ts    # Klient Supabase
│   │   ├── supabaseStorage.ts # Operacje bazy danych
│   │   ├── supabasePairing.ts # Logika parowania
│   │   ├── instructions.ts # Treści instrukcji
│   │   └── utils.ts       # Funkcje pomocnicze
│   ├── types/             # Definicje TypeScript
│   │   └── database.ts    # Typy bazy danych
│   └── types.ts          # Typy główne
├── supabase/
│   └── migrations/        # Migracje bazy danych
└── dist/                 # Build produkcyjny
```

---

## Przepływ Użytkownika

### Przepływ Gospodarza

1. **Start** → Wybór "Gospodarz" na stronie głównej
2. **Autoryzacja** → Wpisanie hasła gospodarza (Pandka123)
3. **Dashboard** → Widok wszystkich eksperymentów
4. **Utworzenie Eksperymentu** → Podanie kodu, nazwy i typu
5. **Oczekiwanie na Uczestników** → Lista rejestrujących się uczestników
6. **Start Eksperymentu** → Automatyczne parowanie i przypisanie wariantów
7. **Monitorowanie** → Wgląd do pokoi czatowych i statusów
8. **Zakończenie** → Export wyników do CSV/JSON
9. **Usunięcie** → Opcjonalne usunięcie eksperymentu

### Przepływ Uczestnika

1. **Start** → Wybór "Uczestnik" na stronie głównej
2. **Powitanie** (Strona 1) → Przeczytanie informacji wstępnych
3. **Rejestracja** (Strona 2) → Podanie kodu, imienia, nazwiska i zgody
4. **Oczekiwanie** (Strona 3) → Czekanie aż gospodarz rozpocznie eksperyment
5. **Instrukcje** (Strona 4) → Przeczytanie instrukcji i wpisanie ceny zadeklarowanej
6. **Oczekiwanie na Partnera** (Strona 5) → Czekanie aż partner także wpisze cenę
7. **Negocjacje** (Strona 6) → Czat z możliwością składania ofert
8. **Zakończenie** (Strona 8) → Wyświetlenie wyniku i nagrody

### Przepływ Przywracania Sesji

1. **Start** → Wybór "Przywróć Sesję" na stronie głównej
2. **Wpisanie ID Sesji** → Podanie klucza sesji
3. **Weryfikacja** → Sprawdzenie czy sesja istnieje
4. **Powrót** → Przejście do odpowiedniej strony w przepływie

---

## Baza Danych

### Schemat Tabel

#### 1. `experiments`
Przechowuje informacje o eksperymentach.

```sql
CREATE TABLE experiments (
  id TEXT PRIMARY KEY,                    -- Kod eksperymentu (np. "arbuz")
  name TEXT NOT NULL,                     -- Nazwa wyświetlana
  experiment_type INTEGER NOT NULL,       -- 1 (anonimowy) lub 2 (z imionami)
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting/active/completed
  host_password TEXT NOT NULL,            -- Hasło gospodarza
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

#### 2. `participants`
Wszyscy uczestnicy eksperymentów.

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,               -- Klucz do przywracania sesji
  experiment_id TEXT NOT NULL,            -- FK do experiments
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,                              -- seller/buyer
  variant TEXT,                           -- A/B/C/D
  current_page INTEGER NOT NULL,          -- 1-8 (postęp w przepływie)
  consent_given BOOLEAN NOT NULL,
  declared_price NUMERIC(10,2),           -- Cena zadeklarowana
  final_price NUMERIC(10,2),              -- Cena wynegocjowana
  reward NUMERIC(10,2),                   -- Obliczona nagroda
  transaction_time TIMESTAMPTZ,
  pair_id UUID,                           -- FK do chat_rooms
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

#### 3. `chat_rooms`
Pokoje czatowe (pary uczestników).

```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY,
  experiment_id TEXT NOT NULL,            -- FK do experiments
  seller_id UUID NOT NULL,                -- FK do participants
  buyer_id UUID NOT NULL,                 -- FK do participants
  variant TEXT NOT NULL,                  -- A/B/C/D
  status TEXT NOT NULL,                   -- active/completed/no_transaction
  timer_ends_at TIMESTAMPTZ NOT NULL,     -- Czas końca timera (10 min)
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

#### 4. `chat_messages`
Wszystkie wiadomości w czatach.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL,                  -- FK do chat_rooms
  participant_id UUID NOT NULL,           -- FK do participants
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL,             -- chat/offer
  offer_price NUMERIC(10,2),              -- Cena oferty (jeśli type=offer)
  offer_status TEXT,                      -- pending/accepted/rejected
  created_at TIMESTAMPTZ NOT NULL
);
```

### Bezpieczeństwo (RLS)

Wszystkie tabele mają włączone Row Level Security z politykami:
- SELECT: Każdy może czytać
- INSERT: Każdy może wstawiać
- UPDATE: Każdy może aktualizować
- DELETE: Każdy może usuwać

**Uwaga**: To uproszczony model bezpieczeństwa. W produkcji zaleca się bardziej restrykcyjne polityki oparte na uwierzytelnianiu.

### Realtime

Wszystkie tabele mają włączoną replikację realtime:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE experiments;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

### CASCADE Delete

Usuwanie eksperymentu automatycznie usuwa:
- Wszystkich uczestników (ON DELETE CASCADE)
- Wszystkie pokoje czatowe (ON DELETE CASCADE)
- Wszystkie wiadomości (przez CASCADE na chat_rooms)

---

## Komponenty Kluczowe

### 1. Parowanie Uczestników (`supabasePairing.ts`)

**Algorytm:**
1. Pobiera wszystkich uczestników z `current_page = 3`
2. Miesza uczestników losowo
3. Dzieli na grupy po 4 (dla każdego wariantu A/B/C/D)
4. W każdej grupie przypisuje 2 sprzedających i 2 kupujących
5. Tworzy pary: sprzedający + kupujący
6. Tworzy pokoje czatowe dla każdej pary
7. Aktualizuje uczestników (rola, wariant, pair_id, current_page = 5)

**Funkcje kluczowe:**
- `pairParticipants()` - główna funkcja parowania
- `calculateReward(price, role)` - oblicza nagrodę:
  - Sprzedający: `(price - 1000) * 0.01`
  - Kupujący: `(1600 - price) * 0.01`

### 2. Storage Manager (`supabaseStorage.ts`)

Zarządza wszystkimi operacjami na bazie danych.

**Kluczowe funkcje:**
- `getExperiment()`, `saveExperiment()`, `deleteExperiment()`
- `getParticipant()`, `saveParticipant()`, `deleteParticipant()`
- `getChatRoom()`, `saveChatRoom()`
- `saveChatMessage()`, `getMessagesByRoom()`
- `subscribeToMessages()` - nasłuchiwanie realtime na wiadomości
- `subscribeToChatRoom()` - nasłuchiwanie realtime na pokój

**Lokalny Storage:**
- `setCurrentParticipant()` - zapisuje uczestnika w localStorage
- `getCurrentParticipant()` - odczytuje z localStorage
- `clearCurrentParticipant()` - czyści localStorage

### 3. Komponenty Uczestnika

**Page4Instructions** - Wyświetla instrukcje i zbiera cenę zadeklarowaną:
- Walidacja: liczba dodatnia, max 2 miejsca po przecinku
- Przycisk "Gotowy" aktywny tylko gdy cena jest wpisana
- Po kliknięciu zapisuje `declared_price` i przechodzi do strony 5

**Page5WaitingPair** - Oczekiwanie aż partner także wpisze cenę:
- Sprawdza co sekundę czy partner ma `declared_price !== null`
- Dopiero gdy obaj są gotowi, uruchamia timer i przechodzi do czatu

**Page6Chat** - Główny interfejs negocjacji:
- Wyświetla instrukcje i rolę na górze
- Chat w czasie rzeczywistym
- Możliwość wysyłania wiadomości tekstowych
- Możliwość wysyłania ofert cenowych
- Akceptacja/odrzucenie ofert
- Timer orientacyjny (nie blokuje)
- Automatyczne przejście po zawarciu transakcji lub zakończeniu przez gospodarza

### 4. Panel Gospodarza

**HostDashboard** - Główny panel:
- Lista wszystkich eksperymentów
- Tworzenie nowych eksperymentów
- Usuwanie starych eksperymentów
- Widok aktywnego eksperymentu

**ActiveExperiment** - Widok aktywnego eksperymentu:
- Lista pokoi czatowych
- Status każdego pokoju (aktywny/zakończony/brak transakcji)
- Timer każdego pokoju
- Przycisk zakończenia czatu ręcznie
- Wgląd do wiadomości w każdym pokoju
- Eksport wyników (CSV/JSON)

**ParticipantsList** - Lista oczekujących:
- Imię, nazwisko, session_id, czas rejestracji
- Przycisk usuwania uczestnika
- Automatyczne odświeżanie co 2 sekundy

**ParticipantSessionTable** - Tabela kluczy sesji:
- Wszystkie  uczestników eksperymentu
- Klucz sesji (session_id) z przyciskiem kopiowania
- Status (w trakcie/transakcja/brak transakcji)

---

## Instrukcje Uruchomienia

### Wymagania

- Node.js 18+ i npm
- Konto Supabase
- (Opcjonalnie) Konto Netlify do deploymentu

### Lokalne Uruchomienie

1. **Sklonuj repozytorium:**
```bash
git clone <repository-url>
cd project
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Skonfiguruj zmienne środowiskowe:**

Utwórz plik `.env` w katalogu głównym:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Uruchom migracje bazy danych:**

W Supabase SQL Editor, wykonaj pliki z `supabase/migrations/` w kolejności:
- `20251020085546_create_experiments_schema.sql`
- `20251020183338_add_delete_policies.sql`
- Najnowsze migracje

5. **Uruchom dev server:**
```bash
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:5173`

### Build Produkcyjny

```bash
npm run build
```

Pliki wyjściowe znajdą się w katalogu `dist/`.

### Deployment na Netlify

1. Połącz repozytorium z Netlify
2. Ustaw zmienne środowiskowe w Netlify UI
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy!

---

## Testowanie

### Test Manualny - Pełny Przepływ

**Przygotowanie:**
1. Otwórz aplikację w 3+ kartach przeglądarki
2. Karta 1: Gospodarz
3. Karty 2-5: Uczestnicy (minimum 4 dla pełnego testu)

**Scenariusz testowy:**

**Krok 1: Gospodarz tworzy eksperyment**
- Klikni "Gospodarz"
- Wpisz hasło: `Pandka123`
- Kliknij "Utwórz Nowy Eksperyment"
- Kod: `test`, Nazwa: `Test Eksperyment`, Typ: `1`
- Zapisz kod `test` do wykorzystania przez uczestników

**Krok 2: Uczestnicy się rejestrują**
- W każdej karcie uczestnika:
  - Kliknij "Uczestnik"
  - Kliknij "Dalej"
  - Wpisz kod: `test`, imię i nazwisko
  - Zaznacz zgodę i kliknij "Dalej"
  - Poczekaj na stronie oczekiwania

**Krok 3: Gospodarz rozpoczyna eksperyment**
- W karcie gospodarza kliknij "Rozpocznij Eksperyment"
- System automatycznie sparuje uczestników

**Krok 4: Uczestnicy czytają instrukcje**
- Każdy uczestnik zobaczy swoje instrukcje (wariant i rolę)
- Wpisz cenę zadeklarowaną (np. 1200 zł)
- Kliknij "Gotowy"

**Krok 5: Oczekiwanie na partnera**
- Każdy uczestnik czeka aż partner także wpisze cenę
- Gdy obaj są gotowi, przechodzą do czatu

**Krok 6: Negocjacje**
- Wyślij wiadomość tekstową - sprawdź czy pojawia się u partnera
- Wyślij ofertę cenową - sprawdź przyciski akceptuj/odrzuć
- Odrzuć ofertę - sprawdź czy pojawia się komunikat
- Wyślij nową ofertę i zaakceptuj
- Sprawdź czy obie strony przeszły do strony zakończenia

**Krok 7: Weryfikacja gospodarza**
- Sprawdź czy w tabeli obie strony mają status "Transakcja"
- Sprawdź czy cena finalna i nagrody są poprawne
- Eksportuj wyniki do CSV i JSON

**Krok 8: Test przywracania sesji**
- Na stronie oczekiwania uczestnika (przed rozpoczęciem), skopiuj session_id
- Zamknij kartę
- Na stronie głównej kliknij "Przywróć Sesję"
- Wklej session_id
- Sprawdź czy uczestnik wraca do właściwej strony

**Krok 9: Test restartu**
- Na stronie oczekiwania uczestnika kliknij "Zacznij od Nowa"
- Potwierdź
- Sprawdź czy uczestnik wraca do strony powitalnej
- Sprawdź czy w panelu gospodarza uczestnik został usunięty

**Krok 10: Test ręcznego zakończenia czatu**
- Rozpocznij nowy eksperyment z nowymi uczestnikami
- W panelu gospodarza kliknij przycisk "Zakończ czat" przy aktywnym pokoju
- Sprawdź czy uczestnicy przeszli do strony zakończenia ze statusem "Brak transakcji"

### Przypadki Brzegowe do Przetestowania

1. **Niepoprawny kod eksperymentu** - uczestnik otrzyma komunikat błędu
2. **Nieparzystos liczba uczestników** - część nie zostanie sparowana
3. **Zamknięcie przeglądarki w trakcie** - test przywracania sesji
4. **Brak internetu** - aplikacja powinna pokazać błąd
5. **Dwóch gospodarzy jednocześnie** - każdy widzi wszystkie eksperymenty
6. **Usunięcie eksperymentu z aktywnymi uczestnikami** - CASCADE delete

---

## Rozwiązywanie Problemów

### Problem: Uczestnicy nie są parowani

**Przyczyny:**
- Za mało uczestników (minimum 4 dla pełnego wariantu)
- Uczestnicy nie są na stronie 3 (oczekiwanie)
- Błąd połączenia z bazą danych

**Rozwiązanie:**
1. Sprawdź w konsoli przeglądarki błędy
2. Sprawdź czy w bazie są uczestnicy z `current_page = 3`
3. Spróbuj odświeżyć panel gospodarza

### Problem: Wiadomości nie pojawiają się w czasie rzeczywistym

**Przyczyny:**
- Realtime nie jest włączone w Supabase
- Problemy z połączeniem WebSocket
- Błędnie skonfigurowana replikacja

**Rozwiązanie:**
1. Sprawdź w Supabase Dashboard → Settings → API → Realtime
2. Sprawdź czy tabele są dodane do publikacji `supabase_realtime`
3. Sprawdź w konsoli przeglądarki połączenie WebSocket

### Problem: Błąd "Kod eksperymentu nie istnieje"

**Przyczyny:**
- Użytkownik wpisał zły kod
- Eksperyment został usunięty
- Kod jest case-sensitive

**Rozwiązanie:**
1. Upewnij się że kod jest wpisany małymi literami
2. Sprawdź w panelu gospodarza czy eksperyment istnieje
3. Utwórz nowy eksperyment jeśli został usunięty

### Problem: Status transakcji niepoprawny dla sprzedającego

**Przyczyny:**
- Wcześniejsza wersja miała błąd w kolejności zapisów
- Aktualna wersja naprawia to ustawiając `room.status = 'completed'` PRZED zapisaniem uczestników

**Rozwiązanie:**
- Upewnij się że kod jest zaktualizowany do najnowszej wersji
- Sprawdź czy `Page6Chat.tsx` ustawia `room.status` przed aktualizacją uczestników

### Problem: Timer blokuje czat po 10 minutach

**Przyczyny:**
- Stara wersja kodu miała auto-close po timerze
- Aktualna wersja usuwa tę funkcjonalność

**Rozwiązanie:**
- Timer jest teraz tylko orientacyjny
- Gospodarz ręcznie kończy czaty przyciskiem "Zakończ czat"
- Upewnij się że kod jest zaktualizowany

### Problem: Nie można przywrócić sesji

**Przyczyny:**
- Błędny session_id
- Uczestnik został usunięty z bazy
- Eksperyment został usunięty (CASCADE delete)

**Rozwiązanie:**
1. Sprawdź czy session_id jest poprawny (UUID format)
2. Sprawdź w bazie czy uczestnik istnieje
3. Jeśli eksperyment został usunięty, uczestnik musi zarejestrować się od nowa

---

## API i Kluczowe Funkcje

### Supabase Queries

**Pobieranie eksperymentu:**
```typescript
const { data, error } = await supabase
  .from('experiments')
  .select('*')
  .eq('id', experimentId)
  .maybeSingle();
```

**Zapisywanie uczestnika:**
```typescript
const { error } = await supabase
  .from('participants')
  .upsert({
    id: participant.id,
    session_id: participant.sessionId,
    experiment_id: participant.experimentId,
    // ... inne pola
  });
```

**Nasłuchiwanie na wiadomości:**
```typescript
const channel = supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    // Obsługa nowej wiadomości
  })
  .subscribe();
```

### Obliczanie Nagród

```typescript
function calculateReward(price: number, role: 'seller' | 'buyer'): number {
  if (role === 'seller') {
    return (price - 1000) * 0.01;
  } else {
    return (1600 - price) * 0.01;
  }
}
```

**Przykład:**
- Cena: 1300 zł
- Nagroda sprzedającego: (1300 - 1000) * 0.01 = 3 zł
- Nagroda kupującego: (1600 - 1300) * 0.01 = 3 zł

---

## Bezpieczeństwo i Prywatność

### Dane Osobowe

Aplikacja zbiera:
- Imię i nazwisko uczestnika
- Session ID (UUID generowany automatycznie)
- Dane negocjacji (wiadomości, oferty, ceny)

### Bezpieczeństwo

- Row Level Security (RLS) włączone dla wszystkich tabel
- Hasło gospodarza przechowywane w bazie (w produkcji użyj haszowania!)
- Klucze API Supabase w zmiennych środowiskowych
- HTTPS wymuszane przez Netlify

### RODO

W produkcyjnym wdrożeniu dodaj:
- Politykę prywatności
- Regulamin
- Zgody na przetwarzanie danych
- Możliwość usunięcia danych
- Anonimizację po zakończeniu badania

---

## Changelog

### Wersja 1.0.0 (Aktualna)

**Dodane:**
- Warunek wpisania ceny zadeklarowanej przed przejściem do czatu
- Strona oczekiwania aż partner również wpisze cenę
- Instrukcje i rola wyświetlane nad interfejsem czatu
- Realtime notyfikacje o odrzuceniu oferty
- Ręczne kończenie czatu przez gospodarza
- Tabela z kluczami sesji uczestników
- Przycisk "Zacznij od Nowa" dla uczestników
- Przycisk "Przywróć Sesję" na stronie głównej

**Naprawione:**
- Problem z natychmiastowym przejściem z instrukcji do czatu
- Bug ze statusem transakcji u sprzedającego
- Timer blokujący czat po 10 minutach
- Brak możliwości usuwania eksperymentów i uczestników
- Odrzucenie oferty nie wyświetlało się w realtime

**Zmienione:**
- Timer jest teraz tylko orientacyjny
- Przycisk "Gotowy" zamiast "Przejdź do Negocjacji"
- Ulepszone komunikaty dla użytkownika

---

## Kontakt i Wsparcie

W razie problemów:
1. Sprawdź tę dokumentację
2. Sprawdź konsola przeglądarki (F12) dla błędów
3. Sprawdź logi Supabase
4. Sprawdź logi Netlify (jeśli deployed)

---

## Licencja

[Określ licencję projektu]

---

**Ostatnia aktualizacja:** 2025-10-20
