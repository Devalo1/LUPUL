import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { Product } from '../types';

const Admin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and admin
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // In a real app, you'd have an admin check here
    // For example: if (!currentUser.isAdmin) navigate('/');

    // Move mockProducts inside the effect
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Carte Terapeutică',
        description: 'Ghid practic pentru gestionarea anxietății și dezvoltarea rezilienței personale.',
        price: 59.99,
        image: 'https://placehold.co/400x500',
        category: 'books',
        inStock: true,
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Set de Meditație',
        description: 'Set complet pentru începerea practicii de meditație.',
        price: 149.99,
        image: 'https://placehold.co/400x500',
        category: 'wellness',
        inStock: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Journal Terapeutic',
        description: 'Journal structurat pentru reflecție personală.',
        price: 39.99,
        image: 'https://placehold.co/400x500',
        category: 'books',
        inStock: true,
        discount: 15,
        createdAt: new Date().toISOString()
      }
    ];

    const fetchProducts = async () => {
      try {
        // Try to fetch from Firestore
        const productsCollection = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        if (productsList.length > 0) {
          setProducts(productsList);
        } else {
          // Use mock data if no products in Firestore
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fall back to mock data
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentUser, navigate]);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest produs?')) {
      try {
        await deleteDoc(doc(firestore, 'products', id));
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Eroare la ștergerea produsului.');
      }
    }
  };

  const handleToggleProductStock = async (id: string, currentInStock: boolean) => {
    try {
      await updateDoc(doc(firestore, 'products', id), {
        inStock: !currentInStock
      });
      
      setProducts(products.map(product => 
        product.id === id 
          ? { ...product, inStock: !currentInStock }
          : product
      ));
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Eroare la actualizarea produsului.');
    }
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
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('products')}
          >
            Produse
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            Comenzi
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            Utilizatori
          </button>
        </nav>
      </div>
      
      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Gestionare Produse</h2>
            <Button>Adaugă Produs Nou</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border-b text-left">Imagine</th>
                  <th className="py-3 px-4 border-b text-left">Nume</th>
                  <th className="py-3 px-4 border-b text-left">Preț</th>
                  <th className="py-3 px-4 border-b text-left">Categorie</th>
                  <th className="py-3 px-4 border-b text-left">Stoc</th>
                  <th className="py-3 px-4 border-b text-left">Acțiuni</th>
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
                    <td className="py-3 px-4 border-b">{product.name}</td>
                    <td className="py-3 px-4 border-b">
                      {product.discount 
                        ? <div>
                          <span className="line-through text-gray-500">{product.price.toFixed(2)} lei</span>
                          <span className="ml-2 text-red-600">
                            {(product.price * (1 - product.discount / 100)).toFixed(2)} lei
                          </span>
                        </div>
                        : <span>{product.price.toFixed(2)} lei</span>
                      }
                    </td>
                    <td className="py-3 px-4 border-b capitalize">{product.category}</td>
                    <td className="py-3 px-4 border-b">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.inStock ? 'În Stoc' : 'Indisponibil'}
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
                          {product.inStock ? 'Dezactivează' : 'Activează'}
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
      )}
      
      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Gestionare Comenzi</h2>
          <p className="text-gray-600">Nu există comenzi disponibile momentan.</p>
        </div>
      )}
      
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Gestionare Utilizatori</h2>
          <p className="text-gray-600">Nu există utilizatori disponibili momentan.</p>
        </div>
      )}
    </div>
  );
};

export default Admin;
