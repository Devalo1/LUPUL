/**
 * Common types for HTTP requests and responses
 */

// HTTP Request types
export interface RequestParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface RequestBody {
  [key: string]: unknown;
}

// Common API response & error types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | ErrorResponse;
  message?: string;
  status?: number;
}

// Import the User type to ensure consistency
import { User } from "../models/User";

// Common types used throughout the application

// User profile type for authentication - make compatible with User model
export type UserProfile = User;

// Firebase document reference
export interface FirestoreDocument<T = Record<string, unknown>> {
  id: string;
  data: () => T;
  exists: boolean;
  ref: {
    path: string;
  };
}

// Event participant type
export interface EventParticipant {
  userId: string;
  name: string;
  joinedAt: Date | string;
  age?: string;
  expectations?: string;
  [key: string]: unknown;
}

// Product rating type
export interface ProductRating {
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  date: string;
  verified?: boolean;
}

// HTTP request context
export interface RequestContext {
  user?: UserProfile;
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// Database model common fields
export interface BaseModel {
  id?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  active?: boolean;
}

// Redux action
export interface ReduxAction<T = unknown> {
  type: string;
  payload?: T;
  error?: boolean;
  meta?: Record<string, unknown>;
}

// Redux state
export interface ReduxState {
  auth: {
    isAuthenticated: boolean;
    loading: boolean;
    user: UserProfile | null;
    error: string | null;
  };
  [key: string]: unknown;
}

export type FirebaseTimestamp = {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
};

// Common API response & error types
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
  status?: number;
}

export interface ApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;
}

// Generic data structures
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Function types
export type AsyncCallback<T = void, P = unknown> = (params: P) => Promise<T>;
export type ErrorHandler = (error: unknown) => void;

// Utility types for components
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface FormState {
  loading: boolean;
  success: boolean;
  error?: string;
}

// Common user types
export interface UserCredentials {
  email: string;
  password: string;
}

// Auth provider data
export interface AuthProviderData {
  providerId: string;
  uid: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

// Firebase types
export interface FirebaseDocumentData {
  id: string;
  [key: string]: unknown;
}

// Generic data handling
export interface SelectOption {
  value: string | number;
  label: string;
}

// Common product-related types
export interface ProductBase {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  inStock?: boolean;
}

export interface ProductDetail extends ProductBase {
  images?: string[];
  sku?: string;
  attributes?: Record<string, string | number | boolean>;
  variants?: ProductVariant[];
  ratings?: {
    average: number;
    count: number;
  };
  reviews?: ReviewSummary[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  sku?: string;
  inStock?: boolean;
  attributes?: Record<string, string | number | boolean>;
}

export interface ReviewSummary {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  date: Date | string | number;
}

// Common event-related types
export interface EventBase {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string | number;
  endDate?: Date | string | number;
  location?: string;
  imageUrl?: string;
  category?: string;
  organizer?: string;
}

export interface EventDetail extends EventBase {
  attendees?: Attendee[];
  maxAttendees?: number;
  price?: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface Attendee {
  userId: string;
  userName: string;
  email?: string;
  status?: "registered" | "attended" | "cancelled";
  registrationDate: Date | string | number;
}

// Common cart-related types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantId?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  total: number;
}

// Common order-related types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping: ShippingInfo;
  payment: PaymentInfo;
  total: number;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentInfo {
  method: "card" | "cash" | "transfer";
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  transactionId?: string;
}

// Utility types
export interface LoggingOptions {
  level: "debug" | "info" | "warn" | "error";
  nodeEnv?: string;
}

/**
 * Common types used throughout the application
 * This file serves as a central repository for shared types to avoid using 'any'
 */

/**
 * Generic error type to be used instead of 'any' for error handling
 */
export interface AppError extends Error {
  code?: string;
  name: string;
  message: string;
  stack?: string;
  details?: unknown;
}

/**
 * Firebase document data type
 */
export interface FirebaseDocument<T = Record<string, unknown>> {
  id: string;
  data: () => T;
  exists: () => boolean;
  ref: unknown;
}

/**
 * Base user data
 */
export interface UserData {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAdmin?: boolean;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

/**
 * Admin user
 */
export interface AdminData {
  id?: string;
  email: string;
  name?: string;
  addedAt?: Date | null;
  active?: boolean;
  source?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * HTTP related types
 */
export interface HttpResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Event related types
 */
export interface EventData {
  id: string;
  title: string;
  description?: string;
  date: string | Date;
  location: string;
  capacity?: number;
  registeredCount?: number;
  imageUrl?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

/**
 * Product related types
 */
export interface ProductData {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  category?: string;
  imageUrl?: string;
  stock?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

/**
 * Form submission data
 */
export interface FormSubmission {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Function result with generic return type
 */
export interface FunctionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
