// Browser-safe version without Mongoose dependencies

export interface IEvent {
  id?: string;
  title: string;
  description: string;
  date: Date | string;
  time?: string;
  location: string;
  imageUrl?: string;
  capacity?: number;
  registeredUsers?: string[];
  participants?: Array<{
    userId: string;
    name: string;
    joinedAt: any;
    age?: string;
    expectations?: string;
  }>;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Browser-safe implementation - no Mongoose
const Event = {
  // Define methods that will be safe to use in browser
  fromFirebase: (firebaseEvent: any): IEvent => {
    return {
      id: firebaseEvent.id || "",
      title: firebaseEvent.title || "",
      description: firebaseEvent.description || "",
      date: firebaseEvent.date || new Date(),
      time: firebaseEvent.time || "",
      location: firebaseEvent.location || "",
      imageUrl: firebaseEvent.imageUrl || "",
      capacity: firebaseEvent.capacity || 0,
      registeredUsers: firebaseEvent.registeredUsers || [],
      participants: firebaseEvent.participants || [],
      active: firebaseEvent.active !== false, // Default to true
      createdAt: firebaseEvent.createdAt ? new Date(firebaseEvent.createdAt) : new Date(),
      updatedAt: firebaseEvent.updatedAt ? new Date(firebaseEvent.updatedAt) : new Date()
    };
  },
  
  // Helper method to convert to JSON
  toJSON: (event: IEvent): object => {
    return { ...event };
  }
};

export default Event;
