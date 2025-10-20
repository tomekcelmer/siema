# 🚀 JAK WDROŻYĆ APLIKACJĘ - KROK PO KROKU

## ✅ BUILD GOTOWY!
```
dist/index.html                   0.48 kB
dist/assets/index-CVvHwJS6.css   18.20 kB  
dist/assets/index-DADJZwYj.js   334.30 kB
✓ built in 4.25s
```

---

## OPCJA 1: VERCEL (NAJŁATWIEJSZA) ⭐

### Przez przeglądarkę (BEZ CLI):
1. Wejdź na: https://vercel.com
2. Zaloguj się przez GitHub
3. Kliknij "Add New..." → "Project"
4. Import tego repozytorium
5. Vercel automatycznie:
   - Wykryje Vite
   - Zbuduje aplikację
   - Wdroży na URL (np. https://twoja-app.vercel.app)

### Przez CLI:
```bash
# Zainstaluj Vercel CLI
npm install -g vercel

# W folderze projektu:
vercel

# Postępuj zgodnie z instrukcjami
# Po zakończeniu dostaniesz URL
```

---

## OPCJA 2: NETLIFY

### Przez przeglądarkę:
1. Wejdź na: https://netlify.com
2. Zaloguj się
3. Przeciągnij folder `dist` na stronę Netlify
4. Gotowe! Dostaniesz URL

### Przez CLI:
```bash
# Zbuduj aplikację
npm run build

# Zainstaluj Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Skopiuj URL
```

---

## PO WDROŻENIU - TEST (10 minut)

### 1. Otwórz URL w przeglądarce
Przykład: `https://twoja-app.vercel.app`

### 2. Test Gospodarza:
- Kliknij "Gospodarz"
- Hasło: `Pandka123`
- Kod: `test123`
- Zaloguj

### 3. Test Uczestnika (telefon lub incognito):
- Otwórz ten sam URL na telefonie
- Kliknij "Uczestnik"  
- Kod: `test123`
- Zarejestruj się (imię, nazwisko)

### 4. SPRAWDŹ:
✅ Gospodarz widzi uczestnika na liście?
✅ Uczestnik widzi "Oczekiwanie na start"?

Jeśli TAK → **DZIAŁA!** 🎉

### 5. Test Czatu Realtime:
- Gospodarz: Start Eksperymentu 1
- Uczestnicy zobaczą instrukcje
- Po wpisaniu cen → czat
- **WYŚLIJ WIADOMOŚĆ** z jednego urządzenia
- **SPRAWDŹ** czy pojawia się na drugim NATYCHMIAST

Jeśli TAK → **REALTIME DZIAŁA!** 🚀

---

## ZMIENNE ŚRODOWISKOWE

**UWAGA:** Klucze Supabase są już w pliku `.env`!

Jeśli hosting pyta o zmienne:
```
VITE_SUPABASE_URL=https://[projekt].supabase.co
VITE_SUPABASE_ANON_KEY=[twój klucz]
```

(Są już skonfigurowane, nie musisz nic robić!)

---

## TROUBLESHOOTING

### Problem: "Failed to fetch"
**Rozwiązanie:** Sprawdź czy `.env` ma poprawne klucze Supabase

### Problem: Nie widać uczestników
**Rozwiązanie:** To było naprawione! Sprawdź czy build się powiódł.

### Problem: Czat nie działa realtime
**Rozwiązanie:** Sprawdź Supabase Dashboard → Realtime musi być włączony

---

## GOTOWE! 🎉

Po wdrożeniu możesz:
- Przeprowadzić eksperyment z 50+ uczestnikami
- Każdy używa swojego telefonu/laptopa
- Realtime synchronizacja działa
- Pełny monitoring dla gospodarza
- Eksport wszystkich danych

**Powodzenia w eksperymencie!** 🎓
