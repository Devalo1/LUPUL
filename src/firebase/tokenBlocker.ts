/**
 * Token Blocker - Modul pentru blocarea completă a cererilor problematice de token
 * 
 * Acest modul oferă o soluție la nivel global pentru a opri complet toate
 * cererile către securetoken.googleapis.com când sunt detectate probleme.
 */

import logger from "../utils/logger";
import { GenericObject } from "../types/common-types";

type _DynamicObject = Record<string, unknown>;

const blockerLogger = logger.createLogger("TokenBlocker");

interface BlockerState {
  isTokenFetchBlocked: boolean;
  blockStartTime: number | null;
  blockDuration: number; // în milisecunde
  errorCount: number;
  lastErrorTime: number | null;
  criticalErrorDetected: boolean;
}

// Inițializăm starea blocker-ului
const state: BlockerState = {
  isTokenFetchBlocked: false,
  blockStartTime: null,
  blockDuration: 5 * 60 * 1000, // 5 minute inițial
  errorCount: 0,
  lastErrorTime: null,
  criticalErrorDetected: false
};

// Flag pentru a verifica dacă modulul a fost inițializat
let initialized = false;

/**
 * Interceptează și blocheaza cererile problematice către Firebase Authentication
 */
export const initTokenBlocker = (): void => {
  if (initialized) return;
  initialized = true;

  blockerLogger.info("Token Blocker inițializat - monitorizăm cererile problematice de token");

  // Suprascriem fetch pentru a putea bloca cererile problematice
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = input.toString();

    // Verificăm dacă este o cerere către serviciul de token Firebase
    if (url.includes("securetoken.googleapis.com")) {
      // Dacă blocarea este activă, refuzăm cererea complet
      if (isBlocked()) {
        const remainingBlockTime = Math.ceil((state.blockDuration - (Date.now() - (state.blockStartTime || 0))) / 1000);
        
        blockerLogger.warn(`Cerere blocată către ${url} - Rămân ${remainingBlockTime} secunde de blocare`);
        
        // În loc să facem cererea, aruncăm o eroare controlată
        throw new Error(`BLOCKED_TOKEN_REQUEST: Cerere blocată pentru a preveni problemele de autentificare. Reîncărcați pagina peste ${remainingBlockTime} secunde.`);
      }
      
      // Dacă nu e blocat, monitorizăm cererea
      try {
        const response = await originalFetch(input, init);
        
        // Verificăm dacă răspunsul este eroare
        if (!response.ok) {
          handleTokenError(`HTTP error: ${response.status} ${response.statusText}`);
          
          // Pentru Bad Request și erorile de rată, blocăm imediat
          if (response.status === 400 || response.status === 429) {
            blockTokenRequests("Eroare HTTP critică detectată: " + response.status);
          }
        }
        
        return response;
      } catch (error) {
        // Captăm eroarea, o înregistrăm și o propagăm
        handleTokenError(`Fetch error: ${String(error)}`);
        throw error;
      }
    }
    
    // Pentru alte cereri, comportament normal
    return originalFetch(input, init);
  };
  
  // Suprascriem și XMLHttpRequest pentru a ne asigura că blocăm toate cererile
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ..._args: unknown[]): void {
    const urlStr = url.toString();
    
    // Verificăm dacă este o cerere către serviciul de token Firebase
    if (urlStr.includes("securetoken.googleapis.com") && isBlocked()) {
      const remainingBlockTime = Math.ceil((state.blockDuration - (Date.now() - (state.blockStartTime || 0))) / 1000);
      
      blockerLogger.warn(`XHR cerere blocată către ${urlStr} - Rămân ${remainingBlockTime} secunde de blocare`);
      
      // Simulăm un răspuns de eroare
      setTimeout(() => {
        if (typeof this.onerror === "function") {
          const event = new ProgressEvent("error", { 
            bubbles: false,
            cancelable: false
          });
          this.onerror(event as unknown as ProgressEvent<EventTarget>);
        }
        if (typeof this.onloadend === "function") {
          const event = new ProgressEvent("loadend");
          this.onloadend(event);
        }
      }, 10);
      
      // Modificăm URL-ul la unul invalid pentru a preveni cererea reală
      // originalXHROpen.apply(this, [method, 'about:blank', ...args]);
      
      // O abordare alternativă este să nu apelăm deloc metoda originală
      // și să lăsăm XHR-ul într-o stare unde send() nu va face nimic
      this.abort = function() {}; // Suprascrie abort pentru a nu arunca erori
      this.send = function() {}; // Suprascrie send pentru a nu face cererea
      return;
    }
    
    // Pentru alte cereri, comportament normal
    originalXHROpen.apply(this, [
      method, 
      url, 
      true, // async parameter
      null,  // username parameter
      null   // password parameter
    ]);
  };
  
  // Monitorizăm și erorile de consolă pentru a detecta probleme cu token-urile
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]): void => {
    // Apelăm funcția originală
    originalConsoleError.apply(console, args);
    
    // Verificăm dacă eroarea este legată de token-uri Firebase
    const errorMsg = args.join(" ");
    if (
      errorMsg.includes("auth/quota-exceeded") || 
      errorMsg.includes("400 Bad Request") ||
      errorMsg.includes("auth/invalid-credential") ||
      errorMsg.includes("securetoken.googleapis.com")
    ) {
      // Înregistrăm eroarea și posibil blocăm cererile viitoare
      handleTokenError(errorMsg);
      
      // Dacă eroarea este critică, blocăm imediat
      if (errorMsg.includes("auth/quota-exceeded") || errorMsg.includes("400 Bad Request")) {
        blockTokenRequests("Eroare critică detectată în consolă: " + errorMsg.substring(0, 50));
      }
    }
  };
};

/**
 * Verifică dacă cererile de token sunt blocate în acest moment
 */
export const isBlocked = (): boolean => {
  // Dacă nu este blocat, returnăm false direct
  if (!state.isTokenFetchBlocked) return false;
  
  // Verificăm dacă perioada de blocare a expirat
  const now = Date.now();
  if (state.blockStartTime && now - state.blockStartTime >= state.blockDuration) {
    // Perioada de blocare a expirat, resetăm blocarea
    state.isTokenFetchBlocked = false;
    blockerLogger.info("Perioada de blocare a expirat - reactivăm cererile de token");
    return false;
  }
  
  return true;
};

/**
 * Tratează o eroare legată de token-uri
 */
const handleTokenError = (errorMsg: string): void => {
  const now = Date.now();
  
  // Incrementăm contorul de erori
  state.errorCount++;
  state.lastErrorTime = now;
  
  // Verificăm dacă eroarea este critică
  if (
    errorMsg.includes("auth/quota-exceeded") || 
    errorMsg.includes("400 Bad Request") ||
    errorMsg.includes("429")
  ) {
    state.criticalErrorDetected = true;
    blockerLogger.error(`Eroare critică de token detectată: ${errorMsg.substring(0, 100)}...`);
  }
  
  // Dacă avem mai multe erori într-un interval scurt, blocăm cererile
  const ERROR_THRESHOLD = 3;
  const ERROR_WINDOW = 30 * 1000; // 30 secunde
  
  if (state.errorCount >= ERROR_THRESHOLD && 
      (state.lastErrorTime && now - state.lastErrorTime < ERROR_WINDOW)) {
    blockTokenRequests(`Prag de erori atins (${state.errorCount}/${ERROR_THRESHOLD} într-un interval de ${ERROR_WINDOW/1000}s)`);
  }
};

/**
 * Activează blocarea cererilor de token
 */
export const blockTokenRequests = (reason: string): void => {
  if (state.isTokenFetchBlocked) {
    // Dacă suntem deja în stare de blocare, doar extindem durata
    state.blockDuration = Math.min(state.blockDuration * 1.5, 30 * 60 * 1000); // Max 30 minute
    
    blockerLogger.warn(`Blocarea cererilor de token a fost extinsă la ${state.blockDuration/60000} minute: ${reason}`);
    
    return;
  }
  
  state.isTokenFetchBlocked = true;
  state.blockStartTime = Date.now();
  
  // Calculăm durata de blocare bazată pe numărul de erori
  // Începem cu 5 minute și creștem exponențial, până la maxim 30 minute
  let blockMinutes = Math.min(5 * Math.pow(1.5, state.errorCount - 3), 30);
  state.blockDuration = blockMinutes * 60 * 1000;
  
  blockerLogger.warn(`Cererile de token au fost blocate pentru ${blockMinutes} minute: ${reason}`);
  
  // Afișăm o notificare utilizatorului
  showBlockNotification(blockMinutes);
  
  // Programăm și o verificare la final pentru a vedea dacă trebuie să reîncărcăm pagina
  setTimeout(() => {
    if (state.criticalErrorDetected) {
      blockerLogger.info("Perioada de blocare s-a încheiat, dar au fost detectate erori critice - reîncărcăm pagina");
      
      // Afișăm mesaj și reîncărcăm
      const reloadMsg = document.createElement("div");
      reloadMsg.style.position = "fixed";
      reloadMsg.style.top = "50%";
      reloadMsg.style.left = "50%";
      reloadMsg.style.transform = "translate(-50%, -50%)";
      reloadMsg.style.backgroundColor = "#3498db";
      reloadMsg.style.color = "white";
      reloadMsg.style.padding = "20px";
      reloadMsg.style.borderRadius = "5px";
      reloadMsg.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
      reloadMsg.style.zIndex = "10000";
      reloadMsg.style.fontSize = "16px";
      reloadMsg.textContent = "Reîmprospătăm pagina pentru a rezolva problemele de autentificare...";
      
      document.body.appendChild(reloadMsg);
      
      // Reîncărcăm după 2 secunde
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, state.blockDuration);
};

/**
 * Afișează o notificare utilizatorului despre blocarea cererilor
 */
const showBlockNotification = (blockMinutes: number): void => {
  // Creăm un element pentru notificare
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#e74c3c";
  notification.style.color = "white";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "4px";
  notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  notification.style.zIndex = "10000";
  notification.style.maxWidth = "350px";
  notification.style.fontSize = "14px";
  
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">Probleme de autentificare detectate</div>
    <div>
      Am detectat probleme cu token-urile de autentificare. 
      Cererile au fost blocate temporar pentru ${blockMinutes} minute pentru a preveni erori suplimentare.
    </div>
    <div style="margin-top: 10px;">
      <button id="reload-page-btn" style="background: white; color: #e74c3c; border: none; padding: 5px 10px; 
      border-radius: 3px; cursor: pointer; margin-right: 10px;">Reîmprospătează pagina</button>
      <button id="dismiss-notification-btn" style="background: rgba(255,255,255,0.3); color: white; 
      border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Închide</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Adăugăm funcționalitate butoanelor
  document.getElementById("reload-page-btn")?.addEventListener("click", () => {
    window.location.reload();
  });
  
  document.getElementById("dismiss-notification-btn")?.addEventListener("click", () => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });
  
  // Eliminăm notificarea după 1 minut
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 60000);
};

/**
 * Resetează starea blocker-ului (utilizat în cazuri speciale, cum ar fi deconectarea voluntară)
 */
export const resetBlocker = (): void => {
  state.isTokenFetchBlocked = false;
  state.blockStartTime = null;
  state.blockDuration = 5 * 60 * 1000; // Resetăm la 5 minute
  state.errorCount = 0;
  state.lastErrorTime = null;
  state.criticalErrorDetected = false;
  
  blockerLogger.info("Token Blocker resetat complet");
};

interface _TokenData {
  token: string;
  expiration?: number;
  [key: string]: unknown;
}

// Add underscore to unused function and parameters
const _handleToken = (_tokenData: Record<string, unknown>): void => {
  // ...existing code...
};

const _someFunction = (_param: GenericObject) => {
  // ...existing code...
};

export default {
  initTokenBlocker,
  isBlocked,
  blockTokenRequests,
  resetBlocker
};
