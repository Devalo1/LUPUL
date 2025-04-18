import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaStar, FaRegStar, FaCheck } from 'react-icons/fa';

// Define custom user type extending Firebase User
interface ExtendedUser {
  firstName?: string;
  address?: {
    city: string;
    country: string;
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
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [userRatings, setUserRatings] = useState<{ [productId: string]: number }>({});
  const [ratingSubmitting, setRatingSubmitting] = useState<{ [productId: string]: boolean }>({});
  const [ratingSuccess, setRatingSuccess] = useState<{ [productId: string]: boolean }>({});

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bună dimineața');
    else if (hour < 18) setGreeting('Bună ziua');
    else setGreeting('Bună seara');
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!currentUser) return;

      try {
        setEventsLoading(true);
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('registeredUsers', 'array-contains', currentUser.uid));
        const querySnapshot = await getDocs(q);

        const userEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as EventItem));

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
        console.error('Eroare la încărcarea evenimentelor utilizatorului:', err);
        setEventsError('A apărut o eroare la încărcarea evenimentelor.');
      } finally {
        setEventsLoading(false);
      }
    };

    fetchUserEvents();
  }, [currentUser]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!currentUser) return;

      try {
        setOrdersLoading(true);
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        const userOrders = [];

        for (const orderDoc of querySnapshot.docs) {
          const orderData = orderDoc.data();

          const orderWithProducts = {
            id: orderDoc.id,
            ...orderData,
            items: await Promise.all(orderData.items.map(async (item: any) => {
              try {
                const productDoc = await getDoc(doc(db, 'products', item.id));
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
        console.error('Eroare la încărcarea comenzilor utilizatorului:', err);
        setOrdersError('A apărut o eroare la încărcarea comenzilor.');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [currentUser]);

  const handleRateProduct = async (productId: string, rating: number) => {
    if (!currentUser) return;

    setRatingSubmitting({ ...ratingSubmitting, [productId]: true });

    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error('Produsul nu a fost găsit');
      }

      const productData = productSnap.data();
      const currentRatings = productData.ratings || { count: 0, average: 0, userRatings: [] };

      const userRatingIndex = currentRatings.userRatings?.findIndex(
        (r: any) => r.userId === currentUser.uid
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
            { userId: currentUser.uid, rating, date: new Date().toISOString() },
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
      console.error('Error submitting rating:', error);
      alert('A apărut o eroare la trimiterea recenziei.');
    } finally {
      setRatingSubmitting({ ...ratingSubmitting, [productId]: false });
    }
  };

  // Funcție pentru formatarea datei
  const formatEventDate = (dateString: string) => {
    if (!dateString) return 'Data necunoscută';
    
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString('ro-RO', options);
    } catch (e) {
      return dateString;
    }
  };

  if (!loading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }

  const username =
    (currentUser as unknown as ExtendedUser)?.firstName ||
    currentUser?.displayName?.split(' ')[0] ||
    'Utilizator';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, <span className="text-blue-600">{username}</span>!
        </h1>
        <p className="text-gray-600 mt-2">Bun venit înapoi pe panoul tău de control personal.</p>
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
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-blue-600">
                  {(currentUser?.displayName?.charAt(0) || '').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {currentUser?.displayName || 'Utilizator'}
              </h2>
              <p className="text-gray-500 text-sm">{currentUser?.email}</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {currentUser?.phoneNumber && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Telefon:</span> {currentUser.phoneNumber}
              </p>
            )}
            {(currentUser as unknown as ExtendedUser)?.address?.city && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Locație:</span>{' '}
                {(currentUser as unknown as ExtendedUser).address!.city},{' '}
                {(currentUser as unknown as ExtendedUser).address!.country || 'România'}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/profile')}
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
          <h2 className="text-lg font-semibold mb-4">Acțiuni Rapide</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/servicii')}
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
              onClick={() => navigate('/magazin')}
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
              onClick={() => navigate('/programari')}
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
              onClick={() => navigate('/events')}
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
              <p className="text-sm font-medium text-blue-800">Sesiune de terapie</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">Vineri, 15 Iulie 2023, 15:00</span>
                <button className="text-xs text-blue-600 hover:underline">Vezi detalii</button>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-md border border-purple-100">
              <p className="text-sm font-medium text-purple-800">Atelier de grup</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">Sâmbătă, 23 Iulie 2023, 10:00</span>
                <button className="text-xs text-blue-600 hover:underline">Vezi detalii</button>
              </div>
            </div>

            <button className="w-full text-sm text-blue-600 hover:underline mt-2">
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
                <p className="text-sm text-gray-600">Sesiune de terapie, Vineri 15 Iulie</p>
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
                <p className="text-sm text-gray-600">Ți-ai actualizat informațiile personale</p>
                <p className="text-xs text-gray-500 mt-1">Acum 1 săptămână</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Participările Tale la Evenimente</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {eventsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Se încarcă evenimentele...</p>
            </div>
          ) : eventsError ? (
            <div className="text-center text-red-600 py-4">{eventsError}</div>
          ) : events.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600">Nu ești înscris la niciun eveniment.</p>
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
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-full md:w-24 h-24 overflow-hidden rounded-lg">
                      <img 
                        src={event.imageUrl || '/images/event-placeholder.jpg'} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{formatEventDate(event.date)}</p>
                      <p className="text-gray-600 text-sm">{event.location || 'Locație nedefinită'}</p>
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
          ) : orders.length === 0 ? (
            <p className="text-gray-600">Nu ai făcut încă nicio comandă.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Comanda #{order.id.substring(0, 8)}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="order-rating-widget">
                        <div className="flex items-center">
                          <img
                            src={item.image || '/images/product-placeholder.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              Cantitate: {item.quantity} × {item.price.toFixed(2)} RON
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Evaluează acest produs:</p>
                          <div className="rating-stars-input">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`rating-star-input ${
                                  userRatings[item.id] >= star ? 'active' : ''
                                }`}
                                onClick={() => handleRateProduct(item.id, star)}
                              >
                                {userRatings[item.id] >= star ? <FaStar /> : <FaRegStar />}
                              </span>
                            ))}
                          </div>

                          {ratingSubmitting[item.id] && (
                            <p className="text-xs text-blue-600 mt-1">Se trimite evaluarea...</p>
                          )}

                          {ratingSuccess[item.id] && (
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                              <FaCheck className="mr-1" /> Evaluare trimisă cu succes
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                    <p className="font-medium">Total: {order.total.toFixed(2)} RON</p>
                    <p className="text-sm text-gray-500">Status: {order.status || 'Finalizată'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
