import React, { Suspense, lazy } from "react";

/**
 * Component care va fi afișat în timpul încărcării unui component lazy-loaded
 */
export const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

/**
 * Funcție helper pentru încărcarea lazy a componentelor
 * @param factory - O funcție care returnează un import dinamic
 * @returns Componenta încărcată lazy
 */
// eslint-disable-next-line react-refresh/only-export-components
export const lazyLoad = (factory: () => Promise<{ default: React.ComponentType<any> }>) => {
  return lazy(factory);
};

/**
 * Wrapper pentru componente lazy
 * 
 * @param Component - Componentul încărcat lazy
 * @param fallback - Component afișat în timpul încărcării (opțional, default: DefaultFallback)
 * @returns Componentul wrapped cu Suspense
 */
interface LazyComponentProps {
  component: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ 
  component, 
  fallback = <DefaultFallback /> 
}) => (
  <Suspense fallback={fallback}>
    {component}
  </Suspense>
);