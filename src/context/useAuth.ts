import { useContext } from 'react';
import { AuthContext, AuthContextType } from './authContextUtils';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    // Instead of throwing an error, return a default context for unauthenticated users
    return {
      currentUser: null,
      loading: false,
      signUp: () => Promise.resolve({ success: false, error: 'Not initialized' }),
      login: () => Promise.resolve({ success: false, error: 'Not initialized' }),
      signOut: () => Promise.resolve({ success: false, error: 'Not initialized' }),
      resetPassword: () => Promise.resolve({ success: false, error: 'Not initialized' })
    } as AuthContextType;
  }
  
  return context;
};
