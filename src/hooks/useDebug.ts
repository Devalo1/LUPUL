import { useEffect, useRef } from 'react';
import { logger } from '../utils/debug';

export function useComponentDebug(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    logger.log(`Component ${componentName} rendered (${renderCount.current})`);
    
    return () => {
      logger.log(`Component ${componentName} unmounted`);
    };
  }, [componentName]);
  
  return renderCount.current;
}

export function useStateDebug<T>(state: T, stateName: string, componentName?: string) {
  const prev = useRef<T>(state);
  
  useEffect(() => {
    if (prev.current !== state) {
      const prefix = componentName ? `[${componentName}]` : '';
      logger.log(`${prefix} State "${stateName}" changed:`, {
        from: prev.current,
        to: state
      });
      prev.current = state;
    }
  }, [state, stateName, componentName]);
}

export function useEffectDebug(
  effect: React.EffectCallback,
  deps: React.DependencyList | undefined,
  effectName: string,
  componentName?: string
) {
  useEffect(() => {
    const prefix = componentName ? `[${componentName}]` : '';
    logger.log(`${prefix} Effect "${effectName}" running`);
    
    const cleanup = effect();
    
    return () => {
      logger.log(`${prefix} Effect "${effectName}" cleanup`);
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
