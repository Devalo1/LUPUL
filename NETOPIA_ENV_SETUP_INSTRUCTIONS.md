# NETOPIA Live Environment Variables Setup

## Problem

Avem 4 variabile setate corect în Netlify:

- NETOPIA_LIVE_SIGNATURE = live.2ZOW-PJ5X-HYYC-IENE-APZO
- VITE_NETOPIA_SIGNATURE_LIVE = live.2ZOW-PJ5X-HYYC-IENE-APZO
- NETOPIA_LIVE_PEM_FILE = 17909
- MODE = production

## Missing Variables (need manual setup in Netlify UI)

### NETOPIA_LIVE_PRIVATE_KEY

Conține conținutul fișierului: `D:\LUPUL\live.2ZOW-PJ5X-HYYC-IENE-APZOprivate.key`

### NETOPIA_LIVE_CERTIFICATE

Conține conținutul fișierului: `D:\LUPUL\live.2ZOW-PJ5X-HYYC-IENE-APZO.public.cer`

## Manual Setup Steps

1. Mergi pe https://app.netlify.com/
2. Selectează site-ul tău
3. Mergi la Site settings > Environment variables
4. Adaugă NETOPIA_LIVE_PRIVATE_KEY - copiază conținutul complet din fișierul .key
5. Adaugă NETOPIA_LIVE_CERTIFICATE - copiază conținutul complet din fișierul .cer

## Test După Setup

Odată setate, testează o plată NETOPIA - ar trebui să apară formularul 3DS în loc de SVG popup.
