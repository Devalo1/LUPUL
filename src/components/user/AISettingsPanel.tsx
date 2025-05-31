import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { userAIManager } from "../../services/userAIManager";
import type { UserAIConfig, AdminAILimits } from "../../services/userAIManager";
import { AI_PROFILES, type AIProfileType } from "../../services/aiProfiles";
import { AI_CONFIG } from "../../services/openaiService";
import {
  FaBrain,
  FaRobot,
  FaSlidersH,
  FaTimes,
  FaSave,
  FaUndo,
  FaLock,
  FaInfo,
  FaExclamationTriangle,
} from "react-icons/fa";

interface AISettingsPanelProps {
  onClose: () => void;
}

const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [adminLimits, setAdminLimits] = useState<AdminAILimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estado temporal pentru modificări
  const [tempConfig, setTempConfig] = useState<Partial<typeof AI_CONFIG>>({});
  const [tempActiveProfiles, setTempActiveProfiles] = useState<
    Record<string, AIProfileType>
  >({});

  useEffect(() => {
    if (user?.uid) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Setează utilizatorul curent în manager
      userAIManager.setCurrentUser(user!.uid); // Încarcă configurația utilizatorului
      const config = await userAIManager.loadUserAIConfig();

      // Încarcă limitările admin
      const limits = userAIManager.getAdminLimits();
      setAdminLimits(limits);

      // Inițializează configurația temporară
      if (config) {
        setTempConfig(config.config || {});
        setTempActiveProfiles(config.activeProfiles || {});
      } else {
        // Configurație default pentru utilizatori noi
        setTempConfig({
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        });
        setTempActiveProfiles({
          general: "general",
          psihica: "psihica",
          fizica: "fizica",
        });
      }
    } catch (err) {
      setError("Eroare la încărcarea setărilor AI: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      const newConfig: Partial<UserAIConfig> = {
        config: tempConfig,
        activeProfiles: tempActiveProfiles,
        isEnabled: true,
      };

      const saved = await userAIManager.saveUserAIConfig(newConfig);

      if (saved) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        await loadUserSettings(); // Reîncarcă pentru a reflecta modificările
      } else {
        setError("Nu s-au putut salva setările");
      }
    } catch (err) {
      setError("Eroare la salvarea setărilor: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setTempConfig({
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    setTempActiveProfiles({
      general: "general",
      psihica: "psihica",
      fizica: "fizica",
    });
  };

  const isSettingAllowed = (setting: string): boolean => {
    if (!adminLimits) return false;

    switch (setting) {
      case "temperature":
        return adminLimits.canChangeTemperature;
      case "max_tokens":
        return adminLimits.canChangeMaxTokens;
      case "profiles":
        return adminLimits.allowedProfiles.length > 0;
      default:
        return true;
    }
  };

  const getSliderProps = (setting: string) => {
    switch (setting) {
      case "temperature":
        return {
          min: adminLimits?.minTemperature || 0.1,
          max: adminLimits?.maxTemperature || 1.0,
          step: 0.1,
        };
      case "max_tokens":
        return {
          min: 100,
          max: adminLimits?.maxTokensLimit || 1000,
          step: 50,
        };
      default:
        return { min: 0, max: 1, step: 0.1 };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">
              Se încarcă setările AI...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FaBrain className="text-blue-600 text-2xl mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Setări AI Personale
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Conținutul principal */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <FaSave className="text-green-500 mr-3" />
              <span className="text-green-700">
                Setările au fost salvate cu succes!
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Setări AI */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaSlidersH className="mr-2 text-blue-600" />
                  Parametri AI
                </h3>

                {/* Temperature */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Creativitate (Temperature)
                    </label>
                    {!isSettingAllowed("temperature") && (
                      <FaLock
                        className="text-gray-400 text-sm"
                        title="Restricționat de admin"
                      />
                    )}
                  </div>
                  <input
                    type="range"
                    {...getSliderProps("temperature")}
                    value={tempConfig.temperature || 0.7}
                    onChange={(e) =>
                      setTempConfig({
                        ...tempConfig,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    disabled={!isSettingAllowed("temperature")}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      Conservativ ({adminLimits?.minTemperature || 0.1})
                    </span>
                    <span className="font-medium">
                      {tempConfig.temperature?.toFixed(1)}
                    </span>
                    <span>Creativ ({adminLimits?.maxTemperature || 1.0})</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Lungime răspuns (Tokens)
                    </label>
                    {!isSettingAllowed("max_tokens") && (
                      <FaLock
                        className="text-gray-400 text-sm"
                        title="Restricționat de admin"
                      />
                    )}
                  </div>
                  <input
                    type="range"
                    {...getSliderProps("max_tokens")}
                    value={tempConfig.max_tokens || 500}
                    onChange={(e) =>
                      setTempConfig({
                        ...tempConfig,
                        max_tokens: parseInt(e.target.value),
                      })
                    }
                    disabled={!isSettingAllowed("max_tokens")}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Scurt (100)</span>
                    <span className="font-medium">
                      {tempConfig.max_tokens} tokens
                    </span>
                    <span>Lung ({adminLimits?.maxTokensLimit || 1000})</span>
                  </div>
                </div>

                {/* Setări avansate */}
                <details className="border border-gray-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-3">
                    Setări Avansate
                  </summary>

                  <div className="space-y-4">
                    {/* Top P */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Top P (Diversitate vocabular)
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={tempConfig.top_p || 1.0}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            top_p: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">
                        {tempConfig.top_p?.toFixed(1)}
                      </span>
                    </div>

                    {/* Frequency Penalty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Penalizare repetare (Frequency)
                      </label>
                      <input
                        type="range"
                        min="0.0"
                        max="2.0"
                        step="0.1"
                        value={tempConfig.frequency_penalty || 0.0}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            frequency_penalty: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">
                        {tempConfig.frequency_penalty?.toFixed(1)}
                      </span>
                    </div>

                    {/* Presence Penalty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Penalizare prezență (Presence)
                      </label>
                      <input
                        type="range"
                        min="0.0"
                        max="2.0"
                        step="0.1"
                        value={tempConfig.presence_penalty || 0.0}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            presence_penalty: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">
                        {tempConfig.presence_penalty?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Profile AI */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaRobot className="mr-2 text-green-600" />
                  Profile AI Active
                </h3>

                <div className="space-y-3">
                  {" "}
                  {Object.entries(AI_PROFILES).map(([key, _profile]) => {
                    const isAllowed = adminLimits?.allowedProfiles.includes(
                      key as AIProfileType
                    );
                    const isActive = tempActiveProfiles[key] === key;

                    // Profile display names and descriptions
                    const profileInfo = {
                      general: {
                        name: "General",
                        description:
                          "Consiliere generală pentru probleme personale și emoționale",
                      },
                      psihica: {
                        name: "Terapie Psihică",
                        description:
                          "Terapie cognitivă-comportamentală pentru anxietate și depresie",
                      },
                      fizica: {
                        name: "Terapie Fizică",
                        description:
                          "Reabilitare, exerciții terapeutice și wellness fizic",
                      },
                      nutritionist: {
                        name: "Nutriționist",
                        description:
                          "Sfaturi pentru alimentație sănătoasă și planuri de masă",
                      },
                      coach_personal: {
                        name: "Coach Personal",
                        description:
                          "Dezvoltare personală și atingerea obiectivelor",
                      },
                    }[key] || {
                      name: key,
                      description: "Profil AI personalizat",
                    };

                    return (
                      <div
                        key={key}
                        className={`border rounded-lg p-4 ${
                          isActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        } ${!isAllowed ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800 flex items-center">
                              {profileInfo.name}
                              {!isAllowed && (
                                <FaLock
                                  className="ml-2 text-gray-400 text-sm"
                                  title="Nu este permis de admin"
                                />
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {profileInfo.description}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempActiveProfiles({
                                    ...tempActiveProfiles,
                                    [key]: key as AIProfileType,
                                  });
                                } else {
                                  const newProfiles = { ...tempActiveProfiles };
                                  delete newProfiles[key];
                                  setTempActiveProfiles(newProfiles);
                                }
                              }}
                              disabled={!isAllowed}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informații despre limitări */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaInfo className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      Limitări Administrative
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {adminLimits && (
                        <>
                          <li>
                            • Cereri/oră:{" "}
                            {adminLimits.globalLimits.maxRequestsPerHour}
                          </li>
                          <li>
                            • Cereri/zi:{" "}
                            {adminLimits.globalLimits.maxRequestsPerDay}
                          </li>
                          <li>• Tokens maxim: {adminLimits.maxTokensLimit}</li>
                          {!adminLimits.canChangeModel && (
                            <li>• Modelul AI este fixat de admin</li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Butoane de acțiune */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleResetToDefaults}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaUndo className="mr-2" />
              Resetează la default
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Se salvează...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Salvează setările
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettingsPanel;
