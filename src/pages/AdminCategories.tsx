import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Category } from "../types";
import { useCategories } from "../hooks/useCategories"; // Updated import path

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    slug: "",
    description: "",
    order: 0
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Utilizăm contextul categoriilor pentru a avea acces la funcțiile utilitare
  const categoriesContext = useCategories();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Dacă nu există categorii în baza de date, folosim categoriile implicite din context
        setCategories(categoriesContext.categories);
      } else {
        const categoriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || "",
          slug: doc.data().slug || "",
          description: doc.data().description || "",
          imageUrl: doc.data().imageUrl || "",
          parentId: doc.data().parentId || undefined,
          order: doc.data().order || 0
        })) as Category[];

        setCategories(categoriesList);
      }
    } catch (err) {
      console.error("Eroare la încărcarea categoriilor:", err);
      setError("A apărut o eroare la încărcarea categoriilor.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: value
      });
    } else {
      // Generăm automat un slug din denumire dacă este completată denumirea
      if (name === "name" && !newCategory.slug && value) {
        const slug = value
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Elimină caracterele speciale
          .replace(/\s+/g, "-") // Înlocuiește spațiile cu '-'
          .replace(/-+/g, "-"); // Elimină '-' consecutive
          
        setNewCategory({
          ...newCategory,
          name: value,
          slug
        });
      } else {
        setNewCategory({
          ...newCategory,
          [name]: value
        });
      }
    }
  };

  const resetForm = () => {
    setNewCategory({
      name: "",
      slug: "",
      description: "",
      order: 0
    });
    setEditingCategory(null);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name || !newCategory.slug) {
      setError("Denumirea și slug-ul sunt obligatorii.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Verifică dacă slug-ul există deja
      const existingCategory = categories.find(cat => cat.slug === newCategory.slug);
      if (existingCategory) {
        setError("Acest slug există deja. Folosiți un slug unic.");
        setLoading(false);
        return;
      }
      
      // Adaugă categoria în Firestore
      const categoryRef = collection(db, "categories");
      const docRef = await addDoc(categoryRef, {
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description || "",
        imageUrl: newCategory.imageUrl || "",
        parentId: newCategory.parentId || null,
        order: newCategory.order || 0,
        createdAt: Timestamp.now()
      });
      
      // Adaugă categoria în starea locală
      const newCategoryWithId: Category = {
        id: docRef.id,
        name: newCategory.name || "",
        slug: newCategory.slug || "",
        description: newCategory.description || "",
        imageUrl: newCategory.imageUrl || "",
        parentId: newCategory.parentId,
        order: newCategory.order || 0
      };
      
      setCategories([...categories, newCategoryWithId]);
      setSuccess("Categoria a fost adăugată cu succes!");
      resetForm();
    } catch (err) {
      console.error("Eroare la adăugarea categoriei:", err);
      setError("A apărut o eroare la adăugarea categoriei.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !editingCategory.name || !editingCategory.slug) {
      setError("Denumirea și slug-ul sunt obligatorii.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Verifică dacă slug-ul există deja la altă categorie
      const existingCategory = categories.find(
        cat => cat.slug === editingCategory.slug && cat.id !== editingCategory.id
      );
      
      if (existingCategory) {
        setError("Acest slug există deja la altă categorie. Folosiți un slug unic.");
        setLoading(false);
        return;
      }
      
      // Actualizează categoria în Firestore
      const categoryRef = doc(db, "categories", editingCategory.id);
      await updateDoc(categoryRef, {
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || "",
        imageUrl: editingCategory.imageUrl || "",
        parentId: editingCategory.parentId || null,
        order: editingCategory.order || 0,
        updatedAt: Timestamp.now()
      });
      
      // Actualizează categoria în starea locală
      setCategories(categories.map(category => 
        category.id === editingCategory.id ? editingCategory : category
      ));
      
      setSuccess("Categoria a fost actualizată cu succes!");
      resetForm();
    } catch (err) {
      console.error("Eroare la actualizarea categoriei:", err);
      setError("A apărut o eroare la actualizarea categoriei.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți această categorie? Produsele asociate vor rămâne în baza de date, dar vor fi fără categorie.")) {
      try {
        setLoading(true);
        setError(null);
        
        // Șterge categoria din Firestore
        await deleteDoc(doc(db, "categories", categoryId));
        
        // Șterge categoria din starea locală
        setCategories(categories.filter(category => category.id !== categoryId));
        
        setSuccess("Categoria a fost ștearsă cu succes!");
      } catch (err) {
        console.error("Eroare la ștergerea categoriei:", err);
        setError("A apărut o eroare la ștergerea categoriei.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Gestionare Categorii</h2>
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p>{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Denumire Categorie*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editingCategory ? editingCategory.name : newCategory.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug Categorie* (URL-friendly)
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={editingCategory ? editingCategory.slug : newCategory.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug-ul va fi folosit în URL-uri. Exemplu: "produse-traditionale"
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descriere
            </label>
            <textarea
              id="description"
              name="description"
              value={editingCategory ? editingCategory.description : newCategory.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL Imagine
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={editingCategory ? editingCategory.imageUrl : newCategory.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Ordine Afișare
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={editingCategory ? editingCategory.order : newCategory.order}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Categoriile sunt afișate în ordine crescătoare. Categoriile cu valori mai mici apar primele.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Anulează
              </button>
            )}
            <button
              type="submit"
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                editingCategory 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading 
                ? "Se procesează..." 
                : editingCategory 
                  ? "Actualizează Categoria" 
                  : "Adaugă Categorie"
              }
            </button>
          </div>
        </form>
        
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Lista Categoriilor</h3>
        
        {loading && categories.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nu există categorii disponibile.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Denumire
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descriere
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordine
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        {category.imageUrl ? (
                          <img 
                            src={category.imageUrl} 
                            alt={category.name}
                            className="h-8 w-8 rounded object-cover mr-3" 
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-xs text-gray-500">No img</span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {category.description ? (
                        <span className="truncate max-w-xs block">{category.description}</span>
                      ) : (
                        <span className="text-gray-400 italic">Fără descriere</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {category.order || 0}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editează
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
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
        )}
      </div>
    </div>
  );
};

export default AdminCategories;