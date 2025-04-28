import React from "react";
import { motion } from "framer-motion";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    isLive: boolean;
  };
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const isPast = new Date(event.date) < new Date();

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        {event.isLive && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            Live acum
          </span>
        )}
        {isPast && (
          <span className="absolute top-2 left-2 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded">
            Încheiat
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {event.date} • {event.time}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {event.location}
        </p>
      </div>
    </motion.div>
  );
};

export default EventCard;
