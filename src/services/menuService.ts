import axios from "axios";

const API_URL = process.env.NODE_ENV === "production" 
  ? "https://us-central1-lupul-sicorbul.cloudfunctions.net" 
  : "http://localhost:5001/lupul-sicorbul/us-central1";

export interface MenuProduct {
  id: string;
  nume: string;
  descriere: string;
  pret: number;
  inStock: boolean;
  category: string;
  image: string;
}

export interface MenuCategory {
  nume: string;
  produse: MenuProduct[];
  extraInfo?: string[];
}

export interface MenuData {
  [category: string]: MenuCategory;
}

// Meniul nostru hardcodat cu imagini relevante pentru fiecare produs de pe platforme online
export const HARDCODED_MENU: MenuData = {
  // Secțiunea Gogoși
  gogosi: {
    nume: "GOGOȘI",
    produse: [
      {
        id: "gogosi-mica",
        nume: "Mică",
        descriere: "3 gogoși proaspete",
        pret: 10,
        inStock: true,
        category: "gogosi",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=500&auto=format&fit=crop"
      },
      {
        id: "gogosi-mare",
        nume: "Mare",
        descriere: "5 gogoși proaspete",
        pret: 15,
        inStock: true,
        category: "gogosi",
        image: "https://images.pexels.com/photos/3656119/pexels-photo-3656119.jpeg?auto=compress&cs=tinysrgb&w=500"
      },
      {
        id: "glazura-ciocolata",
        nume: "Opțiune glazură ciocolată",
        descriere: "Adaos pentru orice porție",
        pret: 2,
        inStock: true,
        category: "topping",
        image: "https://images.unsplash.com/photo-1575377222312-dd1a63a51638?q=80&w=500&auto=format&fit=crop"
      }
    ],
    extraInfo: ["Arome disponibile: ciocolată, ciocolată albă, fructe de pădure, căpșuni, caramel, kiwi, dulceață, etc."]
  },
  
  // Secțiunea Cafea
  cafea: {
    nume: "CAFEA",
    produse: [
      {
        id: "espresso",
        nume: "Espresso",
        descriere: "Cafea espresso proaspăt măcinată",
        pret: 5,
        inStock: true,
        category: "cafea",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=500&auto=format&fit=crop"
      },
      {
        id: "cafea-lapte",
        nume: "Cafea cu lapte",
        descriere: "Cafea cu lapte cremos",
        pret: 10,
        inStock: true,
        category: "cafea",
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=500&auto=format&fit=crop"
      },
      {
        id: "cappuccino",
        nume: "Cappuccino",
        descriere: "Cappuccino cu spumă fină de lapte",
        pret: 10,
        inStock: true,
        category: "cafea",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=500&auto=format&fit=crop"
      }
    ]
  },
  
  // Secțiunea Clătite
  clatite: {
    nume: "CLĂTITE",
    produse: [
      {
        id: "clatita",
        nume: "Bucată",
        descriere: "Clătită delicioasă cu diverse arome",
        pret: 8,
        inStock: true,
        category: "clatite",
        image: "https://images.unsplash.com/photo-1565299543923-37dd37887442?q=80&w=500&auto=format&fit=crop"
      }
    ],
    extraInfo: ["Arome disponibile: ciocolată, ciocolată albă, afine, etc."]
  },
  
  // Secțiunea Shake
  shake: {
    nume: "SHAKE",
    produse: [
      {
        id: "shake-ciocolata",
        nume: "Shake ciocolată neagră/albă",
        descriere: "Shake răcoritor cu ciocolată premium",
        pret: 10,
        inStock: true,
        category: "shake",
        image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=500&auto=format&fit=crop"
      },
      {
        id: "shake-proteic",
        nume: "Shake proteic",
        descriere: "Shake nutritiv cu adaos de proteine",
        pret: 12,
        inStock: true,
        category: "shake",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500&auto=format&fit=crop"
      }
    ]
  },
  
  // Secțiunea Oferte Speciale
  oferte: {
    nume: "OFERTĂ SPECIALĂ",
    produse: [
      {
        id: "good-morning",
        nume: "Good Morning",
        descriere: "Porție mică gogoși + cafea (între orele 10-12)",
        pret: 12,
        inStock: true,
        category: "oferte",
        image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?q=80&w=500&auto=format&fit=crop"
      }
    ]
  }
};

export const fetchMenuItems = async (): Promise<MenuData> => {
  // In development mode, check if emulators are likely running
  const isEmulatorRunning = async (): Promise<boolean> => {
    if (process.env.NODE_ENV === "production") return true;
    
    try {
      // Try a quick ping with a short timeout
      await axios.get(`${API_URL}`, { 
        timeout: 500,  // Very short timeout just to check connectivity
      });
      return true;
    } catch (error) {
      console.log("Firebase emulators don't appear to be running, using hardcoded menu data");
      return false;
    }
  };

  // If emulators aren't running in dev mode, return hardcoded data immediately
  if (process.env.NODE_ENV !== "production") {
    const emulatorRunning = await isEmulatorRunning();
    if (!emulatorRunning) {
      return HARDCODED_MENU;
    }
  }
  
  try {
    // Încercăm să obținem datele de la API cu un timeout rezonabil
    const response = await axios.get(`${API_URL}/getMenuItems`, {
      timeout: 3000 // 3 second timeout
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      console.warn("API returned unsuccessful response, using hardcoded menu data");
      return HARDCODED_MENU;
    }
  } catch (error) {
    // More informative error message based on error type
    if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
      console.warn("Connection to menu API refused - emulators may not be running");
    } else if (axios.isAxiosError(error) && error.code === "ETIMEDOUT") {
      console.warn("Connection to menu API timed out");
    } else {
      console.error("Error fetching menu items:", error);
    }
    
    // Always fall back to hardcoded data
    return HARDCODED_MENU;
  }
};

export const fetchMenuCategory = async (category: string): Promise<MenuCategory> => {
  try {
    const response = await axios.get(`${API_URL}/getMenuItems?category=${category}`);
    
    if (response.data && response.data.success) {
      return response.data.data[category];
    } else {
      console.error(`Failed to fetch menu category ${category}:`, response.data);
      // Returnam categoria hardcodata ca backup
      return HARDCODED_MENU[category] || HARDCODED_MENU.gogosi; // Default fallback
    }
  } catch (error) {
    console.error(`Error fetching menu category ${category}:`, error);
    // Returnam categoria hardcodata în caz de eroare
    return HARDCODED_MENU[category] || HARDCODED_MENU.gogosi; // Default fallback
  }
};

export default {
  fetchMenuItems,
  fetchMenuCategory,
  HARDCODED_MENU
};