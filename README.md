# Platforma Eksperymentu Negocjacyjnego

Kompleksowa aplikacja webowa do przeprowadzania eksperymentów negocjacyjnych w czasie rzeczywistym dla badań naukowych w dziedzinie nauk społecznych.

## Funkcjonalności

### Dla Uczestników
- **8-stronicowy flow uczestnika:**
  1. Strona powitalna z opisem eksperymentu
  2. Rejestracja (imię, nazwisko, zgoda)
  3. Oczekiwanie na start eksperymentu
  4. Instrukcje specyficzne dla wariantu (A, B, C, D) i roli (sprzedający/kupujący)
  5. Oczekiwanie na parowanie
  6. Czat negocjacyjny z timerem 10 minut
  7. (automatyczne przejście)
  8. Podsumowanie z nagrodą

- **Czat w czasie rzeczywistym:**
  - Wysyłanie wiadomości tekstowych
  - Wysyłanie ofert cenowych
  - Akceptacja/odrzucenie ofert
  - Timer z ostrzeżeniem (2 minuty przed końcem)
  - Timestampy wszystkich wiadomości

- **Recovery sesji:**
  - Unikalny ID sesji dla każdego uczestnika
  - Możliwość powrotu do aktywnej sesji po rozłączeniu

### Dla Gospodarza
- **Panel monitoringu:**
  - Lista oczekujących uczestników
  - Przycisk start dla dwóch typów eksperymentów:
    - Eksperyment 1: Uczestnicy anonimowi
    - Eksperyment 2: Z widocznymi imionami

- **Monitoring aktywnych sesji:**
  - Przegląd wszystkich pokoi czatowych
  - Status każdego pokoju (aktywny, zakończony, brak transakcji)
  - Pozostały czas dla każdej pary
  - Wgląd do wszystkich wiadomości w czasie rzeczywistym
  - Zadeklarowane ceny uczestników

- **Eksport danych:**
  - **CSV z wynikami:** imię, nazwisko, rola, wariant, cena zadeklarowana, cena finalna, nagroda, czas transakcji
  - **JSON z logami czatu:** pełne logi wszystkich wiadomości z timestampami

## Logika Eksperymentu

### Parowanie
- Uczestnicy dzieleni równo na 4 warianty (A, B, C, D)
- W każdym wariancie równy podział na sprzedających i kupujących
- Parowanie tylko w ramach tego samego wariantu

### Warianty
- **Wariant A:** Podstawowy (bez dodatkowych informacji, bez wymuszonego pytania)
- **Wariant B:** Z informacją o wartości rynkowej (800-1000 zł)
- **Wariant C:** Z wymuszonym pytaniem "Jaka jest najwyższa cena, którą byś zaakceptował?"
- **Wariant D:** Z informacją o wartości + wymuszonym pytaniem

### Nagrody
- **Sprzedający:** Cena Finalna - 700 zł
- **Kupujący:** 1100 zł - Cena Finalna
- **Brak transakcji:** 0 zł

## Technologie

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Ikony:** Lucide React
- **Storage:** LocalStorage (prototyp - gotowy do integracji z Supabase)
- **Real-time:** Event-driven architecture z CustomEvents

## Instalacja i Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie środowiska deweloperskiego
npm run dev

# Build produkcyjny
npm run build

# Podgląd buildu produkcyjnego
npm run preview
```

## Użycie

### Rozpoczęcie Eksperymentu

1. Otwórz aplikację
2. Kliknij "Gospodarz" aby otworzyć panel gospodarza
3. Uczestnicy rejestrują się klikając "Uczestnik"
4. Po zarejestrowaniu wymaganej liczby uczestników, gospodarz klika "Start Eksperymentu 1" lub "Start Eksperymentu 2"
5. System automatycznie:
   - Przypisuje role i warianty
   - Tworzy pary
   - Startuje timery
   - Wysyła automatyczne wiadomości (warianty C i D)

### Prowadzenie Negocjacji

1. Uczestnicy widzą instrukcje dla swojego wariantu
2. Deklarują cenę graniczną (nieobowiązująca)
3. Po parowaniu rozpoczyna się czat
4. Wysyłają wiadomości i oferty cenowe
5. Partner akceptuje lub odrzuca oferty
6. Po zaakceptowaniu oferty → automatyczne przejście do podsumowania
7. Po upływie czasu bez transakcji → nagroda 0 zł

### Recovery

Jeśli uczestnik utraci połączenie:
1. Gospodarz podaje mu unikalny ID sesji (widoczne w panelu)
2. Uczestnik wchodzi na `/recovery?id=[SESSION_ID]`
3. System przywraca go dokładnie do miejsca, w którym był

## Eksport Danych

### CSV z wynikami
```csv
Imię,Nazwisko,Rola,Wariant,Cena Zadeklarowana,Cena Finalna,Nagroda,Czas Transakcji
Jan,Kowalski,Sprzedający,A,800.00,900.00,200.00,2025-10-19 20:15:30
Anna,Nowak,Kupujący,A,950.00,900.00,200.00,2025-10-19 20:15:30
```

### JSON z logami czatu
```json
[
  {
    "roomId": "uuid",
    "variant": "A",
    "seller": "Jan Kowalski",
    "buyer": "Anna Nowak",
    "messages": [
      {
        "sender": "Jan Kowalski",
        "role": "seller",
        "text": "Witam, jaka cena Pana interesuje?",
        "type": "chat",
        "timestamp": "2025-10-19T20:10:15.123Z"
      }
    ]
  }
]
```

## Struktura Projektu

```
src/
├── components/
│   ├── participant/      # Strony flow uczestnika (1-8)
│   ├── host/            # Komponenty panelu gospodarza
│   ├── Home.tsx         # Strona główna
│   ├── ParticipantFlow.tsx
│   ├── HostDashboard.tsx
│   └── Recovery.tsx
├── lib/
│   ├── storage.ts       # Zarządzanie danymi (LocalStorage)
│   ├── pairing.ts       # Algorytm parowania
│   └── instructions.ts  # Treści instrukcji
├── types.ts             # Definicje typów TypeScript
└── App.tsx              # Główny komponent aplikacji
```

## Bezpieczeństwo i Prywatność

- Dane przechowywane lokalnie w przeglądarce
- Brak wysyłania danych na zewnętrzne serwery
- Anonimowość w Eksperymencie 1
- Zgodnie z wymaganiami RODO dla badań naukowych

## Integracja z Supabase (Opcjonalna)

Aplikacja jest gotowa do integracji z Supabase. Aby to zrobić:

1. Utwórz projekt w Supabase
2. Zastąp implementację `StorageManager` wywołaniami Supabase Client
3. Użyj Supabase Realtime dla synchronizacji czatu
4. Schemat bazy danych jest udokumentowany w kodzie

## Wsparcie

W razie problemów sprawdź:
- Konsolę przeglądarki (F12)
- LocalStorage w DevTools
- Logi w konsoli

## Licencja

Aplikacja stworzona do celów badawczych.
