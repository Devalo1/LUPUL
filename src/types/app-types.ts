// Common types to replace 'any' throughout the application

export interface GenericRecord {
  id: string;
  [key: string]: unknown;
}

export interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  [key: string]: unknown;
}

export interface FormEvent<T = Element> {
  target: T;
  preventDefault(): void;
  [key: string]: unknown;
}

export interface ServiceData {
  id: string;
  name: string;
  price?: number;
  description?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface AppointmentData {
  id: string;
  date: Date | string;
  status: string;
  userId: string;
  specialistId: string;
  serviceId?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}
