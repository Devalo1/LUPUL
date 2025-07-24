# 🚨 FIX URGENT: Certificat SSL Invalid pentru lupulsicorbul.com

## PROBLEMA IDENTIFICATĂ:

```
net::ERR_CERT_COMMON_NAME_INVALID
Certificatul SSL nu este configurat pentru lupulsicorbul.com
```

## CAUZA:

- Domeniul lupulsicorbul.com nu este configurat corect în Netlify
- Site-ul are certificat pentru altă adresă (probabil .netlify.app)
- Funcțiile nu merg pentru că HTTPS nu funcționează

## SOLUȚIA - CONFIGURARE DOMENIU ÎN NETLIFY:

### 1. 🌐 Intră în Netlify Dashboard

```
URL: https://app.netlify.com/
```

### 2. 🔍 Selectează site-ul tău

- Click pe site-ul "lupul-si-corbul"

### 3. ⚙️ Mergi la Domain Settings

- În meniul lateral: **"Domain management"**
- Sau direct: **"Site settings" → "Domain management"**

### 4. 🔗 Verifică Custom domains

- Dacă vezi `lupulsicorbul.com` în listă:
  - Verifică că status-ul este **"Netlify DNS"** sau **"External DNS"**
  - Dacă e problematic (roșu), click pe el pentru detalii
- Dacă NU vezi `lupulsicorbul.com`:
  - Click **"Add custom domain"**
  - Introdu: `lupulsicorbul.com`
  - Confirmă

### 5. 🔒 HTTPS/SSL Certificate

- Mergi la secțiunea **"HTTPS"**
- Verifică că **"Force HTTPS"** este activat
- Dacă certificatul e invalid: Click **"Renew certificate"**

### 6. 🌍 DNS Configuration

- Dacă domeniul e configurat extern (nu Netlify DNS):
  - Verifică că recordurile DNS pointează corect:
  - A record: pointează la IP-ul Netlify
  - CNAME: pointează la [site-name].netlify.app

## VERIFICARE RAPIDĂ:

### Test 1: Verifică certificatul

```bash
# Dacă merge:
curl -I https://lupulsicorbul.com

# Dacă nu merge, testează subdomenul netlify:
curl -I https://[numele-site-ului].netlify.app
```

### Test 2: Găsește URL-ul corect Netlify

- În Dashboard → Site overview
- Caută URL-ul cu format: `https://[random-name].netlify.app`

## SOLUȚIE TEMPORARĂ PENTRU TESTARE:

Să testez cu URL-ul Netlify direct în loc de domeniul custom.
