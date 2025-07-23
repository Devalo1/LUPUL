import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import { Product } from "../types";

import { MAIN_ADMIN_EMAIL } from "../utils/userRoles";
import AdminTools from "../components/admin/AdminTools";
import { AdminService } from "../services/adminService";

/**
 * Pagina principală de administrare
 * Această pagină combină funcționalitățile din Admin și AdminPage pentru o experiență unificată
 */
const Admin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate("/login", { state: { from: "/admin" } });
        return;
      }

      try {
        if (user.email === MAIN_ADMIN_EMAIL) {
          setIsAdmin(true);
          await AdminService.verificaSiCorecteazaAdminPrincipal();
        } else {
          const isAdmin = await AdminService.verificaRolAdmin(user.email || "");
          setIsAdmin(isAdmin);
        }
      } catch (error) {
        console.error("Eroare la verificarea statutului de admin:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }

      if (!checkingAdmin && isAdmin) {
        loadProducts();
      }
    };

    const loadProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

    if (!loading) {
      checkAdminStatus();
    } else {
      checkAdminStatus();
    }
  }, [user, navigate, checkingAdmin, isAdmin]);

  const getMockProducts = (): Product[] => {
    return [
      {
        id: "1",
        name: "Carte Terapeutică",
        description:
          "Ghid practic pentru gestionarea anxietății și dezvoltarea rezilienței personale.",
        price: 59.99,
        image: "https://placehold.co/400x500",
        category: "books",
        inStock: true,
        featured: true,
        stock: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Set de Meditație",
        description: "Set complet pentru începerea practicii de meditație.",
        price: 149.99,
        image: "https://placehold.co/400x500",
        category: "wellness",
        inStock: true,
        stock: 5,
        createdAt: new Date().toISOString(),
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
        stock: 20,
        createdAt: new Date().toISOString(),
      },
    ];
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Ești sigur că vrei să ștergi acest produs?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Eroare la ștergerea produsului.");
      }
    }
  };

  const handleToggleProductStock = async (
    id: string,
    currentInStock: boolean
  ) => {
    try {
      await updateDoc(doc(db, "products", id), {
        inStock: !currentInStock,
      });

      setProducts(
        products.map((product) =>
          product.id === id ? { ...product, inStock: !currentInStock } : product
        )
      );
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Eroare la actualizarea produsului.");
    }
  };

  const handleButtonAddProduct = () => {
    navigate("/admin/add-product");
  };

  if (loading || checkingAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading">Se încarcă...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h2 className="text-lg font-semibold mb-2">Acces restricționat</h2>
          <p>Nu aveți permisiunea de a accesa această pagină.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Panou de administrare
            </h1>
            <div className="text-sm text-gray-600">
              Utilizator:{" "}
              <span className="font-medium">
                {user?.displayName || user?.email}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-blue-800 mb-2">Produse</h3>
              <p className="text-sm mb-4">
                Gestionează produsele, categoriile și stocurile.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/add-product"
                  className="text-blue-600 hover:underline text-sm"
                >
                  ➕ Adaugă produs nou
                </a>
                <a
                  href="/admin/categories"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🏷️ Gestionează categorii
                </a>
                <a
                  href="/admin/inventory"
                  className="text-blue-600 hover:underline text-sm"
                >
                  📦 Gestionează stocuri
                </a>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-green-800 mb-2">Evenimente</h3>
              <p className="text-sm mb-4">
                Gestionează evenimentele și programările.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/add-event"
                  className="text-green-600 hover:underline text-sm"
                >
                  ➕ Adaugă eveniment nou
                </a>
                <a
                  href="/admin/appointments"
                  className="text-green-600 hover:underline text-sm"
                >
                  📅 Gestionează programări
                </a>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-purple-800 mb-2">Utilizatori</h3>
              <p className="text-sm mb-4">
                Gestionează conturile utilizatorilor.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/users"
                  className="text-purple-600 hover:underline text-sm"
                >
                  👥 Gestionează utilizatori
                </a>
                <a
                  href="/admin/make-admin"
                  className="text-purple-600 hover:underline text-sm"
                >
                  🔑 Permisiuni admin
                </a>
              </div>
            </div>
          </div>

          <AdminTools />

          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Gestionare Produse
              </h2>
              <Button onClick={handleButtonAddProduct}>
                Adaugă Produs Nou
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-3 px-4 border-b text-left text-gray-700">
                      Imagine
                    </th>
                    <th className="py-3 px-4 border-b text-left text-gray-700">
                      Nume
                    </th>
                    <th className="py-3 px-4 border-b text-left text-gray-700">
                      Preț
                    </th>
                    <th className="py-3 px-4 border-b text-left text-gray-700">
                      Categorie
                    </th>
                    <th className="py-3 px-4 border-b text-left text-gray-700">
                      Stoc
                    </th>
                    <th className="py-3 px-4 border-b text-left text-gray-700">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-3 px-4 border-b text-gray-800">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-800">
                        {product.discount ? (
                          <div>
                            <span className="line-through text-gray-500">
                              {product.price !== undefined
                                ? product.price.toFixed(2)
                                : "0.00"}{" "}
                              lei
                            </span>
                            <span className="ml-2 text-red-600">
                              {product.price !== undefined &&
                              product.discount !== undefined
                                ? (
                                    product.price *
                                    (1 - product.discount / 100)
                                  ).toFixed(2)
                                : "0.00"}{" "}
                              lei
                            </span>
                          </div>
                        ) : (
                          <span>
                            {product.price !== undefined
                              ? product.price.toFixed(2)
                              : "0.00"}{" "}
                            lei
                          </span>
                        )}
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
                            onClick={() =>
                              navigate(`/admin/edit-product/${product.id}`)
                            }
                          >
                            Editează
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() =>
                              handleToggleProductStock(
                                product.id,
                                product.inStock
                              )
                            }
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
      </div>
    </div>
  );
};

export default Admin;
