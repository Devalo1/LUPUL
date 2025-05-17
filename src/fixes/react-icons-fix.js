// Acest fișier ajută la fixarea problemei de inițializare a icon-urilor în producție
import * as FaIcons from "react-icons/fa";
import * as RiIcons from "react-icons/ri";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

// Exportă acest fix pentru a putea fi importat în aplicație
export default function initializeReactIcons() {
  // Verificăm în două moduri diferite dacă suntem în producție pentru a ne asigura
  const isProd = 
    (process.env.NODE_ENV === "production") ||
    (import.meta && import.meta.env && import.meta.env.MODE === "production");
  
  if (isProd) {
    // Forțează inițializarea modulelor react-icons pentru a evita eroarea "Cannot access 'e' before initialization"
    // Acest cod doar forțează încărcarea modulelor înainte ca acestea să fie utilizate în aplicație
    const iconRefs = {
      fa: Object.keys(FaIcons).length,
      ri: Object.keys(RiIcons).length,
      ai: Object.keys(AiIcons).length,
      io: Object.keys(IoIcons).length
    };
    
    console.log("React Icons initialized:", iconRefs);
    return iconRefs;
  }
  
  console.log("Development mode: skipping React Icons initialization");
  return null;
}
