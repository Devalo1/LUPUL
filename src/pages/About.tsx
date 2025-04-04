import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Despre Noi</h1>
          
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lupul și Corbul</h2>
            <p className="text-gray-600 mb-4">
              Suntem o echipă dedicată bunăstării și dezvoltării personale, oferind servicii terapeutice 
              și produse pentru sănătatea mintală și emoțională.
            </p>
            <p className="text-gray-600 mb-4">
              Filozofia noastră se bazează pe trei principii fundamentale: <span className="font-semibold">Empatie</span>, 
              <span className="font-semibold"> Conexiune</span> și <span className="font-semibold">Echilibru</span>.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Misiunea Noastră</h2>
            <p className="text-gray-600 mb-4">
              Ne-am propus să oferim sprijin și resurse pentru cei care caută să-și îmbunătățească sănătatea 
              mentală și starea de bine. Prin serviciile noastre terapeutice, produsele atent selecționate 
              și activitățile comunitare, dorim să creăm un spațiu sigur pentru vindecare și creștere personală.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Echipa Noastră</h2>
            <p className="text-gray-600 mb-4">
              Echipa noastră este formată din profesioniști dedicați în domeniul sănătății mintale, 
              cu experiență în diverse abordări terapeutice și o pasiune pentru bunăstarea clienților noștri.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Aici se pot adăuga carduri pentru membrii echipei */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
