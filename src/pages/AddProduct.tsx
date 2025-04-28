import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  details?: string;
  category?: string;
}

const AddProduct: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductList, setShowProductList] = useState(false);
  
  // Form state
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    image: "",
    inStock: true,
    details: "",
    category: ""
  });

  // Load existing products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsList);
      } catch (err: any) {
        console.error("Eroare la încărcarea produselor:", err);
        setError(err.message || "A apărut o eroare la încărcarea produselor");
      }
    };
    
    fetchProducts();
  }, [success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox specifically
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setNewProduct(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) : value
      }));
    }
  };

  const addCustomProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!newProduct.name || !newProduct.description || newProduct.price <= 0) {
        throw new Error("Te rugăm să completezi toate câmpurile obligatorii (nume, descriere, preț)");
      }
      
      const productsRef = collection(db, "products");
      
      const productData = {
        ...newProduct,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(productsRef, productData);
      
      setSuccess(true);
      console.log("Produs adăugat cu succes!");
      
      // Reset form
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        image: "",
        inStock: true,
        details: "",
        category: ""
      });
      
      // Refresh products list if shown
      if (showProductList) {
        const snapshot = await getDocs(productsRef);
        const updatedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(updatedProducts);
      }
      
    } catch (err: any) {
      console.error("Eroare la adăugarea produsului:", err);
      setError(err.message || "A apărut o eroare la adăugarea produsului");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest produs?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "products", id));
      // Update products list
      setProducts(products.filter(product => product.id !== id));
      console.log("Produs șters cu succes!");
    } catch (err: any) {
      console.error("Eroare la ștergerea produsului:", err);
      setError(err.message || "A apărut o eroare la ștergerea produsului");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductStock = async (id: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, "products", id), {
        inStock: !currentStatus
      });
      
      // Update products list
      setProducts(products.map(product => 
        product.id === id ? {...product, inStock: !currentStatus} : product
      ));
      
      console.log("Statul produsului a fost actualizat cu succes!");
    } catch (err: any) {
      console.error("Eroare la actualizarea stocului:", err);
      setError(err.message || "A apărut o eroare la actualizarea stocului");
    } finally {
      setIsLoading(false);
    }
  };

  // Template product function
  const addDulceataProduct = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const productsRef = collection(db, "products");
      
      const productData = {
        name: "Dulceață de Afine",
        description: "Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual, fierbere lentă și dragoste pentru detalii.",
        price: 20,
        image: "/images/AdobeStock_370191089.jpeg",
        inStock: true,
        details: "Cantitate: Borcan de 250g\nIngrediente: Afine proaspete, zahăr natural, un strop de lămâie (pentru aciditate echilibrată)\nProducție: Handmade, local, cu grijă pentru tradiție\nBeneficii: Fără aditivi, gust natural și autentic",
        category: "Dulceață",
        createdAt: new Date().toISOString()
      };
      
      await addDoc(productsRef, productData);
      
      setSuccess(true);
      console.log("Produs adăugat cu succes!");
      
      // Refresh products list if shown
      if (showProductList) {
        const snapshot = await getDocs(productsRef);
        const updatedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(updatedProducts);
      }
    } catch (err: any) {
      console.error("Eroare la adăugarea produsului:", err);
      setError(err.message || "A apărut o eroare la adăugarea produsului");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Management Produse</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add New Product Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adaugă Produs Nou</h2>
          
          <form onSubmit={addCustomProduct}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nume Produs*
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={newProduct.name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numele produsului"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                Preț (lei)*
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={newProduct.price}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Preț"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Categorie
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={newProduct.category}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Categorie"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Descriere*
              </label>
              <textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descriere produs"
                rows={3}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="details">
                Detalii Suplimentare
              </label>
              <textarea
                id="details"
                name="details"
                value={newProduct.details}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detalii suplimentare despre produs"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                URL Imagine
              </label>
              <input
                id="image"
                name="image"
                type="text"
                value={newProduct.image}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/images/nume-imagine.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemplu: /images/nume-imagine.jpg (imaginile trebuie să fie în folderul public/images)
              </p>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  id="inStock"
                  name="inStock"
                  type="checkbox"
                  checked={newProduct.inStock}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700 text-sm font-bold">Disponibil în stoc</span>
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Se procesează..." : "Adaugă Produs"}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              Produsul a fost adăugat cu succes!
            </div>
          )}
        </div>
        
        {/* Quick Add Dulceata Product */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adaugă Produs Rapid</h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Dulceață de Afine</h3>
            <p className="text-gray-800"><strong>Preț:</strong> 20 lei</p>
            <p className="mt-2 text-gray-800">
              <strong>Descriere:</strong> Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual, fierbere lentă și dragoste pentru detalii.
            </p>
            <p className="text-gray-800"><strong>Categorie:</strong> Dulceață</p>
            <p className="text-gray-800"><strong>În stoc:</strong> Da</p>
          </div>
          
          <button
            onClick={addDulceataProduct}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Se procesează..." : "Adaugă Dulceață de Afine"}
          </button>
          
          <div className="mt-8">
            <button
              onClick={() => setShowProductList(!showProductList)}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              {showProductList ? "Ascunde produsele" : "Arată toate produsele"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Products List */}
      {showProductList && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Produse Existente</h2>
          
          {products.length === 0 ? (
            <p className="text-gray-600">Nu există produse în baza de date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Nume</th>
                    <th className="py-3 px-6 text-left">Categorie</th>
                    <th className="py-3 px-6 text-right">Preț</th>
                    <th className="py-3 px-6 text-center">Stoc</th>
                    <th className="py-3 px-6 text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image && (
                            <div className="mr-2">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-full"
                              />
                            </div>
                          )}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        {product.category || "-"}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {product.price} lei
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => toggleProductStock(product.id!, product.inStock)}
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.inStock 
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.inStock ? "Disponibil" : "Indisponibil"}
                        </button>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <Link 
                            to={`/product/${product.id}`}
                            className="w-6 h-6 text-blue-600 hover:text-blue-900"
                            title="Vezi produsul"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id!)}
                            className="w-6 h-6 text-red-600 hover:text-red-900"
                            title="Șterge produsul"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddProduct;
