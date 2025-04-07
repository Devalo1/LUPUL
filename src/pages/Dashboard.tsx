import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Define custom user type extending Firebase User
interface ExtendedUser {
  firstName?: string;
  address?: {
    city: string;
    country: string;
  };
}

const Dashboard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

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
        }));

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

  // Redirect if not logged in
  if (!loading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }

  const username = (currentUser as unknown as ExtendedUser)?.firstName || currentUser?.displayName?.split(' ')[0] || 'Utilizator';

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
        {/* Profile Summary Card */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center mr-4">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-blue-600">
                  {(currentUser?.displayName?.charAt(0) || '').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{currentUser?.displayName || 'Utilizator'}</h2>
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
                <span className="font-medium">Locație:</span> {(currentUser as unknown as ExtendedUser).address!.city}, {(currentUser as unknown as ExtendedUser).address!.country || 'România'}
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

        {/* Quick Actions Card */}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Servicii
            </button>
            <button 
              onClick={() => navigate('/magazin')}
              className="p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 text-sm font-medium flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Magazin
            </button>
            <button 
              onClick={() => navigate('/programari')}
              className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 text-sm font-medium flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Programări
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm font-medium flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Evenimente
            </button>
          </div>
        </motion.div>

        {/* Upcoming Events/Appointments Card */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4">Programări Viitoare</h2>
          <div className="space-y-3">
            {/* This would be populated with real appointment data */}
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
      
      {/* Recent Activity */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Activitate Recentă</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Achiziție finalizată</p>
                <p className="text-sm text-gray-600">Ai achiziționat "Set de meditație pentru începători"</p>
                <p className="text-xs text-gray-500 mt-1">Acum 2 zile</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

      {/* User's Upcoming Events */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Participările Tale Viitoare</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {eventsLoading ? (
            <div className="text-center">Se încarcă evenimentele...</div>
          ) : eventsError ? (
            <div className="text-center text-red-600">{eventsError}</div>
          ) : events.length === 0 ? (
            <p className="text-gray-600">Nu ești înscris la niciun eveniment viitor.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="bg-white p-4 rounded-md shadow-md">
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-gray-600">{event.date}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
