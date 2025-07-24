# ✅ CHECKLIST FIX COMPLET - PLĂȚI ȘI EMAILURI

## PROBLEMA TA ACUM:

- ❌ **Plata cu cardul**: Nu funcționează (afișează "🧪 SIMULARE TEST")
- ❌ **Emailuri ramburs**: Nu le primești (sunt doar simulate)

## CHECKLIST REMEDIERE URGENTĂ

### 🚨 PRIORITATE 1: FIX EMAILURI RAMBURS (5 minute)

- [ ] **Pasul 1**: Intru în Netlify Dashboard (https://app.netlify.com/)
- [ ] **Pasul 2**: Selectez site-ul "lupul-si-corbul"
- [ ] **Pasul 3**: Navighez la Site Settings → Environment Variables
- [ ] **Pasul 4**: Adaug `SMTP_USER` = `lupulsicorbul@gmail.com`
- [ ] **Pasul 5**: Adaug `SMTP_PASS` = `lraf ziyj xyii ssas`
- [ ] **Pasul 6**: Trigger deploy nou (Deploys → Trigger deploy)
- [ ] **Pasul 7**: Testez cu o comandă ramburs și verific inbox-ul

### 🔧 PRIORITATE 2: FIX TEMPORAR PLĂȚI CARD (10 minute)

- [ ] **Pasul 1**: În Netlify Environment Variables, adaug:
  - [ ] `NETOPIA_LIVE_SIGNATURE` = `2ZOW-PJ5X-HYYC-IENE-APZO`
  - [ ] `NETOPIA_LIVE_PUBLIC_KEY` = `sandbox_key`
  - [ ] `VITE_PAYMENT_LIVE_KEY` = `2ZOW-PJ5X-HYYC-IENE-APZO`
  - [ ] `VITE_NETOPIA_PUBLIC_KEY` = `sandbox_key`
- [ ] **Pasul 2**: Trigger deploy nou
- [ ] **Pasul 3**: Testez plata cu cardul (nu va mai apărea eroarea, dar va fi încă test)

### 💳 PRIORITATE 3: NETOPIA LIVE REAL (1-3 zile)

- [ ] **Pasul 1**: Sun la Netopia: **021-304-7799**
- [ ] **Pasul 2**: Solicit credențiale LIVE pentru producție
- [ ] **Pasul 3**: Menționez:
  - [ ] Firma: HIFITBOX SRL (CUI: RO41039008)
  - [ ] Website: https://lupul-si-corbul.netlify.app
  - [ ] Am deja integrarea implementată, vreau să trec la LIVE
- [ ] **Pasul 4**: Când primesc credentialele, le înlocuiesc în Netlify
- [ ] **Pasul 5**: Testez cu o plată mică (1-5 RON)

## VERIFICARE FINALĂ

### După fiecare step, verific:

**Pentru emailuri:**

- [ ] Fac o comandă cu plata ramburs
- [ ] Primesc emailul la lupulsicorbul@gmail.com în 1-2 minute
- [ ] Clientul primește email de confirmare

**Pentru plăți card:**

- [ ] Încerc plata cu cardul
- [ ] NU mai apare "🧪 SIMULARE TEST"
- [ ] Sunt redirecționat către Netopia (chiar dacă e sandbox)

## DEBUG RAPID

În browser console (F12) pe site, rulez:

```javascript
// Copiez conținutul din debug-production-config.js
```

## TIMPUL ESTIMAT

- ✅ **Fix emailuri**: 5-10 minute
- ⚠️ **Fix temporar card**: 10-15 minute
- 🎯 **Fix final card**: 1-3 zile (Netopia response time)

## CONTACT URGENT

Dacă întâmpini probleme:

- **Netopia**: 021-304-7799 sau support@netopia-payments.com
- **Gmail SMTP**: Verifică că parola de aplicație e corectă

---

## STATUS ACTUAL:

🔴 **URGENT** - Ambele sisteme nu funcționează în producție

## STATUS DUPĂ FIX:

🟢 **OPERAȚIONAL** - Emailuri funcționează, plăți măcar nu dau eroare
