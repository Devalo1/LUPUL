import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>({
    name: "",
    description: "",
    price: 0,
    image: "",
    inStock: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          setError("ID-ul produsului lipsește.");
          return;
        }

        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            name: data.name || "Produs fără nume",
            description: data.description || "Descrierea produsului nu este disponibilă.",
            price: typeof data.price === "number" ? data.price : 0,
            image: data.image || "/images/default-product.jpg",
            inStock: typeof data.inStock === "boolean" ? data.inStock : true,
          });
        } else {
          setError("Produsul nu a fost găsit.");
        }
      } catch (err) {
        console.error("Eroare la încărcarea produsului:", err);
        setError("A apărut o eroare la încărcarea produsului.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      if (!id) {
        setError("ID-ul produsului lipsește.");
        return;
      }

      const updatedProduct = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price),
        image: product.image.trim(),
        inStock: product.inStock === true || product.inStock === "true",
        updatedAt: new Date().toISOString(),
      };

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, updatedProduct);

      setSuccess(true);
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err: any) {
      console.error("Eroare la actualizarea produsului:", err);
      if (err.code === "permission-denied") {
        setError("Nu ai permisiunea de a actualiza acest produs.");
      } else {
        setError(`A apărut o eroare la actualizarea produsului: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă produsul...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editează Produsul</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          Produsul a fost actualizat cu succes! Vei fi redirecționat în curând.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Nume</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Descriere</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Preț</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">URL Imagine</label>
          <input
            type="text"
            name="image"
            value={product.image}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">În Stoc</label>
          <select
            name="inStock"
            value={product.inStock ? "true" : "false"}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Da</option>
            <option value="false">Nu</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Salvează
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Anulează
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
