// Re-export all from @firebase/storage
export * from "@firebase/storage";

// Storage functions
export function getStorage(app?: any, bucketUrl?: string): any {
  const originalGetStorage = require("firebase/storage").getStorage;
  return originalGetStorage(app, bucketUrl);
}

export function ref(storageOrRef: any, path?: string): any {
  const originalRef = require("firebase/storage").ref;
  return originalRef(storageOrRef, path);
}

export function uploadBytes(reference: any, data: any, metadata?: any): Promise<any> {
  const originalUploadBytes = require("firebase/storage").uploadBytes;
  return originalUploadBytes(reference, data, metadata);
}

export function uploadString(reference: any, value: string, format?: any, metadata?: any): Promise<any> {
  const originalUploadString = require("firebase/storage").uploadString;
  return originalUploadString(reference, value, format, metadata);
}

export function getDownloadURL(reference: any): Promise<string> {
  const originalGetDownloadURL = require("firebase/storage").getDownloadURL;
  return originalGetDownloadURL(reference);
}

export function deleteObject(reference: any): Promise<void> {
  const originalDeleteObject = require("firebase/storage").deleteObject;
  return originalDeleteObject(reference);
}

export function listAll(reference: any): Promise<any> {
  const originalListAll = require("firebase/storage").listAll;
  return originalListAll(reference);
}

export function connectStorageEmulator(storage: any, host: string, port: number, options?: any): void {
  const originalConnectStorageEmulator = require("firebase/storage").connectStorageEmulator;
  return originalConnectStorageEmulator(storage, host, port, options);
}
