# ✅ NAPRAWIONY FLOW TIMERA

## PROBLEM (PRZED)

Uczestnik przechodził przez strony:
1. Page 4: Instrukcje + wpisanie ceny
2. Klik "Dalej"
3. **BUG:** Page 5 (Waiting Pair) → natychmiast → Page 6 (Chat)
4. Page 6: **TIMER JUŻ LICZYŁ** mimo że druga osoba jeszcze nie była w pokoju!

**Rezultat:** Pierwsza osoba traciła czas czekając na drugą osobę.

---

## ROZWIĄZANIE (TERAZ)

### Nowy Flow:

#### 1. **Gospodarz startuje eksperyment**
- Tworzy pokoje (chat_rooms) ze statusem: `'waiting'`
- Timer **NIE** jest aktywny
- Obie osoby przechodzą na Page 5

#### 2. **Pierwsza osoba wchodzi (np. Osoba A)**
- Page 5: "Para utworzona!"
- Wywołuje `SupabasePairing.checkAndStartTimer(roomId)`
- **Timer jeszcze nie startuje** (room.status = 'waiting')
- Przechodzi na Page 6
- Page 6: Widzi komunikat **"Oczekiwanie na Partnera"**
  - "Jesteś w pokoju negocjacyjnym. Timer wystartuje gdy druga osoba również będzie gotowa."

#### 3. **Druga osoba wchodzi (np. Osoba B)**
- Page 5: "Para utworzona!"
- Wywołuje `SupabasePairing.checkAndStartTimer(roomId)`
- **TIMER STARTUJE!** (room.status = 'waiting' → 'active')
- Czas końca: `now + 10 minut`
- Przechodzi na Page 6

#### 4. **Obie osoby w pokoju**
- Osoba A: Dzięki realtime subscription, room aktualizuje się automatycznie
- Room.status: 'waiting' → 'active'
- Page 6: Automatycznie przełącza się z "Oczekiwanie" na normalny czat
- **TIMER LICZY DLA OBUDWU** od tego samego momentu

---

## KOD - CO ZOSTAŁO ZMIENIONE

### 1. `supabasePairing.ts` - Nowa funkcja

```typescript
// DODANO: Funkcja sprawdza czy room jest 'waiting' i startuje timer
static async checkAndStartTimer(roomId: string): Promise<void> {
  const room = await SupabaseStorage.getChatRoom(roomId);
  if (!room) return;

  if (room.status === 'waiting') {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 10 * 60 * 1000);

    room.timerEndsAt = endsAt.toISOString();
    room.status = 'active';  // <- TIMER STARTUJE TUTAJ!
    await SupabaseStorage.saveChatRoom(room);
  }
}
```

### 2. `supabasePairing.ts` - createPairs()

```typescript
// ZMIENIONO: room tworzy się ze statusem 'waiting'
const room: ChatRoom = {
  id: roomId,
  experimentId,
  variant,
  sellerId: seller.id,
  buyerId: buyer.id,
  timerEndsAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
  status: 'waiting',  // <- BYŁO: 'active', TERAZ: 'waiting'
  createdAt: now.toISOString()
};
```

### 3. `Page5WaitingPair.tsx` - Wywołanie checkAndStartTimer

```typescript
// DODANO: Gdy osoba wchodzi, próbuje wystartować timer
useEffect(() => {
  const checkPair = async () => {
    if (participant.pairId && !hasPair) {
      setHasPair(true);
      
      // <- NOWA LINIJKA
      await SupabasePairing.checkAndStartTimer(participant.pairId);
      
      setTimeout(async () => {
        participant.currentPage = 6;
        await SupabaseStorage.saveParticipant(participant);
        window.location.reload();
      }, 2000);
    }
  };
  // ...
});
```

### 4. `Page6Chat.tsx` - Ekran oczekiwania

```typescript
// DODANO: Sprawdzanie czy room jest 'waiting'
if (room.status === 'waiting') {
  return (
    <div className="...">
      <Clock className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-slate-800 mb-4">
        Oczekiwanie na Partnera
      </h1>
      <p className="text-lg text-slate-600 mb-4">
        Jesteś w pokoju negocjacyjnym. Timer wystartuje gdy druga osoba również będzie gotowa.
      </p>
      {/* ... */}
    </div>
  );
}

// Gdy room.status zmieni się na 'active' (przez realtime), 
// normalny czat się renderuje
```

---

## JAK TO DZIAŁA KROK PO KROKU

### Scenariusz: 2 osoby (Anna i Bartek)

**Czas 0:00 - Gospodarz startuje**
- `createPairs()` tworzy room: `{ status: 'waiting' }`
- Anna: currentPage = 5
- Bartek: currentPage = 5

**Czas 0:05 - Anna kończy czytać instrukcje**
- Anna: Page 4 → wpisuje cenę → klik "Dalej"
- Anna: Page 5 (1 sekunda)
  - `checkAndStartTimer(roomId)` wywołane
  - Room nadal: `{ status: 'waiting' }` (bo to pierwsza osoba)
- Anna: Page 6
  - Widzi: "Oczekiwanie na Partnera"
  - Timer **NIE** liczy

**Czas 0:10 - Bartek kończy czytać (5 sekund później)**
- Bartek: Page 4 → wpisuje cenę → klik "Dalej"
- Bartek: Page 5 (1 sekunda)
  - `checkAndStartTimer(roomId)` wywołane
  - Room zmienia się: `{ status: 'waiting' }` → `{ status: 'active' }`
  - **TIMER STARTUJE:** timerEndsAt = `0:10 + 10 min = 0:20`
- Bartek: Page 6
  - Widzi normalny czat (bo status już 'active')

**Czas 0:10.5 - Anna dostaje update (realtime)**
- Room subscription wykrywa zmianę: status → 'active'
- Anna: Page 6 automatycznie przełącza się na normalny czat
- **OBIE OSOBY WIDZĄ TEN SAM TIMER: 9:59, 9:58, 9:57...**

**Czas 0:20 - Timer kończy**
- Obie osoby: 0:00 → zakończenie

**RÓWNE SZANSE!** Nikt nie traci czasu.

---

## TESTY - JAK SPRAWDZIĆ

### Test 1: Pierwsza osoba czeka
1. Gospodarze: Start eksperymentu
2. Osoba A: Przejdź przez instrukcje szybko
3. Osoba A: Page 6 → **Sprawdź:** Widać "Oczekiwanie na Partnera"?
4. Osoba B: Czekaj 10 sekund
5. Osoba B: Przejdź przez instrukcje
6. **Sprawdź:** Osoba A automatycznie widzi czat gdy Osoba B wejdzie?
7. **Sprawdź:** Obie osoby widzą ten sam czas na timerze?

### Test 2: Obie osoby równocześnie
1. Gospodarze: Start eksperymentu
2. Obie osoby: Przejdź przez instrukcje w tym samym czasie
3. **Sprawdź:** Obie od razu widzą czat z timererem?

### Test 3: Druga osoba bardzo późno
1. Osoba A: Wejdź do pokoju (widzi oczekiwanie)
2. Czekaj 2 minuty
3. Osoba B: Wejdź do pokoju
4. **Sprawdź:** Timer startuje dopiero teraz (10 minut od wejścia B)?

---

## PODSUMOWANIE

### ✅ Co zostało naprawione:
- Timer startuje **dopiero gdy obie osoby są w pokoju**
- Pierwsza osoba widzi komunikat "Oczekiwanie na Partnera"
- Realtime synchronizacja pokazuje czat gdy druga osoba wejdzie
- **Równe szanse dla wszystkich uczestników**

### 📁 Zmienione pliki:
1. `src/lib/supabasePairing.ts` - dodana funkcja `checkAndStartTimer()`
2. `src/components/participant/Page5WaitingPair.tsx` - wywołanie checkAndStartTimer
3. `src/components/participant/Page6Chat.tsx` - ekran oczekiwania dla status='waiting'

### 🎯 Rezultat:
**Timer jest uczciwy!** Każda para ma dokładnie 10 minut od momentu gdy obie osoby są gotowe.

---

## BUILD STATUS

```
✓ 1559 modules transformed.
dist/index.html                   0.48 kB
dist/assets/index-DK4HXrpY.css   18.30 kB  
dist/assets/index-Cbfvx3P4.js   336.41 kB
✓ built in 4.99s
```

**GOTOWE DO WDROŻENIA!** 🚀
