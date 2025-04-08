import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { functions } from '../firebase'; // Import Firebase functions from your firebase.ts
import { httpsCallable } from 'firebase/functions';

// URL-ul funcțional pentru apelare directă
const FUNCTION_URL = 'https://sendorderemail-gcqoxopcwq-uc.a.run.app';

const Checkout: React.FC = () => {
  const { items, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    paymentMethod: 'cash',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Funcție pentru apelare directă cu fetch API
  const submitOrderWithFetch = async () => {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...formData, items }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eroare răspuns server:', errorText);
      throw new Error(`Eroare server: ${response.status} - ${errorText}`);
    }

    return await response.json();
  };

  // Funcție pentru apelare cu Firebase SDK
  const submitOrderWithFirebase = async () => {
    const sendOrderEmail = httpsCallable(functions, 'sendOrderEmail');
    const result = await sendOrderEmail({ ...formData, items });
    return result.data as any;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      console.log('Inițierea trimiterii comenzii:', { ...formData, items });
      
      let result;
      
      // Prima încercare: folosim metoda directă fetch
      try {
        console.log('Încercare trimitere comandă prin fetch direct...');
        result = await submitOrderWithFetch();
        console.log('Comandă trimisă cu succes prin fetch!');
      } catch (fetchError) {
        console.warn('Eroare la trimiterea prin fetch:', fetchError);
        
        // A doua încercare: folosim Firebase SDK
        console.log('Încercare trimitere comandă prin Firebase SDK...');
        result = await submitOrderWithFirebase();
        console.log('Comandă trimisă cu succes prin Firebase SDK!');
      }
      
      console.log('Răspuns comandă:', result);
      
      // Obținem numărul comenzii din răspuns
      const orderNumber = result.orderNumber || 'N/A';
      
      clearCart();
      navigate('/checkout-success', { state: { orderNumber } });
    } catch (error: any) {
      console.error('Eroare completă la trimiterea comenzii:', error);
      
      let errorMessage = 'A apărut o eroare la procesarea comenzii. Te rugăm să încerci din nou.';
      
      // Încercăm să extragem mai multe detalii despre eroare
      if (error.message) {
        errorMessage += ` (Detalii: ${error.message})`;
      }
      
      if (error.code) {
        console.error(`Cod eroare Firebase: ${error.code}`);
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizează comanda</h1>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-8 max-w-lg mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block font-semibold mb-2">Nume complet</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block font-semibold mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="address" className="block font-semibold mb-2">Adresă</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block font-semibold mb-2">Telefon</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="paymentMethod" className="block font-semibold mb-2">Metoda de plată</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white"
          >
            <option value="cash">Ramburs</option>
            <option value="card" disabled>Card (momentan indisponibil)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-md transition-colors`}
        >
          {isSubmitting ? 'Se procesează...' : 'Trimite comanda'}
        </button>
        
        {isSubmitting && (
          <p className="text-center text-sm mt-2 text-blue-300">
            Procesăm comanda ta, te rugăm să aștepți...
          </p>
        )}
      </form>
    </div>
  );
};

export default Checkout;
