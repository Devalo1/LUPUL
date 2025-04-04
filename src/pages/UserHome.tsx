import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserHome: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Generează un nume pentru afișare dacă nu există
  const displayName = currentUser?.displayName || 
                     (currentUser?.email ? currentUser.email.split('@')[0] : 'Utilizator');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bine ai venit, {displayName}!</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Implicarea ta în comunitate</h2>
        <p className="text-gray-700">Aici poți vedea cum te-ai implicat în comunitatea noastră și ce impact ai avut.</p>
        <Link to="/community" className="text-blue-600 hover:underline">Vezi detalii</Link>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Evenimente viitoare</h2>
        <p className="text-gray-700">Descoperă evenimentele viitoare la care poți participa.</p>
        <Link to="/events" className="text-blue-600 hover:underline">Vezi evenimente</Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Evenimente la care ai participat</h2>
        <p className="text-gray-700">Aici poți vedea evenimentele la care ai participat și impactul tău.</p>
        <Link to="/my-events" className="text-blue-600 hover:underline">Vezi istoricul tău</Link>
      </section>
    </div>
  );
};

export default UserHome;