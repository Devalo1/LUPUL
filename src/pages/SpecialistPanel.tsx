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
  updateDoc,
  serverTimestamp,
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
import SimpleSpecialistCalendar from "../components/SimpleSpecialistCalendar";
import ScheduleManager from "../components/ScheduleManager";
import CVEditForm from "../components/CVEditForm";
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
    "appointments" | "sessions" | "services" | "calendar" | "schedule" | "cv"
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
  const [_cvData, _setCvData] = useState<any>(null);

  const navigate = useNavigate();

  // CV handlers
  // Funcție pentru sincronizarea datelor de specialist
  const syncSpecialistData = async () => {
    if (!user?.uid) return;

    try {
      // Încarcă CV-ul și sincronizează cu profilul de specialist
      const cvRef = doc(firestore, "specialistCV", user.uid);
      const cvDoc = await getDoc(cvRef);

      if (cvDoc.exists()) {
        const cvData = cvDoc.data();

        // Actualizează profilul de specialist cu datele din CV
        try {
          const specialistRef = doc(firestore, "specialists", user.uid);
          await updateDoc(specialistRef, {
            description: cvData.bio || cvData.description || "",
            name:
              cvData.personalInfo?.fullName || user.displayName || user.email,
            updatedAt: serverTimestamp(),
          });
          console.log("Specialist profile synced with CV data");
        } catch (error) {
          console.log("Specialist document might not exist yet:", error);
        }
      }
    } catch (error) {
      console.error("Error syncing specialist data:", error);
    }
  };

  // Rulează sincronizarea la încărcare
  useEffect(() => {
    if (isSpecialist && user?.uid) {
      syncSpecialistData();
    }
  }, [isSpecialist, user?.uid]);

  const handleSaveCV = async (cvData: any) => {
    try {
      setLoadingCV(true);

      if (user?.uid) {
        // Salvează CV-ul în Firestore
        const cvRef = doc(firestore, "specialistCV", user.uid);
        await updateDoc(cvRef, {
          ...cvData,
          updatedAt: serverTimestamp(),
        });

        // Sincronizează descrierea cu colecția specialists pentru programări
        try {
          const specialistRef = doc(firestore, "specialists", user.uid);
          const specialistData = {
            description: cvData.bio || cvData.description || "",
            name:
              cvData.personalInfo?.fullName || user.displayName || user.email,
            updatedAt: serverTimestamp(),
          };

          // Încearcă să actualizeze documentul de specialist
          await updateDoc(specialistRef, specialistData);
          console.log("Specialist profile updated with CV data");
        } catch (specialistError) {
          console.log(
            "Specialist document might not exist, this is normal:",
            specialistError
          );
        }

        // Sincronizează și cu colecția users pentru consistență
        try {
          const userRef = doc(firestore, "users", user.uid);
          await updateDoc(userRef, {
            description: cvData.bio || cvData.description || "",
            displayName: cvData.personalInfo?.fullName || user.displayName,
            updatedAt: serverTimestamp(),
          });
          console.log("User profile updated with CV data");
        } catch (userError) {
          console.log("Could not update user profile:", userError);
        }

        _setCvData(cvData);
        setAlertMessage({
          type: "success",
          message:
            "CV-ul a fost salvat cu succes și sincronizat cu profilul de programări!",
        });

        // Clear success message after 3 seconds
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving CV:", error);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la salvarea CV-ului. Încercați din nou.",
      });
    } finally {
      setLoadingCV(false);
    }
  };

  const handleCancelCV = () => {
    // Nu face nimic, rămâne în tab
  };
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

        let errorMessage =
          "A apărut o eroare la încărcarea sesiunilor speciale.";

        // Check if it's a permission error
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "permission-denied") {
            errorMessage =
              "Nu aveți permisiunea să accesați sesiunile speciale. Contactați administratorul.";
          } else if (error.code === "unavailable") {
            errorMessage =
              "Serviciul este temporar indisponibil. Încercați din nou în câteva momente.";
          }
        }

        setAlertMessage({
          type: "error",
          message: errorMessage,
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

      console.log("Fetching specialization requests for user:", user.uid);

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

        // Set a user-friendly error message for specialization requests
        let errorMessage =
          "A apărut o eroare la încărcarea cererilor de specializare.";

        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "permission-denied") {
            errorMessage =
              "Nu aveți permisiunea să accesați cererile de specializare. Contactați administratorul.";
          } else if (error.code === "unavailable") {
            errorMessage =
              "Serviciul este temporar indisponibil. Încercați din nou în câteva momente.";
          }
        }

        setAlertMessage({
          type: "error",
          message: errorMessage,
        });
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

  // Afișare în timpul încărcării
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Se verifică permisiunile...</p>
        </div>
      </div>
    );
  }

  // Verificare permisiuni de specialist
  if (!isSpecialist) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 text-center mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Acces restricționat
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Nu aveți permisiunea de a accesa panoul de specialist.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Înapoi la Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Panou Specialist
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestionează programările, sesiunile și serviciile tale
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                Specialist Activ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mesaje de alertă */}
      {_alertMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-4 rounded-md ${
              _alertMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {_alertMessage.type === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm">{_alertMessage.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setAlertMessage(null)}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Închide</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mesaj de ghid pentru specialiști */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Ghid rapid:</strong> Folosește tab-ul "Program
                Săptămânal" pentru a seta orele disponibile pentru programări.
                Modificările din "Editează CV" se vor reflecta automat în
                descrierea ta din sistemul de programări.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Îmbunătățit pentru vizibilitate */}
        <div className="mb-8">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-1">
            <nav className="flex flex-wrap gap-1" aria-label="Tabs">
              <button
                onClick={() => _setActiveTab("appointments")}
                className={`${
                  activeTab === "appointments"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                } flex-1 min-w-0 relative rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Programări</span>
                  {_appointments.length > 0 && (
                    <span
                      className={`ml-2 ${activeTab === "appointments" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"} py-0.5 px-2 rounded-full text-xs font-semibold`}
                    >
                      {_appointments.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => _setActiveTab("sessions")}
                className={`${
                  activeTab === "sessions"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                } flex-1 min-w-0 relative rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Sesiuni Speciale</span>
                  {_specialSessions.length > 0 && (
                    <span
                      className={`ml-2 ${activeTab === "sessions" ? "bg-green-500 text-white" : "bg-green-100 text-green-600"} py-0.5 px-2 rounded-full text-xs font-semibold`}
                    >
                      {_specialSessions.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => _setActiveTab("services")}
                className={`${
                  activeTab === "services"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                } flex-1 min-w-0 relative rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z"
                    />
                  </svg>
                  <span>Servicii</span>
                  {_specialistServices.length > 0 && (
                    <span
                      className={`ml-2 ${activeTab === "services" ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-600"} py-0.5 px-2 rounded-full text-xs font-semibold`}
                    >
                      {_specialistServices.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => _setActiveTab("calendar")}
                className={`${
                  activeTab === "calendar"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                } flex-1 min-w-0 relative rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Calendar</span>
                </div>
              </button>

              <button
                onClick={() => _setActiveTab("schedule")}
                className={`${
                  activeTab === "schedule"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                } flex-1 min-w-0 relative rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Program Săptămânal</span>
                  <span className="sm:hidden">Program</span>
                </div>
              </button>

              <button
                onClick={() => _setActiveTab("cv")}
                className={`${
                  activeTab === "cv"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                } flex-1 min-w-0 relative rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Editează CV</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "appointments" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Programările mele
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Gestionează programările și consultațiile programate
              </p>
            </div>
            <div className="p-6">
              {_loadingAppointments ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Se încarcă programările...</p>
                </div>
              ) : _appointments.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Nu aveți programări
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Nu aveți programări înregistrate momentan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {_appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {appointment.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.userName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.userEmail}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {appointment.date
                              .toDate()
                              .toLocaleDateString("ro-RO")}{" "}
                            la {appointment.time}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m2 0V9a2 2 0 012-2h2a2 2 0 012 2v8"
                              />
                            </svg>
                            {appointment.service}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : appointment.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {appointment.status === "confirmed"
                              ? "Confirmată"
                              : appointment.status === "pending"
                                ? "În așteptare"
                                : appointment.status === "completed"
                                  ? "Completată"
                                  : "Anulată"}
                          </span>
                        </div>
                      </div>
                      {appointment.details && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          <p className="font-medium mb-1">Detalii:</p>
                          <p>{appointment.details}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Sesiuni Speciale
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Creează și gestionează sesiuni speciale pentru clienți
              </p>
            </div>
            <div className="p-6">
              {_loadingSessions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Se încarcă sesiunile...</p>
                </div>
              ) : _specialSessions.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Nu aveți sesiuni speciale
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Creați prima sesiune specială pentru clienții dumneavoastră.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => _setShowSessionForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Creează prima sesiune
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => _setShowSessionForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Sesiune nouă
                    </button>
                  </div>
                  {_specialSessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {session.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {session.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <svg
                                className="mr-1 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {session.date.toLocaleDateString("ro-RO")}
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="mr-1 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {session.startTime} - {session.endTime}
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="mr-1 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              {session.currentParticipants}/{session.capacity}{" "}
                              participanți
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="mr-1 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                              </svg>
                              {session.price} RON
                            </div>
                          </div>
                          {session.location && !session.isOnline && (
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg
                                className="mr-1 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {session.location}
                            </div>
                          )}
                          {session.isOnline && (
                            <div className="mt-2 flex items-center text-sm text-blue-600">
                              <svg
                                className="mr-1 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                                />
                              </svg>
                              Sesiune online
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-4 flex space-x-2">
                          <button
                            onClick={() => {
                              _setSelectedSession(session);
                              _setShowSessionForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label={`Editează sesiunea ${session.title}`}
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Serviciile mele
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Gestionează serviciile pe care le oferi clienților
              </p>
            </div>
            <div className="p-6">
              {_loadingServices ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Se încarcă serviciile...</p>
                </div>
              ) : _specialistServices.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m2 0V9a2 2 0 012-2h2a2 2 0 012 2v8"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Nu aveți servicii configurate
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Adăugați servicii pentru a începe să primiți programări.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {_specialistServices.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {service.name}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {service.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {service.category}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {service.price} RON
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Durată: {service.duration} minute
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.isActive ? "Activ" : "Inactiv"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Calendar programări
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Vizualizează programările și gestionează disponibilitatea
              </p>
            </div>
            <div className="p-6">
              <SimpleSpecialistCalendar specialistId={user?.uid} />
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div>
            <ScheduleManager
              specialistId={user?.uid || ""}
              onScheduleUpdate={(schedule) => {
                console.log("Schedule updated:", schedule);
                // Refresh appointments or other dependent data if needed
              }}
            />
          </div>
        )}

        {activeTab === "cv" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Editează CV-ul profesional
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Actualizează informațiile din CV-ul tău pentru clienți
              </p>
            </div>
            <div className="p-6">
              <CVEditForm
                initialData={_specialistCV}
                onSave={handleSaveCV}
                onCancel={handleCancelCV}
                userId={user?.uid}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialistPanel;
