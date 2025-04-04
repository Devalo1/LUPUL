import { useRef, useEffect } from 'react';
import { logger } from '../utils/logger';

export function useDebugRender(componentName: string) {
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    logger.debug(`Component ${componentName} rendered (${renderCount.current})`);
    return () => {
      logger.debug(`Component ${componentName} unmounted`);
    };
  }, [componentName]);
}

export function useDebugState<T>(
  componentName: string, 
  stateName: string, 
  state: T
) {
  const prevState = useRef<T>(state);
  
  useEffect(() => {
    const prefix = `[${componentName}]`;
    if (prevState.current !== state) {
      logger.debug(`${prefix} State "${stateName}" changed:`, {
        from: prevState.current,
        to: state
      });
      prevState.current = state;
    }
  }, [componentName, stateName, state]);
}

export function useDebugEffect(
  componentName: string,
  effectName: string,
  deps: any[]
) {
  useEffect(() => {
    const prefix = `[${componentName}]`;
    logger.debug(`${prefix} Effect "${effectName}" running`);
    
    return () => {
      logger.debug(`${prefix} Effect "${effectName}" cleanup`);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
