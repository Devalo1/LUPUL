# Firebase Setup

This document outlines how to set up and configure Firebase for this project.

## Prerequisites

- Firebase account
- Firebase CLI installed (`npm install -g firebase-tools`)
- Admin access to the project's Firebase console

## Initial Setup

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable the required Firebase services:
   - Authentication
   - Firestore
   - Storage
   - Functions
   - Hosting (optional)

## Local Development Setup

### 1. Firebase Configuration

Create `.env.local` file in the root directory with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 2. Firebase Emulators

#### Installation

Make sure you have the Firebase CLI installed and you're logged in:

```bash
npm install -g firebase-tools
firebase login
```

#### Running Emulators

Run the emulators for local development:

```bash
npm run emulators
```

This will start the following emulators:
- Authentication: http://localhost:9099
- Firestore: http://localhost:8080
- Functions: http://localhost:5002
- Storage: http://localhost:9199
- Emulator UI: http://localhost:4000

### 3. Connect App to Emulators

The application is configured to automatically connect to emulators in development mode. This behavior is controlled by the `useEmulators` flag in `src/firebase/firebase-config.ts`.

## Authentication

### Available Authentication Methods

- Email/Password
- Google
- Facebook
- Phone (SMS)

### Custom Claims and User Roles

User roles are managed through Firebase custom claims. The available roles are:
- `admin`: Full access to all features
- `moderator`: Access to moderate content
- `user`: Standard user access

### Setting Up Custom Claims

Custom claims must be set using Firebase Admin SDK in the backend:

```javascript
const { auth } = require('firebase-admin');

async function setUserRole(uid, role) {
  await auth().setCustomUserClaims(uid, { role });
}
```

## Firestore

### Data Structure

The application uses the following Firestore collections:

- `users`: User profile information
- `products`: Product catalog
- `orders`: Customer orders
- `appointments`: Service appointments
- `settings`: Application settings

### Security Rules

Firestore security rules are defined in `firestore.rules`. Make sure to keep these rules up-to-date when adding new collections or changing data access patterns.

## Storage

Firebase Storage is used for user-generated content:

- Product images
- User profile pictures
- Document attachments

### Security Rules

Storage security rules are defined in `storage.rules`.

## Functions

Firebase Functions are used for:

- User account management
- Payment processing
- Email notifications
- Data processing and validation

### Deployment

Deploy the functions to Firebase:

```bash
firebase deploy --only functions
```

For selective deployment:

```bash
firebase deploy --only functions:functionName
```

## Environment Management

### Development

- Uses Firebase emulators
- Local `.env.local` configuration

### Staging

- Uses the Firebase staging project
- Environment variables are set in the CI/CD pipeline

### Production

- Uses the production Firebase project
- Environment variables are securely stored in the CI/CD system

## Common Issues and Troubleshooting

### Emulator Connection Issues

If you have trouble connecting to the emulators:

1. Check if the emulators are running (`npm run check-emulators`)
2. Verify that the ports are not being used by other services
3. Try resetting the emulators (`firebase emulators:stop` then restart)

### Authentication Problems

If authentication is not working:

1. Check your Firebase API keys
2. Verify that the authentication methods are enabled in Firebase Console
3. Ensure the redirect domains are whitelisted in Firebase Console
