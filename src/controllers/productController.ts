import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  FieldValue
} from "firebase/firestore";

// Define a type for product data instead of using any
interface ProductData {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
  featured?: boolean;
  quantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
  sku?: string;
  [key: string]: unknown; // Allow additional properties without using 'any'
}

// Types for better readability
type ApiError = { message: string; code?: string };

// Helper function to handle errors
const handleError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return { message: error.message, code: "unknown_error" };
  }
  return { message: "An unknown error occurred", code: "unknown_error" };
};

// Get all products
export const getProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw handleError(error);
  }
};

// Get product by ID
export const getProductById = async (id: string) => {
  try {
    const productDoc = await getDoc(doc(db, "products", id));
    
    if (!productDoc.exists()) {
      throw { message: "Product not found", code: "not_found" };
    }
    
    return {
      id: productDoc.id,
      ...productDoc.data()
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Create new product
export const createProduct = async (productData: ProductData) => {
  try {
    // Add timestamps
    productData.createdAt = new Date();
    productData.updatedAt = new Date();

    const docRef = await addDoc(collection(db, "products"), productData);
    
    return {
      id: docRef.id,
      ...productData
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Update product
export const updateProduct = async (id: string, productData: ProductData) => {
  try {
    // Update timestamp
    productData.updatedAt = new Date();

    const productRef = doc(db, "products", id);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw { message: "Product not found", code: "not_found" };
    }
    
    await updateDoc(productRef, productData as { [x: string]: FieldValue | Partial<unknown> | undefined });
    
    return {
      id,
      ...productData
    };
  } catch (error) {
    throw handleError(error);
  }
};

// Delete product
export const deleteProduct = async (id: string) => {
  try {
    const productRef = doc(db, "products", id);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw { message: "Product not found", code: "not_found" };
    }
    
    await deleteDoc(productRef);
    
    return { message: "Product deleted successfully" };
  } catch (error) {
    throw handleError(error);
  }
};