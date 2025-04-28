// Common interfaces and types for the application

import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  order?: number;
  hasProducts?: boolean; // Indică dacă categoria are produse disponibile
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  stock?: number;
  category?: string | Category;
  ingredients?: string[];
  story?: string;
  details?: string;
  weight?: string;
  ratings?: {
    average: number;
    count: number;
    userRatings: ProductReview[];
  };
  // Add properties used in Admin pages
  discount?: number;
  featured?: boolean;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  // Other properties
  sku?: string;
  imageUrl?: string;
  lastUpdated?: Timestamp;
  lowStockAlert?: number;
  costPrice?: number;
  supplier?: string;
}

export interface ProductReview {
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  date: string;
  verified?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  service: string;
  date: string;
  imageUrl?: string;
}

export interface BaseComponentProps {
  className?: string;
  id?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAdmin?: boolean;
  phoneNumber?: string | null;
  isAnonymous?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  } & Record<string, unknown>;
  providerData?: Array<unknown>;
  firstName?: string;
  lastName?: string;
  address?: {
    city?: string;
    country?: string;
    street?: string;
    postalCode?: string;
  };
}

export interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
  };
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: Timestamp; // Firestore timestamp
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode?: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
}

export interface AppError {
  code?: string;
  message?: string;
  name?: string;
  stack?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface LoggingOptions {
  context?: string;
  data?: Record<string, unknown>;
  error?: Error;
}
