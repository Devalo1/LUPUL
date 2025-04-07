import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Checkout: React.FC = () => {
  const { items, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '', // Adăugăm câmp pentru e-mail
    paymentMethod: 'cash',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Submitting order:', { ...formData, items });

      // URL-ul complet și corect pentru funcția Firebase
      const response = await fetch('http://127.0.0.1:5002/lupulcorbul/us-central1/sendOrderEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, items }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        const orderNumber = responseData.orderNumber;
        console.log('Order sent successfully with number:', orderNumber);
        
        clearCart();
        // Transmitem numărul comenzii către pagina de succes prin state navigation
        navigate('/checkout-success', { state: { orderNumber } });
      } else {
        const errorText = await response.text();
        console.error('Failed to send order:', errorText);
        setError('A apărut o problemă la trimiterea comenzii. Te rugăm să încerci din nou.');
      }
    } catch (error) {
      console.error('Error sending order:', error);
      setError('A apărut o eroare de rețea. Te rugăm să verifici conexiunea și să încerci din nou.');
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Trimite comanda
        </button>
      </form>
    </div>
  );
};

export default Checkout;
