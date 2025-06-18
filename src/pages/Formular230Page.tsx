import React from "react";
import Formular230 from "../components/forms/Formular230";

const Formular230Page: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
          Formular 230
        </h1>
        <p className="text-center text-lg mb-10 text-blue-700">
          Completează formularul pentru redirecționarea a 3.5% din impozitul pe
          venit către Asociația "Făuritorii de Destin"
        </p>

        <Formular230 />
      </div>
    </div>
  );
};

export default Formular230Page;
