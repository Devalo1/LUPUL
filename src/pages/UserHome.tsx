import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaEnvelope, FaEnvelopeOpen, FaArrowLeft, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { collection, getDocs, addDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const fetchArticles = async (retryCount = 0) => {
      try {
        setLoadingArticles(true);
        setError(null);
        
        console.log(`Attempting to fetch articles (attempt ${retryCount + 1})`);
        
        if (!db) {
          console.error("Firestore instance is undefined");
          throw new Error("Database connection error");
        }
        
        const articlesRef = collection(db, 'articles');
        console.log('Articles collection reference created');
        
        let snapshot;
        try {
          snapshot = await getDocs(articlesRef);
          console.log(`Query returned ${snapshot.docs.length} documents`);
        } catch (fetchError) {
          console.error("Error fetching documents:", fetchError);
          throw fetchError;
        }
        
        if (!snapshot.empty) {
          console.log(`Found ${snapshot.docs.length} articles in Firestore`);
          const fetchedArticles: Article[] = [];

          snapshot.docs.forEach(doc => {
            try {
              const data = doc.data();
              
              fetchedArticles.push({
                id: doc.id,
                title: data.title || 'Titlu lipsă',
                date: data.date || new Date().toLocaleDateString('ro-RO'),
                author: data.author || 'Autor necunoscut',
                preview: data.preview || (data.content ? data.content.substring(0, 100) + '...' : 'Previzualizare indisponibilă'),
                content: data.content || 'Conținut indisponibil',
              });
            } catch (docError) {
              console.error(`Error processing document ${doc.id}:`, docError);
            }
          });

          if (fetchedArticles.length > 0) {
            const personalizedArticles = fetchedArticles.map(article => {
              let personalizedContent = article.content;

              if (currentUser?.displayName) {
                personalizedContent = personalizedContent.replace(
                  '${currentUser?.displayName || "prieten"}',
                  currentUser.displayName
                );
              } else {
                personalizedContent = personalizedContent.replace(
                  '${currentUser?.displayName || "prieten"}',
                  'prieten'
                );
              }

              return {
                ...article,
                content: personalizedContent
              };
            });

            console.log(`Setting ${personalizedArticles.length} personalized articles`);
            setArticles(personalizedArticles);
            setError(null);
            return;
          }
        }
        
        if (retryCount === 0) {
          console.log("No articles found. Attempting to create a default article");
          try {
            const content = `Dragă prieten,

Te întâmpinăm cu bucurie în comunitatea noastră! Suntem încântați că ai decis să ni te alături în această călătorie de dezvoltare personală și descoperire.

În următoarele săptămâni, vei primi mai multe resurse și scrisori personalizate care te vor ghida în acest proces de transformare.

Cu apreciere,
Echipa Lupul Corbul`;

            const sampleArticle = {
              title: 'Bine ai venit în comunitatea noastră!',
              date: new Date().toLocaleDateString('ro-RO'),
              author: 'Echipa Lupul Corbul',
              preview: 'Un mesaj special de bun venit pentru tine...',
              content,
              createdAt: new Date().toISOString()
            };
            
            const docRef = await addDoc(collection(db, 'articles'), sampleArticle);
            console.log("Sample article created with ID:", docRef.id);
            
            setArticles([{
              id: docRef.id,
              ...sampleArticle
            }]);
            setError(null);
            return;
          } catch (createError) {
            console.error("Failed to create sample article:", createError);
          }
        }
        
        console.log("Using default articles");
        setArticles([
          {
            id: 'default-1',
            title: 'Bine ai venit în comunitatea noastră!',
            date: new Date().toLocaleDateString('ro-RO'),
            author: 'Echipa Lupul Corbul',
            preview: 'Un mesaj special de bun venit pentru tine...',
            content: `Dragă prieten,

Te întâmpinăm cu bucurie în comunitatea noastră! Suntem încântați că ai decis să ni te alături în această călătorie de dezvoltare personală și descoperire.

În următoarele săptămâni, vei primi mai multe resurse și scrisori personalizate care te vor ghida în acest proces de transformare.

Cu apreciere,
Echipa Lupul Corbul`,
          },
        ]);
        setError(null);
        
      } catch (error) {
        console.error("Error in fetchArticles:", error);
        
        if (retryCount < 1) {
          console.log(`Will retry article fetch in 2 seconds...`);
          setTimeout(() => fetchArticles(retryCount + 1), 2000);
          return;
        }
        
        console.log("Using fallback local article after error");
        setArticles([
          {
            id: 'fallback-1',
            title: 'Bine ai venit în comunitatea noastră!',
            date: new Date().toLocaleDateString('ro-RO'),
            author: 'Echipa Lupul Corbul',
            preview: 'Un mesaj special de bun venit pentru tine...',
            content: `Dragă prieten,

Te întâmpinăm cu bucurie în comunitatea noastră! Suntem încântați că ai decis să ni te alături.

Echipa Lupul Corbul`,
          },
        ]);
        
        setError("Nu s-au putut încărca articolele. Vă rugăm încercați din nou mai târziu.");
      } finally {
        setLoadingArticles(false);
      }
    };

    if (!loading && currentUser) {
      fetchArticles();
    }
  }, [currentUser, loading]);

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