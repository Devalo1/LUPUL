// ProfileSyncService.ts - un serviciu dedicat sincronizării profilului între pagini
import { auth, firestore } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import logger from "../utils/logger";
import TokenManager from "../utils/TokenManager";

// Logger dedicat sincronizării profilului
const profileLogger = logger.createLogger("ProfileSync");

/**
 * Generate avatar URL based on user name
 */
const generateAvatarUrl = (displayName: string | null | undefined): string => {
  const name = displayName || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=150`;
};

// Un store simplu pentru versiunea profilului utilizat pentru a detecta schimbările
let profileVersion = 0;
let lastSyncTimestamp = 0;
// Stare pentru a evita prea multe încercări eșuate consecutive
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;
// Flag pentru a împiedica apelurile repetate în timp ce suntem în stare de eroare
let isSyncingSuspended = false;
// Timestamp pentru ultima verificare de schimbări
let lastChangeCheckTimestamp = 0;
// Intervalul minim între verificări (30 secunde)
const MIN_CHECK_INTERVAL = 30 * 1000;
// Numărul maxim de încercări de reparare a token-ului consecutiv
let tokenHealingAttempts = 0;
const MAX_TOKEN_HEALING_ATTEMPTS = 5;
// Timestamp pentru ultima încercare de reparare a token-ului
let lastTokenHealAttempt = 0;

/**
 * Utilitar pentru așteptare
 */
const _wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sincronizează profilul utilizatorului între Firebase Auth și Firestore
 * și asigură că datele sunt consistente în întreaga aplicație.
 */
export const syncUserProfile = async (force = false): Promise<boolean> => {
  const currentUser = auth.currentUser;
  
  // Adăugăm o verificare suplimentară pentru a evita sincronizări repetate
  // Folosim un id unic pentru această sesiune pentru a detecta duplicate
  const syncId = Date.now().toString();
  const lastSyncId = (window as any).__lastSyncId;
  
  if (lastSyncId === syncId && !force) {
    profileLogger.debug("Sincronizare ignorată - duplicate detection");
    return false;
  }
  
  // Salvăm id-ul sincronizării curente
  (window as any).__lastSyncId = syncId;
  
  // Verificăm dacă token-ul are circuit breaker activ prin TokenManager
  const tokenHealth = TokenManager.getTokenHealthStatus();
  if (tokenHealth.circuitBreakerActive) {
    profileLogger.warn("Sincronizare ignorată - circuit breaker token activ");
    return false;
  }
  
  // Verificăm dacă sincronizarea este suspendată din cauza erorilor de token
  if (isSyncingSuspended && !force) {
    profileLogger.warn("Sincronizarea profilului este suspendată temporar din cauza erorilor anterioare");
    return false;
  }
  
  // Verificăm dacă nu se fac prea multe cereri într-un timp scurt
  const now = Date.now();
  if (!force && now - lastSyncTimestamp < 1000) {
    profileLogger.warn("Prea multe cereri de sincronizare într-un interval scurt, ignorăm");
    return false;
  }
  
  // Verificăm dacă token-ul este valid înainte de a încerca sincronizarea
  const tokenValid = TokenManager.isTokenValid();
  if (!tokenValid) {
    // Dacă nu forțăm sincronizarea, o suspendăm temporar
    if (!force) {
      profileLogger.error("Token-ul este invalid. Suspendăm sincronizarea profilului temporar");
      isSyncingSuspended = true;
      
      // Încercăm să obținem detalii despre starea token-ului
      profileLogger.info(`Stare token: ${JSON.stringify(tokenHealth)}`);
      
      // Vom reîncerca după un timp (5 minute)
      setTimeout(() => {
        profileLogger.info("Reactivăm sincronizarea profilului după perioada de așteptare");
        isSyncingSuspended = false;
      }, 5 * 60 * 1000);
      
      return false;
    } else {
      // Verificăm dacă putem încerca repararea token-ului
      const now = Date.now();
      const timeSinceLastHeal = now - lastTokenHealAttempt;
      
      // Limitam frecvența reparărilor token-ului la maxim una la 30 secunde
      if (timeSinceLastHeal < 30000 && tokenHealingAttempts > 0) {
        profileLogger.warn(`Încercare de reparare token ignorată - a trecut prea puțin timp de la ultima încercare (${Math.floor(timeSinceLastHeal / 1000)}s)`);
      } else if (tokenHealingAttempts < MAX_TOKEN_HEALING_ATTEMPTS) {
        // Îmbunătățim logarea pentru acest caz
        profileLogger.warn("Token-ul este invalid, dar continuăm sincronizarea forțată la cererea explicită a aplicației");
        
        // ÎMBUNĂTĂȚIRE: Încercăm să reparăm token-ul înainte de sincronizare
        if (currentUser) {
          lastTokenHealAttempt = now;
          tokenHealingAttempts++;
          
          profileLogger.info(`Încercăm să reparăm token-ul înainte de sincronizarea forțată (încercarea ${tokenHealingAttempts}/${MAX_TOKEN_HEALING_ATTEMPTS})`);
          try {
            const healed = await TokenManager.healToken(currentUser);
            if (healed) {
              profileLogger.info("Token-ul a fost reparat cu succes");
              tokenHealingAttempts = 0; // Resetăm contorul dacă repararea a avut succes
            } else {
              profileLogger.warn("Nu s-a putut repara token-ul, continuăm oricum cu sincronizarea forțată");
              
              // Dacă am ajuns la numărul maxim de încercări, suspendăm repararea pentru o perioadă mai lungă
              if (tokenHealingAttempts >= MAX_TOKEN_HEALING_ATTEMPTS) {
                profileLogger.error(`Număr maxim de încercări de reparare token atins (${MAX_TOKEN_HEALING_ATTEMPTS}), suspendăm repararea pentru 10 minute`);
                
                // Suspendăm și sincronizarea dacă reparările repetate au eșuat
                isSyncingSuspended = true;
                
                // Resetăm după 10 minute
                setTimeout(() => {
                  tokenHealingAttempts = 0;
                  isSyncingSuspended = false;
                  profileLogger.info("Resetăm contorul de încercări de reparare token și reactivăm sincronizarea");
                }, 10 * 60 * 1000);
                
                return false;
              }
            }
          } catch (healError) {
            profileLogger.error("Eroare la încercarea de reparare a token-ului:", healError);
          }
        }
      } else {
        profileLogger.error(`Prea multe încercări consecutive de reparare a token-ului (${tokenHealingAttempts}), nu mai încercăm`);
        return false;
      }
    }
  } else {
    // Dacă token-ul este valid, resetăm contorul de încercări de reparare
    tokenHealingAttempts = 0;
  }
  
  if (!currentUser) {
    profileLogger.warn("Încercare de sincronizare a profilului fără utilizator autentificat");
    return false;
  }

  try {
    // Verifică dacă am avut prea multe eșecuri consecutive și nu este forțat
    if (!force && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      const backoffMinutes = Math.min(5 * Math.pow(2, consecutiveFailures - MAX_CONSECUTIVE_FAILURES), 60);
      const nextAttemptTime = lastSyncTimestamp + (backoffMinutes * 60 * 1000);
      
      if (Date.now() < nextAttemptTime) {
        profileLogger.warn(
          `Prea multe eșecuri consecutive (${consecutiveFailures}). ` +
          `Se va încerca din nou după ${backoffMinutes} minute.`
        );
        return false;
      }
    }

    // Limitează frecvența de sincronizare - nu mai des de o dată la 3 secunde
    // exceptând cazul când forțăm sincronizarea
    const now = Date.now();
    if (!force && now - lastSyncTimestamp < 3000) {
      profileLogger.debug("Sincronizare ignorată - a fost efectuată recent");
      return false;
    }

    lastSyncTimestamp = now;
    profileLogger.info("Începe sincronizarea profilului pentru utilizatorul", currentUser.uid);

    // Obținem datele utilizatorului din Firestore
    const userRef = doc(firestore, "users", currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Utilizatorul nu există în Firestore, îl creăm
      profileLogger.warn("Utilizatorul nu există în Firestore, se creează un nou document");
      await setDoc(userRef, {
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        email: currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        profileVersion: 1
      });
      profileVersion = 1;
      consecutiveFailures = 0; // Reset eșecuri consecutive în caz de succes
      return true;
    }

    const userData = userDoc.data();
    const storedVersion = userData.profileVersion || 0;

    // Verificăm dacă profilul din Firebase Auth și cel din Firestore sunt sincronizate
    if (force || 
        storedVersion > profileVersion ||
        userData.displayName !== currentUser.displayName ||
        userData.photoURL !== currentUser.photoURL) {

      profileLogger.info("Detectată discrepanță între Firebase Auth și Firestore");

      // Actualizăm profilul în Firebase Auth dacă este necesar
      if (userData.displayName !== currentUser.displayName || userData.photoURL !== currentUser.photoURL) {
        profileLogger.info("Actualizăm profilul în Firebase Auth");
        
        try {
          // Verificăm lungimea URL-ului pentru a preveni eroarea "Photo URL too long"
          const MAX_FIREBASE_AUTH_URL_LENGTH = 1000;
          const photoURL = userData.photoURL && userData.photoURL.length > MAX_FIREBASE_AUTH_URL_LENGTH
            ? generateAvatarUrl(userData.displayName || currentUser.displayName)
            : userData.photoURL;
            
          await updateProfile(currentUser, {
            displayName: userData.displayName || currentUser.displayName,
            photoURL: photoURL || currentUser.photoURL
          });
          
          profileLogger.info("Profil actualizat cu succes în Firebase Auth");
        } catch (updateError) {
          // Tratăm specific eroarea de URL prea lung
          if (String(updateError).includes("auth/invalid-profile-attribute") && 
              String(updateError).includes("Photo URL too long")) {
            profileLogger.warn("URL-ul fotografiei este prea lung pentru Firebase Auth, folosim avatar generat");
            
            // Folosim un avatar generat în loc
            try {
              await updateProfile(currentUser, {
                displayName: userData.displayName || currentUser.displayName,
                photoURL: generateAvatarUrl(userData.displayName || currentUser.displayName)
              });
              profileLogger.info("Profil actualizat cu avatarul generat");
            } catch (fallbackError) {
              profileLogger.error("Eroare la actualizarea profilului cu avatar generat:", fallbackError);
            }
          } else {
            // Re-aruncăm alte erori pentru a fi gestionate la nivel superior
            throw updateError;
          }
        }
      }

      // Actualizăm profilul în Firestore dacă este necesar
      if (force || userData.displayName !== currentUser.displayName || userData.photoURL !== currentUser.photoURL) {
        profileLogger.info("Actualizăm profilul în Firestore");
        
        await setDoc(userRef, {
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email,
          updatedAt: new Date(),
          profileVersion: storedVersion + 1
        }, { merge: true });
      }
      
      // Verificăm dacă token-ul este mai vechi de 30 de minute înainte de a încerca să îl reîmprospătăm
      const tokenAge = (Date.now() - (currentUser.metadata.lastSignInTime ? 
        new Date(currentUser.metadata.lastSignInTime).getTime() : 0)) / (1000 * 60);
      
      // Verificăm din nou dacă token-ul este valid și dacă putem solicita refresh conform regulilor de backoff
      if ((force || tokenAge > 30) && TokenManager.isTokenValid() && TokenManager.canRequestToken()) {
        profileLogger.info(`Token age is ${Math.round(tokenAge)} minutes, refreshing token`);
        // Folosim managerul de tokenuri în loc să apelăm direct getIdToken
        await TokenManager.getIdTokenSafely(currentUser, true);
      } else {
        profileLogger.debug(`Token refresh skipped: age=${Math.round(tokenAge)} min, valid=${TokenManager.isTokenValid()}, canRequest=${TokenManager.canRequestToken()}`);
      }
      
      // Actualizăm versiunea locală
      profileVersion = storedVersion + 1;
      consecutiveFailures = 0; // Reset eșecuri consecutive în caz de succes
      
      profileLogger.info("Sincronizare completă a profilului utilizatorului");
      return true;
    } else {
      profileLogger.debug("Profilul este deja sincronizat");
      consecutiveFailures = 0; // Reset eșecuri consecutive în caz de succes
      return false;
    }
  } catch (error) {
    consecutiveFailures++; // Incrementăm contorul de eșecuri consecutive
    
    // Verificăm dacă eroarea este legată de autentificare
    const errorStr = String(error);
    if (errorStr.includes("auth/") || errorStr.includes("400 Bad Request") || errorStr.includes("PERMISSION_DENIED")) {
      profileLogger.error("Eroare de autentificare la sincronizarea profilului:", error);
      
      // Suspendăm temporar sincronizarea după multiple eșecuri
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        profileLogger.error("Suspendăm sincronizarea profilului din cauza erorilor repetate de autentificare");
        isSyncingSuspended = true;
        
        // Verificăm dacă este o problemă de token și încercăm să o rezolvăm
        if (errorStr.includes("auth/quota-exceeded") || errorStr.includes("400 Bad Request")) {
          profileLogger.error("Eroare de token detectată, resetăm backoff-ul token-ului după 10 minute");
          
          // Resetăm backoff-ul după un interval mai lung (10 minute)
          setTimeout(() => {
            TokenManager.resetTokenBackoff();
          }, 10 * 60 * 1000);
        }
        
        // Reactivăm după un interval mai lung (10 minute)
        setTimeout(() => {
          profileLogger.info("Reactivăm sincronizarea profilului după perioada de așteptare");
          isSyncingSuspended = false;
          consecutiveFailures = Math.max(0, consecutiveFailures - 2); // Reducem contorul de eșecuri
        }, 10 * 60 * 1000);
      }
    } else {
      profileLogger.error("Eroare la sincronizarea profilului:", error);
    }
    
    return false;
  }
};

/**
 * Detectează schimbările în profil și reîmprospătează automat datele
 * @returns Un obiect cu metode pentru verificarea și reîmprospătarea profilului
 */
export const ProfileSyncService = {
  /**
   * Verifică dacă profilul a fost modificat de la ultima sincronizare
   */
  async checkForChanges(): Promise<boolean> {
    // Verificăm dacă circuit breaker-ul token-ului este activ
    const tokenHealth = TokenManager.getTokenHealthStatus();
    if (tokenHealth.circuitBreakerActive) {
      profileLogger.debug("Verificare ignorată - circuit breaker token activ");
      return false;
    }
    
    // Dacă sincronizarea este suspendată sau token-ul invalid, nu verificăm
    if (isSyncingSuspended) {
      profileLogger.debug("Verificare ignorată - sincronizarea este suspendată");
      return false;
    }
    
    if (!TokenManager.isTokenValid()) {
      profileLogger.debug("Verificare ignorată - token invalid");
      return false;
    }
    
    // Limitează frecvența verificărilor de schimbări pentru a reduce traficul
    const now = Date.now();
    if (now - lastChangeCheckTimestamp < MIN_CHECK_INTERVAL) {
      profileLogger.debug("Verificare ignorată - a fost efectuată recent");
      return false;
    }
    
    // Actualizăm timpul ultimei verificări
    lastChangeCheckTimestamp = now;
    
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    try {
      const userRef = doc(firestore, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      const storedVersion = userData.profileVersion || 0;
      
      return storedVersion > profileVersion;
    } catch (error) {
      profileLogger.error("Eroare la verificarea versiunii profilului:", error);
      return false;
    }
  },
  
  /**
   * Forțează sincronizarea imediată a profilului
   */
  async forceSynchronization(): Promise<boolean> {
    // Verificăm mai întâi circuit breaker-ul
    const tokenHealth = TokenManager.getTokenHealthStatus();
    if (tokenHealth.circuitBreakerActive) {
      profileLogger.warn("Nu se poate forța sincronizarea - circuit breaker token activ");
      return false;
    }
    
    // Chiar și când este suspendat, putem forța sincronizarea
    // dar verificăm înainte dacă token-ul permite cereri noi
    if (!TokenManager.canRequestToken()) {
      profileLogger.warn("Nu se poate forța sincronizarea - token-ul este în perioada de backoff");
      return false;
    }
    
    // ÎMBUNĂTĂȚIRE: Încercăm să reparăm token-ul dacă este invalid
    if (!TokenManager.isTokenValid() && auth.currentUser) {
      profileLogger.warn("Token invalid detectat, încercăm repararea înainte de sincronizarea forțată");
      try {
        const healed = await TokenManager.healToken(auth.currentUser);
        if (healed) {
          profileLogger.info("Token reparat cu succes, continuăm cu sincronizarea");
        } else {
          profileLogger.warn("Repararea token-ului a eșuat, dar continuăm cu sincronizarea forțată");
        }
      } catch (error) {
        profileLogger.error("Eroare la repararea token-ului:", error);
      }
    }
    
    return syncUserProfile(true);
  },
  
  /**
   * Sincronizează profilul dacă este necesar
   */
  async synchronizeIfNeeded(): Promise<boolean> {
    // Adăugăm un debounce pentru a preveni apeluri multiple rapide
    const now = Date.now();
    const debounceId = `sync_${now}`;
    
    if ((window as any).__lastSyncDebounce && 
        now - (window as any).__lastSyncDebounceTime < 2000) {
      profileLogger.debug("Sincronizare ignorată - debounce active");
      return false;
    }
    
    (window as any).__lastSyncDebounce = debounceId;
    (window as any).__lastSyncDebounceTime = now;
    
    // Restul codului original
    const isSuspended = isSyncingSuspended;
    const tokenHealth = TokenManager.getTokenHealthStatus();
    const isTokenValid = tokenHealth.isTokenValid;
    const canRequestToken = TokenManager.canRequestToken();
    const isCircuitBreakerActive = tokenHealth.circuitBreakerActive;
    
    // Verificăm circuit breaker-ul mai întâi
    if (isCircuitBreakerActive) {
      profileLogger.debug("Sincronizare ignorată - circuit breaker token activ");
      return false;
    }
    
    // Logging mai detaliat pentru a diagnostica problemele
    if (!isTokenValid || !canRequestToken || isSuspended) {
      profileLogger.debug(
        `Sincronizare ignorată - suspendat: ${isSuspended}, token valid: ${isTokenValid}, ` +
        `poate cere token: ${canRequestToken}`
      );
      return false;
    }
    
    const needsSync = await this.checkForChanges();
    if (needsSync) {
      profileLogger.info("Sincronizarea necesară - s-au detectat modificări în profil");
      return syncUserProfile(false); // Nu forțăm, dar sincronizăm deoarece sunt modificări
    }
    
    profileLogger.debug("Sincronizare ignorată - nu sunt modificări detectate");
    return false;
  },
  
  /**
   * Resetează starea de suspendare a sincronizării
   */
  resetSyncingState(): void {
    isSyncingSuspended = false;
    consecutiveFailures = 0;
    tokenHealingAttempts = 0;
    profileLogger.info("Starea de sincronizare a fost resetată");
    
    // Resetăm și starea token-ului pentru a permite o nouă încercare
    TokenManager.resetTokenState();
  },
  
  /**
   * Forțează curățarea completă a token-urilor și resetarea stării
   * Se folosește în situații de urgență când token-urile sunt corupte
   */
  async forceTokenReset(): Promise<boolean> {
    profileLogger.warn("Se forțează resetarea completă a token-urilor și a stării de sincronizare");
    
    // Resetăm starea de sincronizare
    isSyncingSuspended = false;
    consecutiveFailures = 0;
    tokenHealingAttempts = 0;
    
    // Curățăm toate token-urile
    return TokenManager.clearTokensAndLogout();
  },
  
  /**
   * Obține starea curentă a sincronizării profilului
   */
  getSyncStatus(): Record<string, any> {
    return {
      isSyncingSuspended,
      consecutiveFailures,
      tokenHealingAttempts,
      profileVersion,
      lastSyncTimestamp: lastSyncTimestamp > 0 ? new Date(lastSyncTimestamp).toISOString() : null,
      lastChangeCheckTimestamp: lastChangeCheckTimestamp > 0 ? new Date(lastChangeCheckTimestamp).toISOString() : null,
      lastTokenHealAttempt: lastTokenHealAttempt > 0 ? new Date(lastTokenHealAttempt).toISOString() : null,
      tokenStatus: TokenManager.getTokenHealthStatus()
    };
  }
};

// Exportăm funcția principală și serviciul
export default syncUserProfile;