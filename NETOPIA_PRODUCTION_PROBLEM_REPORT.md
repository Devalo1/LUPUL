# 🚨 RAPORT PROBLEMĂ NETOPIA PRODUCȚIE

## ❌ PROBLEMA IDENTIFICATĂ

Eroarea **"NETOPIA API Error 404"** pe site-ul de producție https://lupulsicorbul.com se datorează faptului că **funcția Netlify `netopia-v2-api.js` nu poate fi accesată** sau **nu are credențialele NETOPIA configurate**.

Din log-urile de eroare văd că:

1. Request-ul la `/.netlify/functions/netopia-v2-api` returnează HTML (pagina 404) în loc de JSON
2. Mesajul de eroare conține `<!DOCTYPE html>` - asta înseamnă că Netlify redirectează către homepage

## 🔍 CAUZE POSIBILE

### 1. **Variabilele de mediu NETOPIA lipsesc din Netlify**

În `netlify.toml` în secțiunea `[build.environment]` nu sunt configurate:

- `NETOPIA_LIVE_SIGNATURE`
- `NETOPIA_LIVE_API_KEY`
- `VITE_NETOPIA_SIGNATURE_LIVE`
- `VITE_PAYMENT_LIVE_KEY`

### 2. **Funcția nu este deploy-ată corect**

Funcția `netopia-v2-api.js` există local dar s-ar putea să nu fie deploy-ată pe Netlify.

### 3. **Configurația de redirect SPA**

Redirectarea `/* → /index.html` ar putea intercepta request-urile către funcții.

## 🔧 SOLUȚII IMMEDIATE

### Soluția 1: Configurează variabilele NETOPIA în Netlify Dashboard

1. **Accesează Netlify Dashboard** pentru https://lupulsicorbul.com
2. **Mergi la Site Settings → Environment Variables**
3. **Adaugă următoarele variabile:**

```bash
# Pentru backend (Netlify Functions)
NETOPIA_LIVE_SIGNATURE=2ZOW-PJ5X-HYYC-IENE-APZO
NETOPIA_LIVE_API_KEY=LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt

# Pentru frontend (Vite)
VITE_NETOPIA_SIGNATURE_LIVE=2ZOW-PJ5X-HYYC-IENE-APZO
VITE_PAYMENT_LIVE_KEY=LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt
```

### Soluția 2: Adaugă în netlify.toml (BACKUP)

Adaugă în secțiunea `[build.environment]` din `netlify.toml`:

```toml
[build.environment]
  # ... existing vars ...

  # NETOPIA Live Configuration pentru producție
  NETOPIA_LIVE_SIGNATURE = "2ZOW-PJ5X-HYYC-IENE-APZO"
  NETOPIA_LIVE_API_KEY = "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt"
  VITE_NETOPIA_SIGNATURE_LIVE = "2ZOW-PJ5X-HYYC-IENE-APZO"
  VITE_PAYMENT_LIVE_KEY = "LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt"
```

### Soluția 3: Forțează rebuild și redeploy

După configurarea variabilelor:

1. **Fă commit și push** la modificările din `netlify.toml`
2. **Forțează rebuild** în Netlify Dashboard
3. **Verifică** că funcțiile sunt deploy-ate în Functions tab

## 🧪 TESTARE RAPIDĂ

Pentru a testa imediat funcția pe producție, deschide Console-ul browserului pe https://lupulsicorbul.com și rulează:

```javascript
// Test rapid endpoint NETOPIA
fetch("/.netlify/functions/netopia-v2-api", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId: "TEST-" + Date.now(),
    amount: 1,
    currency: "RON",
    description: "Test diagnostic",
    customerInfo: {
      firstName: "Test",
      lastName: "User",
      email: "test@lupulsicorbul.com",
      phone: "0700000000",
      address: "Test",
      city: "Bucuresti",
      county: "Bucuresti",
      postalCode: "010000",
    },
    live: true,
  }),
})
  .then((r) => r.text())
  .then((t) => console.log("Response:", t.substring(0, 200)))
  .catch((e) => console.error("Error:", e));
```

Dacă răspunsul este HTML cu `<!DOCTYPE`, problema este cu deploy-ul funcției.
Dacă răspunsul este JSON cu error despre credențiale, problema este cu variabilele de mediu.

## 📋 VERIFICARE NETLIFY DASHBOARD

1. **Functions Tab** - verifică că `netopia-v2-api` apare în lista funcțiilor
2. **Environment Variables** - verifică că variabilele NETOPIA sunt setate
3. **Deploy Log** - verifică că nu sunt erori la build

## 🎯 PRIORITĂȚI

1. **🔥 URGENT**: Configurează variabilele NETOPIA în Netlify Dashboard
2. **⚡ IMEDIAT**: Redeploy site-ul după configurare
3. **✅ VERIFICARE**: Testează plata cu cardul pe lupulsicorbul.com

După aceste pași, plățile cu cardul vor funcționa în producție cu endpoint-urile LIVE NETOPIA!
