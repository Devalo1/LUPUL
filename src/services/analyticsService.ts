// Re-export serviciul consolidat pentru compatibilitate cu codul existent
import analyticsService, { 
  sendAnalyticsData, 
  trackEvent, 
  trackPageView 
} from "./analytics";

// Re-exportăm serviciul pentru compatibilitate
export { 
  sendAnalyticsData, 
  trackEvent, 
  trackPageView 
};

export default analyticsService;