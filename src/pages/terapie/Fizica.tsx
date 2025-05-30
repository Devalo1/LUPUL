import React from "react";
import { Link } from "react-router-dom";

const Fizica: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">Terapie fizică personalizată cu AI & specialiști</h1>
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-semibold">Terapie, reconectare și sprijin</span><br/>
            Oferim un spațiu sigur pentru suflet și corp – ședințe de terapie holistică, reconectare cu natura, discuții deschise și grupuri de sprijin. Pentru cei care vor mai mult decât un simplu „e ok".
          </p>
          <p className="text-gray-700 mb-4">
            <span className="font-semibold text-blue-700">Terapie personalizată cu AI</span><br/>
            <span className="font-medium">Terapie fizică pentru corp</span> – Recomandări pentru relaxare, exerciții, somn, respirație, mișcare și recuperare fizică, adaptate stilului tău de viață și nevoilor tale. AI-ul nostru analizează răspunsurile tale și îți oferă un diagnostic orientativ și un plan de tratament personalizat, iar dacă este nevoie, vei fi direcționat către un specialist uman.
          </p>
          <p className="text-gray-700 mb-4">
            Prin abordarea noastră integrativă, te ajutăm să găsești echilibrul și să descoperi resursele interioare necesare pentru a face față provocărilor vieții moderne. Toate recomandările sunt confidențiale, rapide și pot fi ajustate împreună cu un expert.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Programează o sesiune sau încearcă chat-ul AI</h2>
          <p className="text-gray-700 mb-6">Formularul de programare și chat-ul AI personalizat vor fi disponibile aici. Vei putea primi recomandări instant sau poți discuta cu un specialist uman, în funcție de preferințele și nevoile tale.</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition" disabled>
            În curând: Diagnostic & tratament AI
          </button>
        </div>
        <div className="text-center">
          <Link to="/terapie" className="text-blue-700 hover:underline">Înapoi la alegere terapie</Link>
        </div>
      </div>
    </div>
  );
};

export default Fizica;
