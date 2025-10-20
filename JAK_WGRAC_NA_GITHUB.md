# 📤 JAK WGRAĆ NA GITHUB - KROK PO KROKU

## ✅ COMMIT JUŻ GOTOWY!

Właśnie zrobiłem commit wszystkich plików:
```
[master 109936e] Complete experiment app with timer fix and Supabase integration
48 files changed, 9975 insertions(+)
```

## 🔐 WAŻNE: .env NIE JEST W REPOZYTORIUM

✅ `.env` jest w `.gitignore` - Twoje klucze Supabase są bezpieczne!
✅ Tylko kod aplikacji jest commitowany
✅ Po wgraniu na GitHub będziesz musiał dodać klucze w ustawieniach hostingu

---

## 📤 KROK 1: UTWÓRZ REPOZYTORIUM NA GITHUB

1. Wejdź na: https://github.com/new

2. Wypełnij:
   - **Repository name:** `experiment-app` (lub dowolna nazwa)
   - **Description:** "Aplikacja do eksperymentów ekonomicznych"
   - **Public** lub **Private** (wybierz co chcesz)
   - ❌ **NIE zaznaczaj** "Add README" (już masz!)
   - ❌ **NIE zaznaczaj** "Add .gitignore" (już masz!)

3. Kliknij **"Create repository"**

4. GitHub pokaże Ci instrukcje. **SKOPIUJ** URL typu:
   ```
   https://github.com/twoja-nazwa/experiment-app.git
   ```

---

## 📤 KROK 2: WGRAJ LOKALNY KOD

W terminalu (w folderze projektu) wpisz:

```bash
# Dodaj remote (wklej SWÓJ URL z GitHuba!)
git remote add origin https://github.com/TWOJA-NAZWA/experiment-app.git

# Zmień nazwę branch na main (jeśli chcesz)
git branch -M main

# Wypchnij kod na GitHub
git push -u origin main
```

---

## 📤 KROK 3: SPRAWDŹ NA GITHUB

Odśwież stronę GitHub - zobaczysz wszystkie pliki! ✅

---

## 🚀 KROK 4: DEPLOY Z GITHUB

### OPCJA A: VERCEL (ZALECANE)

1. Wejdź na: https://vercel.com
2. Zaloguj się przez GitHub
3. Kliknij **"Add New Project"**
4. Wybierz swoje repozytorium `experiment-app`
5. **Environment Variables** - DODAJ:
   ```
   VITE_SUPABASE_URL=https://[twój-projekt].supabase.co
   VITE_SUPABASE_ANON_KEY=[twój-klucz]
   ```
   *(Skopiuj z pliku `.env` który masz lokalnie)*

6. Kliknij **"Deploy"**

7. Czekaj 2 minuty

8. GOTOWE! 🎉 Dostaniesz link.

### OPCJA B: NETLIFY

1. Wejdź na: https://netlify.com
2. Kliknij **"Add new site"** → **"Import an existing project"**
3. Wybierz GitHub
4. Wybierz swoje repozytorium
5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Environment variables** - DODAJ:
   ```
   VITE_SUPABASE_URL=https://[twój-projekt].supabase.co
   VITE_SUPABASE_ANON_KEY=[twój-klucz]
   ```
7. Kliknij **"Deploy"**
8. GOTOWE! 🎉

---

## 🔄 JAK ZAKTUALIZOWAĆ PO ZMIANACH?

Jeśli zmienisz coś w kodzie:

```bash
# Lokalnie
git add .
git commit -m "Opis zmian"
git push

# Vercel/Netlify automatycznie zdeployuje nową wersję!
```

---

## ❓ NAJCZĘSTSZE PROBLEMY

### Problem: "Permission denied (publickey)"
**Rozwiązanie:** Musisz skonfigurować SSH klucz dla GitHub:
- https://docs.github.com/en/authentication/connecting-to-github-with-ssh

LUB użyj HTTPS z tokenem:
```bash
git remote set-url origin https://[TOKEN]@github.com/twoja-nazwa/repo.git
```

### Problem: "Failed to fetch"
**Rozwiązanie:** Sprawdź URL:
```bash
git remote -v
```

### Problem: "Aplikacja nie działa po deploy"
**Rozwiązanie:** Sprawdź czy dodałeś zmienne środowiskowe (VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY) w ustawieniach Vercel/Netlify!

---

## 📋 CHECKLIST

Przed deployem sprawdź:

- [ ] Repozytorium utworzone na GitHub
- [ ] Kod wgrany (`git push`)
- [ ] Vercel/Netlify podłączony do repozytorium
- [ ] Zmienne środowiskowe dodane (VITE_SUPABASE_*)
- [ ] Deploy zakończony sukcesem
- [ ] Link działa
- [ ] Test: gospodarz + uczestnik

---

## 🎯 PODSUMOWANIE

### Co już jest zrobione:
✅ Commit lokalny gotowy (48 plików)
✅ `.env` bezpiecznie zignorowany
✅ Kod gotowy do wgrania

### Co musisz zrobić:
1. Utwórz repo na GitHub (2 minuty)
2. `git push` (1 minuta)
3. Deploy na Vercel/Netlify (3 minuty)
4. Dodaj zmienne środowiskowe (1 minuta)

### RAZEM: 7 MINUT! ⏱️

Po tym aplikacja będzie publicznie dostępna i gotowa na eksperyment! 🚀

---

**Potrzebujesz pomocy?** Powiedz mi na którym kroku utknąłeś!
