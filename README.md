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
- Firebase (Authentication, Firestore, Storage, Functions)
- Framer Motion for animations
- React Router Dom v7
- Vite for build and development
- ESLint + Prettier for code quality

## Getting Started

### Prerequisites

- Node.js (v18+)
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
4. For admin and server-side functions, follow the instructions in [Firebase Credentials Setup](./docs/firebase-credentials.md)

### Development

Run the development server:

```bash
npm run dev
```

To run with Firebase emulators:

```bash
npm run dev:all
```

## Deployment

### GitHub

The project is hosted on GitHub at https://github.com/Devalo1/LUPUL

To deploy to GitHub:

1. Clone the repository
2. Make your changes
3. Commit and push to your branch
4. Create a pull request to merge with the main branch

### Netlify

This project is set up for automatic deployment on Netlify. When you push to the main branch, Netlify will automatically build and deploy the site.

Manual deployment steps:

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy to Netlify:
   ```bash
   npx netlify deploy
   ```

For detailed deployment instructions, see [Deployment Guide](./docs/deployment.md)

### Development

Start the development server:
```
npm run dev
```

For optimized development experience:
```
npm run dev:fast
```

To preview production build:
```
npm run preview
```

### Firebase Emulators

To run the application with Firebase emulators:

1. **Start Firebase emulators in one terminal:**
```bash
npm run emulators
```

2. **Start the application in another terminal:**
```bash
npm run dev
```

3. **Or run both simultaneously:**
```bash
npm run dev:all
```

4. **For optimized emulator performance:**
```bash
npm run emulators:optimized
```

### Troubleshooting Emulator Issues

If you encounter connection errors like `ERR_CONNECTION_REFUSED` when accessing port 8080 (Firestore) or other emulator ports:

1. Check if emulators are running:
```bash
npm run check-emulators
```

2. Ensure ports are not blocked by firewall or other applications.

3. For persistent issues, try resetting emulators:
```bash
firebase emulators:stop
firebase emulators:start
```

### Emulator Ports

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
- `npm run dev:fast` - Start development server with optimizations disabled
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run emulators` - Start Firebase emulators
- `npm run dev:all` - Start both dev server and emulators
- `npm run security-fix` - Apply security fixes
- `npm run check-deps` - Check dependencies
- `npm run clean` - Clean node_modules and dist folders

## Project Structure

```
├── public/             # Static assets and HTML entry
├── src/                # Source code
│   ├── assets/         # Images, fonts, and other static assets
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── firebase/       # Firebase configuration
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Layout components
│   ├── models/         # Data models and interfaces
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── services/       # API services
│   ├── store/          # State management
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── scripts/            # Build and development scripts
├── types/              # Global type definitions
└── functions/          # Firebase Cloud Functions
```

## License

This project is private and confidential.