/**
 * Utility functions for formatting values (currency, dates, numbers, etc.)
 */

import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

/**
 * Format a number as RON currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'RON')
 * @param locale - The locale to use for formatting (default: 'ro-RO')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  currency: string = "RON",
  locale: string = "ro-RO"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a percentage value
 * @param value - The value to format as percentage
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  decimalPlaces: number = 1
): string => {
  return new Intl.NumberFormat("ro-RO", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value / 100);
};

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param decimalPlaces - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  decimalPlaces: number = 0
): string => {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
};

/**
 * Converts Firebase timestamp or ISO string to Date object
 * @param dateInput - Date in various formats
 * @returns JavaScript Date object
 */
export const ensureDate = (dateInput: Date | Timestamp | string | any): Date => {
  if (dateInput instanceof Date) {
    return dateInput;
  } else if (dateInput && typeof dateInput === "object" && "seconds" in dateInput) {
    // Handle Firebase Timestamp
    return new Date(dateInput.seconds * 1000);
  } else if (typeof dateInput === "string") {
    // Handle ISO string
    return new Date(dateInput);
  }
  // Default fallback
  return new Date();
};

/**
 * Formats a date using date-fns with Romanian locale
 * @param date - The date to format
 * @param formatStr - date-fns format string (default: 'PP' = localized date)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | Timestamp | string | any,
  formatStr = "PP"
): string => {
  try {
    const dateObj = ensureDate(date);
    return format(dateObj, formatStr, { locale: ro });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};