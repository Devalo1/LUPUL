export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  featured?: boolean;
  discount?: number;
  createdAt: string;
}

export interface TherapyService {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  price: number;
}

// Add more type definitions as needed
