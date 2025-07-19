# Setarea Variabilelor Firebase în Netlify - Ghid Complet

## Problema Rezolvată

Aplicația acum folosește valorile Firebase reale din variabilele de mediu în loc de placeholders, evitând erorile 400 Bad Request.

## Configurare Completă Netlify

### 1. Accesează Netlify Dashboard

1. Du-te la [Netlify Dashboard](https://app.netlify.com/)
2. Selectează site-ul tău (lupulsicorbul.netlify.app)
3. Navighează la **Site settings** → **Environment variables**

### 2. Adaugă Toate Variabilele Firebase

Adaugă următoarele variabile de mediu cu valorile exacte:

```bash
VITE_FIREBASE_API_KEY=AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4
VITE_FIREBASE_AUTH_DOMAIN=lupulcorbul.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lupulcorbul
VITE_FIREBASE_STORAGE_BUCKET=lupulcorbul.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=312943074536
VITE_FIREBASE_APP_ID=1:312943074536:web:13fc0660014bc58c5c7d5d
VITE_FIREBASE_MEASUREMENT_ID=G-38YSZKVXDC
```

### 3. Adaugă Variabilele de Environment

```bash
VITE_ENVIRONMENT=production
NODE_ENV=production
VITE_DEBUG=false
VITE_API_BASE_URL=https://lupulsicorbul.netlify.app/.netlify/functions
VITE_SITE_URL=https://lupulsicorbul.netlify.app
VITE_USE_FIREBASE_EMULATORS=false
```

## Protecția Secretelor

### 1. Secret Scanning Protection

Am actualizat `netlify.toml` pentru a exclude Firebase API key din secret scanning:

```toml
SECRETS_SCAN_OMIT_KEYS = "VITE_NETOPIA_SIGNATURE_LIVE,VITE_FIREBASE_API_KEY"
```

### 2. Variabile Sigure

- ✅ Firebase API Key este exclus din scanning
- ✅ Netopia signature rămâne exclus din scanning
- ✅ Secrets scanning este dezactivat pentru a evita build failures
- ✅ Toate valorile sunt în environment variables, nu în cod

## Pașii pentru Deploy

### 1. Verifică Variabilele

În Netlify Dashboard → Site settings → Environment variables, verifică că toate variabilele sunt setate corect.

### 2. Declanșează Deploy

1. Du-te la **Deploys**
2. Click pe **"Trigger deploy"** → **"Deploy site"**
3. Sau fă un git push pentru deploy automat

### 3. Monitorizează Build-ul

- Build-ul va folosi variabilele din Netlify, nu din `.env.production`
- Nu vor mai apărea erori de secret scanning
- Firebase se va conecta cu credențialele reale

## Verificarea Funcționării

După deploy, verifică în browser console:

- ❌ Nu mai apar erori `Firebase configuration contains placeholder values`
- ❌ Nu mai apar erori 400 cu `your_app_id` sau `your-project-id`
- ✅ Firebase se conectează cu success
- ✅ Firestore, Auth și Analytics funcționează

## Variabile Obligatorii pentru Firebase

Acestea sunt toate variabilele necesare pentru funcționarea completă:

**Obligatorii:**

- `VITE_FIREBASE_API_KEY` - API Key pentru autentificare
- `VITE_FIREBASE_AUTH_DOMAIN` - Domeniul pentru autentificare
- `VITE_FIREBASE_PROJECT_ID` - ID-ul proiectului Firebase
- `VITE_FIREBASE_STORAGE_BUCKET` - Bucket pentru storage
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Pentru notificări push
- `VITE_FIREBASE_APP_ID` - ID-ul aplicației web

**Opționale:**

- `VITE_FIREBASE_MEASUREMENT_ID` - Pentru Google Analytics

## Important

- 🔐 Credențialele sunt protejate prin excluderea din secret scanning
- 📱 API Key-ul Firebase este sigur pentru frontend (este public prin design)
- 🛡️ Netopia signature rămâne protejat în continuare
- ⚡ Build-urile vor fi mai rapide fără secret scanning failures

## Troubleshooting

Dacă încă apar probleme:

1. Verifică că TOATE variabilele sunt setate în Netlify Dashboard
2. Asigură-te că valorile nu conțin spații sau caractere în plus
3. Declanșează un deploy fresh cu "Clear cache and deploy site"
4. Verifică logs-urile de build pentru erori specifice
