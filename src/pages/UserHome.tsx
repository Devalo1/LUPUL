import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaEnvelopeOpen, FaArrowLeft, FaCalendarAlt, FaUser, FaStar, FaRegStar, FaImage, FaThumbsUp, FaSearch, FaTags, FaBookmark, FaEye, FaShare } from "react-icons/fa";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, increment, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { ErrorMessage } from "../components/common";

// Enhanced Article interface to match AdminArticles
interface Article {
  id: string;
  title: string;
  date: string;
  author: string;
  preview: string;
  content: string;
  imageUrl?: string;
  published?: boolean;
  readCount?: number;
  feedback?: ArticleFeedback[];
  tags?: string[];
  readBy?: string[]; // Array of user IDs who have read the article
  coverStyle?: string; // New property for article display style
  galleryImages?: string[]; // New property for gallery images
}

// Interface for article feedback
interface ArticleFeedback {
  userId: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: Timestamp;
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

// Display an article with the proper style based on its coverStyle property
const ArticleDisplay = ({ article, onClose }: { 
  article: Article, 
  onClose: () => void
}) => {
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [readPosition, setReadPosition] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Check if the article has multiple gallery images
  const hasGallery = article.galleryImages && article.galleryImages.length > 0;
  
  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (!user) return;
    
    setSubmittingFeedback(true);
    
    try {
      const articleRef = doc(db, "articles", article.id);
      
      const newFeedback: ArticleFeedback = {
        userId: user.uid,
        userName: user.displayName || user.email || "Utilizator anonim",
        comment: feedbackComment,
        rating: feedbackRating,
        createdAt: Timestamp.now()
      };
      
      await updateDoc(articleRef, {
        feedback: arrayUnion(newFeedback)
      });
      
      setFeedbackSuccess(true);
      setFeedbackComment("");
      
      // Reset after 5 seconds to allow submitting another feedback
      setTimeout(() => {
        setFeedbackSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Track scroll position for reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = window.scrollY - element.offsetTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = window.innerHeight;
        
        // Calculate how far the user has scrolled through the content
        const scrollPosition = Math.min(
          Math.max(0, scrollTop / (scrollHeight - clientHeight) * 100),
          100
        );
        
        setReadPosition(scrollPosition);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Format article content with special formatting
  const formatContent = (content: string) => {
    // Split content by paragraphs
    const paragraphs = content.split("\n\n");
    
    return paragraphs.map((paragraph, index) => {
      // Check if this is a pullquote (starts with "> ")
      if (paragraph.startsWith("> ")) {
        return (
          <blockquote 
            key={index} 
            className="my-6 p-4 border-l-4 border-yellow-400 bg-yellow-50 text-xl italic font-serif animate-fadeIn"
          >
            {paragraph.substring(2)}
          </blockquote>
        );
      }
      
      // Check if this is a header (starts with "# ")
      if (paragraph.startsWith("# ")) {
        return (
          <h3 key={index} className="text-2xl font-bold my-4 text-gray-800 animate-slideInUp">
            {paragraph.substring(2)}
          </h3>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="my-4 text-gray-700 leading-relaxed animate-fadeIn">
          {paragraph}
        </p>
      );
    });
  };

  // Open lightbox with specific image
  const openLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = "hidden";
  };

  // Close lightbox
  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = "auto";
  };

  // Navigate to next/previous image in lightbox
  const navigateLightbox = (direction: "next" | "prev") => {
    if (!article.galleryImages) return;
    
    const totalImages = article.galleryImages.length;
    if (direction === "next") {
      setLightboxImageIndex((prev) => (prev + 1) % totalImages);
    } else {
      setLightboxImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  // Toggle bookmark status
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would actually save the bookmark to user's profile
  };

  // Share article
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.preview,
        url: window.location.href,
      })
      .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("Link copiat în clipboard!"))
        .catch((err) => console.error("Nu s-a putut copia link-ul:", err));
    }
  };
  
  // Render article based on its coverStyle
  switch (article.coverStyle) {
    case "overlay":
      return (
        <div className="letter-open animate-fadeIn">
          {/* Noul buton elegant de ieșire din articol */}
          <div className="fixed top-20 left-4 z-50">
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg hover:bg-amber-50 transition-all duration-300 hover:translate-x-1 group"
              title="Înapoi la toate articolele"
            >
              <FaArrowLeft className="text-amber-700 group-hover:scale-125 transition-transform" />
              <span className="text-amber-900 font-medium">Înapoi</span>
            </button>
          </div>
          
          <div className="fixed bottom-4 right-4 z-50 flex gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-3 rounded-full shadow-lg transition-colors ${
                isBookmarked ? "bg-yellow-400 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              title={isBookmarked ? "Elimină marcajul" : "Marchează pentru citire ulterioară"}
            >
              <FaBookmark />
            </button>
            <button
              onClick={shareArticle}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Distribuie"
            >
              <FaShare className="text-gray-700" />
            </button>
          </div>
          
          {/* Reading progress indicator */}
          <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${readPosition}%` }}
            ></div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg overflow-hidden my-4 shadow-xl max-w-4xl mx-auto transform transition-all duration-500 animate-slideInUp">
            {article.imageUrl ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent">
                  <div className="p-8">
                    <h4 className="text-3xl font-bold text-white mb-2 animate-slideInDown">
                      {article.title}
                    </h4>
                    
                    <div className="flex justify-between text-sm text-white/80 mb-4">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" /> 
                        {article.date}
                      </div>
                      <div className="flex items-center">
                        <FaUser className="mr-1" /> 
                        {article.author}
                      </div>
                    </div>
                  </div>
                </div>
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full max-h-96 object-cover animate-kenBurns" 
                />
              </div>
            ) : (
              <div className="p-8 border-b border-yellow-200">
                <h4 className="text-3xl font-bold text-gray-800 mb-2 animate-slideInDown">
                  {article.title}
                </h4>
                
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" /> 
                    {article.date}
                  </div>
                  <div className="flex items-center">
                    <FaUser className="mr-1" /> 
                    {article.author}
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-8">
              <div 
                ref={contentRef}
                className="letter-content text-lg"
              >
                {formatContent(article.content)}
              </div>
              
              {/* Gallery images if they exist */}
              {hasGallery && (
                <div className="mt-8 pt-6 border-t border-yellow-200 animate-fadeIn">
                  <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <FaImage className="mr-2" /> Galerie de imagini
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {article.galleryImages?.map((img, index) => (
                      <div 
                        key={index} 
                        className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        onClick={() => openLightbox(index)}
                      >
                        <img 
                          src={img} 
                          alt={`${article.title} - Imagine ${index + 1}`}
                          className="w-full h-48 object-cover" 
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags section */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-yellow-200 pt-4 mt-6 mb-6 animate-fadeIn">
                  <FaTags className="mr-2 text-gray-600 self-center" />
                  {article.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Engagement stats */}
              <div className="flex items-center justify-start gap-4 text-sm text-gray-600 mt-4 mb-6 animate-fadeIn">
                <div className="flex items-center">
                  <FaEye className="mr-1" /> 
                  {article.readCount || 0} vizualizări
                </div>
                <div className="flex items-center">
                  <FaThumbsUp className="mr-1" /> 
                  {article.feedback?.length || 0} feedback-uri
                </div>
              </div>
              
              {/* Feedback form */}
              <div className="border-t border-gray-200 pt-6 mt-6 animate-fadeIn">
                <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaThumbsUp className="mr-2" /> Lăsați-ne părerea dumneavoastră
                </h5>
                
                {feedbackSuccess ? (
                  <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 flex items-center animate-pulse">
                    <FaThumbsUp className="mr-2" />
                    Mulțumim pentru feedback! Opinia dumneavoastră este importantă pentru noi.
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evaluare
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setFeedbackRating(rating)}
                            className="text-xl text-yellow-500 transition-transform hover:scale-125 focus:outline-none"
                          >
                            {rating <= feedbackRating ? <FaStar /> : <FaRegStar />}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comentariu
                      </label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Împărtășiți-ne gândurile dumneavoastră despre acest articol..."
                      ></textarea>
                    </div>
                    
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback || !feedbackComment.trim()}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all hover:shadow-lg ${
                        (submittingFeedback || !feedbackComment.trim()) ? "opacity-50 cursor-not-allowed" : "transform hover:-translate-y-1"
                      }`}
                    >
                      {submittingFeedback ? "Se trimite..." : "Trimite feedback"}
                    </button>
                  </>
                )}
              </div>
              
              {/* Lightbox for gallery images */}
              {showLightbox && article.galleryImages && (
                <div 
                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                  onClick={closeLightbox}
                >
                  <button 
                    className="absolute top-4 right-4 text-white text-2xl"
                    onClick={closeLightbox}
                  >
                    ✕
                  </button>
                  
                  <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-4 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox("prev");
                    }}
                  >
                    ←
                  </button>
                  
                  <img 
                    src={article.galleryImages[lightboxImageIndex]} 
                    alt={`${article.title} - Imagine ${lightboxImageIndex + 1}`}
                    className="max-h-[80vh] max-w-[90vw] object-contain animate-fadeIn" 
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-4 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox("next");
                    }}
                  >
                    →
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                    {lightboxImageIndex + 1} / {article.galleryImages.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
      
    case "side":
    default:
      return (
        <div className="letter-open animate-fadeIn">
          {/* Noul buton elegant de ieșire din articol */}
          <div className="fixed top-20 left-4 z-50">
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg hover:bg-amber-50 transition-all duration-300 hover:translate-x-1 group"
              title="Înapoi la toate articolele"
            >
              <FaArrowLeft className="text-amber-700 group-hover:scale-125 transition-transform" />
              <span className="text-amber-900 font-medium">Înapoi</span>
            </button>
          </div>
          
          <div className="fixed bottom-4 right-4 z-50 flex gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-3 rounded-full shadow-lg transition-colors ${
                isBookmarked ? "bg-yellow-400 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              title={isBookmarked ? "Elimină marcajul" : "Marchează pentru citire ulterioară"}
            >
              <FaBookmark />
            </button>
            <button
              onClick={shareArticle}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Distribuie"
            >
              <FaShare className="text-gray-700" />
            </button>
          </div>
          
          {/* Reading progress indicator */}
          <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${readPosition}%` }}
            ></div>
          </div>
          
          <div ref={contentRef} className="bg-[#fffdf0] shadow-xl rounded-lg p-8 my-4 max-w-4xl mx-auto border border-amber-100 animate-slideInUp">
            <div className="flex flex-col md:flex-row gap-6">
              {article.imageUrl && (
                <div className="md:w-1/3 animate-fadeIn">
                  <div className="sticky top-24">
                    <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full rounded-lg h-auto object-cover transform hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                    
                    <div className="mt-4 bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <h5 className="font-medium text-gray-800 mb-2">Despre acest articol</h5>
                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center mb-2">
                          <FaCalendarAlt className="mr-1" /> 
                          {article.date}
                        </div>
                        <div className="flex items-center mb-2">
                          <FaUser className="mr-1" /> 
                          {article.author}
                        </div>
                      </div>
                      
                      {/* Engagement stats */}
                      <div className="flex flex-col text-sm text-gray-600 pt-2 border-t border-amber-100">
                        <div className="flex items-center mb-1">
                          <FaEye className="mr-1" /> 
                          {article.readCount || 0} vizualizări
                        </div>
                        <div className="flex items-center">
                          <FaThumbsUp className="mr-1" /> 
                          {article.feedback?.length || 0} feedback-uri
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={article.imageUrl ? "md:w-2/3" : "w-full"}>
                <h4 className="text-3xl font-serif font-bold text-amber-900 mb-4 leading-tight animate-slideInDown">
                  {article.title}
                </h4>
                
                <div className="letter-content text-lg">
                  {formatContent(article.content)}
                </div>
                
                {/* Tags section */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-amber-200 pt-4 mt-6 mb-6 animate-fadeIn">
                    <FaTags className="mr-2 text-amber-700 self-center" />
                    {article.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs hover:bg-amber-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Gallery images if they exist */}
            {hasGallery && (
              <div className="mt-8 pt-6 border-t border-amber-200 animate-fadeIn">
                <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaImage className="mr-2" /> Galerie de imagini
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {article.galleryImages?.map((img, index) => (
                    <div 
                      key={index} 
                      className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer"
                      onClick={() => openLightbox(index)}
                    >
                      <img 
                        src={img} 
                        alt={`${article.title} - Imagine ${index + 1}`}
                        className="w-full h-48 object-cover" 
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Feedback form */}
            <div className="border-t border-amber-200 pt-6 mt-8 animate-fadeIn">
              <h5 className="font-serif font-semibold text-xl text-amber-900 mb-4 flex items-center">
                <FaThumbsUp className="mr-2" /> Lăsați-ne părerea dumneavoastră
              </h5>
              
              {feedbackSuccess ? (
                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 flex items-center animate-pulse">
                  <FaThumbsUp className="mr-2" />
                  Mulțumim pentru feedback! Opinia dumneavoastră este importantă pentru noi.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Evaluare
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackRating(rating)}
                          className="text-xl text-amber-500 transition-transform hover:scale-125 focus:outline-none"
                        >
                          {rating <= feedbackRating ? <FaStar /> : <FaRegStar />}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentariu
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 bg-white"
                      placeholder="Împărtășiți-ne gândurile dumneavoastră despre acest articol..."
                    ></textarea>
                  </div>
                  
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback || !feedbackComment.trim()}
                    className={`px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-all hover:shadow-lg ${
                      (submittingFeedback || !feedbackComment.trim()) ? "opacity-50 cursor-not-allowed" : "transform hover:-translate-y-1"
                    }`}
                  >
                    {submittingFeedback ? "Se trimite..." : "Trimite feedback"}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Lightbox for gallery images */}
          {showLightbox && article.galleryImages && (
            <div 
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <button 
                className="absolute top-4 right-4 text-white text-2xl"
                onClick={closeLightbox}
              >
                ✕
              </button>
              
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-4 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
              >
                ←
              </button>
              
              <img 
                src={article.galleryImages[lightboxImageIndex]} 
                alt={`${article.title} - Imagine ${lightboxImageIndex + 1}`}
                className="max-h-[80vh] max-w-[90vw] object-contain animate-fadeIn" 
                onClick={(e) => e.stopPropagation()}
              />
              
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-4 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
              >
                →
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                {lightboxImageIndex + 1} / {article.galleryImages.length}
              </div>
            </div>
          )}
        </div>
      );
  }
};

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

  // New state for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleArticles, setVisibleArticles] = useState<Article[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

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
                
                // Only include published articles or all articles if we're in development
                if (data.published === true || process.env.NODE_ENV === "development") {
                  fetchedArticles.push({
                    id: doc.id,
                    title: data.title || "Titlu lipsă",
                    date: data.date || new Date().toLocaleDateString("ro-RO"),
                    author: data.author || "Autor necunoscut",
                    preview: data.preview || (data.content ? data.content.substring(0, 100) + "..." : "Previzualizare indisponibilă"),
                    content: data.content || "Conținut indisponibil",
                    imageUrl: data.imageUrl || undefined,
                    readCount: data.readCount || 0,
                    feedback: data.feedback || [],
                    tags: data.tags || [],
                    readBy: data.readBy || [],
                    published: data.published !== false, // default to true if not specified
                    coverStyle: data.coverStyle || "standard", // default to standard
                    galleryImages: data.galleryImages || [] // default to empty array
                  });
                }
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
              
              // Extract all unique tags
              const tags = personalizedArticles.flatMap(article => article.tags || []);
              setAllTags([...new Set(tags)]);
              
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
  
  // Filter articles based on search and selected tag
  useEffect(() => {
    if (articles.length > 0) {
      let filtered = [...articles];
      
      // Apply search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(query) || 
          article.content.toLowerCase().includes(query) || 
          article.preview.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      
      // Apply tag filter
      if (selectedTag) {
        filtered = filtered.filter(article => 
          article.tags && article.tags.includes(selectedTag)
        );
      }
      
      setVisibleArticles(filtered);
    } else {
      setVisibleArticles([]);
    }
  }, [articles, searchQuery, selectedTag]);

  // Track that the user has read an article
  const markArticleAsRead = async (articleId: string) => {
    if (!user) return;

    try {
      const articleRef = doc(db, "articles", articleId);
      const articleDoc = await getDoc(articleRef);
      
      if (articleDoc.exists()) {
        const articleData = articleDoc.data();
        const readBy = articleData.readBy || [];
        
        // Only update if the user hasn't already been marked as having read this article
        if (!readBy.includes(user.uid)) {
          await updateDoc(articleRef, {
            readCount: increment(1),
            readBy: arrayUnion(user.uid)
          });
          
          // Update local state to show user has read this article
          setArticles(articles.map(a => 
            a.id === articleId 
              ? { 
                  ...a, 
                  readCount: (a.readCount || 0) + 1,
                  readBy: [...(a.readBy || []), user.uid]
                } 
              : a
          ));
        }
      }
    } catch (err) {
      console.error("Error marking article as read:", err);
      // Non-critical error, don't show to user
    }
  };

  // Handle opening a specific article
  const handleOpenArticle = async (articleId: string) => {
    setSelectedArticle(articleId);
    markArticleAsRead(articleId);
  };
  
  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

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

  // Helper function to check if user has read an article
  const hasUserReadArticle = (articleId: string): boolean => {
    if (!user) return false;
    
    const article = articles.find(a => a.id === articleId);
    return article?.readBy?.includes(user.uid) || false;
  };

  // Main content rendering - article list or selected article
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Custom decorative elements */}
        <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10 opacity-75">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-700/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/2 h-36 bg-contain bg-no-repeat bg-right opacity-10" 
               style={{ backgroundImage: "url(\"/images/romanian-pattern.png\")" }}></div>
          <div className="absolute top-0 left-0 w-1/2 h-36 bg-contain bg-no-repeat bg-left opacity-10" 
               style={{ backgroundImage: "url(\"/images/romanian-pattern.png\")" }}></div>
        </div>
        
        {/* Welcome card with refined design */}
        <div className="mb-10 relative overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-2xl shadow-xl p-8 relative">
            <div className="absolute top-0 right-0 w-full h-full bg-contain bg-no-repeat bg-right opacity-10" 
                 style={{ backgroundImage: "url(\"/images/romanian-motif.svg\")" }}>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">
                Bun venit, {user?.displayName || user?.email || "Utilizator"}!
              </h2>
              
              <p className="text-amber-100 mb-4">
                Descoperă ultimele noastre articole și resurse personalizate care te vor însoți în călătoria ta.
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-amber-900/20 text-amber-100 rounded-full px-4 py-1 flex items-center text-sm">
                  <span className="mr-2">💌</span> 
                  {articles.length} articole disponibile
                </div>
                
                <div className="bg-amber-900/20 text-amber-100 rounded-full px-4 py-1 flex items-center text-sm">
                  <span className="mr-2">📅</span>
                  Membru din {user && user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString("ro-RO") 
                    : new Date().toLocaleDateString("ro-RO")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} onRetry={() => {
            fetchAttempted.current = false;
            window.location.reload();
          }} />
        )}

        {!selectedArticle && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              {/* Search bar */}
              <div className="w-full md:w-1/2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Caută în articole..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-md border border-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                </div>
              </div>
              
              {/* Tags filter */}
              {allTags.length > 0 && (
                <div className="w-full md:w-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center font-medium text-amber-800">
                      <FaTags className="mr-1" /> Filtrează:
                    </span>
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagSelect(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTag === tag
                            ? "bg-amber-600 text-white shadow-md"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {selectedTag && (
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="px-2 py-1 text-xs text-amber-800 hover:text-amber-600"
                      >
                        Resetează filtrul
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Articles display */}
            {visibleArticles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="mb-4 text-amber-500">
                  <FaSearch size={40} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Niciun articol găsit</h3>
                <p className="text-gray-600">
                  Nu am găsit articole care să corespundă criteriilor tale de căutare. Încearcă să folosești alte cuvinte cheie.
                </p>
                {searchQuery || selectedTag ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTag(null);
                    }}
                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Resetează filtrele
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleArticles.map(article => (
                  <div 
                    key={article.id} 
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 group"
                  >
                    <div 
                      className="cursor-pointer h-full flex flex-col" 
                      onClick={() => handleOpenArticle(article.id)}
                    >
                      {/* Image with gradient overlay */}
                      {article.imageUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                          <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                            <div className={`text-white flex items-center justify-center rounded-full w-8 h-8 ${
                              hasUserReadArticle(article.id) ? "bg-amber-600" : "bg-amber-800"
                            }`}>
                              {hasUserReadArticle(article.id) ? 
                                <FaEnvelopeOpen size={15} /> : 
                                <FaEnvelope size={15} />
                              }
                            </div>
                            {article.readCount && article.readCount > 0 && (
                              <div className="bg-black/30 text-white text-xs rounded-full px-2 py-1 flex items-center">
                                <FaEye className="mr-1" /> {article.readCount}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-24 bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center">
                          <div className={`text-amber-800 flex items-center justify-center rounded-full w-12 h-12 bg-white/80 ${
                            hasUserReadArticle(article.id) ? "border-2 border-amber-500" : ""
                          }`}>
                            {hasUserReadArticle(article.id) ? 
                              <FaEnvelopeOpen size={24} /> : 
                              <FaEnvelope size={24} />
                            }
                          </div>
                        </div>
                      )}
                      
                      <div className="p-5 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-1 rounded-md">
                            {article.date}
                          </div>
                          {hasUserReadArticle(article.id) && (
                            <span className="text-xs text-amber-600 flex items-center">
                              <FaBookmark className="mr-1" /> Citit
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-700 transition-colors">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 flex-grow">
                          {article.preview}
                        </p>
                        
                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {article.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{article.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500 flex items-center">
                            <FaUser className="mr-1" /> {article.author}
                          </span>
                          <button
                            className="flex items-center text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenArticle(article.id);
                            }}
                          >
                            Citește articolul
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Display selected article */}
        {selectedArticle && (
          <ArticleDisplay 
            article={articles.find(a => a.id === selectedArticle)!} 
            onClose={() => setSelectedArticle(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default UserHome;