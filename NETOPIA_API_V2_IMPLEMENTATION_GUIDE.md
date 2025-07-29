# NETOPIA API v2.x Implementation Guide 🚀

## Overview

Această implementare folosește noua NETOPIA API v2.x conform documentației oficiale:

- **Documentație**: https://doc.netopia-payments.com/docs/payment-api/v2.x/introduction
- **API Reference**: https://netopia-system.stoplight.io/docs/payments-api

## Diferențe față de implementarea actuală

### Implementarea actuală (v1.x cu POS Signature):

- Folosește `POS Signature` pentru autentificare
- Trimite date prin form POST cu `data` și `signature`
- Endpoint: `/payment/card/start`

### Noua implementare (v2.x cu API KEY):

- Folosește `API KEY` în header `Authorization`
- Trimite date JSON direct
- Endpoint: `/api/v2/payment/card/start`

## Configurare Environment Variables

### Pentru Sandbox (dezvoltare):

```bash
NETOPIA_SANDBOX_API_KEY=your_sandbox_api_key_here
```

### Pentru Live (producție):

```bash
NETOPIA_LIVE_API_KEY=your_live_api_key_here
```

## Unde să obții API KEY-urile

Conform mesajului primit de la NETOPIA:

1. **Accesează NETOPIA Admin Panel**:

   - Sandbox: https://admin.sandbox.netopia-payments.com
   - Live: https://admin.netopia-payments.com

2. **Navigează la**: Profile → Security

3. **Generează API KEY**:
   - Poți crea, regenera sau șterge key-uri oricând
   - Sandbox keys nu funcționează pe Live și vice versa
   - Include API KEY în headerul `Authorization`

## Cum să testezi noua implementare

### 1. Configurează variabilele de mediu

Adaugă în Netlify Dashboard → Site Settings → Environment Variables:

```bash
NETOPIA_SANDBOX_API_KEY=your_actual_sandbox_api_key
```

### 2. Testează funcția locală

```bash
# În terminal, din directorul proiectului
netlify dev

# Apoi accesează:
# http://localhost:8888/.netlify/functions/netopia-v2-api
```

### 3. Test cu curl

```bash
curl -X POST http://localhost:8888/.netlify/functions/netopia-v2-api \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST-' + Date.now() + '",
    "amount": 10.50,
    "currency": "RON",
    "description": "Test API v2.x",
    "customerInfo": {
      "firstName": "Test",
      "lastName": "Customer",
      "email": "test@lupulsicorbul.com",
      "phone": "+40712345678",
      "address": "Strada Test 123",
      "city": "Bucuresti",
      "county": "Bucuresti",
      "postalCode": "010000"
    },
    "live": false
  }'
```

## Integrare în aplicația existentă

### Opțiunea 1: Înlocuiește funcția existentă

Redenumește `netopia-initiate.mjs` în `netopia-initiate-old.mjs` și redenumește `netopia-v2-api.js` în `netopia-initiate.mjs`.

### Opțiunea 2: Testează în paralel

Modifică frontend-ul să testeze ambele endpoint-uri:

```typescript
// În src/services/netopiaPayments.ts
async initiatePayment(paymentData: NetopiaPaymentData): Promise<string> {
  // Încearcă mai întâi API v2.x
  try {
    const v2Response = await fetch(this.getNetlifyEndpoint("netopia-v2-api"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    if (v2Response.ok) {
      const v2Data = await v2Response.json();
      console.log("✅ Using NETOPIA API v2.x:", v2Data);
      return v2Data.paymentUrl;
    }

    console.log("❌ API v2.x failed, falling back to v1.x");
  } catch (error) {
    console.log("❌ API v2.x error:", error.message);
  }

  // Fallback la implementarea actuală
  // ... existing code
}
```

## Request/Response Format

### Request Format (JSON):

```json
{
  "orderId": "LUPUL-2025-001",
  "amount": 25.0,
  "currency": "RON",
  "description": "Comandă embleme digitale",
  "customerInfo": {
    "firstName": "Ion",
    "lastName": "Popescu",
    "email": "ion@example.com",
    "phone": "+40712345678",
    "address": "Strada Exemplu 123",
    "city": "Bucuresti",
    "county": "Bucuresti",
    "postalCode": "010000"
  },
  "live": false
}
```

### Response Format (JSON):

```json
{
  "success": true,
  "paymentUrl": "https://secure.sandbox.netopia-payments.com/payment/...",
  "orderId": "LUPUL-2025-001",
  "ntpID": "NTP123456789",
  "status": "15",
  "environment": "sandbox",
  "apiVersion": "v2.x",
  "message": "Payment initiated successfully using NETOPIA API v2.x"
}
```

## Error Handling

### Common Errors:

1. **401 Unauthorized**: API KEY invalid sau lipsă
2. **400 Bad Request**: Date incomplete sau format invalid
3. **500 Internal Server Error**: Problemă server NETOPIA

### Error Response Format:

```json
{
  "error": "Payment initiation failed",
  "message": "NETOPIA API Error 401: Unauthorized",
  "orderId": "LUPUL-2025-001",
  "timestamp": "2025-07-29T12:00:00.000Z"
}
```

## Debugging

### Verifică logs în timp real:

```bash
# În terminal
netlify functions:serve --port 8888

# În alt terminal
tail -f .netlify/functions-serve/netopia-v2-api/netopia-v2-api.log
```

### Enable verbose logging:

Adaugă în environment variables:

```bash
DEBUG=netopia:*
NETOPIA_DEBUG=true
```

## Next Steps

1. **Obține API KEY-urile de la NETOPIA**:

   - Contactează-i conform instrucțiunilor din email
   - Solicită atât Sandbox cât și Live API keys

2. **Testează în Sandbox**:

   - Configurează `NETOPIA_SANDBOX_API_KEY`
   - Testează flow-ul complet de plată

3. **Deploy în producție**:

   - Configurează `NETOPIA_LIVE_API_KEY`
   - Testează cu sume mici pe Live

4. **Monitor și optimizează**:
   - Monitorizează logs pentru erori
   - Optimizează error handling
   - Documentează edge cases

## Support

Pentru probleme tehnice:

- **NETOPIA Support**: support@netopia-payments.com
- **Telefon**: 021-304-7799
- **Documentație**: https://doc.netopia-payments.com

---

**⚠️ Important**: Păstrează API KEY-urile securizate și nu le committa în cod!
