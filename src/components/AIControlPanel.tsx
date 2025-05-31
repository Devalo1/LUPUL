import React, { useState } from "react";
import { AI_CONFIG } from "../services/openaiService";
import { AI_PROFILES, type AIProfileType } from "../services/aiProfiles";
import "./AIControlPanel.css";

interface AIControlPanelProps {
  onConfigChange?: (config: Partial<typeof AI_CONFIG>) => void;
  currentProfile?: AIProfileType;
  onProfileChange?: (profile: AIProfileType) => void;
}

const AIControlPanel: React.FC<AIControlPanelProps> = ({
  onConfigChange,
  currentProfile = "general",
  onProfileChange,
}) => {
  const [config, setConfig] = useState(AI_CONFIG);
  const [selectedProfile, setSelectedProfile] = useState(currentProfile);

  const handleConfigChange = (
    key: keyof typeof AI_CONFIG,
    value: string | number
  ) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleProfileChange = (profile: AIProfileType) => {
    setSelectedProfile(profile);
    onProfileChange?.(profile);
  };

  return (
    <div className="ai-control-panel">
      <h3>Panou de control AI</h3>

      {/* Selector profil AI */}
      <div className="form-group">
        <label htmlFor="ai-profile-select" className="form-label">
          Profil AI:
        </label>
        <select
          id="ai-profile-select"
          value={selectedProfile}
          onChange={(e) => handleProfileChange(e.target.value as AIProfileType)}
          className="form-select"
          aria-label="Selectează profilul AI"
        >
          {Object.keys(AI_PROFILES).map((profile) => (
            <option key={profile} value={profile}>
              {profile.charAt(0).toUpperCase() + profile.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Model selector */}
      <div className="form-group">
        <label htmlFor="ai-model-select" className="form-label">
          Model AI:
        </label>
        <select
          id="ai-model-select"
          value={config.model}
          onChange={(e) => handleConfigChange("model", e.target.value)}
          className="form-select"
          aria-label="Selectează modelul AI"
        >
          <option value="gpt-3.5-turbo">
            GPT-3.5 Turbo (mai rapid, mai ieftin)
          </option>
          <option value="gpt-4">GPT-4 (mai inteligent, mai scump)</option>
          <option value="gpt-4-turbo">GPT-4 Turbo (echilibrat)</option>
        </select>
      </div>

      {/* Temperature slider */}
      <div className="form-group">
        <label htmlFor="temperature-range" className="form-label">
          Creativitate (Temperature): {config.temperature}
        </label>
        <input
          id="temperature-range"
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={config.temperature}
          onChange={(e) =>
            handleConfigChange("temperature", parseFloat(e.target.value))
          }
          className="form-range"
          aria-label={`Creativitate AI: ${config.temperature}`}
          title={`Creativitate AI: ${config.temperature}`}
        />
        <small className="form-help-text">
          0.1 = foarte focusat | 1.0 = foarte creativ
        </small>
      </div>

      {/* Max tokens */}
      <div className="form-group">
        <label htmlFor="max-tokens-range" className="form-label">
          Lungime răspuns (Max tokens): {config.max_tokens}
        </label>
        <input
          id="max-tokens-range"
          type="range"
          min="100"
          max="1000"
          step="50"
          value={config.max_tokens}
          onChange={(e) =>
            handleConfigChange("max_tokens", parseInt(e.target.value))
          }
          className="form-range"
          aria-label={`Lungime răspuns: ${config.max_tokens} tokens`}
          title={`Lungime răspuns: ${config.max_tokens} tokens`}
        />
        <small className="form-help-text">
          100 = răspunsuri scurte | 1000 = răspunsuri detaliate
        </small>
      </div>

      {/* Top P */}
      <div className="form-group">
        <label htmlFor="top-p-range" className="form-label">
          Diversitate vocabular (Top P): {config.top_p}
        </label>
        <input
          id="top-p-range"
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={config.top_p}
          onChange={(e) =>
            handleConfigChange("top_p", parseFloat(e.target.value))
          }
          className="form-range"
          aria-label={`Diversitate vocabular: ${config.top_p}`}
          title={`Diversitate vocabular: ${config.top_p}`}
        />
        <small className="form-help-text">
          0.1 = vocabular limitat | 1.0 = vocabular divers
        </small>
      </div>

      {/* Prompt-ul de sistem curent */}
      <div className="form-group">
        <label htmlFor="system-prompt-textarea" className="form-label">
          Prompt-ul de sistem pentru profilul {selectedProfile}:
        </label>
        <textarea
          id="system-prompt-textarea"
          value={AI_PROFILES[selectedProfile].systemPrompt}
          readOnly
          className="form-textarea"
          aria-label={`Prompt de sistem pentru profilul ${selectedProfile}`}
          title={`Prompt de sistem pentru profilul ${selectedProfile}`}
        />
        <small className="form-help-text">
          Acest prompt definește personalitatea AI-ului pentru profilul curent
        </small>
      </div>
    </div>
  );
};

export default AIControlPanel;
