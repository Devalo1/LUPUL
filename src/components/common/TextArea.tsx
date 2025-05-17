import React, { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
}

/**
 * Componentă reutilizabilă pentru câmpuri de text multilinie
 */
const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  fullWidth = true,
  helperText,
  className = "",
  id,
  rows = 4,
  ...rest
}) => {
  // Generăm un ID unic dacă nu este furnizat
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 11)}`;
  
  // Calculăm clasele pentru textarea
  const textareaClasses = `
    px-3 py-2 bg-white border rounded-md text-gray-700
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-all
    ${error ? "border-red-500" : "border-gray-300"}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  return (
    <div className={`mb-4 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <textarea
        id={textareaId}
        className={textareaClasses}
        rows={rows}
        {...rest}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default TextArea;