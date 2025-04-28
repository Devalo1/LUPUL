import React, { useState, useEffect } from "react";
import { processImageUrl, getInitials, getAvatarColor, debugImageUrl } from "../utils/imageUtils";

interface ProfileImageProps {
  src?: string | null;
  alt?: string;
  name?: string;
  id?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
  className?: string;
  round?: boolean;
  fallbackSrc?: string;
}

/**
 * Unified profile image component for consistent display across the application
 * Handles Firebase Storage URLs, fallbacks to initials, and provides loading states
 */
const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt = "Profile Image",
  name = "",
  id,
  size = "md",
  className = "",
  round = true,
  fallbackSrc
}) => {
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  
  // Process the URL for Firebase Storage
  const imageUrl = processImageUrl(src);
  
  // Generate identifier for color/initials - use name if provided, otherwise id
  const identifier = name || id || alt;
  
  // Generate initials for the fallback
  const initials = getInitials(identifier);
  
  // Get a consistent background color based on identifier
  const bgColor = getAvatarColor(id || name || "");
  
  // Handle image loading state
  useEffect(() => {
    if (!imageUrl) {
      setLoadState("error");
      return;
    }
    
    setLoadState("loading");
    
    const img = new Image();
    img.onload = () => {
      console.log("Image loaded successfully:", imageUrl);
      setLoadState("loaded");
    };
    img.onerror = () => {
      console.error("Error loading image:", imageUrl);
      // Add debugging to identify the problem
      debugImageUrl(src || "", "ProfileImage error");
      setLoadState("error");
    };
    
    // Use the processed URL directly, as processImageUrl already adds a timestamp
    img.src = imageUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, src]);
  
  // Calculate size classes based on size prop
  const getSizeClasses = () => {
    if (typeof size === "number") {
      return `h-${size} w-${size}`;
    }
    
    switch (size) {
      case "xs": return "h-8 w-8 text-xs";
      case "sm": return "h-10 w-10 text-sm";
      case "md": return "h-12 w-12 text-base";
      case "lg": return "h-16 w-16 text-lg";
      case "xl": return "h-20 w-20 text-xl";
      case "2xl": return "h-24 w-24 text-2xl";
      default: return "h-12 w-12 text-base";
    }
  };
  
  const sizeClasses = getSizeClasses();
  const roundedClasses = round ? "rounded-full" : "rounded-md";
  
  // Fallback to initials when no image or error loading
  if (!imageUrl || loadState === "error") {
    // Use fallback image if provided
    if (fallbackSrc) {
      return (
        <div className={`${sizeClasses} ${roundedClasses} overflow-hidden bg-gray-100 ${className}`}>
          <img 
            src={fallbackSrc} 
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If fallback fails, show initials
              const target = e.currentTarget;
              target.style.display = "none";
              target.parentElement?.classList.add(bgColor);
              target.parentElement?.classList.add("flex", "items-center", "justify-center");
              const initialsElement = document.createElement("span");
              initialsElement.className = "font-medium text-white";
              initialsElement.innerText = initials;
              target.parentElement?.appendChild(initialsElement);
            }}
          />
        </div>
      );
    }
    
    // No fallback image, show initials with background color
    return (
      <div 
        className={`${sizeClasses} ${roundedClasses} ${bgColor} flex items-center justify-center text-white ${className}`}
        aria-label={alt}
      >
        <span className="font-medium">{initials}</span>
      </div>
    );
  }
  
  // Show loading state with placeholder
  if (loadState === "loading") {
    return (
      <div 
        className={`${sizeClasses} ${roundedClasses} bg-gray-200 overflow-hidden flex items-center justify-center ${className}`}
        aria-label="Loading profile image"
      >
        <div className="animate-pulse w-full h-full bg-gray-300">
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
              <path fillRule="evenodd" d="M12 14c-3.859 0-7 3.141-7 7h14c0-3.859-3.141-7-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  // Show the actual image when loaded successfully
  return (
    <div 
      className={`${sizeClasses} ${roundedClasses} overflow-hidden bg-gray-100 ${className}`}
      aria-label={alt}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Error rendering image:", imageUrl);
          debugImageUrl(src || "", "ProfileImage render error");
          
          // Prevent infinite loop by stopping further rendering attempts
          e.currentTarget.onerror = null;
          
          // Set state to error to trigger fallback display
          setLoadState("error");
        }}
      />
    </div>
  );
};

export default ProfileImage;