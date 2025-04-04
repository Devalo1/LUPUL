import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
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
      description: 'Set complet pentru începerea practicii de meditație: pernă, lumânări aromaterapeutice și ghid audio.',
      price: 149.99,
      image: 'https://placehold.co/400x500',
      category: 'wellness',
      inStock: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Journal Terapeutic',
      description: 'Journal structurat pentru reflecție personală și monitorizarea progresului emoțional.',
      price: 39.99,
      image: 'https://placehold.co/400x500',
      category: 'books',
      inStock: true,
      discount: 15,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Esențe pentru Difuzor',
      description: 'Set de uleiuri esențiale pentru difuzor: lavandă, eucalipt, lemongrass și portocală dulce.',
      price: 89.99,
      image: 'https://placehold.co/400x500',
      category: 'wellness',
      inStock: true,
      discount: 10,
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Atelier de Mindfulness (Digital)',
      description: 'Program digital de 8 săptămâni pentru practica mindfulness, cu exerciții ghidate și materiale PDF.',
      price: 129.99,
      image: 'https://placehold.co/400x500',
      category: 'courses',
      inStock: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Pernă de Meditație',
      description: 'Pernă confortabilă pentru meditație, umplută cu hrișcă organică și husă detașabilă.',
      price: 79.99,
      image: 'https://placehold.co/400x500',
      category: 'wellness',
      inStock: false,
      createdAt: new Date().toISOString()
    }
  ]), []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try to fetch from Firestore
        const productsCollection = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        
        if (!productsSnapshot.empty) {
          const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Product));
          setProducts(productsData);
        } else {
          // Use mock data if no products in Firestore
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [mockProducts]);

  useEffect(() => {
    // Filter products based on selected category and search query
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category);
    return ['all', ...new Set(categories)];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Magazin</h1>
        
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <input
              type="text"
              placeholder="Caută produse..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="md:w-2/3 flex flex-wrap gap-2">
            {getUniqueCategories().map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === 'all' 
                  ? 'Toate produsele' 
                  : category === 'books' 
                    ? 'Cărți' 
                    : category === 'wellness' 
                      ? 'Wellness' 
                      : category === 'courses' 
                        ? 'Cursuri' 
                        : category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nu s-au găsit produse care să îndeplinească criteriile de căutare.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                </Link>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.id}`} className="text-lg font-semibold hover:text-blue-600 transition-colors">
                      {product.name}
                    </Link>
                    
                    {product.discount && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      {product.discount ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">
                            {formatCurrency(calculateDiscountedPrice(product.price, product.discount))}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-blue-600">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className={`px-3 py-1 text-sm ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {product.inStock ? 'Adaugă în coș' : 'Stoc epuizat'}
                    </Button>
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
