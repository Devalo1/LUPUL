import React from "react";
import { useUserDynamicProfile } from "../hooks/useUserDynamicProfile";
import "./UserProfileDashboard.css";

const UserProfileDashboard: React.FC = () => {
  const { profile, loading, error, updateProfile } = useUserDynamicProfile();

  if (loading && !profile) {
    return (
      <div className="profile-dashboard__loading">Se încarcă profilul...</div>
    );
  }

  if (error) {
    return <div className="profile-dashboard__error">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="profile-dashboard__no-profile">
        Nu există date de profil.
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      <div className="profile-dashboard__header">
        <h2>Profilul tău AI personalizat</h2>
        <button
          onClick={updateProfile}
          disabled={loading}
          className="profile-dashboard__refresh"
        >
          {loading ? "Se actualizează..." : "Actualizează profilul"}
        </button>
      </div>

      <div className="profile-dashboard__grid">
        {/* Stilul de comunicare */}
        <div className="profile-dashboard__card">
          <h3>Stilul de comunicare</h3>
          <div className="profile-dashboard__stats">
            <div className="stat">
              <label>Formalitate:</label>
              <span className="badge">
                {profile.communicationStyle.formality}
              </span>
            </div>
            <div className="stat">
              <label>Tonul:</label>
              <span className="badge">{profile.communicationStyle.tone}</span>
            </div>
            <div className="stat">
              <label>Lungimea răspunsurilor:</label>
              <span className="badge">
                {profile.communicationStyle.responseLength}
              </span>
            </div>
          </div>
        </div>

        {/* Subiecte de interes */}
        <div className="profile-dashboard__card">
          <h3>Subiectele tale de interes</h3>
          <div className="profile-dashboard__topics">
            {profile.topicsOfInterest.slice(0, 8).map((topic, index) => (
              <span key={index} className="topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Trăsături de personalitate */}
        <div className="profile-dashboard__card">
          <h3>Trăsături de personalitate</h3>
          <div className="profile-dashboard__personality">
            {" "}
            <div className="personality-trait">
              <label>Răbdare:</label>
              <div className="trait-bar">
                <div
                  className="trait-fill"
                  data-width={profile.personalityTraits.patience * 10}
                ></div>
              </div>
              <span>{profile.personalityTraits.patience}/10</span>
            </div>
            <div className="personality-trait">
              <label>Curiozitate:</label>
              <div className="trait-bar">
                <div
                  className="trait-fill"
                  data-width={profile.personalityTraits.curiosity * 10}
                ></div>
              </div>
              <span>{profile.personalityTraits.curiosity}/10</span>
            </div>
            <div className="personality-trait">
              <label>Directețe:</label>
              <div className="trait-bar">
                <div
                  className="trait-fill"
                  data-width={profile.personalityTraits.directness * 10}
                ></div>
              </div>
              <span>{profile.personalityTraits.directness}/10</span>
            </div>
          </div>
        </div>

        {/* Abordarea problemelor */}
        <div className="profile-dashboard__card">
          <h3>Abordarea problemelor</h3>
          <div className="profile-dashboard__approach">
            {" "}
            <div
              className={`approach-item ${profile.problemSolvingApproach.prefersStepByStep ? "active" : ""}`}
            >
              Pas cu pas
            </div>
            <div
              className={`approach-item ${profile.problemSolvingApproach.likesExamples ? "active" : ""}`}
            >
              Cu exemple
            </div>
            <div
              className={`approach-item ${profile.problemSolvingApproach.needsExplanations ? "active" : ""}`}
            >
              Explicații detaliate
            </div>
          </div>
        </div>

        {/* Statistici conversații */}
        <div className="profile-dashboard__card">
          <h3>Statistici conversații</h3>
          <div className="profile-dashboard__stats">
            <div className="stat">
              <label>Total conversații:</label>
              <span className="number">{profile.totalConversations}</span>
            </div>
            <div className="stat">
              <label>Total mesaje:</label>
              <span className="number">{profile.totalMessages}</span>
            </div>
            <div className="stat">
              <label>Lungimea medie a sesiunii:</label>
              <span className="number">
                {profile.conversationPatterns.averageSessionLength} mesaje
              </span>
            </div>
            <div className="stat">
              <label>Timpul preferat:</label>
              <span className="badge">
                {profile.conversationPatterns.preferredTimeOfDay}
              </span>
            </div>
          </div>
        </div>

        {/* Preferințe de învățare */}
        <div className="profile-dashboard__card">
          <h3>Preferințe de învățare</h3>
          <div className="profile-dashboard__learning">
            {" "}
            <div
              className={`learning-type ${profile.learningPreferences.visualLearner ? "active" : ""}`}
            >
              👁️ Vizual
            </div>
            <div
              className={`learning-type ${profile.learningPreferences.practicalLearner ? "active" : ""}`}
            >
              🛠️ Practic
            </div>
            <div
              className={`learning-type ${profile.learningPreferences.theoreticalLearner ? "active" : ""}`}
            >
              📚 Teoretic
            </div>
          </div>
        </div>
      </div>

      <div className="profile-dashboard__footer">
        <p>
          Ultima analiză:{" "}
          {new Date(
            profile.lastAnalyzed instanceof Date
              ? profile.lastAnalyzed
              : profile.lastAnalyzed.toDate()
          ).toLocaleString("ro-RO")}
        </p>
        <p className="profile-dashboard__note">
          Profilul tău se actualizează automat pe baza conversațiilor cu AI-ul
          pentru a-ți oferi o experiență din ce în ce mai personalizată.
        </p>
      </div>
    </div>
  );
};

export default UserProfileDashboard;
