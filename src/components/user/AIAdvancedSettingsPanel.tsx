// AI Advanced Settings Panel - Panou complet de personalizare AI
import React, { useState, useEffect } from "react";
import {
  FaBrain,
  FaTimes,
  FaSave,
  FaUser,
  FaImage,
  FaPalette,
  FaCog,
  FaRobot,
  FaBirthdayCake,
  FaVenus,
  FaMars,
  FaGenderless
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { userAIProfileService, UserAIProfile } from "../../services/userAIProfileService";
import "./AIAdvancedSettingsPanel.css";

interface AIAdvancedSettingsPanelProps {
  onClose: () => void;
  onSave?: (profile: UserAIProfile) => void;
}

const AIAdvancedSettingsPanel: React.FC<AIAdvancedSettingsPanelProps> = ({ 
  onClose, 
  onSave 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<Partial<UserAIProfile>>({
    userId: user?.uid || "",
    name: "",
    age: undefined,
    gender: "neutru",
    expressionStyle: "prietenos",
    therapyType: "psihica",
    backgroundImage: "",
  });

  const [selectedBackgrounds] = useState([
    "/images/backgrounds/nature1.jpg",
    "/images/backgrounds/abstract1.jpg", 
    "/images/backgrounds/minimal1.jpg",
    "/images/backgrounds/space1.jpg",
    "/images/backgrounds/ocean1.jpg"
  ]);

  useEffect(() => {
    loadExistingProfile();
  }, [user?.uid]);

  const loadExistingProfile = async () => {
    if (!user?.uid) return;    try {
      setLoading(true);
      const existingProfile = await userAIProfileService.getActiveProfileConfig(
        user.uid, 
        "psihica"
      );
      
      if (existingProfile) {
        setProfile({
          ...existingProfile,
          therapyType: "psihica"
        });
      }
    } catch (error) {
      console.error("Eroare la încărcarea profilului:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);      const profileToSave: UserAIProfile = {
        userId: user.uid,
        name: profile.name || "",
        age: profile.age,
        gender: profile.gender || "neutru",
        expressionStyle: profile.expressionStyle || "prietenos",
        therapyType: "psihica",
        backgroundImage: profile.backgroundImage || "",
        totalConversations: profile.totalConversations || 0,
        createdAt: profile.createdAt || new Date(),
        updatedAt: new Date()
      };

      await userAIProfileService.saveUserProfile(profileToSave);
      
      setSuccess("Profilul AI a fost salvat cu succes!");
      
      if (onSave) {
        onSave(profileToSave);
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Eroare la salvarea profilului:", error);
      setError("Eroare la salvarea profilului. Încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const getAgeGroup = (age?: number) => {
    if (!age) return "Nespecificat";
    if (age < 20) return "Tineret (sub 20 ani)";
    if (age < 35) return "Tineri adulți (20-34 ani)";
    if (age < 50) return "Adulți (35-49 ani)";
    if (age < 65) return "Adulți maturi (50-64 ani)";
    return "Seniori (65+ ani)";
  };

  return (
    <div className="ai-advanced-settings-overlay">
      <div className="ai-advanced-settings-panel">
        {/* Header */}
        <div className="settings-header">
          <div className="header-title">
            <FaBrain className="header-icon" />
            <h2>Setări Avansate AI</h2>
          </div>          <button onClick={onClose} className="close-button" title="Închide setări">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <span>{success}</span>
            </div>
          )}

          {/* Informații Personale */}
          <div className="settings-section">
            <div className="section-header">
              <FaUser className="section-icon" />
              <h3>Informații Personale</h3>
            </div>

            <div className="form-group">
              <label htmlFor="ai-name">
                <FaRobot className="input-icon" />
                Numele tău preferat
              </label>
              <input
                id="ai-name"
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Cum să te numesc?"
                className="form-input"
              />
              <small>AI-ul se va adresa ție folosind acest nume</small>
            </div>

            <div className="form-group">
              <label htmlFor="ai-age">
                <FaBirthdayCake className="input-icon" />
                Vârsta ta
              </label>
              <input
                id="ai-age"
                type="number"
                min="13"
                max="120"
                value={profile.age || ""}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  age: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Câți ani ai?"
                className="form-input"
              />
              <small>
                Grupa de vârstă: <strong>{getAgeGroup(profile.age)}</strong>
                <br />
                AI-ul își va adapta limbajul la vârsta ta
              </small>
            </div>

            <div className="form-group">
              <label>
                <FaVenus className="input-icon" />
                Genul tău
              </label>
              <div className="gender-options">
                <button
                  type="button"
                  className={`gender-option ${profile.gender === "feminin" ? "active" : ""}`}
                  onClick={() => setProfile({ ...profile, gender: "feminin" })}
                >
                  <FaVenus />
                  Feminin
                </button>
                <button
                  type="button"
                  className={`gender-option ${profile.gender === "masculin" ? "active" : ""}`}
                  onClick={() => setProfile({ ...profile, gender: "masculin" })}
                >
                  <FaMars />
                  Masculin
                </button>
                <button
                  type="button"
                  className={`gender-option ${profile.gender === "neutru" ? "active" : ""}`}
                  onClick={() => setProfile({ ...profile, gender: "neutru" })}
                >
                  <FaGenderless />
                  Neutru
                </button>
              </div>
              <small>AI-ul își va adapta stilul de comunicare</small>
            </div>
          </div>

          {/* Stil de Comunicare */}
          <div className="settings-section">
            <div className="section-header">
              <FaCog className="section-icon" />
              <h3>Stil de Comunicare</h3>
            </div>

            <div className="form-group">
              <label>Stilul de expresie preferat</label>
              <div className="style-options">
                <button
                  type="button"
                  className={`style-option ${profile.expressionStyle === "profesional" ? "active" : ""}`}
                  onClick={() => setProfile({ ...profile, expressionStyle: "profesional" })}
                >
                  <span className="style-emoji">🎩</span>
                  <div>
                    <strong>Profesional</strong>
                    <small>Formal, structurat, orientat spre soluții</small>
                  </div>
                </button>
                <button
                  type="button"
                  className={`style-option ${profile.expressionStyle === "prietenos" ? "active" : ""}`}
                  onClick={() => setProfile({ ...profile, expressionStyle: "prietenos" })}
                >
                  <span className="style-emoji">😊</span>
                  <div>
                    <strong>Prietenos</strong>
                    <small>Cald, empatic, susținător</small>
                  </div>
                </button>
                <button
                  type="button"
                  className={`style-option ${profile.expressionStyle === "casual" ? "active" : ""}`}
                  onClick={() => setProfile({ ...profile, expressionStyle: "casual" })}
                >
                  <span className="style-emoji">😎</span>
                  <div>
                    <strong>Casual</strong>
                    <small>Relaxat, informal, prietenos</small>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Personalizare Vizuală */}
          <div className="settings-section">
            <div className="section-header">
              <FaPalette className="section-icon" />
              <h3>Personalizare Vizuală</h3>
            </div>

            <div className="form-group">
              <label>
                <FaImage className="input-icon" />
                Poza de fundal pentru conversații
              </label>              <div className="background-gallery">
                {selectedBackgrounds.map((bg, index) => {
                  const bgClass = `background-${index}`;
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`background-option ${bgClass} ${profile.backgroundImage === bg ? "active" : ""}`}
                      onClick={() => setProfile({ ...profile, backgroundImage: bg })}
                      data-bg={bg}
                    >
                      {profile.backgroundImage === bg && (
                        <div className="selected-overlay">✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
              <small>Selectează o imagine de fundal pentru editorul de conversații</small>
            </div>
          </div>

          {/* Preview Section */}
          <div className="settings-section">
            <div className="section-header">
              <FaRobot className="section-icon" />
              <h3>Previzualizare Personalizare</h3>
            </div>
            <div className="preview-box">
              <div className="preview-message">
                <strong>AI:</strong> {profile.name ? `Bună, ${profile.name}!` : "Bună!"} {" "}
                {profile.age && profile.age < 25 && "Ce mai faci? "}
                {profile.age && profile.age >= 50 && "Cum vă simțiți astăzi? "}
                {profile.gender === "feminin" && "Sunt aici să te ajut cu orice ai nevoie. "}
                {profile.gender === "masculin" && "Să vedem cum te pot ajuta. "}
                {profile.expressionStyle === "casual" && "Hai să vorbim relaxat! 😊"}
                {profile.expressionStyle === "profesional" && "Vă pot oferi suportul de care aveți nevoie."}
                {profile.expressionStyle === "prietenos" && "Sunt bucuros să vorbesc cu tine! 💝"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button onClick={onClose} className="cancel-button">
            Anulează
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="save-button"
          >
            <FaSave />
            {loading ? "Se salvează..." : "Salvează Setările"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvancedSettingsPanel;
