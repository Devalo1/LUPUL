import React, { useState, useEffect, memo } from "react";
import { performanceUtil } from "../utils/performance";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  lazy?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componentă pentru optimizarea și încărcarea eficientă a imaginilor
 * Suportă lazy loading și placeholder în timpul încărcării
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height,
  className = "",
  quality = 80,
  lazy = true,
  objectFit = "cover",
  placeholderColor = "lightgray",
  onLoad,
  onError,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Generăm URL-ul optimizat
  const optimizedSrc = performanceUtil.optimizeImageUrl(src, width, quality);
  
  // Generăm placeholder-ul
  const placeholder = performanceUtil.generatePlaceholder(
    width, 
    height || width * 0.75, 
    placeholderColor
  );

  // Creem un tracker pentru performanță
  useEffect(() => {
    const imageName = src.split("/").pop() || src;
    performanceUtil.mark(`image-load-start-${imageName}`);
    
    return () => {
      if (loaded) {
        performanceUtil.mark(`image-load-end-${imageName}`);
        performanceUtil.measure(
          `image-load-duration-${imageName}`,
          `image-load-start-${imageName}`,
          `image-load-end-${imageName}`
        );
      }
    };
  }, [src, loaded]);

  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  return (
    <div 
      className={`optimized-image-container ${className}`}
      style={{ 
        position: "relative",
        overflow: "hidden",
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        backgroundColor: placeholderColor,
      }}
    >
      {!loaded && !error && (
        <div 
          className="optimized-image-placeholder"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${placeholder})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 1,
          }}
        />
      )}
      
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? "lazy" : "eager"}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: loaded ? "block" : "none",
          width: "100%",
          height: "100%",
          objectFit,
          position: "relative",
          zIndex: 2,
        }}
      />
      
      {error && (
        <div 
          className="optimized-image-error"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f8f8",
            color: "#666",
            zIndex: 3,
          }}
        >
          {`Nu s-a putut încărca imaginea: ${alt}`}
        </div>
      )}
    </div>
  );
};

// Folosim memo pentru a preveni re-renderizări inutile
export default memo(OptimizedImage);