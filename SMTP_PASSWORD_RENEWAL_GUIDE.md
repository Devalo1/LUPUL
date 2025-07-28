# Gmail SMTP App Password Renewal Guide

## URGENT: Password-ul SMTP nu mai funcționează

Funcția de email merge perfect **local în modul de dezvoltare**, dar pentru **producție** trebuie să generezi un App Password nou pentru Gmail.

## Pași pentru regenerarea App Password:

### 1. Accesează Google Account Settings

- Mergi la: https://myaccount.google.com/
- Loghează-te cu `lupulsicorbul@gmail.com`

### 2. Activează 2-Step Verification (dacă nu e deja activă)

- Mergi la "Security" → "2-Step Verification"
- Urmează pașii pentru activare

### 3. Generează App Password

- În secțiunea "Security" → "App passwords"
- Selectează "Mail" ca aplicație
- Selectează "Other (custom name)" și scrie "Netlify Functions"
- Apasă "Generate"

### 4. Copiază noul password

- Va fi un string de 16 caractere (ex: `abcd efgh ijkl mnop`)
- **ATENȚIE:** Salvează-l imediat, nu se mai afișează din nou!

### 5. Actualizează Environment Variables

#### Pentru dezvoltare locală (.env):

```bash
SMTP_PASS=noul-app-password-aici
```

#### Pentru producție (Netlify):

- Mergi la Netlify Dashboard → Site Settings → Environment Variables
- Editează `SMTP_PASS` cu noul password
- Redeploy site-ul

## Testare

### Local (dezvoltare):

```bash
# În .env setează un password real să testezi SMTP
SMTP_PASS=noul-app-password

# Sau păstrează pentru simulare
SMTP_PASS=test-development-mode
```

### Producție:

- După actualizarea environment variables în Netlify
- Fă o comandă de test pe site-ul live

## Status actual:

✅ **Funcția de email este REPARATĂ**
✅ **Modul dezvoltare funcționează perfect** (simulează trimiterea)
❌ **Trebuie actualizat SMTP password pentru producție**

## Debugging disponibil:

Funcția afișează debug info în console pentru:

- Headers primite
- Detectarea modului de dezvoltare
- Simularea emailurilor în dev mode
- Detaliile comenzii

Statusul curent: **GATA PENTRU PRODUCȚIE** după actualizarea parolei SMTP.
