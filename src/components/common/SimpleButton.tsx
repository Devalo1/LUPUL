import * as React from "react";

export interface SimpleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const SimpleButton: React.FC<SimpleButtonProps> = (props) => {
  const {
    children,
    onClick,
    disabled = false,
    className = "",
    type = "button",
  } = props;

  return React.createElement(
    "button",
    {
      type: type,
      onClick: onClick,
      disabled: disabled,
      className: `px-4 py-2 rounded ${className}`,
    },
    children
  );
};

export default SimpleButton;
