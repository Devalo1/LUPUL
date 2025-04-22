import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { storage } from "../services/firestore";

// Upload a file to Firebase Storage
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Get download URL for a file
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw new Error(`Failed to get file URL: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// List all files in a directory
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const storageRef = ref(storage, path);
    const res = await listAll(storageRef);
    const urls = await Promise.all(res.items.map(itemRef => getDownloadURL(itemRef)));
    return urls;
  } catch (error) {
    console.error("Error listing files:", error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : String(error)}`);
  }
};
