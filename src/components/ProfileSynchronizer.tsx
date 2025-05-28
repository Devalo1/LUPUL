import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts";
import { ProfileSyncService } from "../services/ProfileSyncService";
import TokenManager from "../utils/TokenManager";
import useProfileSync from "../hooks/useProfileSync";
import logger from "../utils/logger";

const syncLogger = logger.createLogger("ProfileSynchronizer");

// Define the token interface to fix type errors
interface TokenStatus {
  isTokenValid?: boolean;
  isInBackoff?: boolean;
  backoffIntervalSeconds?: number;
  consecutiveFailures?: number;
}

interface SyncStatus {
  token?: TokenStatus;
  // other fields
  [key: string]: unknown;
}

/**
 * Componenta care gestionează sincronizarea profilului utilizatorului
 * Implementează strategii de recuperare și sincronizează profilul între pagini
 */
const ProfileSynchronizer: React.FC = () => {
  const { user } = useAuth();
  const { synchronizeProfile, isSyncing, quotaExceeded, resetQuotaStatus } =
    useProfileSync();
  const [debugVisible, setDebugVisible] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({});

  // Sincronizare periodică a profilului și actualizare status
  useEffect(() => {
    if (!user) return;

    // Actualizăm statusul sincronizării
    const updateSyncStatus = () => {
      const status = ProfileSyncService.getSyncStatus();
      const tokenStatus = TokenManager.getTokenHealthStatus();
      setSyncStatus({ ...status, token: tokenStatus as TokenStatus });
    };

    // Actualizăm statusul inițial
    updateSyncStatus();

    // Sincronizăm profilul imediat la început
    synchronizeProfile(true);

    // Setăm un interval pentru actualizarea statusului
    const statusInterval = setInterval(updateSyncStatus, 10000);

    // Curățăm la demontarea componentei
    return () => {
      clearInterval(statusInterval);
    };
  }, [user, synchronizeProfile]);

  // Adăugăm o tastă secretă pentru a afișa/ascunde informațiile de debug
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Dacă utilizatorul apasă Ctrl+Shift+D, afișăm/ascundem informațiile de debug
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
        setDebugVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Handler pentru resetarea stării token-ului și sincronizării
  const handleResetSync = () => {
    syncLogger.info("Se resetează starea de sincronizare și token");
    ProfileSyncService.resetSyncingState();
    resetQuotaStatus();
    synchronizeProfile(true);
  };

  // Nu afișăm nimic vizibil în mod normal
  if (!debugVisible) return null;

  // Interfața de debugging care apare doar când este activată
  return (
    <div className="fixed bottom-0 right-0 bg-gray-800 bg-opacity-90 text-white p-3 max-w-sm text-xs font-mono z-50 rounded-tl-lg">
      <h3 className="font-bold mb-2">Status Sincronizare Profil</h3>

      <div className="mb-2">
        <span
          className={`inline-block w-2 h-2 rounded-full mr-2 ${
            isSyncing
              ? "bg-yellow-400 animate-pulse"
              : quotaExceeded
                ? "bg-red-500"
                : "bg-green-500"
          }`}
        ></span>
        Status:{" "}
        {isSyncing
          ? "Sincronizare..."
          : quotaExceeded
            ? "Eroare Quota"
            : "Idle"}
      </div>

      <div className="mb-2">
        <div>
          Token Valid:{" "}
          <span
            className={
              syncStatus.token?.isTokenValid ? "text-green-400" : "text-red-400"
            }
          >
            {syncStatus.token?.isTokenValid ? "Da" : "Nu"}
          </span>
        </div>
        <div>
          În Backoff:{" "}
          <span
            className={
              syncStatus.token?.isInBackoff ? "text-red-400" : "text-green-400"
            }
          >
            {syncStatus.token?.isInBackoff
              ? `Da (${syncStatus.token?.backoffIntervalSeconds}s)`
              : "Nu"}
          </span>
        </div>
        <div>
          Erori Consecutive:{" "}
          <span
            className={
              (syncStatus.token?.consecutiveFailures || 0) > 0
                ? "text-red-400"
                : "text-green-400"
            }
          >
            {syncStatus.token?.consecutiveFailures || 0}
          </span>
        </div>
      </div>

      <button
        onClick={handleResetSync}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded mt-2"
      >
        Resetează Sincronizare
      </button>

      <div className="text-gray-400 text-xxs mt-2">
        Ctrl+Shift+D pentru a ascunde
      </div>
    </div>
  );
};

export default ProfileSynchronizer;
