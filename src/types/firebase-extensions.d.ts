import { User as _User, Auth as _Auth } from "firebase/auth";

// Extend Firebase User type to include our custom properties
declare module "firebase/auth" {
  interface User {
    isAdmin?: boolean;
    createdAt?: Date | number;
    getIdToken(forceRefresh?: boolean): Promise<string>;
  }

  interface Auth {
    signOut(): Promise<void>;
  }
}