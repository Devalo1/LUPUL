import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  paymentMethod: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  orderDate: any;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  trackingNumber?: string;
  userId?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let ordersQuery;
      
      if (filter === "all") {
        ordersQuery = query(collection(db, "orders"), orderBy("orderDate", "desc"));
      } else {
        ordersQuery = query(
          collection(db, "orders"),
          where("status", "==", filter),
          orderBy("orderDate", "desc")
        );
      }
      
      const snapshot = await getDocs(ordersQuery);
      
      if (snapshot.empty) {
        setOrders([]);
      } else {
        const ordersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        
        setOrders(ordersList);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("A apărut o eroare la încărcarea comenzilor.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Data necunoscută";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "Format invalid";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON"
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      "pending": "În așteptare",
      "processing": "În procesare",
      "shipped": "Expediat",
      "delivered": "Livrat",
      "cancelled": "Anulat"
    };
    
    return statusMap[status] || status;
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      const orderRef = doc(db, "orders", selectedOrder.id);
      
      await updateDoc(orderRef, {
        status: newStatus,
        trackingNumber: trackingNumber.trim() || selectedOrder.trackingNumber || "",
        notes: notes.trim() || selectedOrder.notes || "",
        updatedAt: Timestamp.now()
      });
      
      // Update the local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? {
              ...order,
              status: newStatus as any,
              trackingNumber: trackingNumber.trim() || order.trackingNumber,
              notes: notes.trim() || order.notes
            } 
          : order
      ));
      
      setIsUpdateModalOpen(false);
      setSelectedOrder(null);
      alert("Comanda a fost actualizată cu succes!");
    } catch (err) {
      console.error("Error updating order:", err);
      alert("A apărut o eroare la actualizarea comenzii.");
    }
  };

  const handleOpenUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || "");
    setNotes(order.notes || "");
    setIsUpdateModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.name.toLowerCase().includes(searchLower) ||
      order.email.toLowerCase().includes(searchLower) ||
      order.phone.toLowerCase().includes(searchLower) ||
      order.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h1 className="text-2xl font-bold mb-6">Gestionare Comenzi</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-3 md:space-y-0">
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter("all")} 
              className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              Toate comenzile
            </button>
            <button 
              onClick={() => setFilter("pending")} 
              className={`px-4 py-2 rounded-md ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              În așteptare
            </button>
            <button 
              onClick={() => setFilter("processing")} 
              className={`px-4 py-2 rounded-md ${filter === "processing" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              În procesare
            </button>
            <button 
              onClick={() => setFilter("shipped")} 
              className={`px-4 py-2 rounded-md ${filter === "shipped" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              Expediate
            </button>
          </div>
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Caută după nume, email, telefon..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nu s-au găsit comenzi pentru filtrele selectate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Comandă</th>
                  <th className="py-3 px-4 text-left">Client</th>
                  <th className="py-3 px-4 text-left">Data</th>
                  <th className="py-3 px-4 text-left">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">#{order.id.slice(0, 8)}</div>
                      <div className="text-xs text-gray-500">
                        {order.items.length} produs(e)
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">{order.name}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusBadgeClass(order.status)}`}>
                        {getStatusDisplayName(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenUpdateModal(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Actualizează
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal pentru actualizarea statusului comenzii */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Actualizare Comandă #{selectedOrder.id.slice(0, 8)}</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Client: {selectedOrder.name}</p>
              <p className="text-sm text-gray-600">Email: {selectedOrder.email}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Comandă</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">În așteptare</option>
                <option value="processing">În procesare</option>
                <option value="shipped">Expediat</option>
                <option value="delivered">Livrat</option>
                <option value="cancelled">Anulat</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Număr AWB (opțional)</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="Introduceți numărul AWB"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (opțional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Adăugați note despre comandă"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Anulează
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;