import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/debug';

const Checkout: React.FC = () => {
  const { currentUser } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: currentUser?.email || '',
    agreeToTerms: false
  });
  
  // Form errors
  const [errors, setErrors] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    agreeToTerms: ''
  });

  // Validate form on changes
  const validateForm = useCallback(() => {
    const newErrors = { ...errors };
    let isValid = true;

    // Validate fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Numele complet este obligatoriu';
      isValid = false;
    } else {
      newErrors.fullName = '';
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Adresa este obligatorie';
      isValid = false;
    } else if (formData.address.length < 10) {
      newErrors.address = 'Adresa trebuie să fie mai detaliată';
      isValid = false;
    } else {
      newErrors.address = '';
    }

    // Validate city
    if (!formData.city.trim()) {
      newErrors.city = 'Orașul este obligatoriu';
      isValid = false;
    } else {
      newErrors.city = '';
    }

    // Validate postal code (optional, but if provided must be valid)
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Codul poștal trebuie să conțină 6 cifre';
      isValid = false;
    } else {
      newErrors.postalCode = '';
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Numărul de telefon este obligatoriu';
      isValid = false;
    } else if (!/^(07\d{8})$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numărul de telefon trebuie să fie valid (format: 07XXXXXXXX)';
      isValid = false;
    } else {
      newErrors.phone = '';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email-ul trebuie să fie valid';
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Trebuie să fiți de acord cu termenii și condițiile';
      isValid = false;
    } else {
      newErrors.agreeToTerms = '';
    }

    setErrors(newErrors);
    setFormValid(isValid);
    return isValid;
  }, [formData, errors]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Log checkout attempt
      logger.info('Checkout initiated', { 
        data: { 
          items: items.length,
          total: getTotal() 
        } 
      });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Order successful
      setOrderComplete(true);
      clearCart();
      
      // After showing success message, redirect to confirmation
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items, navigate, orderComplete]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-lg">Procesăm comanda dvs...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4">Comandă plasată cu succes!</h2>
          <p className="text-gray-600 mb-6">Vă mulțumim pentru comandă. Veți primi un email de confirmare în curând.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizare comandă</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Delivery Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Informații livrare</h2>
            
            <form onSubmit={handleSubmitOrder}>
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700 mb-2">Nume complet *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">Adresă *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                ></textarea>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="city" className="block text-gray-700 mb-2">Oraș *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="postalCode" className="block text-gray-700 mb-2">Cod poștal</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-2">Telefon *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 mr-2"
                  />
                  <span className={`text-sm ${errors.agreeToTerms ? 'text-red-500' : 'text-gray-600'}`}>
                    Sunt de acord cu termenii și condițiile site-ului, inclusiv politica de confidențialitate și procesarea datelor mele personale *
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
              </div>
              
              <button
                type="submit"
                disabled={!formValid || loading}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Plasează comanda
              </button>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Rezumat comandă</h2>
            
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Cantitate: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{(item.price * item.quantity).toFixed(2)} RON</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between mb-2">
                <p>Subtotal</p>
                <p>{getTotal().toFixed(2)} RON</p>
              </div>
              <div className="flex justify-between mb-2">
                <p>Livrare</p>
                <p>15.00 RON</p>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <p>Total</p>
                <p>{(getTotal() + 15).toFixed(2)} RON</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
