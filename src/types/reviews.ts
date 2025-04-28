import { Timestamp } from "firebase/firestore";

/**
 * Interface for author information in reviews
 */
export interface ReviewAuthor {
  id?: string;
  name: string;
  photoURL?: string;
}

/**
 * Interface for reviews in the application
 */
export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date | Timestamp;
  author: ReviewAuthor;
  specialistId?: string;
  userId?: string;
}