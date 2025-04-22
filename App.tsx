import React from "react";
import { AuthProvider } from "./src/contexts/AuthProvider";
import AppLayout from "./src/components/AppLayout";

const App = () => {
    return (
        <AuthProvider>
            <AppLayout />
        </AuthProvider>
    );
};

export default App;
