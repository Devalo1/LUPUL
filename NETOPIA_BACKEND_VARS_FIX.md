# 🚨 PROBLEMA IDENTIFICATĂ: Backend Environment Variables

## Situația curentă

Frontend-ul are variabilele `VITE_*` setate în Netlify, dar backend-ul (funcția Netlify) caută variabile diferite:

- Frontend caută: `VITE_NETOPIA_SIGNATURE_LIVE`
- Backend caută: `NETOPIA_LIVE_SIGNATURE`

## Soluția

În Netlify → Site Settings → Environment Variables → Production, adaugă AMBELE seturi:

### Pentru Frontend (VITE):
- `VITE_NETOPIA_SIGNATURE_LIVE`: `2ZOW-PJ5X-HYYC-IENE-APZO`
- `VITE_NETOPIA_PUBLIC_KEY`: `[cheia publică extrasă]`

### Pentru Backend (Netlify Functions):
- `NETOPIA_LIVE_SIGNATURE`: `2ZOW-PJ5X-HYYC-IENE-APZO`
- `NETOPIA_LIVE_PUBLIC_KEY`: `[cheia publică extrasă]`
- `URL`: `https://lupulsicorbul.com`

## Verificare

După adăugarea variabilelor backend și redeploy, în console va apărea:
```
live: true
hasLiveSignature: true
```

În loc de:
```
live: false
hasLiveSignature: false
```
