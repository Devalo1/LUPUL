import { Timestamp } from "firebase/firestore";

/**
 * Interface for Event data structure
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  capacity: number;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
  participants?: Participant[];
  registeredUsers?: string[];
  comments?: EventComment[];
}

/**
 * Interface for Event participant
 */
export interface Participant {
  userId: string;
  name: string;
  joinedAt: Timestamp;
  age?: string;
  expectations?: string;
}

/**
 * Interface for Event comment
 */
export interface EventComment {
  userId: string;
  name: string;
  text: string;
  createdAt: Timestamp;
}