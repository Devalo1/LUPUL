import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { firestore } from "../../firebase";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { FaBell, FaFileInvoiceDollar, FaExchangeAlt, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

interface Notification {
  id: string;
  type: "invoice" | "transaction" | "alert" | "info";
  message: string;
  date: Timestamp;
  read: boolean;
  link?: string;
  priority: "high" | "medium" | "low";
}

const AccountingNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // În implementarea reală, am interoga colecția de notificări din Firestore
      // Pentru acest exemplu, vom returna date statice
      
      // Simulare colecție de notificări - în realitate ar trebui să folosim Firestore
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "invoice",
          message: "Factură restantă #INV-2023-042 - termen depășit cu 5 zile",
          date: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60)),
          read: false,
          link: "/admin/accounting/invoices/INV-2023-042",
          priority: "high"
        },
        {
          id: "2",
          type: "transaction",
          message: "Plată nouă înregistrată: 4,500 RON de la Client XYZ",
          date: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 4)),
          read: false,
          link: "/admin/accounting/transactions",
          priority: "medium"
        },
        {
          id: "3",
          type: "alert",
          message: "Trebuie să declarați TVA-ul pentru luna anterioară până mâine",
          date: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)),
          read: true,
          priority: "high"
        },
        {
          id: "4",
          type: "info",
          message: "3 facturi noi au fost create azi",
          date: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 8)),
          read: true,
          link: "/admin/accounting/invoices",
          priority: "low"
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Eroare la încărcarea notificărilor:", error);
      // În caz de eroare, afișăm o listă goală
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: Timestamp): string => {
    const now = new Date();
    const date = timestamp.toDate();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `acum ${diffInMinutes} ${diffInMinutes === 1 ? "minut" : "minute"}`;
    } else if (diffInHours < 24) {
      return `acum ${diffInHours} ${diffInHours === 1 ? "oră" : "ore"}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `acum ${diffInDays} ${diffInDays === 1 ? "zi" : "zile"}`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FaFileInvoiceDollar className="text-blue-500" />;
      case "transaction":
        return <FaExchangeAlt className="text-green-500" />;
      case "alert":
        return <FaExclamationTriangle className="text-red-500" />;
      case "info":
        return <FaCheckCircle className="text-gray-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-500";
      case "medium":
        return "border-l-4 border-yellow-500";
      case "low":
        return "border-l-4 border-blue-500";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nu aveți notificări noi
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`${getPriorityClass(notification.priority)} bg-white p-3 rounded-md shadow-sm ${!notification.read ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? "font-medium" : "text-gray-700"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.date)}
                    </p>
                  </div>
                </div>
                
                {notification.link && (
                  <div className="mt-2 text-right">
                    <Link 
                      to={notification.link}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Detalii
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          <div className="mt-4 text-center">
            <Link 
              to="/admin/accounting/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Vezi toate notificările
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountingNotifications;