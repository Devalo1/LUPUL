import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import { Product } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await productApi.getById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Here you would implement your cart functionality
    // For now, we'll just show an alert
    alert(`Added ${quantity} of ${product?.title} to cart!`);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error || 'Product not found'}</p>
          <button 
            className="mt-2 text-blue-600 underline"
            onClick={() => navigate('/products')}
          >
            Return to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className="w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x400?text=Product+Image';
            }}
          />
        </div>
        
        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-2xl text-blue-600 font-bold mb-6">${product.price.toFixed(2)}</p>
          
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>
          
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="quantity" className="text-gray-700">Quantity:</label>
              <select 
                id="quantity" 
                value={quantity} 
                onChange={handleQuantityChange}
                className="w-20 p-2 border border-gray-300 rounded"
              >
                {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button 
              onClick={handleAddToCart} 
              disabled={product.stock === 0}
              size="lg"
            >
              Add to Cart
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/products')}
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
