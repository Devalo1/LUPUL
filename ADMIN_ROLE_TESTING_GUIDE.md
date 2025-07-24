# Ghid de Testare - Roluri Administratori

## Rezolvări Implementate

### 1. **Probleme Identificate și Rezolvate**

#### A. Inconsistența între UID și Email

- **Problema**: Funcțiile `makeUserAdmin`, `makeUserAccountant`, și `removeAccountantRole` primeau `userId` dar erau apelate cu `email`
- **Soluția**: Modificate toate funcțiile să primească `email` și să caute singure `userId` în baza de date

#### B. Erori de Permisiuni Firestore

- **Problema**: `FirebaseError: Missing or insufficient permissions` pentru colecția `roleChangeRequests`
- **Soluția**: Adăugate reguli Firestore pentru colecțiile `roleChangeRequests`, `admin_emails`, și `admins`

#### C. Actualizarea Context-ului de Autentificare

- **Problema**: Schimbările de rol nu se reflectau în navigație fără re-login
- **Soluția**:
  - Adăugată funcția `refreshAdminStatus()` în `AuthContext`
  - Implementat listener în timp real pentru actualizarea statutului admin
  - Actualizate `SideNavigation` și `Navbar` să monitorizeze context-ul

#### D. Erori de Import și Compilare

- **Problema**: `ReferenceError: require is not defined` din cod server-side în bundle client
- **Soluția**: Curățat fișierul `firebase.ts` și înlocuit cu API client Firebase

### 2. **Cum să Testezi**

#### Pasul 1: Pornirea Aplicației

```bash
npm run dev
```

Aplicația va rula la `http://localhost:8888`

#### Pasul 2: Autentifică-te ca Administrator

1. Mergi la `http://localhost:8888/login`
2. Autentifică-te cu contul admin principal: `dani_popa21@yahoo.ro`

#### Pasul 3: Accesează Panoul Admin

1. Din navigare (iconița ⚙️) sau din meniul lateral -> "Admin Panel"
2. Mergi la "Permisiuni admin" sau direct la `http://localhost:8888/admin/make-admin`

#### Pasul 4: Testează Acordarea Rolurilor

1. **Pentru a face un utilizator administrator**:

   - Introdu email-ul utilizatorului în câmpul "Email utilizator"
   - Selectează "Admin" din dropdown-ul "Tip acțiune"
   - Apasă "Execută acțiunea"
   - Verifică mesajul de succes

2. **Pentru a face un utilizator contabil**:

   - Introdu email-ul utilizatorului
   - Selectează "Contabil" din dropdown
   - Apasă "Execută acțiunea"

3. **Pentru a elimina rol de contabil**:
   - Introdu email-ul utilizatorului
   - Selectează "Elimină rol contabil" din dropdown
   - Apasă "Execută acțiunea"

#### Pasul 5: Verifică Funcționalitatea

1. **Verifică în baza de date**:

   - Documentul utilizatorului din colecția `users` să aibă:
     - `isAdmin: true` și `role: "admin"` pentru administratori
     - `isAccountant: true` și `role: "accountant"` pentru contabili

2. **Verifică în aplicație**:
   - Utilizatorul promovat să poată accesa `/admin`
   - Să apară navigarea admin în meniul lateral și navbar
   - Să se afișeze titlul "Administrator" în loc de "Utilizator"

#### Pasul 6: Testează Actualizarea în Timp Real

1. Folosește un al doilea browser/tab cu utilizatorul promovat
2. Acordă-i rol de admin din primul browser
3. Verifică că în al doilea browser:
   - Apare automat navigarea admin
   - Se schimbă titlul din "Utilizator" în "Administrator"
   - Nu e nevoie de re-login

### 3. **Funcții Implementate**

#### A. În `userRoles.ts`

- `makeUserAdmin(email: string)` - Face utilizatorul administrator
- `makeUserAccountant(email: string)` - Face utilizatorul contabil
- `removeAccountantRole(email: string)` - Elimină rolul de contabil
- `isUserAdmin(email: string)` - Verifică dacă utilizatorul este admin

#### B. În `AuthContextProvider.tsx`

- `refreshAdminStatus()` - Actualizează statusul admin în context
- Listener în timp real pentru documentul utilizatorului
- Actualizare automată a flag-ului `isAdmin`

#### C. În `MakeAdmin.tsx`

- Lookup UID prin email înainte de apelarea funcțiilor de rol
- Apel `refreshAdminStatus()` după schimbări de succes
- Logging detaliat pentru debugging

### 4. **Logs și Debugging**

#### Verifică consola pentru:

- `[UserRoles]: Making user [email] an admin`
- `[UserRoles]: User [email] has been successfully made an admin`
- `[AuthContext]: Admin status refreshed: true`

#### În caz de erori:

- Verifică regulile Firestore sunt deployate: `firebase deploy --only firestore:rules`
- Verifică că utilizatorul există în colecția `users`
- Verifică permisiunile Firebase

### 5. **Structura Bazei de Date**

#### Colecția `users`

```javascript
{
  uid: "user_id",
  email: "user@example.com",
  displayName: "User Name",
  isAdmin: true,        // Flag pentru admin
  role: "admin",        // Rol explicit
  isAccountant: false,  // Flag pentru contabil
  updatedAt: timestamp
}
```

#### Colecția `admins` (pentru compatibilitate)

```javascript
{
  email: "admin@example.com",
  role: "admin",
  userId: "user_id",
  displayName: "Admin Name",
  addedAt: timestamp
}
```

### 6. **Reguli Firestore Deployate**

- Utilizatorii pot citi propriile documente din `users`
- Doar adminii pot modifica rolurile
- Utilizatorii pot crea cereri în `roleChangeRequests`
- Adminii pot gestiona colecțiile `admins` și `admin_emails`

---

## Notă Importantă

După implementarea acestor modificări, **problema inițială** unde administratorii creați din admin panel nu aveau funcții depline și nu puteau crea articole **ar trebui să fie complet rezolvată**.

Utilizatorii promovați la admin vor avea:

- ✅ Acces complet la panoul admin
- ✅ Navigarea admin vizibilă în meniu
- ✅ Titlul "Administrator" în loc de "Utilizator"
- ✅ Possibilitatea de a crea articole și de a accesa toate funcțiile admin
- ✅ Actualizare automată fără re-login
