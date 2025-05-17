# Git Setup Documentation

## Ignored Files and Directories

This repository is configured to ignore certain files and directories that shouldn't be tracked in version control:

- `node_modules/`: Node.js dependencies (installed via npm/yarn)
- `dist/`: Build output directories
- Various log files and debug outputs
- Environment files (`.env`, `.env.local`, etc.)
- IDE-specific files and directories
- Build caches and temporary files

## Firebase Import Structure

The repository includes special redirection files in the `src/firebase` directory structure that ensure proper module resolution. These files map Firebase package imports to the correct node modules. Do not remove these files as they prevent import errors with Firebase modules:

```
src/firebase/
  ├── app/
  │   └── index.ts        # Redirects to @firebase/app and provides missing exports
  ├── auth/
  │   └── index.ts        # Redirects to @firebase/auth
  ├── firestore/
  │   └── index.ts        # Redirects to @firebase/firestore
  ├── functions/
  │   └── index.ts        # Redirects to @firebase/functions
  ├── storage/
  │   └── index.ts        # Redirects to @firebase/storage
  └── analytics/
      └── index.ts        # Redirects to @firebase/analytics
```

## Git Configuration Overview

The main `.gitignore` file at the root of the repository and additional `.gitignore` files in subdirectories (like `functions/.gitignore`) specify what files should be excluded from version control.

### Best Practices

1. **Never commit sensitive information**: API keys, passwords, or personal credentials should never be committed.
2. **Don't manually add ignored directories**: Files specified in `.gitignore` are ignored for a reason - don't force-add them with `git add -f`.
3. **New dependencies**: When adding new dependencies via npm/yarn, only commit the `package.json` and `package-lock.json`/`yarn.lock` files, not the `node_modules` directory.

## Optimizing Git Performance

This repository includes tools to optimize Git performance:

### Using the Git Optimization Script

Run the Git optimization script periodically to maintain repository health:

```bash
# Option 1: Use the npm script
npm run git:optimize

# Option 2: Run the PowerShell script directly
powershell -ExecutionPolicy Bypass -File scripts/optimize-git.ps1
```

This script will:
- Verify Git configuration for optimal performance
- Check that `.gitignore` is properly set up
- Remove any tracked files that should be ignored
- Run Git garbage collection and other optimization tasks
- Clean up unreferenced objects

### When to Run Optimization

Run the Git optimization script:
- After pulling large changes
- Before pushing major changes
- When experiencing slow Git operations
- After installing many new dependencies
- Every few weeks for regular maintenance

## Common Git Operations

### First-time setup

```bash
# Clone the repository
git clone [repository URL]

# Install dependencies
npm install
```

### Adding dependencies

```bash
# Install a new dependency
npm install [package-name]

# Only stage the package.json and package-lock.json files
git add package.json package-lock.json
git commit -m "Add [package-name] dependency"
```

### Repository Maintenance

Occasionally run these commands to optimize the repository:

```bash
# Garbage collection to optimize repository size
git gc --aggressive

# Remove unreferenced objects
git prune
```

## Troubleshooting

If you notice that ignored files are being tracked, you might need to:

1. Verify your `.gitignore` file is correct
2. Remove already tracked files from Git's index:
   ```bash
   git rm -r --cached .
   git add .
   git commit -m "Apply gitignore rules"
   ```

## Questions or Issues

If you encounter any issues with the Git setup, please contact the repository maintainer.
