// useProfileSync.ts - Hook pentru sincronizarea profilului
import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuth } from "../contexts";
import syncUserProfile, {
  ProfileSyncService,
} from "../services/ProfileSyncService";
import logger from "../utils/logger";
import TokenManager from "../utils/TokenManager";

// Logger dedicat pentru hook-ul de sincronizare a profilului
const hookLogger = logger.createLogger("useProfileSync");

// Timp minim între sincronizări pentru a preveni cererile excesive
const MIN_SYNC_INTERVAL = 30000; // Crescut la 30 secunde (era 15 secunde)

/**
 * Hook personalizat pentru sincronizarea profilului utilizatorului între pagini
 * Sincronizează automat când:
 * 1. Componenta se montează
 * 2. Ruta se schimbă
 * 3. La fiecare interval de timp configurat
 */
export const useProfileSync = (options = { syncInterval: 120000 }) => {
  // Crescut la 2 minute (era 60 secunde)
  const { user, refreshUserData } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [syncErrors, setSyncErrors] = useState(0);
  const lastSyncAttemptRef = useRef<number>(0);
  const location = useLocation();

  // Resetarea contorului de erori când utilizatorul se schimbă
  useEffect(() => {
    setSyncErrors(0);
    setQuotaExceeded(false);
  }, [user?.uid]);

  // Funcție pentru sincronizarea profilului utilizând AuthContext
  const synchronizeProfile = useCallback(
    async (force = false) => {
      if (!user) return false;

      // Verificăm dacă a trecut suficient timp de la ultima încercare de sincronizare
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncAttemptRef.current;

      if (!force && timeSinceLastSync < MIN_SYNC_INTERVAL) {
        hookLogger.debug(
          `Sincronizare ignorată: prea curând de la ultima încercare (${timeSinceLastSync}ms)`
        );
        return false;
      }

      // Verificăm dacă suntem în starea de depășire a cotei
      if (quotaExceeded && !force) {
        hookLogger.warn("Sincronizare ignorată: cota Firebase a fost depășită");
        return false;
      }

      // Actualizăm timestamp-ul ultimei încercări
      lastSyncAttemptRef.current = now;

      try {
        setIsSyncing(true);

        // Folosim fie refreshUserData din AuthContext, fie serviciul nostru direct
        if (typeof refreshUserData === "function") {
          hookLogger.debug("Sincronizare prin AuthContext.refreshUserData");
          await refreshUserData();
          const synced = await syncUserProfile(force);
          setLastSyncTime(new Date());

          // Resetăm contorul de erori și starea de depășire a cotei la sincronizare reușită
          setSyncErrors(0);
          setQuotaExceeded(false);

          return synced;
        } else {
          hookLogger.debug("Sincronizare directă prin ProfileSyncService");
          const synced = await syncUserProfile(force);
          setLastSyncTime(new Date());

          // Resetăm contorul de erori și starea de depășire a cotei la sincronizare reușită
          setSyncErrors(0);
          setQuotaExceeded(false);

          return synced;
        }
      } catch (error: any) {
        hookLogger.error("Eroare la sincronizarea profilului:", error);

        // Verificăm dacă eroarea este de tip quota-exceeded
        const isQuotaExceeded =
          error?.code === "auth/quota-exceeded" ||
          error?.message?.includes("quota-exceeded") ||
          error?.message?.includes("quota exceeded");

        if (isQuotaExceeded) {
          setQuotaExceeded(true);
          hookLogger.warn(
            "Cota Firebase a fost depășită, vom limita sincronizările"
          );
        }

        // Incrementăm contorul de erori
        setSyncErrors((prev) => prev + 1);

        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [user, refreshUserData, quotaExceeded]
  );

  // Verifică schimbările și sincronizează dacă este necesar
  const checkAndSync = useCallback(async () => {
    if (!user) return false;

    // Dacă am depășit cota, limităm verificările
    if (quotaExceeded) {
      hookLogger.warn("Verificare ignorată: cota Firebase a fost depășită");
      return false;
    }

    // Verificăm dacă a trecut suficient timp de la ultima încercare
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncAttemptRef.current;

    if (timeSinceLastSync < MIN_SYNC_INTERVAL) {
      hookLogger.debug(
        `Verificare ignorată: prea curând de la ultima încercare (${timeSinceLastSync}ms)`
      );
      return false;
    }

    try {
      setIsSyncing(true);
      const needsSync = await ProfileSyncService.checkForChanges();

      if (needsSync) {
        hookLogger.info("Detectate modificări în profil, se sincronizează");
        return await synchronizeProfile(true);
      }

      return false;
    } catch (error: any) {
      hookLogger.error("Eroare la verificarea schimbărilor profilului:", error);

      // Verificăm dacă eroarea este de tip quota-exceeded
      const isQuotaExceeded =
        error?.code === "auth/quota-exceeded" ||
        error?.message?.includes("quota-exceeded") ||
        error?.message?.includes("quota exceeded");

      if (isQuotaExceeded) {
        setQuotaExceeded(true);
        hookLogger.warn(
          "Cota Firebase a fost depășită, vom limita sincronizările"
        );
      }

      // Incrementăm contorul de erori
      setSyncErrors((prev) => prev + 1);

      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, synchronizeProfile, quotaExceeded]);

  // Sincronizare la schimbarea rutei - doar dacă nu avem probleme cu cota
  // și doar pentru anumite rute importante
  useEffect(() => {
    if (user && !quotaExceeded) {
      const importantRoutes = [
        "/admin",
        "/user-home",
        "/profile",
        "/dashboard",
        "/settings",
      ];
      const shouldSync = importantRoutes.some((route) =>
        location.pathname.includes(route)
      );

      if (shouldSync) {
        hookLogger.debug(
          "Ruta s-a schimbat, verificăm profilul:",
          location.pathname
        );
        synchronizeProfile();
      } else {
        hookLogger.debug(
          "Ruta s-a schimbat, dar nu e necesară sincronizarea:",
          location.pathname
        );
      }
    }
  }, [location.pathname, user, synchronizeProfile, quotaExceeded]);

  // Sincronizare periodică, cu interval adaptiv în funcție de erorile anterioare
  useEffect(() => {
    if (!user || options.syncInterval <= 0) return;

    // Calculăm un interval adaptiv bazat pe numărul de erori
    // Cu cât avem mai multe erori, cu atât creștem intervalul
    const adaptiveInterval =
      syncErrors > 0
        ? Math.min(options.syncInterval * Math.pow(2, syncErrors), 900000) // Maxim 15 minute (era 5 minute)
        : options.syncInterval;

    hookLogger.debug(
      `Setăm interval de sincronizare adaptiv: ${adaptiveInterval}ms`
    );

    const intervalId = setInterval(() => {
      // Nu sincronizăm dacă am depășit cota, doar dacă e forțat
      if (!quotaExceeded) {
        hookLogger.debug("Sincronizare periodică a profilului");
        checkAndSync();
      }
    }, adaptiveInterval);

    return () => clearInterval(intervalId);
  }, [user, options.syncInterval, checkAndSync, syncErrors, quotaExceeded]);

  // Sincronizare la montarea componentei, cu verificare pentru depășirea cotei
  useEffect(() => {
    if (user && !quotaExceeded) {
      hookLogger.debug("Componenta s-a montat, sincronizăm profilul inițial");
      synchronizeProfile();
    }
  }, [user, synchronizeProfile, quotaExceeded]);

  // Sincronizare la schimbarea utilizatorului - întotdeauna forțăm această sincronizare
  useEffect(() => {
    if (user) {
      hookLogger.debug("Utilizatorul s-a schimbat, sincronizăm profilul");
      synchronizeProfile(true);
    }
  }, [user?.uid, synchronizeProfile]);

  // Ascultă evenimentele de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        hookLogger.debug(
          "Detectată schimbare în starea de autentificare, sincronizăm profilul"
        );
        // Forțăm sincronizarea, indiferent de starea cotei
        // Folosim TokenManager.resetTokenBackoff() pentru a permite o nouă încercare
        TokenManager.resetTokenBackoff();
        synchronizeProfile(true);
      }
    });

    return () => unsubscribe();
  }, [synchronizeProfile]);

  return {
    synchronizeProfile,
    checkAndSync,
    forceSynchronization: () => synchronizeProfile(true),
    isSyncing,
    lastSyncTime,
    quotaExceeded,
    resetQuotaStatus: () => {
      setQuotaExceeded(false);
      setSyncErrors(0);
      TokenManager.resetTokenBackoff();
    },
  };
};

export default useProfileSync;
