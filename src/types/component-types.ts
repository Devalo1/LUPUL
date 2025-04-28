import { User } from "firebase/auth";
import { UserWithClaims as _UserWithClaims } from "./claims";
import { User as AppUser } from "./user";

/**
 * Props for components that require authentication
 */
export interface AuthRequiredProps {
  user: User;
  isAdmin?: boolean;
  isSpecialist?: boolean;
  userRole?: string;
}

/**
 * Props for components that accept but don't require authentication
 */
export interface AuthAwareProps {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  isSpecialist?: boolean;
  userRole?: string;
}

/**
 * Props for components that require admin permissions
 */
export interface AdminRequiredProps extends AuthRequiredProps {
  isAdmin: true;
}

/**
 * Props for components that require specialist permissions
 */
export interface SpecialistRequiredProps extends AuthRequiredProps {
  isSpecialist: true;
}

/**
 * Component status states for loading/error handling
 */
export interface ComponentState {
  loading: boolean;
  error: string | null;
  success?: boolean;
}

/**
 * Combined application and Firebase user
 */
export type CombinedUser = User & Omit<Partial<AppUser>, keyof User>;

/**
 * Profile form values type used in profile edit components
 */
export interface ProfileFormValues {
  displayName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  profilePicture?: File | null;
  currentPhotoURL?: string | null;
}