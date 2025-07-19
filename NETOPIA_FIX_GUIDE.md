# � PLĂȚILE NU FUNCȚIONEAZĂ - REPARĂ RAPID!

## CE ESTE PROBLEMA?

Pe site-ul tău, când cineva încearcă să plătească cu cardul, în loc să meargă la plată reală, apare **"🧪 SIMULARE TEST"**. Asta înseamnă că nu poți încasa bani reali!

## CE TREBUIE SĂ FACI? (3 pași simpli)

### 📋 PASUL 1: Găsește datele de la Netopia

Ai nevoie de 2 lucruri de la Netopia (cei de la plăți):

- **SIGNATURE LIVE** (arată cam așa: `XXXX-XXXX-XXXX-XXXX-XXXX`)
- **PUBLIC KEY LIVE** (un text lung care începe cu `-----BEGIN PUBLIC KEY-----`)

**Unde le găsești:**

- În contractul cu Netopia (documentul semnat)
- În email-ul primit de la Netopia când ți-au activat contul
- Sună la Netopia: **021-304-7799** și cere-le să ți le dea

### 🔧 PASUL 2: Pune datele în Netlify

1. **Deschide**: https://app.netlify.com/
2. **Găsește site-ul tău** (lupul-si-corbul)
3. **Click pe el**

### 🔧 PASUL 2: Pune datele în Netlify

1. **Deschide**: https://app.netlify.com/
2. **Găsește site-ul tău** (lupul-si-corbul)
3. **Click pe el**
4. **Click pe "Site settings"** (buton alb în dreapta sus)
5. **Click pe "Environment variables"** (în meniul din stânga)
6. **Click pe "Add variable"** și adaugă exact următoarele:

**Prima variabilă:**

- La **Key** scrie: `VITE_PAYMENT_LIVE_KEY`
- La **Value** pune: `[SIGNATURE-UL TĂU LIVE DE LA NETOPIA]`
- Click **Save**

**A doua variabilă:**

- La **Key** scrie: `NETOPIA_LIVE_SIGNATURE`
- La **Value** pune: `[SIGNATURE-UL TĂU LIVE DE LA NETOPIA]`
- Click **Save**

**A treia variabilă:**

- La **Key** scrie: `NETOPIA_LIVE_PUBLIC_KEY`
- La **Value** pune: certificatul complet (vezi mai jos)
- Click **Save**

### 🚀 PASUL 3: Repornește site-ul

1. **Click pe "Deploys"** (în meniul de sus)
2. **Click pe "Trigger deploy"** apoi **"Deploy site"**
3. **Așteaptă 2-3 minute** să se termine

## ✅ GATA! Acum testează:

- Mergi pe site-ul tău
- Încearcă să faci o comandă cu cardul
- **NU** ar mai trebui să apară "🧪 SIMULARE TEST"
- Ar trebui să te ducă la Netopia real pentru plată

## 🆘 DACĂ NU ȘTII DATELE DE LA NETOPIA:

**Sună acum la Netopia: 021-304-7799**
Spune-le: "Am nevoie de SIGNATURE LIVE și PUBLIC KEY LIVE pentru site-ul meu"

## 📞 CONTACT NETOPIA

- **Telefon**: 021-304-7799
- **Email**: support@netopia-payments.com

---

## 🔑 CERTIFICATUL COMPLET pentru NETOPIA_LIVE_PUBLIC_KEY

Pentru a treia variabilă (`NETOPIA_LIVE_PUBLIC_KEY`), copiază EXACT textul de mai jos:

```
-----BEGIN CERTIFICATE-----
MIIC3zCCAkigAwIBAgIBATANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCUk8x
EjAQBgNVBAgTCUJ1Y2hhcmVzdDESMBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQK
EwdORVRPUElBMSEwHwYDVQQLExhORVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAa
BgNVBAMTE25ldG9waWEtcGF5bWVudHMucm8wHhcNMjUwNzEzMTI0ODM0WhcNMzUw
NzExMTI0ODM0WjCBiDELMAkGA1UEBhMCUk8xEjAQBgNVBAgTCUJ1Y2hhcmVzdDES
MBAGA1UEBxMJQnVjaGFyZXN0MRAwDgYDVQQKEwdORVRPUElBMSEwHwYDVQQLExhO
RVRPUElBIERldmVsb3BtZW50IHRlYW0xHDAaBgNVBAMTE25ldG9waWEtcGF5bWVu
dHMucm8wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBALwh0/NhEpZFuKvghZ9N
75CXba05MWNCh422kcfFKbqP5YViCUBg3Mc5ZYd1e0Xi9Ui1QI2Z/jvvchrDZGQw
jarApr3S9bowHEkZH81ZolOoPHBZbYpA28BIyHYRcaTXjLtiBGvjpwuzljmXeBoV
LinIaE0IUpMen9MLWG2fGMddAgMBAAGjVzBVMA4GA1UdDwEB/wQEAwIFoDATBgNV
HSUEDDAKBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9yXCh
MGxzUzQflmkXT1oyIBoetTANBgkqhkiG9w0BAQsFAAOBgQAMnh95YlI+y3XcxrpG
gNWC9AwVBt61MTid213yuXDGxkouizSGFr1MjP1tk/YkcWdNka9QB3AtCr4bMers
/2f322soXcrhAOhj5JPVQkF6rlhJxg2JBO+8M5sOJTaxq5YvFHl/o2GGg0UuxWb5
RbUx6W/CU+uFDgDY8CdZ3hZ7kg==
-----END CERTIFICATE-----
```

**IMPORTANT**: Copiază ÎNTREGUL text, inclusiv liniile `-----BEGIN CERTIFICATE-----` și `-----END CERTIFICATE-----`

---

**IMPORTANT**: Până nu faci asta, nu poți încasa bani reali pe site!
