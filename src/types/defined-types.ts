// Define types to replace 'any' throughout the application

// Generic types
export type FileUploadOptions = {
  path: string;
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
};

export type UploadProgressInfo = {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
};

export type ServiceType = {
  id: string;
  name: string;
  description?: string;
  // Add other necessary properties
};

export type Specialist = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  specialties?: string[];
  // Add other necessary properties
};

export type AppointmentType = {
  id: string;
  specialistId: string;
  userId: string;
  date: Date | string;
  status: string;
  // Add other necessary properties
};

export type UserData = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  // Add other necessary properties
};

export type FormEventData = {
  name: string;
  value: string | number | boolean;
};

export type RatingData = {
  value: number;
  // Additional properties if needed
};

export type ApiResponse<T = Record<string, unknown>> = {
  success: boolean;
  data?: T;
  error?: string;
};
