// Extend Firebase User type to include our custom properties
declare module "firebase/auth" {
  interface User {
    isAdmin?: boolean;
    createdAt?: Date | number;
  }
}