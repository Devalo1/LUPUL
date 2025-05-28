import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  addDoc as _addDoc,
  deleteDoc as _deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { isUserSpecialist } from "../utils/authUtils";
import { canAccessSpecialistFeatures } from "../utils/roleUtils";
import {
  FaCalendarAlt as _FaCalendarAlt,
  FaClock as _FaClock,
  FaPhoneAlt as _FaPhoneAlt,
  FaEnvelope as _FaEnvelope,
  FaPlus as _FaPlus,
  FaInfoCircle as _FaInfoCircle,
  FaUser as _FaUser,
  FaTimes as _FaTimes,
  FaExclamationTriangle as _FaExclamationTriangle,
  FaEdit as _FaEdit,
  FaGraduationCap as _FaGraduationCap,
} from "react-icons/fa";
import _SpecialistServices from "../components/SpecialistServices";
// CVEditForm removed as unused

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
  const [_appointments, _setAppointments] = useState<Appointment[]>([]);
  const [_specialSessions, _setSpecialSessions] = useState<SpecialSession[]>(
    []
  );
  const [_loadingAppointments, setLoadingAppointments] =
    useState<boolean>(false);
  const [_loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [_userDetails, setUserDetails] = useState<{
    [userId: string]: UserDetails;
  }>({});
  const [_selectedAppointment, _setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [_specialistNotes, _setSpecialistNotes] = useState<string>("");
  const [_actionInProgress, _setActionInProgress] = useState<string | null>(
    null
  );
  const [_alertMessage, setAlertMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [_filter, _setFilter] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled"
  >("all");
  const [activeTab, _setActiveTab] = useState<
    "appointments" | "sessions" | "services"
  >("appointments");
  const [_showSessionForm, _setShowSessionForm] = useState(false);
  const [_newSession, _setNewSession] = useState<
    Omit<
      SpecialSession,
      | "createdAt"
      | "specialistId"
      | "specialistName"
      | "specialistRole"
      | "currentParticipants"
    >
  >({
    title: "",
    description: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    capacity: 5,
    price: 0,
    isOnline: false,
    location: "",
    imageUrl: "",
  });
  const [_imageFile, _setImageFile] = useState<File | null>(null);
  const [_imagePreview, _setImagePreview] = useState<string | null>(null);
  const [_uploadProgress, _setUploadProgress] = useState<number>(0);
  const [_selectedServiceType, _setSelectedServiceType] = useState<
    ServiceType | ""
  >("");
  const [_loadingServiceType, _setLoadingServiceType] = useState<boolean>(true);
  const [_savingServiceType, _setSavingServiceType] = useState<boolean>(false);
  const [_availableServices, setAvailableServices] = useState<Service[]>([]);
  const [_specialistServices, setSpecialistServices] = useState<
    SpecialistService[]
  >([]);
  const [_loadingServices, setLoadingServices] = useState<boolean>(false);
  const [_addingService, _setAddingService] = useState<boolean>(false);
  const [_selectedService, _setSelectedService] = useState<string | null>(null);
  const [_servicePrice, _setServicePrice] = useState<number>(0);
  const [_selectedSession, _setSelectedSession] =
    useState<SpecialSession | null>(null);
  const [_showSpecializationChangeForm, _setShowSpecializationChangeForm] =
    useState(false);
  const [_specializationChangeRequest, _setSpecializationChangeRequest] =
    useState({
      newSpecialization: "",
      specializationDetails: "",
      reason: "",
    });
  const [_submittingSpecRequest, _setSubmittingSpecRequest] = useState(false);
  const [_pendingSpecializationRequests, _setPendingSpecializationRequests] =
    useState<any[]>([]);
  const [_specialistProfile, _setSpecialistProfile] = useState<any>({});
  const [showCVEditForm, setShowCVEditForm] = useState(false);
  const [_specialistCV, setSpecialistCV] = useState<any>(null);
  const [_loadingCV, setLoadingCV] = useState(false);
  const [_profileData, _setProfileData] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Formular de sesiune specială - îmbunătățit cu mai multe opțiuni
  const [_sessionFormMode, _setSessionFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [_editingSession, _setEditingSession] = useState<SpecialSession | null>(
    null
  );
  const [_sessionTitle, _setSessionTitle] = useState("");
  const [_sessionDescription, _setSessionDescription] = useState("");
  const [_sessionDate, _setSessionDate] = useState("");
  const [_sessionStartTime, _setSessionStartTime] = useState("10:00");
  const [_sessionEndTime, _setSessionEndTime] = useState("11:00");
  const [_sessionLocation, _setSessionLocation] = useState("");
  const [_sessionIsOnline, _setSessionIsOnline] = useState(false);
  const [_sessionCapacity, _setSessionCapacity] = useState(10);
  const [_sessionPrice, _setSessionPrice] = useState(150);
  const [_sessionRepeat, _setSessionRepeat] = useState<
    "none" | "weekly" | "monthly"
  >("none");
  const [_sessionRepeatCount, _setSessionRepeatCount] = useState(1);
  const [_sessionImageUrl, _setSessionImageUrl] = useState("");
  const [_sessionImageFile, _setSessionImageFile] = useState<File | null>(null);
  const [_sessionImagePreview, _setSessionImagePreview] = useState<string>("");
  const [_sessionCategories, _setSessionCategories] = useState<string[]>([]);
  const [_sessionTags, _setSessionTags] = useState<string>("");
  const [_savingSession, _setSavingSession] = useState(false); // Deschide formularul pentru editarea unei sesiuni existente
  // const _handleEditSession = (session: SpecialSession) => {
  //   if (session.id) {
  //     navigate(`/edit-session/${session.id}`);
  //   }
  // };

  // Șterge o sesiune
  // const _handleDeleteSession = async (sessionId: string) => {
  //   if (
  //     !window.confirm(
  //       "Ești sigur că vrei să ștergi această sesiune? Toți participanții vor fi notificați."
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     await deleteDoc(doc(firestore, "specialSessions", sessionId));

  //     // Actualizăm starea locală
  //     _setSpecialSessions(_specialSessions.filter((s) => s.id !== sessionId));

  //     setAlertMessage({
  //       type: "success",
  //       message: "Sesiunea a fost ștearsă cu succes!",
  //     });

  //     // Ascundem mesajul după 5 secunde
  //     setTimeout(() => {
  //       setAlertMessage(null);
  //     }, 5000);
  //   } catch (err) {
  //     console.error("Eroare la ștergerea sesiunii:", err);
  //     setAlertMessage({
  //       type: "error",
  //       message: "A apărut o eroare la ștergerea sesiunii.",
  //     });
  //   }
  // };

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
          console.error(
            "Eroare la reîmprospătarea datelor de utilizator:",
            error
          );
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
        console.log(
          "Checking specialist status in SpecialistPanel for:",
          user.uid
        );

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
        message: "Nu aveți permisiunea de a accesa panoul de specialist.",
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
        const q = query(appointmentsRef, where("specialistId", "==", user.uid));

        const querySnapshot = await getDocs(q);

        const appointmentsData: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          const apptData = doc.data() as Omit<Appointment, "id">;
          appointmentsData.push({
            id: doc.id,
            ...apptData,
            date: apptData.date as unknown as Timestamp,
          });
        });

        // Sortăm programările după dată (cele mai recente primele)
        appointmentsData.sort((a, b) => {
          return b.date.toDate().getTime() - a.date.toDate().getTime();
        });

        _setAppointments(appointmentsData);

        // Încărcăm detaliile utilizatorilor pentru fiecare programare
        const userIds = Array.from(
          new Set(appointmentsData.map((appt) => appt.userId))
        );
        await fetchUserDetails(userIds);
      } catch (error) {
        console.error("Eroare la încărcarea programărilor:", error);
        setAlertMessage({
          type: "error",
          message:
            "A apărut o eroare la încărcarea programărilor. Vă rugăm încercați din nou.",
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
        const q = query(sessionsRef, where("specialistId", "==", user.uid));

        const querySnapshot = await getDocs(q);

        const sessionsData: SpecialSession[] = [];
        querySnapshot.forEach((doc) => {
          const sessionData = doc.data();
          sessionsData.push({
            id: doc.id,
            ...sessionData,
            date: sessionData.date.toDate(),
            createdAt: sessionData.createdAt?.toDate(),
          } as SpecialSession);
        });

        // Sortăm sesiunile după dată (cele mai apropiate primele)
        sessionsData.sort((a, b) => {
          return a.date.getTime() - b.date.getTime();
        });

        _setSpecialSessions(sessionsData);
      } catch (error) {
        console.error("Eroare la încărcarea sesiunilor speciale:", error);
        setAlertMessage({
          type: "error",
          message:
            "A apărut o eroare la încărcarea sesiunilor speciale. Vă rugăm încercați din nou.",
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
          const servicesData = servicesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Service[];

          console.log(
            `Încărcate cu succes ${servicesData.length} servicii din colecția services`
          );
          setAvailableServices(servicesData);
        } else {
          console.log(
            "Nu s-au găsit servicii în colecția services. Se folosesc servicii implicite."
          );
          // Folosim servicii implicite dacă nu există în baza de date
          const defaultServices = [
            {
              id: "default1",
              name: "Consultație Psihologică",
              category: "Psihologie",
              duration: 60,
              price: 150,
              description: "Consultație individuală cu psiholog",
              createdAt: new Date(),
            },
            {
              id: "default2",
              name: "Terapie de Cuplu",
              category: "Terapie",
              duration: 90,
              price: 200,
              description: "Ședință de terapie pentru cupluri",
              createdAt: new Date(),
            },
            {
              id: "default3",
              name: "Coaching Personal",
              category: "Coaching",
              duration: 60,
              price: 180,
              description: "Coaching pentru dezvoltare personală",
              createdAt: new Date(),
            },
            {
              id: "default4",
              name: "Consiliere Educațională",
              category: "Educație",
              duration: 45,
              price: 120,
              description: "Consiliere pentru elevi și studenți",
              createdAt: new Date(),
            },
          ];
          setAvailableServices(defaultServices);
        }

        // Încărcăm serviciile specifice ale acestui specialist
        try {
          const specialistServicesRef = collection(
            firestore,
            "specialistServices"
          );
          const q = query(
            specialistServicesRef,
            where("specialistId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const specialistServicesData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as SpecialistService[];

            console.log(
              `Încărcate cu succes ${specialistServicesData.length} servicii ale specialistului`
            );
            setSpecialistServices(specialistServicesData);
          } else {
            console.log(
              "Nu s-au găsit servicii specifice pentru acest specialist"
            );
            setSpecialistServices([]);
          }
        } catch (specialistServicesError) {
          console.error(
            "Eroare la încărcarea serviciilor specialistului:",
            specialistServicesError
          );
          // Setăm un array gol pentru a evita probleme
          setSpecialistServices([]);
        }
      } catch (error) {
        console.error("Eroare la încărcarea serviciilor:", error);
        setAlertMessage({
          type: "error",
          message:
            "A apărut o eroare la încărcarea serviciilor. Vă rugăm încercați din nou.",
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
            createdAt: new Date(),
          },
          {
            id: "fallback2",
            name: "Terapie Individuală",
            category: "Terapie",
            duration: 60,
            price: 170,
            description: "Ședință de terapie individuală",
            createdAt: new Date(),
          },
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
    const userDetailsMap: { [userId: string]: UserDetails } = {};

    for (const userId of userIds) {
      try {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userDetailsMap[userId] = {
            displayName: userData.displayName || "Utilizator necunoscut",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            photoURL: userData.photoURL || "",
          };
        }
      } catch (error) {
        console.error(
          `Eroare la încărcarea detaliilor pentru utilizatorul ${userId}:`,
          error
        );
      }
    }

    setUserDetails(userDetailsMap);
  };

  // Load any pending specialization change requests
  useEffect(() => {
    const fetchPendingSpecializationRequests = async () => {
      if (!user || !isSpecialist) return;

      try {
        const requestsRef = collection(
          firestore,
          "specializationChangeRequests"
        );
        const q = query(
          requestsRef,
          where("userId", "==", user.uid),
          where("status", "==", "pending")
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const requests = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Safely handle timestamp conversion with fallbacks
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate()
                : data.createdAt instanceof Date
                  ? data.createdAt
                  : new Date(),
              submittedAt: data.submittedAt?.toDate
                ? data.submittedAt.toDate()
                : data.submittedAt instanceof Date
                  ? data.submittedAt
                  : new Date(),
            };
          });
          _setPendingSpecializationRequests(requests);
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
            serviceType: userData.serviceType || "",
          };

          // Also check specialists collection for additional data
          const specialistDoc = await getDoc(
            doc(firestore, "specialists", user.uid)
          );
          if (specialistDoc.exists()) {
            const specialistData = specialistDoc.data();
            // Merge data, preferring specialist-specific data if available
            Object.assign(profile, {
              specialization:
                specialistData.specialization || profile.specialization,
              specializationCategory:
                specialistData.specializationCategory ||
                profile.specializationCategory,
            });
          }

          console.log("Loaded specialist profile:", profile);
          _setSpecialistProfile(profile);
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
        const specialistDoc = await getDoc(
          doc(firestore, "specialists", user.uid)
        );
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
            experienceDetails: specialistData.experienceDetails || [],
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
              experienceDetails: userData.experienceDetails || [],
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
              experienceDetails: [],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching specialist CV:", error);
        setAlertMessage({
          type: "error",
          message:
            "A apărut o eroare la încărcarea CV-ului. Vă rugăm încercați din nou.",
        });
      } finally {
        setLoadingCV(false);
      }
    };

    if (isSpecialist && showCVEditForm) {
      fetchSpecialistCV();
    }
  }, [user, isSpecialist, showCVEditForm]);

  return (
    <div>
      <h1>Specialist Panel</h1>
      <p>Welcome to the specialist panel</p>
    </div>
  );
};

export default SpecialistPanel;
