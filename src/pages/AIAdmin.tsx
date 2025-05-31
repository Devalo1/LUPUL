import React, { useState } from "react";
import AIControlPanel from "../components/AIControlPanel";
import { getTherapyResponse, AI_CONFIG } from "../services/openaiService";
import { type AIProfileType } from "../services/aiProfiles";
import "./AIAdmin.css";

const AIAdmin: React.FC = () => {
  const [testMessage, setTestMessage] = useState("Salut! Cum mă poți ajuta?");
  const [testResponse, setTestResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] =
    useState<AIProfileType>("general");
  const [currentConfig, setCurrentConfig] = useState(AI_CONFIG);

  const handleConfigChange = (config: Partial<typeof AI_CONFIG>) => {
    setCurrentConfig((prev) => ({ ...prev, ...config }));
  };

  const testAI = async () => {
    if (!testMessage.trim()) return;

    setLoading(true);
    try {
      const response = await getTherapyResponse(
        [{ role: "user", content: testMessage }],
        currentProfile,
        currentConfig
      );
      setTestResponse(response);
    } catch (error) {
      setTestResponse(`Eroare: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="ai-admin-container">
      <h1 className="ai-admin-title">Administrare AI Terapie</h1>
      <p className="ai-admin-description">
        Aici poți modifica comportamentul și configurațiile AI-ului pentru
        terapie.
      </p>{" "}
      <AIControlPanel
        onConfigChange={handleConfigChange}
        currentProfile={currentProfile}
        onProfileChange={setCurrentProfile}
      />
      {/* Zona de testare */}
      <div className="test-area">
        <h3>Testează AI-ul</h3>
        <div className="test-input-group">
          <label className="test-label">Mesaj de test:</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="test-textarea"
            placeholder="Scrie un mesaj pentru a testa AI-ul..."
          />
        </div>

        <button
          onClick={testAI}
          disabled={loading || !testMessage.trim()}
          className="test-button"
        >
          {loading ? "Se testează..." : "Testează AI-ul"}
        </button>

        {testResponse && (
          <div className="test-response-container">
            <label className="test-label">Răspunsul AI-ului:</label>
            <div className="test-response-content">{testResponse}</div>
          </div>
        )}
      </div>
      {/* Ghid rapid */}
      <div className="quick-guide">
        <h3>💡 Ghid rapid pentru modificări</h3>
        <ul>
          <li>
            <strong>Profil AI:</strong> Schimbă personalitatea și specializarea
            AI-ului
          </li>
          <li>
            <strong>Model:</strong> GPT-4 e mai inteligent dar mai scump,
            GPT-3.5 e mai rapid
          </li>
          <li>
            <strong>Creativitate:</strong> Mai mică = răspunsuri mai
            consistente, mai mare = mai creative
          </li>
          <li>
            <strong>Lungime răspuns:</strong> Controlează cât de lungi sunt
            răspunsurile
          </li>
          <li>
            <strong>Diversitate vocabular:</strong> Cât de variate sunt
            cuvintele folosite
          </li>
        </ul>
        <p>
          <strong>Sfat:</strong> Testează modificările aici înainte să le aplici
          pe site!
        </p>
      </div>
    </div>
  );
};

export default AIAdmin;
