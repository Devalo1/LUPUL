import { Request, Response } from "express";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { handleUnknownError } from "../utils/errorTypes";

// Define a proper interface for event data instead of using any
interface EventData {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  imageUrl?: string;
  capacity?: number;
  price?: number;
  featured?: boolean;
  categories?: string[];
  registrationDeadline?: string;
  organizers?: string[];
  [key: string]: unknown; // Allow additional properties without using 'any'
}

// Get all events
export const getEvents = async (_req: Request, res: Response) => {
  try {
    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(events);
  } catch (error) {
    const err = handleUnknownError(error);
    res.status(500).json({ 
      error: err.message || "Error fetching events",
      code: err.code
    });
  }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eventDoc = await getDoc(doc(db, "events", id));
    
    if (!eventDoc.exists()) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.status(200).json({
      id: eventDoc.id,
      ...eventDoc.data()
    });
  } catch (error) {
    const err = handleUnknownError(error);
    res.status(500).json({ 
      error: err.message || "Error fetching event",
      code: err.code
    });
  }
};

// Create new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const newEvent: EventData = req.body;
    const docRef = await addDoc(collection(db, "events"), newEvent);
    
    res.status(201).json({
      id: docRef.id,
      ...newEvent
    });
  } catch (error) {
    const err = handleUnknownError(error);
    res.status(500).json({ 
      error: err.message || "Error creating event",
      code: err.code
    });
  }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eventData: EventData = req.body;
    
    const eventRef = doc(db, "events", id);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    await updateDoc(eventRef, eventData);
    
    res.status(200).json({
      id,
      ...eventData
    });
  } catch (error) {
    const err = handleUnknownError(error);
    res.status(500).json({ 
      error: err.message || "Error updating event",
      code: err.code
    });
  }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eventRef = doc(db, "events", id);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    await deleteDoc(eventRef);
    
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    const err = handleUnknownError(error);
    res.status(500).json({ 
      error: err.message || "Error deleting event",
      code: err.code
    });
  }
};