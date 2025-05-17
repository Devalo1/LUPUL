/**
 * Utility functions for handling images and Firebase Storage URLs
 */

/**
 * Process a Firebase Storage URL to ensure it loads correctly
 * 
 * @param url The URL to process
 * @param forceReload Whether to force reload the image by adding a timestamp
 * @returns A properly formatted URL that will work with Firebase Storage
 */
export const processImageUrl = (url?: string | null, forceReload: boolean = true): string => {
  if (!url) return "";
  
  // Skip processing for empty strings
  if (!url.trim()) return "";
  
  try {
    // Skip processing for data URLs (they're already embedded)
    if (url.startsWith("data:")) return url;
    // Skip processing for relative URLs (local assets)
    if (url.startsWith("/")) return url;
    
    let processedUrl = url;
    
    // Fix all potential incorrect Firebase Storage domains
    // Corectăm toate variantele posibile de bucket-uri
    if (url.includes("appspot.com")) {
      processedUrl = processedUrl.replace("lupulcorbul.appspot.com", "lupulcorbul.firebasestorage.app");
    }
    
    // Ensure we're using the correct storage bucket domain
    const correctBucketDomain = "lupulcorbul.firebasestorage.app";
    const bucketPattern = /lupulcorbul\.(appspot\.com|firebasestorage\.googleapis\.com)/g;
    if (bucketPattern.test(processedUrl)) {
      processedUrl = processedUrl.replace(bucketPattern, correctBucketDomain);
    }
    
    // For Firebase Storage URLs, ensure they have alt=media parameter
    if (processedUrl.includes("firebasestorage.googleapis.com") || 
        processedUrl.includes("storage.googleapis.com") || 
        processedUrl.includes("firebasestorage.app")) {
      // If URL doesn't already have alt=media, add it
      if (!processedUrl.includes("alt=media")) {
        processedUrl = processedUrl + (processedUrl.includes("?") ? "&" : "?") + "alt=media";
      }
    }
    
    // IMPORTANT: Verificăm dacă URL-ul are deja vreun parametru de timestamp pentru a preveni dublarea
    const hasAnyTimestamp = processedUrl.includes("t=") || 
                          processedUrl.includes("_t=") || 
                          processedUrl.includes("_cb=");
    
    // Adăugăm un timestamp pentru a forța reîncărcarea și a evita cache-ul
    // Doar dacă se solicită explicit reload și nu există deja un timestamp
    if (forceReload && !hasAnyTimestamp) {
      processedUrl = processedUrl + (processedUrl.includes("?") ? "&" : "?") + "_t=" + Date.now();
    }
    
    // Logging pentru debugging
    if (url !== processedUrl) {
      console.debug("URL imagine procesat:", { original: url, processed: processedUrl });
    }
    
    return processedUrl;
  } catch (error) {
    console.error("Error processing image URL:", error);
    return url; // Return original URL if processing fails
  }
};

/**
 * Generate initials from a name for avatar display
 * 
 * @param name The name to generate initials from
 * @returns Up to two characters representing the initials
 */
export const getInitials = (name: string): string => {
  if (!name) return "?";
  
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

/**
 * Generate a consistent background color based on a string (usually ID or name)
 * 
 * @param id The string to base the color on
 * @returns A Tailwind CSS class for background color
 */
export const getAvatarColor = (id: string): string => {
  if (!id) return "bg-gray-400";
  
  const colors = [
    "bg-blue-500", "bg-red-500", "bg-green-500", 
    "bg-yellow-500", "bg-purple-500", "bg-pink-500",
    "bg-indigo-500", "bg-teal-500"
  ];
  
  // Generate a consistent color based on the string
  const colorIndex = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    
  return colors[colorIndex];
};

/**
 * Pre-load an image to check if it can be loaded successfully
 * 
 * @param url The image URL to check
 * @returns A promise that resolves to true if the image can be loaded
 */
export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const processedUrl = processImageUrl(url);
    const img = new Image();
    
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    img.src = processedUrl;
  });
};

/**
 * Debug function to check Firebase Storage URLs
 * Call this when an image fails to load to see details in console
 */
export const debugImageUrl = (url: string, context?: string): void => {
  console.group(`🔍 Image URL Debug ${context ? `(${context})` : ""}`);
  console.log("Original URL:", url);
  
  try {
    const processed = processImageUrl(url);
    console.log("Processed URL:", processed);
    
    if (url.includes("firebasestorage.googleapis.com") || url.includes("appspot.com")) {
      console.log("Firebase Storage URL detected");
      console.log("Has alt=media parameter:", url.includes("alt=media"));
      console.log("Has token parameter:", url.includes("token="));
      
      // Try to fetch the image to see if there are CORS or auth issues
      fetch(processImageUrl(url), { method: "HEAD" })
        .then(response => {
          console.log("Response status:", response.status);
          console.log("Response headers:", response.headers);
          if (!response.ok) {
            console.error("Image fetch failed with status:", response.status);
          } else {
            console.log("Image fetch succeeded");
          }
        })
        .catch(error => {
          console.error("Error fetching image:", error);
        });
    }
  } catch (error) {
    console.error("Error during URL processing:", error);
  }
  
  console.groupEnd();
};
