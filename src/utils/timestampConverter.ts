import { Timestamp } from "firebase/firestore";

/**
 * Utility to properly convert Firebase Timestamp objects to JavaScript Date objects
 */
export class TimestampConverter {
  /**
   * Convert a Firebase Timestamp or any date-like value to a JavaScript Date
   * 
   * @param value Any value that could be a Date, Timestamp, or date-like object
   * @returns A JavaScript Date
   */
  static toDate(value: any): Date {
    if (!value) {
      return new Date(); // Default to current date
    }
    
    if (value instanceof Date) {
      return value;
    }
    
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    
    if (typeof value === "object" && value.toDate && typeof value.toDate === "function") {
      return value.toDate();
    }
    
    if (typeof value === "object" && value.seconds && typeof value.seconds === "number") {
      return new Date(value.seconds * 1000);
    }
    
    // Try to parse it as a Date
    return new Date(value);
  }
  
  /**
   * Check if a value is a Firebase Timestamp
   * 
   * @param value Value to check
   * @returns True if the value is a Firebase Timestamp
   */
  static isTimestamp(value: any): boolean {
    return value instanceof Timestamp || 
           (typeof value === "object" && 
            value !== null && 
            "seconds" in value && 
            "nanoseconds" in value);
  }
}

/**
 * Safe way to handle Timestamp or Date values
 * @param date Firebase Timestamp or Date
 * @returns JavaScript Date
 */
export const safeTimestamp = (date: any): Date => {
  return TimestampConverter.toDate(date);
};

export default TimestampConverter;
