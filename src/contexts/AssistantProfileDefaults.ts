import { AssistantProfile } from "../models/AssistantProfile";

// Funcție pentru a crea profilul default bazat pe setările AI personalizate pentru un utilizator specific
const createDefaultProfile = (userId?: string): AssistantProfile => {
  // Dacă avem un userId, folosim setări specifice utilizatorului
  const userPrefix = userId ? `user_${userId}_` : "";

  // Încarcă setările din localStorage specifice utilizatorului
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

  // Convertește sexul de la format nou la format vechi pentru compatibilitate
  let profileSex: "M" | "F";
  if (aiSex === "masculin") {
    profileSex = "M";
  } else if (aiSex === "feminin") {
    profileSex = "F";
  } else {
    // Pentru "neutru" sau null, nu afișăm informații despre sex
    profileSex = "M"; // Default, dar nu va fi afișat
  }

  return {
    name: aiName,
    sex: profileSex,
    age: aiUserAge ? parseInt(aiUserAge) : 25, // Default 25 dacă nu este setat
    addressMode: aiAddressMode || "Tu",
    avatar: aiAvatar,
  };
};

// Funcție pentru a crea profilul dinamic bazat pe userId
export const createDynamicProfile = (userId?: string): AssistantProfile => {
  return createDefaultProfile(userId);
};

export const defaultProfile: AssistantProfile = createDefaultProfile();
