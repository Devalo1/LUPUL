import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  FaStar,
  FaRegStar,
  FaCheck,
  FaUserCog,
  FaUserMd,
  FaUser,
  FaCalculator,
} from "react-icons/fa";
import {
  isUserAdmin,
  isUserSpecialist,
  isUserAccountant,
  UserRole,
  requestRoleChange,
  checkPendingRoleRequests,
} from "../utils/userRoles";
import "../components/AssistantProfileDashboard.css";

// Define custom user type extending Firebase User
interface ExtendedUser {
  firstName?: string;
  address?: {
    city: string;
    country?: string;
  };
}

// Definim interfața pentru eveniment pentru a evita erorile de tip
interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  registeredUsers?: string[];
  [key: string]: any; // Pentru alte proprietăți potențiale
}

const Dashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checkingRole, setCheckingRole] = useState<boolean>(true);
  const { user, loading } = useAuth();
  const { isAdmin, isSpecialist, isAccountant } = useAuth(); // Extragerea separată pentru dependența useEffect
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const [greeting, setGreeting] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [userRatings, setUserRatings] = useState<{
    [productId: string]: number;
  }>({});
  const [ratingSubmitting, setRatingSubmitting] = useState<{
    [productId: string]: boolean;
  }>({});
  const [ratingSuccess, setRatingSuccess] = useState<{
    [productId: string]: boolean;
  }>({});

  // State pentru cererea de rol de specialist
  const [roleChangeReason, setRoleChangeReason] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [requestingRoleChange, setRequestingRoleChange] = useState(false);
  const [roleChangeRequestStatus, setRoleChangeRequestStatus] = useState<
    "none" | "success" | "error" | "existing"
  >("none");
  const [hasPendingRoleRequest, setHasPendingRoleRequest] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);
  // Adăugare efect pentru a verifica rolul utilizatorului
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.email) return;

      setCheckingRole(true);
      console.log("🔍 Verificăm rolul pentru utilizatorul:", user.email);

      try {
        // Verificăm dacă utilizatorul este admin
        const isAdmin = await isUserAdmin(user.email);
        console.log("👑 isAdmin:", isAdmin);
        if (isAdmin) {
          setUserRole(UserRole.ADMIN);
          console.log("✅ Rol setat: ADMIN");
          return;
        }

        // Verificăm dacă utilizatorul este specialist
        const isSpecialist = await isUserSpecialist(user.email);
        console.log("🩺 isSpecialist:", isSpecialist);
        if (isSpecialist) {
          setUserRole(UserRole.SPECIALIST);
          console.log("✅ Rol setat: SPECIALIST");
          return;
        }

        // Verificăm dacă utilizatorul este contabil
        const isAccountant = await isUserAccountant(user.email);
        console.log("💰 isAccountant:", isAccountant);
        if (isAccountant) {
          setUserRole(UserRole.ACCOUNTANT);
          console.log("✅ Rol setat: ACCOUNTANT");
          return;
        }

        // Dacă nu are niciun rol special, este utilizator normal
        setUserRole(UserRole.USER);
        console.log("✅ Rol setat: USER (implicit)");
      } catch (error) {
        console.error("Eroare la verificarea rolului utilizatorului:", error);
        setUserRole(UserRole.USER); // Implicit utilizator normal
      } finally {
        setCheckingRole(false);
      }
    };

    const checkIfUserHasPendingRequest = async () => {
      if (!user?.uid) return;
      try {
        const hasPending = await checkPendingRoleRequests(user.uid);
        setHasPendingRoleRequest(hasPending);
      } catch (error) {
        console.error(
          "Eroare la verificarea cererilor de rol în așteptare:",
          error
        );
      }
    };

    if (user) {
      fetchUserRole();
      checkIfUserHasPendingRequest();
    } else {
      setUserRole(null);
    }
  }, [user, isAdmin, isSpecialist, isAccountant]); // Adăugat toate rolurile ca dependențe pentru a reactualiza când se schimbă

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) return;

      try {
        setEventsLoading(true);
        const eventsRef = collection(db, "events");
        const q = query(
          eventsRef,
          where("registeredUsers", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const userEvents = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as EventItem
        );

        // Sortează evenimentele după dată (cele mai recente primul)
        userEvents.sort((a, b) => {
          // Verificăm dacă ambele obiecte au proprietatea date
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;

          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });

        setEvents(userEvents);
      } catch (err) {
        console.error(
          "Eroare la încărcarea evenimentelor utilizatorului:",
          err
        );
        setEventsError("A apărut o eroare la încărcarea evenimentelor.");
      } finally {
        setEventsLoading(false);
      }
    };

    fetchUserEvents();
  }, [user]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;

      try {
        setOrdersLoading(true);
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const userOrders = [];

        for (const orderDoc of querySnapshot.docs) {
          const orderData = orderDoc.data();

          const orderWithProducts = {
            id: orderDoc.id,
            ...orderData,
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

        setOrders(userOrders);
      } catch (err) {
        console.error("Eroare la încărcarea comenzilor utilizatorului:", err);
        setOrdersError("A apărut o eroare la încărcarea comenzilor.");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bună dimineața");
    else if (hour < 18) setGreeting("Bună ziua");
    else setGreeting("Bună seara");
  }, []);

  const handleRateProduct = async (productId: string, rating: number) => {
    if (!user) return;

    setRatingSubmitting({ ...ratingSubmitting, [productId]: true });

    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error("Produsul nu a fost găsit");
      }

      const productData = productSnap.data();
      const currentRatings = productData.ratings || {
        count: 0,
        average: 0,
        userRatings: [],
      };

      const userRatingIndex = (currentRatings.userRatings || []).findIndex(
        (r: any) => r.userId === user.uid
      );

      let newRatings;

      if (userRatingIndex >= 0) {
        const updatedUserRatings = [...(currentRatings.userRatings || [])];
        updatedUserRatings[userRatingIndex].rating = rating;

        const sum = updatedUserRatings.reduce(
          (acc: number, curr: any) => acc + (curr.rating || 0),
          0
        );
        const newAverage =
          updatedUserRatings.length > 0 ? sum / updatedUserRatings.length : 0;

        newRatings = {
          count: currentRatings.count || 0,
          average: newAverage,
          userRatings: updatedUserRatings,
        };
      } else {
        const currentCount = currentRatings.count || 0;
        const currentAverage = currentRatings.average || 0;
        const newCount = currentCount + 1;
        const newSum = currentAverage * currentCount + rating;
        const newAverage = newSum / newCount;

        newRatings = {
          count: newCount,
          average: newAverage,
          userRatings: [
            ...(currentRatings.userRatings || []),
            { userId: user.uid, rating, date: new Date().toISOString() },
          ],
        };
      }

      await updateDoc(productRef, { ratings: newRatings });

      setUserRatings({ ...userRatings, [productId]: rating });
      setRatingSuccess({ ...ratingSuccess, [productId]: true });

      setTimeout(() => {
        setRatingSuccess({ ...ratingSuccess, [productId]: false });
      }, 3000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("A apărut o eroare la trimiterea recenziei.");
    } finally {
      setRatingSubmitting({ ...ratingSubmitting, [productId]: false });
    }
  };

  const handleRequestRoleChange = async () => {
    if (!user) return;

    try {
      setRequestingRoleChange(true);

      const result = await requestRoleChange(
        user.uid,
        user.email || "",
        user.displayName || "",
        UserRole.SPECIALIST,
        userRole || UserRole.USER,
        roleChangeReason,
        specialization
      );

      if (result === "existing") {
        setRoleChangeRequestStatus("existing");
      } else {
        setRoleChangeRequestStatus("success");
        setHasPendingRoleRequest(true);
      }

      // Închide modal-ul după 3 secunde în caz de succes
      if (result !== "existing") {
        setTimeout(() => {
          setRoleChangeModalOpen(false);
          setRoleChangeReason("");
          setSpecialization("");
          setRoleChangeRequestStatus("none");
        }, 3000);
      }
    } catch (error) {
      console.error(
        "Eroare la trimiterea cererii de schimbare a rolului:",
        error
      );
      setRoleChangeRequestStatus("error");
    } finally {
      setRequestingRoleChange(false);
    }
  };

  // Funcție pentru formatarea datei
  const formatEventDate = (dateString: string) => {
    if (!dateString) return "Data necunoscută";

    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString("ro-RO", options);
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Se încarcă...
      </div>
    );
  }

  // If not authenticated, show loading until redirect happens
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Se redirecționează...
      </div>
    );
  }

  const username =
    (user as unknown as ExtendedUser)?.firstName ||
    user?.displayName?.split(" ")[0] ||
    "Utilizator";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, <span className="text-blue-600">{username}</span>!
        </h1>
        <p className="text-gray-600 mt-2">
          Bun venit înapoi pe panoul tău de control personal.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center mr-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-blue-600">
                  {(user?.displayName?.charAt(0) || "").toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user?.displayName || "Utilizator"}
              </h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              {/* Badge pentru rolul utilizatorului */}
              {!checkingRole && userRole && (
                <div
                  className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    userRole === UserRole.ADMIN
                      ? "bg-red-100 text-red-800"
                      : userRole === UserRole.SPECIALIST
                        ? "bg-green-100 text-green-800"
                        : userRole === UserRole.ACCOUNTANT
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {userRole === UserRole.ADMIN && (
                    <>
                      <FaUserCog className="mr-1" />
                      Administrator
                    </>
                  )}
                  {userRole === UserRole.SPECIALIST && (
                    <>
                      <FaUserMd className="mr-1" />
                      Specialist
                    </>
                  )}
                  {userRole === UserRole.ACCOUNTANT && (
                    <>
                      <FaCalculator className="mr-1" />
                      Contabil
                    </>
                  )}
                  {userRole === UserRole.USER && (
                    <>
                      <FaUser className="mr-1" />
                      Utilizator
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {user?.phoneNumber && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Telefon:</span> {user.phoneNumber}
              </p>
            )}
            {(user as unknown as ExtendedUser)?.address?.city && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Locație:</span>{" "}
                {(user as unknown as ExtendedUser).address!.city},{" "}
                {(user as unknown as ExtendedUser).address!.country ||
                  "România"}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition duration-200 text-sm font-medium"
          >
            Editează Profilul
          </button>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {" "}
          <h2 className="text-lg font-semibold mb-4">Acțiuni Rapide</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/servicii")}
              className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm font-medium flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Servicii
            </button>
            <button
              onClick={() => navigate("/magazin")}
              className="p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 text-sm font-medium flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Magazin
            </button>
            <button
              onClick={() => navigate("/appointments/specialist")}
              className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 text-sm font-medium flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Programări
            </button>
            <button
              onClick={() => navigate("/events")}
              className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm font-medium flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Evenimente
            </button>{" "}
            {userRole === UserRole.SPECIALIST && (
              <button
                onClick={() => navigate("/specialist-panel")}
                className="p-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition duration-200 text-sm font-medium flex flex-col items-center"
              >
                <FaUserMd className="h-6 w-6 mb-1" />
                Panou Specialist
              </button>
            )}
            <button
              onClick={() => navigate("/dashboard/AIsettings")}
              className={`p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 text-sm font-medium flex flex-col items-center ${
                userRole === UserRole.SPECIALIST ? "col-span-1" : "col-span-2"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Setări AI
            </button>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4">Programări Viitoare</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-sm font-medium text-blue-800">
                Sesiune de terapie
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">
                  Vineri, 15 Iulie 2023, 15:00
                </span>
                <button
                  onClick={() => navigate("/programari")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Vezi detalii
                </button>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-md border border-purple-100">
              <p className="text-sm font-medium text-purple-800">
                Atelier de grup
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">
                  Sâmbătă, 23 Iulie 2023, 10:00
                </span>
                <button
                  onClick={() => navigate("/programari")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Vezi detalii
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/programari")}
              className="w-full text-sm text-blue-600 hover:underline mt-2"
            >
              Vezi toate programările
            </button>
          </div>
        </motion.div>
      </div>
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Activitate Recentă</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Achiziție finalizată</p>
                <p className="text-sm text-gray-600">
                  Ai achiziționat "Set de meditație pentru începători"
                </p>
                <p className="text-xs text-gray-500 mt-1">Acum 2 zile</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Programare confirmată</p>
                <p className="text-sm text-gray-600">
                  Sesiune de terapie, Vineri 15 Iulie
                </p>
                <p className="text-xs text-gray-500 mt-1">Acum 3 zile</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-yellow-100 p-2 rounded-full mr-4">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 00-2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Profil actualizat</p>
                <p className="text-sm text-gray-600">
                  Ți-ai actualizat informațiile personale
                </p>
                <p className="text-xs text-gray-500 mt-1">Acum 1 săptămână</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Participările Tale la Evenimente
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {eventsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Se încarcă evenimentele...</p>
            </div>
          ) : eventsError ? (
            <div className="text-center text-red-600 py-4">{eventsError}</div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600">
                Nu ești înscris la niciun eveniment.
              </p>
              <Link
                to="/events"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Descoperă Evenimente
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-full md:w-24 h-24 overflow-hidden rounded-lg">
                      <img
                        src={event.imageUrl || "/images/event-placeholder.jpg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {formatEventDate(event.date)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {event.location || "Locație nedefinită"}
                      </p>
                    </div>
                    <div>
                      <Link
                        to={`/events/${event.id}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Vezi detalii
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Comenzile Tale</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {ordersLoading ? (
            <div className="text-center">Se încarcă comenzile...</div>
          ) : ordersError ? (
            <div className="text-center text-red-600">{ordersError}</div>
          ) : !orders || orders.length === 0 ? (
            <p className="text-gray-600">Nu ai făcut încă nicio comandă.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">
                      Comanda #{order.id.substring(0, 8)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("ro-RO")}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(order.items || []).map((item: any) => (
                      <div key={item.id} className="order-rating-widget">
                        <div className="flex items-center">
                          <img
                            src={
                              item.image || "/images/product-placeholder.jpg"
                            }
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              Cantitate: {item.quantity} ×{" "}
                              {typeof item.price === "number"
                                ? item.price.toFixed(2)
                                : "0.00"}{" "}
                              RON
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">
                            Evaluează acest produs:
                          </p>
                          <div className="rating-stars-input">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`rating-star-input ${
                                  userRatings[item.id] >= star ? "active" : ""
                                }`}
                                onClick={() => handleRateProduct(item.id, star)}
                              >
                                {userRatings[item.id] >= star ? (
                                  <FaStar />
                                ) : (
                                  <FaRegStar />
                                )}
                              </span>
                            ))}
                          </div>

                          {ratingSubmitting[item.id] && (
                            <p className="text-xs text-blue-600 mt-1">
                              Se trimite evaluarea...
                            </p>
                          )}

                          {ratingSuccess[item.id] && (
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                              <FaCheck className="mr-1" /> Evaluare trimisă cu
                              succes
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                    <p className="font-medium">
                      Total:{" "}
                      {typeof order.total === "number"
                        ? order.total.toFixed(2)
                        : "0.00"}{" "}
                      RON
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {order.status || "Finalizată"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Opțiuni cont</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {userRole === UserRole.USER && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Devino specialist</h3>
              <p className="text-sm text-gray-600 mb-3">
                Dacă ai calificările necesare, poți solicita rolul de specialist
                pentru a oferi servicii și consultanță.
              </p>

              {hasPendingRoleRequest ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Ai o cerere de schimbare a rolului în așteptare. Te vom
                    anunța când va fi procesată.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setRoleChangeModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Solicită rolul de specialist
                </button>
              )}
            </div>
          )}

          {/* Alte opțiuni de cont ar putea fi adăugate aici */}
        </div>
      </section>
      {/* Modal pentru cererea de schimbare a rolului */}
      {roleChangeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Solicită rolul de specialist
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Te rugăm să ne explici calificările și experiența ta
                        care te recomandă pentru rolul de specialist.
                      </p>

                      {roleChangeRequestStatus === "success" ? (
                        <div className="p-4 bg-green-50 text-green-800 rounded-md">
                          <p className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Cererea ta a fost trimisă cu succes! Te vom notifica
                            când va fi procesată.
                          </p>
                        </div>
                      ) : roleChangeRequestStatus === "error" ? (
                        <div className="p-4 bg-red-50 text-red-800 rounded-md">
                          <p className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            A apărut o eroare la trimiterea cererii. Te rugăm să
                            încerci din nou.
                          </p>
                        </div>
                      ) : roleChangeRequestStatus === "existing" ? (
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                          <p className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            Ai deja o cerere de schimbare a rolului în
                            așteptare.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4">
                            <label
                              htmlFor="specialization"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Specializarea
                            </label>
                            <input
                              type="text"
                              id="specialization"
                              name="specialization"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="Ex: Nutriție, Psihoterapie, Masaj"
                              value={specialization}
                              onChange={(e) =>
                                setSpecialization(e.target.value)
                              }
                              disabled={requestingRoleChange}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="roleChangeReason"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Calificări și experiență
                            </label>
                            <textarea
                              id="roleChangeReason"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              rows={5}
                              placeholder="Descrie experiența, calificările și motivul pentru care dorești să devii specialist..."
                              value={roleChangeReason}
                              onChange={(e) =>
                                setRoleChangeReason(e.target.value)
                              }
                              disabled={requestingRoleChange}
                            ></textarea>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {roleChangeRequestStatus === "none" && (
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                      requestingRoleChange ||
                      !roleChangeReason.trim() ||
                      !specialization.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={handleRequestRoleChange}
                    disabled={
                      requestingRoleChange ||
                      !roleChangeReason.trim() ||
                      !specialization.trim()
                    }
                  >
                    {requestingRoleChange ? "Se trimite..." : "Trimite cererea"}
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setRoleChangeModalOpen(false);
                    setRoleChangeReason("");
                    if (roleChangeRequestStatus !== "existing") {
                      setRoleChangeRequestStatus("none");
                    }
                  }}
                >
                  {roleChangeRequestStatus === "success"
                    ? "Închide"
                    : "Anulează"}
                </button>
              </div>
            </div>{" "}
          </div>
        </div>
      )}{" "}
      {/* AI Settings Panel */}
      {/* {isAISettingsOpen && (
        <AISettingsPanel onClose={() => setIsAISettingsOpen(false)} />
      )} */}
      {/* Assistant Profile Dashboard */}
      {/* Eliminăm complet AssistantProfileDashboard din dashboard dacă nu vrei să apară deloc */}
      {/* <AssistantProfileDashboard onEdit={() => setEditOpen(true)} /> */}
    </div>
  );
};

export default Dashboard;
