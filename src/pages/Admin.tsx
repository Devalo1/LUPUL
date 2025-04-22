import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import { Product } from "../types";
import AdminNavigation from "../components/AdminNavigation";
import { isUserAdmin } from "../utils/userRoles";

const Admin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      // Double-check admin status to be safe
      try {
        const isAdmin = user.isAdmin || await isUserAdmin(user.email || ""); // Ensure isAdmin is part of User type
        if (!isAdmin) {
          console.log("User is not an admin, redirecting");
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error verifying admin status:", error);
        // Continue anyway if the user's email is the main admin email
        if (user.email !== "dani_popa21@yahoo.ro") {
          navigate("/");
          return;
        }
      }

      // If we get here, user is an admin - continue loading admin content
      loadProducts();
    };

    const loadProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        if (productsList.length > 0) {
          setProducts(productsList);
        } else {
          setProducts(getMockProducts());
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(getMockProducts());
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, navigate]);

  // Helper function to get mock products
  const getMockProducts = (): Product[] => {
    return [
      {
        id: "1",
        name: "Carte Terapeutică",
        description: "Ghid practic pentru gestionarea anxietății și dezvoltarea rezilienței personale.",
        price: 59.99,
        image: "https://placehold.co/400x500",
        category: "books",
        inStock: true,
        featured: true,
        stock: 10, // Added stock property
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Set de Meditație",
        description: "Set complet pentru începerea practicii de meditație.",
        price: 149.99,
        image: "https://placehold.co/400x500",
        category: "wellness",
        inStock: true,
        stock: 5, // Added stock property
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Journal Terapeutic",
        description: "Journal structurat pentru reflecție personală.",
        price: 39.99,
        image: "https://placehold.co/400x500",
        category: "books",
        inStock: true,
        discount: 15,
        stock: 20, // Added stock property
        createdAt: new Date().toISOString()
      }
    ];
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Ești sigur că vrei să ștergi acest produs?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Eroare la ștergerea produsului.");
      }
    }
  };

  const handleToggleProductStock = async (id: string, currentInStock: boolean) => {
    try {
      await updateDoc(doc(db, "products", id), {
        inStock: !currentInStock
      });
      
      setProducts(products.map(product => 
        product.id === id 
          ? { ...product, inStock: !currentInStock }
          : product
      ));
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Eroare la actualizarea produsului.");
    }
  };

  const handleButtonAddProduct = () => {
    navigate("/admin/add-product");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă informațiile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <AdminNavigation />
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Gestionare Produse</h2>
          <Button onClick={handleButtonAddProduct}>Adaugă Produs Nou</Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-4 border-b text-left text-gray-700">Imagine</th>
                <th className="py-3 px-4 border-b text-left text-gray-700">Nume</th>
                <th className="py-3 px-4 border-b text-left text-gray-700">Preț</th>
                <th className="py-3 px-4 border-b text-left text-gray-700">Categorie</th>
                <th className="py-3 px-4 border-b text-left text-gray-700">Stoc</th>
                <th className="py-3 px-4 border-b text-left text-gray-700">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-gray-800">{product.name}</td>
                  <td className="py-3 px-4 border-b text-gray-800">
                    {product.discount 
                      ? <div>
                        <span className="line-through text-gray-500">{product.price !== undefined ? product.price.toFixed(2) : "0.00"} lei</span>
                        <span className="ml-2 text-red-600">
                          {product.price !== undefined && product.discount !== undefined 
                            ? (product.price * (1 - product.discount / 100)).toFixed(2) 
                            : "0.00"} lei
                        </span>
                      </div>
                      : <span>{product.price !== undefined ? product.price.toFixed(2) : "0.00"} lei</span>
                    }
                  </td>
                  <td className="py-3 px-4 border-b text-gray-800 capitalize">
                    {typeof product.category === "string" 
                      ? product.category 
                      : product.category?.name || "Diverse"}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "În Stoc" : "Indisponibil"}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      >
                        Editează
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => handleToggleProductStock(product.id, product.inStock)}
                      >
                        {product.inStock ? "Dezactivează" : "Activează"}
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
