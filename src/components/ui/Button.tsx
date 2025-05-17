import React from "react";
import { Link } from "react-router-dom";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  href?: string;
  to?: string;
  as?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  onClick,
  type = "button",
  href,
  to,
  as: Component,
  ...rest
}, ref) => {
  // Stilurile de bază
  const baseStyles = "inline-flex items-center justify-center font-medium rounded focus:outline-none transition-colors";
  
  // Stiluri în funcție de dimensiune
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  // Stiluri în funcție de variantă
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "bg-transparent hover:bg-gray-100 text-blue-600 border border-blue-600",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  
  const disabledStyles = "opacity-50 cursor-not-allowed";
  
  const buttonStyles = `
    ${baseStyles} 
    ${sizeStyles[size]} 
    ${variantStyles[variant]} 
    ${disabled ? disabledStyles : ""}
    ${className}
  `;

  // Handle Link component if 'to' prop is provided
  if (to) {
    return (
      <Link to={to} className={buttonStyles} {...rest}>
        {children}
      </Link>
    );
  }

  // Handle external link if 'href' prop is provided
  if (href) {
    return (
      <a href={href} className={buttonStyles} {...rest}>
        {children}
      </a>
    );
  }

  // Handle custom component
  if (Component) {
    return (
      <Component className={buttonStyles} {...rest}>
        {children}
      </Component>
    );
  }

  // Default button
  return (
    <button 
      ref={ref}
      type={type}
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
