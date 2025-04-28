import { User as _FirebaseUser } from "firebase/auth";

export type FormEvent = React.FormEvent<HTMLFormElement>;
export type InputEvent = React.ChangeEvent<HTMLInputElement>;
export type SelectEvent = React.ChangeEvent<HTMLSelectElement>;
export type TextAreaEvent = React.ChangeEvent<HTMLTextAreaElement>;

export interface GenericObject {
  [key: string]: unknown;
}

export interface FirebaseError {
  code: string;
  message: string;
  name: string;
}

export type CallbackFunction<T = void> = (...args: unknown[]) => T;

// Type for handling any object with unknown structure
export interface DynamicObject {
  [key: string]: unknown;
}

// User interface enhancements
export interface UserExtended {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLogin: Date;
  isAdmin: boolean;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  isAnonymous?: boolean;
  role?: string;
}

// Type for event handlers
export type EventHandler<T = Element> = React.EventHandler<React.SyntheticEvent<T>>;
