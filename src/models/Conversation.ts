// Conversation and Message models for chat system
import { Timestamp } from "firebase/firestore";

export interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Timestamp | Date;
}

export interface Conversation {
  id: string;
  userId: string;
  subject: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  messages: Message[];
}
