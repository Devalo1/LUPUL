// Common type definitions to use across the application

// Generic record with string keys and unknown values
export interface GenericRecord {
  [key: string]: unknown;
}

// User data structure
export interface UserData {
  id: string;
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  specialization?: string;
  specializationCategory?: string;
  [key: string]: unknown;
}

// Specialist data
export interface SpecialistData extends UserData {
  status?: string;
  bio?: string;
  education?: string[];
  experience?: string[];
  certifications?: string[];
  reviews?: ReviewData[];
  rating?: number;
}

// Review data
export interface ReviewData {
  id: string;
  userId: string;
  userName?: string;
  text: string;
  rating: number;
  date: Date | string;
}

// Service data
export interface ServiceData {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  specialistId?: string;
}

// Token related types
export interface TokenStatus {
  isTokenValid?: boolean;
  isInBackoff?: boolean;
  backoffIntervalSeconds?: number;
  consecutiveFailures?: number;
}

// Type for API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
