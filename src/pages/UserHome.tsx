import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaEnvelopeOpen, FaArrowLeft, FaCalendarAlt, FaUser } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { ErrorMessage } from "../components/common";

interface Article {
  id: string;
  title: string;
  date: string;
  author: string;
  preview: string;
  content: string;
}

// Default fallback article to use when Firestore access fails
const DEFAULT_ARTICLES: Article[] = [
  {
    id: "default-1",
    title: "Bine ai venit în comunitatea noastră!",
    date: new Date().toLocaleDateString("ro-RO"),
    author: "Echipa Lupul Corbul",
    preview: "Un mesaj special de bun venit pentru tine...",
    content: `Dragă prieten,

Te întâmpinăm cu bucurie în comunitatea noastră! Suntem încântați că ai decis să ni te alături în această călătorie de dezvoltare personală și descoperire.

În următoarele săptămâni, vei primi mai multe resurse și scrisori personalizate care te vor ghida în acest proces de transformare.

Cu apreciere,
Echipa Lupul Corbul`,
  },
];

const UserHome: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);
  const userDisplayName = user?.displayName || "prieten";

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && !hasRedirected.current) {
      console.log("User is not authenticated, redirecting to login");
      hasRedirected.current = true;
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Fetch articles when user is authenticated
  useEffect(() => {
    const fetchArticles = async (retryCount = 0) => {
      // Skip if we've already tried or if authentication is still loading
      if (fetchAttempted.current || loading || !isAuthenticated) {
        return;
      }
      
      fetchAttempted.current = true;
      
      try {
        setLoadingArticles(true);
        setError(null);
        
        console.log(`Attempting to fetch articles (attempt ${retryCount + 1})`);
        
        if (!db) {
          console.error("Firestore instance is undefined");
          throw new Error("Database connection error");
        }
        
        // Start with default articles to ensure we always have something to show
        setArticles(DEFAULT_ARTICLES);
        
        // Attempt to fetch from Firestore
        try {
          const articlesRef = collection(db, "articles");
          console.log("Articles collection reference created");
          
          const snapshot = await getDocs(articlesRef);
          console.log(`Query returned ${snapshot.docs.length} documents`);
          
          if (!snapshot.empty) {
            console.log(`Found ${snapshot.docs.length} articles in Firestore`);
            const fetchedArticles: Article[] = [];

            snapshot.docs.forEach(doc => {
              try {
                const data = doc.data();
                
                fetchedArticles.push({
                  id: doc.id,
                  title: data.title || "Titlu lipsă",
                  date: data.date || new Date().toLocaleDateString("ro-RO"),
                  author: data.author || "Autor necunoscut",
                  preview: data.preview || (data.content ? data.content.substring(0, 100) + "..." : "Previzualizare indisponibilă"),
                  content: data.content || "Conținut indisponibil",
                });
              } catch (docError) {
                console.error(`Error processing document ${doc.id}:`, docError);
              }
            });

            if (fetchedArticles.length > 0) {
              // Personalize articles if we have user data
              const personalizedArticles = fetchedArticles.map(article => {
                let personalizedContent = article.content;

                personalizedContent = personalizedContent.replace(
                  "${user?.displayName || \"prieten\"}",
                  userDisplayName
                );

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
        } catch (fetchError) {
          console.error("Error fetching articles from Firestore:", fetchError);
          // We'll continue with default articles and only retry once
          if (retryCount < 1) {
            console.log(`Will retry article fetch in 3 seconds...`);
            fetchAttempted.current = false; // Reset so we can retry
            setTimeout(() => fetchArticles(retryCount + 1), 3000);
          }
        }
        
        // If we're here, we're using the default articles that were already set
        console.log("Using default articles");
        
      } catch (error) {
        console.error("Error in fetchArticles:", error);
        setError("Nu s-au putut încărca articolele. Vă rugăm încercați din nou mai târziu.");
      } finally {
        setLoadingArticles(false);
      }
    };

    // Only fetch articles when user is fully authenticated
    if (isAuthenticated && user && !loading) {
      fetchArticles();
    }
  }, [user, loading, isAuthenticated, userDisplayName]);

  // Rendering states
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă autentificarea...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Se redirecționează către login...</div>;
  }

  if (loadingArticles && articles.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă articolele...</div>;
  }

  // Main content rendering - article list or selected article
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-yellow-500">
          <h2 className="text-2xl font-semibold text-gray-800">
            Bun venit, {user?.displayName || user?.email || "Utilizator"}!
          </h2>
          <p className="text-gray-600">
            Membru din {user && user.createdAt 
              ? new Date(user.createdAt).toLocaleDateString("ro-RO") 
              : new Date().toLocaleDateString("ro-RO")}
          </p>
        </div>

        {error && (
          <ErrorMessage message={error} onRetry={() => {
            fetchAttempted.current = false;
            window.location.reload();
          }} />
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