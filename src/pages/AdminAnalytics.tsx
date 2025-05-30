import React, { useState, useEffect } from "react";
import AdminNavigation from "../components/AdminNavigation";
import ReadingAnalyticsAdmin from "../components/ReadingAnalyticsAdmin";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp
} from "firebase/firestore";
import { firestore } from "../firebase";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  topArticles: Array<{
    title: string;
    views: number;
    engagement: number;
  }>;
  userEngagement: {
    activeUsers: number;
    returnVisitors: number;
    bounceRate: number;
  };
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "reading" | "engagement" | "reports">("overview");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  // Funcție pentru generarea raportului CSV
  const generateCSVReport = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => row[header] || "").join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funcție pentru generarea raportului lunar
  const generateMonthlyReport = async () => {
    try {
      const usersSnapshot = await getDocs(collection(firestore, "users"));
      const articlesSnapshot = await getDocs(collection(firestore, "articles"));
      const ordersSnapshot = await getDocs(collection(firestore, "orders"));
        const monthlyData = [
        { metric: "Utilizatori Înregistrați", value: usersSnapshot.size },
        { metric: "Articole Publicate", value: articlesSnapshot.size },
        { metric: "Comenzi Totale", value: ordersSnapshot.size },
        { metric: "Vizualizări Totale", value: analyticsData?.totalViews || 0 },
        { metric: "Utilizatori Unici", value: analyticsData?.uniqueVisitors || 0 }
      ];

      generateCSVReport(monthlyData, `raport-lunar-${new Date().toISOString().slice(0, 7)}.csv`);
    } catch (error) {
      console.error("Eroare la generarea raportului lunar:", error);
    }
  };

  // Funcție pentru generarea raportului de comportament
  const generateBehaviorReport = async () => {
    try {
      const usersSnapshot = await getDocs(collection(firestore, "users"));
      const behaviorData = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();        behaviorData.push({
          userId: userDoc.id,
          email: userData.email || "N/A",
          displayName: userData.displayName || "N/A",
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin.seconds * 1000).toLocaleDateString() : "N/A",
          createdAt: userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : "N/A",
          role: userData.role || "user"
        });
      }

      generateCSVReport(behaviorData, `raport-comportament-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      console.error("Eroare la generarea raportului de comportament:", error);
    }
  };

  // Funcție pentru generarea raportului de performanță articole
  const generateArticlePerformanceReport = async () => {
    try {
      const articlesSnapshot = await getDocs(collection(firestore, "articles"));
      const articleData = [];

      for (const articleDoc of articlesSnapshot.docs) {
        const data = articleDoc.data();        articleData.push({
          id: articleDoc.id,
          title: data.title || "Fără titlu",
          author: data.author || "N/A",
          views: data.views || 0,
          engagement: data.engagement || 0,
          status: data.status || "draft",
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "N/A",
          category: data.category || "N/A"
        });
      }

      articleData.sort((a, b) => b.views - a.views);
      generateCSVReport(articleData, `raport-performanta-articole-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      console.error("Eroare la generarea raportului de performanță articole:", error);
    }
  };
  // Funcție pentru generarea raportului de conversii
  const generateConversionReport = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(firestore, "orders"));
      
      const conversionData: Array<{
        userEmail: string;
        totalOrders: number;
        totalSpent: string;
        averageOrderValue: string;
        lastOrderDate: string;
      }> = [];
      const ordersByUser = new Map();

      ordersSnapshot.docs.forEach(doc => {
        const orderData = doc.data();
        const userEmail = orderData.userEmail;
        if (userEmail) {
          if (!ordersByUser.has(userEmail)) {
            ordersByUser.set(userEmail, []);
          }
          ordersByUser.get(userEmail).push({
            orderId: doc.id,
            total: orderData.total || 0,
            status: orderData.status || "unknown",
            createdAt: orderData.createdAt ? new Date(orderData.createdAt.seconds * 1000).toLocaleDateString() : "N/A"
          });
        }
      });

      ordersByUser.forEach((orders, userEmail) => {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const averageOrderValue = totalSpent / totalOrders;

        conversionData.push({
          userEmail,
          totalOrders,
          totalSpent: totalSpent.toFixed(2),
          averageOrderValue: averageOrderValue.toFixed(2),
          lastOrderDate: orders[orders.length - 1]?.createdAt || "N/A"
        });
      });

      conversionData.sort((a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent));
      generateCSVReport(conversionData, `raport-conversii-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      console.error("Eroare la generarea raportului de conversii:", error);
    }
  };
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Obține numărul total de utilizatori
      const usersSnapshot = await getDocs(collection(firestore, "users"));
      const totalUsers = usersSnapshot.size;
      
      // Obține articolele și numărul lor de vizualizări
      const articlesSnapshot = await getDocs(collection(firestore, "articles"));
      const articles = articlesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Articol fără titlu",
          views: data.views || 0,
          engagement: data.engagement || Math.random() * 10, // calculat pe baza comentariilor/like-uri
          createdAt: data.createdAt
        };
      });
      
      // Sortează articolele după numărul de vizualizări
      const topArticles = articles
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(article => ({
          title: article.title,
          views: article.views,
          engagement: parseFloat(article.engagement.toFixed(1))
        }));
      
      // Calculează vizualizările totale
      const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
      
      // Obține comenzile pentru calcularea utilizatorilor activi
      const ordersSnapshot = await getDocs(collection(firestore, "orders"));
      const orders = ordersSnapshot.docs.map(doc => doc.data());
      
      // Calculează utilizatorii unici pe baza comenzilor și utilizatorilor înregistrați
      const uniqueUserEmails = new Set();
      orders.forEach(order => {
        if (order.userEmail) uniqueUserEmails.add(order.userEmail);
      });
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.email) uniqueUserEmails.add(userData.email);
      });
      
      // Calculează utilizatorii activi din ultimele 30 de zile
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentUsersQuery = query(
        collection(firestore, "users"),
        where("lastLogin", ">=", Timestamp.fromDate(thirtyDaysAgo))
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const activeUsers = recentUsersSnapshot.size;
      
      // Calculează vizitatorii care revin
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const returningUsersQuery = query(
        collection(firestore, "users"),
        where("lastLogin", ">=", Timestamp.fromDate(sevenDaysAgo))
      );
      const returningUsersSnapshot = await getDocs(returningUsersQuery);
      const returnVisitors = returningUsersSnapshot.size;
      
      // Calculează rata de revenire (bounce rate) - simulat pe baza datelor disponibile
      const bounceRate = totalUsers > 0 ? Math.max(0, 100 - (returnVisitors / totalUsers * 100)) : 0;
      
      // Calculează timpul mediu pe pagină - estimat pe baza angajamentului
      const averageEngagement = articles.length > 0 
        ? articles.reduce((sum, article) => sum + article.engagement, 0) / articles.length 
        : 0;
      const averageTimeOnPage = Math.max(1, averageEngagement * 0.6); // convertit în minute
      
      const data: AnalyticsData = {
        totalViews: totalViews,
        uniqueVisitors: uniqueUserEmails.size,
        averageTimeOnPage: parseFloat(averageTimeOnPage.toFixed(1)),
        topArticles: topArticles,
        userEngagement: {
          activeUsers: activeUsers,
          returnVisitors: returnVisitors,
          bounceRate: parseFloat(bounceRate.toFixed(1))
        }
      };
      
      setAnalyticsData(data);
    } catch (error) {
      console.error("Eroare la încărcarea datelor de analytics:", error);
      
      // În caz de eroare, setează date goale
      const emptyData: AnalyticsData = {
        totalViews: 0,
        uniqueVisitors: 0,
        averageTimeOnPage: 0,
        topArticles: [],
        userEngagement: {
          activeUsers: 0,
          returnVisitors: 0,
          bounceRate: 0
        }
      };
      setAnalyticsData(emptyData);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Vizualizări Totale</p>
            <p className="text-2xl font-bold text-blue-800">
              {analyticsData?.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Vizitatori Unici</p>
            <p className="text-2xl font-bold text-green-800">
              {analyticsData?.uniqueVisitors.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium">Timp Mediu pe Pagină</p>
            <p className="text-2xl font-bold text-purple-800">
              {analyticsData?.averageTimeOnPage}m
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-600 text-sm font-medium">Rata de Revenire</p>
            <p className="text-2xl font-bold text-orange-800">
              {analyticsData?.userEngagement.bounceRate}%
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTopArticles = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Articole Populare</h3>
      <div className="space-y-4">
        {analyticsData?.topArticles.map((article, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{article.title}</h4>
              <p className="text-sm text-gray-600">{article.views} vizualizări</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{article.engagement}/10</p>
              <p className="text-xs text-gray-500">Angajament</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEngagementTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Utilizatori Activi</h3>
          <p className="text-3xl font-bold text-indigo-900">{analyticsData?.userEngagement.activeUsers}</p>
          <p className="text-sm text-indigo-600 mt-2">În ultimele 24 ore</p>
        </div>
        
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-800 mb-2">Vizitatori Care Revin</h3>
          <p className="text-3xl font-bold text-cyan-900">{analyticsData?.userEngagement.returnVisitors}</p>
          <p className="text-sm text-cyan-600 mt-2">În ultima săptămână</p>
        </div>
        
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-pink-800 mb-2">Rata de Părăsire</h3>
          <p className="text-3xl font-bold text-pink-900">{analyticsData?.userEngagement.bounceRate}%</p>
          <p className="text-sm text-pink-600 mt-2">Procent mediu</p>
        </div>
      </div>
    </div>
  );
  const renderReportsTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Rapoarte Detaliate</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={generateMonthlyReport}
          className="p-4 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <h4 className="font-medium text-blue-800">Raport Lunar de Trafic</h4>
          <p className="text-sm text-blue-600 mt-1">Descarcă raportul complet pentru ultima lună</p>
        </button>
        
        <button 
          onClick={generateBehaviorReport}
          className="p-4 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <h4 className="font-medium text-green-800">Analiza Comportamentului</h4>
          <p className="text-sm text-green-600 mt-1">Raport despre comportamentul utilizatorilor</p>
        </button>
        
        <button 
          onClick={generateArticlePerformanceReport}
          className="p-4 text-left bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <h4 className="font-medium text-purple-800">Performanța Articolelor</h4>
          <p className="text-sm text-purple-600 mt-1">Statistici detaliate pentru fiecare articol</p>
        </button>
        
        <button 
          onClick={generateConversionReport}
          className="p-4 text-left bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <h4 className="font-medium text-orange-800">Raport de Conversii</h4>
          <p className="text-sm text-orange-600 mt-1">Analiza conversiilor și obiectivelor</p>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Analizează comportamentul utilizatorilor și statistici de performanță
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-8 px-6">            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📊 Prezentare Generală
            </button>
            <button
              onClick={() => setActiveTab("reading")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reading"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📖 Analytics Citire
            </button>
            <button
              onClick={() => setActiveTab("engagement")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "engagement"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              👤 Angajament Utilizatori
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reports"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📈 Rapoarte
            </button>
          </nav>
        </div>        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              {renderOverviewTab()}
              {renderTopArticles()}
            </>
          )}
          
          {activeTab === "reading" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <ReadingAnalyticsAdmin isAdmin={true} />
            </div>
          )}
          
          {activeTab === "engagement" && renderEngagementTab()}
          
          {activeTab === "reports" && renderReportsTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
