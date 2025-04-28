import React, { useState } from "react";
import { Input, TextArea, Button } from "../index";

interface ParticipantInfo {
  fullName: string;
  expectations: string;
  age: string;
}

interface ParticipantInfoFormProps {
  onInfoSubmit: (info: ParticipantInfo) => void;
  initialValues?: Partial<ParticipantInfo>;
}

const ParticipantInfoForm: React.FC<ParticipantInfoFormProps> = ({
  onInfoSubmit,
  initialValues = {}
}) => {
  const [formData, setFormData] = useState<ParticipantInfo>({
    fullName: initialValues.fullName || "",
    expectations: initialValues.expectations || "",
    age: initialValues.age || ""
  });

  const [errors, setErrors] = useState<Partial<ParticipantInfo>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Eliminate error when user starts typing
    if (errors[name as keyof ParticipantInfo]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ParticipantInfo> = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Numele complet este obligatoriu";
      isValid = false;
    }

    if (!formData.expectations.trim()) {
      newErrors.expectations = "Vă rugăm să completați așteptările";
      isValid = false;
    }

    if (!formData.age.trim()) {
      newErrors.age = "Vârsta este obligatorie";
      isValid = false;
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 16 || Number(formData.age) > 100) {
      newErrors.age = "Vă rugăm să introduceți o vârstă validă (între 16 și 100)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onInfoSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nume complet"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Introduceți numele și prenumele"
        error={errors.fullName}
        required
      />

      <Input
        label="Vârsta"
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
        placeholder="Introduceți vârsta"
        error={errors.age}
        required
        min="16"
        max="100"
      />

      <TextArea
        label="Ce așteptări aveți de la acest eveniment?"
        name="expectations"
        value={formData.expectations}
        onChange={handleChange}
        placeholder="Scrieți aici ce doriți să obțineți din participarea la acest eveniment..."
        error={errors.expectations}
        rows={4}
        required
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary">
          Înregistrează-mă
        </Button>
      </div>
    </form>
  );
};

export default ParticipantInfoForm;
