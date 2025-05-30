import React from "react";
import { Link } from "react-router-dom";

const Psihica: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Terapie psihică personalizată</h1>
          <p className="text-lg text-gray-700 mb-6">
            Pe platforma Lupul și Corbul, poți beneficia de consiliere psihologică și sprijin emoțional, cu ajutorul inteligenței artificiale și al specialiștilor umani. AI-ul nostru te poate ghida în gestionarea stresului, anxietății, depresiei sau a altor provocări, oferind recomandări personalizate și suport confidențial, 24/7.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Programează o sesiune sau încearcă chat-ul AI</h2>
          <p className="text-gray-700 mb-6">Formularul de programare și chat-ul AI personalizat vor fi disponibile aici. Vei putea discuta anonim, primi recomandări și, la nevoie, fi conectat cu un specialist uman.</p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition" disabled>
            În curând: Terapie AI & umană
          </button>
        </div>
        <div className="text-center">
          <Link to="/terapie" className="text-green-700 hover:underline">Înapoi la alegere terapie</Link>
        </div>
      </div>
    </div>
  );
};

export default Psihica;
