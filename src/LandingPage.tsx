import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  onContinue?: () => void;
}

// Landing page component that displays a full-screen overlay with navigation options
const LandingPage: React.FC<LandingPageProps> = ({ onContinue }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Apply styles to body to prevent scrolling while landing page is shown
    document.body.style.overflow = "hidden";
    
    // Cleanup function to restore body styles when unmounted
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const containerStyles: React.CSSProperties = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "9999",
    backgroundImage: "url(\"/images/background.jpeg\")",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  };

  const buttonStyles: React.CSSProperties = {
    display: "block",
    width: "80%",
    maxWidth: "400px",
    padding: "16px",
    margin: "10px 0",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(5px)",
    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.7)"
  };

  // Define the buttons with their colors
  const buttons = [
    { text: "Lupul și Corbul", color: "rgba(5, 150, 105, 0.8)", path: "/home" },
    { text: "Empatie, Conexiune, Echilibru", color: "rgba(124, 58, 237, 0.8)", path: "/values" },
    { text: "LOG-IN", color: "rgba(59, 130, 246, 0.8)", path: "/login" },
    { text: "Creare Cont", color: "rgba(236, 72, 153, 0.8)", path: "/register" },
    { text: "Despre Serviciile Noastre", color: "rgba(245, 158, 11, 0.8)", path: "/services" },
    { text: "Vezi Produsele Noastre", color: "rgba(6, 182, 212, 0.8)", path: "/products" }
  ];

  const handleButtonClick = (path: string) => {
    // Call the onContinue callback if provided
    if (onContinue) {
      onContinue();
    }

    // Navigate to the requested path using React Router
    navigate(path);
  };

  return (
    <div style={containerStyles}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "800px"
      }}>
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(button.path)}
            style={{ ...buttonStyles, backgroundColor: button.color }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }}
          >
            {button.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
