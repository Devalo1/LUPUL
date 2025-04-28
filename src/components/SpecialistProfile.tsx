import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { 
  FaStar, 
  FaGraduationCap, 
  FaBriefcase, 
  FaCertificate, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaRegStar,
  FaStarHalfAlt
} from "react-icons/fa";

interface SpecialistProfileProps {
  specialistId?: string;
  editable?: boolean;
}

interface ProfileData {
  displayName: string;
  photoURL: string;
  reviewCount: number;
  specialization: string;
  specializationCategory: string;
  education: string[];
  experience: string[];
  certifications: string[];
  bio: string;
  rating: number;
}

interface ReviewData {
  id: string;
  rating: number;
  text: string;
  userId: string;
  userName?: string;
  userPhotoURL?: string;
  comment?: string;
  createdAt?: Date | string | number;
  [key: string]: unknown;
}

interface _EventData {
  target: {
    name: string;
    value: string | number;
  };
  preventDefault: () => void;
}

const SpecialistProfile: React.FC<SpecialistProfileProps> = ({ 
  specialistId, 
  editable = false 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    photoURL: "",
    reviewCount: 0,
    specialization: "",
    specializationCategory: "",
    education: [],
    experience: [],
    certifications: [],
    bio: "",
    rating: 0
  });
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData>({
    displayName: "",
    photoURL: "",
    reviewCount: 0,
    specialization: "",
    specializationCategory: "",
    education: [],
    experience: [],
    certifications: [],
    bio: "",
    rating: 0
  });
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const targetId = specialistId || user?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetId) return;
      
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(firestore, "users", targetId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile((prev: ProfileData) => ({
            ...prev,
            displayName: userData.displayName || "",
            photoURL: userData.photoURL || "",
            reviewCount: userData.reviewCount || 0,
            specialization: userData.specialization || "",
            specializationCategory: userData.specializationCategory || "",
            education: userData.education || [],
            experience: userData.experience || [],
            certifications: userData.certifications || [],
            bio: userData.bio || "",
            rating: userData.rating || 0
          }));
          
          setEditedProfile((prev: ProfileData) => ({
            ...prev,
            bio: userData.bio || "",
            education: userData.education || [],
            experience: userData.experience || [],
            certifications: userData.certifications || []
          }));
        } else {
          const specialistsRef = collection(firestore, "specialists");
          const q = query(specialistsRef, where("userId", "==", targetId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const specialistData = querySnapshot.docs[0].data();
            setProfile((prev: ProfileData) => ({
              ...prev,
              displayName: specialistData.name || "",
              photoURL: specialistData.photoURL || "",
              reviewCount: specialistData.reviewCount || 0,
              specialization: specialistData.specialization || "",
              specializationCategory: specialistData.specializationCategory || "",
              education: specialistData.education || [],
              experience: specialistData.experience || [],
              certifications: specialistData.certifications || [],
              bio: specialistData.bio || "",
              rating: specialistData.rating || 0
            }));
            
            setEditedProfile((prev: ProfileData) => ({
              ...prev,
              bio: specialistData.bio || "",
              education: specialistData.education || [],
              experience: specialistData.experience || [],
              certifications: specialistData.certifications || []
            }));
          }
        }
        
        await fetchReviews();
      } catch (err) {
        console.error("Error fetching specialist profile:", err);
        setError("A apărut o eroare la încărcarea profilului.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [targetId]);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(firestore, "specialistReviews");
      const reviewsQuery = query(reviewsRef, where("specialistId", "==", targetId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewsData: ReviewData[] = [];
      reviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        reviewsData.push({
          id: doc.id,
          rating: data.rating || 0,
          text: data.text || "",
          userId: data.userId || "",
          userName: data.userName || "Client",
          userPhotoURL: data.userPhotoURL || "",
          comment: data.comment || data.text || "",
          createdAt: data.createdAt?.toDate() || new Date(),
          ...data
        });
      });
      
      reviewsData.sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());
      setReviews(reviewsData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !editable) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(firestore, "users", user.uid), {
        bio: editedProfile.bio,
        education: editedProfile.education,
        experience: editedProfile.experience,
        certifications: editedProfile.certifications
      });
      
      setProfile((prev: ProfileData) => ({
        ...prev,
        bio: editedProfile.bio,
        education: editedProfile.education,
        experience: editedProfile.experience,
        certifications: editedProfile.certifications
      }));
      
      setEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("A apărut o eroare la salvarea profilului.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditField = (field: keyof ProfileData, value: unknown) => {
    setEditedProfile((prev: ProfileData) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddField = (field: keyof ProfileData) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: [...((prev[field] as string[]) || []), ""]
    }));
  };

  const updateListItem = (field: keyof ProfileData, index: number, value: string) => {
    const newList = [...(editedProfile[field] as string[])];
    newList[index] = value;
    handleEditField(field, newList);
  };

  const removeListItem = (field: keyof ProfileData, index: number) => {
    const newList = [...(editedProfile[field] as string[])];
    newList.splice(index, 1);
    handleEditField(field, newList);
  };

  const _handleEvent = (event: React.FormEvent<HTMLFormElement>): void => {
    const { name, value } = event.target as HTMLInputElement;
    setEditedProfile((prev: ProfileData) => ({
      ...prev,
      [name]: value
    }));
  };

  const _handleData = (_data: Record<string, unknown>): void => {
    // Process data
  };

  const _handleRatingChange = (value: number): void => {
    setProfile((prev: ProfileData) => ({
      ...prev,
      rating: prev.rating === value ? 0 : value
    }));
  };

  const _toggleReviewForm = (): void => {
    setEditing(prev => !prev);
  };

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
      <div className="flex">
        {stars}
        <span className="ml-1 text-sm text-gray-600">({profile.reviewCount || 0} evaluări)</span>
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500 text-2xl font-bold">
                {profile.displayName && profile.displayName.charAt(0) || "S"}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-1">{profile.displayName}</h2>
          
          <div className="text-sm text-gray-600 mb-2">
            {profile.specialization || profile.specializationCategory ? (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {profile.specialization || profile.specializationCategory}
              </span>
            ) : (
              <span className="text-gray-500 italic">Specializare nespecificată</span>
            )}
          </div>
          
          {profile.rating > 0 && renderStars(profile.rating)}
        </div>
        
        {editable && !editing && (
          <button 
            onClick={() => setEditing(true)}
            className="ml-auto bg-blue-100 text-blue-700 px-4 py-2 rounded flex items-center"
          >
            <FaEdit className="mr-2" /> Editează profilul
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <span className="mr-2">Despre mine</span>
          {profile.specialization && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {profile.specialization}
            </span>
          )}
        </h3>
        
        {editing ? (
          <textarea
            value={editedProfile.bio}
            onChange={(e) => handleEditField("bio", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            rows={5}
            placeholder="Adaugă o descriere despre tine, experiența ta și ce servicii oferi..."
          />
        ) : (
          <p className="text-gray-700">
            {profile.bio || <span className="text-gray-400 italic">Nicio descriere adăugată</span>}
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <FaGraduationCap className="mr-2" />
          Educație
        </h3>
        
        {editing ? (
          <div className="space-y-2">
            {editedProfile.education?.map((item: string, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem("education", index, e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Licență în Psihologie, Universitatea București, 2018"
                />
                <button 
                  onClick={() => removeListItem("education", index)}
                  className="ml-2 text-red-600 p-2"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => handleAddField("education")}
              className="mt-2 text-blue-600 px-4 py-1 border border-blue-600 rounded-md"
            >
              + Adaugă educație
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {profile.education && profile.education.length > 0 ? (
              profile.education.map((item: string, index: number) => (
                <div key={index} className="pl-2 border-l-2 border-blue-300">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">Nicio informație adăugată</p>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <FaBriefcase className="mr-2" />
          Experiență profesională
        </h3>
        
        {editing ? (
          <div className="space-y-2">
            {editedProfile.experience?.map((item: string, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem("experience", index, e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Psiholog clinician, Spitalul X, 2018-prezent"
                />
                <button 
                  onClick={() => removeListItem("experience", index)}
                  className="ml-2 text-red-600 p-2"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => handleAddField("experience")}
              className="mt-2 text-blue-600 px-4 py-1 border border-blue-600 rounded-md"
            >
              + Adaugă experiență
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {profile.experience && profile.experience.length > 0 ? (
              profile.experience.map((item: string, index: number) => (
                <div key={index} className="pl-2 border-l-2 border-green-300">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">Nicio informație adăugată</p>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <FaCertificate className="mr-2" />
          Certificări
        </h3>
        
        {editing ? (
          <div className="space-y-2">
            {editedProfile.certifications?.map((item: string, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem("certifications", index, e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Certificare în Terapie Cognitiv-Comportamentală, 2020"
                />
                <button 
                  onClick={() => removeListItem("certifications", index)}
                  className="ml-2 text-red-600 p-2"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => handleAddField("certifications")}
              className="mt-2 text-blue-600 px-4 py-1 border border-blue-600 rounded-md"
            >
              + Adaugă certificare
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {profile.certifications && profile.certifications.length > 0 ? (
              profile.certifications.map((item: string, index: number) => (
                <div key={index} className="pl-2 border-l-2 border-purple-300">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">Nicio informație adăugată</p>
            )}
          </div>
        )}
      </div>
      
      {!editing && reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Feedback de la clienți</h3>
          
          <div className="space-y-4">
            {reviews.slice(0, 3).map(review => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                      {review.userPhotoURL ? (
                        <img 
                          src={String(review.userPhotoURL || "")} 
                          alt={String(review.userName || "Client")} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-100 text-xs font-bold">
                          {typeof review.userName === "string" ? review.userName.charAt(0) : "U"}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{String(review.userName || "Client")}</span>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700">{String(review.comment || "")}</p>
                
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(String(review.createdAt || "")).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          
          {reviews.length > 3 && (
            <div className="text-center mt-4">
              <button className="text-blue-600 hover:underline">
                Vezi toate recenziile ({reviews.length})
              </button>
            </div>
          )}
        </div>
      )}
      
      {editing && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2"
          >
            Anulează
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            {saving ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Salvare...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Salvează profilul
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecialistProfile;
