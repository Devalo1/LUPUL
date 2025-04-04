import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContextUtils';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Define order type
interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const Orders: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // This would typically be a fetch from your backend
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Simulate fetching orders
        // In a real app, replace with actual API call
        setTimeout(() => {
          // Dummy data for demonstration
          const dummyOrders: Order[] = [
            {
              id: '1001',
              date: '2023-05-15',
              status: 'delivered',
              total: 125.99,
              items: [
                { id: 'p1', name: 'Carte de terapie', quantity: 1, price: 45.99 },
                { id: 'p2', name: 'Set meditație', quantity: 1, price: 80.00 }
              ]
            },
            {
              id: '1002',
              date: '2023-06-20',
              status: 'processing',
              total: 75.50,
              items: [
                { id: 'p3', name: 'Ulei esențial', quantity: 2, price: 37.75 }
              ]
            }
          ];
          
          setOrders(dummyOrders);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('A apărut o eroare la încărcarea comenzilor.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex justify-center items-center">
        <LoadingSpinner text="Se încarcă comenzile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-red-500 text-xl mb-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          A apărut o eroare
        </div>
        <p className="text-gray-600">Nu am putut încărca comenzile. Vă rugăm să încercați din nou mai târziu.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Reîncărcați pagina
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Comenzile mele</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Nu ai încă nicio comandă.</p>
            <button 
              onClick={() => navigate('/magazin')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Explorează magazinul
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">Comanda #{order.id}</h2>
                      <p className="text-sm text-gray-600">Plasată pe {formatDate(order.date)}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                        {order.status === 'pending' && 'În așteptare'}
                        {order.status === 'processing' && 'În procesare'}
                        {order.status === 'shipped' && 'Expediată'}
                        {order.status === 'delivered' && 'Livrată'}
                        {order.status === 'cancelled' && 'Anulată'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="divide-y">
                    {order.items.map(item => (
                      <div key={item.id} className="py-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Cantitate: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{item.price.toFixed(2)} RON</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">Total</p>
                    <p className="font-bold text-lg">{order.total.toFixed(2)} RON</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
