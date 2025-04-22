import { useRef, useEffect, DependencyList } from "react";
import logger from "../utils/logger";

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

/**
 * Debug hook for tracking effect executions
 * @param componentName Name of the component
 * @param effectName Name of the effect for identification
 * @param deps Standard React dependency array
 */
export function useDebugEffect(
  componentName: string,
  effectName: string,
  deps: DependencyList
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

/**
 * Creates a component-specific logger
 * @param componentName Name of the component
 * @returns Component logger with debug, info, warn, error methods
 */
export function useComponentLogger(componentName: string) {
  const loggerRef = useRef(logger.createLogger(componentName));
  
  return loggerRef.current;
}
