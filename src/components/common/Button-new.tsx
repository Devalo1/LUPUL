import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = "left",
      className = "",
      disabled,
      ...rest
    } = props;

    const variantStyles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      warning:
        "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
      info: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500",
      outline:
        "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
    };

    const sizeStyles = {
      sm: "py-1 px-3 text-sm",
      md: "py-2 px-4 text-base",
      lg: "py-3 px-6 text-lg",
    };

    const widthStyles = fullWidth ? "w-full" : "";
    const stateStyles =
      loading || disabled ? "opacity-70 cursor-not-allowed" : "";

    const buttonClasses = `
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyles}
    ${stateStyles}
    font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors
    ${className}
  `;

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={loading || disabled}
        {...rest}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span>{children}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {icon && iconPosition === "left" && (
              <span className="mr-2">{icon}</span>
            )}
            <span>{children}</span>
            {icon && iconPosition === "right" && (
              <span className="ml-2">{icon}</span>
            )}
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
