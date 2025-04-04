import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import Button from '../components/common/Button';
import { formatCurrency, calculateDiscountedPrice } from '../utils/helpers';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const docRef = doc(firestore, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          setError('Produsul nu a fost găsit.');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('A apărut o eroare la încărcarea produsului.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.discount 
          ? calculateDiscountedPrice(product.price, product.discount) 
          : product.price,
        image: product.image,
        quantity
      });
      
      // Optionally navigate to cart or show confirmation
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă produsul...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error || 'Produsul nu există.'}</div>
          <Button onClick={() => navigate('/shop')}>Înapoi la magazin</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="mb-4">
            {product.discount ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateDiscountedPrice(product.price, product.discount))}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="bg-red-600 text-white text-sm px-2 py-1 rounded">
                  -{product.discount}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{product.description}</p>
            
            <div className="flex items-center mb-2">
              <span className="text-gray-700 mr-2">Categorie:</span>
              <span className="capitalize">{product.category}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Disponibilitate:</span>
              <span 
                className={`px-2 py-1 rounded-full text-xs ${
                  product.inStock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.inStock ? 'În Stoc' : 'Indisponibil'}
              </span>
            </div>
          </div>
          
          {product.inStock && (
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-gray-700 mb-2">Cantitate:</label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  onClick={handleAddToCart}
                  className="ml-4"
                >
                  Adaugă în coș
                </Button>
              </div>
            </div>
          )}
          
          <Button 
            onClick={() => navigate('/shop')}
            variant="secondary"
          >
            Înapoi la magazin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
