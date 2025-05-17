// Re-export all from firebase/firestore
export * from "firebase/firestore";

// Explicitly define missing functions
export const addDoc = async (collectionRef: any, data: any): Promise<any> => {
  // This is a mock implementation that should never be called
  // The real implementation is provided by Firebase
  console.error("Mock addDoc was called - this should not happen");
  return { id: "mock-id" };
};

export const collection = (firestore: any, path: string): any => {
  // Mock implementation
  return { path };
};

export const doc = (firestoreOrCollectionRef: any, path?: string): any => {
  // Mock implementation
  return { path };
};

export const getDoc = async (docRef: any): Promise<any> => {
  // Mock implementation
  return { exists: () => false, data: () => null };
};

export const getDocs = async (query: any): Promise<any> => {
  // Mock implementation
  return { 
    empty: true, 
    size: 0, 
    docs: [],
    forEach: (callback: Function) => {} 
  };
};
