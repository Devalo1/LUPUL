import React, { useEffect } from "react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
  fullScreen?: boolean;
  timeout?: number; // Add timeout property
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  text,
  fullScreen = false,
  timeout = 10000 // Default 10 second timeout
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  // Add safety timeout to automatically hide spinner if it gets stuck
  useEffect(() => {
    if (fullScreen) {
      const timer = setTimeout(() => {
        // Find and remove the spinner if it's still there after timeout
        const spinners = document.querySelectorAll(".loading-spinner-container");
        spinners.forEach(spinner => {
          if (spinner.parentNode) {
            spinner.classList.add("fade-out");
            setTimeout(() => {
              if (spinner.parentNode) {
                spinner.parentNode.removeChild(spinner);
              }
            }, 500);
          }
        });
        
        // Re-enable scrolling just in case
        document.body.style.overflow = "auto";
      }, timeout);
      
      return () => clearTimeout(timer);
    }
  }, [fullScreen, timeout]);

  const spinner = (
    <div className="flex flex-col items-center justify-center loading-spinner-inner">
      <div className={`animate-spin rounded-full border-b-2 border-${color}-600 ${sizeClasses[size]}`} style={{animationDuration: "0.8s"}}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 loading-spinner-container">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
