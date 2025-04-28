interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  className = "",
  text
}) => {
  const sizeClass = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  }[size];
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClass}`}></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
