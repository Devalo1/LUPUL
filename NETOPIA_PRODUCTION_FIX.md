# 🔧 NETOPIA PRODUCTION CONFIGURATION

## ❌ PROBLEMA CURENTĂ

În producție apare mesajul "🧪 SIMULARE TEST" în loc de procesarea reală a plății cu cardul.

## 🔍 CAUZA

Aplicația folosește configurația SANDBOX pentru NETOPIA în loc de LIVE mode din cauza că:

1. Variabilele de mediu VITE\_ nu sunt setate corect în Netlify
2. Funcția Netlify nu primește signature-ul LIVE corect

## ✅ SOLUȚIA

### 1. Variabile de Mediu în Netlify

Setează următoarele variabile în Netlify Dashboard → Site Settings → Environment Variables:

```bash
# NETOPIA Live Credentials (pentru funcția Netlify)
NETOPIA_LIVE_SIGNATURE=YOUR_LIVE_SIGNATURE_HERE
NETOPIA_LIVE_PUBLIC_KEY=YOUR_LIVE_PUBLIC_KEY_HERE

# NETOPIA pentru frontend (Vite)
VITE_NETOPIA_SIGNATURE_LIVE=YOUR_LIVE_SIGNATURE_HERE
VITE_NETOPIA_PUBLIC_KEY=YOUR_LIVE_PUBLIC_KEY_HERE

# URL-ul site-ului
URL=https://your-site.netlify.app
```

### 2. Cum să Obții Credentialele NETOPIA Live

1. Accesează contul NETOPIA merchant
2. Navighează la Settings → API Credentials
3. Copiază Signature și Public Key pentru LIVE environment
4. **ATENȚIE:** NU folosi credentialele de SANDBOX în producție!

### 3. Verificarea Configurației

După setarea variabilelor, poți verifica configurația accesând:

```
https://your-site.netlify.app/.netlify/functions/netopia-debug
```

### 4. Expected Output în LIVE Mode

```json
{
  "status": "success",
  "environment": {
    "NETOPIA_LIVE_SIGNATURE": "SET (length: XX)",
    "NETOPIA_LIVE_PUBLIC_KEY": "SET (length: XX)"
  },
  "netopiaConfig": {
    "mode": "LIVE",
    "signature": "YOUR_SIGNATURE...",
    "endpoint": "https://secure.netopia-payments.com/payment/card"
  },
  "message": "✅ NETOPIA LIVE MODE ACTIVE"
}
```

## 🚨 DEBUGGING STEPS

### 1. Verifică Configurația Frontend

```javascript
// În browser console, pe site-ul de producție:
console.log({
  isProduction: window.location.hostname !== "localhost",
  liveSignature: import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE,
  publicKey: import.meta.env.VITE_NETOPIA_PUBLIC_KEY,
});
```

### 2. Verifică Logs Netlify

1. Netlify Dashboard → Functions
2. Caută funcția `netopia-initiate`
3. Verifică logs pentru:
   - "🔧 Configuration selection"
   - "🚨 PRODUCTION ERROR"
   - Environment variables status

### 3. Test Flow Complet

1. Acceseză site-ul de producție
2. Adaugă un produs în coș
3. Mergi la checkout
4. Alege "Card bancar"
5. Completează datele (poți folosi date test)
6. Apasă "Finalizează comanda"
7. **REZULTAT AȘTEPTAT:** Redirecționare către NETOPIA, NU simulare

## 📋 CHECKLIST FIX PRODUCTION

- [ ] Setează `NETOPIA_LIVE_SIGNATURE` în Netlify env vars
- [ ] Setează `NETOPIA_LIVE_PUBLIC_KEY` în Netlify env vars
- [ ] Setează `VITE_NETOPIA_SIGNATURE_LIVE` în Netlify env vars
- [ ] Setează `VITE_NETOPIA_PUBLIC_KEY` în Netlify env vars
- [ ] Setează `URL=https://your-site.netlify.app` în Netlify env vars
- [ ] Deploy aplicația cu noile variabile
- [ ] Testează `/netlify/functions/netopia-debug`
- [ ] Testează procesul complet de plată
- [ ] Verifică că nu mai apare "🧪 SIMULARE TEST"

## ⚠️ IMPORTANT

- **NU commit-a** credentialele LIVE în repository
- **Folosește** doar Netlify Environment Variables pentru credentiale
- **Testează** întotdeauna cu sume mici în LIVE mode
- **Backup** credentialele într-un loc sigur

---

**Updated:** 19 Iulie 2025  
**Status:** PENDING - Așteaptă setarea variabilelor în Netlify
