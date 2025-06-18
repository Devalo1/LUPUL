import React from "react";
import AISettingsPanel from "../../components/user/AISettingsPanel";
import { useNavigate } from "react-router-dom";

const DashboardAISettings: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <AISettingsPanel onClose={() => navigate(-1)} />
    </div>
  );
};

export default DashboardAISettings;
