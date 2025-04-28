import { User } from "firebase/auth";
import logger from "./logger";
import { auth } from "../firebase";
import TokenBlocker from "../firebase/tokenBlocker";

// Creăm un logger dedicat pentru TokenManager
const tokenLogger = logger.createLogger("TokenManager");

interface TokenState {
  lastTokenRequestTime: number;
  lastTokenError: string | null;
  backoffInterval: number;
  isInBackoff: boolean;
  tokenIsValid: boolean;
  consecutiveFailures: number;
  failureCount: number;      // Contor global de eșecuri
  circuitBreakerActive: boolean; // Indică dacă circuit breaker-ul este activ
  lastCircuitBreakerTime: number; // Când a fost activat ultima dată circuit breaker-ul
}

class TokenManager {
  private static maxBackoffInterval = 60 * 60 * 1000; // 1 oră în milisecunde
  private static initialBackoffInterval = 5 * 1000; // 5 secunde
  private static MAX_FAILURES_BEFORE_CIRCUIT_BREAK = 10; // După 10 eșecuri activăm circuit breaker
  private static CIRCUIT_BREAKER_TIMEOUT = 30 * 60 * 1000; // 30 minute de pauză
  private static tokenState: TokenState = {
    lastTokenRequestTime: 0,
    lastTokenError: null,
    backoffInterval: 5 * 1000, // Inițial 5 secunde
    isInBackoff: false,
    tokenIsValid: true,
    consecutiveFailures: 0,
    failureCount: 0,
    circuitBreakerActive: false,
    lastCircuitBreakerTime: 0
  };

  // Verifică dacă circuit breaker-ul este activ
  private static isCircuitBreakerActive(): boolean {
    if (!this.tokenState.circuitBreakerActive) {
      return false;
    }
    
    // Verificăm dacă a trecut timpul de pauză al circuit breaker-ului
    const now = Date.now();
    const timeElapsed = now - this.tokenState.lastCircuitBreakerTime;
    
    if (timeElapsed > this.CIRCUIT_BREAKER_TIMEOUT) {
      tokenLogger.info("Dezactivăm circuit breaker-ul după perioada de pauză");
      this.tokenState.circuitBreakerActive = false;
      this.tokenState.failureCount = 0;
      return false;
    }
    
    // Calculăm timpul rămas
    const minutesRemaining = Math.ceil((this.CIRCUIT_BREAKER_TIMEOUT - timeElapsed) / 60000);
    tokenLogger.debug(`Circuit breaker activ, ${minutesRemaining} minute rămase până la reactivare`);
    
    return true;
  }

  /**
   * Verifică dacă putem solicita un nou token (nu suntem în perioada de backoff)
   */
  static canRequestToken(): boolean {
    // Verificăm mai întâi dacă token blocker-ul global e activ
    if (TokenBlocker.isBlocked()) {
      tokenLogger.warn("Cerere de token ignorată - blocare globală activă");
      return false;
    }
    
    // Verificăm apoi circuit breaker-ul
    if (this.isCircuitBreakerActive()) {
      return false;
    }
    
    const now = Date.now();
    
    // Dacă suntem în backoff, verificăm dacă perioada de backoff s-a încheiat
    if (this.tokenState.isInBackoff) {
      const backoffEndTime = this.tokenState.lastTokenRequestTime + this.tokenState.backoffInterval;
      const canRequest = now >= backoffEndTime;
      
      if (canRequest) {
        tokenLogger.info("Perioada de backoff s-a încheiat, se pot face cereri noi de token");
        this.tokenState.isInBackoff = false;
      } else {
        const remainingTime = Math.ceil((backoffEndTime - now) / 1000);
        tokenLogger.debug(`Încă în perioada de backoff: ${remainingTime} secunde rămase`);
      }
      
      return canRequest;
    }
    
    return true;
  }

  /**
   * Verifică dacă token-ul curent este considerat valid
   */
  static isTokenValid(): boolean {
    // Verificăm mai întâi dacă token blocker-ul global e activ
    if (TokenBlocker.isBlocked()) {
      tokenLogger.debug("Token considerat invalid - blocare globală activă");
      return false;
    }
    
    // Verificăm apoi circuit breaker-ul
    if (this.isCircuitBreakerActive()) {
      return false;
    }
    
    // Dacă suntem în backoff, token-ul probabil nu este valid
    if (this.tokenState.isInBackoff && this.tokenState.consecutiveFailures > 2) {
      tokenLogger.debug("Token considerat invalid din cauza backoff-ului și eșecurilor consecutive");
      return false;
    }
    
    // Dacă ultima eroare este una critică, considerăm token-ul invalid
    if (this.tokenState.lastTokenError && 
        (this.tokenState.lastTokenError.includes("auth/quota-exceeded") ||
         this.tokenState.lastTokenError.includes("400 Bad Request") ||
         this.tokenState.lastTokenError.includes("auth/invalid-credential"))) {
      tokenLogger.debug(`Token considerat invalid din cauza erorii anterioare: ${this.tokenState.lastTokenError}`);
      return false;
    }
    
    return this.tokenState.tokenIsValid;
  }

  /**
   * Resetează complet starea token-ului
   */
  static resetTokenState(): void {
    tokenLogger.info("Se resetează starea token-ului");
    this.tokenState = {
      lastTokenRequestTime: 0,
      lastTokenError: null,
      backoffInterval: this.initialBackoffInterval,
      isInBackoff: false,
      tokenIsValid: true,
      consecutiveFailures: 0,
      failureCount: 0,
      circuitBreakerActive: false,
      lastCircuitBreakerTime: 0
    };
  }

  /**
   * Resetează doar backoff-ul token-ului, păstrând alte informații
   */
  static resetTokenBackoff(): void {
    tokenLogger.info("Se resetează backoff-ul token-ului");
    this.tokenState.isInBackoff = false;
    this.tokenState.backoffInterval = this.initialBackoffInterval;
  }

  /**
   * Marchează token-ul ca fiind invalid
   */
  static markTokenAsInvalid(error: string): void {
    tokenLogger.error(`Token marcat ca invalid: ${error}`);
    this.tokenState.tokenIsValid = false;
    this.tokenState.lastTokenError = error;
  }

  /**
   * Crește intervalul de backoff folosind strategia de backoff exponențial
   */
  private static increaseBackoffInterval(): number {
    // Dublăm intervalul cu un factor aleatoriu între 1 și 1.5 pentru a evita thundering herd
    const randomFactor = 1 + Math.random() * 0.5;
    this.tokenState.backoffInterval = Math.min(
      this.tokenState.backoffInterval * 2 * randomFactor,
      this.maxBackoffInterval
    );
    
    const backoffSeconds = Math.ceil(this.tokenState.backoffInterval / 1000);
    tokenLogger.warn(`Backoff crescut la ${backoffSeconds} secunde după eșec`);
    
    return this.tokenState.backoffInterval;
  }

  /**
   * Obține un token ID în mod sigur, cu gestionarea erorilor și backoff
   * @param user Obiectul User din Firebase Authentication
   * @param forceRefresh Indică dacă trebuie forțată reîmprospătarea token-ului
   * @returns Promise cu token-ul sau null în caz de eroare
   */
  static async getIdTokenSafely(user: User, forceRefresh = false): Promise<string | null> {
    // Verificăm dacă blocarea globală este activă
    if (TokenBlocker.isBlocked()) {
      tokenLogger.warn("Cerere de token ignorată - blocare globală activă");
      return null;
    }
    
    // Verificăm circuit breaker-ul
    if (this.isCircuitBreakerActive()) {
      tokenLogger.warn("Cerere de token ignorată - circuit breaker activ");
      return null;
    }
    
    // Verificăm dacă suntem în perioada de backoff
    if (!this.canRequestToken()) {
      const backoffSeconds = Math.ceil(this.tokenState.backoffInterval / 1000);
      tokenLogger.warn(`Cerere de token ignorată - în backoff pentru încă ${backoffSeconds} secunde`);
      return null;
    }

    try {
      tokenLogger.debug(`Obținem token ID (forceRefresh: ${forceRefresh})`);
      this.tokenState.lastTokenRequestTime = Date.now();
      
      const token = await user.getIdToken(forceRefresh);
      
      // Resetăm contorul de eșecuri și marcăm token-ul ca valid
      this.tokenState.consecutiveFailures = 0;
      this.tokenState.tokenIsValid = true;
      this.tokenState.lastTokenError = null;
      
      tokenLogger.debug("Token obținut cu succes");
      return token;
    } catch (error) {
      // Incrementăm contorul de eșecuri consecutive și contorul global
      this.tokenState.consecutiveFailures++;
      this.tokenState.failureCount++;
      
      const errorStr = String(error);
      tokenLogger.error(`Eroare la obținerea token-ului: ${errorStr}`);
      
      // Stocăm ultima eroare
      this.tokenState.lastTokenError = errorStr;
      
      // Gestionăm erori specifice pentru a decide dacă token-ul este invalid
      if (errorStr.includes("auth/quota-exceeded") || 
          errorStr.includes("auth/too-many-requests") ||
          errorStr.includes("400 Bad Request")) {
        
        // Marcăm token-ul ca invalid pentru erori de rate limit sau quota
        this.tokenState.tokenIsValid = false;
        
        // Aplicăm backoff exponențial
        this.tokenState.isInBackoff = true;
        this.increaseBackoffInterval();
        
        tokenLogger.error(
          `Eroare critică de token (${this.tokenState.consecutiveFailures} eșecuri consecutive). ` +
          `Backoff activat pentru ${Math.ceil(this.tokenState.backoffInterval / 1000)} secunde.`
        );
        
        // Activăm blocarea globală pentru erori critice repetate
        if (this.tokenState.consecutiveFailures >= 3) {
          TokenBlocker.blockTokenRequests(`Erori critice repetate de token: ${this.tokenState.consecutiveFailures}`);
        }
      } else if (errorStr.includes("auth/network-request-failed")) {
        // Pentru erori de rețea, aplicăm un backoff mai scurt
        this.tokenState.isInBackoff = true;
        this.tokenState.backoffInterval = Math.min(
          5000 * Math.pow(1.5, this.tokenState.consecutiveFailures),
          30000 // max 30 secunde pentru erori de rețea
        );
        
        tokenLogger.warn(
          `Eroare de rețea la obținerea token-ului. Backoff pentru ${Math.ceil(this.tokenState.backoffInterval / 1000)} secunde.`
        );
      }
      
      // Verificăm dacă trebuie să activăm circuit breaker-ul
      if (this.tokenState.failureCount >= this.MAX_FAILURES_BEFORE_CIRCUIT_BREAK) {
        tokenLogger.error(`Prea multe eșecuri globale (${this.tokenState.failureCount}), activăm circuit breaker-ul`);
        this.tokenState.circuitBreakerActive = true;
        this.tokenState.lastCircuitBreakerTime = Date.now();
        
        // Curățăm toate token-urile și forțăm deconectarea
        await this.clearTokensAndLogout();
        
        // Activăm și blocarea globală
        TokenBlocker.blockTokenRequests("Circuit breaker activat după prea multe eșecuri");
      }
      
      return null;
    }
  }

  /**
   * Verifică starea de sănătate a token-ului
   * @returns Obiect cu informații despre starea token-ului
   */
  static getTokenHealthStatus(): Record<string, any> {
    return {
      isTokenValid: this.tokenState.tokenIsValid,
      isInBackoff: this.tokenState.isInBackoff,
      backoffIntervalSeconds: Math.ceil(this.tokenState.backoffInterval / 1000),
      lastError: this.tokenState.lastTokenError,
      consecutiveFailures: this.tokenState.consecutiveFailures,
      globalFailureCount: this.tokenState.failureCount,
      circuitBreakerActive: this.isCircuitBreakerActive(),
      timeSinceLastRequest: this.tokenState.lastTokenRequestTime 
        ? Math.ceil((Date.now() - this.tokenState.lastTokenRequestTime) / 1000)
        : null
    };
  }

  /**
   * Curăță complet toate token-urile și datele de autentificare din localStorage și sessionStorage
   * Această metodă este mai agresivă decât resetTokenState și trebuie folosită doar când avem probleme grave
   */
  static async clearTokensAndLogout(): Promise<boolean> {
    // Verificăm dacă sunt prea multe apeluri într-un interval scurt
    const now = Date.now();
    if (now - this.tokenState.lastTokenRequestTime < 5000) {
      tokenLogger.warn("Prea multe încercări de curățare într-un interval scurt, se ignoră");
      return false;
    }
    
    tokenLogger.warn("Se curăță complet toate token-urile și datele de autentificare");
    this.tokenState.lastTokenRequestTime = now;
    
    try {
      // 1. Resetăm starea internă
      this.resetTokenState();
      
      // 2. Curățăm toate cheile din localStorage legate de Firebase/autentificare
      Object.keys(localStorage).forEach(key => {
        if (key.includes("firebase") || key.includes("token") || key.includes("auth")) {
          localStorage.removeItem(key);
          tokenLogger.info(`Șters din localStorage: ${key}`);
        }
      });
      
      // 3. Curățăm toate cheile din sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes("firebase") || key.includes("token") || key.includes("auth")) {
          sessionStorage.removeItem(key);
          tokenLogger.info(`Șters din sessionStorage: ${key}`);
        }
      });
      
      // 4. Curățăm și cookie-urile relevante
      document.cookie.split(";").forEach(c => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName.includes("firebase") || cookieName.includes("token") || cookieName.includes("auth")) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          tokenLogger.info(`Șters cookie: ${cookieName}`);
        }
      });
      
      // 5. Forțăm deconectarea utilizatorului
      try {
        if (auth.currentUser) {
          await auth.signOut();
          tokenLogger.info("Utilizatorul a fost deconectat cu succes");
          
          // Adăugăm un mesaj pentru utilizator
          const successMessage = document.createElement("div");
          successMessage.style.position = "fixed";
          successMessage.style.top = "20px";
          successMessage.style.left = "50%";
          successMessage.style.transform = "translateX(-50%)";
          successMessage.style.backgroundColor = "#4CAF50";
          successMessage.style.color = "white";
          successMessage.style.padding = "15px 20px";
          successMessage.style.borderRadius = "4px";
          successMessage.style.zIndex = "9999";
          successMessage.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
          successMessage.textContent = "Datele de autentificare au fost curățate. Reîmprospătați pagina sau reconectați-vă.";
          
          document.body.appendChild(successMessage);
          
          // Eliminăm mesajul după 10 secunde
          setTimeout(() => {
            if (successMessage.parentNode) {
              successMessage.parentNode.removeChild(successMessage);
            }
          }, 10000);
          
          // Activăm circuit breaker-ul după deconectare
          this.tokenState.circuitBreakerActive = true;
          this.tokenState.lastCircuitBreakerTime = now;
          tokenLogger.warn("Am activat circuit breaker-ul pentru a preveni reluarea imediată a încercărilor");
          
          // Activăm și blocarea globală
          TokenBlocker.blockTokenRequests("Deconectare forțată pentru curățarea token-urilor");
        }
      } catch (signOutError) {
        tokenLogger.error("Eroare la deconectarea utilizatorului:", signOutError);
      }
      
      tokenLogger.info("Curățare completă a token-urilor finalizată cu succes");
      
      // Reîmprospătăm pagina după scurt timp dacă nu suntem deconectați
      if (auth.currentUser) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
      
      return true;
    } catch (error) {
      tokenLogger.error("Eroare la curățarea token-urilor:", error);
      return false;
    }
  }
  
  /**
   * Încearcă să repare un token invalid prin reîmprospătare forțată
   * @param user Utilizatorul pentru care se încearcă repararea
   * @returns Promise cu boolean care indică succesul operațiunii
   */
  static async healToken(user: User): Promise<boolean> {
    if (!user) {
      tokenLogger.error("Nu se poate repara token-ul: utilizator inexistent");
      return false;
    }
    
    // Verificăm dacă blocarea globală este activă
    if (TokenBlocker.isBlocked()) {
      tokenLogger.warn("Nu se poate repara token-ul - blocare globală activă");
      return false;
    }
    
    // Verificăm dacă circuit breaker-ul este activ
    if (this.isCircuitBreakerActive()) {
      tokenLogger.warn("Nu se poate repara token-ul: circuit breaker activ");
      return false;
    }
    
    // Verificăm dacă s-au făcut prea multe încercări într-un interval scurt
    const now = Date.now();
    if (now - this.tokenState.lastTokenRequestTime < 2000) {
      tokenLogger.warn("Prea multe încercări de reparare într-un interval scurt, se ignoră");
      return false;
    }
    
    this.tokenState.lastTokenRequestTime = now;
    tokenLogger.warn("Se încearcă repararea token-ului invalid");
    
    try {
      // Resetăm starea token-ului pentru a șterge backoff-ul și erorile anterioare
      this.resetTokenBackoff();
      
      // Forțăm reîmprospătarea token-ului, dar cu un timeout
      const tokenPromise = user.getIdToken(true);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout la obținerea token-ului")), 5000)
      );
      
      // Folosim Promise.race pentru a avea un timeout
      const token = await Promise.race([tokenPromise, timeoutPromise]);
      
      if (token) {
        tokenLogger.info("Token reparat cu succes");
        this.tokenState.tokenIsValid = true;
        this.tokenState.consecutiveFailures = 0;
        this.tokenState.lastTokenError = null;
        return true;
      }
      
      return false;
    } catch (error) {
      tokenLogger.error("Eroare la repararea token-ului:", error);
      
      // Incrementăm contorul global de eșecuri
      this.tokenState.failureCount++;
      
      // Verificăm dacă trebuie să activăm circuit breaker-ul
      if (this.tokenState.failureCount >= this.MAX_FAILURES_BEFORE_CIRCUIT_BREAK) {
        tokenLogger.error(`Prea multe eșecuri globale (${this.tokenState.failureCount}), activăm circuit breaker-ul`);
        this.tokenState.circuitBreakerActive = true;
        this.tokenState.lastCircuitBreakerTime = now;
        
        // Curățăm toate token-urile și forțăm deconectarea
        await this.clearTokensAndLogout();
        
        // Activăm și blocarea globală
        TokenBlocker.blockTokenRequests("Circuit breaker activat după prea multe eșecuri");
      }
      
      return false;
    }
  }

  /**
   * Forțează o reîmprospătare a paginii după multiple curățări
   */
  static forcePageRefresh(): void {
    tokenLogger.warn("Forțăm reîmprospătarea paginii pentru a rezolva problemele de autentificare");
    
    // Adăugăm un mesaj pentru utilizator înainte de refresh
    const message = document.createElement("div");
    message.style.position = "fixed";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.backgroundColor = "#3498db";
    message.style.color = "white";
    message.style.padding = "20px";
    message.style.borderRadius = "5px";
    message.style.zIndex = "9999";
    message.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
    message.style.fontSize = "16px";
    message.style.textAlign = "center";
    message.innerHTML = "Reîmprospătăm pagina pentru a rezolva problemele de autentificare...<br>Vă rugăm să așteptați.";
    
    document.body.appendChild(message);
    
    // Reîmprospătăm pagina după 2 secunde
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}

export default TokenManager;