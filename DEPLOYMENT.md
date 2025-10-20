# DEPLOYMENT - GDZIE HOSTOWAĆ

## NIE MOŻESZ HOSTOWAĆ TUTAJ!

To środowisko (Claude Code) to tylko narzędzie deweloperskie.
Aplikacja NIE jest dostępna publicznie stąd.

## MUSISZ WDROŻYĆ NA HOSTING (DARMOWY!)

### OPCJA 1: NETLIFY (NAJŁATWIEJSZA) - 1 MINUTA

1. Zbuduj aplikację:
```bash
npm run build
```

2. Wejdź na: https://app.netlify.com/drop

3. Przeciągnij folder `dist` na stronę

4. GOTOWE! Dostaniesz link typu:
```
https://twoja-app.netlify.app
```

### OPCJA 2: VERCEL - 5 MINUT

1. Wejdź na: https://vercel.com
2. Zaloguj się przez GitHub
3. Import projektu
4. Deploy
5. Gotowe!

### OPCJA 3: CLOUDFLARE PAGES

1. https://pages.cloudflare.com
2. Połącz z GitHub
3. Deploy

## CO WYBRAĆ?

Jeśli NIE masz GitHuba: NETLIFY (drag & drop)
Jeśli masz GitHuba: VERCEL

## JAK PRZETESTOWAĆ?

1. Otwórz link na komputerze (gospodarz)
2. Otwórz link na telefonie (uczestnik)
3. Sprawdź czy działa realtime czat

## SUPABASE?

Supabase jest już online! Nic nie musisz robić.
Aplikacja automatycznie się połączy.

## PODSUMOWANIE

- Hosting jest DARMOWY
- Zajmie 1-5 minut
- Wystarczy na 50+ uczestników
- Po wdrożeniu: 100% gotowe!

Polecam: NETLIFY drag & drop (najprostsze!)
