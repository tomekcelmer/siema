# 🚀 HOSTING NA GITHUB PAGES (DARMOWY + DZIAŁA!)

## ✅ CO ZMIENIŁEM:

1. **Hash routing (#)** - aplikacja używa teraz `#/host`, `#/participant` zamiast `/host`
   - Działa na KAŻDYM hostingu bez konfiguracji!
   - Nie potrzeba `_redirects` ani nic

2. **GitHub Actions** - automatyczne wdrożenie przy `git push`

3. **Usunąłem `base: './'`** z vite.config - niepotrzebne

---

## 📋 KROK PO KROKU:

### 1️⃣ WGRAJ NA GITHUB

```bash
# W folderze projektu
git init
git add .
git commit -m "Initial commit"

# Utwórz repo na GitHub: https://github.com/new
# Nazwa: np. "negotiation-app"

# Potem:
git remote add origin https://github.com/TWOJ_USERNAME/negotiation-app.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ DODAJ ZMIENNE ŚRODOWISKOWE (SECRETS)

1. Idź do: **https://github.com/TWOJ_USERNAME/negotiation-app/settings/secrets/actions**

2. Kliknij **"New repository secret"**

3. Dodaj dwa sekrety:

   **Sekret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `(skopiuj z twojego pliku .env)`

   **Sekret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `(skopiuj z twojego pliku .env)`

---

### 3️⃣ WŁĄCZ GITHUB PAGES

1. Idź do: **Settings** → **Pages** (w menu z lewej)

2. W sekcji **"Source"** wybierz:
   - Source: **GitHub Actions**

3. Kliknij **Save**

---

### 4️⃣ POCZEKAJ NA DEPLOY

1. Idź do: **Actions** (zakładka u góry)

2. Zobaczysz **"Deploy to GitHub Pages"** - poczekaj aż się zrobi zielony ✅

3. Po ~2-3 minutach aplikacja będzie gotowa!

---

## 🌐 LINK DO TWOJEJ APLIKACJI:

```
https://TWOJ_USERNAME.github.io/negotiation-app/
```

(podmień `TWOJ_USERNAME` i `negotiation-app` na swoje)

---

## 🔄 JAK AKTUALIZOWAĆ:

Po każdej zmianie:

```bash
git add .
git commit -m "Update app"
git push
```

GitHub automatycznie zrobi redeploy! (~2-3 minuty)

---

## ✅ JAK SPRAWDZIĆ CZY DZIAŁA:

Otwórz link: `https://TWOJ_USERNAME.github.io/negotiation-app/`

Powinieneś zobaczyć:
```
Negotiation Experiment Web App

[Gospodarz] [Uczestnik]
```

Kliknij **Gospodarz** → URL zmieni się na `...github.io/negotiation-app/#/host`

---

## 🎯 ALTERNATYWNE DARMOWE HOSTINGI

Jeśli GitHub Pages nie zadziała, masz też:

### **Surge.sh** (SUPER PROSTY!)

```bash
# Zainstaluj raz
npm install -g surge

# Potem zawsze:
npm run build
cd dist
surge
```

Podaj email + hasło (za pierwszym razem) → gotowe!

Link: `https://twoja-losowa-nazwa.surge.sh`

---

### **Render.com** (BEZ KONFIGURACJI!)

1. Idź na: https://render.com
2. Sign up (darmowe)
3. **New** → **Static Site**
4. Podłącz GitHub repo
5. Build Command: `npm run build`
6. Publish Directory: `dist`
7. Dodaj Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. **Create Static Site**

Link: `https://twoja-app.onrender.com`

---

### **Cloudflare Pages** (BARDZO SZYBKI!)

1. Idź na: https://pages.cloudflare.com
2. Sign up (darmowe)
3. **Create a project** → Podłącz GitHub
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. **Save and Deploy**

Link: `https://twoja-app.pages.dev`

---

## ❓ KTÓRY WYBRAĆ?

| Hosting | Plusy | Minusy |
|---------|-------|--------|
| **GitHub Pages** | Darmowy, automatyczny deploy | Musisz mieć GitHub |
| **Surge.sh** | NAJPROSTSZY! Jedna komenda | Losowa nazwa URL |
| **Render.com** | Przyjemny interface | Wolniejszy (~5 min deploy) |
| **Cloudflare Pages** | NAJSZYBSZY! | Wymaga Cloudflare konta |

**Moja rekomendacja:** Zacznij od **GitHub Pages** (bo masz już gotową konfigurację) lub **Surge.sh** (jeśli chcesz coś SUPER szybkiego).

---

## 🆘 JEŚLI DALEJ NIE DZIAŁA:

### Sprawdź:
1. Czy zmienne środowiskowe są dodane?
2. Czy deploy się skończył (zielony ✅)?
3. Otwórz F12 → Console - jakie błędy?

### Wyślij mi:
1. Link do twojej aplikacji
2. Screenshot konsoli (F12 → Console)
3. Który hosting wybrałeś

**Pomogę zdiagnozować!**

---

## 🎉 RÓŻNICA:

**PRZED:** URL: `https://app.com/host` (nie działało)
**TERAZ:** URL: `https://app.com/#/host` (działa wszędzie!)

Hash routing (#) działa na WSZYSTKICH hostingach bez żadnej konfiguracji!

---

**GOTOWE!** Która opcja Cię interesuje? Powiedz mi to pomogę!
