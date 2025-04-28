import React from "react";
import { BaseComponentProps } from "../../types";

interface CardBaseProps extends BaseComponentProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "elevated";
  noPadding?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const CardBase: React.FC<CardBaseProps> = ({
  children,
  className = "",
  id,
  variant = "default",
  noPadding = false,
  clickable = false,
  onClick,
}) => {
  // Base styles for all cards
  const baseStyles = "rounded-lg overflow-hidden";
  
  // Variant-specific styles
  const variantStyles = {
    default: "bg-white border border-gray-200",
    outline: "bg-transparent border border-gray-300",
    elevated: "bg-white shadow-md hover:shadow-lg transition-shadow duration-300",
  };
  
  // Padding styles
  const paddingStyles = noPadding ? "" : "p-4 sm:p-6";
  
  // Clickable styles
  const clickableStyles = clickable 
    ? "cursor-pointer hover:shadow-md transition-shadow duration-300" 
    : "";
  
  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles} ${clickableStyles} ${className}`;
  
  return (
    <div 
      id={id}
      className={combinedStyles}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default CardBase;
