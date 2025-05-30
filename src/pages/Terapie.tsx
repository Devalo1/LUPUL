import React from "react";
import { Link } from "react-router-dom";

const Terapie: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Terapie personalizată cu AI și specialiști</h1>
          <p className="text-xl text-gray-700 mb-6">
            Platforma Lupul și Corbul îți oferă un spațiu sigur pentru suflet și corp, unde tehnologia și empatia se întâlnesc. Folosim inteligența artificială pentru a-ți oferi recomandări personalizate, dar și acces la specialiști reali, pentru o abordare completă și adaptată nevoilor tale.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Alege tipul de terapie potrivit pentru tine și descoperă cum poți beneficia de sprijin digital și uman, integrat într-o experiență modernă, sigură și confidențială.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-green-700 mb-2">Terapie psihică</h2>
            <p className="text-gray-700 mb-4 text-center">
              Sprijin pentru suflet, consiliere, gestionarea stresului, anxietății, depresiei și dezvoltare personală. Discuții cu specialiști și AI pentru a găsi soluții adaptate nevoilor tale, oricând ai nevoie.
            </p>
            <Link to="/terapie/psihica" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Programează terapie psihică</Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Terapie fizică pentru corp</h2>
            <p className="text-gray-700 mb-4 text-center">
              Recomandări pentru relaxare, exerciții, somn, respirație, mișcare și recuperare fizică. Programe personalizate cu suport AI și specialiști, pentru sănătatea corpului tău.
            </p>
            <Link to="/terapie/fizica" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Programează terapie fizică</Link>
          </div>
        </div>
        <div className="text-center">
          <Link to="/servicii" className="text-green-700 hover:underline">Înapoi la servicii</Link>
        </div>
      </div>
    </div>
  );
};

export default Terapie;
