import React, { forwardRef, ReactNode } from "react";
import { BaseComponentProps } from "../../types";

interface CheckboxProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  label: ReactNode;
  error?: ReactNode;
  helpText?: ReactNode;
}

// Using explicit generic parameters for forwardRef
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    id,
    className = "",
    label,
    error,
    helpText,
    disabled = false,
    ...rest
  } = props as CheckboxProps; // Explicit cast to prevent 'unknown' type issues

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          id={typeof id === "string" ? id : String(id)}
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
          disabled={disabled}
          {...rest}
        />
        <label 
          htmlFor={typeof id === "string" ? id : String(id)} 
          className={`ml-2 block text-sm text-gray-700 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {label}
        </label>
      </div>
      {error && (
        <div className="mt-1 text-sm text-red-600">
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

Checkbox.displayName = "Checkbox";

export default Checkbox;