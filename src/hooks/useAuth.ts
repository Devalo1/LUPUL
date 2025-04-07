/**
 * DEPRECATED: Import useAuth directly from contexts/AuthContext instead.
 * This file exists only for backward compatibility.
 */
import { useAuth as useAuthFromContext } from '../contexts/AuthContext';

export const useAuth = () => {
    // Just a direct re-export to maintain backward compatibility
    return useAuthFromContext();
};

// Log deprecation warning
if (process.env.NODE_ENV === 'development') {
    console.warn(
        'Warning: Importing from "hooks/useAuth.ts" is deprecated. ' +
        'Please import useAuth directly from "contexts/AuthContext" instead.'
    );
}
