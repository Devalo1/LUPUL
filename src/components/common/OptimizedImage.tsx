import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: '1x1' | '4x3' | '16x9' | '3x4';
  placeholderColor?: string;
  loadingEffect?: 'blur' | 'fade';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componentă pentru afișarea imaginilor optimizate cu încărcare lazy
 * și suport pentru plasare de placeholder în timpul încărcării
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio,
  placeholderColor = '#f3f4f6',
  loadingEffect = 'fade',
  priority = false,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Definim clasa pentru container pe baza aspect ratio-ului
  const containerClass = aspectRatio ? `aspect-ratio-${aspectRatio}` : '';

  useEffect(() => {
    // Omitem lazy loading pentru imaginile prioritare
    if (priority) {
      setIsLoaded(true);
      setIsVisible(true);
      return;
    }

    // Configurăm observer-ul pentru lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Încarcă imaginea când este la 200px distanță de viewport
        threshold: 0.01,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setError(true);
    if (onError) onError();
  };

  // Generăm stilurile pentru placeholder
  const placeholderStyle = {
    backgroundColor: placeholderColor,
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
  };

  // Clasa pentru efectele de loading
  const imageLoadingClass = loadingEffect === 'blur' ? 'blur-up' : 'lazy-load';
  const imageLoadedClass = isLoaded ? (loadingEffect === 'blur' ? 'lazyloaded' : 'loaded') : '';

  return (
    <div
      className={`img-container ${containerClass} ${className}`}
      style={placeholderStyle}
      ref={imageRef}
    >
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={`${imageLoadingClass} ${imageLoadedClass}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          style={{
            width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
            height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}

      {error && (
        <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-500">
          <span>Imagine indisponibilă</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;