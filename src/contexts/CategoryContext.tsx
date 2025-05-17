import React, { createContext, useState, useEffect, ReactNode } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Category } from "../types";
import { useAuth } from "../hooks/useAuth"; // Updated import

// Lista predefinită de categorii actualizată pentru a asigura toate categoriile goale
const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: "traditionale", 
    name: "Produse tradiționale", 
    slug: "traditionale", 
    order: 1,
    description: "Produse tradiționale românești preparate după rețete străvechi, folosind doar ingrediente naturale.",
    hasProducts: true // Doar această categorie are produse (dulceața de afine)
  },
  { 
    id: "suplimente", 
    name: "Suplimente", 
    slug: "suplimente", 
    order: 2,
    description: "Suplimente naturale pentru sănătate și vitalitate.",
    hasProducts: false // Categoria este creată dar nu are produse
  },
  { 
    id: "plante-medicinale", 
    name: "Plante medicinale", 
    slug: "plante-medicinale", 
    order: 3,
    description: "Plante medicinale culese din zonele montane nepoluate ale României.",
    hasProducts: false // Categoria este creată dar nu are produse
  },
  { 
    id: "ceaiuri", 
    name: "Ceaiuri", 
    slug: "ceaiuri", 
    order: 4,
    description: "Ceaiuri naturale din plante medicinale atent selecționate.",
    hasProducts: false // Categoria este creată dar nu are produse
  },
  { 
    id: "diverse", 
    name: "Diverse", 
    slug: "diverse", 
    order: 5,
    description: "Alte produse naturale și tradiționale.",
    hasProducts: false // Categoria este creată dar nu are produse
  }
];

// Define a Product interface to use in the CategoryContext
interface ProductPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  category: string;
  ratings?: {
    count: number;
    average: number;
  };
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getParentCategories: () => Category[];
  getChildCategories: (parentId: string) => Category[];
  formatCategoryName: (slug: string) => string;
  getCategoryProducts: (categoryId: string) => Promise<ProductPreview[]>;
  hasProductsInCategory: (categoryId: string) => boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Skip fetching categories if auth is still loading
    if (authLoading) {
      return;
    }
    
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Always try to fetch from Firestore if possible
        try {
          // Încearcă să obții categoriile din Firestore
          const categoriesRef = collection(db, "categories");
          const categoriesQuery = query(categoriesRef, orderBy("order", "asc"));
          const snapshot = await getDocs(categoriesQuery);
          
          if (!snapshot.empty) {
            const categoriesList = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || "",
                slug: data.slug || doc.id,
                description: data.description || "",
                imageUrl: data.imageUrl || "",
                parentId: data.parentId || undefined,
                order: data.order || 999,
                hasProducts: doc.id === "traditionale" // Doar categoria 'traditionale' are produse
              } as Category;
            });
            
            setCategories(categoriesList);
            setError(null); // Clear any previous errors
            console.log("Categorii încărcate cu succes din Firestore");
            return; // Exit early if successful
          }
        } catch (firestoreErr) {
          console.error("Eroare la încărcarea categoriilor din Firestore:", firestoreErr);
          // Continue to fallback - we'll use the default categories
        }
        
        // Fallback: Use default categories
        console.log("Se folosesc categoriile implicite.");
        setCategories(DEFAULT_CATEGORIES);
      } catch (err) {
        console.error("Eroare generală la încărcarea categoriilor:", err);
        setError("A apărut o eroare la încărcarea categoriilor. Se folosesc categoriile implicite.");
        // Ensure we always have categories even in case of error
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [authLoading, isAuthenticated]);

  const getCategoryBySlug = (slug: string): Category | undefined => {
    return categories.find(category => category.slug === slug);
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };

  const getParentCategories = (): Category[] => {
    return categories.filter(category => !category.parentId);
  };

  const getChildCategories = (parentId: string): Category[] => {
    return categories.filter(category => category.parentId === parentId);
  };

  const formatCategoryName = (slug: string): string => {
    const category = getCategoryBySlug(slug);
    if (category) return category.name;
    
    // Dacă nu există în lista noastră, formatăm manual
    switch(slug) {
      case "traditionale":
        return "Produse tradiționale";
      case "suplimente":
        return "Suplimente";
      case "diverse":
        return "Diverse";
      case "toate":
        return "Toate produsele";
      default:
        return slug.charAt(0).toUpperCase() + slug.slice(1);
    }
  };

  const hasProductsInCategory = (categoryId: string): boolean => {
    // Verificăm dacă categoria are marcată proprietatea hasProducts
    const category = getCategoryById(categoryId);
    return category?.hasProducts || false;
  };

  const getCategoryProducts = async (categoryId: string): Promise<ProductPreview[]> => {
    try {
      // Dacă nu este categoria de produse tradiționale, returnăm array gol
      if (categoryId !== "traditionale") {
        return [];
      }
      
      // Doar pentru categoria "traditionale" - returnăm dulceața de afine
      const afineProduct: ProductPreview = {
        id: "dulceata-afine",
        name: "Dulceață de Afine",
        description: "Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual din pădurile românești.",
        price: 20,
        image: "/images/Dulc.jpg",
        inStock: true,
        category: "traditionale",
        ratings: { count: 12, average: 4.7 }
      };
      
      return [afineProduct];
    } catch (err) {
      console.error("Eroare la obținerea produselor pentru categoria", categoryId, err);
      return [];
    }
  };

  const value = {
    categories,
    loading,
    error,
    getCategoryBySlug,
    getCategoryById,
    getParentCategories,
    getChildCategories,
    formatCategoryName,
    getCategoryProducts,
    hasProductsInCategory
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;