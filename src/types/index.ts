// Common Types for the entire application

// Therapy Service type
export interface TherapyService {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  price: number;
}

// Re-export auth types
export * from "./auth";

// User related types
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
    // Add other address fields as needed
  };
  // Add any other user properties you need
}

// User Profile type
export interface UserProfile {
  uid: string;
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
  createdAt?: string | Date;
  lastLogin?: string | Date;
}

// Tipuri comune pentru categorie și produs folosite în toată aplicația
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageUrl?: string; // pentru compatibilitate cu componentele existente
  inStock: boolean;
  stock: number; // cantitatea în stoc
  sku?: string;
  category: string; // categoria principală (slug)
  categories?: string[]; // pentru produse care pot aparține mai multor categorii
  weight?: string;
  discount?: number;
  details?: string;
  ingredients?: string[];
  story?: string;
  featured?: boolean;
  lowStockAlert?: number;
  costPrice?: number;
  supplier?: string;
  lastUpdated?: any; // Timestamp
  createdAt?: string;
  updatedAt?: string;
  ratings?: {
    average: number;
    count: number;
    userRatings?: {
      rating: number;
      date: string;
      comment?: string;
    }[];
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number | undefined;
  image?: string;
  quantity: number;
}

// Order related types
export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
  createdAt?: string | Date;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Address type
export interface Address {
  fullName: string;
  street: string;
  city: string;
  county: string;
  postalCode: string;
  phone: string;
}

// Testimonial type
export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  service: string;
  imageUrl?: string;
  date: string;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  id?: string;
}

// Theme configuration
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

// Layout component props
export interface LayoutProps {
  children: React.ReactNode;
}

// Authentication context props
export interface AuthContextProps {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}