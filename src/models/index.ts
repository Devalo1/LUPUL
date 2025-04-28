import User from "./User";
import Event from "./Event";
import Product from "./Product";
import { isBrowser } from "../utils/environment";

// Only attempt to connect to MongoDB in server environment
export const conecteazaLaDB = async (): Promise<boolean> => {
  if (isBrowser) {
    console.warn("Încercarea de a conecta la MongoDB nu este suportată în browser.");
    return false;
  }
  
  try {
    // Dynamic import to avoid loading mongoose in browser
    const { default: mongoose } = await import("mongoose");
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/lupul-app";
    await mongoose.connect(MONGO_URI);
    console.log("Conectat la MongoDB");
    return true;
  } catch (error) {
    console.error("Eroare la conectarea la MongoDB:", error);
    return false;
  }
};

export { User, Event, Product };
