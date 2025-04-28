// filepath: d:\LUPUL\my-typescript-app\src\models\Event.server.ts
// Server-side Event model using Mongoose - only for Node.js environment
import mongoose, { Document, Schema, Model } from "mongoose";

// Event Document interface
export interface IEventDocument extends Document {
  title: string;
  description: string;
  date: Date;
  time?: string;
  location: string;
  imageUrl?: string;
  capacity?: number;
  registeredUsers?: string[];
  active: boolean;
}

// Event schema definition
const EventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String, required: true },
    imageUrl: { type: String },
    capacity: { type: Number, default: 0 },
    registeredUsers: [{ type: String }],
    active: { type: Boolean, default: true }
  }, 
  { timestamps: true }
);

// Create or get the model
const Event = mongoose.models.Event as Model<IEventDocument> || 
              mongoose.model<IEventDocument>("Event", EventSchema);

export default Event;