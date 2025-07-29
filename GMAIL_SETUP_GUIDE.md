# Configurare Gmail pentru Trimiterea Emailurilor Reale în Dezvoltare

## Pasul 1: Activează Autentificarea în 2 Pași pentru Gmail

1. Mergi la [Contul Google](https://myaccount.google.com/)
2. Selectează **Securitate** din meniul din stânga
3. În secțiunea "Conectarea la Google", activează **Verificarea în 2 pași**

## Pasul 2: Generează o Parolă de Aplicație

1. După ce ai activat verificarea în 2 pași, mergi din nou la **Securitate**
2. În secțiunea "Conectarea la Google", găsește **Parole pentru aplicații**
3. Selectează aplicația: **Mail**
4. Selectează dispozitivul: **Computer Windows** (sau ce folosești)
5. Generează parola - vei primi o parolă de 16 caractere

## Pasul 3: Actualizează fișierul .env

În fișierul `.env` din directorul principal, înlocuiește:

```env
SMTP_PASS=test-development-mode
```

Cu parola ta reală de aplicație Gmail:

```env
SMTP_PASS=your-16-character-app-password
```

**ATENȚIE:** Nu pune spații în parola de aplicație!

## Pasul 4: Repornește Serverul Netlify Dev

După ce ai actualizat `.env`, repornește serverul:

```bash
# Oprește serverul cu Ctrl+C
# Apoi repornește-l cu:
netlify dev --port 8888
```

## Testare

După configurare, când plasezi o comandă ramburs:

- Vei primi un email real la adresa specificată în formular
- Adminul va primi un email la lupulsicorbul@gmail.com
- În consola serverului vei vedea: "✅ Email client trimis" și "✅ Email admin trimis"

## Troubleshooting

**Dacă nu primești emailuri:**

1. Verifică că parola de aplicație este corectă în `.env`
2. Verifică că `SMTP_USER=lupulsicorbul@gmail.com` în `.env`
3. Verifică că nu ai spații sau caractere speciale în parolă
4. Verifică folder-ul Spam/Junk în email

**Dacă vezi erori SMTP:**

- Verifică că contul Gmail are verificarea în 2 pași activată
- Verifică că parola de aplicație a fost generată corect
- Încearcă să regenerezi parola de aplicație

## Revenire la Simulare

Pentru a reveni la simularea emailurilor (fără trimitere reală), schimbă din nou în `.env`:

```env
SMTP_PASS=test-development-mode
```
