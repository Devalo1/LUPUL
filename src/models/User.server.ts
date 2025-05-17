// filepath: d:\LUPUL\my-typescript-app\src\models\User.server.ts
// Server-side User model using Mongoose - only for Node.js environment
import mongoose, { Document, Schema, Model } from "mongoose";

// User Document interface
export interface IUserDocument extends Document {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    newsletter?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}

// User schema
const UserSchema = new Schema<IUserDocument>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    phoneNumber: { type: String },
    emailVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    preferences: {
      newsletter: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Create or get the model
const User = mongoose.models.User as Model<IUserDocument> || 
             mongoose.model<IUserDocument>("User", UserSchema);

export default User;