import { lazy } from "react";

/**
 * Funcție helper pentru încărcarea lazy a componentelor
 * @param factory - O funcție care returnează un import dinamic
 * @returns Componenta încărcată lazy
 */
export const lazyLoad = (factory: () => Promise<{ default: React.ComponentType<any> }>) => {
  return lazy(factory);
};