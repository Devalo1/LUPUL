import React, { forwardRef, ReactNode } from "react";
import { BaseComponentProps } from "../../types";

interface InputProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label?: ReactNode;
  error?: ReactNode;
  helpText?: ReactNode;
  fullWidth?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  className = "",
  type = "text",
  label,
  error,
  helpText,
  fullWidth = true,
  required = false,
  ...rest
}: InputProps, ref) => {
  const inputClasses = `border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
    ${error ? "border-red-500" : "border-gray-300"}
    ${fullWidth ? "w-full" : ""}
    ${className}`;

  return (
    <div className={`mb-4 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label htmlFor={typeof id === "string" ? id : String(id)} className="block mb-1 font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={typeof id === "string" ? id : String(id)}
        ref={ref}
        type={type}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        {...rest}
      />
      {error && (
        <div id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
      {helpText && !error && (
        <div className="mt-1 text-sm text-gray-500">
          {helpText}
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;