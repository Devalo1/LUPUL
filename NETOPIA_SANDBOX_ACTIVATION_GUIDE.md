# 🧪 Ghid de Activare NETOPIA Sandbox

## Situația Actuală (28 Iulie 2025)

**Răspuns oficial NETOPIA:**

> "Este necesar sa activati mediul de test. Dupa ce vom testa implementarea si ne vom asigura ca totul este in regula, vom aproba contul de comerciant si veti putea trece in mediul de productie."

## Status API-uri NETOPIA

### ✅ Confirmat prin testare:

- **Production API v3** (`/payment/card/start`) - ❌ **404 Not Found** (nu este încă live)
- **Sandbox API v3** (`/payment/card/start`) - ✅ **Disponibil pentru testare**
- **Production API v2** (`/payment/card`) - ✅ **Funcțional** (endpoint standard)

## 📋 Pași pentru Activare Sandbox

### 1. **Activare Mediu de Test**

1. Logați-vă în [contul NETOPIA](https://admin.netopia-payments.com/)
2. Navigați la secțiunea **"Mediu de Test"** sau **"Sandbox"**
3. Activați mediul de test conform instrucțiunilor
4. Solicitați credențialele sandbox dacă nu sunt disponibile

### 2. **Obținerea Credențialelor Sandbox**

Aveți nevoie de:

- **POS Signature Sandbox** - pentru autentificare API v3
- **Public Key Sandbox** - pentru validări (opțional)

### 3. **Configurare Variabile de Mediu**

#### Pentru Netlify:

```bash
# Adăugați în Netlify Dashboard > Site Settings > Environment Variables
NETOPIA_SANDBOX_SIGNATURE=your_sandbox_signature_here
NETOPIA_SANDBOX_PUBLIC_KEY=your_sandbox_public_key_here
```

#### Pentru dezvoltare locală (.env):

```bash
NETOPIA_SANDBOX_SIGNATURE=your_sandbox_signature_here
NETOPIA_SANDBOX_PUBLIC_KEY=your_sandbox_public_key_here
```

### 4. **Testare Implementare**

#### Test automat:

```bash
node activate-netopia-sandbox.js
```

#### Test manual prin browser:

1. Accesați aplicația în modul development
2. Încercați o plată cu suma mică (ex: 10 RON)
3. Verificați că se deschide interfața NETOPIA sandbox

## 🔧 Implementarea Actuală

### Endpoint-uri Configurate:

- **Sandbox:** `https://secure.sandbox.netopia-payments.com/payment/card/start` (API v3)
- **Production:** `https://secure.netopia-payments.com/payment/card` (API v2 standard)

### Metode de Autentificare:

- **Sandbox:** `Authorization: Bearer {signature}` (API v3)
- **Production:** Signature inclusă în payload (API v2)

## 📧 Comunicare cu NETOPIA

### După testarea cu succes în sandbox:

**To:** implementare@netopia.ro  
**Subject:** Aprobare Cont Comerciant - API v3 Ready - HIFITBOX SRL  
**Content:**

```
Bună ziua,

Am finalizat implementarea conform documentației API v3 și am testat cu succes în mediul sandbox.

Detalii comerciant:
- Numele companiei: HIFITBOX SRL
- CUI: RO41039008
- Contact: Dumitru Popa
- Telefon: 0775346243
- Email: dani@lupulsicorbul.com
- Website: https://lupulsicorbul.com

Testarea în sandbox a fost finalizată cu succes. Vă rugăm să aprobați contul de comerciant pentru a putea trece în mediul de producție cu API v3.

Mulțumesc,
Dumitru Popa
HIFITBOX SRL
```

## 🚨 Notă Importantă

**Nu încercați să folosiți endpoint-ul `/payment/card/start` în producție** până când nu primiți confirmarea oficială de la NETOPIA că contul a fost aprobat pentru API v3.

Aplicația va folosi automat:

- **API v2 standard** în producție (funcțional acum)
- **API v3** în sandbox pentru testare
- **API v3** în producție după aprobare

## 📞 Contact NETOPIA

- **Email:** implementare@netopia.ro
- **Telefon:** [numărul din documentație]
- **Website:** https://netopia-payments.com

## ✅ Checklist Final

- [ ] Mediul sandbox activat în contul NETOPIA
- [ ] Credențiale sandbox obținute
- [ ] Variabile de mediu configurate
- [ ] Test sandbox reușit
- [ ] Email trimis către NETOPIA pentru aprobare
- [ ] Așteptare aprobare pentru producție

---

**Data ultimei actualizări:** 28 Iulie 2025  
**Status:** Implementare completă, așteptând aprobare sandbox și producție
