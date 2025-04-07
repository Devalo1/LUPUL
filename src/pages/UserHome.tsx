import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaEnvelope, FaEnvelopeOpen, FaArrowLeft, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Article {
  id: string;
  title: string;
  date: string;
  author: string;
  preview: string;
  content: string;
}

const UserHome: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Încărcăm articolele din Firebase
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        setError(null);

        const articlesRef = collection(db, 'articles');
        const snapshot = await getDocs(articlesRef);

        if (snapshot.empty) {
          const defaultArticles = [
            {
              id: '1',
              title: 'Importanța sănătății mentale în era digitală',
              date: '10 Mai 2023',
              author: 'Dr. Ana Popescu',
              preview: 'Descoperă cum să-ți menții echilibrul mental în mijlocul agitației cotidiene...',
              content: `Dragă ${currentUser?.displayName || 'prieten'},

Îți scriu această scrisoare cu speranța că te vei opri pentru un moment din agitația zilnică pentru a reflecta asupra sănătății tale mentale.

În lumea noastră digitală, suntem constant bombardați cu informații, notificări și stimuli care ne solicită atenția. Acest flux neîntrerupt poate duce la anxietate, burnout și sentimente de izolare, chiar dacă suntem mai conectați ca niciodată din punct de vedere tehnologic.

Aș dori să îți împărtășesc câteva practici care m-au ajutat pe mine și pe pacienții mei:

1. **Stabilește limite digitale** - Desemnează perioade din zi când nu folosești dispozitivele electronice
2. **Practică mindfulness** - Chiar și 5 minute de meditație zilnică pot face diferența
3. **Mișcarea fizică** - O plimbare de 30 de minute poate îmbunătăți considerabil starea de spirit
4. **Conectează-te autentic** - Nimic nu înlocuiește conversațiile sincere față în față

Sănătatea mentală nu este un lux, ci o necesitate, la fel de importantă ca sănătatea fizică. Te încurajez să o tratezi cu aceeași prioritate.

Cu gânduri bune,
Dr. Ana Popescu
Specialist în psihologie clinică`,
            },
            {
              id: '2',
              title: 'Cum să cultivi motivația intrinsecă pentru obiective de lungă durată',
              date: '23 Iunie 2023',
              author: 'Prof. Mihai Ionescu',
              preview: 'Află strategii dovedite științific pentru a-ți menține motivația în proiectele importante...',
              content: `Dragă ${currentUser?.displayName || 'cititorule'},

Îți scriu astăzi despre o provocare cu care mulți dintre noi ne confruntăm: cum să rămânem motivați când drumul este lung și rezultatele par îndepărtate.

În cei 20 de ani de cercetare în psihologia motivației, am observat că oamenii care reușesc să-și mențină angajamentul față de obiectivele de lungă durată nu se bazează doar pe motivația extrinsecă (recompense, recunoaștere), ci dezvoltă o motivație intrinsecă puternică.

Iată câteva strategii care te pot ajuta:

1. **Conectează obiectivele la valorile tale profunde** - Când obiectivul este aliniat cu ceea ce contează cu adevărat pentru tine, motivația devine naturală
   
2. **Bucură-te de proces** - Găsește aspecte ale drumului care îți aduc satisfacție, nu te concentra doar pe destinație

3. **Identifică progresul** - Ține un jurnal al micilor victorii și al lecțiilor învățate

4. **Creează un sistem de responsabilizare** - Un mentor sau un grup de suport poate face diferența în momentele dificile

5. **Practică auto-compasiunea** - În zilele când motivația scade, tratează-te cu înțelegere, nu cu critică

Motivația fluctuează în mod natural - aceasta este experiența umană normală. Secretul constă în a crea sisteme și practici care te ajută să continui chiar și când entuziasmul inițial s-a diminuat.

Cu încredere în călătoria ta,
Prof. Mihai Ionescu
Facultatea de Psihologie`,
            },
          ];
          setArticles(defaultArticles);
        } else {
          const fetchedArticles: Article[] = [];

          snapshot.docs.forEach(doc => {
            const data = doc.data();

            if (!data.title || !data.content) {
              return;
            }

            fetchedArticles.push({
              id: doc.id,
              title: data.title || 'Titlu lipsă',
              date: data.date || new Date().toLocaleDateString('ro-RO'),
              author: data.author || 'Autor necunoscut',
              preview: data.preview || 'Previzualizare indisponibilă',
              content: data.content || 'Conținut indisponibil',
            });
          });

          const personalizedArticles = fetchedArticles.map(article => {
            let personalizedContent = article.content;

            if (personalizedContent.includes('${currentUser?.displayName')) {
              personalizedContent = personalizedContent.replace(
                '${currentUser?.displayName || \'prieten\'}', 
                currentUser?.displayName || 'prieten'
              );
            }

            return {
              ...article,
              content: personalizedContent
            };
          });

          setArticles(personalizedArticles);
        }
      } catch (error) {
        setError("Nu s-au putut încărca articolele. Vă rugăm încercați din nou mai târziu.");
        setArticles([
          {
            id: '1',
            title: 'Importanța sănătății mentale în era digitală',
            date: '10 Mai 2023',
            author: 'Dr. Ana Popescu',
            preview: 'Descoperă cum să-ți menții echilibrul mental în mijlocul agitației cotidiene...',
            content: `Dragă prieten,

Îți scriu această scrisoare cu speranța că te vei opri pentru un moment din agitația zilnică pentru a reflecta asupra sănătății tale mentale.

În lumea noastră digitală, suntem constant bombardați cu informații, notificări și stimuli care ne solicită atenția. Acest flux neîntrerupt poate duce la anxietate, burnout și sentimente de izolare, chiar dacă suntem mai conectați ca niciodată din punct de vedere tehnologic.

Aș dori să îți împărtășesc câteva practici care m-au ajutat pe mine și pe pacienții mei:

1. **Stabilește limite digitale** - Desemnează perioade din zi când nu folosești dispozitivele electronice
2. **Practică mindfulness** - Chiar și 5 minute de meditație zilnică pot face diferența
3. **Mișcarea fizică** - O plimbare de 30 de minute poate îmbunătăți considerabil starea de spirit
4. **Conectează-te autentic** - Nimic nu înlocuiește conversațiile sincere față în față

Sănătatea mentală nu este un lux, ci o necesitate, la fel de importantă ca sănătatea fizică. Te încurajez să o tratezi cu aceeași prioritate.

Cu gânduri bune,
Dr. Ana Popescu
Specialist în psihologie clinică`,
          },
          {
            id: '2',
            title: 'Cum să cultivi motivația intrinsecă pentru obiective de lungă durată',
            date: '23 Iunie 2023',
            author: 'Prof. Mihai Ionescu',
            preview: 'Află strategii dovedite științific pentru a-ți menține motivația în proiectele importante...',
            content: `Dragă cititorule,

Îți scriu astăzi despre o provocare cu care mulți dintre noi ne confruntăm: cum să rămânem motivați când drumul este lung și rezultatele par îndepărtate.

În cei 20 de ani de cercetare în psihologia motivației, am observat că oamenii care reușesc să-și mențină angajamentul față de obiectivele de lungă durată nu se bazează doar pe motivația extrinsecă (recompense, recunoaștere), ci dezvoltă o motivație intrinsecă puternică.

Iată câteva strategii care te pot ajuta:

1. **Conectează obiectivele la valorile tale profunde** - Când obiectivul este aliniat cu ceea ce contează cu adevărat pentru tine, motivația devine naturală
   
2. **Bucură-te de proces** - Găsește aspecte ale drumului care îți aduc satisfacție, nu te concentra doar pe destinație

3. **Identifică progresul** - Ține un jurnal al micilor victorii și al lecțiilor învățate

4. **Creează un sistem de responsabilizare** - Un mentor sau un grup de suport poate face diferența în momentele dificile

5. **Practică auto-compasiunea** - În zilele când motivația scade, tratează-te cu înțelegere, nu cu critică

Motivația fluctuează în mod natural - aceasta este experiența umană normală. Secretul constă în a crea sisteme și practici care te ajută să continui chiar și când entuziasmul inițial s-a diminuat.

Cu încredere în călătoria ta,
Prof. Mihai Ionescu
Facultatea de Psihologie`,
          },
        ]);
      } finally {
        setLoadingArticles(false);
      }
    };

    if (!loading && currentUser) {
      fetchArticles();
    }
  }, [currentUser, loading]);

  // Redirecționează utilizatorii neautentificați
  if (!loading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading || loadingArticles) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-yellow-500">
          <h2 className="text-2xl font-semibold text-gray-800">
            Bun venit, {currentUser?.displayName || currentUser?.email || 'Utilizator'}!
          </h2>
          <p className="text-gray-600">
            Membru din {new Date(currentUser?.metadata?.creationTime || Date.now()).toLocaleDateString('ro-RO')}
          </p>
        </div>

        {/* Afișăm eroarea dacă există */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
            <button 
              className="text-red-600 underline mt-2"
              onClick={() => window.location.reload()}
            >
              Reîncarcă pagina
            </button>
          </div>
        )}

        {/* Secțiunea scrisorilor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Scrisori pentru sănătate și inspirație</h3>
          
          {articles.length === 0 && !error ? (
            <div className="text-center py-8 text-gray-500">
              Nu există scrisori disponibile momentan. Reveniți mai târziu.
            </div>
          ) : selectedArticle ? (
            <div className="letter-open">
              <button
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
                onClick={() => setSelectedArticle(null)}
              >
                <FaArrowLeft className="mr-2" /> Înapoi la toate scrisorile
              </button>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 my-4 shadow-inner max-w-3xl mx-auto">
                {articles.find(a => a.id === selectedArticle) && (
                  <>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">
                      {articles.find(a => a.id === selectedArticle)?.title}
                    </h4>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-6 border-b border-yellow-200 pb-4">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" /> 
                        {articles.find(a => a.id === selectedArticle)?.date}
                      </div>
                      <div className="flex items-center">
                        <FaUser className="mr-1" /> 
                        {articles.find(a => a.id === selectedArticle)?.author}
                      </div>
                    </div>
                    
                    <div className="text-gray-700 leading-relaxed letter-content whitespace-pre-line">
                      {articles.find(a => a.id === selectedArticle)?.content}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <div 
                  key={article.id} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                >
                  <div className="p-5 cursor-pointer" onClick={() => setSelectedArticle(article.id)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-yellow-600">
                        <FaEnvelope size={24} />
                      </div>
                      <div className="text-xs text-gray-500">{article.date}</div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{article.preview}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">De la: {article.author}</span>
                      <button
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticle(article.id);
                        }}
                      >
                        Citește <FaEnvelopeOpen className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHome;