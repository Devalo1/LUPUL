# Setup pentru cheia publică Netopia

Acest ghid explică cum să extragi cheia publică din certificatul Netopia și cum să o configurezi ca variabilă de mediu pentru frontend.

## 1. Salvarea certificatului PEM

Creează un fișier local pentru certificatul Netopia:

1. Deschide un editor de text și lipește conținutul certificatului astfel:
   ```pem
   -----BEGIN CERTIFICATE-----
   ...conținutul certificatului Netopia...
   -----END CERTIFICATE-----
   ```
2. Salvează fișierul sub numele `netopia_cert.crt` în rădăcina proiectului (sau într-un folder `certs/`).

## 2. Extrage cheia publică folosind OpenSSL

Pentru a obține cheia publică în format PEM, rulează următoarea comandă în terminal:

```powershell
# Extrage cheia publică din certificat
openssl x509 -pubkey -noout -in netopia_cert.crt > netopia_public_key.pem
```

- `netopia_cert.crt` este fișierul cu certificatul original.
- `netopia_public_key.pem` va conține cheia publică cu headerele:
  ```pem
  -----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...
  -----END PUBLIC KEY-----
  ```

## 3. Configurare variabilă de mediu în Netlify

Adaugă în Netlify Dashboard → Site Settings → Environment Variables (doar în contextul **Production**) următoarele variabile:

- `VITE_NETOPIA_SIGNATURE_LIVE`: `2ZOW-PJ5X-HYYC-IENE-APZO`
- `VITE_NETOPIA_PUBLIC_KEY`:

```
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8IdPzYRKWRbir4IWfTe+Ql22t
OTFjQoeNtpHHxSm6j+WFYglAYNzHOWWHdXtF4vVItUCNmf4773Iaw2RkMI2qwKa9
0vW6MBxJGR/NWaJTqDxwWW2KQNvASMh2EXGk14y7YgRr46cLs5Y5l3gaFS4pyGhN
CFKTHp/TC1htnxjHXQIDAQAB
-----END PUBLIC KEY-----
```

## 4. Redeploy și verificare

1. După setarea variabilelor, declanșează un nou deploy din Netlify.
2. În browser, deschide consola și verifică:
   ```javascript
   console.log({
     liveSignature: import.meta.env.VITE_NETOPIA_SIGNATURE_LIVE,
     publicKey:
       import.meta.env.VITE_NETOPIA_PUBLIC_KEY?.substring(0, 30) + "...",
   });
   ```
3. Urmează fluxul de checkout în producție și confirmă că pop-up-ul 3DS Netopia se deschide corect.

---

_Document creat: 27 iulie 2025_
