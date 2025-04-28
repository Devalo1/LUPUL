import React from "react";

interface LoadingFallbackProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

/**
 * Componentă pentru afișarea unui indicator de încărcare
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = "Se încarcă...",
  size = "md",
  fullScreen = false
}) => {
  // Dimensiunile spinner-ului în funcție de size
  const spinnerSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  // Clasa pentru dimensiunea textului
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-600 ${spinnerSizes[size]}`} />
      {message && <p className={`mt-4 text-gray-600 ${textSizes[size]}`}>{message}</p>}
    </div>
  );

  // Dacă este fullScreen, centrăm spinner-ul pe toată pagina
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  // În caz contrar, returnăm doar spinner-ul
  return (
    <div className="w-full flex items-center justify-center py-8">
      {spinner}
    </div>
  );
};

export default LoadingFallback;
