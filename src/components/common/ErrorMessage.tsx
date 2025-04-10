import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
  className?: string;
  showIcon?: boolean;
}

/**
 * Componentă reutilizabilă pentru afișarea mesajelor de eroare cu opțiune de reîncărcare
 * Poate afișa diferite tipuri de mesaje: error, warning sau info
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  type = 'error',
  className = '',
  showIcon = true
}) => {
  // Configurare stiluri în funcție de tip
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      button: 'bg-red-100 hover:bg-red-200 text-red-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentStyle = styles[type];

  return (
    <div className={`${currentStyle.bg} border ${currentStyle.border} rounded-lg p-6 text-center mb-6 ${className}`}>
      <div className={`${currentStyle.text} text-lg mb-3`}>
        {showIcon && currentStyle.icon}
        {message}
      </div>
      
      {onRetry && (
        <button 
          onClick={onRetry} 
          className={`${currentStyle.button} font-semibold py-2 px-4 rounded-md transition-colors duration-200`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reîncarcă
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;