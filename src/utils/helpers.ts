/**
 * Formats a number as a currency string
 */
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined) return "";
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Truncates text to a specified length and adds ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Calculates the discounted price
 */
export const calculateDiscountedPrice = (price: number | undefined, discountPercentage: number): number | undefined => {
  if (price === undefined) return undefined;
  return price * (1 - discountPercentage / 100);
};

/**
 * Slugify a string (remove special chars, replace spaces with dashes, lowercase)
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

/**
 * Debounce function to limit the rate at which a function can fire
 */
export const debounce = <F extends (...args: unknown[]) => unknown>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (_email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(_email).toLowerCase());
};

/**
 * Get browser locale
 */
export const getBrowserLocale = (): string => {
  if (typeof window === "undefined") return "ro-RO";
  return navigator.language || "ro-RO";
};

/**
 * Generates a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Example function with specific types
 */
export const exampleFunction = (_param: string, _options: Record<string, unknown>): void => {
  // Function implementation here
};