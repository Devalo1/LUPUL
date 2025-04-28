// Browser-safe version without Mongoose dependencies

export interface IProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  images?: string[];
  image?: string;
  inStock?: boolean;
  discount?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Browser-safe implementation - no Mongoose
const Product = {
  // Define methods that will be safe to use in browser
  fromFirebase: (firebaseProduct: any): IProduct => {
    return {
      id: firebaseProduct.id || "",
      name: firebaseProduct.name || "",
      description: firebaseProduct.description || "",
      price: firebaseProduct.price || 0,
      category: firebaseProduct.category || "uncategorized",
      images: firebaseProduct.images || [],
      image: firebaseProduct.image || "",
      inStock: firebaseProduct.inStock !== false, // Default to true
      discount: firebaseProduct.discount || 0,
      active: firebaseProduct.active !== false, // Default to true
      createdAt: firebaseProduct.createdAt ? new Date(firebaseProduct.createdAt) : new Date(),
      updatedAt: firebaseProduct.updatedAt ? new Date(firebaseProduct.updatedAt) : new Date()
    };
  },
  
  // Calculate discounted price
  calculateDiscountedPrice: (product: IProduct): number => {
    if (!product.discount || product.discount <= 0) {
      return product.price;
    }
    return product.price * (1 - product.discount / 100);
  },
  
  // Helper method to convert to JSON
  toJSON: (product: IProduct): object => {
    return { ...product };
  }
};

export default Product;
