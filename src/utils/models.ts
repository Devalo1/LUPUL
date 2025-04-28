// Create this file for the imported models
export interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

export interface TimestampedDocument extends FirestoreDocument {
  createdAt?: any;
  updatedAt?: any;
}
