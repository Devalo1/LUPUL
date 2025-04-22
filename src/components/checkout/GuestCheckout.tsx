import React, { useState } from "react";
import Button from "../common/Button";

interface GuestCheckoutProps {
  onContinue: (guestData: GuestData) => void;
  onCancel: () => void;
}

export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  createAccount?: boolean;
  password?: string;
}

const GuestCheckout: React.FC<GuestCheckoutProps> = ({ onContinue, onCancel }) => {
  const [formData, setFormData] = useState<GuestData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "România",
    createAccount: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createAccount, setCreateAccount] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateAccount(e.target.checked);
    setFormData(prev => ({ ...prev, createAccount: e.target.checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city"];
    requiredFields.forEach(field => {
      if (!formData[field as keyof GuestData]) {
        newErrors[field] = "Acest câmp este obligatoriu";
      }
    });
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Adresa de email nu este validă";
    }
    
    // Phone validation
    if (formData.phone && !/^[0-9+\s()-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Numărul de telefon nu este valid";
    }
    
    // Password validation if creating account
    if (createAccount && (!formData.password || formData.password.length < 6)) {
      newErrors.password = "Parola trebuie să aibă cel puțin 6 caractere";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onContinue(formData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Continuă fără cont</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Prenume *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Nume *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Telefon *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.phone ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Adresă *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.address ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Oraș *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.city ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Cod poștal</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={createAccount}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <span>Creează un cont pentru comenzi viitoare</span>
          </label>
        </div>
        
        {createAccount && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Parola *</label>
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button 
            type="submit"
            variant="primary"
            className="flex-1"
          >
            Continuă
          </Button>
          
          <Button 
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
          >
            Înapoi
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GuestCheckout;
