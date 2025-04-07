import React from 'react';
import { AuthProvider } from './contexts/AuthContext'; // Removed unused `useAuth`
import ErrorBoundary from './components/layout/ErrorBoundary'; // Corrected path

const Root = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </AuthProvider>
    );
};

export default Root;