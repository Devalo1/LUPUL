// Acest fișier ajută la fixarea problemei de inițializare a icon-urilor în producție
import * as FaIcons from "react-icons/fa";
import * as RiIcons from "react-icons/ri";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

// Exportă acest fix pentru a putea fi importat în aplicație
export default function initializeReactIcons() {
  // Verifică dacă suntem în producție
  if (process.env.NODE_ENV === "production") {
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
  return null;
}
