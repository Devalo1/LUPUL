import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../services/Index';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import Button from '../components/common/Button';
import { formatCurrency, calculateDiscountedPrice } from '../utils/helpers';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { addItem } = useCart();

  // Mock data for demo purposes
  const mockProducts: Product[] = useMemo(() => ([
    {
      id: '1',
      name: 'Dulceață de Afine',
      description: 'Dulceață artizanală din afine culese manual din Munții Carpați.',
      price: 20.00,
      image: 'https://placehold.co/400x500?text=Dulceata+de+Afine',
      category: 'food',
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Carte Terapeutică',
      description: 'Ghid practic pentru gestionarea anxietății și dezvoltarea rezilienței personale.',
      price: 59.99,
      image: 'https://placehold.co/400x500?text=Carte+Terapeutica',
      category: 'books',
      inStock: true,
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Set de Meditație',
      description: 'Set complet pentru începerea practicii de meditație: pernă, lumânări aromaterapeutice și ghid audio.',
      price: 149.99,
      image: 'https://placehold.co/400x500?text=Set+Meditatie',
      category: 'wellness',
      inStock: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Journal Terapeutic',
      description: 'Journal structurat pentru reflecție personală și monitorizarea progresului emoțional.',
      price: 39.99,
      image: 'https://placehold.co/400x500?text=Journal',
      category: 'books',
      inStock: true,
      discount: 15,
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Esențe pentru Difuzor',
      description: 'Set de uleiuri esențiale pentru difuzor: lavandă, eucalipt, lemongrass și portocală dulce.',
      price: 89.99,
      image: 'https://placehold.co/400x500?text=Uleiuri+Esentiale',
      category: 'wellness',
      inStock: true,
      discount: 10,
      createdAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Atelier de Mindfulness (Digital)',
      description: 'Program digital de 8 săptămâni pentru practica mindfulness, cu exerciții ghidate și materiale PDF.',
      price: 129.99,
      image: 'https://placehold.co/400x500?text=Mindfulness',
      category: 'courses',
      inStock: true,
      createdAt: new Date().toISOString()
    }
  ]), []);

  // Fetch products from Firebase or use mock data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Try to fetch from Firebase
        const productsCollection = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        
        if (!productsSnapshot.empty) {
          const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
          
          setProducts(productsData);
        } else {
          // Use mock data if no products in Firebase
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Use mock data in case of error
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [mockProducts]);

  // Filter products based on category and search query
  useEffect(() => {
    let result = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery]);

  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    const price = product.discount 
      ? calculateDiscountedPrice(product.price, product.discount)
      : product.price;
      
    addItem({
      id: product.id,
      name: product.name,
      price,
      image: product.image,
      quantity: 1
    });
    
    // Show success message
    alert(`${product.name} a fost adăugat în coș!`);
  };

  // Categories for filter
  const categories = useMemo(() => {
    const allCategories = [...new Set(products.map(product => product.category))];
    return ['all', ...allCategories];
  }, [products]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Se încarcă produsele...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center mb-10">Magazin</h1>
        
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Caută produse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Filtrează:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Toate' : 
                   category === 'books' ? 'Cărți' : 
                   category === 'wellness' ? 'Wellness' : 
                   category === 'courses' ? 'Cursuri' :
                   category === 'food' ? 'Alimente' : 
                   category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">Nu a fost găsit niciun produs care să corespundă criteriilor de căutare.</p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Resetează filtrele
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Product Image with Link */}
                <Link to={`/products/${product.id}`} className="block">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-64 object-cover"
                  />
                </Link>
                
                {/* Product Content */}
                <div className="p-4">
                  {/* Title with Link */}
                  <Link to={`/products/${product.id}`} className="block">
                    <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h2>
                  </Link>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Price and Discount */}
                  <div className="mb-4">
                    {product.discount ? (
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(calculateDiscountedPrice(product.price, product.discount))}
                        </span>
                        <span className="ml-2 text-sm line-through text-gray-500">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                          -{product.discount}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  <div className="mb-4">
                    {product.inStock ? (
                      <span className="text-green-600 text-sm">În stoc</span>
                    ) : (
                      <span className="text-red-600 text-sm">Stoc epuizat</span>
                    )}
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="flex-1"
                    >
                      Adaugă în coș
                    </Button>
                    
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <Button
                        variant="secondary"
                        className="w-full"
                      >
                        Detalii
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
