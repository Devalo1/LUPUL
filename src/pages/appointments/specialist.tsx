import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStar, FaRegStar, FaStarHalfAlt, FaCalendarAlt, FaCheck, FaUser, FaCheckCircle } from "react-icons/fa";
import { collection, getDocs, query, where, orderBy, getDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getSpecialistData } from "../../utils/specialistUtils";
import SpecialistAvatar from "../../components/SpecialistAvatar";
import SpecialistEvents from "../../components/SpecialistEvents";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { Review } from "../../types/reviews";

// Types
interface SpecialistProfile {
  id: string;
  name: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  services?: string[];
  experience?: number;
  bio?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  availability?: Record<string, any>;
  location?: Record<string, any>;
  rating?: number;
  reviewsCount?: number;
  publications?: string[];
  awards?: string[];
}

// Define a utility type for using with getSpecialistData results
interface SpecialistDataResult {
  id: string;
  source: string;
  name?: string;
  fullName?: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  services?: string[];
  specialization?: string;
  experience?: number;
  bio?: string;
  description?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  availability?: Record<string, any>;
  location?: Record<string, any>;
  rating?: number;
  reviewsCount?: number;
  publications?: string[];
  awards?: string[];
  [key: string]: any; // Allow other properties
}

const SpecialistProfile: React.FC = () => {
  const { specialistId } = useParams<{ specialistId: string }>();
  const navigate = useNavigate();
  const [specialist, setSpecialist] = useState<SpecialistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "cv" | "reviews" | "events">("about");

  // State for reviews and ratings
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  
  // New review state
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    submitting: false
  });
  const { currentUser } = useAuth();

  // Helper function to safely format dates from either Date objects or Firestore Timestamps
  const formatReviewDate = (dateValue: any): string => {
    if (!dateValue) return "";
    
    try {
      // If it's a standard Date object
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      }
      
      // If it's a Firestore Timestamp with seconds property
      if (dateValue && typeof dateValue.seconds === "number") {
        return new Date(dateValue.seconds * 1000).toLocaleDateString();
      }
      
      // If it's a Firestore Timestamp with toDate() method
      if (dateValue && typeof dateValue.toDate === "function") {
        return dateValue.toDate().toLocaleDateString();
      }
      
      // Last resort - try to create a new date from it
      return new Date(dateValue).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  useEffect(() => {
    const fetchSpecialistData = async () => {
      if (!specialistId) return;

      try {
        setLoading(true);

        // Fetch specialist data using the utility function
        const specialistData = await getSpecialistData(specialistId) as SpecialistDataResult;

        if (specialistData) {
          // Format specialist data safely accessing properties with type assertions to avoid TS errors
          const formattedData: SpecialistProfile = {
            id: specialistData.id,
            name: (specialistData as any).name || (specialistData as any).fullName || "",
            photoURL: (specialistData as any).photoURL || "",
            email: (specialistData as any).email || "",
            phone: (specialistData as any).phone || "",
            specialties: (specialistData as any).specialties || [],
            services: (specialistData as any).services || [],
            experience: (specialistData as any).experience || 0,
            bio: (specialistData as any).bio || (specialistData as any).description || "",
            education: (specialistData as any).education || [],
            certifications: (specialistData as any).certifications || [],
            languages: (specialistData as any).languages || [],
            availability: (specialistData as any).availability || {},
            location: (specialistData as any).location || {},
            rating: (specialistData as any).rating || 0,
            reviewsCount: (specialistData as any).reviewsCount || 0,
          };

          setSpecialist(formattedData);

          // Fetch reviews for this specialist
          const reviewsList = await fetchSpecialistReviews(specialistId);

          setReviews(reviewsList);

          // Calculate average rating
          const totalRating = reviewsList.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(reviewsList.length > 0 ? totalRating / reviewsList.length : 0);

          // Check if the current user has already reviewed this specialist
          if (currentUser) {
            const hasReviewed = reviewsList.some(review => review.author.id === currentUser.uid);
            setUserHasReviewed(hasReviewed);
          }
        } else {
          console.error("Specialist not found:", specialistId);
        }
      } catch (error) {
        console.error("Error fetching specialist profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialistData();
  }, [specialistId, currentUser]);

  // Fetch only real reviews from users
  const fetchSpecialistReviews = async (specialistId: string) => {
    try {
      const reviewsRef = collection(db, "specialistReviews");
      const q = query(
        reviewsRef,
        where("specialistId", "==", specialistId),
        orderBy("createdAt", "desc")
      );

      const reviewsSnapshot = await getDocs(q);
      const reviews: Review[] = [];
      let currentUserHasReviewed = false;

      for (const reviewDoc of reviewsSnapshot.docs) {
        const reviewData = reviewDoc.data();

        // Only include reviews with valid userId
        if (reviewData.userId) {
          try {
            // Fetch the user who left the review
            const userDocRef = doc(db, "users", reviewData.userId);
            const userSnapshot = await getDoc(userDocRef);
            const userData = userSnapshot.exists() ? userSnapshot.data() : null;

            // Check if current user has already reviewed
            if (currentUser && reviewData.userId === currentUser.uid) {
              currentUserHasReviewed = true;
            }

            reviews.push({
              id: reviewDoc.id,
              rating: reviewData.rating,
              comment: reviewData.comment,
              createdAt: reviewData.createdAt?.toDate() || new Date(),
              author: userData
                ? {
                    id: reviewData.userId,
                    name: userData.displayName || "Anonymous User",
                    photoURL: userData.photoURL || "",
                  }
                : {
                    id: "",
                    name: "Anonymous User",
                    photoURL: "",
                  },
            });
          } catch (userError) {
            console.error("Error fetching user data for review:", userError);
            // Still add the review even if user data fetch fails
            reviews.push({
              id: reviewDoc.id,
              rating: reviewData.rating,
              comment: reviewData.comment,
              createdAt: reviewData.createdAt?.toDate() || new Date(),
              author: {
                id: "",
                name: "Anonymous User",
                photoURL: "",
              },
            });
          }
        }
      }
      
      // Set the state after processing all reviews
      setUserHasReviewed(currentUserHasReviewed);
      return reviews;
    } catch (error) {
      console.error("Error fetching specialist reviews:", error);
      return []; // Return empty array instead of throwing error
    }
  };

  // Render rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  // Reviews section
  const ReviewsSection = () => {
    // Function to handle star click for new review
    const handleStarClick = (rating: number) => {
      setNewReview(prev => ({ ...prev, rating }));
    };

    // Function to render clickable stars for review submission
    const renderClickableStars = () => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <button
            key={i}
            onClick={() => handleStarClick(i)}
            className="text-2xl focus:outline-none"
          >
            {i <= newReview.rating ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-yellow-400" />
            )}
          </button>
        );
      }
      return stars;
    };

    // Function to handle review submission
    const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) {
        toast.error("Trebuie să fiți autentificat pentru a lăsa o recenzie.");
        return;
      }
      
      // Verifică din nou dacă utilizatorul a lăsat deja o recenzie
      if (userHasReviewed) {
        toast.error("Ați lăsat deja o recenzie pentru acest specialist.");
        return;
      }

      if (newReview.rating === 0) {
        toast.error("Vă rugăm să acordați un rating înainte de a trimite recenzia.");
        return;
      }
      
      try {
        setNewReview(prev => ({ ...prev, submitting: true }));

        // Add the review to Firestore
        await addDoc(collection(db, "specialistReviews"), {
          specialistId,
          userId: currentUser.uid,
          rating: newReview.rating,
          comment: newReview.comment,
          createdAt: serverTimestamp()
        });

        // Fetch the updated reviews
        const updatedReviews = await fetchSpecialistReviews(specialistId || "");
        setReviews(updatedReviews);
        
        // Recalculate average rating
        const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0);

        // Reset the form and set userHasReviewed to true
        setNewReview({
          rating: 0,
          comment: "",
          submitting: false
        });
        setUserHasReviewed(true);
        
        toast.success("Recenzia dvs. a fost adăugată cu succes!");
      } catch (error) {
        console.error("Error submitting review:", error);
        toast.error("A apărut o eroare la trimiterea recenziei. Vă rugăm să încercați din nou.");
        setNewReview(prev => ({ ...prev, submitting: false }));
      }
    };

    return (
      <div className="space-y-6">
        {/* Review submission form */}
        {currentUser && !userHasReviewed && (
          <div className="bg-white rounded-lg p-6 shadow mb-8">
            <h3 className="text-xl font-semibold mb-4">Lasă o recenzie</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {renderClickableStars()}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">Comentariu</label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Spune-ne despre experiența ta cu acest specialist..."
                  value={newReview.comment}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setNewReview(prev => ({ ...prev, comment: newValue }));
                  }}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={newReview.submitting || newReview.rating === 0}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  newReview.submitting || newReview.rating === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {newReview.submitting ? "Se trimite..." : "Trimite recenzia"}
              </button>
            </form>
          </div>
        )}

        {/* Message when user has already reviewed */}
        {currentUser && userHasReviewed && (
          <div className="bg-green-50 rounded-lg p-6 shadow mb-8">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <p>Ați lăsat deja o recenzie pentru acest specialist. Mulțumim pentru feedback!</p>
            </div>
          </div>
        )}
        
        {/* Login prompt if user is not logged in */}
        {!currentUser && (
          <div className="bg-blue-50 rounded-lg p-6 shadow mb-8">
            <p className="text-center mb-3">
              Trebuie să fiți autentificat pentru a lăsa o recenzie.
            </p>
            <div className="text-center">
              <button
                onClick={() => navigate("/login", { state: { returnUrl: `/appointments/specialist/${specialistId}` } })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Autentificare
              </button>
            </div>
          </div>
        )}
        
        {/* Existing reviews */}
        <h3 className="text-xl font-semibold mb-4">Recenzii ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Acest specialist nu are încă recenzii.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-4 shadow mb-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  {review.author.photoURL ? (
                    <img
                      src={review.author.photoURL}
                      alt={review.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{review.author.name}</div>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-500">
                      {review.createdAt ? formatReviewDate(review.createdAt) : ""}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    );
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle booking button
  const handleBookAppointment = () => {
    if (specialistId) {
      // Store selected specialist in session for appointment flow
      const appointmentData = {
        specialistId,
        serviceId: null,
        date: null,
        time: null,
        note: "",
      };

      // Save to session storage
      sessionStorage.setItem("appointmentData", JSON.stringify(appointmentData));

      // Navigate to the service selection step
      navigate("/appointments/service", { state: { appointmentData } });
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If specialist not found, show error
  if (!specialist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Specialist negăsit</h1>
          <p className="text-gray-600 mb-6">Nu am putut găsi specialistul solicitat. Este posibil ca acesta să nu mai fie disponibil.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Înapoi la selecția specialiștilor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
        >
          <FaArrowLeft className="mr-2" /> Înapoi
        </button>
        
        {/* Specialist header section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 md:p-12 relative">
            <div className="flex flex-col md:flex-row items-center text-white">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden flex-shrink-0 mb-6 md:mb-0 bg-white p-1">
                <SpecialistAvatar
                  photoURL={specialist.photoURL}
                  name={specialist.name}
                  id={specialist.id}
                  size="xl"
                  className="w-full h-full"
                />
              </div>
              <div className="md:ml-8 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{specialist.name}</h1>
                
                {/* Rating badge */}
                <div className="inline-flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1 mb-4">
                  <div className="flex mr-2">
                    {renderStars(averageRating)}
                  </div>
                  <span>{averageRating.toFixed(1)} ({reviews.length} recenzii)</span>
                </div>
                
                {/* Contact info */}
                <div className="mt-4 space-y-1">
                  {specialist.email && (
                    <p className="text-blue-100">
                      <span className="font-semibold">Email:</span> {specialist.email}
                    </p>
                  )}
                  {specialist.phone && (
                    <p className="text-blue-100">
                      <span className="font-semibold">Telefon:</span> {specialist.phone}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Book appointment button for desktop */}
              <div className="hidden md:block ml-auto">
                <button
                  onClick={handleBookAppointment}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-blue-50 transition"
                >
                  <FaCalendarAlt className="inline-block mr-2" />
                  Programează o ședință
                </button>
              </div>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-6 py-4 text-lg font-medium border-b-2 transition ${
                  activeTab === "about"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("about")}
              >
                Despre
              </button>
              <button
                className={`px-6 py-4 text-lg font-medium border-b-2 transition ${
                  activeTab === "cv"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("cv")}
              >
                CV Profesional
              </button>
              <button
                className={`px-6 py-4 text-lg font-medium border-b-2 transition ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Recenzii ({reviews.length})
              </button>
              <button
                className={`px-6 py-4 text-lg font-medium border-b-2 transition ${
                  activeTab === "events"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("events")}
              >
                Evenimente Parteneri
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="p-6 md:p-8">
            {/* About tab */}
            {activeTab === "about" && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">Despre</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {specialist.bio || "Nu există informații biografice disponibile pentru acest specialist."}
                </p>
                
                {/* Specialties section */}
                {specialist.specialties && specialist.specialties.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Specializări</h3>
                    <div className="flex flex-wrap gap-2">
                      {specialist.specialties.map((specialty, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Services section */}
                {specialist.services && specialist.services.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Servicii oferite</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {specialist.services.map((service, index) => (
                        <li key={index} className="text-gray-700">{service}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* CV tab */}
            {activeTab === "cv" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">CV Profesional</h2>
                
                {/* Experience section */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-700">
                    Experiență profesională
                  </h3>
                  <div className="space-y-6">
                    <div className="flex">
                      <div className="flex-none w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                      <div className="ml-4">
                        <h4 className="font-medium">Senior Specialist</h4>
                        <p className="text-gray-600">Centrul de Sănătate Integrativă</p>
                        <p className="text-sm text-gray-500">2018 - Prezent</p>
                        <p className="mt-2 text-gray-700">
                          Coordonare programe de terapie, dezvoltare protocoale de tratament, 
                          consultanță individuală, organizare workshopuri și training-uri.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-none w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                      <div className="ml-4">
                        <h4 className="font-medium">Specialist</h4>
                        <p className="text-gray-600">Institutul de Dezvoltare Personală</p>
                        <p className="text-sm text-gray-500">2013 - 2018</p>
                        <p className="mt-2 text-gray-700">
                          Implementare programe terapeutice, evaluare și diagnostic, 
                          colaborare interdisciplinară pentru cazuri complexe.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-none w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                      <div className="ml-4">
                        <h4 className="font-medium">Asistent</h4>
                        <p className="text-gray-600">Clinica de Recuperare</p>
                        <p className="text-sm text-gray-500">2010 - 2013</p>
                        <p className="mt-2 text-gray-700">
                          Asistență în dezvoltarea planurilor de intervenție, monitorizare progres, 
                          participare activă în echipa multidisciplinară.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Education section */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-700">
                    Educație
                  </h3>
                  <div className="space-y-6">
                    {specialist.education && specialist.education.length > 0 ? (
                      specialist.education.map((edu, index) => (
                        <div key={`education-${index}`} className="flex">
                          <div className="flex-none w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                          <div className="ml-4">
                            <p className="font-medium">{edu}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Nu există informații despre educație pentru acest specialist.</p>
                    )}
                  </div>
                </div>
                
                {/* Certifications section */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-700">
                    Certificări și acreditări
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialist.certifications && specialist.certifications.length > 0 ? (
                      specialist.certifications.map((cert, index) => (
                        <div key={`cert-${index}`} className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Nu există informații despre certificări pentru acest specialist.</p>
                    )}
                  </div>
                </div>
                
                {/* Languages section */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-700">
                    Limbi vorbite
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {specialist.languages && specialist.languages.length > 0 ? (
                      specialist.languages.map((lang, index) => (
                        <div key={`lang-${index}`} className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span>{lang}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Nu există informații despre limbile vorbite de acest specialist.</p>
                    )}
                  </div>
                </div>
                
                {/* Publications/Awards (only if available) */}
                {(specialist.publications && specialist.publications.length > 0) && (
                  <div className="mb-10">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-700">
                      Publicații
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {specialist.publications.map((pub, index) => (
                        <li key={`pub-${index}`}>{pub}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(specialist.awards && specialist.awards.length > 0) && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-700">
                      Premii și distincții
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {specialist.awards.map((award, index) => (
                        <li key={`award-${index}`}>{award}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && <ReviewsSection />}
            
            {/* Partener events tab */}
            {activeTab === "events" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Evenimente organizate de partener</h2>
                
                <div className="specialistEventList">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <SpecialistEvents specialistId={specialistId || ""} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Book appointment button for mobile */}
        <div className="md:hidden mt-6">
          <button
            onClick={handleBookAppointment}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            <FaCalendarAlt className="inline-block mr-2" />
            Programează o ședință
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialistProfile;