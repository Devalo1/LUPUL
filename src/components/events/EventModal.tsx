import React from "react";
import { motion } from "framer-motion";

export interface EventModalProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    description?: string;
  };
  onClose: () => void;
  isUserRegistered?: boolean;
  isMobile?: boolean;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, currentUser }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6">
        <button
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300"
          onClick={onClose}
        >
          ✕
        </button>
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          {event.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {event.date} • {event.time} • {event.location}
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {event.description || "Descriere indisponibilă"}
        </p>
        {currentUser ? (
          <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Check-in
          </button>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            <button className="text-blue-600 hover:underline">Autentifică-te</button> pentru a face check-in.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default EventModal;
