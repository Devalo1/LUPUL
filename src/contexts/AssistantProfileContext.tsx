import React, { useState, useEffect } from "react";
import {
  AssistantProfile,
  AssistantProfileState,
} from "../models/AssistantProfile";
import { AssistantProfileContext } from "./AssistantProfileContextDef";
import { useAuth } from "./AuthContext";
import { validateAvatarData } from "../utils/avatarUtils";

// Funcție pentru a crea profilul dinamic bazat pe setările AI pentru un utilizator specific
const createDynamicProfile = (userId?: string): AssistantProfile => {
  // Dacă avem un userId, folosim setări specifice utilizatorului
  const userPrefix = userId ? `user_${userId}_` : "";

  const aiName =
    localStorage.getItem(`${userPrefix}ai_name`) ||
    localStorage.getItem("ai_name") ||
    "LupuBot";
  const aiSex = (localStorage.getItem(`${userPrefix}ai_sex`) ||
    localStorage.getItem("ai_sex")) as "masculin" | "feminin" | "neutru" | null;
  const aiUserAge =
    localStorage.getItem(`${userPrefix}ai_user_age`) ||
    localStorage.getItem("ai_user_age");
  const aiAddressMode = (localStorage.getItem(`${userPrefix}ai_addressMode`) ||
    localStorage.getItem("ai_addressMode")) as "Tu" | "Dvs" | null;
  const aiAvatar = validateAvatarData(
    localStorage.getItem(`${userPrefix}ai_avatar`) ||
      localStorage.getItem("ai_avatar"),
    userId
  );

  // Convertește sexul pentru compatibilitate (dar nu va fi afișat)
  let profileSex: "M" | "F";
  if (aiSex === "masculin") {
    profileSex = "M";
  } else if (aiSex === "feminin") {
    profileSex = "F";
  } else {
    profileSex = "M"; // Default, nu va fi afișat
  }

  return {
    name: aiName,
    sex: profileSex,
    age: aiUserAge ? parseInt(aiUserAge) : 25,
    addressMode: aiAddressMode || "Tu",
    avatar: aiAvatar,
  };
};

export const AssistantProfileProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [profileState, setProfileState] = useState<AssistantProfileState>({
    current: createDynamicProfile(user?.uid),
    history: [],
  });

  // Reîncarcă profilul când se schimbă utilizatorul sau setările
  useEffect(() => {
    const newProfile = createDynamicProfile(user?.uid);
    setProfileState((prev) => ({
      current: newProfile,
      history: [
        { timestamp: Date.now(), profile: prev.current },
        ...prev.history,
      ],
    }));
  }, [user?.uid]);

  // Reîncarcă profilul când se schimbă setările în localStorage
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("[AssistantProfile] Profile update event triggered");
      const newProfile = createDynamicProfile(user?.uid);
      setProfileState((prev) => ({
        current: newProfile,
        history: [
          { timestamp: Date.now(), profile: prev.current },
          ...prev.history,
        ],
      }));
    };

    // Forțează reîncărcarea profilului la fiecare 500ms pentru detectare rapidă
    const intervalId = setInterval(() => {
      const currentProfile = createDynamicProfile(user?.uid);
      setProfileState((prev) => {
        // Verifică dacă profilul s-a schimbat (doar avatar și nume)
        if (
          prev.current.avatar !== currentProfile.avatar ||
          prev.current.name !== currentProfile.name
        ) {
          console.log(
            "[AssistantProfile] Profil actualizat RAPID:",
            currentProfile
          );
          return {
            current: currentProfile,
            history: [
              { timestamp: Date.now(), profile: prev.current },
              ...prev.history,
            ],
          };
        }
        return prev;
      });
    }, 500); // Verificare mai rapidă pentru actualizări instant

    // Adaugă event listener pentru schimbările directe în localStorage
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key?.includes("ai_avatar") || e.key?.includes("ai_name")) {
        console.log(
          "[AssistantProfile] Storage change detected:",
          e.key,
          e.newValue
        );
        handleProfileUpdate();
      }
    };

    // Event listeners
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener("ai-profile-updated", handleProfileUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("ai-profile-updated", handleProfileUpdate);
      clearInterval(intervalId);
    };
  }, [user?.uid]);

  const updateProfile = (profile: AssistantProfile) => {
    setProfileState((prev) => ({
      current: profile,
      history: [
        { timestamp: Date.now(), profile: prev.current },
        ...prev.history,
      ],
    }));
  };

  return (
    <AssistantProfileContext.Provider value={{ profileState, updateProfile }}>
      {children}
    </AssistantProfileContext.Provider>
  );
};
