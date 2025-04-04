import { db, storage } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  setDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product, Order, User, UserProfile } from '../types';

// Generic error handler
const handleError = (error: unknown, message: string): never => {
  console.error(`API Error (${message}):`, error);
  throw new Error(`${message}: ${error instanceof Error ? error.message : String(error)}`);
};

// Products API
export const productApi = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      return handleError(error, 'Failed to fetch products');
    }
  },

  // Get products by category
  getByCategory: async (category: string): Promise<Product[]> => {
    try {
      const q = query(collection(db, 'products'), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      return handleError(error, 'Failed to fetch products by category');
    }
  },

  // Get single product by id
  getById: async (id: string): Promise<Product> => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } catch (error) {
      return handleError(error, 'Failed to fetch product');
    }
  },

  // Add new product
  add: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      return handleError(error, 'Failed to add product');
    }
  },

  // Update product
  update: async (id: string, data: Partial<Product>): Promise<void> => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, data);
    } catch (error) {
      return handleError(error, 'Failed to update product');
    }
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      return handleError(error, 'Failed to delete product');
    }
  },

  // Upload product image
  uploadImage: async (file: File, productId: string): Promise<string> => {
    try {
      const storageRef = ref(storage, `products/${productId}/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      return handleError(error, 'Failed to upload image');
    }
  }
};

// Orders API
export const orderApi = {
  // Get all orders for a user
  getByUser: async (userId: string): Promise<Order[]> => {
    try {
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      return handleError(error, 'Failed to fetch orders');
    }
  },

  // Get single order
  getById: async (id: string): Promise<Order> => {
    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      return { id: docSnap.id, ...docSnap.data() } as Order;
    } catch (error) {
      return handleError(error, 'Failed to fetch order');
    }
  },

  // Create a new order
  create: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      return handleError(error, 'Failed to create order');
    }
  },

  // Update order status
  updateStatus: async (id: string, status: Order['status']): Promise<void> => {
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      return handleError(error, 'Failed to update order status');
    }
  }
};

// Users API
export const userApi = {
  // Get user profile
  getProfile: async (userId: string): Promise<User> => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`User profile for ID ${userId} not found`);
      }
      
      return { uid: docSnap.id, ...docSnap.data() } as User;
    } catch (error) {
      return handleError(error, 'Failed to fetch user profile');
    }
  },

  // Create or update user profile
  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create new profile if it doesn't exist
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Update existing profile
        await updateDoc(docRef, {
          ...data,
          lastLogin: serverTimestamp()
        });
      }
    } catch (error) {
      return handleError(error, 'Failed to update user profile');
    }
  },

  // Upload user avatar
  uploadAvatar: async (file: File, userId: string): Promise<string> => {
    try {
      const storageRef = ref(storage, `users/${userId}/avatar`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      return handleError(error, 'Failed to upload avatar');
    }
  }
};
