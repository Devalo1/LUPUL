import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaClock,
  FaBookOpen,
  FaChartLine,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaTrophy,
} from "react-icons/fa";
import {
  userBehaviorAnalytics,
  UserReadingProfile,
} from "../services/userBehaviorAnalytics";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  lastLoginAt?: string;
  isActive?: boolean;
}

interface UserProfileWithData extends UserReadingProfile {
  user: User;
  readingStats: {
    avgTimePerSession: number;
    favoriteReadingTime: string;
    mostReadCategory: string;
    streakDays: number;
  };
}

const UserProfilesAdmin: React.FC = () => {
  const [users, setUsers] = useState<UserProfileWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<
    "all" | "active" | "engaged" | "new"
  >("all");
  const [sortBy, setSortBy] = useState<
    "name" | "activity" | "engagement" | "time"
  >("activity");
  const [selectedUser, setSelectedUser] = useState<UserProfileWithData | null>(
    null
  );
  // Helper function to convert Timestamp to Date
  const timestampToDate = (
    timestamp: Timestamp | Date | undefined | null
  ): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    return null;
  };

  useEffect(() => {
    loadUserProfiles();
  }, []);

  const loadUserProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from Firestore
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userData: User[] = [];

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        userData.push({
          uid: doc.id,
          email: data.email || "",
          displayName: data.displayName || data.name || "",
          createdAt: data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toISOString()
            : "",
          lastLoginAt: data.lastLoginAt
            ? new Date(data.lastLoginAt.seconds * 1000).toISOString()
            : "",
          isActive: data.isActive !== false,
        });
      });

      // Fetch reading profiles for each user
      const userProfiles: UserProfileWithData[] = [];

      for (const user of userData) {
        try {
          const profile = await userBehaviorAnalytics.getUserReadingProfile(
            user.uid
          );

          if (profile) {
            const readingStats = {
              avgTimePerSession: profile.averageReadingTime,
              favoriteReadingTime: profile.preferredReadingTimes[0] || "N/A",
              mostReadCategory: profile.topCategories[0] || "N/A",
              streakDays: Math.floor(profile.engagementScore / 10), // Simple calculation
            };

            userProfiles.push({
              ...profile,
              user,
              readingStats,
            });
          } else {
            // Create empty profile for users without reading data
            userProfiles.push({
              userId: user.uid,
              totalReadingTime: 0,
              articlesRead: 0,
              averageReadingTime: 0,
              completionRate: 0,
              preferredReadingTimes: [],
              topCategories: [],
              engagementScore: 0,
              lastActivity: Timestamp.now(),
              readingSessions: [],
              user,
              readingStats: {
                avgTimePerSession: 0,
                favoriteReadingTime: "N/A",
                mostReadCategory: "N/A",
                streakDays: 0,
              },
            });
          }
        } catch (profileError) {
          console.error(
            `Error loading profile for user ${user.uid}:`,
            profileError
          );
        }
      }

      setUsers(userProfiles);
    } catch (error) {
      console.error("Error loading user profiles:", error);
      setError("Failed to load user profiles");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      // Search filter
      const matchesSearch =
        user.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.user.displayName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      if (!matchesSearch) return false; // Category filter
      switch (filterBy) {
        case "active":
          const lastActivityDate = timestampToDate(user.lastActivity);
          return (
            lastActivityDate &&
            Date.now() - lastActivityDate.getTime() < 7 * 24 * 60 * 60 * 1000
          ); // Last 7 days
        case "engaged":
          return user.engagementScore > 50;
        case "new":
          return (
            user.user.createdAt &&
            Date.now() - new Date(user.user.createdAt).getTime() <
              30 * 24 * 60 * 60 * 1000
          ); // Last 30 days
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.user.displayName || a.user.email).localeCompare(
            b.user.displayName || b.user.email
          );
        case "activity":
          const aDate = timestampToDate(a.lastActivity);
          const bDate = timestampToDate(b.lastActivity);
          return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
        case "engagement":
          return b.engagementScore - a.engagementScore;
        case "time":
          return b.totalReadingTime - a.totalReadingTime;
        default:
          return 0;
      }
    });

  const exportUserData = () => {
    const data = filteredAndSortedUsers.map((user) => ({
      email: user.user.email,
      name: user.user.displayName,
      totalReadingTime: user.totalReadingTime,
      articlesRead: user.articlesRead,
      engagementScore: user.engagementScore,
      completionRate: user.completionRate,
      lastActivity: user.lastActivity,
      favoriteCategories: user.topCategories,
      readingPatterns: user.preferredReadingTimes,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-profiles-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80)
      return {
        level: "Foarte Activ",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (score >= 50)
      return { level: "Activ", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (score >= 20)
      return {
        level: "Moderat",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return { level: "Inactiv", color: "text-gray-600", bgColor: "bg-gray-100" };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadUserProfiles}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaUser className="mr-3 text-blue-600" />
              Profiluri Utilizatori
            </h1>
            <p className="text-gray-600 mt-1">
              Analizează comportamentul și preferințele utilizatorilor
            </p>
          </div>

          <button
            onClick={exportUserData}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaDownload />
            Export Date
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Caută utilizatori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>{" "}
          {/* Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filtrează utilizatorii"
              aria-label="Filtrează utilizatorii"
            >
              <option value="all">Toți utilizatorii</option>
              <option value="active">Activi (7 zile)</option>
              <option value="engaged">Angajați (50+ scor)</option>
              <option value="new">Noi (30 zile)</option>
            </select>
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sortează:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Sortează utilizatorii"
              aria-label="Sortează utilizatorii"
            >
              <option value="activity">Activitate</option>
              <option value="name">Nume</option>
              <option value="engagement">Angajament</option>
              <option value="time">Timp citire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Utilizatori
              </p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <FaUser className="h-8 w-8 text-blue-600" />
          </div>
        </div>{" "}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Utilizatori Activi
              </p>
              <p className="text-2xl font-bold text-green-600">
                {
                  users.filter((u) => {
                    const lastActivityDate = timestampToDate(u.lastActivity);
                    return (
                      lastActivityDate &&
                      Date.now() - lastActivityDate.getTime() <
                        7 * 24 * 60 * 60 * 1000
                    );
                  }).length
                }
              </p>
            </div>
            <FaChartLine className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Timp Total Citire
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {formatTime(
                  users.reduce((sum, u) => sum + u.totalReadingTime, 0)
                )}
              </p>
            </div>
            <FaClock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Articole Citite
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {users.reduce((sum, u) => sum + u.articlesRead, 0)}
              </p>
            </div>
            <FaBookOpen className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Lista Utilizatori ({filteredAndSortedUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilizator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Angajament
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timp Citire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articole
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ultima Activitate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => {
                const engagement = getEngagementLevel(user.engagementScore);
                return (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.user.displayName || "Fără nume"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${engagement.bgColor} ${engagement.color}`}
                      >
                        <FaTrophy className="mr-1" />
                        {engagement.level}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Scor: {user.engagementScore}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(user.totalReadingTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Mediu: {formatTime(user.averageReadingTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.articlesRead}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.completionRate.toFixed(1)}% finalizate
                      </div>
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const lastActivityDate = timestampToDate(
                          user.lastActivity
                        );
                        return lastActivityDate ? (
                          <div>
                            <div>
                              {lastActivityDate.toLocaleDateString("ro-RO")}
                            </div>
                            <div className="text-xs">
                              {lastActivityDate.toLocaleTimeString("ro-RO")}
                            </div>
                          </div>
                        ) : (
                          "Niciodată"
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <FaEye />
                        Detalii
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Profil Utilizator:{" "}
                {selectedUser.user.displayName || selectedUser.user.email}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Informații Generale
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Email:</strong> {selectedUser.user.email}
                    </div>
                    <div>
                      <strong>Nume:</strong>{" "}
                      {selectedUser.user.displayName || "Neespecificat"}
                    </div>
                    <div>
                      <strong>Înregistrat:</strong>{" "}
                      {selectedUser.user.createdAt
                        ? new Date(
                            selectedUser.user.createdAt
                          ).toLocaleDateString("ro-RO")
                        : "N/A"}
                    </div>
                    <div>
                      <strong>Ultima logare:</strong>{" "}
                      {selectedUser.user.lastLoginAt
                        ? new Date(
                            selectedUser.user.lastLoginAt
                          ).toLocaleDateString("ro-RO")
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Statistici Citire
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Total timp citire:</strong>{" "}
                      {formatTime(selectedUser.totalReadingTime)}
                    </div>
                    <div>
                      <strong>Articole citite:</strong>{" "}
                      {selectedUser.articlesRead}
                    </div>
                    <div>
                      <strong>Timp mediu per sesiune:</strong>{" "}
                      {formatTime(selectedUser.readingStats.avgTimePerSession)}
                    </div>
                    <div>
                      <strong>Rata finalizare:</strong>{" "}
                      {selectedUser.completionRate.toFixed(1)}%
                    </div>
                    <div>
                      <strong>Scor angajament:</strong>{" "}
                      {selectedUser.engagementScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reading Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Ore Preferate de Citire
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.preferredReadingTimes.length > 0 ? (
                      selectedUser.preferredReadingTimes.map((time, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FaClock className="text-blue-500" />
                          <span className="text-sm">{time}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Nu există date suficiente
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Categorii Preferate
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.topCategories.length > 0 ? (
                      selectedUser.topCategories.map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FaBookOpen className="text-green-500" />
                          <span className="text-sm">{category}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Nu există date suficiente
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Activitate Recentă
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {" "}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarAlt className="text-blue-500" />
                      <span>
                        Ultima activitate:{" "}
                        {(() => {
                          const lastActivityDate = timestampToDate(
                            selectedUser.lastActivity
                          );
                          return lastActivityDate
                            ? lastActivityDate.toLocaleString("ro-RO")
                            : "N/A";
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaChartLine className="text-green-500" />
                      <span>
                        Sesiuni de citire: {selectedUser.readingSessions.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilesAdmin;
