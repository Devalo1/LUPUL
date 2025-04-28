import { User as _FirebaseUser } from "firebase/auth";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  isAnonymous: boolean;
  role?: string;
  isAdmin?: boolean;
  isSpecialist?: boolean;
  createdAt?: Date | string | number;
  lastLogin?: Date | string | number;
  firstName?: string;
  lastName?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  settings?: {
    notifications?: boolean;
    theme?: string;
    language?: string;
  };
}

export type UserProfile = Omit<User, "uid">;

export interface UserData {
  email: string;
  displayName: string;
  photoURL: string;
  lastLogin: Date;
  updatedAt: Date;
  createdAt: Date;
  isAdmin: boolean;
  role: string;
}
