import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userDynamicProfileService, UserDynamicProfile } from "../services/userDynamicProfileService";

export const useUserDynamicProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserDynamicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Încarcă profilul utilizatorului
  const loadProfile = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    
    try {
      const userProfile = await userDynamicProfileService.getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (err) {
      console.error("Eroare la încărcarea profilului dinamic:", err);
      setError("Nu s-a putut încărca profilul utilizatorului");
    } finally {
      setLoading(false);
    }
  };

  // Actualizează profilul analizând conversațiile
  const updateProfile = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await userDynamicProfileService.analyzeAndUpdateProfile(user.uid);
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Eroare la actualizarea profilului dinamic:", err);
      setError("Nu s-a putut actualiza profilul utilizatorului");
    } finally {
      setLoading(false);
    }
  };

  // Încarcă profilul când se schimbă utilizatorul
  useEffect(() => {
    loadProfile();
  }, [user?.uid]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile
  };
};
