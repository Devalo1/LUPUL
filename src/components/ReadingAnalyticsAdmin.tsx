import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaUsers,
  FaChartLine,
  FaBookOpen,
  FaTrophy,
  FaCalendarAlt,
  FaDownload,
  FaSearch,
} from "react-icons/fa";
import {
  userBehaviorAnalytics,
  ReadingAnalytics,
  ReadingSession,
} from "../services/userBehaviorAnalytics";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import styles from "./ReadingAnalyticsAdmin.module.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReadingAnalyticsAdminProps {
  isAdmin: boolean;
}

const ReadingAnalyticsAdmin: React.FC<ReadingAnalyticsAdminProps> = ({
  isAdmin,
}) => {
  const [analytics, setAnalytics] = useState<ReadingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userSessions, setUserSessions] = useState<ReadingSession[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [_sortBy, _setSortBy] = useState<"time" | "engagement" | "completion">(
    "time"
  );

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await userBehaviorAnalytics.getReadingAnalytics(
        dateRange.startDate,
        dateRange.endDate
      );

      setAnalytics(data);
    } catch (err) {
      setError("Failed to load reading analytics");
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSessions = async (userId: string) => {
    try {
      const sessions = await userBehaviorAnalytics.getUserReadingSessions(
        userId,
        100
      );
      setUserSessions(sessions);
    } catch (err) {
      console.error("Error loading user sessions:", err);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const data = {
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: dateRange.startDate.toISOString(),
        end: dateRange.endDate.toISOString(),
      },
      summary: {
        totalUsers: analytics.totalUsers,
        totalReadingTime: analytics.totalReadingTime,
        averageSessionTime: analytics.averageSessionTime,
      },
      topArticles: analytics.topArticles,
      userEngagement: analytics.userEngagement,
      readingPatterns: analytics.readingPatterns,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reading-analytics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart data preparation
  const hourlyReadingData = {
    labels: Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}:00`
    ),
    datasets: [
      {
        label: "Sessions by Hour",
        data: Array.from(
          { length: 24 },
          (_, i) => analytics?.readingPatterns.hourly[i.toString()] || 0
        ),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dailyReadingData = {
    labels: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    datasets: [
      {
        label: "Sessions by Day",
        data: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => analytics?.readingPatterns.daily[day] || 0),
        backgroundColor: [
          "#3B82F6",
          "#8B5CF6",
          "#EF4444",
          "#F59E0B",
          "#10B981",
          "#6366F1",
          "#EC4899",
        ],
      },
    ],
  };

  const engagementData = {
    labels: ["High Engagement", "Moderate Engagement", "Low Engagement"],
    datasets: [
      {
        data: analytics
          ? [
              analytics.userEngagement.highlyEngaged,
              analytics.userEngagement.moderatelyEngaged,
              analytics.userEngagement.lowEngaged,
            ]
          : [0, 0, 0],
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      },
    ],
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <FaUsers className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You need administrator privileges to view reading analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <FaBookOpen className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500">
            No reading analytics data found for the selected period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaChartLine className="mr-3 text-blue-500" />
              Reading Behavior Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Detailed insights into user reading patterns and engagement
            </p>
          </div>
          <button
            onClick={exportAnalytics}
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Data
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Date Range:
            </label>
          </div>{" "}
          <input
            type="date"
            value={dateRange.startDate.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange((prev) => ({
                ...prev,
                startDate: new Date(e.target.value),
              }))
            }
            className="border rounded px-3 py-1 text-sm"
            title="Start Date"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange((prev) => ({
                ...prev,
                endDate: new Date(e.target.value),
              }))
            }
            className="border rounded px-3 py-1 text-sm"
            title="End Date"
          />
          <button
            onClick={loadAnalytics}
            className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Readers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaClock className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Reading Time
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(analytics.totalReadingTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaBookOpen className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Session Time
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(Math.round(analytics.averageSessionTime))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaTrophy className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                High Engagement
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.userEngagement.highlyEngaged}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Reading Pattern */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reading Activity by Hour
          </h3>{" "}
          <div className={styles.chartContainer}>
            <Line
              data={hourlyReadingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Daily Reading Pattern */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reading Activity by Day
          </h3>{" "}
          <div className={styles.chartContainer}>
            <Bar
              data={dailyReadingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Engagement Distribution and Top Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Engagement Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Engagement Levels
          </h3>{" "}
          <div className={styles.doughnutChartContainer}>
            <Doughnut
              data={engagementData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Top Articles */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Articles
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reads
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topArticles.slice(0, 10).map((article) => (
                  <tr key={article.articleId} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {article.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {article.totalReads}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {formatTime(Math.round(article.averageTime))}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          article.completionRate >= 80
                            ? "bg-green-100 text-green-800"
                            : article.completionRate >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {article.completionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Search and Sessions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            User Reading Sessions
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search user ID or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={() => {
                if (searchTerm) {
                  loadUserSessions(searchTerm);
                  setSelectedUser(searchTerm);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Load Sessions
            </button>
          </div>
        </div>

        {selectedUser && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing sessions for:{" "}
              <span className="font-medium">{selectedUser}</span>
            </p>
          </div>
        )}

        {userSessions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {session.articleTitle}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {session.startTime.toDate().toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {formatTime(session.totalTimeSpent)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {" "}
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-blue-600 h-2 rounded-full ${styles.progressBar}`}
                            style={{ width: `${session.readingProgress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {Math.round(session.readingProgress)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-900 capitalize">
                        {session.device}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.isCompleted
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {session.isCompleted ? "Completed" : "Partial"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingAnalyticsAdmin;
