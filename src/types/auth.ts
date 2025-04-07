export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  isAdmin?: boolean;
  address?: {
    city?: string;
    country?: string;
  };
}

export interface AuthContextProps {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}
