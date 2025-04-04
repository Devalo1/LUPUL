# Lupul și Corbul - TypeScript Application

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