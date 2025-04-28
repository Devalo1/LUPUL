import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadString,
  UploadResult as _UploadResult,
  StorageReference,
  UploadMetadata
} from "firebase/storage";
import { handleStorageError } from "./firebase-errors";

/**
 * Options for file upload
 */
export interface FileUploadOptions {
  path: string;
  metadata?: UploadMetadata;
  generateUniqueName?: boolean;
}

/**
 * Result of a successful file upload
 */
export interface FileUploadResult {
  downloadUrl: string;
  path: string;
  ref: StorageReference;
  metadata?: UploadMetadata;
}

const storage = getStorage();

/**
 * Generates a unique filename with timestamp
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = new Date().getTime();
  const extension = originalName.split(".").pop();
  const baseName = originalName.split(".").slice(0, -1).join(".");
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "_");
  
  return `${sanitizedBaseName}_${timestamp}.${extension}`;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File | Blob, 
  options: FileUploadOptions
): Promise<FileUploadResult> {
  try {
    const { path, metadata, generateUniqueName = true } = options;
    
    // Generate a unique filename if requested
    const fileName = generateUniqueName 
      ? generateUniqueFileName(file instanceof File ? file.name : "blob")
      : path.split("/").pop() || "file";
    
    // Create the full path
    const fullPath = path.endsWith("/") 
      ? `${path}${fileName}` 
      : `${path}/${fileName}`;
    
    // Create a reference
    const storageRef = ref(storage, fullPath);
    
    // Upload the file
    const uploadResult = await uploadBytes(storageRef, file, metadata);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    
    return {
      downloadUrl,
      path: fullPath,
      ref: uploadResult.ref,
      metadata: uploadResult.metadata
    };
  } catch (error) {
    const appError = handleStorageError(error);
    throw appError;
  }
}

/**
 * Upload a base64 or data URL string to Firebase Storage
 */
export async function uploadDataUrl(
  dataUrl: string,
  options: FileUploadOptions
): Promise<FileUploadResult> {
  try {
    const { path, metadata, generateUniqueName = true } = options;
    
    // Generate a unique filename if requested
    const fileName = generateUniqueName 
      ? `image_${new Date().getTime()}.jpg` 
      : path.split("/").pop() || "image.jpg";
    
    // Create the full path
    const fullPath = path.endsWith("/") 
      ? `${path}${fileName}` 
      : `${path}/${fileName}`;
    
    // Create a reference
    const storageRef = ref(storage, fullPath);
    
    // Extract the data part if it's a data URL
    const format = dataUrl.split(";")[0]?.split("/")[1] || "jpeg";
    const base64Content = dataUrl.includes("base64,") 
      ? dataUrl.split("base64,")[1] 
      : dataUrl;
    
    // Upload the string
    const uploadResult = await uploadString(storageRef, base64Content, "base64", {
      contentType: `image/${format}`,
      ...metadata
    });
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    
    return {
      downloadUrl,
      path: fullPath,
      ref: uploadResult.ref,
      metadata: uploadResult.metadata
    };
  } catch (error) {
    const appError = handleStorageError(error);
    throw appError;
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    const appError = handleStorageError(error);
    throw appError;
  }
}

/**
 * Get a download URL for a file in Firebase Storage
 */
export async function getFileUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    const appError = handleStorageError(error);
    throw appError;
  }
}