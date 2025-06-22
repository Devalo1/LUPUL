// Hook pentru personalizarea AI bazată pe analiza conversațiilor
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  userPersonalizationService,
  UserPersonalityProfile,
} from "../services/userPersonalizationService";

export const useUserPersonalization = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserPersonalityProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [personalizedContext, setPersonalizedContext] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Încarcă profilul utilizatorului
  const loadUserProfile = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userProfile = await userPersonalizationService.getUserProfile(
        user.uid
      );
      setProfile(userProfile);

      if (userProfile) {
        const context =
          await userPersonalizationService.generatePersonalizedContext(
            user.uid
          );
        setPersonalizedContext(context);
      }
    } catch (err) {
      console.error("[UserPersonalization] Error loading profile:", err);
      setError("Eroare la încărcarea profilului de personalizare");
    }
  }, [user?.uid]);

  // Analizează și actualizează profilul complet
  const analyzeUserProfile = useCallback(async () => {
    if (!user?.uid) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log("[UserPersonalization] Starting full profile analysis...");
      const updatedProfile =
        await userPersonalizationService.analyzeAndUpdateUserProfile(user.uid);
      setProfile(updatedProfile);

      const context =
        await userPersonalizationService.generatePersonalizedContext(user.uid);
      setPersonalizedContext(context);

      console.log(
        "[UserPersonalization] Profile analysis completed successfully"
      );
    } catch (err) {
      console.error("[UserPersonalization] Error analyzing profile:", err);
      setError("Eroare la analizarea conversațiilor");
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.uid]);

  // Actualizează profilul după o conversație nouă
  const updateAfterConversation = useCallback(
    async (conversationId: string) => {
      if (!user?.uid) return;

      try {
        await userPersonalizationService.updateProfileAfterConversation(
          user.uid,
          conversationId
        );
        // Reîncarcă profilul actualizat
        await loadUserProfile();
      } catch (err) {
        console.error(
          "[UserPersonalization] Error updating after conversation:",
          err
        );
      }
    },
    [user?.uid, loadUserProfile]
  );

  // Obține contextul personalizat pentru AI
  const getPersonalizedContext = useCallback(async (): Promise<string> => {
    if (!user?.uid) return "";

    try {
      return await userPersonalizationService.generatePersonalizedContext(
        user.uid
      );
    } catch (err) {
      console.error("[UserPersonalization] Error generating context:", err);
      return "";
    }
  }, [user?.uid]);

  // Încarcă profilul la schimbarea utilizatorului
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Verifică dacă utilizatorul are un profil
  const hasProfile = profile !== null;

  // Verifică dacă profilul este vechi și necesită actualizare
  const needsUpdate =
    profile &&
    (() => {
      const now = new Date();
      const lastUpdate =
        profile.updatedAt instanceof Date
          ? profile.updatedAt
          : new Date(profile.updatedAt.seconds * 1000);

      const daysSinceUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 7; // Actualizează dacă profilul e mai vechi de 7 zile
    })();

  // Statistici utile despre utilizator
  const userStats = profile
    ? {
        totalConversations: profile.totalConversations,
        totalMessages: profile.totalMessages,
        experienceLevel:
          profile.totalMessages > 100
            ? "expert"
            : profile.totalMessages > 50
              ? "intermediate"
              : "beginner",
        mainInterests: profile.interests.topics.slice(0, 3),
        communicationStyle: profile.communicationStyle.preferredTone,
        preferredAddressMode: profile.personalPreferences.addressMode,
      }
    : null;

  return {
    // Starea profilului
    profile,
    hasProfile,
    needsUpdate,
    isAnalyzing,
    error,

    // Context personalizat
    personalizedContext,

    // Statistici
    userStats,

    // Acțiuni
    analyzeUserProfile,
    updateAfterConversation,
    getPersonalizedContext,
    loadUserProfile,

    // Funcții helper
    clearError: () => setError(null),
  };
};

// Hook simplificat doar pentru contextul personalizat
export const usePersonalizedContext = () => {
  const { user } = useAuth();
  const [context, setContext] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const refreshContext = useCallback(async () => {
    if (!user?.uid) {
      setContext("");
      return;
    }

    setIsLoading(true);
    try {
      const personalizedContext =
        await userPersonalizationService.generatePersonalizedContext(user.uid);
      setContext(personalizedContext);
    } catch (err) {
      console.error("[PersonalizedContext] Error loading context:", err);
      setContext("");
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  return {
    context,
    isLoading,
    refreshContext,
  };
};
