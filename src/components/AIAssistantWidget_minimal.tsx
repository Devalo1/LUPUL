import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAssistantProfile } from "../contexts/useAssistantProfile";
import { getAIAssistantName } from "../utils/aiNameUtils";
import "./AIAssistantWidget.css";

const AIAssistantWidget: React.FC = () => {
  console.log("[AIAssistantWidget] Rendering MINIMAL floating button widget");

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

  // Doar buton plutitor minimalist care deschide AI Messenger
  return (
    <div
      className="ai-assistant-widget__button"
      onClick={handleOpenAIMessenger}
      title={`Deschide chatul cu ${assistantName}`}
    >
      <div className="ai-assistant-widget__button-content">
        <img src={assistantProfile.avatar} alt="AI Assistant" />
      </div>
    </div>
  );
};

export default AIAssistantWidget;
