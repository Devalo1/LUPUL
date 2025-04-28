import React, { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderColor?: string;
  fallbackSrc?: string; // Sursă de backup dacă imaginea principală nu se încarcă
}

/**
 * Component pentru încărcarea optimizată a imaginilor cu suport pentru
 * lazy loading, WebP, și gestionarea erorilor de încărcare
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  placeholderColor = "#f3f4f6",
  fallbackSrc
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Generează URL-ul pentru WebP dacă sursa este o imagine locală
  useEffect(() => {
    if (error && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setError(false);
      setIsLoading(true);
    } else if (!error) {
      setCurrentSrc(src);
    }
  }, [src, error, fallbackSrc]);

  // Calculează aspectul pentru placeholder
  const aspect = width && height ? (height / width) * 100 : 56.25; // Default 16:9 ratio

  // Gestionează evenimentul de încărcare
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Gestionează erorile de încărcare
  const handleError = () => {
    setIsLoading(false);
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setError(true);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        paddingBottom: `${aspect}%`,
        backgroundColor: isLoading ? placeholderColor : "transparent",
        transition: "background-color 0.3s ease"
      }}
    >
      {/* Placeholderul se afișează doar când imaginea se încarcă */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy" // Activează lazy loading nativ
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
};

export default OptimizedImage;