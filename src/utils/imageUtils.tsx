/**
 * Utilități pentru procesarea și afișarea imaginilor
 */

/**
 * Procesează URL-ul imaginii pentru a returna un URL valid
 * Rezolvă probleme comune cu URL-urile de imagine
 * @param url URL-ul imaginii de procesat
 * @returns URL procesat sau null dacă URL-ul nu este valid
 */
export const processImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Verificăm dacă URL-ul este unul relativ (fără http/https)
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
    // Adăugăm calea completă pentru resursele locale
    return url.startsWith("/") ? `${window.location.origin}${url}` : `${window.location.origin}/${url}`;
  }
  
  return url;
};

/**
 * Obține inițialele dintr-un nume complet
 * @param name Numele complet din care să se extragă inițialele
 * @returns Inițialele (max 2 caractere)
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generează o culoare consistentă pentru avatar bazată pe string
 * @param input String-ul pe baza căruia se generează culoarea
 * @returns Codul de culoare CSS
 */
export const getAvatarColor = (input: string | null | undefined): string => {
  if (!input) return "#6b7280"; // gray-500 default
  
  // Generează un număr bazat pe string-ul de intrare
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Creează o paletă de culori predefinite pentru consistență vizuală
  const colors = [
    "#4f46e5", // indigo-600
    "#2563eb", // blue-600
    "#0891b2", // cyan-600
    "#0d9488", // teal-600
    "#059669", // emerald-600
    "#16a34a", // green-600
    "#65a30d", // lime-600
    "#ca8a04", // yellow-600
    "#d97706", // amber-600
    "#ea580c", // orange-600
    "#dc2626", // red-600
    "#e11d48", // rose-600
    "#c026d3", // fuchsia-600
    "#7c3aed", // violet-600
  ];
  
  // Folosim hash-ul pentru a alege o culoare din paletă
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Funcție de debug pentru URL-uri de imagini
 * @param url URL-ul de analizat
 * @returns Informații despre URL pentru debugging
 */
export const debugImageUrl = (url: string | null | undefined): string => {
  if (!url) return "URL is null or undefined";
  
  const processed = processImageUrl(url);
  return `Original: ${url}\nProcessed: ${processed}`;
};