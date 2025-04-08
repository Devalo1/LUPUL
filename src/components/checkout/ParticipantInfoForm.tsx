import React, { useState } from 'react';

interface ParticipantInfo {
  fullName: string;
  expectations: string;
}

interface ParticipantInfoFormProps {
  onInfoSubmit: (info: ParticipantInfo) => void;
  initialValues?: ParticipantInfo;
}

const ParticipantInfoForm: React.FC<ParticipantInfoFormProps> = ({ 
  onInfoSubmit, 
  initialValues = { fullName: '', expectations: '' } 
}) => {
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>(initialValues);
  const [errors, setErrors] = useState<{ fullName?: string; expectations?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setParticipantInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { fullName?: string; expectations?: string } = {};
    
    if (!participantInfo.fullName.trim()) {
      newErrors.fullName = 'Numele participantului este obligatoriu';
    }
    
    if (!participantInfo.expectations.trim()) {
      newErrors.expectations = 'Te rugăm să completezi așteptările tale';
    } else if (participantInfo.expectations.trim().length < 10) {
      newErrors.expectations = 'Te rugăm să oferi mai multe detalii despre așteptările tale';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onInfoSubmit(participantInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Informații despre participant</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
            Numele complet al participantului *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={participantInfo.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Introduceți numele complet"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="expectations" className="block text-gray-700 font-medium mb-2">
            Ce așteptări ai de la această experiență? *
          </label>
          <textarea
            id="expectations"
            name="expectations"
            value={participantInfo.expectations}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.expectations ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descrieți așteptările dumneavoastră..."
          />
          {errors.expectations && (
            <p className="text-red-500 text-sm mt-1">{errors.expectations}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Continuă
        </button>
      </form>
    </div>
  );
};

export default ParticipantInfoForm;
