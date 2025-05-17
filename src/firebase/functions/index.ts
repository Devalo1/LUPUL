// Re-export all from @firebase/functions
export * from "@firebase/functions";

// Functions
export function getFunctions(app?: any, regionOrCustomDomain?: string): any {
  const originalGetFunctions = require("firebase/functions").getFunctions;
  return originalGetFunctions(app, regionOrCustomDomain);
}

export function httpsCallable(functions: any, name: string, options?: any): (data?: any) => Promise<any> {
  const originalHttpsCallable = require("firebase/functions").httpsCallable;
  return originalHttpsCallable(functions, name, options);
}

export function connectFunctionsEmulator(functions: any, host: string, port: number): void {
  const originalConnectFunctionsEmulator = require("firebase/functions").connectFunctionsEmulator;
  return originalConnectFunctionsEmulator(functions, host, port);
}
