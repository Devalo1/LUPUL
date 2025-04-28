import React, { useState, useEffect } from "react";
import logger from "../../utils/logger";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  webpSupport?: boolean; // Dacă dorim să încercăm să folosim format WebP
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componentă pentru încărcarea optimizată a imaginilor
 * - Suport WebP automat (dacă este disponibil în browser)
 * - Lazy loading
 * - Placeholder în timpul încărcării
 * - Gestionare erori
 */
const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  webpSupport = true,
  loading = "lazy",
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(src);

  // Verificăm dacă browser-ul suportă WebP
  useEffect(() => {
    // Resetăm starea când sursa se schimbă
    setIsLoading(true);
    setHasError(false);

    // Verificăm suportul WebP doar dacă este activat și imaginea nu este deja WebP
    if (webpSupport && !src.endsWith(".webp") && !src.includes("data:image/webp")) {
      // Dacă imaginea este locală (nu URL extern), încercăm să folosim versiunea WebP
      if (src.startsWith("/") || src.startsWith("./") || src.startsWith("../")) {
        // Construim calea către versiunea WebP
        const webpSrc = src.substring(0, src.lastIndexOf(".")) + ".webp";
        
        // Verificăm dacă există versiunea WebP
        fetch(webpSrc, { method: "HEAD" })
          .then(response => {
            if (response.ok) {
              logger.debug(`Folosim versiunea WebP pentru ${src}`);
              setImageSrc(webpSrc);
            }
          })
          .catch(() => {
            // WebP nu există, folosim sursa originală
            logger.debug(`Nu s-a găsit versiunea WebP pentru ${src}`);
          });
      }
    }
  }, [src, webpSupport]);

  // Handler pentru încărcarea cu succes
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Handler pentru erori
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    logger.warn(`Eroare la încărcarea imaginii: ${src}`);
    
    // Dacă am încercat să folosim WebP dar a eșuat, revenim la sursa originală
    if (imageSrc !== src) {
      logger.debug(`Revenire la sursa originală: ${src}`);
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
    } else if (onError) {
      onError();
    }
  };

  return (
    <div className={`image-loader-container ${className}`} style={{ position: "relative" }}>
      {/* Placeholder în timpul încărcării */}
      {isLoading && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div 
            style={{
              width: "40px", 
              height: "40px", 
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}

      {/* Eroare la încărcare */}
      {hasError && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#f3f4f6",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ef4444",
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span style={{ marginTop: "8px", fontSize: "0.875rem" }}>Eroare la încărcare</span>
        </div>
      )}

      {/* Imaginea propriu-zisă */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        style={{
          display: hasError ? "none" : "block",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* CSS pentru animație */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageLoader;