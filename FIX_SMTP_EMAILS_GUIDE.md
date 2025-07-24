# 📧 CONFIGURARE SMTP PENTRU EMAILURI RAMBURS

## PROBLEMA ACTUALĂ

Nu primești emailuri pentru comenzile cu plata ramburs pentru că variabilele SMTP nu sunt configurate în Netlify.

## SOLUȚIA PASUL CU PASUL

### 1. Accesează Netlify Dashboard

- Mergi la: https://app.netlify.com/
- Conectează-te cu contul tău
- Găsește site-ul "lupul-si-corbul" sau "lupulsicorbul"
- Click pe numele site-ului

### 2. Navighează la Environment Variables

- În pagina site-ului, click pe "Site settings" (buton alb în dreapta sus)
- În meniul din stânga, click pe "Environment variables"
- Click pe butonul "Add variable"

### 3. Adaugă prima variabilă SMTP

**Key:** `SMTP_USER`  
**Value:** `lupulsicorbul@gmail.com`  
**Scopes:** Lasă implicit (All)  
Click "Create variable"

### 4. Adaugă a doua variabilă SMTP

**Key:** `SMTP_PASS`  
**Value:** `lraf ziyj xyii ssas`  
**Scopes:** Lasă implicit (All)  
Click "Create variable"

### 5. Trigger Deploy

- Mergi la "Deploys" tab
- Click pe "Trigger deploy" → "Deploy site"
- Așteaptă ca deploy-ul să se termine (2-3 minute)

## VERIFICARE QUE FUNCȚIONEAZĂ

### Test rapid:

1. Mergi pe site-ul tău: https://lupul-si-corbul.netlify.app
2. Fă o comandă cu **plata ramburs**
3. Completează formularul cu email-ul tău
4. Trimite comanda
5. **Verifică inbox-ul** - ar trebui să primești emailul în 1-2 minute

### Dacă nu primești emailul:

1. Verifică SPAM/Junk folder
2. Verifică că variabilele sunt setate corect în Netlify
3. Încearcă să faci trigger la un nou deploy

## CE SE VA SCHIMBA

**Înainte (actual):**

- Comenzile cu ramburs → nu primești email
- În console apare: "🔧 MOD DEZVOLTARE: Simulăm trimiterea emailurilor"

**După configurare:**

- Comenzile cu ramburs → vei primi email la lupulsicorbul@gmail.com
- Clientul va primi email de confirmare
- În console: "✅ Email trimis cu succes"

## VERIFICĂRI SUPLIMENTARE

Dacă vrei să verifici că variabilele sunt setate:

1. În Netlify → Site Settings → Environment variables
2. Ar trebui să vezi:
   - `SMTP_USER` = `lupulsicorbul@gmail.com`
   - `SMTP_PASS` = `lraf ziyj xyii ssas` (ascunsă din motive de securitate)

---

**Status**: ⚠️ URGENT - Lipsesc variabilele SMTP în producție
