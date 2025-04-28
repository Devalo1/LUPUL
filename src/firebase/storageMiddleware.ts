// Această funcție modifică global comportamentul fetch pentru a intercepta 
// și corecta toate cererile către Firebase Storage, adăugând parametrul alt=media
// dacă lipsește și este necesar

let originalFetch = window.fetch;

// Înlocuim fetch global cu versiunea noastră îmbunătățită
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  // Verificăm dacă este o cerere către Firebase Storage și necesită intervenție
  if (typeof input === "string" && 
      input.includes("firebasestorage.googleapis.com") && 
      !input.includes("alt=media")) {
    
    // Adăugăm parametrul alt=media necesar
    const modifiedUrl = `${input}${input.includes("?") ? "&" : "?"}alt=media`;
    console.error("Critical error in storage middleware:", {
      original: input,
      modified: modifiedUrl
    });
    
    // Folosim URL-ul modificat
    return originalFetch.call(this, modifiedUrl, init);
  }
  
  // Pentru alte cereri, folosim fetch original
  return originalFetch.call(this, input, init);
};