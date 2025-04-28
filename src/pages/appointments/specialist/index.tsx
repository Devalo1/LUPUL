import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { FaArrowLeft, FaCalendarAlt, FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { SpecialistCVDisplay } from "../../../components/CVEditForm";
import SpecialistAvatar from "../../../components/SpecialistAvatar";
import { processImageUrl } from "../../../utils/imageUtils";

const SpecialistProfile = () => {
  const { specialistId } = useParams<{ specialistId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [specialist, setSpecialist] = useState<any>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const loadSpecialistData = async () => {
      if (!specialistId) {
        setError("ID-ul specialistului nu a fost găsit.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Încercăm să obținem datele din colecția specialists
        const specialistDoc = await getDoc(doc(db, "specialists", specialistId));
        
        if (specialistDoc.exists()) {
          const specialistData = specialistDoc.data();
          setSpecialist({
            id: specialistId,
            name: specialistData.name || specialistData.displayName || "Specialist",
            role: specialistData.specialization || specialistData.role || specialistData.serviceType || "Specialist",
            email: specialistData.email || "",
            phone: specialistData.phone || "",
            photoURL: processImageUrl(specialistData.photoURL || specialistData.imageUrl || ""),
            description: specialistData.bio || specialistData.description || "",
            rating: specialistData.rating || 0,
            reviewCount: specialistData.reviewCount || 0,
            schedule: specialistData.schedule || []
          });
          
          // Construim obiectul CV
          const cvData = {
            experience: specialistData.experience || 0,
            education: specialistData.education || [],
            certifications: specialistData.certifications || [],
            languages: specialistData.languages || [],
            awards: specialistData.awards || [],
            publications: specialistData.publications || [],
            bio: specialistData.bio || specialistData.description || "",
            experienceDetails: specialistData.experienceDetails || [],
            photoURL: processImageUrl(specialistData.photoURL || specialistData.imageUrl || ""),
          };
          
          setCvData(cvData);
        } else {
          // Dacă nu găsim în specialists, încercăm în users
          const userDoc = await getDoc(doc(db, "users", specialistId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setSpecialist({
              id: specialistId,
              name: userData.displayName || userData.name || userData.email || "Specialist",
              role: userData.specialization || userData.role || "Specialist",
              email: userData.email || "",
              phone: userData.phone || "",
              photoURL: processImageUrl(userData.photoURL || userData.imageUrl || ""),
              description: userData.bio || userData.description || "",
              rating: userData.rating || 0,
              reviewCount: userData.reviewCount || 0,
              schedule: userData.schedule || []
            });
            
            // Construim obiectul CV
            const cvData = {
              experience: userData.experience || 0,
              education: userData.education || [],
              certifications: userData.certifications || [],
              languages: userData.languages || [],
              awards: userData.awards || [],
              publications: userData.publications || [],
              bio: userData.bio || userData.description || "",
              experienceDetails: userData.experienceDetails || [],
              photoURL: processImageUrl(userData.photoURL || userData.imageUrl || ""),
            };
            
            setCvData(cvData);
          } else {
            setError("Nu am putut găsi informații despre acest specialist.");
          }
        }
        
        // Încărcăm și recenziile specialistului
        const reviewsQuery = query(
          collection(db, "specialistReviews"), 
          where("specialistId", "==", specialistId)
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        if (!reviewsSnapshot.empty) {
          const reviewsList = reviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
          }));
          
          // Sortăm după data, cele mai recente primul
          reviewsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setReviews(reviewsList);
        }
      } catch (err) {
        console.error("Eroare la încărcarea datelor specialistului:", err);
        setError("A apărut o eroare la încărcarea datelor specialistului.");
      } finally {
        setLoading(false);
      }
    };
    
    loadSpecialistData();
  }, [specialistId]);

  // Funcție pentru a renderiza stelele de rating
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
    
    return (
      <div className="flex items-center">
        <div className="flex mr-1">{stars}</div>
        <span className="text-sm text-gray-600">
          ({specialist?.reviewCount || 0} recenzii)
        </span>
      </div>
    );
  };

  const handleBackToSelection = () => {
    navigate("/appointments/specialist");
  };

  const handleScheduleAppointment = () => {
    // Salvăm specialistul selectat în sessionStorage pentru a-l folosi ulterior
    sessionStorage.setItem("appointmentData", JSON.stringify({
      specialistId,
      serviceId: null,
      date: null,
      time: null,
      note: ""
    }));
    
    // Navigăm la pasul următor
    navigate("/appointments/service");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="flex items-center space-x-6 mb-8">
                <div className="rounded-full bg-gray-200 h-24 w-24"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <button
            onClick={handleBackToSelection}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition"
          >
            <FaArrowLeft className="mr-2" /> Înapoi la lista de specialiști
          </button>
          
          {error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              <p>{error}</p>
              <button
                onClick={handleBackToSelection}
                className="mt-3 bg-white text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50"
              >
                Înapoi la selecția de specialiști
              </button>
            </div>
          ) : (
            <>
              {/* Header cu informații de bază despre specialist */}
              <div className="flex flex-col md:flex-row items-start md:items-center mb-8 border-b pb-6">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mr-6 mb-4 md:mb-0">
                  <SpecialistAvatar 
                    photoURL={specialist?.photoURL}
                    name={specialist?.name || "Specialist"} 
                    id={specialist?.id || "0"}
                    size="xl"
                    className="w-full h-full"
                  />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{specialist?.name}</h1>
                  <p className="text-blue-600 font-medium mb-2">{specialist?.role}</p>
                  
                  {specialist?.rating > 0 && (
                    <div className="mb-3">
                      {renderStars(specialist.rating)}
                    </div>
                  )}
                  
                  {specialist?.email && (
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Email:</span> {specialist.email}
                    </p>
                  )}
                  
                  {specialist?.phone && (
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Telefon:</span> {specialist.phone}
                    </p>
                  )}
                </div>
                
                <div className="mt-6 md:mt-0">
                  <button
                    onClick={handleScheduleAppointment}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Programează o ședință
                  </button>
                </div>
              </div>
              
              {/* Afișăm CV-ul specialistului folosind componenta SpecialistCVDisplay */}
              {cvData ? (
                <div className="bg-white rounded-lg">
                  <SpecialistCVDisplay cvData={cvData} specialist={specialist} />
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                  <p>Nu există informații detaliate în CV-ul acestui specialist.</p>
                </div>
              )}
              
              {/* Recenzii */}
              {reviews.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Recenzii de la clienți</h2>
                  
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                              {review.userPhotoURL ? (
                                <img 
                                  src={processImageUrl(review.userPhotoURL)} 
                                  alt={review.userName} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                  {review.userName?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="font-medium">{review.userName || "Client"}</h3>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString("ro-RO", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-yellow-400">
                                {i < review.rating ? <FaStar /> : <FaRegStar />}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialistProfile;