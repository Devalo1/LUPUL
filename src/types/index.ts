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

// User related types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  isAdmin?: boolean;
}

// Product related types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  featured?: boolean;
  discountPercent?: number;
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
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
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