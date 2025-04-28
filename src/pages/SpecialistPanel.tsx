import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, Timestamp, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "../firebase";
import { isUserSpecialist } from "../utils/authUtils";
import { canAccessSpecialistFeatures } from "../utils/roleUtils";
import { SpecializationCategories } from "../utils/specializationCategories";
import { FaCalendarAlt, FaPhoneAlt, FaEnvelope, FaPlus, FaPaperPlane, FaInfoCircle, FaUser, FaTimes, FaExclamationTriangle, FaEdit, FaGraduationCap, FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import SpecialistServices from "../components/SpecialistServices";
import CVEditForm from "../components/CVEditForm";

interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  date: Timestamp;
  time: string;
  service: string;
  details?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  specialistId?: string;
  specialistNotes?: string;
}

interface UserDetails {
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
}

interface SpecialSession {
  id?: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  currentParticipants: number;
  price: number;
  specialistId: string;
  specialistName: string;
  specialistRole: string;
  location?: string;
  isOnline: boolean;
  imageUrl?: string; // URL to poster or image for the session
  createdAt?: Date | Timestamp; // făcută opțională pentru a rezolva erorile
  categories?: string[];
  tags?: string[];
  participants?: any[]; // Adding participants property
}

interface SpecialistService {
  id?: string;
  serviceId: string;
  specialistId: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  isActive: boolean;
  createdAt?: any;
}

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  createdAt: Date;
}

type ServiceType = "Terapie" | "Consultație" | "Educație" | "Sport";

const SpecialistPanel: React.FC = () => {
  const { user, loading, refreshUserData } = useAuth();
  const [isSpecialist, setIsSpecialist] = useState<boolean>(false);
  const [checkingRole, setCheckingRole] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [specialSessions, setSpecialSessions] = useState<SpecialSession[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{[userId: string]: UserDetails}>({});
  const [_selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [specialistNotes, setSpecialistNotes] = useState<string>("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [activeTab, setActiveTab] = useState<"appointments" | "sessions" | "services">("appointments");
  const [_showSessionForm, setShowSessionForm] = useState(false);
  const [_newSession, _setNewSession] = useState<Omit<SpecialSession, "createdAt" | "specialistId" | "specialistName" | "specialistRole" | "currentParticipants">>({
    title: "",
    description: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    capacity: 5,
    price: 0,
    isOnline: false,
    location: "",
    imageUrl: ""
  });
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [_imagePreview, setImagePreview] = useState<string | null>(null);
  const [_uploadProgress, _setUploadProgress] = useState<number>(0);
  const [_selectedServiceType, _setSelectedServiceType] = useState<ServiceType | "">("");
  const [_loadingServiceType, _setLoadingServiceType] = useState<boolean>(true);
  const [_savingServiceType, _setSavingServiceType] = useState<boolean>(false);
  const [_availableServices, setAvailableServices] = useState<Service[]>([]);
  const [_specialistServices, setSpecialistServices] = useState<SpecialistService[]>([]);
  const [_loadingServices, setLoadingServices] = useState<boolean>(false);
  const [_addingService, _setAddingService] = useState<boolean>(false);
  const [_selectedService, _setSelectedService] = useState<string | null>(null);
  const [_servicePrice, _setServicePrice] = useState<number>(0);
  const [_selectedSession, _setSelectedSession] = useState<SpecialSession | null>(null);

  const [showSpecializationChangeForm, setShowSpecializationChangeForm] = useState(false);
  const [specializationChangeRequest, setSpecializationChangeRequest] = useState({
    newSpecialization: "",
    specializationDetails: "",
    reason: ""
  });
  const [submittingSpecRequest, setSubmittingSpecRequest] = useState(false);
  const [pendingSpecializationRequests, setPendingSpecializationRequests] = useState<any[]>([]);
  const [specialistProfile, setSpecialistProfile] = useState<any>({});

  const [showCVEditForm, setShowCVEditForm] = useState(false);
  const [specialistCV, setSpecialistCV] = useState<any>(null);
  const [_loadingCV, setLoadingCV] = useState(false);

  const [profileData, _setProfileData] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Formular de sesiune specială - îmbunătățit cu mai multe opțiuni
  const [sessionFormMode, setSessionFormMode] = useState<"create" | "edit">("create");
  const [editingSession, setEditingSession] = useState<SpecialSession | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("10:00");
  const [sessionEndTime, setSessionEndTime] = useState("11:00");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionIsOnline, setSessionIsOnline] = useState(false);
  const [sessionCapacity, setSessionCapacity] = useState(10);
  const [sessionPrice, setSessionPrice] = useState(150);
  const [sessionRepeat, setSessionRepeat] = useState<"none" | "weekly" | "monthly">("none");
  const [sessionRepeatCount, setSessionRepeatCount] = useState(1);
  const [sessionImageUrl, setSessionImageUrl] = useState("");
  const [sessionImageFile, setSessionImageFile] = useState<File | null>(null);
  const [_sessionImagePreview, setSessionImagePreview] = useState<string>("");
  const [sessionCategories, setSessionCategories] = useState<string[]>([]);
  const [sessionTags, setSessionTags] = useState<string>("");
  const [_savingSession, setSavingSession] = useState(false);

  // Resetează formularul de sesiune
  const resetSessionForm = () => {
    setSessionTitle("");
    setSessionDescription("");
    setSessionDate("");
    setSessionStartTime("10:00");
    setSessionEndTime("11:00");
    setSessionLocation("");
    setSessionIsOnline(false);
    setSessionCapacity(10);
    setSessionPrice(150);
    setSessionRepeat("none");
    setSessionRepeatCount(1);
    setSessionImageUrl("");
    setSessionImageFile(null);
    setSessionImagePreview("");
    setSessionCategories([]);
    setSessionTags("");
    setEditingSession(null);
    setSessionFormMode("create");
  };

  // Deschide formularul pentru editarea unei sesiuni existente
  const handleEditSession = (session: SpecialSession) => {
    navigate(`/edit-session/${session.id}`);
  };

  // Procesează imaginea și returnează URL-ul corect
  const processSessionImage = async (file: File | null, existingUrl: string): Promise<string> => {
    // Dacă nu există un fișier nou și avem un URL existent, îl păstrăm
    if (!file && existingUrl) {
      return existingUrl;
    }
    
    // Dacă nu există un fișier nou și nu avem URL existent, folosim imaginea default
    if (!file) {
      return "/images/Events.jpeg";
    }
    
    try {
      // Generăm un nume de fișier unic pentru a evita conflictele
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop();
      const fileName = `session_${timestamp}.${fileExtension}`;
      
      // Încărcăm fișierul în Firebase Storage și obținem URL-ul
      const storageRef = ref(storage, `specialSessions/${fileName}`);
      await uploadBytes(storageRef, file);
      
      // Obținem URL-ul
      const downloadUrl = await getDownloadURL(storageRef);
      
      console.log("Imaginea a fost încărcată cu succes: ", downloadUrl);
      
      return downloadUrl;
    } catch (err) {
      console.error("Eroare la procesarea imaginii:", err);
      throw new Error("Nu s-a putut procesa imaginea. Vă rugăm să încercați din nou.");
    }
  };

  // Gestionează schimbarea imaginii
  const _handleSessionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verifică dimensiunea fișierului (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlertMessage({
        type: "error",
        message: "Imaginea este prea mare. Mărimea maximă acceptată este de 5MB."
      });
      return;
    }
    
    // Verifică tipul fișierului (doar imagini)
    if (!file.type.startsWith("image/")) {
      setAlertMessage({
        type: "error",
        message: "Te rugăm să încarci doar fișiere de tip imagine."
      });
      return;
    }
    
    setSessionImageFile(file);
    
    // Creează un URL pentru previzualizare
    const reader = new FileReader();
    reader.onload = () => {
      setSessionImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Salvează o sesiune nouă sau actualizează una existentă
  const _handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isSpecialist) {
      setAlertMessage({
        type: "error",
        message: "Doar specialiștii pot crea sau edita sesiuni."
      });
      return;
    }
    
    if (!sessionTitle || !sessionDescription || !sessionDate) {
      setAlertMessage({
        type: "error",
        message: "Te rugăm să completezi toate câmpurile obligatorii."
      });
      return;
    }
    
    try {
      setSavingSession(true);
      
      // Procesăm imaginea
      const imageUrl = await processSessionImage(
        sessionImageFile, 
        sessionImageUrl
      );
      
      // Pregătim datele sesiunii
      const tagsArray = sessionTags.split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const sessionData = {
        title: sessionTitle,
        description: sessionDescription,
        date: Timestamp.fromDate(new Date(sessionDate)),
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        location: sessionIsOnline ? "" : sessionLocation,
        isOnline: sessionIsOnline,
        capacity: sessionCapacity,
        price: sessionPrice,
        specialistId: user.uid,
        specialistName: profileData?.displayName || user.displayName || "Specialist",
        specialistRole: profileData?.role || "Specialist",
        currentParticipants: editingSession?.currentParticipants || 0,
        imageUrl: imageUrl,
        participants: editingSession?.participants || [],
        categories: sessionCategories.length > 0 ? sessionCategories : ["general"],
        tags: tagsArray,
        lastUpdated: Timestamp.now(),
        ...(sessionFormMode === "create" ? { createdAt: Timestamp.now() } : {})
      };
      
      // Crează sau actualizează sesiunea
      if (sessionFormMode === "edit" && editingSession) {
        await updateDoc(doc(firestore, "specialSessions", editingSession.id), sessionData);
        
        // Actualizăm sesiunea în starea locală
        setSpecialSessions(
          specialSessions.map(s => 
            s.id === editingSession.id 
              ? { ...s, ...sessionData, date: new Date(sessionDate) } 
              : s
          )
        );
        
        setAlertMessage({
          type: "success",
          message: "Sesiunea a fost actualizată cu succes!"
        });
      } else {
        // Pentru sesiuni multiple dacă s-a selectat repetiția
        if (sessionRepeat !== "none" && sessionRepeatCount > 1) {
          const originalDate = new Date(sessionDate);
          const sessions = [];
          
          // Creăm sesiunile repetate
          for (let i = 0; i < sessionRepeatCount; i++) {
            const newDate = new Date(originalDate);
            
            if (i > 0) {
              if (sessionRepeat === "weekly") {
                newDate.setDate(newDate.getDate() + (7 * i));
              } else if (sessionRepeat === "monthly") {
                newDate.setMonth(newDate.getMonth() + i);
              }
            }
            
            const sessionWithDate = {
              ...sessionData,
              date: Timestamp.fromDate(newDate)
            };
            
            const docRef = await addDoc(collection(firestore, "specialSessions"), sessionWithDate);
            sessions.push({ id: docRef.id, ...sessionWithDate, date: newDate });
          }
          
          // Actualizăm starea cu toate sesiunile noi
          setSpecialSessions([...specialSessions, ...sessions]);
          
          setAlertMessage({
            type: "success",
            message: `Au fost create ${sessionRepeatCount} sesiuni cu succes!`
          });
        } else {
          // Creăm o singură sesiune
          const docRef = await addDoc(collection(firestore, "specialSessions"), sessionData);
          
          // Actualizăm starea locală
          setSpecialSessions([
            ...specialSessions,
            { id: docRef.id, ...sessionData, date: new Date(sessionDate) }
          ]);
          
          setAlertMessage({
            type: "success",
            message: "Sesiunea a fost creată cu succes!"
          });
        }
      }
      
      // Resetăm formularul și închidem modalul
      resetSessionForm();
      setShowSessionForm(false);
    } catch (err) {
      console.error("Eroare la salvarea sesiunii:", err);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la salvarea sesiunii. Vă rugăm să încercați din nou."
      });
    } finally {
      setSavingSession(false);
      
      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
    }
  };

  // Șterge o sesiune
  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Ești sigur că vrei să ștergi această sesiune? Toți participanții vor fi notificați.")) {
      return;
    }
    
    try {
      await deleteDoc(doc(firestore, "specialSessions", sessionId));
      
      // Actualizăm starea locală
      setSpecialSessions(specialSessions.filter(s => s.id !== sessionId));
      
      setAlertMessage({
        type: "success",
        message: "Sesiunea a fost ștearsă cu succes!"
      });
      
      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Eroare la ștergerea sesiunii:", err);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la ștergerea sesiunii."
      });
    }
  };

  // Componenta pentru afișarea sesiunilor speciale
  const _renderSpecialSessions = () => {
    if (loadingSessions) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (specialSessions.length === 0) {
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nu ai creat încă nicio sesiune specială.</p>
          <button
            onClick={() => {
              resetSessionForm();
              setShowSessionForm(true);
            }}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Creează prima ta sesiune
          </button>
        </div>
      );
    }
    
    // Grupăm sesiunile după dată
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingSessions = specialSessions.filter(
      session => session.date >= today
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const pastSessions = specialSessions.filter(
      session => session.date < today
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return (
      <div>
        {upcomingSessions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Sesiuni viitoare</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {upcomingSessions.map(session => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onEdit={() => handleEditSession(session)}
                  onDelete={() => handleDeleteSession(session.id)}
                  _isUpcoming={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {pastSessions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Sesiuni trecute</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastSessions.map(session => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onEdit={() => handleEditSession(session)}
                  onDelete={() => handleDeleteSession(session.id)}
                  _isUpcoming={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Componenta pentru afișarea unei sesiuni
  type SessionCardProps = {
    session: SpecialSession;
    onEdit: () => void;
    onDelete: () => void;
    _isUpcoming: boolean;
  };

  // Card pentru sesiune
  const SessionCard: React.FC<SessionCardProps> = ({ session, onEdit, onDelete, _isUpcoming }) => {
    // Calculăm procentajul de umplere
    const fillPercentage = Math.min(
      100,
      Math.round((session.currentParticipants / session.capacity) * 100)
    );
    
    // Determinăm culoarea procentajului
    let fillColor = "bg-green-500";
    if (fillPercentage >= 90) fillColor = "bg-red-500";
    else if (fillPercentage >= 70) fillColor = "bg-orange-500";
    else if (fillPercentage >= 50) fillColor = "bg-yellow-500";
    
    return (
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-40">
          <img 
            src={session.imageUrl || "/images/Events.jpeg"} 
            alt={session.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/Events.jpeg";
            }}
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <h4 className="text-white font-bold line-clamp-2">{session.title}</h4>
            <p className="text-gray-200 text-sm">
              {formatDate(session.date)} • {session.startTime}-{session.endTime}
            </p>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {session.isOnline ? "Online" : session.location}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {formatPrice(session.price)}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Participanți</span>
              <span className="font-medium">{session.currentParticipants}/{session.capacity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`${fillColor} h-2.5 rounded-full`} 
                style={{ width: `${fillPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {session.categories && session.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {session.categories.map((cat, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={onEdit}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <FaEdit className="mr-1" /> Editează
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/events/${session.id}`, "_blank")}
                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
              >
                <FaExternalLinkAlt className="mr-1" /> Vezi
              </button>
              
              <button
                onClick={onDelete}
                className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <FaTrash className="mr-1" /> Șterge
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Verificăm dacă parametrul openCVEdit=true este prezent în URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const shouldOpenCVEdit = queryParams.get("openCVEdit") === "true";
    
    if (shouldOpenCVEdit) {
      // Deschidem direct formularul de editare CV când parametrul este prezent
      setShowCVEditForm(true);
      // Eliminăm parametrul din URL pentru a evita redeschiderea formularului la refresh
      navigate("/specialist", { replace: true });
    }
  }, [location, navigate]);

  // Reîmprospătează datele profilului utilizatorului la încărcarea paginii
  useEffect(() => {
    const refreshProfile = async () => {
      if (user && !loading) {
        try {
          // Verificăm dacă există funcția refreshUserData în contextul de autentificare
          if (typeof refreshUserData === "function") {
            await refreshUserData();
            console.log("Profil utilizator reîmprospătat în SpecialistPanel");
          }
        } catch (error) {
          console.error("Eroare la reîmprospătarea datelor de utilizator:", error);
        }
      }
    };
    
    refreshProfile();
  }, [user, loading, refreshUserData]);

  // Verificăm dacă utilizatorul este specialist
  useEffect(() => {
    const checkSpecialistStatus = async () => {
      if (!user) return;
      
      try {
        console.log("Checking specialist status in SpecialistPanel for:", user.uid);
        
        // Try the enhanced role detection first
        const canAccess = await canAccessSpecialistFeatures(user);
        console.log("canAccessSpecialistFeatures result:", canAccess);
        setIsSpecialist(canAccess);
        
        if (!canAccess) {
          // Fall back to original method if needed
          const isSpec = await isUserSpecialist(user.uid);
          console.log("isUserSpecialist fallback result:", isSpec);
          setIsSpecialist(isSpec);
        }
      } catch (error) {
        console.error("Error checking specialist role:", error);
        setIsSpecialist(false);
      } finally {
        setCheckingRole(false);
      }
    };
    
    if (!loading) {
      checkSpecialistStatus();
    }
  }, [user, loading]);

  // Redirect non-specialists
  useEffect(() => {
    if (!loading && !checkingRole && !isSpecialist && user) {
      setAlertMessage({
        type: "error",
        message: "Nu aveți permisiunea de a accesa panoul de specialist."
      });
      navigate("/dashboard");
    }
  }, [isSpecialist, loading, checkingRole, user, navigate]);

  // Încărcăm programările asignate specialistului
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !isSpecialist) return;
      
      setLoadingAppointments(true);
      try {
        const appointmentsRef = collection(firestore, "appointments");
        
        // Încărcăm toate programările care au fost asignate acestui specialist sau sunt în așteptare
        const q = query(
          appointmentsRef, 
          where("specialistId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        const appointmentsData: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          const apptData = doc.data() as Omit<Appointment, "id">;
          appointmentsData.push({
            id: doc.id,
            ...apptData,
            date: apptData.date as unknown as Timestamp
          });
        });
        
        // Sortăm programările după dată (cele mai recente primele)
        appointmentsData.sort((a, b) => {
          return b.date.toDate().getTime() - a.date.toDate().getTime();
        });
        
        setAppointments(appointmentsData);
        
        // Încărcăm detaliile utilizatorilor pentru fiecare programare
        const userIds = Array.from(new Set(appointmentsData.map(appt => appt.userId)));
        await fetchUserDetails(userIds);
      } catch (error) {
        console.error("Eroare la încărcarea programărilor:", error);
        setAlertMessage({
          type: "error",
          message: "A apărut o eroare la încărcarea programărilor. Vă rugăm încercați din nou."
        });
      } finally {
        setLoadingAppointments(false);
      }
    };
    
    if (isSpecialist) {
      fetchAppointments();
    }
  }, [user, isSpecialist]);

  // Încărcăm sesiunile speciale create de specialist
  useEffect(() => {
    const fetchSpecialSessions = async () => {
      if (!user || !isSpecialist) return;
      
      setLoadingSessions(true);
      try {
        const sessionsRef = collection(firestore, "specialSessions");
        
        // Încărcăm toate sesiunile create de acest specialist
        const q = query(
          sessionsRef, 
          where("specialistId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        const sessionsData: SpecialSession[] = [];
        querySnapshot.forEach((doc) => {
          const sessionData = doc.data();
          sessionsData.push({
            id: doc.id,
            ...sessionData,
            date: sessionData.date.toDate(),
            createdAt: sessionData.createdAt?.toDate()
          } as SpecialSession);
        });
        
        // Sortăm sesiunile după dată (cele mai apropiate primele)
        sessionsData.sort((a, b) => {
          return a.date.getTime() - b.date.getTime();
        });
        
        setSpecialSessions(sessionsData);
      } catch (error) {
        console.error("Eroare la încărcarea sesiunilor speciale:", error);
        setAlertMessage({
          type: "error",
          message: "A apărut o eroare la încărcarea sesiunilor speciale. Vă rugăm încercați din nou."
        });
      } finally {
        setLoadingSessions(false);
      }
    };
    
    if (isSpecialist) {
      fetchSpecialSessions();
    }
  }, [user, isSpecialist]);

  // Încărcăm serviciile disponibile și cele ale specialistului
  useEffect(() => {
    const fetchAvailableServices = async () => {
      if (!user || !isSpecialist) return;
      
      setLoadingServices(true);
      try {
        console.log("Începe încărcarea serviciilor...");
        // Încărcăm toate serviciile disponibile în platformă
        const servicesRef = collection(firestore, "services");
        const servicesSnapshot = await getDocs(servicesRef);
        
        if (!servicesSnapshot.empty) {
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Service[];
          
          console.log(`Încărcate cu succes ${servicesData.length} servicii din colecția services`);
          setAvailableServices(servicesData);
        } else {
          console.log("Nu s-au găsit servicii în colecția services. Se folosesc servicii implicite.");
          // Folosim servicii implicite dacă nu există în baza de date
          const defaultServices = [
            {
              id: "default1",
              name: "Consultație Psihologică",
              category: "Psihologie",
              duration: 60,
              price: 150,
              description: "Consultație individuală cu psiholog",
              createdAt: new Date()
            },
            {
              id: "default2",
              name: "Terapie de Cuplu",
              category: "Terapie",
              duration: 90,
              price: 200,
              description: "Ședință de terapie pentru cupluri",
              createdAt: new Date()
            },
            {
              id: "default3",
              name: "Coaching Personal",
              category: "Coaching",
              duration: 60,
              price: 180,
              description: "Coaching pentru dezvoltare personală",
              createdAt: new Date()
            },
            {
              id: "default4",
              name: "Consiliere Educațională",
              category: "Educație",
              duration: 45,
              price: 120,
              description: "Consiliere pentru elevi și studenți",
              createdAt: new Date()
            }
          ];
          setAvailableServices(defaultServices);
        }
        
        // Încărcăm serviciile specifice ale acestui specialist
        try {
          const specialistServicesRef = collection(firestore, "specialistServices");
          const q = query(specialistServicesRef, where("specialistId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const specialistServicesData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as SpecialistService[];
            
            console.log(`Încărcate cu succes ${specialistServicesData.length} servicii ale specialistului`);
            setSpecialistServices(specialistServicesData);
          } else {
            console.log("Nu s-au găsit servicii specifice pentru acest specialist");
            setSpecialistServices([]);
          }
        } catch (specialistServicesError) {
          console.error("Eroare la încărcarea serviciilor specialistului:", specialistServicesError);
          // Setăm un array gol pentru a evita probleme
          setSpecialistServices([]);
        }
      } catch (error) {
        console.error("Eroare la încărcarea serviciilor:", error);
        setAlertMessage({
          type: "error",
          message: "A apărut o eroare la încărcarea serviciilor. Vă rugăm încercați din nou."
        });
        
        // În caz de eroare, setăm servicii implicite pentru a permite continuarea
        const fallbackServices = [
          {
            id: "fallback1",
            name: "Consultație Psihologică",
            category: "Psihologie",
            duration: 60,
            price: 150,
            description: "Consultație individuală cu psiholog",
            createdAt: new Date()
          },
          {
            id: "fallback2",
            name: "Terapie Individuală",
            category: "Terapie",
            duration: 60,
            price: 170,
            description: "Ședință de terapie individuală",
            createdAt: new Date()
          }
        ];
        setAvailableServices(fallbackServices);
        setSpecialistServices([]);
        
        // Ascundem mesajul de eroare după 5 secunde pentru a nu bloca experiența
        setTimeout(() => {
          setAlertMessage(null);
        }, 5000);
      } finally {
        setLoadingServices(false);
      }
    };
    
    if (isSpecialist && activeTab === "services") {
      fetchAvailableServices();
    }
  }, [user, isSpecialist, activeTab]);

  // Funcție pentru a încărca detaliile utilizatorilor
  const fetchUserDetails = async (userIds: string[]) => {
    const userDetailsMap: {[userId: string]: UserDetails} = {};
    
    for (const userId of userIds) {
      try {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userDetailsMap[userId] = {
            displayName: userData.displayName || "Utilizator necunoscut",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            photoURL: userData.photoURL || ""
          };
        }
      } catch (error) {
        console.error(`Eroare la încărcarea detaliilor pentru utilizatorul ${userId}:`, error);
      }
    }
    
    setUserDetails(userDetailsMap);
  };

  // Load any pending specialization change requests
  useEffect(() => {
    const fetchPendingSpecializationRequests = async () => {
      if (!user || !isSpecialist) return;
      
      try {
        const requestsRef = collection(firestore, "specializationChangeRequests");
        const q = query(
          requestsRef, 
          where("userId", "==", user.uid),
          where("status", "==", "pending")
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const requests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Safely handle timestamp conversion with fallbacks
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                         data.createdAt instanceof Date ? data.createdAt : 
                         new Date(),
              submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : 
                         data.submittedAt instanceof Date ? data.submittedAt : 
                         new Date()
            };
          });
          setPendingSpecializationRequests(requests);
        }
      } catch (error) {
        console.error("Error fetching specialization change requests:", error);
      }
    };
    
    if (isSpecialist && user) {
      fetchPendingSpecializationRequests();
    }
  }, [user, isSpecialist]);

  // Load specialist profile data including specialization
  useEffect(() => {
    const fetchSpecialistProfile = async () => {
      if (!user || !isSpecialist) return;
      
      try {
        console.log("Fetching specialist profile data for:", user.uid);
        
        // First check in users collection
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Create profile object with data from user document
          const profile = {
            specialization: userData.specialization || "",
            specializationCategory: userData.specializationCategory || "",
            serviceType: userData.serviceType || ""
          };
          
          // Also check specialists collection for additional data
          const specialistDoc = await getDoc(doc(firestore, "specialists", user.uid));
          if (specialistDoc.exists()) {
            const specialistData = specialistDoc.data();
            // Merge data, preferring specialist-specific data if available
            Object.assign(profile, {
              specialization: specialistData.specialization || profile.specialization,
              specializationCategory: specialistData.specializationCategory || profile.specializationCategory,
            });
          }
          
          console.log("Loaded specialist profile:", profile);
          setSpecialistProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching specialist profile:", error);
      }
    };
    
    if (isSpecialist && user) {
      fetchSpecialistProfile();
    }
  }, [user, isSpecialist]);

  // Load specialist CV data
  useEffect(() => {
    const fetchSpecialistCV = async () => {
      if (!user || !isSpecialist) return;
      
      try {
        setLoadingCV(true);
        
        // First check in specialists collection
        const specialistDoc = await getDoc(doc(firestore, "specialists", user.uid));
        if (specialistDoc.exists()) {
          const specialistData = specialistDoc.data();
          
          // Get CV related data
          const cv = {
            experience: specialistData.experience || 0,
            education: specialistData.education || [],
            certifications: specialistData.certifications || [],
            languages: specialistData.languages || [],
            awards: specialistData.awards || [],
            publications: specialistData.publications || [],
            bio: specialistData.bio || specialistData.description || "",
            experienceDetails: specialistData.experienceDetails || []
          };
          
          setSpecialistCV(cv);
        } else {
          // If not found in specialists collection, check in users collection
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Get CV related data
            const cv = {
              experience: userData.experience || 0,
              education: userData.education || [],
              certifications: userData.certifications || [],
              languages: userData.languages || [],
              awards: userData.awards || [],
              publications: userData.publications || [],
              bio: userData.bio || userData.description || "",
              experienceDetails: userData.experienceDetails || []
            };
            
            setSpecialistCV(cv);
          } else {
            // Create an empty CV template
            setSpecialistCV({
              experience: 0,
              education: [],
              certifications: [],
              languages: [],
              awards: [],
              publications: [],
              bio: "",
              experienceDetails: []
            });
          }
        }
      } catch (error) {
        console.error("Error fetching specialist CV:", error);
        setAlertMessage({
          type: "error",
          message: "A apărut o eroare la încărcarea CV-ului. Vă rugăm încercați din nou."
        });
      } finally {
        setLoadingCV(false);
      }
    };
    
    if (isSpecialist && showCVEditForm) {
      fetchSpecialistCV();
    }
  }, [user, isSpecialist, showCVEditForm]);

  // Handle specialization change request
  const handleSpecializationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSpecializationChangeRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit specialization change request
  const submitSpecializationChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isSpecialist) return;
    
    const { newSpecialization, specializationDetails, reason } = specializationChangeRequest;
    if (!newSpecialization || !reason) {
      setAlertMessage({
        type: "error",
        message: "Te rugăm să completezi toate câmpurile obligatorii."
      });
      return;
    }
    
    setSubmittingSpecRequest(true);
    try {
      // Get current specialization data
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const currentSpecialization = userData.specialization || "";
      const currentCategory = userData.specializationCategory || "";
      
      // Submit the request
      await addDoc(collection(firestore, "specializationChangeRequests"), {
        userId: user.uid,
        userEmail: user.email,
        displayName: user.displayName || userData.displayName || "",
        oldSpecialization: currentSpecialization,
        oldCategory: currentCategory,
        newSpecialization: newSpecialization,
        newCategory: "", // Admin will review and set appropriate category
        specializationDetails: specializationDetails || "",
        reason: reason,
        status: "pending",
        submittedAt: Timestamp.now()
      });
      
      // Show success message
      setAlertMessage({
        type: "success",
        message: "Cererea ta de schimbare a specializării a fost trimisă și este în așteptare pentru aprobare."
      });
      
      // Reset form and close it
      setSpecializationChangeRequest({
        newSpecialization: "",
        specializationDetails: "",
        reason: ""
      });
      setShowSpecializationChangeForm(false);
      
      // Refresh pending requests
      const requestsRef = collection(firestore, "specializationChangeRequests");
      const q = query(
        requestsRef, 
        where("userId", "==", user.uid),
        where("status", "==", "pending")
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const requests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        }));
        setPendingSpecializationRequests(requests);
      }
      
    } catch (error) {
      console.error("Error submitting specialization change request:", error);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la trimiterea cererii de schimbare a specializării. Te rugăm să încerci din nou."
      });
    } finally {
      setSubmittingSpecRequest(false);
    }
  };

  // Funcție pentru a actualiza statusul unei programări
  const updateAppointmentStatus = async (appointmentId: string, newStatus: "confirmed" | "completed" | "cancelled") => {
    if (!user) return;
    
    setActionInProgress(appointmentId);
    
    try {
      const appointmentRef = doc(firestore, "appointments", appointmentId);
      
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date(),
        ...(specialistNotes ? { specialistNotes } : {})
      });
      
      // Actualizăm lista locală de programări
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: newStatus, ...(specialistNotes ? { specialistNotes } : {}) } 
            : appt
        )
      );
      
      setAlertMessage({
        type: "success",
        message: `Programare ${
          newStatus === "confirmed" ? "confirmată" : 
          newStatus === "completed" ? "marcată ca finalizată" : 
          "anulată"
        } cu succes!`
      });
      
      // Resetăm selecția și notele
      setSelectedAppointment(null);
      setSpecialistNotes("");
    } catch (error) {
      console.error("Eroare la actualizarea statusului programării:", error);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la actualizarea programării. Vă rugăm încercați din nou."
      });
    } finally {
      setActionInProgress(null);
      
      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
    }
  };

  // Handle image upload function
  const _handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    if (!validImageTypes.includes(file.type)) {
      setAlertMessage({
        type: "error",
        message: "Vă rugăm să încărcați o imagine în format JPEG, PNG, GIF sau WEBP."
      });
      return;
    }
    
    // Update state with the selected file
    setImageFile(file);
    
    // Create a preview URL
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
    
    // Upload to Firebase Storage when form is submitted
    // This will happen in the createSession function
  };

  // Handle CV save and close CV edit form
  const saveSpecialistCV = async (cvData: any) => {
    if (!user) return;
    
    try {
      // Upload profile picture if one is selected
      let photoURL = cvData.photoURL;
      
      // Update in both specialists and users collections to ensure data consistency
      const specialistRef = doc(firestore, "specialists", user.uid);
      const userRef = doc(firestore, "users", user.uid);
      
      // First check if specialist document exists
      const specialistDoc = await getDoc(specialistRef);
      
      if (specialistDoc.exists()) {
        // Update in specialists collection
        await updateDoc(specialistRef, {
          ...cvData,
          updatedAt: new Date()
        });
      } else {
        // Create specialist document if it doesn't exist
        await setDoc(specialistRef, {
          ...cvData,
          userId: user.uid,
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: photoURL || user.photoURL || "",
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        });
      }
      
      // Update in users collection as well
      await updateDoc(userRef, {
        ...cvData,
        updatedAt: new Date()
      });
      
      // Also update user photoURL in auth if a new profile picture was uploaded
      if (photoURL && photoURL !== user.photoURL) {
        console.log("Updating user profile picture in auth");
        try {
          // If we have updateProfile function available in the auth context
          if (refreshUserData) {
            await refreshUserData();
          }
        } catch (authUpdateError) {
          console.error("Error updating auth profile:", authUpdateError);
        }
      }
      
      setAlertMessage({
        type: "success",
        message: "CV-ul a fost actualizat cu succes!"
      });
      
      // Close form and reload CV data
      setShowCVEditForm(false);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
      
    } catch (error) {
      console.error("Error saving specialist CV:", error);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la salvarea CV-ului. Vă rugăm încercați din nou."
      });
    }
  };

  // Formatarea datei
  const formatDate = (timestamp: Timestamp | Date) => {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return new Intl.DateTimeFormat("ro-RO", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }).format(date);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON"
    }).format(price);
  };
  
  // Filtrarea programărilor în funcție de status
  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(appt => appt.status === filter);

  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Se încarcă...</span>
      </div>
    );
  }
  
  if (!isSpecialist) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h2 className="text-lg font-semibold mb-2">Acces restricționat</h2>
          <p>Nu aveți permisiunea de a accesa această pagină. Aceasta este destinată specialiștilor.</p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Înapoi la panoul de control
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="specialist-panel bg-white py-20 pt-28 md:pt-32 md:pb-24">
      {/* New Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8 shadow-lg"
           style={{ marginTop: "0" }}>
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Panou Specialist</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Bine ai venit! De aici poți gestiona programările și profilul tău profesional.
            Completează-ți CV-ul pentru a fi mai vizibil clienților.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => setShowCVEditForm(true)}
              className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2 rounded-lg font-medium flex items-center transition-all shadow-md"
            >
              <FaEdit className="mr-2" /> Editează Profilul Profesional
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Existing content */}
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-blue-100 overflow-hidden">
          {/* Panel Header with Enhanced Styling - Removed duplicate title */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-blue-100 mt-2 drop-shadow text-lg">
                  Gestionați programările și sesiunile speciale pentru clienții dvs.
                </p>
                <div className="mt-4 flex items-center bg-blue-800/50 p-2 rounded-md">
                  <FaInfoCircle className="text-blue-300 mr-2" />
                  <p className="text-sm text-blue-100">
                    Statusul pentru astăzi: {new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
              
              {/* Add CV Profile button in header */}
              <div className="mt-6 md:mt-0 flex flex-col md:flex-row items-center">
                <div className="mr-4">
                  <span className="text-sm text-blue-100">Specialist:</span>
                  <span className="ml-2 font-medium text-white">{user?.displayName || user?.email}</span>
                </div>
                <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-400 flex items-center justify-center border-2 border-white shadow-md">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <FaUser className="text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {alertMessage && (
              <div className={`mb-6 p-4 rounded-md ${
                alertMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
                "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {alertMessage.message}
              </div>
            )}

            {/* CV Edit Form Modal */}
            {showCVEditForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-4xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FaGraduationCap className="mr-2 text-blue-600" />
                      Editează CV-ul tău profesional
                    </h2>
                    <button 
                      onClick={() => setShowCVEditForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {_loadingCV ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-3 text-gray-600">Se încarcă datele CV-ului...</p>
                    </div>
                  ) : (
                    <CVEditForm initialData={specialistCV} onSave={saveSpecialistCV} onCancel={() => setShowCVEditForm(false)} />
                  )}
                </div>
              </div>
            )}

            {/* Specialization change request notice if pending */}
            {pendingSpecializationRequests.length > 0 && (
              <div className="mb-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium">Cerere de schimbare a specializării în așteptare</h3>
                </div>
                <p className="text-gray-700 mb-2">
                  Ai o cerere în așteptare pentru schimbarea specializării tale către 
                  <span className="font-medium"> {pendingSpecializationRequests[0].newSpecialization}</span>.
                </p>
                <p className="text-sm text-gray-500">
                  Trimisă pe {new Date(pendingSpecializationRequests[0].createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex flex-wrap -mb-px">
                <button
                  className={`mr-2 inline-block py-4 px-4 text-sm font-medium ${
                    activeTab === "appointments"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                  onClick={() => setActiveTab("appointments")}
                >
                  Programări
                </button>
                <button
                  className={`mr-2 inline-block py-4 px-4 text-sm font-medium ${
                    activeTab === "sessions"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                  onClick={() => setActiveTab("sessions")}
                >
                  Sesiuni Speciale
                </button>
                <button
                  className={`mr-2 inline-block py-4 px-4 text-sm font-medium ${
                    activeTab === "services"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                  onClick={() => setActiveTab("services")}
                >
                  Serviciile Mele
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            {activeTab === "appointments" && (
              <>
                <div className="mb-6 flex flex-wrap gap-2">
                  <button 
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      filter === "all" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Toate
                  </button>
                  <button 
                    onClick={() => setFilter("pending")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      filter === "pending" 
                        ? "bg-yellow-500 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    În așteptare
                  </button>
                  <button 
                    onClick={() => setFilter("confirmed")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      filter === "confirmed" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Confirmate
                  </button>
                  <button 
                    onClick={() => setFilter("completed")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      filter === "completed" 
                        ? "bg-blue-800 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Finalizate
                  </button>
                  <button 
                    onClick={() => setFilter("cancelled")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      filter === "cancelled" 
                        ? "bg-red-600 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Anulate
                  </button>
                </div>
                
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  {loadingAppointments ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-3 text-gray-600">Se încarcă programările...</p>
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800">Nu există programări</h3>
                      <p className="text-gray-600 mt-1">
                        {filter === "all" 
                          ? "Nu aveți programări asignate momentan."
                          : `Nu aveți programări cu statusul "${
                              filter === "pending" ? "în așteptare" :
                              filter === "confirmed" ? "confirmate" :
                              filter === "completed" ? "finalizate" :
                              "anulate"
                            }".`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Client
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data & Ora
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Serviciu
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acțiuni
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAppointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                    {userDetails[appointment.userId]?.photoURL ? (
                                      <img 
                                        src={userDetails[appointment.userId].photoURL} 
                                        alt={userDetails[appointment.userId].displayName} 
                                        className="h-10 w-10 rounded-full"
                                      />
                                    ) : (
                                      <FaUser className="text-gray-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {userDetails[appointment.userId]?.displayName || appointment.userName || "Client necunoscut"}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <FaEnvelope className="mr-1 h-3 w-3" />
                                      {userDetails[appointment.userId]?.email || appointment.userEmail}
                                    </div>
                                    {(userDetails[appointment.userId]?.phoneNumber || appointment.userPhone) && (
                                      <div className="text-sm text-gray-500 flex items-center">
                                        <FaPhoneAlt className="mr-1 h-3 w-3" />
                                        {userDetails[appointment.userId]?.phoneNumber || appointment.userPhone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                                <div className="text-sm text-gray-500">{appointment.time}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{appointment.service}</div>
                                {appointment.details && (
                                  <div className="text-sm text-gray-500 max-w-xs truncate">{appointment.details}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.status === "pending" 
                                    ? "bg-yellow-100 text-yellow-800"
                                    : appointment.status === "confirmed" 
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {appointment.status === "pending" && (
                                    <>
                                      În așteptare
                                    </>
                                  )}
                                  {appointment.status === "confirmed" && (
                                    <>
                                      Confirmată
                                    </>
                                  )}
                                  {appointment.status === "completed" && (
                                    <>
                                      Finalizată
                                    </>
                                  )}
                                  {appointment.status === "cancelled" && (
                                    <>
                                      Anulată
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => setSelectedAppointment(appointment)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  Detalii
                                </button>
                                
                                {appointment.status === "pending" && (
                                  <button
                                    onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                    disabled={actionInProgress === appointment.id}
                                    className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                                  >
                                    {actionInProgress === appointment.id ? "Se procesează..." : "Confirmă"}
                                  </button>
                                )}
                                
                                {appointment.status === "confirmed" && (
                                  <button
                                    onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                    disabled={actionInProgress === appointment.id}
                                    className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                                  >
                                    {actionInProgress === appointment.id ? "Se procesează..." : "Finalizează"}
                                  </button>
                                )}
                                
                                {(appointment.status === "pending" || appointment.status === "confirmed") && (
                                  <button
                                    onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                    disabled={actionInProgress === appointment.id}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  >
                                    {actionInProgress === appointment.id ? "Se procesează..." : "Anulează"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "sessions" && (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Sesiunile mele speciale</h2>
                  <button
                    onClick={() => navigate("/create-session")}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Creează o sesiune nouă
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  {loadingSessions ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-3 text-gray-600">Se încarcă sesiunile speciale...</p>
                    </div>
                  ) : specialSessions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50">
                      <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-800">Nu aveți sesiuni speciale</h3>
                      <p className="text-gray-600 mt-1">
                        Creați prima dvs. sesiune specială pentru a permite clienților să participe.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Titlu
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data & Ora
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Participanți
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tip
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acțiuni
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {specialSessions.map((session) => (
                            <tr key={session.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-start">
                                  {session.imageUrl && (
                                    <div className="flex-shrink-0 mr-3">
                                      <img 
                                        src={session.imageUrl} 
                                        alt={`Afiș pentru ${session.title}`} 
                                        className="w-20 h-20 object-cover rounded-md shadow-sm"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{session.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{session.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(session.date)}</div>
                                <div className="text-sm text-gray-500">{session.startTime} - {session.endTime}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {session.currentParticipants} / {session.capacity}
                                </div>
                                {session.price > 0 && (
                                  <div className="text-sm text-gray-500">{formatPrice(session.price)}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  session.isOnline 
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {session.isOnline ? "Online" : "Fizic"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  Detalii
                                </button>
                                <button
                                  onClick={() => handleEditSession(session)}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                >
                                  <FaEdit className="inline mr-1" /> Editează
                                </button>
                                <button
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Șterge
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "services" && (
              <>
                {/* Add specialization change request button */}
                {pendingSpecializationRequests.length === 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Specializarea ta</h3>
                      <button
                        onClick={() => setShowSpecializationChangeForm(true)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
                      >
                        <FaEdit className="mr-1" /> Solicită schimbare
                      </button>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                      <p className="text-gray-700">
                        <span className="font-medium">Specializare actuală:</span> {specialistProfile.specialization || "Nespecificată"}
                      </p>
                      {specialistProfile.specializationCategory && (
                        <p className="text-gray-700 mt-1">
                          <span className="font-medium">Categorie:</span> {specialistProfile.specializationCategory}
                        </p>
                      )}
                    </div>
                    
                    {showSpecializationChangeForm && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                        <h4 className="text-lg font-medium mb-3">Solicită schimbarea specializării</h4>
                        <form onSubmit={submitSpecializationChangeRequest}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categoria de specializare *
                            </label>
                            <select
                              name="newSpecialization"
                              value={specializationChangeRequest.newSpecialization}
                              onChange={handleSpecializationChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Selectează categoria de specializare</option>
                              {SpecializationCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Detalii despre specializare
                            </label>
                            <textarea
                              name="specializationDetails"
                              value={specializationChangeRequest.specializationDetails || ""}
                              onChange={handleSpecializationChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              placeholder="Oferă mai multe detalii despre specializarea ta (opțional)"
                            ></textarea>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Motivul schimbării *
                            </label>
                            <textarea
                              name="reason"
                              value={specializationChangeRequest.reason}
                              onChange={handleSpecializationChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              rows={4}
                              placeholder="Te rugăm să explici motivul pentru care dorești să schimbi specializarea..."
                              required
                            ></textarea>
                          </div>
                          
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                              Anulează
                            </button>
                            <button
                              type="submit"
                              disabled={submittingSpecRequest}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                              {submittingSpecRequest ? (
                                <>
                                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  Se trimite...
                                </>
                              ) : (
                                <>
                                  <FaPaperPlane className="mr-2" />
                                  Trimite cererea
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
                
                <SpecialistServices />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* CV Edit Form Modal */}
      {showCVEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800">Editează Profilul Profesional</h2>
              <button
                onClick={() => setShowCVEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <CVEditForm
                initialData={specialistCV}
                onSave={saveSpecialistCV}
                onCancel={() => setShowCVEditForm(false)}
                userId={user?.uid} // Pass userId for profile photo uploads
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Alert Message */}
      {alertMessage && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
            alertMessage.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white max-w-md`}
        >
          {alertMessage.message}
        </div>
      )}
    </div>
  );
};

export default SpecialistPanel;