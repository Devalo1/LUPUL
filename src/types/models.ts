import { Timestamp } from "firebase/firestore";

/**
 * Base interface for all Firestore documents
 */
export interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

/**
 * Interface for documents that have timestamp fields
 */
export interface TimestampedDocument extends FirestoreDocument {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Interface for user documents in Firestore
 */
export interface UserDocument extends TimestampedDocument {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  role?: string;
  isAdmin?: boolean;
  isSpecialist?: boolean;
  lastLogin?: Timestamp;
}

/**
 * Interface for specialist documents in Firestore
 */
export interface SpecialistDocument {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  imageUrl?: string;
  description?: string;
  serviceType?: string;
  services?: string[];
  isActive?: boolean;
  schedule?: any;
  specialization?: string;
  displayName?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Interface for appointment documents in Firestore
 */
export interface AppointmentDocument extends TimestampedDocument {
  userId: string;
  specialistId: string;
  serviceId: string;
  date: Timestamp;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  price?: number;
}

/**
 * Interface for service documents in Firestore
 */
export interface ServiceDocument {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  specialtyId?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Interface for special session documents in Firestore
 */
export interface SpecialSessionDocument extends TimestampedDocument {
  specialistId: string;
  specialistName: string;
  title: string;
  description: string;
  date: Date | Timestamp;
  startTime: string;
  endTime: string;
  location?: string;
  isOnline: boolean;
  capacity: number;
  currentParticipants: number;
  price: number;
  imageUrl?: string;
  participants?: Array<{
    id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    enrollmentDate: Timestamp;
    status: "confirmed" | "cancelled" | "waiting";
  }>;
}

/**
 * Interface for specialization request documents in Firestore
 */
export interface SpecializationRequest {
  id?: string;
  userId: string;
  specialization: string;
  specializationCategory: string;
  status: "pending" | "approved" | "rejected";
  certificateUrl?: string;
  submittedAt: any; // Consider using FirebaseFirestore.Timestamp
  processedAt?: any;
  notes?: string;
  
  // Adding missing properties used in the component
  displayName?: string;
  userEmail?: string;
  comments?: string;
  reason?: string;
  
  // Properties for specialization changes
  oldSpecialization?: string;
  newSpecialization?: string;
  oldCategory?: string;
  newCategory?: string;
  specializationDetails?: string;
}