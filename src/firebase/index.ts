// This file should only re-export from config, but make sure it's not initializing Firebase again
// Re-export everything from config
export * from './config';

// Add explicit export to make debugging easier
import { app, auth, db, storage, analytics } from './config';
export { app, auth, db as firestore, storage, analytics };
