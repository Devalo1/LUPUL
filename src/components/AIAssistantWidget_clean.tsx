import React from "react";
import "./AIAssistantWidget.css";
import { useAssistantProfile } from "../contexts/useAssistantProfile";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getAIAssistantName } from "../utils/aiNameUtils";

// STILURI INLINE PENTRU A FORȚA APLICAREA
const widgetStyles = {
  button: {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    zIndex: 99999,
    cursor: "pointer",
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    boxShadow:
      "0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease-in-out",
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    width: "100%",
    height: "100%",
  },
  image: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    objectFit: "cover" as const,
  },
};

const AIAssistantWidget: React.FC = () => {
  console.log("[AIAssistantWidget] Rendering floating button widget");

  const { profileState } = useAssistantProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const assistantProfile = profileState.current;

  // Obține numele personalizat din setările AI specifice utilizatorului
  const assistantName = getAIAssistantName(
    undefined,
    user ? { name: user.displayName || undefined } : undefined,
    user?.uid
  );

  const handleOpenAIMessenger = () => {
    navigate("/ai-messenger");
  };

  // Nu afișa widget-ul dacă utilizatorul nu este autentificat
  if (!user) {
    return null;
  }

  // Nu afișa widget-ul pe pagina dedicată AI Messenger
  if (location.pathname === "/ai-messenger") {
    return null;
  }

  // Doar buton plutitor - fără modal sau chat window
  return (
    <div
      className="ai-assistant-widget__button"
      onClick={handleOpenAIMessenger}
      title={`Deschide chatul cu ${assistantName}`}
      style={widgetStyles.button}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div
        className="ai-assistant-widget__button-content"
        style={widgetStyles.buttonContent}
      >
        <img
          src={assistantProfile.avatar}
          alt="AI Assistant"
          style={widgetStyles.image}
        />
      </div>
    </div>
  );
};

export default AIAssistantWidget;
