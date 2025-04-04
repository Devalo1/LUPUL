import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  as?: React.ElementType;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    as: Component = 'button',
    to,
    href,
    onClick,
    type = 'button',
    disabled = false,
    ...props 
  }, ref) => {
    
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-blue-600 hover:bg-blue-50'
    };
    
    const sizeClasses = {
      sm: 'text-sm px-2 py-1 rounded',
      md: 'px-4 py-2 rounded-md',
      lg: 'text-lg px-6 py-3 rounded-md'
    };
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
    
    // If we're rendering a Link (react-router)
    if (Component === Link && to) {
      return (
        <Link to={to} className={classes} {...props}>
          {children}
        </Link>
      );
    }
    
    // If we're rendering an anchor
    if (Component === 'a' && href) {
      return (
        <a href={href} className={classes} {...props}>
          {children}
        </a>
      );
    }
    
    // Default button
    return (
      <button 
        ref={ref}
        type={type}
        className={classes}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;