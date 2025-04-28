import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import useProfileSync from "../hooks/useProfileSync";
import ProfilePhoto from "../components/ProfilePhoto";
import { 
  FaUserCog, FaUserMd, FaUser,
  FaCalendarAlt, FaStethoscope, 
  FaStore, FaCalendarCheck, FaClipboardList
} from "react-icons/fa";
import { 
  UserRole, 
  checkPendingRoleRequests,
  isUserSpecialist,
  isUserAdmin,
  getUserRoleEnum
} from "../utils/userRoles";
import { refreshUserSession } from "../utils/tokenRefresh";
import { 
  checkRoleMismatch, 
  fixRoleMismatch, 
  getFirestoreRole
} from "../utils/roles";

// Define custom user type extending Firebase User
interface ExtendedUser {
  firstName?: string;
  address?: {
    city: string;
    country?: string;
  };
}

// Interface for event items
interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  registeredUsers?: string[];
  [key: string]: any;
}

// Interfața pentru proprietățile componentei ActionCard
interface ActionCardProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  linkTo: string;
  color: string;
}

// Quick actions card with animations
const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, description, linkTo, color }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${color}`}
    >
      <div className="p-5">
        <div className="flex items-center mb-2">
          <Icon className={`mr-3 text-xl ${color.replace("border", "text")}`} />
          <h3 className="font-bold">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <button
          onClick={() => navigate(linkTo)}
          className={`w-full py-2 text-center ${color.replace("border", "bg")} ${color.replace("border-", "hover:bg-")} text-white rounded transition duration-200`}
        >
          Accesează
        </button>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  // Basic states
  const { user, loading, userRole: authUserRole, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const [greeting, setGreeting] = useState("");
  
  // Folosim hook-ul de sincronizare globală a profilului
  const { forceSynchronization: _forceSynchronization } = useProfileSync({
    syncInterval: 30000 // Verificăm profilul la fiecare 30 secunde
  });

  // Role-related states
  const [checkingRole, setCheckingRole] = useState<boolean>(true);
  const [_hasPendingRoleRequest, setHasPendingRoleRequest] = useState(false);
  const [firebaseRole, setFirebaseRole] = useState<string | null>(null);
  const [rolesMismatch, setRolesMismatch] = useState<boolean>(false);
  const [refreshingToken, setRefreshingToken] = useState<boolean>(false);
  const [fixingRole, setFixingRole] = useState<boolean>(false);
  const [userRoleEnum, setUserRoleEnum] = useState<UserRole | null>(null);
  
  // Content states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [_eventsError, setEventsError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [_ordersError, setOrdersError] = useState<string | null>(null);
  const [_appointments, setAppointments] = useState<any[]>([]);
  const [_appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<{ [productId: string]: number }>({});
  const [ratingSubmitting, setRatingSubmitting] = useState<{ [productId: string]: boolean }>({});
  const [ratingSuccess, setRatingSuccess] = useState<{ [productId: string]: boolean }>({});

  // Add underscore prefix to unused variables
  const [_isAdmin, _isSpecialist] = [false, false];

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // Convert string role from context to UserRole enum
  useEffect(() => {
    if (authUserRole !== undefined && authUserRole !== null) {
      try {
        // Always convert to string before using toLowerCase
        const safeRole = String(authUserRole).toLowerCase();
        console.log("Current user role:", safeRole);
        setUserRoleEnum(getUserRoleEnum(safeRole));
      } catch (error) {
        console.error("Error converting role:", error);
        // Default to USER role if there's an error
        setUserRoleEnum(UserRole.USER);
      }
    } else {
      setUserRoleEnum(null);
    }
    
    setCheckingRole(false);
  }, [authUserRole]);

  // Custom hook to check user role status
  useEffect(() => {
    const checkRoles = async () => {
      if (!user?.uid) return;
      
      setCheckingRole(true);
      try {
        // First check Admin role directly
        const adminStatus = await isUserAdmin(user.uid);
        const specialistStatus = await isUserSpecialist(user.uid);
        
        console.log(`Dashboard role check - Admin: ${adminStatus}, Specialist: ${specialistStatus}`);
        
        if (adminStatus) {
          setUserRoleEnum(UserRole.ADMIN);
        } else if (specialistStatus) {
          setUserRoleEnum(UserRole.SPECIALIST);
        } else {
          setUserRoleEnum(UserRole.USER);
        }
      } catch (error) {
        console.error("Error checking user roles:", error);
        setUserRoleEnum(UserRole.USER); // Default to user role on error
      } finally {
        setCheckingRole(false);
      }
    };
    
    if (user) {
      checkRoles();
    }
  }, [user]);

  // Check for pending role requests
  useEffect(() => {
    const checkIfUserHasPendingRequest = async () => {
      if (!user?.uid) return;
      try {
        const hasPending = await checkPendingRoleRequests(user.uid);
        setHasPendingRoleRequest(hasPending);
      } catch (error) {
        console.error("Eroare la verificarea cererilor de rol în așteptare:", error);
      }
    };
    
    if (user) {
      checkIfUserHasPendingRequest();
    }
  }, [user]);

  // Verificăm starea rolului utilizatorului în Firestore
  useEffect(() => {
    const checkUserRoles = async () => {
      if (!user?.uid) return;
      
      try {
        const firestoreRoleValue = await getFirestoreRole(user.uid);
        setFirebaseRole(firestoreRoleValue);
        
        const hasMismatch = await checkRoleMismatch(user.uid);
        setRolesMismatch(hasMismatch);
      } catch (error) {
        console.error("Error checking roles:", error);
      }
    };
    
    if (user && authUserRole) {
      checkUserRoles();
    }
  }, [user, authUserRole]);

  // Fetch user events
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) return;
      
      try {
        setEventsLoading(true);
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, where("registeredUsers", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);

        const userEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as EventItem));

        // Sort events by date
        userEvents.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;

          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });

        setEvents(userEvents);
      } catch (err) {
        console.error("Eroare la încărcarea evenimentelor utilizatorului:", err);
        setEventsError("A apărut o eroare la încărcarea evenimentelor.");
      } finally {
        setEventsLoading(false);
      }
    };

    fetchUserEvents();
  }, [user]);

  // Fetch user orders
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
            items: await Promise.all(orderData.items.map(async (item: any) => {
              try {
                const productDoc = await getDoc(doc(db, "products", item.id));
                return {
                  ...item,
                  productDetails: productDoc.exists() ? productDoc.data() : null,
                };
              } catch (err) {
                console.error(`Error fetching product details for ${item.id}:`, err);
                return item;
              }
            })),
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

  // Fetch user appointments
  useEffect(() => {
    const fetchUserAppointments = async () => {
      if (!user) return;
      
      try {
        setAppointmentsLoading(true);
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const userAppointments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by date (most recent first)
        userAppointments.sort((a, b) => {
          // Using optional chaining and default values for missing date properties
          const dateA = (a as any).date?.toDate?.() || new Date((a as any).date || 0);
          const dateB = (b as any).date?.toDate?.() || new Date((b as any).date || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setAppointmentsLoading(false);
      }
    };
    
    fetchUserAppointments();
  }, [user]);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bună dimineața");
    else if (hour < 18) setGreeting("Bună ziua");
    else setGreeting("Bună seara");
  }, []);

  // Refresh user profile data on page load
  useEffect(() => {
    // Încarcă datele utilizatorului la pornirea paginii pentru a asigura sincronizarea
    const refreshUserProfileData = async () => {
      if (user && !loading) {
        try {
          // Forțăm reîmprospătarea datelor de utilizator pentru a asigura sincronizarea
          // Folosim funcția refreshUserData direct din contextul de autentificare
          await refreshUserData();
        } catch (error) {
          console.error("Eroare la reîmprospătearea datelor de utilizator:", error);
        }
      }
    };
    
    refreshUserProfileData();
  }, [user, loading]);

  // Handle product rating
  const _handleRateProduct = async (productId: string, rating: number) => {
    if (!user) return;

    setRatingSubmitting({ ...ratingSubmitting, [productId]: true });

    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error("Produsul nu a fost găsit");
      }

      const productData = productSnap.data();
      const currentRatings = productData.ratings || { count: 0, average: 0, userRatings: [] };

      const userRatingIndex = currentRatings.userRatings?.findIndex(
        (r: any) => r.userId === user.uid
      );

      let newRatings;

      if (userRatingIndex >= 0) {
        const updatedUserRatings = [...currentRatings.userRatings];
        updatedUserRatings[userRatingIndex].rating = rating;

        const sum = updatedUserRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0);
        const newAverage = sum / updatedUserRatings.length;

        newRatings = {
          count: currentRatings.count,
          average: newAverage,
          userRatings: updatedUserRatings,
        };
      } else {
        const newCount = currentRatings.count + 1;
        const newSum = currentRatings.average * currentRatings.count + rating;
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

  // Handle token refresh
  const handleRefreshToken = async () => {
    if (!user) return;
    
    setRefreshingToken(true);
    try {
      await refreshUserSession();
      console.log("Session refreshed successfully");
      
      // Refresh the page to ensure all hooks and contexts update properly
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing token:", error);
      alert("An error occurred while refreshing your session. Please try logging out and back in.");
    } finally {
      setRefreshingToken(false);
    }
  };

  // Handle role mismatch fix
  const handleFixRoleMismatch = async () => {
    if (!user) return;
    
    setFixingRole(true);
    try {
      const fixed = await fixRoleMismatch(user.uid);
      if (fixed) {
        setRolesMismatch(false);
        alert("Role has been updated successfully in the database. Please refresh your session to update your token.");
      } else {
        console.log("No role update was necessary.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("An error occurred while updating your role.");
    } finally {
      setFixingRole(false);
    }
  };

  // Event date formatting helper
  const formatEventDate = (dateString: string) => {
    if (!dateString) return "Data necunoscută";

    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      return new Date(dateString).toLocaleDateString("ro-RO", options);
    } catch (e) {
      return dateString;
    }
  };

  // Loading states
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Se redirecționează...</div>;
  }

  // Get display name
  const username =
    (user as unknown as ExtendedUser)?.firstName ||
    user?.displayName?.split(" ")[0] ||
    "Utilizator";

  // Simplified render to test if the component loads
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome header with animations */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, <span className="text-blue-600">{username}</span>!
        </h1>
        <p className="text-gray-600 mt-2">Bun venit înapoi pe panoul tău de control personal.</p>
        
        {/* Role mismatch alert */}
        {rolesMismatch && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative">
            <div className="flex">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold">Actualizare necesară</p>
                <p className="text-sm">
                  {firebaseRole === "specialist" && authUserRole !== "specialist" 
                    ? "Rolul de specialist a fost aprobat! Reîmprospătați sesiunea pentru a activa permisiunile noi."
                    : "Am detectat o discrepanță între baza de date și sesiunea curentă."}
                </p>
                <div className="mt-2 flex space-x-2">
                  <button 
                    onClick={handleFixRoleMismatch}
                    disabled={fixingRole}
                    className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded disabled:opacity-50"
                  >
                    {fixingRole ? "Se actualizează..." : "1. Actualizează rolul în baza de date"}
                  </button>
                  <button 
                    onClick={handleRefreshToken}
                    disabled={refreshingToken}
                    className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded disabled:opacity-50"
                  >
                    {refreshingToken ? "Se reîmprospătează..." : "2. Reîmprospătează sesiunea"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* User profile and quick actions grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* User profile card with animation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center mb-4">
            {/* Replace the old profile photo implementation with our new component */}
            <div className="mr-4">
              <ProfilePhoto 
                photoURL={user?.photoURL}
                userId={user?.uid || "default"}
                size="medium"
                round={true}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.displayName || "Utilizator"}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              
              {/* User role badge with animation */}
              {!checkingRole && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    userRoleEnum === UserRole.ADMIN 
                      ? "bg-red-100 text-red-800" 
                      : userRoleEnum === UserRole.SPECIALIST 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {userRoleEnum === UserRole.ADMIN && (
                    <>
                      <FaUserCog className="mr-1" />
                      Administrator
                    </>
                  )}
                  {userRoleEnum === UserRole.SPECIALIST && (
                    <>
                      <FaUserMd className="mr-1" />
                      Specialist
                    </>
                  )}
                  {userRoleEnum === UserRole.USER && (
                    <>
                      <FaUser className="mr-1" />
                      Utilizator
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition duration-200 text-sm font-medium"
          >
            Editează Profilul
          </button>
        </motion.div>

        {/* Quick actions card with animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Acțiuni Rapide</h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              icon={FaStethoscope}
              title="Servicii"
              description="Accesează serviciile disponibile."
              linkTo="/servicii"
              color="border-blue-500"
            />
            <ActionCard
              icon={FaStore}
              title="Magazin"
              description="Explorează produsele din magazin."
              linkTo="/magazin"
              color="border-green-500"
            />
            
            <ActionCard
              icon={FaCalendarAlt}
              title="Evenimente"
              description="Explorează evenimentele disponibile."
              linkTo="/events"
              color="border-indigo-500"
            />
            
            <ActionCard
              icon={FaCalendarCheck}
              title="Programări"
              description="Gestionează programările tale"
              linkTo="/appointments"
              color="border-yellow-500"
            />
            
            {/* Conditional buttons based on user role */}
            {userRoleEnum === UserRole.SPECIALIST && (
              <ActionCard
                icon={FaClipboardList}
                title="Panou Specialist"
                description="Accesează panoul de specialist"
                linkTo="/specialist"
                color="border-indigo-500"
              />
            )}
            
            {userRoleEnum === UserRole.ADMIN && (
              <ActionCard
                icon={FaUserCog}
                title="Admin"
                description="Accesează panoul de administrare"
                linkTo="/admin"
                color="border-red-500"
              />
            )}
          </div>
        </motion.div>

        {/* Account options with animation */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Activități recente</h2>
          
          {/* User appointments summary */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Programări</h3>
            {ordersLoading ? (
              <div className="text-center py-3">
                <div className="animate-spin h-5 w-5 mx-auto border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md">
                {orders && orders.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Următoarea programare:</p>
                    <p className="font-medium">{orders[0]?.serviceName || "Programare"}</p>
                    <p className="text-xs text-gray-500">{formatEventDate(orders[0]?.date)}</p>
                    <button 
                      onClick={() => navigate("/appointments")}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Vezi toate programările
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Nu ai nicio programare activă</p>
                )}
              </div>
            )}
          </div>
          
          {/* User orders summary */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Rezumat cont</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Comenzi</p>
                <p className="font-bold text-lg">{orders.length}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Evenimente</p>
                <p className="font-bold text-lg">{events.length}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent events with animation */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold mb-4">Participările Tale la Evenimente</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {eventsLoading ? (
            <div className="text-center py-4">Se încarcă evenimentele...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-4">Nu ești înscris la niciun eveniment.</div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-bold">{event.title}</h3>
                      <p className="text-sm text-gray-600">{formatEventDate(event.date)}</p>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {events.length > 3 && (
                <div className="text-center mt-2">
                  <button 
                    onClick={() => navigate("/evenimente")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Vezi toate evenimentele ({events.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
