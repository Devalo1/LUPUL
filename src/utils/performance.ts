import { logger } from "./debug";

// Interfață pentru opțiuni de încărcare lazy a imaginilor
export interface ImageOptimizationOptions {
  quality?: number;       // Calitatea imaginii (1-100)
  placeholder?: boolean;  // Dacă să se genereze un placeholder
  threshold?: number;     // Pragul de vizibilitate pentru lazy loading
  sizes?: string;         // Atributul sizes pentru responsive images
}

// Interfață pentru monitorizarea performanței
export interface PerformanceMetrics {
  pageLoad: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

// Interfață pentru informații despre bundle
interface BundleInfo {
  name: string | undefined;
  size: string;
  transferSize: string;
  compressionRatio: string;
}

// Define window performance wrapper to prevent name conflicts
export const performanceUtil = {
  mark: (name: string): void => {
    try {
      window.performance.mark(name);
      logger.info(`Performance mark: ${name}`);
    } catch (e: unknown) {
      logger.error(`Error creating performance mark ${name}:`, e as Error);
    }
  },
  measure: (name: string, startMark: string, endMark: string): number => {
    try {
      const measure = window.performance.measure(name, startMark, endMark);
      logger.info(`Performance measure: ${name}`, { data: { duration: measure.duration } });
      return measure.duration;
    } catch (e: unknown) {
      logger.error(`Error creating performance measure ${name}:`, e as Error);
      return 0;
    }
  },
  logNavigation: (): void => {
    if (window.performance && window.performance.timing) {
      const t = window.performance.timing;
      const pageloadTime = t.loadEventEnd - t.navigationStart;
      logger.info(`Page load time: ${pageloadTime}ms`);
    }
  },
  
  // Optimizarea imaginilor
  optimizeImageUrl: (url: string, width: number, quality: number = 80): string => {
    // Dacă URL-ul este extern sau nu este o imagine, îl returnăm direct
    if (!url || url.startsWith("http") || !url.match(/\.(jpe?g|png|webp|avif)$/i)) {
      return url;
    }
    
    // Dacă url-ul începe cu / (este în directorul public), îl considerăm local
    const imgUrl = new URL(url, window.location.origin);
    
    // Adăugăm parametrii pentru CDN sau pentru servicii de optimizare a imaginilor
    // Aceasta este o simulare - în producție, ați putea folosi Cloudinary, Imgix, etc.
    imgUrl.searchParams.set("w", width.toString());
    imgUrl.searchParams.set("q", quality.toString());
    imgUrl.searchParams.set("auto", "format");
    
    return imgUrl.toString();
  },
  
  // Funcție pentru a genera un placeholder pentru imagini
  generatePlaceholder: (width: number, height: number, color: string = "lightgray"): string => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${color.replace("#", "%23")}'/%3E%3C/svg%3E`;
  },
  
  // Funcție pentru a colecta toate metricile de performanță disponibile
  collectPerformanceMetrics: (): PerformanceMetrics => {
    const metrics: PerformanceMetrics = {
      pageLoad: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
    };
    
    // Basic metrics
    if (window.performance && window.performance.timing) {
      const t = window.performance.timing;
      metrics.pageLoad = t.loadEventEnd - t.navigationStart;
    }
    
    // Paint metrics
    const paintEntries = window.performance.getEntriesByType("paint");
    const fpEntry = paintEntries.find(entry => entry.name === "first-paint");
    const fcpEntry = paintEntries.find(entry => entry.name === "first-contentful-paint");
    
    if (fpEntry) metrics.firstPaint = fpEntry.startTime;
    if (fcpEntry) metrics.firstContentfulPaint = fcpEntry.startTime;
    
    // Web Vitals if available
    if ("PerformanceObserver" in window) {
      // Let's collect what we already have
    }
    
    return metrics;
  },
  
  // Reducer Bundle Sizes - verifică dimensiunea bundle-urilor JS
  analyzeJsBundles: () => {
    const resources = window.performance.getEntriesByType("resource");
    const jsBundles = resources.filter(resource => 
      resource.name.endsWith(".js") && resource.initiatorType === "script"
    );
    
    // Sortăm după dimensiune și logăm primele 5 bundle-uri ca cele mai mari
    const largestBundles = [...jsBundles]
      .sort((a, b) => b.encodedBodySize - a.encodedBodySize)
      .slice(0, 5);
    
    const bundleInfos: BundleInfo[] = largestBundles.map(bundle => ({
      name: bundle.name.split("/").pop(),
      size: `${(bundle.encodedBodySize / 1024).toFixed(2)} KB`,
      transferSize: `${(bundle.transferSize / 1024).toFixed(2)} KB`,
      compressionRatio: bundle.transferSize > 0 
        ? (bundle.encodedBodySize / bundle.transferSize).toFixed(2) 
        : "N/A"
    }));
    
    logger.info("Top 5 largest JS bundles:", { bundles: bundleInfos });
    
    return largestBundles;
  }
};

// Detectare Firefox pentru prefetch
const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.indexOf("Firefox") > -1;

// Implementare prefetch pentru resurse critice
export const prefetchCriticalResources = (urls: string[]): void => {
  if (typeof document === "undefined") return;
  
  // Nu folosim prefetch în Firefox din cauza unei probleme de performanță
  const linkRel = isFirefox ? "preload" : "prefetch";
  
  urls.forEach(url => {
    const link = document.createElement("link");
    link.rel = linkRel;
    link.href = url;
    
    // Determinăm tipul resursei bazat pe extensie
    const fileExtension = url.split(".").pop()?.toLowerCase();
    if (fileExtension) {
      if (["js"].includes(fileExtension)) {
        link.as = "script";
      } else if (["css"].includes(fileExtension)) {
        link.as = "style";
      } else if (["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(fileExtension)) {
        link.as = "image";
      }
    }
    
    document.head.appendChild(link);
    logger.info(`Prefetched resource: ${url}`);
  });
};

// This should be used inside a component, not at module level
export const initPerformanceMonitoring = (): void => {
  if (typeof window === "undefined") return;
  
  // Marker pentru începutul aplicației
  performanceUtil.mark("app-init-start");
  
  window.addEventListener("load", () => {
    performanceUtil.mark("app-loaded");
    performanceUtil.measure("app-load-time", "app-init-start", "app-loaded");
    
    // Colectăm și logăm toate metricile
    const metrics = performanceUtil.collectPerformanceMetrics();
    logger.info("Performance metrics:", { metrics });
    
    // Analizăm bundle-urile JS
    setTimeout(() => {
      performanceUtil.analyzeJsBundles();
    }, 1000);
    
    logger.info("Performance monitoring initialized");
  });
  
  // Detectăm și raportăm blocajele UI thread-ului
  let lastTime = performance.now();
  const thresholdMs = 100; // Considerăm blocaje de peste 100ms

  const detectLongTasks = () => {
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    
    if (elapsed > thresholdMs) {
      logger.warn(`UI thread blocked for ${elapsed.toFixed(1)}ms`);
    }
    
    lastTime = currentTime;
    window.requestAnimationFrame(detectLongTasks);
  };
  
  window.requestAnimationFrame(detectLongTasks);
};

// Hook pentru folosirea în componente React
export const usePerformanceMonitoring = () => {
  return performanceUtil;
};
