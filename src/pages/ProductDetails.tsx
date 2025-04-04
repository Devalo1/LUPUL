import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext'; // Updated path
import Button from '../components/common/Button';
import { formatCurrency, calculateDiscountedPrice } from '../utils/helpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
      
      // Show a success notification
      alert(`${product.name} a fost adăugat în coș!`);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Se încarcă produsul..." />;
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
        {/* Product Image */}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-auto object-cover"
          />
        </div>
        
        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          
          {/* Price Section */}
          <div className="mb-4">
            {product.discount ? (
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(calculateDiscountedPrice(product.price, product.discount))}
                </span>
                <span className="ml-2 text-sm line-through text-gray-500">
                  {formatCurrency(product.price)}
                </span>
                <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                  -{product.discount}%
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* In Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                În stoc
              </span>
            ) : (
              <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
                Stoc epuizat
              </span>
            )}
          </div>
          
          {/* Quantity Input */}
          {product.inStock && (
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-3 text-gray-700">
                Cantitate:
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 border border-gray-300 rounded px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="mt-auto"
          >
            Adaugă în coș
          </Button>
          
          {/* Back to Shop */}
          <button 
            onClick={() => navigate('/shop')}
            className="mt-4 text-blue-600 hover:underline text-center"
          >
            Înapoi la produse
          </button>
        </div>
      </div>
      
      {/* Additional Product Information (if available) */}
      {product.details && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Detalii produs</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700">{product.details}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
