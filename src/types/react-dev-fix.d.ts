// Global type declarations for React development mode fix
declare global {
  interface Window {
    process?: {
      env?: Record<string, string>;
    };
    __DEV__?: boolean;
  }

  interface globalThis {
    __DEV__?: boolean;
  }

  var __DEV__: boolean | undefined;
}

export {};
