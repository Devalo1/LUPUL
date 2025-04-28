import React, { useState } from "react";
import { processImageUrl, getInitials, getAvatarColor, debugImageUrl } from "../utils/imageUtils";

interface SpecialistCardProps {
  specialistName: string;
  specialistId: string;
  photoURL?: string;
  imageUrl?: string;
  role?: string;
  serviceType?: string;
  description?: string;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Componentă specializată pentru afișarea cardului unui specialist
 * Gestionează corect imaginile de profil din Firebase Storage
 */
const SpecialistCard: React.FC<SpecialistCardProps> = ({
  specialistName,
  specialistId,
  photoURL,
  imageUrl,
  role,
  serviceType,
  description,
  isSelected,
  onSelect
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Folosește primul URL valid disponibil
  const effectivePhotoUrl = processImageUrl(photoURL || imageUrl);
  const initials = getInitials(specialistName);
  const bgColor = getAvatarColor(specialistId);
  
  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Debug the image URL when it fails to load
    debugImageUrl(e.currentTarget.src, `SpecialistCard - ${specialistName}`);
    setImageError(true);
  };
  
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition shadow-sm hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col md:flex-row items-center mb-3">
        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 mb-3 md:mb-0 transition transform hover:scale-105 shadow relative">
          {/* Show initials when there's no image or image failed to load */}
          {(!effectivePhotoUrl || imageError) ? (
            <div className={`w-full h-full ${bgColor} flex items-center justify-center text-white`}>
              <div className="text-xl font-bold">{initials}</div>
            </div>
          ) : (
            <>
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div className="w-full h-full bg-gray-200 absolute top-0 left-0 flex items-center justify-center">
                  <div className="animate-pulse w-full h-full bg-gray-300" />
                </div>
              )}
              
              {/* Actual image */}
              <img
                src={effectivePhotoUrl}
                alt={specialistName}
                className={`w-full h-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            </>
          )}
        </div>
        
        <div className="md:ml-4 text-center md:text-left flex-grow">
          <h3 className="font-semibold text-lg">{specialistName}</h3>
          <p className="text-gray-600">{role || "Specialist"}</p>
          {serviceType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {serviceType}
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mt-2 border-t pt-2">
        {description || "Specialist în domeniul sănătății și stării de bine."}
      </p>
    </div>
  );
};

export default SpecialistCard;