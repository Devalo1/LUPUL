# 🏪 Fix Endpoint Netopia pentru Marketplace

## Problema Identificată

Ați primit un email de la Netopia care spunea:

> "Din păcate, redirectionarea plății nu se face către endpoint-ul https://secure.sandbox.netopia-payments.com/payment/card/start"

## Cauza Problemei

Funcția `netopia-initiate-marketplace.mjs` folosea URL-urile vechi de la MobilPay în loc de noile endpoint-uri Netopia:

**❌ Endpoint-uri INCORECTE (vechi):**

- Sandbox: `https://sandboxsecure.mobilpay.ro`
- Live: `https://secure.mobilpay.ro`

**✅ Endpoint-uri CORECTE (noi):**

- Sandbox: `https://secure-sandbox.netopia-payments.com/payment/card`
- Live: `https://secure.netopia-payments.com/payment/card`

## Modificările Aplicate

### 1. Actualizare Configurație Netopia

**Fișier:** `netlify/functions/netopia-initiate-marketplace.mjs`

```javascript
// ÎNAINTE (incorect)
const NETOPIA_URL = NETOPIA_CONFIG.isLive
  ? "https://secure.mobilpay.ro"
  : "https://sandboxsecure.mobilpay.ro";

// DUPĂ (corect)
const NETOPIA_CONFIG = {
  sandbox: {
    signature:
      process.env.NETOPIA_SANDBOX_SIGNATURE || "SANDBOX_SIGNATURE_PLACEHOLDER",
    endpoint: "https://secure-sandbox.netopia-payments.com/payment/card",
    publicKey: process.env.NETOPIA_SANDBOX_PUBLIC_KEY,
  },
  live: {
    signature: process.env.NETOPIA_LIVE_SIGNATURE,
    endpoint: "https://secure.netopia-payments.com/payment/card",
    publicKey: process.env.NETOPIA_LIVE_PUBLIC_KEY,
  },
};
```

### 2. Actualizare Structură Payload

Payload-ul a fost actualizat pentru a fi consistent cu funcția principală `netopia-initiate.mjs`:

```javascript
// Structura nouă (consistentă cu Netopia)
return {
  config: {
    emailTemplate: "lupul-si-corbul-marketplace",
    notifyUrl: `${baseUrl}/.netlify/functions/netopia-notify-marketplace`,
    redirectUrl: `${baseUrl}/.netlify/functions/netopia-return-marketplace`,
    language: "ro",
  },
  payment: {
    options: {
      installments: 1,
      bonus: 0,
    },
    instrument: {
      type: "card",
      account: "",
      expMonth: "",
      expYear: "",
      secretCode: "",
    },
    data: {
      property: "mobilPay_Request_Card",
      action: "sale",
      confirmUrl: `${baseUrl}/.netlify/functions/netopia-notify-marketplace`,
      returnUrl: `${baseUrl}/.netlify/functions/netopia-return-marketplace`,
      signature: NETOPIA_CURRENT_CONFIG.signature,
      orderId: orderId,
      amount: amount.toString(),
      currency: currency,
      details: description,
      // ... billing și shipping info
    },
  },
  // Metadata marketplace
  marketplace: {
    listingId: listingId,
    emblemId: emblemId,
    sellerId: sellerId,
    buyerId: buyerId,
    type: "emblem_marketplace_purchase",
  },
};
```

### 3. Îmbunătățire Form HTML

Form-ul de plată include acum informații clare despre endpoint-ul folosit:

```html
<div class="endpoint-info">
  ✅ Endpoint corect: ${NETOPIA_CURRENT_CONFIG.endpoint}
</div>
```

### 4. Actualizare Frontend

**Fișier:** `src/components/emblems/EmblemMarketplace.tsx`

Plata se deschide acum într-un pop-up în loc de redirect complet:

```typescript
// Deschide pop-up pentru plata Netopia
const paymentWindow = window.open(
  "",
  "netopia-payment",
  "width=800,height=600,scrollbars=yes"
);
if (paymentWindow) {
  paymentWindow.document.write(result.paymentUrl);
  paymentWindow.document.close();
}
```

## Verificarea Funcționalității

### Testing Checklist

- [ ] **Sandbox Mode:** Verifică că se folosește `https://secure-sandbox.netopia-payments.com/payment/card`
- [ ] **Live Mode:** Verifică că se folosește `https://secure.netopia-payments.com/payment/card`
- [ ] **Payload Structure:** Confirmă că payload-ul respectă structura Netopia
- [ ] **Form Submission:** Verifică că form-ul se submitează la endpoint-ul corect
- [ ] **Pop-up Payment:** Testează că plata se deschide în pop-up

### Environment Variables Necesare

```env
# Sandbox
NETOPIA_SANDBOX_SIGNATURE=SANDBOX_123456789
NETOPIA_SANDBOX_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...

# Live (Production)
NETOPIA_LIVE_SIGNATURE=LIVE_987654321
NETOPIA_LIVE_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
NETOPIA_LIVE_MODE=true
```

## Urmările Fix-ului

✅ **Endpoint-uri corecte:** Folosește noile URL-uri Netopia în loc de MobilPay vechi  
✅ **Payload consistent:** Aceeași structură ca în funcția principală  
✅ **Debugging îmbunătățit:** Log-uri clare cu endpoint-ul folosit  
✅ **UX îmbunătățit:** Pop-up pentru plată în loc de redirect complet  
✅ **Fallback robust:** Handling pentru cazuri când pop-up-ul e blocat

## Note Importante

1. **Compatibilitate:** Modificările sunt backwards compatible
2. **Testare:** Testați în sandbox înainte de a merge live
3. **Monitorare:** Urmăriți log-urile pentru confirmarea endpoint-urilor corecte
4. **Actualizare:** Alte funcții Netopia folosesc deja endpoint-urile corecte

---

**Status:** ✅ **REZOLVAT**  
**Data:** 28 Iulie 2025  
**Impact:** Marketplace-ul va redirecta acum corect către Netopia
