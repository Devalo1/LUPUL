import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  FaShoppingBag,
  FaCalendarAlt,
  FaReceipt,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBox,
  FaArrowLeft,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  items: OrderItem[];
  totalAmount?: number;
  total?: number;
  status: string;
  createdAt?: any;
  orderDate?: any;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  paymentMethod?: string;
}

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const userOrders: Order[] = [];

        for (const orderDoc of querySnapshot.docs) {
          const orderData = orderDoc.data() as Order;

          const orderWithProducts: Order = {
            ...orderData,
            id: orderDoc.id,
            items: await Promise.all(
              orderData.items.map(async (item: any) => {
                try {
                  const productDoc = await getDoc(doc(db, "products", item.id));
                  return {
                    ...item,
                    productDetails: productDoc.exists()
                      ? productDoc.data()
                      : null,
                  };
                } catch (err) {
                  console.error(
                    `Error fetching product details for ${item.id}:`,
                    err
                  );
                  return item;
                }
              })
            ),
          };

          userOrders.push(orderWithProducts);
        }

        // Sortează comenzile după dată (cele mai recente primul)
        userOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : a.orderDate
              ? new Date(a.orderDate)
              : new Date(0);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : b.orderDate
              ? new Date(b.orderDate)
              : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(userOrders);
      } catch (err) {
        console.error("Eroare la încărcarea comenzilor:", err);
        setError("A apărut o eroare la încărcarea comenzilor.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "confirmed":
      case "processing":
        return <FaBox className="text-blue-500" />;
      case "shipped":
        return <FaTruck className="text-purple-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaReceipt className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "Nouă";
      case "confirmed":
        return "Confirmată";
      case "processing":
        return "În procesare";
      case "shipped":
        return "Expediată";
      case "delivered":
        return "Livrată";
      case "cancelled":
        return "Anulată";
      case "pending":
        return "În așteptare";
      default:
        return status || "Finalizată";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (createdAt: any, orderDate: any) => {
    if (createdAt?.toDate) {
      return createdAt.toDate().toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
    if (orderDate) {
      return new Date(orderDate).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
    return "Data necunoscută";
  };

  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)} RON`;
  };

  // Funcția de filtrare comenzi
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    const orderNumber = order.orderNumber || order.id.substring(0, 8);

    return (
      orderNumber.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchLower))
    );
  });

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Se încarcă comenzile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Înapoi la Dashboard"
                aria-label="Înapoi la Dashboard"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaShoppingBag className="mr-3 text-blue-600" />
                  Comenzile Tale
                </h1>
                <p className="text-gray-600 mt-1">
                  Aici poți vedea toate comenzile tale și statusul lor
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {filteredOrders.length}
              </p>
              <p className="text-sm text-gray-500">
                {filteredOrders.length === 1 ? "comandă" : "comenzi"}
                {searchTerm.trim() ? " găsită" : " în total"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Search Bar */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md p-4 mb-6"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Caută după numărul comenzii sau produs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  title="Șterge căutarea"
                  aria-label="Șterge căutarea"
                >
                  <FaTimes className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-600">
                {filteredOrders.length} rezultate pentru "{searchTerm}"
              </p>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!error && filteredOrders.length === 0 && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <FaShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nu ai încă nicio comandă
            </h2>
            <p className="text-gray-600 mb-6">
              Explorează magazinul nostru și fă prima ta comandă!
            </p>
            <button
              onClick={() => navigate("/magazin")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explorează Magazinul
            </button>
          </motion.div>
        )}

        {/* No Search Results */}
        {!error && filteredOrders.length === 0 && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nu s-au găsit rezultate
            </h2>
            <p className="text-gray-600 mb-4">
              Nu am găsit comenzi care să corespundă căutării "{searchTerm}"
            </p>
            <button
              onClick={clearSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Șterge filtrul
            </button>
          </motion.div>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FaReceipt className="text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Comanda #
                          {order.orderNumber || order.id.substring(0, 8)}
                        </h3>
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-2">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {formatDate(order.createdAt, order.orderDate)}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(
                          order.totalAmount ||
                            order.total ||
                            order.items.reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={`${item.id}-${itemIndex}`}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={
                              item.image || "/images/product-placeholder.jpg"
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Cantitate: {item.quantity}</span>
                            <span>×</span>
                            <span>{formatPrice(item.price)}</span>
                            <span>=</span>
                            <span className="font-semibold text-blue-600">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {order.items.length === 1
                          ? "1 produs"
                          : `${order.items.length} produse`}
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        Total:{" "}
                        {formatPrice(
                          order.totalAmount ||
                            order.total ||
                            order.items.reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Înapoi la Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrders;
