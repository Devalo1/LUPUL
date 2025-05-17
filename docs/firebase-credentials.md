# Firebase Credentials Setup

This document explains how to set up the Firebase credentials for this project.

## Service Account Key

For server-side operations (like Cloud Functions and admin operations), you need a service account key from Firebase.

### Steps to obtain a service account key:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project
2. Navigate to Project Settings > Service Accounts
3. Click "Generate New Private Key"
4. Save the downloaded file as `serviceAccountKey.json` in the root directory of the project

**Important:** Never commit this file to Git! It contains sensitive credentials that should remain private.

### Local Development

When developing locally, the service account key is used by:
- Firebase emulators
- Server-side authentication validation
- Cloud Storage operations
- Administrative Firestore operations

### Production Deployment

For production, you should set these credentials as environment variables in your hosting provider (Netlify):

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add the content of your serviceAccountKey.json as a JSON string to a variable named `FIREBASE_SERVICE_ACCOUNT_KEY`

## Firebase Client Configuration

The client-side Firebase configuration is stored in `src/firebase-core.ts` and is safe to commit to the repository as it contains only public API keys.

If you need to update the client configuration:

1. Go to the Firebase Console > Project Settings
2. In the "Your apps" section, copy the configuration object
3. Update the `firebaseConfig` object in `src/firebase-core.ts`
