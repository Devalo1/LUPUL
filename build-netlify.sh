#!/bin/bash

echo "🚀 Starting Netlify Production Build..."

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running TypeScript type checking..."
npm run typecheck

# Build the project
echo "🏗️ Building for production..."
npm run build

echo "✅ Production build completed!"
