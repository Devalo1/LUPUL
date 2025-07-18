# 💰 GHID COMPLET: Cum să primești banii prin Netopia Payments

## 🏦 1. CONFIGURAREA CONTULUI DE ÎNCASARE

### A. Accesarea Dashboard-ului Netopia

1. **Conectează-te la:** https://dashboard.netopia-payments.com
2. **Folosește credențialele** primite de la Netopia când ai semnat contractul
3. **Mergi la secțiunea "Settlement" sau "Reconciliere"**

### B. Adăugarea contului bancar (IBAN)

```
Dashboard → Settings → Banking Details → Add Bank Account
```

- **IBAN complet** (RO.....)
- **Numele băncii**
- **SWIFT/BIC cod** (dacă este cerut)
- **Numele titularului** (trebuie să coincidă cu HIFITBOX SRL)

### C. Verificarea identității (KYC)

- **Certificat de înregistrare** al firmei
- **CUI/CIF** (RO41039008)
- **Extras de cont bancar** (pentru verificarea IBAN-ului)
- **CI/Pașaport** al reprezentantului legal

## 💳 2. PROCESUL DE ÎNCASARE

### A. Când primești banii

- **Zilnic:** Settlement automat (de obicei)
- **Suma minimă:** 100 RON (conform configurației tale)
- **Perioada:** 3 zile lucrătoare (T+3)

### B. Cum funcționează

```
Ziua 1: Client plătește → Netopia colectează
Ziua 2: Verificare și procesare
Ziua 3: Transfer către IBAN-ul tău
```

### C. Comisioanele Netopia

- **2.5% - 3.5%** din valoarea tranzacției
- **+ taxe fixe** (de obicei 0.5-1 RON per tranzacție)
- **Comisioanele se deduc automat** din suma transferată

## 📊 3. MONITORIZAREA ÎNCASĂRILOR

### A. Rapoarte disponibile

- **Tranzacții in timp real**
- **Settlement reports** (zilnice/săptămânale)
- **Monthly statements**
- **Chargeback reports**

### B. Notificări automate

- **Email** la fiecare settlement
- **SMS** pentru sume mari
- **Webhook notifications** (IPN)

## 🔧 4. CONFIGURAREA TEHNICĂ ÎN APLICAȚIA TA

⚠️ **IMPORTANT: DOAR PENTRU ADMINISTRATOR!**

- **Dashboard-ul de încasări** este vizibil doar pentru admin
- **Clienții NU văd** aceste informații
- **Acces restricționat** prin autentificare admin

### A. Dashboard Admin pentru Settlement

Să configurez aplicația ta să monitorizeze încasările:

```typescript
// DOAR PENTRU ADMIN - pages/admin/FinancialDashboard.tsx
- Rapoarte de încasări zilnice/lunare
- Monitorizarea settlement-urilor Netopia
- Analiză profit/comisioane
- Export date financiare
```

### B. Securitate maximă

- **Acces doar cu rol ADMIN** ✅
- **Date sensibile protejate** ✅
- **Clienții nu văd nimic** ✅
- **Logs pentru auditare** ✅

## 💼 5. PROCESUL PRACTIC PENTRU TINE

### A. Pașii pentru a primi banii:

1. **Completează configurarea în Netopia Dashboard**

   - Adaugi IBAN-ul firmei HIFITBOX SRL
   - Verifici documentele KYC
   - Activezi settlement-ul automat

2. **Clienții plătesc pe site-ul tău**

   - Introduc datele cardului în formularul nostru
   - Netopia procesează plata securizat
   - Tu primești notificare de plată confirmată

3. **Primești banii automat**
   - **T+3 zile** (3 zile lucrătoare)
   - **Direct în IBAN-ul tău**
   - **Minus comisioanele Netopia** (2.5-3.5%)

### B. Exemplu concret:

```
Luni: Client plătește 100 RON
Marți: Netopia verifică și procesează
Miercuri: Primești în cont ~96.5 RON (minus comisioane)
```

## 📞 6. CONTACT NETOPIA PENTRU CONFIGURARE

Dacă întâmpini probleme la configurare:

- **Email:** support@netopia-payments.com
- **Telefon:** +40 21 308 4242
- **Dashboard:** https://dashboard.netopia-payments.com

**Menționează:**

- Ești client existent HIFITBOX SRL
- CUI: RO41039008
- Vrei să configurezi settlement-ul automat

## 🔒 7. SECURITATE ȘI CONFIDENȚIALITATE

### ⚠️ FOARTE IMPORTANT:

- **Dashboard-ul financiar** este disponibil DOAR pentru tine ca administrator
- **Clienții nu văd** informațiile financiare
- **Datele sensibile** sunt protejate prin autentificare admin
- **Accesezi la:** http://localhost:8888/admin/financial (doar cu cont admin)

### Informații private (DOAR PENTRU TINE):

- **Profiturile** și **comisioanele** sunt vizibile doar în panoul admin
- **Rapoartele** pot fi exportate în format CSV
- **Datele** sunt stocate securizat în Firebase cu acces restricționat

## ✅ REZULTAT FINAL:

1. **Tu configurezi IBAN-ul în Netopia** ✅
2. **Clienții plătesc pe site** ✅
3. **Primești banii automat în cont** (T+3 zile) ✅
4. **Monitorizezi încasările în dashboard admin** ✅
5. **Exporti rapoarte financiare** ✅

**💰 Banii ajung direct în contul firmei HIFITBOX SRL, minus comisioanele Netopia!**
