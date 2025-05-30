import React, { useState, useRef } from "react";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";
import { ProfilePhotoService } from "../services/ProfilePhotoService";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  };
  onSave: (preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  }) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSave,
}) => {
  const [emailNotifications, setEmailNotifications] = useState(
    preferences.emailNotifications
  );
  const [smsNotifications, setSmsNotifications] = useState(
    preferences.smsNotifications
  );
  const [newsletter, setNewsletter] = useState(preferences.newsletter);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ emailNotifications, smsNotifications, newsletter });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-200 transform transition-all duration-200 scale-100">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Modifică preferințele
          </h2>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📧</span>
                <div>
                  {" "}
                  <label
                    htmlFor="emailNotifications"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Notificări email
                  </label>
                  <p className="text-xs text-gray-600">
                    Primește actualizări prin email
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="emailNotifications"
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📱</span>
                <div>
                  {" "}
                  <label
                    htmlFor="smsNotifications"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Notificări SMS
                  </label>
                  <p className="text-xs text-gray-600">
                    Primește alerte prin SMS
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="smsNotifications"
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📰</span>
                <div>
                  {" "}
                  <label
                    htmlFor="newsletter"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Newsletter
                  </label>
                  <p className="text-xs text-gray-600">
                    Abonare la newsletter săptămânal
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            ❌ Anulează
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ⚙️ Salvează
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { logout, user, currentUser, refreshUserPhoto } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setPhotoUploading(true);
      await ProfilePhotoService.uploadProfilePhoto(file, user);
      if (refreshUserPhoto) {
        await refreshUserPhoto();
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSavePreferences = (preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  }) => {
    // Aici ar trebui să implementezi logica pentru salvarea preferințelor în Firebase
    console.log("Saving preferences:", preferences);
  };

  // Folosim datele reale ale utilizatorului
  const displayName =
    user?.displayName || currentUser?.displayName || "Utilizator";
  const email = user?.email || currentUser?.email || "Email nespecificat";
  const photoURL = user?.photoURL || currentUser?.photoURL;
  const phoneNumber = currentUser?.phoneNumber || "Nespecificat";
  const createdAt = currentUser?.createdAt;
  const memberSince = createdAt
    ? new Date(
        typeof createdAt === "number" ? createdAt : createdAt
      ).toLocaleDateString("ro-RO")
    : "Nespecificat";

  const userPreferences = {
    emailNotifications: currentUser?.preferences?.emailNotifications ?? true,
    smsNotifications: currentUser?.preferences?.smsNotifications ?? false,
    newsletter: currentUser?.preferences?.newsletter ?? true,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">Profilul meu</h1>
          <p className="mt-2 text-blue-100">
            Gestionează-ți contul și preferințele
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Poza de profil"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                {photoUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </button>{" "}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                title="Upload profile photo"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{displayName}</h3>
              <p className="text-gray-600">{email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Membru din {memberSince}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg mb-2">
                Informații personale
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Nume: <span className="text-gray-700">{displayName}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Email: <span className="text-gray-700">{email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Telefon: <span className="text-gray-700">{phoneNumber}</span>
                </p>
              </div>{" "}
              <button
                onClick={() => navigate("/profile/info")}
                className="mt-4 text-sm text-blue-600 hover:text-blue-500"
              >
                Editează informațiile
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Preferințe cont</h4>{" "}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Notificări email:{" "}
                  <span className="text-gray-700">
                    {userPreferences.emailNotifications
                      ? "Activate"
                      : "Dezactivate"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Notificări SMS:{" "}
                  <span className="text-gray-700">
                    {userPreferences.smsNotifications
                      ? "Activate"
                      : "Dezactivate"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Newsletter:{" "}
                  <span className="text-gray-700">
                    {userPreferences.newsletter ? "Abonat" : "Neabonat"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowPreferences(true)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-500"
              >
                Modifică preferințele
              </button>
            </div>
          </div>

          <div className="border-t pt-6 flex justify-end">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Se procesează..." : "Deconectare"}
            </button>
          </div>
        </div>{" "}
      </div>

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferences={userPreferences}
        onSave={handleSavePreferences}
      />
    </div>
  );
};

export default Profile;
