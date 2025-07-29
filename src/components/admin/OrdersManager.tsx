import React, { useState, useEffect } from "react";
import {
  getAllOrders,
  getOrdersByStatus,
  updateOrderStatus,
  SavedOrder,
} from "../../services/orderService";
import { formatDistance } from "date-fns";
import { ro } from "date-fns/locale";

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<SavedOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");

  const statusOptions = [
    { value: "all", label: "Toate comenzile", color: "gray" },
    { value: "new", label: "Noi", color: "blue" },
    { value: "confirmed", label: "Confirmate", color: "green" },
    { value: "processing", label: "În procesare", color: "yellow" },
    { value: "shipped", label: "Expediate", color: "purple" },
    { value: "delivered", label: "Livrate", color: "green" },
    { value: "cancelled", label: "Anulate", color: "red" },
  ];

  const paymentStatusColors = {
    paid: "text-green-600 bg-green-100",
    pending: "text-yellow-600 bg-yellow-100",
    failed: "text-red-600 bg-red-100",
    cancelled: "text-gray-600 bg-gray-100",
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let loadedOrders;
      if (selectedStatus === "all") {
        loadedOrders = await getAllOrders();
      } else {
        loadedOrders = await getOrdersByStatus(selectedStatus);
      }
      setOrders(loadedOrders);
    } catch (error) {
      console.error("❌ Eroare la încărcarea comenzilor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus(selectedOrder.id!, newStatus, adminNotes);

      // Actualizează lista de comenzi
      await loadOrders();

      // Resetează selecția
      setSelectedOrder(null);
      setNewStatus("");
      setAdminNotes("");

      alert("Status actualizat cu succes!");
    } catch (error) {
      console.error("❌ Eroare la actualizarea statusului:", error);
      alert("Eroare la actualizarea statusului!");
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} RON`;

  const formatDate = (
    timestamp: { seconds: number; nanoseconds: number } | Date | null
  ): string => {
    if (!timestamp) return "Data necunoscută";

    try {
      let date: Date;

      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "object" && "seconds" in timestamp) {
        // Firestore timestamp
        date = new Date(timestamp.seconds * 1000);
      } else {
        return "Data necunoscută";
      }

      return formatDistance(date, new Date(), {
        addSuffix: true,
        locale: ro,
      });
    } catch (error) {
      return "Data invalidă";
    }
  };

  const getStatusColor = (status: string) => {
    const statusInfo = statusOptions.find((s) => s.value === status);
    return statusInfo?.color || "gray";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Se încarcă comenzile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          📦 Gestionare Comenzi ({orders.length})
        </h2>

        {/* Filtru după status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          aria-label="Filtrează comenzile după status"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nu sunt comenzi pentru filtrul selectat.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-semibold text-lg">
                      #{order.orderNumber}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}
                    >
                      {statusOptions.find((s) => s.value === order.status)
                        ?.label || order.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}`}
                    >
                      {order.paymentStatus === "paid"
                        ? "Plătit"
                        : order.paymentStatus === "pending"
                          ? "În așteptare"
                          : order.paymentStatus === "failed"
                            ? "Eșuat"
                            : "Anulat"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Client:</strong> {order.customerName}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.customerEmail}
                      </p>
                      <p>
                        <strong>Telefon:</strong> {order.customerPhone}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Adresă:</strong> {order.customerAddress}
                      </p>
                      <p>
                        <strong>Oraș:</strong> {order.customerCity},{" "}
                        {order.customerCounty}
                      </p>
                      <p>
                        <strong>Plată:</strong>{" "}
                        {order.paymentMethod === "card"
                          ? "Card bancar"
                          : "Ramburs"}
                      </p>
                      <p>
                        <strong>Data:</strong> {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-1">Produse:</p>
                      <div className="text-sm space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span>
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.adminNotes && (
                    <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                      <p className="text-sm">
                        <strong>Note admin:</strong> {order.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setNewStatus(order.status);
                    setAdminNotes(order.adminNotes || "");
                  }}
                  className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Editează
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal pentru editarea statusului */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Editează comanda #{selectedOrder.orderNumber}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Selectează statusul comenzii"
                >
                  {statusOptions.slice(1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Note admin:
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Adaugă note despre comandă..."
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={handleStatusUpdate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Salvează
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setNewStatus("");
                  setAdminNotes("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
