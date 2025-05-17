# Deployment Guide

This document outlines the deployment process for the application to different environments.

## Environments

The application supports three deployment environments:

1. **Development** - For local development and testing
2. **Staging** - For pre-production testing
3. **Production** - Live environment for end users

## Deployment Process

### Local Development

For local development, run:

```bash
npm run dev
```

To test with Firebase emulators:

```bash
npm run dev:all
```

### GitHub Repository

The code is hosted on GitHub at https://github.com/Devalo1/LUPUL

#### Working with Branches

1. Always create feature branches for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. After making changes, commit and push to your branch:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

3. Create a pull request on GitHub to merge your changes into the master branch

### Netlify Deployment

The front-end application is deployed to Netlify.

### Automatic Deployment

Netlify is configured to automatically deploy when changes are pushed to the master branch.

### Manual Deployment

To manually deploy the application to Netlify:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy using the Netlify CLI:
   ```bash
   # Install Netlify CLI if not already installed
   npm install -g netlify-cli
   
   # Login to your Netlify account
   netlify login
   
   # Deploy a preview
   netlify deploy
   
   # Deploy to production
   netlify deploy --prod
   ```

### Environment Variables in Netlify

Configure the following environment variables in Netlify:

1. Go to Netlify site dashboard
2. Navigate to Site settings > Build & deploy > Environment
3. Add the following variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (the entire JSON service account key as a string)

## Environment Variables

Different environment variables are used for each deployment environment:

- Development: `.env.local`
- Staging: `.env.staging`
- Production: `.env.production`

### Required Environment Variables

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Troubleshooting Deployment

### Common Issues

1. **Build fails due to TypeScript errors**
   - Run `tsc --noEmit` locally to check for TypeScript errors
   - Fix any identified errors before deploying

2. **Firebase authentication doesn't work after deployment**
   - Verify that the Firebase project has the correct domain in the authorized domains list
   - Check that environment variables are correctly set in Netlify

3. **Missing Firebase service account key**
   - Ensure you've set up the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable in Netlify
   - See [Firebase Credentials Setup](./firebase-credentials.md) for more details

### Rollback Process

If a deployment causes issues:

1. In the Netlify dashboard, go to Deploys
2. Find a previous working deployment
3. Click the three-dot menu next to it
4. Select "Publish deploy"
VITE_API_URL=
```

## Build Optimization

The production build includes several optimizations:

- Code splitting
- Tree shaking
- Asset compression
- CSS minification
- Bundle analysis

To analyze the production build:

```bash
npm run analyze
```

## Firebase Deployment

### Deployment Components

When deploying to Firebase, the following components are deployed:

- Firestore security rules
- Storage security rules
- Firebase Functions
- Hosting configuration

### Selective Deployment

To deploy only specific Firebase components:

```bash
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only functions
firebase deploy --only hosting
```

## Post-Deployment Verification

After deployment, verify the following:

1. Application loads without errors
2. Authentication flows work correctly
3. API connections are functioning
4. Critical user journeys are operational
5. Performance is acceptable

## Rollback Procedure

If a deployment causes issues, roll back using:

### Netlify Rollback

```bash
netlify sites:rollback
```

### Firebase Rollback

```bash
firebase hosting:clone PROJECT_ID:PREVIOUS_DEPLOYMENT_ID PROJECT_ID:live
```

## Monitoring

Monitor the deployment using:

1. Firebase Console
2. Netlify Dashboard
3. Application logs
4. Error tracking services
5. Performance monitoring tools
