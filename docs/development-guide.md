# Development Guide

This guide provides information for contributors working on this project.

## Getting Started

1. **Clone the repository:**
   ```
   git clone [repository-url]
   cd my-typescript-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables

4. **Start the development server:**
   ```
   npm run dev
   ```

5. **Start Firebase emulators (optional):**
   ```
   npm run emulators
   ```
   
   Or run both together:
   ```
   npm run dev:all
   ```

## Development Workflow

### Branch Structure

- `main` - Production code
- `develop` - Development branch, all feature branches merge into this
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Hot fixes for production

### Creating a New Feature

1. Create a new branch from `develop`:
   ```
   git checkout develop
   git pull
   git checkout -b feature/my-new-feature
   ```

2. Implement your changes, following the [coding standards](./coding-standards.md)

3. Write tests for your changes

4. Commit your changes:
   ```
   git add .
   git commit -m "feat: add my new feature"
   ```

5. Push your branch:
   ```
   git push -u origin feature/my-new-feature
   ```

6. Create a pull request to the `develop` branch

### Code Reviews

- All code changes require a review before merging
- Address review comments and push additional commits to your branch
- Once approved, your PR can be merged

### Commit Message Format

We follow the Conventional Commits specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that don't affect code meaning (formatting, etc)
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `perf:` - Performance improvements
- `test:` - Adding or correcting tests
- `chore:` - Changes to build process or auxiliary tools

Examples:
```
feat: add user authentication
fix: resolve issue with data loading
docs: update README with new instructions
```

## Code Quality

### Linting

Run ESLint to check your code:
```
npm run lint
```

Fix automatic linting issues:
```
npm run lint -- --fix
```

### Formatting

Format your code with Prettier:
```
npm run format
```

### Type Checking

Run TypeScript type checking:
```
npm run type-check
```

### Testing

Run tests:
```
npm run test
```

## Building and Previewing

Build the project:
```
npm run build
```

Preview the production build:
```
npm run preview
```

## Troubleshooting

### Common Issues

**Firebase emulator connection issues:**
- Check if emulators are running: `npm run check-emulators`
- Make sure the ports are not in use by other applications
- Try restarting the emulators: `firebase emulators:stop` then `npm run emulators`

**Build issues:**
- Clear cache: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

**Dependency issues:**
- Run `npm run check-deps` to identify and fix dependency issues
- Use `npm run fix-dependencies` to automatically fix common dependency problems
