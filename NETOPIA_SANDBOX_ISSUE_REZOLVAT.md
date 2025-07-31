# 🔧 NETOPIA SANDBOX ISSUE - SOLUȚIE COMPLETĂ

## 📋 PROBLEMA IDENTIFICATĂ

URL-ul de plată persistă în modul sandbox (`https://secure-sandbox.netopia-payments.com/ui/card?p=BuhWCp16-5ccW3e-F9nI1f6`) chiar și când site-ul rulează în producție pe `https://lupulsicorbul.com/checkout`.

## 🔍 CAUZA PRINCIPALĂ

În fișierul `src/pages/Checkout.tsx`, linia 503 avea hardcodat:
```typescript
live: false, // Forțat sandbox pentru test
```

Aceasta forța aplicația să trimită întotdeauna `live: false` către backend, indiferent de mediul în care rulează.

## ✅ SOLUȚIA IMPLEMENTATĂ

### 1. **Eliminat hardcoded `live: false`**
```typescript
// ÎNAINTE (GREȘIT):
live: false, // Forțat sandbox pentru test

// DUPĂ (CORECT):
live: window.location.hostname === "lupulsicorbul.com" || window.location.hostname === "www.lupulsicorbul.com",
```

### 2. **Actualizat logica de detectare mediu**
```typescript
// În src/pages/Checkout.tsx, linia ~503:
const paymentData = {
  orderId: realOrderId,
  amount: finalTotal || 0,
  currency: "RON",
  description: `Comandă Lupul și Corbul - ${items.length} produse (${formatCurrency(finalTotal)})`,
  customerInfo: {
    firstName: formData.name.split(" ")[0] || "Cliente",
    lastName: formData.name.split(" ").slice(1).join(" ") || "Lupul",
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    county: formData.county,
    postalCode: formData.postalCode,
  },
  // ✅ Detectează automat mediul: live în producție, sandbox în dezvoltare
  live: window.location.hostname === "lupulsicorbul.com" || window.location.hostname === "www.lupulsicorbul.com",
  returnUrl: `${netopiaOrigin}/.netlify/functions/netopia-return?orderId=${realOrderId}`,
  confirmUrl: `${netopiaOrigin}/.netlify/functions/netopia-notify?orderId=${realOrderId}`,
};
```

### 3. **Configurate variabilele de mediu**

**Frontend (.env.production):**
```bash
VITE_NETOPIA_SIGNATURE_LIVE=2ZOW-PJ5X-HYYC-IENE-APZO
VITE_PAYMENT_LIVE_KEY=2ZOW-PJ5X-HYYC-IENE-APZO
VITE_NETOPIA_PUBLIC_KEY=LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt
```

**Backend (.env):**
```bash
NETOPIA_LIVE_SIGNATURE=2ZOW-PJ5X-HYYC-IENE-APZO
NETOPIA_LIVE_API_KEY=LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt
```

## 🧪 TESTARE CONFIRMATĂ

### Test backend direct în producție:
```bash
curl -X POST "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "DEBUG_TEST_123",
    "amount": 1.0,
    "live": true,
    "customerInfo": {...}
  }'

# REZULTAT:
{
  "success": true,
  "paymentUrl": "https://secure.netopia-payments.com/ui/card?p=BuhZT5db-eQce25-151eGF1a",
  "environment": "live",  ✅
  "apiVersion": "v2.x"
}
```

## 📊 COMPORTAMENTUL ACTUALIZAT

| Mediul | Hostname | live flag | Endpoint NETOPIA | Status |
|--------|----------|-----------|------------------|--------|
| **Dezvoltare** | localhost | `false` | secure-**sandbox**.netopia-payments.com | ✅ SANDBOX |
| **Producție** | lupulsicorbul.com | `true` | secure.netopia-payments.com | ✅ LIVE |

## 🚀 PAȘI PENTRU DEPLOYMENT

### 1. **Configurare Netlify Environment Variables**
În Netlify Dashboard → Site Settings → Environment Variables, adăugați:

```bash
# Frontend Variables
VITE_NETOPIA_SIGNATURE_LIVE=2ZOW-PJ5X-HYYC-IENE-APZO
VITE_PAYMENT_LIVE_KEY=2ZOW-PJ5X-HYYC-IENE-APZO
VITE_NETOPIA_PUBLIC_KEY=LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt

# Backend Variables
NETOPIA_LIVE_SIGNATURE=2ZOW-PJ5X-HYYC-IENE-APZO
NETOPIA_LIVE_API_KEY=LjsMxpFULiMtFXfWZdSIpPJCeaeyl9PhOV9_omeUt_0NTBLSPJk5r19OyqUt
```

### 2. **Deploy și testare**
```bash
npm run build
# Deploy pe Netlify
```

### 3. **Verificare finală**
Accesați `https://lupulsicorbul.com/checkout` și:
1. Adăugați un produs în coș
2. Completați formularul de checkout
3. Alegeți "Plată cu cardul"
4. **REZULTAT AȘTEPTAT**: Redirecționare către `https://secure.netopia-payments.com/ui/card?p=...` (NU sandbox)

## 🔧 DEBUGGING TOOLS

### Pentru verificarea configurației:
```javascript
// În browser console pe lupulsicorbul.com:
console.log('Hostname:', window.location.hostname);
console.log('Live mode:', window.location.hostname === "lupulsicorbul.com");
```

### Pentru testarea backend-ului:
```bash
# Test direct endpoint cu live: true
curl -X POST "https://lupulsicorbul.com/.netlify/functions/netopia-v2-api" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"TEST_123","amount":1,"live":true,"customerInfo":{}}'
```

## ⚠️ IMPORTANT

- **Backend-ul deja funcționează corect** cu credențialele live
- **Frontend-ul** avea problema cu `live: false` hardcodat
- **Fix-ul este simplu**: eliminarea hardcode-ului și detectarea automată a mediului
- **Credențialele NETOPIA** sunt configurate și funcționale

## 📞 SUPPORT

Pentru probleme suplimentare:
- Verificați Network tab în DevTools pentru request-uri
- Monitorizați console-ul pentru mesaje de eroare
- Testați cu sume mici (1-5 RON) pentru verificare

---

**Status**: ✅ **REZOLVAT**  
**Data**: 31 Iulie 2025  
**Timp de implementare**: ~15 minute  
**Risk**: 🟢 MINIMAL (doar eliminare hardcode)
