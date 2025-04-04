import { useContext } from 'react';
import { AuthContext, useAuth as useAuthFromContext } from '../contexts/AuthContext';

// Option 1: Just re-export the hook from the context
export const useAuth = useAuthFromContext;

// Option 2: Or if you need to customize the hook
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
