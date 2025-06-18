import React, { useState, useEffect } from "react";
import {
  AssistantProfile,
  AssistantProfileState,
} from "../models/AssistantProfile";
import { AssistantProfileContext } from "./AssistantProfileContextDef";
import { useAuth } from "./AuthContext";

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
  const aiAvatar =
    localStorage.getItem(`${userPrefix}ai_avatar`) ||
    localStorage.getItem("ai_avatar") ||
    "/vite.svg";

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
    const handleStorageChange = () => {
      const newProfile = createDynamicProfile(user?.uid);
      setProfileState((prev) => ({
        current: newProfile,
        history: [
          { timestamp: Date.now(), profile: prev.current },
          ...prev.history,
        ],
      }));
    };

    // Forțează reîncărcarea profilului la fiecare 1 secundă pentru a detecta schimbările
    const intervalId = setInterval(() => {
      const currentProfile = createDynamicProfile(user?.uid);
      setProfileState((prev) => {
        // Verifică dacă profilul s-a schimbat
        if (JSON.stringify(prev.current) !== JSON.stringify(currentProfile)) {
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
    }, 1000);

    // Ascultă schimbările în localStorage
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

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
