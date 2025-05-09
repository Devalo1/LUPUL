import React from "react";

interface ErrorMessageProps {
  message: string;
  type?: "error" | "warning" | "info";
  onRetry?: () => void;
  onClose?: () => void;
}

/**
 * Componentă pentru afișarea mesajelor de eroare în aplicație
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = "error",
  onRetry,
  onClose
}) => {
  // Definim stiluri diferite în funcție de tipul de mesaj
  const typeStyles = {
    error: {
      background: "bg-red-100",
      border: "border-red-400",
      text: "text-red-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      background: "bg-yellow-100",
      border: "border-yellow-400",
      text: "text-yellow-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      background: "bg-blue-100",
      border: "border-blue-400",
      text: "text-blue-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className={`${currentStyle.background} ${currentStyle.border} ${currentStyle.text} px-4 py-3 rounded-md relative`} role="alert">
      <div className="flex items-center">
        <div className="mr-3">
          {currentStyle.icon}
        </div>
        <div className="flex-grow">
          <p className="font-medium">{message}</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-2"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        )}
      </div>
      
      {onRetry && (
        <div className="mt-2">
          <button
            onClick={onRetry}
            className={`${type === "error" ? "bg-red-600" : type === "warning" ? "bg-yellow-600" : "bg-blue-600"} text-white py-1 px-3 rounded-md text-sm hover:bg-opacity-90 transition-colors`}
          >
            Încearcă din nou
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;