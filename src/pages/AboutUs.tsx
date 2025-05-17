import React from "react";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Despre Mine</h1>
          
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
              <img 
                src="/images/Fără titlu.png" 
                alt="Dumitru, administrator Lupul și Corbul" 
                className="w-48 h-48 object-cover rounded-full shadow-md mb-6 md:mb-0 md:mr-6"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Salut, sunt Dumitru</h2>
                <p className="text-gray-600 mb-4">
                  Mă numesc Dumitru și am 28 de ani. Nu vin dintr-un succes sigur sau dintr-un plan perfect. Am fost antrenor de fitness, farmacist, antreprenor ratat și om cu datorii, dar și om care a continuat să creadă că poate construi ceva real. Am pornit „Lupul și Corbul" nu ca un business clasic, ci ca un răspuns sincer la întrebarea: Ce pot face eu pentru locul ăsta în care mă aflu?
                </p>
                <p className="text-gray-600 italic font-medium">
                  "Ce n-a mers m-a adus aici. Aici e începutul."
                </p>
              </div>
            </div>
          
            <p className="text-gray-600">
              Nu sunt un expert, dar sunt prezent. Nu sunt un model, dar sunt implicat. Și dacă ai ajuns aici, poate că avem ceva în comun: ne dorim mai mult decât să supraviețuim – vrem să trăim cu rost.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Despre „Lupul și Corbul"</h2>
            <p className="text-gray-600 mb-4">
              „Lupul și Corbul" nu e doar o rulotă – e o platformă care leagă oamenii și serviciile lor într-o experiență locală de gust, cultură și regenerare. Aici servesc gogoși calde, cafea de specialitate, shake-uri, limonadă și alte gustări simple, dar făcute cu grijă. Fiecare produs are o poveste, un nume, un motiv să existe – nu doar pentru a umple stomacul, ci și pentru a aduce un zâmbet, o pauză, o clipă de tihnă.
            </p>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Viziunea Noastră</h2>
            <p className="text-gray-600 mb-4">
              Dar mergem dincolo de gusturi. Vreau ca „Lupul și Corbul" să devină un spațiu viu:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-xl mr-2">🎪</span>
                <span>Pentru evenimente locale care să aducă oamenii împreună</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-xl mr-2">🥣</span>
                <span>Pentru produse tradiționale și artizanale</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-xl mr-2">🌱</span>
                <span>Pentru terapie, ateliere și reconectare cu natura</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-xl mr-2">🤲</span>
                <span>Pentru implicare socială, printr-un ONG dedicat Văii Jiului</span>
              </div>
            </div>
            <p className="text-gray-600">
              Nu sunt un model, dar sunt un om sincer, care vrea să construiască ceva durabil, pas cu pas. Dacă ai ajuns aici, probabil și tu simți că se poate mai mult. Hai să pornim de la ce avem și să facem împreună ceva care contează.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
