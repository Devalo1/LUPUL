import { createLogger } from "../utils/logger"; // Ensure logger utility exists

// Utility functions and constants moved from AuthContext.tsx

export const authLogger = createLogger("AuthContext");

export const handleUnknownError = (error: unknown): { message: string } => {
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "Unknown error occurred" };
};