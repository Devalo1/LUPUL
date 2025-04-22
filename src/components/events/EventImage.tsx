import React, { useState } from "react";

interface EventImageProps {
  imageUrl: string;
  eventId: string;
  title: string;
  className?: string;
}

/**
 * Componentă specializată pentru afișarea imaginilor de evenimente
 * Cu gestionare avansată a erorilor și fallback pentru imagini
 */
const EventImage: React.FC<EventImageProps> = ({ imageUrl, eventId, title, className = "" }) => {
  const [imageSrc, setImageSrc] = useState<string>(imageUrl || "");
  const [hasError, setHasError] = useState<boolean>(false);

  // Mapare specifică pentru evenimente cunoscute
  const eventImageMap: Record<string, string> = {
    "z082QKm5JqvvxeLQjfmz": "/images/Afis 2.jpg",
    // Adaugă alte evenimente specifice după nevoie
  };

  const handleImageError = () => {
    // Înregistrăm eroarea
    console.log("Eroare la încărcarea imaginii de eveniment:", imageSrc);
    setHasError(true);

    // Verificăm dacă avem o mapare specifică pentru acest eveniment
    if (eventId && eventImageMap[eventId]) {
      console.log(`Folosim imaginea specifică pentru evenimentul ${eventId}`);
      setImageSrc(eventImageMap[eventId]);
      return;
    }

    // Încercăm să corectăm calea dacă este posibil
    if (imageSrc.includes("public/images/")) {
      setImageSrc(imageSrc.replace("public/images/", "/images/"));
    } else if (imageSrc.includes("public\\images\\")) {
      setImageSrc(imageSrc.replace("public\\images\\", "/images/"));
    } else if (!imageSrc.startsWith("http") && !imageSrc.startsWith("/") && imageSrc.includes("/")) {
      // Dacă e o cale relativă fără slash inițial
      setImageSrc(`/images/${imageSrc.split("/").pop()}`);
    } else if (imageSrc === imageUrl || hasError) {
      // Dacă toate încercările eșuează, folosim imaginea default
      setImageSrc("/images/BussinesLider.jpg");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={title || "Eveniment"}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  );
};

export default EventImage;