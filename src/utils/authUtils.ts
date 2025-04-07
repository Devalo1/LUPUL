import { User } from '../types/auth';

// Move context type definition here
export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // ...other properties
}

// Move default context value here
export const defaultAuthContext: AuthContextType = {
  currentUser: null,
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
  // ...other default values
};

// Move non-component exports here
export const authConstants = {
  // Constants that were in AuthContext.tsx
};

export const authHelpers = {
  // Helper functions that were in AuthContext.tsx
};

// Move any other helper functions or constants here
// export const someHelperFunction = () => {...};
