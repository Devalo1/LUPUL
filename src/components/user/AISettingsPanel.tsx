import React, { useState, useEffect } from "react";
import {
  FaBrain,
  FaTimes,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";
import "../AssistantProfileEdit.css";
import "./AISettingsPanel.css";
import "./AISettingsForm.css";
import { userAIManager } from "../../services/userAIManager";
import { useAuth } from "../../contexts/AuthContext";

interface AISettingsPanelProps {
  onClose: () => void;
}

interface AIPersonalSettings {
  aiType: string;
  aiName: string;
  addressMode: string;
  character: string;
  length: string;
  avatar: string;
  goal: string;
  sex: "masculin" | "feminin" | "neutru";
  conversationStyle: "formal" | "casual" | "prietenos" | "profesional";
  age?: number; // Vârsta pentru personalizarea AI-ului
}

const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AIPersonalSettings>({
    aiType: "general",
    aiName: "",
    addressMode: "Tu",
    character: "prietenos",
    length: "scurt",
    avatar: "",
    goal: "să te ajute cu sfaturi",
    sex: "neutru",
    conversationStyle: "prietenos",
    age: undefined,
  });

  // Încarcă setările existente la mount
  useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    try {
      // Încearcă să încarce din userAIManager dacă utilizatorul este autentificat
      if (user?.uid) {
        const userPrefix = `user_${user.uid}_`;

        userAIManager.setCurrentUser(user.uid);
        const userConfig = await userAIManager.loadUserAIConfig();
        if (userConfig && userConfig.customPrompts) {
          const prompts = userConfig.customPrompts as Record<
            string,
            string | undefined
          >;
          setSettings({
            aiType:
              prompts.aiType ||
              localStorage.getItem(`${userPrefix}ai_type`) ||
              localStorage.getItem("ai_type") ||
              "general",
            aiName:
              prompts.aiName ||
              localStorage.getItem(`${userPrefix}ai_name`) ||
              localStorage.getItem("ai_name") ||
              "",
            addressMode:
              prompts.addressMode ||
              localStorage.getItem(`${userPrefix}ai_addressMode`) ||
              localStorage.getItem("ai_addressMode") ||
              "Tu",
            character:
              prompts.character ||
              localStorage.getItem(`${userPrefix}ai_character`) ||
              localStorage.getItem("ai_character") ||
              "prietenos",
            length:
              prompts.responseLength ||
              localStorage.getItem(`${userPrefix}ai_length`) ||
              localStorage.getItem("ai_length") ||
              "scurt",
            avatar:
              localStorage.getItem(`${userPrefix}ai_avatar`) ||
              localStorage.getItem("ai_avatar") ||
              "",
            goal:
              prompts.goal ||
              localStorage.getItem(`${userPrefix}ai_goal`) ||
              localStorage.getItem("ai_goal") ||
              "să te ajute cu sfaturi",
            sex:
              (prompts.sex as "masculin" | "feminin" | "neutru") ||
              (localStorage.getItem(`${userPrefix}ai_sex`) as
                | "masculin"
                | "feminin"
                | "neutru") ||
              (localStorage.getItem("ai_sex") as
                | "masculin"
                | "feminin"
                | "neutru") ||
              "neutru",
            conversationStyle:
              (prompts.conversationStyle as
                | "formal"
                | "casual"
                | "prietenos"
                | "profesional") ||
              (localStorage.getItem(`${userPrefix}ai_conversationStyle`) as
                | "formal"
                | "casual"
                | "prietenos"
                | "profesional") ||
              (localStorage.getItem("ai_conversationStyle") as
                | "formal"
                | "casual"
                | "prietenos"
                | "profesional") ||
              "prietenos",
            age: prompts.age
              ? parseInt(prompts.age)
              : parseInt(
                  localStorage.getItem(`${userPrefix}ai_user_age`) || "0"
                ) ||
                parseInt(localStorage.getItem("ai_user_age") || "0") ||
                undefined,
          });
          return;
        }
      }

      // Fallback la localStorage specific utilizatorului
      if (user?.uid) {
        const userPrefix = `user_${user.uid}_`;

        const aiType =
          localStorage.getItem(`${userPrefix}ai_type`) ||
          localStorage.getItem("ai_type") ||
          "general";
        const aiName =
          localStorage.getItem(`${userPrefix}ai_name`) ||
          localStorage.getItem("ai_name") ||
          "";
        const addressMode =
          localStorage.getItem(`${userPrefix}ai_addressMode`) ||
          localStorage.getItem("ai_addressMode") ||
          "Tu";
        const character =
          localStorage.getItem(`${userPrefix}ai_character`) ||
          localStorage.getItem("ai_character") ||
          "prietenos";
        const length =
          localStorage.getItem(`${userPrefix}ai_length`) ||
          localStorage.getItem("ai_length") ||
          "scurt";
        const avatar =
          localStorage.getItem(`${userPrefix}ai_avatar`) ||
          localStorage.getItem("ai_avatar") ||
          "";
        const goal =
          localStorage.getItem(`${userPrefix}ai_goal`) ||
          localStorage.getItem("ai_goal") ||
          "să te ajute cu sfaturi";
        const sex =
          (localStorage.getItem(`${userPrefix}ai_sex`) as
            | "masculin"
            | "feminin"
            | "neutru") ||
          (localStorage.getItem("ai_sex") as
            | "masculin"
            | "feminin"
            | "neutru") ||
          "neutru";
        const conversationStyle =
          (localStorage.getItem(`${userPrefix}ai_conversationStyle`) as
            | "formal"
            | "casual"
            | "prietenos"
            | "profesional") ||
          (localStorage.getItem("ai_conversationStyle") as
            | "formal"
            | "casual"
            | "prietenos"
            | "profesional") ||
          "prietenos";
        const age =
          parseInt(localStorage.getItem(`${userPrefix}ai_user_age`) || "0") ||
          parseInt(localStorage.getItem("ai_user_age") || "0") ||
          undefined;
        setSettings({
          aiType,
          aiName,
          addressMode,
          character,
          length,
          avatar,
          goal,
          sex,
          conversationStyle,
          age,
        });
      }
    } catch (err) {
      console.error("Eroare la încărcarea setărilor:", err);

      // Folosește localStorage ca fallback específic utilizatorului
      if (user?.uid) {
        const userPrefix = `user_${user.uid}_`;

        const aiType =
          localStorage.getItem(`${userPrefix}ai_type`) ||
          localStorage.getItem("ai_type") ||
          "general";
        const aiName =
          localStorage.getItem(`${userPrefix}ai_name`) ||
          localStorage.getItem("ai_name") ||
          "";
        const addressMode =
          localStorage.getItem(`${userPrefix}ai_addressMode`) ||
          localStorage.getItem("ai_addressMode") ||
          "Tu";
        const character =
          localStorage.getItem(`${userPrefix}ai_character`) ||
          localStorage.getItem("ai_character") ||
          "prietenos";
        const length =
          localStorage.getItem(`${userPrefix}ai_length`) ||
          localStorage.getItem("ai_length") ||
          "scurt";
        const avatar =
          localStorage.getItem(`${userPrefix}ai_avatar`) ||
          localStorage.getItem("ai_avatar") ||
          "";
        const goal =
          localStorage.getItem(`${userPrefix}ai_goal`) ||
          localStorage.getItem("ai_goal") ||
          "să te ajute cu sfaturi";
        const sex =
          (localStorage.getItem(`${userPrefix}ai_sex`) as
            | "masculin"
            | "feminin"
            | "neutru") ||
          (localStorage.getItem("ai_sex") as
            | "masculin"
            | "feminin"
            | "neutru") ||
          "neutru";
        const conversationStyle =
          (localStorage.getItem(`${userPrefix}ai_conversationStyle`) as
            | "formal"
            | "casual"
            | "prietenos"
            | "profesional") ||
          (localStorage.getItem("ai_conversationStyle") as
            | "formal"
            | "casual"
            | "prietenos"
            | "profesional") ||
          "prietenos";
        const age =
          parseInt(localStorage.getItem(`${userPrefix}ai_user_age`) || "0") ||
          parseInt(localStorage.getItem("ai_user_age") || "0") ||
          undefined;
        setSettings({
          aiType,
          aiName,
          addressMode,
          character,
          length,
          avatar,
          goal,
          sex,
          conversationStyle,
          age,
        });
      }
    }
  };
  const handleSettingChange = (
    key: keyof AIPersonalSettings,
    value: string | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const saveSettings = async () => {
    if (!user?.uid) {
      setError("Trebuie să fii autentificat pentru a salva setările");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Salvează setările specifice utilizatorului cu prefix
      const userPrefix = `user_${user.uid}_`;

      // Salvează în localStorage specific utilizatorului
      localStorage.setItem(`${userPrefix}ai_type`, settings.aiType);
      localStorage.setItem(`${userPrefix}ai_name`, settings.aiName);
      localStorage.setItem(`${userPrefix}ai_addressMode`, settings.addressMode);
      localStorage.setItem(`${userPrefix}ai_character`, settings.character);
      localStorage.setItem(`${userPrefix}ai_length`, settings.length);
      localStorage.setItem(`${userPrefix}ai_avatar`, settings.avatar);
      localStorage.setItem(`${userPrefix}ai_goal`, settings.goal);
      localStorage.setItem(`${userPrefix}ai_sex`, settings.sex);
      localStorage.setItem(
        `${userPrefix}ai_conversationStyle`,
        settings.conversationStyle
      );
      if (settings.age !== undefined) {
        localStorage.setItem(
          `${userPrefix}ai_user_age`,
          settings.age.toString()
        );
      }

      // Salvează și în localStorage pentru compatibilitate cu codul vechi (va fi eliminat treptat)
      localStorage.setItem("ai_type", settings.aiType);
      localStorage.setItem("ai_name", settings.aiName);
      localStorage.setItem("ai_addressMode", settings.addressMode);
      localStorage.setItem("ai_character", settings.character);
      localStorage.setItem("ai_length", settings.length);
      localStorage.setItem("ai_avatar", settings.avatar);
      localStorage.setItem("ai_goal", settings.goal);
      localStorage.setItem("ai_sex", settings.sex);
      localStorage.setItem("ai_conversationStyle", settings.conversationStyle);
      if (settings.age !== undefined) {
        localStorage.setItem("ai_user_age", settings.age.toString());
      }

      // Integrează cu sistemul de user AI management
      userAIManager.setCurrentUser(user.uid);
      const userConfig = {
        config: {},
        activeProfiles: {},
        customPrompts: {
          aiType: settings.aiType,
          aiName: settings.aiName,
          character: settings.character,
          goal: settings.goal,
          addressMode: settings.addressMode,
          responseLength: settings.length,
          sex: settings.sex,
          conversationStyle: settings.conversationStyle,
          age: settings.age !== undefined ? settings.age.toString() : undefined,
        },
        isEnabled: true,
      };

      const saved = await userAIManager.saveUserAIConfig(userConfig);

      if (saved) {
        setSuccess("Setările au fost salvate cu succes!");
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(
          "Nu s-au putut salva setările în sistemul de management"
        );
      }
    } catch (err) {
      console.error("Eroare la salvarea setărilor:", err);
      setError("A apărut o eroare la salvarea setărilor. Încearcă din nou.");
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ai-settings-overlay">
      <div className="ai-settings-modal max-w-4xl w-full max-h-[90vh] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="ai-settings-header">
          <div className="flex items-center">
            <FaBrain className="ai-icon" />
            <h2 className="ai-settings-title">Setări AI Personale</h2>
          </div>
          <button
            onClick={onClose}
            className="ai-settings-close"
            aria-label="Închide panoul de setări AI"
            title="Închide panoul de setări AI"
          >
            <FaTimes />
          </button>
        </div>

        {/* Conținutul principal */}
        <div className="ai-settings-content flex-1 overflow-y-auto">
          {/* Integrare AssistantProfileEdit ca panou lateral */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 ai-settings-form special-form-bg">
              {error && (
                <div className="ai-settings-alert error">
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="ai-settings-alert success">
                  <FaSave />
                  <span>Setările au fost salvate cu succes!</span>
                </div>
              )}{" "}
              <div className="grid grid-cols-1 gap-6">
                {/* Setări AI */}
                <div className="space-y-6">
                  {" "}
                  {/* Tipul de asistent AI */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipul de asistent AI
                    </label>
                    <select
                      className="w-full"
                      value={settings.aiType}
                      onChange={(e) =>
                        handleSettingChange("aiType", e.target.value)
                      }
                      aria-label="Tipul de asistent AI"
                      title="Tipul de asistent AI"
                    >
                      <option value="general">Asistent General</option>
                      <option value="psihica">Terapeut Psihic</option>
                      <option value="fizica">Terapeut Fizic</option>
                    </select>
                  </div>
                  {/* Numele personalizat al AI-ului */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Numele asistentului (opțional)
                    </label>
                    <input
                      className="w-full"
                      type="text"
                      placeholder="Ex: Alex, Maria, Dr. Smith..."
                      value={settings.aiName}
                      onChange={(e) =>
                        handleSettingChange("aiName", e.target.value)
                      }
                      aria-label="Numele asistentului"
                      title="Numele personalizat al asistentului AI"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dacă lași gol, se va afișa numele implicit bazat pe tipul
                      selectat
                    </p>
                  </div>
                  {/* Modul de adresare */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Modul de adresare
                    </label>{" "}
                    <select
                      className="w-full"
                      value={settings.addressMode}
                      onChange={(e) =>
                        handleSettingChange("addressMode", e.target.value)
                      }
                      aria-label="Modul de adresare"
                      title="Modul de adresare"
                    >
                      <option value="Tu">Tu</option>
                      <option value="Dvs">Dvs</option>
                    </select>
                  </div>
                  {/* Caracterul asistentului */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="ai-character-select"
                    >
                      Caracterul asistentului (ex: prietenos, formal, glumeț)
                    </label>{" "}
                    <select
                      id="ai-character-select"
                      className="w-full"
                      value={settings.character}
                      onChange={(e) =>
                        handleSettingChange("character", e.target.value)
                      }
                      aria-label="Caracterul asistentului"
                      title="Caracterul asistentului"
                    >
                      {" "}
                      <option value="prietenos">Prietenos și deschis</option>
                      <option value="empatic">Empatic și înțelegător</option>
                      <option value="glumeț">Glumeț și distractiv</option>
                      <option value="serios">Serios și concentrat</option>
                      <option value="iubitor">Căldoros și iubitor</option>
                      <option value="motivant">
                        Motivant și inspirațional
                      </option>
                      <option value="calm">Calm și liniștit</option>
                      <option value="optimist">Optimist și pozitiv</option>
                      <option value="intelept">Înțelept și reflexiv</option>
                      <option value="energic">Energic și entuziast</option>
                      <option value="patient">Răbdător și înțelegător</option>
                      <option value="creativ">Creativ și inovator</option>
                    </select>{" "}
                  </div>{" "}
                  {/* Sexul asistentului AI */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sexul asistentului AI
                    </label>
                    <select
                      className="w-full"
                      value={settings.sex}
                      onChange={(e) =>
                        handleSettingChange("sex", e.target.value)
                      }
                      aria-label="Sexul asistentului AI"
                      title="Sexul asistentului AI"
                    >
                      <option value="neutru">Neutru</option>
                      <option value="masculin">Masculin</option>
                      <option value="feminin">Feminin</option>
                    </select>
                  </div>
                  {/* Vârsta utilizatorului pentru personalizare AI */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vârsta ta (pentru personalizarea AI-ului)
                    </label>
                    <input
                      className="w-full"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Ex: 25"
                      value={settings.age || ""}
                      onChange={(e) => {
                        const age = e.target.value
                          ? parseInt(e.target.value)
                          : undefined;
                        setSettings((prev) => ({
                          ...prev,
                          age: age,
                        }));
                      }}
                      aria-label="Vârsta utilizatorului"
                      title="Vârsta utilizatorului pentru personalizarea AI-ului"
                    />
                    <small className="text-gray-500 text-xs mt-1 block">
                      Această informație va fi folosită pentru a personaliza
                      răspunsurile AI-ului în funcție de vârsta ta.
                    </small>
                  </div>
                  {/* Stilul de conversație */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stilul de conversație
                    </label>
                    <select
                      className="w-full"
                      value={settings.conversationStyle}
                      onChange={(e) =>
                        handleSettingChange("conversationStyle", e.target.value)
                      }
                      aria-label="Stilul de conversație"
                      title="Stilul de conversație"
                    >
                      <option value="prietenos">Prietenos</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="profesional">Profesional</option>
                    </select>
                  </div>{" "}
                  {/* Stilul de răspuns AI */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stilul de răspuns al AI-ului
                    </label>
                    <select
                      className="w-full"
                      value={settings.length}
                      onChange={(e) =>
                        handleSettingChange("length", e.target.value)
                      }
                      aria-label="Stilul de răspuns AI"
                      title="Stilul de răspuns AI"
                    >
                      <option value="scurt">Concis și direct</option>
                      <option value="lung">Detaliat și explicativ</option>
                      <option value="conversational">
                        Conversațional și prietenos
                      </option>
                      <option value="profesional">Profesional și tehnic</option>
                      <option value="creativ">Creativ și imaginativ</option>
                      <option value="analitic">Analitic și structurat</option>
                      <option value="empatic">Empatic și înțelegător</option>
                      <option value="motivational">
                        Motivațional și încurajator
                      </option>
                    </select>
                  </div>
                  {/* Poza de profil */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Poza de profil AI
                    </label>{" "}
                    <input
                      className="w-full mb-2"
                      type="text"
                      placeholder="URL poză sau lasă gol pentru default"
                      value={settings.avatar}
                      onChange={(e) =>
                        handleSettingChange("avatar", e.target.value)
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full mb-2"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            const avatarData = ev.target.result as string;
                            handleSettingChange("avatar", avatarData);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      title="Încarcă o poză de profil din calculator"
                      aria-label="Încarcă poză de profil"
                    />{" "}
                    {/* Eliminat preview-ul imaginii avatarului */}
                  </div>
                  {/* Ce dorește AI-ul să facă */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ce dorește AI-ul să facă pentru tine?
                    </label>{" "}
                    <input
                      className="w-full"
                      type="text"
                      placeholder="Ex: să te motiveze, să te asculte, să te ajute cu sfaturi"
                      value={settings.goal}
                      onChange={(e) =>
                        handleSettingChange("goal", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Buton pentru salvare setări */}
          <div className="flex justify-center mt-8">
            <button
              className="save-btn"
              onClick={saveSettings}
              disabled={loading}
              title="Salvează setările AI"
            >
              {loading ? "Se salvează..." : "Salvează setările"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettingsPanel;
