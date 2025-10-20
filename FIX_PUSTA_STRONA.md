# 🔧 NAPRAWA PUSTEJ STRONY NA NETLIFY/VERCEL

## ❌ PROBLEM: Pusta strona po wdrożeniu

**Przyczyna:** Brakowało plików konfiguracyjnych dla SPA (Single Page Application)

## ✅ ROZWIĄZANIE: Dodałem 3 pliki

1. **`public/_redirects`** - dla Netlify
2. **`netlify.toml`** - backup dla Netlify
3. **`vercel.json`** - dla Vercel
4. **Zaktualizowałem `vite.config.ts`** - dodałem `base: './'`

---

## 🚀 CO MUSISZ TERAZ ZROBIĆ

### OPCJA A: Masz rozpakowany ZIP (STARY)

Pobierz projekt jeszcze raz jako ZIP z tym środowiskiem i rozpakuj na nowo.

**LUB** dodaj ręcznie te pliki (poniżej):

---

### OPCJA B: Dodaj pliki ręcznie (szybsze!)

#### 1. Utwórz folder `public` (jeśli nie ma)

#### 2. Utwórz plik `public/_redirects`:
```
/* /index.html 200
```

#### 3. Utwórz plik `netlify.toml` (w głównym folderze):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 4. Utwórz plik `vercel.json` (w głównym folderze):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 5. Edytuj `vite.config.ts`:

Dodaj linię `base: './',` w obiekcie config:

```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: './',  // ← DODAJ TĘ LINIĘ
});
```

---

## 📤 TERAZ WGRAJ PONOWNIE

### Dla NETLIFY:

#### Metoda 1: Drag & Drop (ponownie)
```bash
# W folderze projektu
npm run build

# Przeciągnij folder dist/ na:
# https://app.netlify.com/drop
```

#### Metoda 2: Przez GitHub
```bash
# Commit nowe pliki
git add .
git commit -m "Fix SPA routing for Netlify/Vercel"
git push

# Netlify automatycznie zrobi redeploy!
```

#### Metoda 3: Przez Netlify CLI
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

### Dla VERCEL:

#### Metoda 1: Przez GitHub
```bash
git add .
git commit -m "Fix SPA routing"
git push

# Vercel automatycznie zrobi redeploy!
```

#### Metoda 2: Przez Vercel CLI
```bash
npm run build
vercel --prod
```

---

## ✅ JAK SPRAWDZIĆ CZY DZIAŁA?

Po ponownym wdrożeniu:

1. Otwórz link (np. https://twoja-app.netlify.app)
2. Powinieneś zobaczyć:
   ```
   Negotiation Experiment Web App

   [Gospodarz] [Uczestnik]
   ```

3. Jeśli nadal pusta strona:
   - Otwórz Developer Tools (F12)
   - Zakładka Console
   - Szukaj błędów (czerwone linie)
   - Wyślij mi screenshot błędów

---

## ❓ NAJCZĘSTSZE PROBLEMY

### Problem 1: Nadal pusta strona po deploy
**Rozwiązanie:**
1. Sprawdź czy pliki `_redirects`, `netlify.toml`, `vercel.json` są w projekcie
2. Zrób `npm run build` ponownie
3. Wgraj świeży `dist/`

### Problem 2: Błąd "Failed to load module"
**Rozwiązanie:**
1. Sprawdź czy zmienne środowiskowe są dodane w Netlify/Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Po dodaniu - kliknij **"Redeploy"**

### Problem 3: Biała strona z błędem w konsoli
**Rozwiązanie:**
1. Otwórz F12 → Console
2. Skopiuj błąd i wyślij mi
3. Pomogę zdiagnozować

---

## 🎯 SZYBKI CHECKLIST

Po naprawie i przed wgraniem:

- [ ] Plik `public/_redirects` istnieje
- [ ] Plik `netlify.toml` istnieje (w głównym folderze)
- [ ] Plik `vercel.json` istnieje (w głównym folderze)
- [ ] `vite.config.ts` ma `base: './'`
- [ ] Uruchomiłem `npm run build`
- [ ] Folder `dist/` powstał
- [ ] Wgrałem na Netlify/Vercel
- [ ] Dodałem zmienne środowiskowe (jeśli jeszcze nie)
- [ ] Kliknąłem "Redeploy" po dodaniu zmiennych

---

## 💡 DLACZEGO TO SIĘ STAŁO?

Single Page Applications (React) potrzebują specjalnej konfiguracji:

- Wszystkie ścieżki (np. `/gospodarz`, `/uczestnik`) muszą przekierować do `index.html`
- Bez tego serwer zwraca 404 (pustą stronę)
- Pliki `_redirects` i `vercel.json` mówią serwerowi: "zawsze zwróć index.html"
- React Router potem obsługuje routing w przeglądarce

---

## 🚀 GOTOWE!

Po dodaniu plików i ponownym deploy:
- ✅ Strona główna załaduje się
- ✅ Routing będzie działać
- ✅ Aplikacja gotowa na eksperyment

**Powiedz mi jak poszło!** Jeśli nadal problem - wyślij link i screenshot konsoli (F12).
