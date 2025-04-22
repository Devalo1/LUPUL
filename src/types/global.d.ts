interface Window {
  checkFirebase?: () => Promise<string>;
  debugApp?: {
    logComponents: () => Element[];
    logRoutes: () => string;
    clearLogs: () => void;
  };
}
