# Deployment Guide for Netlify

## 🚀 Quick Deployment Steps

### Step 1: GitHub Repository
✅ **COMPLETED**: Code is already pushed to GitHub at https://github.com/Devalo1/LUPUL

### Step 2: Netlify Account Setup
1. Go to https://netlify.com and create an account or log in
2. Click **"New site from Git"**
3. Choose **GitHub** as your Git provider
4. Select the repository: **Devalo1/LUPUL**
5. Choose the branch: **main**

### Step 3: Build Settings
Configure the following build settings:

- **Base directory**: _(leave empty)_
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions` _(optional)_

### Step 4: Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, add:

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY=AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4
VITE_FIREBASE_AUTH_DOMAIN=lupulcorbul.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lupulcorbul
VITE_FIREBASE_STORAGE_BUCKET=lupulcorbul.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=312943074536
VITE_FIREBASE_APP_ID=1:312943074536:web:13fc0660014bc58c5c7d5d
VITE_FIREBASE_MEASUREMENT_ID=G-38YSZKVXDC
```

#### AI Configuration
```
VITE_OPENAI_API_KEY=YOUR_ACTUAL_OPENAI_API_KEY_HERE
OPENAI_API_KEY=YOUR_ACTUAL_OPENAI_API_KEY_HERE
```

#### App Configuration
```
VITE_APP_ENV=production
VITE_USE_EMULATORS=false
VITE_AUTH_DOMAIN=your-netlify-site-url.netlify.app
```

### Step 5: Advanced Settings (Optional)

#### Custom Domain
- Go to **Domain Settings** in Netlify
- Add your custom domain if you have one

#### Build & Deploy Settings
- **Node version**: 18.x (set in environment variables as `NODE_VERSION=18`)
- **Build timeout**: 15 minutes (default is usually fine)

### Step 6: Deploy!
1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be available at `https://random-name.netlify.app`

## 🔧 Build Configuration Files

The following files are already configured for optimal Netlify deployment:

- **`netlify.toml`**: Build and redirect settings
- **`package.json`**: Build scripts and dependencies
- **`vite.config.ts`**: Optimized for production builds
- **`.gitignore`**: Excludes sensitive files

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**: Check environment variables are set correctly
2. **OpenAI API not working**: Ensure `VITE_OPENAI_API_KEY` is set in Netlify env vars
3. **Firebase connection issues**: Verify all Firebase env vars are correct
4. **Routing issues**: SPA redirects are configured in `netlify.toml`

### Build Logs
- Check build logs in Netlify dashboard if deployment fails
- Look for missing environment variables or build errors

## 📊 Performance Features

The build includes:
- ✅ Bundle splitting and tree shaking
- ✅ Gzip and Brotli compression
- ✅ CSS and JS minification
- ✅ Static asset optimization
- ✅ Service worker for caching

## 🔒 Security

- ✅ OpenAI API key is stored as environment variable (not in code)
- ✅ Firebase configuration is secure (public keys are safe to expose)
- ✅ Environment-specific configurations
- ✅ HTTPS enforced by Netlify

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] Test the AI Assistant Widget functionality
- [ ] Verify user authentication works
- [ ] Test conversation history and creation
- [ ] Check responsive design on mobile
- [ ] Verify all routes work (SPA routing)
- [ ] Test Firebase Firestore connections
- [ ] Confirm environment variables are loaded

## 🚀 You're Ready!

Once deployed, your AI Assistant app will be live with:
- Messenger-style floating widget
- Real conversation management
- Romanian AI responses
- Secure user authentication
- Production-optimized performance

**Repository**: https://github.com/Devalo1/LUPUL
**Live Demo**: Your Netlify URL will be here after deployment!
