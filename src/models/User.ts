import { Timestamp } from "firebase/firestore";

// User interface definition
export interface IUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
  role?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  lastLogin?: Timestamp | Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    newsletter?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}

// User type for Redux store
export type User = IUser;

// Browser-safe implementation - no Mongoose
const UserModel = {
  // Define methods that will be safe to use in browser
  fromFirebase: (firebaseUser: any): IUser => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      phoneNumber: firebaseUser.phoneNumber,
      emailVerified: firebaseUser.emailVerified,
    };
  },
  
  // Add any browser-safe methods you need
  toJSON: (user: IUser): object => {
    return { ...user };
  }
};

export default UserModel;
