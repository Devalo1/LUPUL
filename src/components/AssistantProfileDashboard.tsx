import React from "react";
import { useAssistantProfile } from "../contexts/useAssistantProfile";
import "./AssistantProfileDashboard.css";

const AssistantProfileDashboard: React.FC<{ onEdit: () => void }> = ({
  onEdit,
}) => {
  const { profileState } = useAssistantProfile();
  const { current, history } = profileState;

  return (
    <div className="assistant-profile-dashboard">
      <h2>Profilul Asistentului AI</h2>
      <div className="assistant-profile-dashboard__main">
        <img
          src={current.avatar}
          alt="AI Avatar"
          className="assistant-profile-dashboard__avatar"
        />{" "}
        <div>
          <div>
            <b>Nume:</b> {current.name}
          </div>
          <div>
            <b>Adresare:</b> {current.addressMode}
          </div>
        </div>
      </div>
      <button onClick={onEdit} className="assistant-profile-dashboard__edit">
        Editează profilul
      </button>
      <h3>Istoric modificări</h3>
      <ul className="assistant-profile-dashboard__history">
        {history.length === 0 && <li>Nu există modificări anterioare.</li>}{" "}
        {history.map((h) => (
          <li key={h.timestamp}>
            <b>{new Date(h.timestamp).toLocaleString()}:</b> {h.profile.name},{" "}
            {h.profile.addressMode}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssistantProfileDashboard;
