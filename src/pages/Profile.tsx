import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { UserRole } from "../utils/userRoles";
import SpecialistRoleRequest from "../components/SpecialistRoleRequest";
import { FaCamera, FaEdit } from "react-icons/fa";
import { useEmulators as _useEmulators } from "../utils/environment";
import ProfilePhoto from "../components/ProfilePhoto";
import { ProfilePhotoService } from "../services/ProfilePhotoService";

// Funcția pentru conversia userRole la tipul enum
const getUserRoleEnum = (role: string): UserRole => {
  switch (role) {
    case "admin":
      return UserRole.ADMIN;
    case "specialist":
      return UserRole.SPECIALIST;
    default:
      return UserRole.USER;
  }
};

const Profile: React.FC = () => {
  const { user, userRole, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    phone: "",
    address: "",
    communicationPreference: "email",
    language: "română",
    photoURL: "",
    specialization: "",
    serviceType: ""
  });
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            displayName: userData.displayName || user.displayName || "",
            phone: userData.phone || "",
            address: userData.address || "",
            communicationPreference: userData.communicationPreference || "email",
            language: userData.language || "română",
            photoURL: userData.photoURL || "",
            specialization: userData.specialization || "",
            serviceType: userData.serviceType || ""
          });
        } else {
          // If no profile data exists, initialize with Firebase user data
          setProfileData({
            displayName: user.displayName || "",
            phone: "",
            address: "",
            communicationPreference: "email",
            language: "română",
            photoURL: "",
            specialization: "",
            serviceType: ""
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setFormMessage(null);
      
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        phone: profileData.phone,
        address: profileData.address,
        communicationPreference: profileData.communicationPreference,
        language: profileData.language,
        photoURL: profileData.photoURL,
        specialization: profileData.specialization,
        serviceType: profileData.serviceType,
        updatedAt: new Date()
      });
      
      await refreshUserData();
      
      setFormMessage({
        type: "success",
        message: "Profilul a fost actualizat cu succes!"
      });
      
      setEditMode(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setFormMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormMessage({
        type: "error",
        message: "A apărut o eroare la actualizarea profilului. Vă rugăm încercați din nou."
      });
    } finally {
      setSaving(false);
    }
  };

  // Funcție pentru încărcarea pozei de profil
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingPhoto(true);
    setFormMessage(null);
    
    try {
      // Use the centralized ProfilePhotoService
      const downloadURL = await ProfilePhotoService.uploadProfilePhoto(file, user);
      
      // Update profile data state
      setProfileData(prev => ({
        ...prev,
        photoURL: downloadURL
      }));
      
      // Refresh user data in auth context to ensure cross-component consistency
      await refreshUserData();
      
      setFormMessage({
        type: "success",
        message: "Fotografia de profil a fost actualizată cu succes!"
      });
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setFormMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Eroare la încărcarea fotografiei:", error);
      
      setFormMessage({
        type: "error",
        message: error instanceof Error ? error.message : "A apărut o eroare la încărcarea fotografiei. Vă rugăm încercați din nou."
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatDate = (dateString?: string | number | Date) => {
    if (!dateString) return "Nespecificat";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return "Nespecificat";
    }
  };

  const userDisplayName = profileData.displayName || user?.displayName || "Utilizator";

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">Profilul meu</h1>
          <p className="mt-2 text-blue-100">Gestionează-ți contul și preferințele</p>
        </div>
        
        <div className="p-6">
          {formMessage && (
            <div className={`mb-6 p-4 rounded-md ${
              formMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
              "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {formMessage.message}
            </div>
          )}
          
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative group">
              {/* Use our new ProfilePhoto component */}
              <ProfilePhoto 
                photoURL={profileData.photoURL || user?.photoURL}
                userDisplayName={userDisplayName}
                userId={user?.uid || "default"}
                size="large"
                round={true}
              />
              
              {/* Overlay pentru încărcarea fotografiei */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingPhoto ? (
                  <div className="w-10 h-10 border-4 border-t-blue-500 border-white border-t-solid rounded-full animate-spin"></div>
                ) : (
                  <FaCamera className="text-white text-xl" />
                )}
              </div>
              
              {/* Input de fișier ascuns */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold">{userDisplayName}</h3>
              <p className="text-gray-600">{user?.email || "Email nespecificat"}</p>
              <p className="text-sm text-gray-500 mt-1">
                Membru din {formatDate(user?.metadata?.creationTime)}
              </p>
              {uploadingPhoto && (
                <p className="text-sm text-blue-600 mt-1">
                  Se încarcă fotografia...
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {editMode ? (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-lg mb-4">Editare informații personale</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-black mb-1">
                      Nume complet
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Introduceți numărul de telefon"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-black mb-1">
                      Adresă
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                      placeholder="Introduceți adresa"
                    />
                  </div>
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-black mb-1">
                      Specializare
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={profileData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                      placeholder="Introduceți specializarea"
                    />
                  </div>
                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-black mb-1">
                      Tipul serviciului
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={profileData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" className="text-black">Selectați tipul serviciului</option>
                      <option value="Terapie" className="text-black">Terapie</option>
                      <option value="Consultație" className="text-black">Consultație</option>
                      <option value="Sport" className="text-black">Sport</option>
                      <option value="Educație" className="text-black">Educație</option>
                    </select>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Se salvează..." : "Salvează"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-white text-black border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Informații personale</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Nume: <span className="text-gray-700">{profileData.displayName || "Nespecificat"}</span></p>
                  <p className="text-sm text-gray-500">Email: <span className="text-gray-700">{user?.email || "Nespecificat"}</span></p>
                  <p className="text-sm text-gray-500">Telefon: <span className="text-gray-700">{profileData.phone || "Nespecificat"}</span></p>
                  <p className="text-sm text-gray-500">Adresă: <span className="text-gray-700">{profileData.address || "Nespecificat"}</span></p>
                  <p className="text-sm text-gray-500">Specializare: <span className="text-gray-700">{profileData.specialization || "Nespecificat"}</span></p>
                  <p className="text-sm text-gray-500">Tipul serviciului: <span className="text-gray-700">{profileData.serviceType || "Nespecificat"}</span></p>
                </div>
                <button 
                  onClick={() => setEditMode(true)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-500"
                >
                  Editează informațiile
                </button>
              </div>
            )}
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Preferințe cont</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Preferință comunicare: <span className="text-gray-700">{profileData.communicationPreference}</span></p>
                <p className="text-sm text-gray-500">Limba: <span className="text-gray-700">{profileData.language}</span></p>
              </div>
              <button
                onClick={() => alert("Funcționalitate în curs de implementare")}
                className="mt-4 text-sm text-blue-600 hover:text-blue-500"
              >
                Modifică preferințele
              </button>
            </div>
          </div>
          
          {/* Specialist Information section - only shown for specialists */}
          {userRole === UserRole.SPECIALIST && user && (
            <div className="border rounded-lg p-4 mb-8 bg-blue-50">
              <h4 className="font-semibold text-lg mb-2">Informații Specialist</h4>
              <p className="text-gray-600 mb-4">
                Actualizați informațiile despre specializarea dumneavoastră și serviciile oferite pentru a fi vizibile clienților în pagina de programări.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Specializarea Dumneavoastră</h5>
                  <p className="text-gray-800">{profileData.specialization || "Nespecificată"}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Serviciul Oferit</h5>
                  <p className="text-gray-800">{profileData.serviceType || "Nespecificat"}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setEditMode(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FaEdit className="inline mr-2" />
                Actualizează informațiile
              </button>
              
              <p className="mt-3 text-sm text-gray-500">
                Notă: Aceste informații vor fi afișate în pagina de programări și vor fi vizibile tuturor utilizatorilor care doresc să facă o programare.
              </p>
            </div>
          )}
          
          {/* Specialist Role Request section - only shown for regular users */}
          {userRole !== UserRole.SPECIALIST && userRole !== UserRole.ADMIN && user && (
            <div className="border rounded-lg p-4 mb-8">
              <h4 className="font-semibold text-lg mb-2">Solicită rol de specialist</h4>
              <SpecialistRoleRequest 
                user={user} 
                userRole={userRole ? getUserRoleEnum(userRole) : null} 
                onRequestSuccess={() => {}}
              />
            </div>
          )}
          
          <div className="border-t pt-6 flex justify-end">
            <button 
              onClick={handleSignOut}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Se procesează..." : "Deconectare"
            }</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;