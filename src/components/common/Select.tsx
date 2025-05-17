import React, { forwardRef, ReactNode } from "react";
import { BaseComponentProps } from "../../types";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends BaseComponentProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  options: SelectOption[];
  label?: ReactNode;
  error?: ReactNode;
  helpText?: ReactNode;
  fullWidth?: boolean;
  required?: boolean;
  placeholder?: ReactNode;
}

// Using explicit generic parameters for forwardRef without explicit type annotations on parameters
const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const {
    id,
    className = "",
    label,
    options,
    error,
    helpText,
    fullWidth = true,
    required = false,
    placeholder,
    ...rest
  } = props as SelectProps; // Explicit cast to prevent 'unknown' type issues

  const selectClasses = `appearance-none border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white
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
      <div className="relative">
        <select
          id={typeof id === "string" ? id : String(id)}
          ref={ref}
          className={selectClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option: SelectOption) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
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

Select.displayName = "Select";

export default Select;