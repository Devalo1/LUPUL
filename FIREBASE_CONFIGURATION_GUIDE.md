# Firebase Configuration Guide - Fixing 400 Bad Request Errors

## Problem Identificat

Aplicația încearcă să se conecteze la Firebase folosind valori placeholder în loc de credențiale reale, rezultând în erori 400 Bad Request:

```
GET https://firebase.googleapis.com/v1alpha/projects/-/apps/your_app_id/webConfig 400 (Bad Request)
POST https://firebaseinstallations.googleapis.com/v1/projects/your-project-id/installations 400 (Bad Request)
FirebaseError: Installations: Create Installation request failed with error "400 INVALID_ARGUMENT: API key not valid. Please pass a valid API key."
```

## Soluția

Trebuie să setezi variabilele de mediu Firebase reale în Netlify Dashboard.

## Pasii pentru Configurare

### 1. Obține Credențialele Firebase

Du-te la [Firebase Console](https://console.firebase.google.com/):

1. Selectează proiectul tău Firebase
2. Click pe ⚙️ Settings → Project settings
3. Scroll down la "Your apps" și click pe aplicația web
4. În secțiunea "SDK setup and configuration", copiază valorile din `firebaseConfig`

### 2. Setează Variabilele în Netlify

Du-te la [Netlify Dashboard](https://app.netlify.com/):

1. Selectează site-ul tău
2. Du-te la Site settings → Environment variables
3. Adaugă următoarele variabile cu valorile reale din Firebase Console:

```bash
VITE_FIREBASE_API_KEY=your_real_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_real_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_real_sender_id
VITE_FIREBASE_APP_ID=your_real_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_real_measurement_id
```

### 3. Declanșează un Nou Build

După ce ai setat variabilele:

1. Du-te la Deploys în Netlify Dashboard
2. Click pe "Trigger deploy" → "Deploy site"
3. Sau fă un push în repository pentru a declanșa automat

## Verificare

După build, dacă variabilele sunt setate corect:

- Nu vei mai vedea erori 400 cu "your_app_id" sau "your-project-id"
- Firebase se va conecta cu succes
- Aplicația va funcționa normal

## Debugging

Am adăugat validare în `firebase-core.ts` care va afișa erori clare dacă:

- Variabilele de mediu lipsesc
- Sunt încă folosite valori placeholder

## Important

- ❌ NU pune niciodată credențialele Firebase în cod
- ✅ Folosește doar variabilele de mediu Netlify
- ✅ Verifică că toate variabilele VITE*FIREBASE*\* sunt setate
- ✅ Valorile trebuie să fie reale, nu placeholder-uri

## Variabile Obligatorii

Acestea sunt variabilele minime necesare:

- `VITE_FIREBASE_API_KEY` - Cheia API Firebase
- `VITE_FIREBASE_AUTH_DOMAIN` - Domeniul de autentificare
- `VITE_FIREBASE_PROJECT_ID` - ID-ul proiectului
- `VITE_FIREBASE_STORAGE_BUCKET` - Bucket-ul de storage
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - ID-ul sender-ului de mesagerie
- `VITE_FIREBASE_APP_ID` - ID-ul aplicației Firebase

Opțională:

- `VITE_FIREBASE_MEASUREMENT_ID` - Pentru Google Analytics (dacă folosești)
