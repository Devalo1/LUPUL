import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  listAll, 
  deleteObject,
  uploadBytesResumable,
  UploadTask
} from 'firebase/storage';
import { storage } from './firebase';

// Upload a file to Firebase Storage
export const uploadFile = async (path: string, file: File) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { path, downloadURL };
};

// Upload a file with progress tracking
export const uploadFileWithProgress = (
  path: string, 
  file: File, 
  onProgress?: (progress: number) => void
): UploadTask => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  if (onProgress) {
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      }
    );
  }
  
  return uploadTask;
};

// Get download URL for a file
export const getFileURL = async (path: string) => {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
};

// List all files in a directory
export const listFiles = async (path: string) => {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  const files = await Promise.all(
    result.items.map(async (item) => {
      const url = await getDownloadURL(item);
      return {
        name: item.name,
        fullPath: item.fullPath,
        url
      };
    })
  );
  
  return files;
};

// Delete a file
export const deleteFile = async (path: string) => {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
};
