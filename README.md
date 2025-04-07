# My TypeScript App

## Overview

This is a React-based e-commerce and service website for "Lupul și Corbul" (The Wolf and the Raven), offering therapy services and wellness products.

## Features

- Responsive design with modern UI
- Product catalog with search and filtering
- Shopping cart with localStorage persistence
- User authentication with Firebase
- Therapy services booking
- Role-based access control
- Order management

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Firebase (Authentication, Firestore, Storage)
- Framer Motion for animations
- React Router Dom v6
- Vite for build and development

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

### Development

Start the development server:
```
npm run dev
```

## Pornirea aplicației cu emulatori Firebase

Pentru a rula aplicația corect cu emulatorii Firebase, urmează acești pași:

1. **Pornește emulatorii Firebase într-un terminal:**
```bash
npm run emulators
```

2. **Pornește aplicația într-un alt terminal:**
```bash
npm run dev
```

3. **Sau pornește ambele simultan:**
```bash
npm run dev:all
```

## Depanare probleme cu emulatorii

Dacă întâmpini erori de conexiune precum `ERR_CONNECTION_REFUSED` când accesezi portul 8080 (Firestore) sau alte porturi ale emulatorilor:

1. Verifică dacă emulatorii rulează:
```bash
npm run check-emulators
```

2. Asigură-te că porturile nu sunt blocate de firewall sau alte aplicații.

3. Pentru probleme persistente, încearcă să resetezi emulatorii:
```bash
firebase emulators:stop
firebase emulators:start
```

## Porturile utilizate de emulatori

- **Firestore**: 8080
- **Auth**: 9099
- **Functions**: 5002
- **Storage**: 9199
- **Emulator UI**: 4000

## Configurare

Dacă dorești să folosești Firebase live în loc de emulatori, modifică flag-ul `useEmulators` din `src/services/firestore.ts` la `false`.

## Porturi utilizate

- **Aplicația React**: http://localhost:5173
- **Firebase UI**: http://localhost:4000
- **Firebase Functions**: http://localhost:5002
- **Firestore**: http://localhost:8080

## Depanare

Dacă apar probleme cu pornirea aplicației:

1. Verificați că porturile necesare sunt disponibile
2. Opriți orice instanțe anterior pornite ale emulatorilor Firebase
3. Ștergeți directoarele `.cache` și `node_modules` și reinstalați pachetele

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

- `/src` - Source code
  - `/assets` - Static assets like images and CSS
  - `/components` - Reusable components
  - `/context` - React Context providers
  - `/hooks` - Custom React hooks
  - `/pages` - Page components
  - `/services` - External service connections (Firebase)
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions

## License

This project is private and confidential.