import { Timestamp } from "firebase/firestore";

/**
 * Helper functions for working with Firebase Timestamps and Date objects
 */
export class TimestampUtils {
  /**
   * Safely converts a Firebase Timestamp or Date-like value to a JavaScript Date
   * 
   * @param value A value that might be a Timestamp, Date, or something else
   * @returns A JavaScript Date object
   */
  static toDate(value: unknown): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    } else if (value instanceof Date) {
      return value;
    } else if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
      // Handle Firestore Timestamp-like objects
      return value.toDate();
    } else if (value && typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
      // Handle Timestamp-like objects with seconds property
      return new Date((value as any).seconds * 1000);
    } else if (value && (typeof value === "string" || typeof value === "number")) {
      // Handle string or number timestamps
      return new Date(value);
    }
    
    // Default to current date if the value cannot be converted
    console.warn("Unable to convert value to Date:", value);
    return new Date();
  }

  /**
   * Checks if a value is a Firebase Timestamp
   * 
   * @param value The value to check
   * @returns True if value is a Firebase Timestamp
   */
  static isTimestamp(value: unknown): boolean {
    return value instanceof Timestamp || 
      (value && 
       typeof value === "object" && 
       "toDate" in value && 
       typeof value.toDate === "function" &&
       "seconds" in value &&
       "nanoseconds" in value);
  }

  /**
   * Formats a date for display
   * 
   * @param date Date or Timestamp to format
   * @param locale Locale for formatting (defaults to 'ro-RO')
   * @param options DateTimeFormat options
   * @returns Formatted date string
   */
  static formatDate(
    date: Date | Timestamp | unknown, 
    locale = "ro-RO", 
    options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  ): string {
    const jsDate = this.toDate(date);
    return new Intl.DateTimeFormat(locale, options).format(jsDate);
  }
}
