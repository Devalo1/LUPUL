# Firebase Module Redirects

This directory contains special redirection files that ensure proper resolution of Firebase module imports. These files are required because of the path aliasing configuration in the project.

## Structure

- `app/index.ts` - Redirects to `@firebase/app` and provides missing exports
- `auth/index.ts` - Redirects to `@firebase/auth`  
- `firestore/index.ts` - Redirects to `@firebase/firestore`
- `functions/index.ts` - Redirects to `@firebase/functions`
- `storage/index.ts` - Redirects to `@firebase/storage`
- `analytics/index.ts` - Redirects to `@firebase/analytics`

## Why These Files Exist

These files resolve import conflicts caused by path aliasing in `tsconfig.json`. Without these redirects, Firebase imports would try to resolve to local directories rather than the node_modules packages.

## Important Notes

1. Do not delete these files
2. If adding new Firebase services, create corresponding redirect files
3. Keep the redirects simple - they should only re-export from the appropriate Firebase package

## Background

The issue occurs because:
1. The project's tsconfig.json includes path mapping for `@firebase/*` to `src/firebase/*`
2. Firebase's internal packages use imports like `@firebase/app` 
3. Without the redirects, these imports would try to find files in the src directory instead of node_modules
