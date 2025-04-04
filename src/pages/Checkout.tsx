import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import GuestCheckout, { GuestData } from '../components/checkout/GuestCheckout';
import { formatCurrency } from '../utils/helpers';
import Button from '../components/common/Button';

const Checkout: React.FC = () => {
  const { currentUser, allowGuestCheckout } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: currentUser?.email || '',
    agreeToTerms: false,
    paymentMethod: 'cash'
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

  // Check if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items, navigate, orderComplete]);

  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: '/checkout' } });
  };

  // Handle guest checkout
  const handleGuestCheckout = () => {
    setShowGuestForm(true);
  };

  // Handle guest data submit
  const handleGuestDataSubmit = (guestData: GuestData) => {
    setFormData({
      fullName: `${guestData.firstName} ${guestData.lastName}`,
      address: guestData.address,
      city: guestData.city,
      postalCode: guestData.zipCode,
      phone: guestData.phone,
      email: guestData.email,
      agreeToTerms: false,
      paymentMethod: 'cash'
    });
    setShowGuestForm(false);
    setFormValid(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: inputValue
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {
      fullName: !formData.fullName ? 'Numele este obligatoriu' : '',
      address: !formData.address ? 'Adresa este obligatorie' : '',
      city: !formData.city ? 'Orașul este obligatoriu' : '',
      postalCode: '',
      phone: !formData.phone ? 'Telefonul este obligatoriu' : '',
      email: !formData.email ? 'Email-ul este obligatoriu' : 
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email) ? 'Email invalid' : '',
      agreeToTerms: !formData.agreeToTerms ? 'Trebuie să fiți de acord cu termenii și condițiile' : ''
    };
    
    setErrors(newErrors);
    
    // Check if form is valid
    const isValid = Object.values(newErrors).every(error => error === '');
    setFormValid(isValid);
    
    return isValid;
  }, [formData]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Here you would implement your order submission logic
      // For demo purposes, we just simulate a successful order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart and set order complete
      clearCart();
      setOrderComplete(true);
      
      // Redirect to order success page
      navigate('/order-success');
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // If showing guest form
  if (showGuestForm) {
    return (
      <div className="container mx-auto py-8 px-4">
        <GuestCheckout 
          onContinue={handleGuestDataSubmit} 
          onCancel={() => setShowGuestForm(false)} 
        />
      </div>
    );
  }
  
  // If no user and guest checkout not allowed
  if (!currentUser && !allowGuestCheckout) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Autentificare necesară</h1>
          <p className="mb-6">
            Pentru a continua cu finalizarea comenzii, te rugăm să te autentifici sau să îți creezi un cont.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleLoginRedirect} className="flex-1">
              Autentificare
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/register')} 
              className="flex-1"
            >
              Creează cont
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // No user but guest checkout allowed
  if (!currentUser && !formValid) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          <p className="mb-4 text-gray-600">
            Pentru a finaliza comanda, trebuie sa completezi datele de livrare.
            Utilizatorii neautentificați nu pot lăsa comentarii sau face check‑in la evenimente până când nu adaugă informații.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleLoginRedirect} className="flex-1">
              Autentificare
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleGuestCheckout} 
              className="flex-1"
            >
              Continuă fără cont
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizare comandă</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Detalii livrare</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nume complet *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Adresa *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Oraș *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Cod poștal</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Telefon *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Metodă de plată *</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="cash">Plată la livrare</option>
                  <option value="bank_transfer">Transfer bancar</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className={`mr-2 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                  />
                  <span>Sunt de acord cu <a href="/terms" className="text-blue-600 hover:underline">termenii și condițiile</a> *</span>
                </label>
                {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Se procesează...' : 'Finalizează comanda'}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Sumar comandă</h2>
            
            <div className="border-b pb-4 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between mb-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-1">x{item.quantity}</span>
                  </div>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total:</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>* Prețurile includ TVA</p>
              <p className="mt-2">* Livrarea se face prin curier în termen de 2-5 zile lucrătoare</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
