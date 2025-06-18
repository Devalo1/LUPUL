import React, { useState } from "react";
import { useAssistantProfile } from "../contexts/useAssistantProfile";

const AssistantProfileEdit: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { profileState, updateProfile } = useAssistantProfile();
  const [form, setForm] = useState(profileState.current);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    onClose();
  };

  return (
    <div className="assistant-profile-edit-modal">
      <form onSubmit={handleSubmit} className="assistant-profile-edit-form">
        <h2>Editează profilul asistentului</h2>
        <label>
          Nume:
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Adresare:
          <select
            name="addressMode"
            value={form.addressMode}
            onChange={handleChange}
            required
          >
            <option value="Tu">Tu</option>
            <option value="Dvs">Dvs</option>
          </select>
        </label>
        <label>
          Avatar:
          <input
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            required
          />
        </label>
        <div className="assistant-profile-edit-actions">
          <button type="submit">Salvează</button>
          <button type="button" onClick={onClose}>
            Anulează
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssistantProfileEdit;
