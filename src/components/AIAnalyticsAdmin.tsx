import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";

interface AIUsageData {
  totalSessions: number;
  activeUsers: number;
  averageSessionDuration: number;
  mostUsedFeatures: Array<{
    feature: string;
    usage: number;
  }>;
  therapyStats: {
    totalTherapySessions: number;
    averageSessionLength: number;
    completionRate: number;
  };
  aiInteractions: {
    totalMessages: number;
    averageResponseTime: number;
    userSatisfaction: number;
  };
}

interface AIAnalyticsAdminProps {
  isAdmin: boolean;
}

const AIAnalyticsAdmin: React.FC<AIAnalyticsAdminProps> = ({ isAdmin }) => {
  const [aiData, setAiData] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    if (isAdmin) {
      fetchAIAnalytics();
    }
  }, [isAdmin, timeRange]);

  const fetchAIAnalytics = async () => {
    setLoading(true);
    try {
      // Note: Date range filtering will be implemented when AI tracking is added

      // Fetch AI session data (you'll need to implement AI session tracking)
      const aiSessionsSnapshot = await getDocs(
        collection(firestore, "aiSessions")
      );
      const therapySessionsSnapshot = await getDocs(
        collection(firestore, "therapySessions")
      );
      const aiInteractionsSnapshot = await getDocs(
        collection(firestore, "aiInteractions")
      );

      // Process the data
      const sessions = aiSessionsSnapshot.docs.map((doc) => doc.data());
      const therapySessions = therapySessionsSnapshot.docs.map((doc) =>
        doc.data()
      );
      const interactions = aiInteractionsSnapshot.docs.map((doc) => doc.data());

      // Calculate statistics
      const totalSessions = sessions.length;
      const activeUsers = new Set(sessions.map((s) => s.userId)).size;
      const averageSessionDuration =
        sessions.reduce((acc, s) => acc + (s.duration || 0), 0) /
          sessions.length || 0;

      // Calculate therapy stats
      const totalTherapySessions = therapySessions.length;
      const averageSessionLength =
        therapySessions.reduce((acc, s) => acc + (s.duration || 0), 0) /
          therapySessions.length || 0;
      const completedSessions = therapySessions.filter(
        (s) => s.status === "completed"
      ).length;
      const completionRate =
        (completedSessions / totalTherapySessions) * 100 || 0;

      // Calculate AI interaction stats
      const totalMessages = interactions.length;
      const averageResponseTime =
        interactions.reduce((acc, i) => acc + (i.responseTime || 0), 0) /
          interactions.length || 0;
      const satisfactionRatings = interactions
        .filter((i) => i.satisfaction)
        .map((i) => i.satisfaction);
      const userSatisfaction =
        satisfactionRatings.reduce((acc, r) => acc + r, 0) /
          satisfactionRatings.length || 0;

      // Most used features (mock data for now)
      const mostUsedFeatures = [
        {
          feature: "Terapie Psihică",
          usage: Math.floor(totalTherapySessions * 0.6),
        },
        { feature: "Chat AI", usage: Math.floor(totalMessages * 0.4) },
        {
          feature: "Analiză Sentiment",
          usage: Math.floor(totalSessions * 0.3),
        },
        { feature: "Recomandări", usage: Math.floor(totalSessions * 0.2) },
      ];

      setAiData({
        totalSessions,
        activeUsers,
        averageSessionDuration: Math.round(averageSessionDuration),
        mostUsedFeatures,
        therapyStats: {
          totalTherapySessions,
          averageSessionLength: Math.round(averageSessionLength),
          completionRate: Math.round(completionRate),
        },
        aiInteractions: {
          totalMessages,
          averageResponseTime: Math.round(averageResponseTime),
          userSatisfaction: Math.round(userSatisfaction * 10) / 10,
        },
      });
    } catch (error) {
      console.error("Error fetching AI analytics:", error);
      // Set default data if collections don't exist yet
      setAiData({
        totalSessions: 0,
        activeUsers: 0,
        averageSessionDuration: 0,
        mostUsedFeatures: [],
        therapyStats: {
          totalTherapySessions: 0,
          averageSessionLength: 0,
          completionRate: 0,
        },
        aiInteractions: {
          totalMessages: 0,
          averageResponseTime: 0,
          userSatisfaction: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Acces interzis. Doar administratorii pot vedea aceste statistici.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Se încarcă statisticile AI...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Statistici AI și Terapie
        </h3>{" "}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "7d" | "30d" | "90d")}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          title="Selectează intervalul de timp pentru statistici"
        >
          <option value="7d">Ultimele 7 zile</option>
          <option value="30d">Ultimele 30 zile</option>
          <option value="90d">Ultimele 90 zile</option>
        </select>
      </div>

      {/* AI Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                Sesiuni AI Totale
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {aiData?.totalSessions.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Utilizatori Activi AI
              </p>
              <p className="text-2xl font-bold text-green-800">
                {aiData?.activeUsers.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                Sesiuni Terapie
              </p>
              <p className="text-2xl font-bold text-purple-800">
                {aiData?.therapyStats.totalTherapySessions.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">
                Rata de Finalizare
              </p>
              <p className="text-2xl font-bold text-orange-800">
                {aiData?.therapyStats.completionRate}%
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Funcții AI Cele Mai Utilizate
          </h4>
          <div className="space-y-3">
            {aiData?.mostUsedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {feature.feature}
                </span>
                <div className="flex items-center space-x-2">
                  {" "}
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">{feature.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Performanța AI
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Durata Medie Sesiune AI
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {aiData?.averageSessionDuration}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Durata Medie Terapie
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {aiData?.therapyStats.averageSessionLength}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Total Mesaje AI
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {aiData?.aiInteractions.totalMessages}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Timp Răspuns Mediu
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {aiData?.aiInteractions.averageResponseTime}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Satisfacție Utilizatori
              </span>
              <span className="text-sm text-gray-900 font-semibold">
                {aiData?.aiInteractions.userSatisfaction}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Trends Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Tendințe Utilizare AI
        </h4>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-500">
              Graficul de tendințe va fi implementat în curând
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsAdmin;
