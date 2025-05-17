// Acest fișier ajută la fixarea problemei de inițializare a icon-urilor în producție
import { cache } from "react-icons";

// Pre-încarcă cache-ul pentru a evita eroarea "Cannot access 'e' before initialization"
cache.set("__fix", {});

// Exportă acest fix pentru a putea fi importat în aplicație
export default function initializeReactIcons() {
  // Verifică dacă suntem în producție
  if (process.env.NODE_ENV === "production") {
    // Reține referință la cache pentru a preveni optimizarea
    const cacheRef = cache;
    console.log("React Icons cache initialized");
    return cacheRef;
  }
  return null;
}
