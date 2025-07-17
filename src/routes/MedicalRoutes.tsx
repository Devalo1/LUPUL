import React from "react";
import { Route, Routes } from "react-router-dom";
import MedicalSystemDashboard from "../components/MedicalSystemDashboard";
import IntelligentMedicalAssistant from "../components/IntelligentMedicalAssistant";
import DatabaseManagement from "../components/DatabaseManagement";
import MedicinesListPage from "../components/MedicinesListPage";

const MedicalRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MedicalSystemDashboard />} />
      <Route path="/dashboard" element={<MedicalSystemDashboard />} />
      <Route path="/assistant" element={<IntelligentMedicalAssistant />} />
      <Route path="/medicines" element={<MedicinesListPage />} />
      <Route path="/database" element={<DatabaseManagement />} />
    </Routes>
  );
};

export default MedicalRoutes;
