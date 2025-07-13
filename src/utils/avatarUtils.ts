/**
 * Utilități pentru procesarea imaginilor avatar
 */

/**
 * Redimensionează și optimizează o imagine pentru avatar
 * @param file - Fișierul imagine original
 * @param maxSize - Dimensiunea maximă în pixeli (default: 128px)
 * @param quality - Calitatea imaginii (0-1, default: 0.8)
 * @returns Promise<string> - Imagine optimizată ca base64
 */
export const processAvatarImage = async (
  file: File,
  maxSize: number = 128,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculează dimensiunile păstrând aspectul
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      // Setează dimensiunile canvas-ului
      canvas.width = width;
      canvas.height = height;

      // Desenează imaginea redimensionată
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertește în base64 optimizat
      const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);

      // Verifică dimensiunea rezultatului
      if (optimizedDataUrl.length > 50000) {
        // ~50KB
        console.warn(
          "Imaginea avatar este încă mare după optimizare:",
          optimizedDataUrl.length
        );
      }

      resolve(optimizedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Nu s-a putut încărca imaginea"));
    };

    // Încarcă imaginea
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error("Nu s-a putut citi fișierul"));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validează și curăță un URL/base64 de avatar
 * @param avatarData - URL sau base64 string
 * @param userId - ID-ul utilizatorului pentru avatar personalizat
 * @returns string - Avatar curat sau URL default personalizat
 */
export const validateAvatarData = (
  avatarData: string | null | undefined,
  userId?: string
): string => {
  if (!avatarData || avatarData.trim() === "") {
    return generateDefaultAvatar(userId);
  }

  // Dacă este un URL obișnuit
  if (avatarData.startsWith("http") || avatarData.startsWith("/")) {
    return avatarData;
  }

  // Dacă este base64, verifică dimensiunea
  if (avatarData.startsWith("data:image/")) {
    if (avatarData.length > 100000) {
      // ~100KB
      console.warn(
        "Avatar base64 prea mare, se folosește default:",
        avatarData.length
      );
      return generateDefaultAvatar(userId);
    }
    return avatarData;
  }

  // Dacă nu este un format valid, returnează default personalizat
  return generateDefaultAvatar(userId);
};

/**
 * Detectează dacă o imagine este coruptă sau invalidă
 * @param src - URL-ul imaginii
 * @returns Promise<boolean> - true dacă imaginea este validă
 */
export const isValidImageSrc = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * Generează un avatar default personalizat pe baza ID-ului utilizatorului
 * @param userId - ID-ul utilizatorului
 * @returns string - URL-ul avatarului generat
 */
export const generateDefaultAvatar = (userId?: string): string => {
  if (!userId) {
    return "/default-ai-avatar.svg";
  }

  // Generează un hash simplu din userId pentru consistență
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convertește la număr pozitiv
  const positiveHash = Math.abs(hash);

  // Array de avataruri disponibile
  const avatarOptions = [
    "/avatars/ai-avatar-1.svg",
    "/avatars/ai-avatar-2.svg",
    "/avatars/ai-avatar-3.svg",
    "/avatars/ai-avatar-4.svg",
    "/avatars/ai-avatar-5.svg",
    "/avatars/ai-avatar-6.svg",
  ];

  // Selectează un avatar pe baza hash-ului
  const selectedIndex = positiveHash % avatarOptions.length;
  return avatarOptions[selectedIndex];
};
