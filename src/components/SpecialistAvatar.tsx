import React, { useState, useEffect, useMemo } from "react";
import { processImageUrl, getInitials, getAvatarColor, debugImageUrl } from "../utils/imageUtils";

interface SpecialistAvatarProps {
  photoURL?: string | null;
  imageUrl?: string | null;
  name: string;
  id: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "large";
  className?: string;
}

const SpecialistAvatar: React.FC<SpecialistAvatarProps> = ({
  photoURL,
  imageUrl,
  name,
  id,
  size = "md",
  className = ""
}) => {
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  
  // Calculate the effective URL, prioritizing photoURL over imageUrl
  const effectiveUrl = useMemo(() => {
    const url = photoURL || imageUrl;
    if (!url) return "";
    
    // Forțăm reîncărcarea imaginii la fiecare randare, dar păstrăm efectul de memoizare pentru url-ul de bază
    return processImageUrl(url, true);
  }, [photoURL, imageUrl]);
  
  // When URL changes, reset loading state
  useEffect(() => {
    if (!effectiveUrl) {
      setLoadState("error");
      return;
    }
    
    setLoadState("loading");
    
    // Use a real image element to test if the image can load
    const testImage = new Image();
    testImage.onload = () => {
      console.log(`SpecialistAvatar: Image loaded successfully: ${name}`);
      setLoadState("loaded");
    };
    testImage.onerror = (error) => {
      console.error(`SpecialistAvatar: Image failed to load: ${name}`, error);
      setLoadState("error");
    };
    
    // Adăugăm crossOrigin și referrerPolicy pentru a evita erorile CORS
    testImage.crossOrigin = "anonymous";
    testImage.referrerPolicy = "no-referrer";
    
    // Load the image with the processed URL
    testImage.src = effectiveUrl;
    
    return () => {
      testImage.onload = null;
      testImage.onerror = null;
    };
  }, [effectiveUrl, name]);
  
  // Calculate size classes based on the size prop
  const sizeClasses = useMemo(() => {
    switch (size) {
      case "xs": return { container: "h-8 w-8", text: "text-xs" };
      case "sm": return { container: "h-10 w-10", text: "text-sm" };
      case "md": return { container: "h-12 w-12", text: "text-base" };
      case "lg": return { container: "h-16 w-16", text: "text-lg" };
      case "xl": return { container: "h-20 w-20", text: "text-xl" };
      case "large": return { container: "h-24 w-24", text: "text-2xl" }; // Adăugat pentru compatibilitate
      default: return { container: "h-12 w-12", text: "text-base" };
    }
  }, [size]);
  
  // Calculate initials for fallback
  const initials = useMemo(() => getInitials(name), [name]);
  
  // Calculate consistent background color based on ID
  const bgColorClass = useMemo(() => getAvatarColor(id), [id]);
  
  // If URL is invalid or image failed to load, show initials
  if (loadState === "error" || !effectiveUrl) {
    return (
      <div 
        className={`${sizeClasses.container} ${bgColorClass} rounded-full flex items-center justify-center text-white font-bold ${className}`}
        data-testid="specialist-avatar-initials"
      >
        <span className={`${sizeClasses.text}`}>{initials}</span>
      </div>
    );
  }
  
  // If still loading, show loading state with nice animation
  if (loadState === "loading") {
    return (
      <div 
        className={`${sizeClasses.container} bg-gray-200 rounded-full flex items-center justify-center overflow-hidden ${className}`}
        data-testid="specialist-avatar-loading"
      >
        <div className="animate-pulse w-full h-full bg-gray-300 flex items-center justify-center">
          <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
            <path fillRule="evenodd" d="M12 14c-3.859 0-7 3.141-7 7h14c0-3.859-3.141-7-7-7z" />
          </svg>
        </div>
      </div>
    );
  }
  
  // If loaded, show the image
  return (
    <div 
      className={`${sizeClasses.container} rounded-full overflow-hidden ${className}`}
      data-testid="specialist-avatar-image"
    >
      <img
        src={effectiveUrl}
        alt={name || "Specialist"}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onLoad={() => console.log(`Image displayed successfully: ${name}`)}
        onError={(e) => {
          console.error(`Image display failed: ${name}`);
          debugImageUrl(e.currentTarget.src, `SpecialistAvatar - ${name}`);
          setLoadState("error");
        }}
      />
    </div>
  );
};

export default SpecialistAvatar;