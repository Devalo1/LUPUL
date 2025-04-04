import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  as?: React.ElementType;
  fullWidth?: boolean;
  to?: string; // Add this prop for React Router Links
  href?: string; // Add this prop for regular anchor links
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    onClick, 
    className = '', 
    disabled = false, 
    type = 'button',
    variant = 'primary',
    size = 'md',
    as: Component = 'button',
    fullWidth = false,
    to,
    href,
    ...rest 
  }, ref) => {
    
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
      outline: 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      white: 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
    
    // If 'to' prop is provided, render a React Router Link
    if (to) {
      return (
        <Link 
          to={to} 
          className={classes}
          {...rest}
        >
          {children}
        </Link>
      );
    }
    
    // If 'href' prop is provided, render an anchor tag
    if (href) {
      return (
        <a 
          href={href} 
          className={classes}
          {...rest}
        >
          {children}
        </a>
      );
    }
    
    if (Component !== 'button') {
      return (
        <Component 
          className={classes} 
          disabled={disabled} 
          ref={ref}
          {...rest}
        >
          {children}
        </Component>
      );
    }
    
    return (
      <button
        ref={ref}
        className={classes}
        onClick={onClick}
        disabled={disabled}
        type={type}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;