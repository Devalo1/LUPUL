import React, { useState } from 'react';
import FilterBar from '../components/events/FilterBar';
import EventCard from '../components/events/EventCard';
import EventModal from '../components/events/EventModal';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const EventsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { currentUser } = useAuth();

  const events = [
    // Exemplu de date pentru evenimente
    {
      id: '1',
      title: 'Atelier de mindfulness',
      date: '2023-07-15',
      time: '15:00',
      location: 'București',
      imageUrl: 'https://via.placeholder.com/400x200',
      isLive: false,
    },
    {
      id: '2',
      title: 'Sesiune de terapie de grup',
      date: '2023-07-10',
      time: '10:00',
      location: 'Cluj-Napoca',
      imageUrl: 'https://via.placeholder.com/400x200',
      isLive: true,
    },
    {
      id: '3',
      title: 'Eveniment trecut',
      date: '2023-06-01',
      time: '18:00',
      location: 'Iași',
      imageUrl: 'https://via.placeholder.com/400x200',
      isLive: false,
    },
  ];

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    if (filter === 'upcoming') return eventDate >= today;
    if (filter === 'past') return eventDate < today;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <FilterBar filter={filter} setFilter={setFilter} />
      <motion.div
        className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => setSelectedEvent(event)}
          />
        ))}
      </motion.div>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default EventsPage;
