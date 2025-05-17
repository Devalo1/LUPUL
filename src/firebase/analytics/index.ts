// Re-export all from @firebase/analytics
export * from "@firebase/analytics";

// Analytics interface
export interface Analytics {
  app: any;
}

// Analytics functions
export function getAnalytics(app?: any): Analytics {
  const originalGetAnalytics = require("firebase/analytics").getAnalytics;
  return originalGetAnalytics(app);
}

export function logEvent(analytics: Analytics, eventName: string, eventParams?: Record<string, any>): void {
  const originalLogEvent = require("firebase/analytics").logEvent;
  return originalLogEvent(analytics, eventName, eventParams);
}

export async function isSupported(): Promise<boolean> {
  const originalIsSupported = require("firebase/analytics").isSupported;
  return originalIsSupported();
}
