// Fix pentru avatarurile specialiștilor și navigarea între pași
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addDoc, collection, query, where, getDocs, Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import UserAppointments from "../components/UserAppointments";
import { FaCalendarAlt, FaUserMd, FaClock, FaInfoCircle, FaBookOpen, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { SpecialistCVDisplay } from "../components/CVEditForm";
import { ServiceDocument, SpecialistDocument, SpecialSessionDocument } from "../types/models";

// Using the imported types instead of redefining interfaces
interface _AppointmentDocument {
  id: string;
  time: string;
  available: boolean;
}

interface Day {
  date: string;
  formattedDate: string;
  dayName: string;
  slots: _AppointmentDocument[];
}

// Funcție utilă pentru a se asigura că URL-urile de imagini din Firebase Storage sunt formatate corect
const getValidImageUrl = (url?: string): string => {
  if (!url) return "";

  try {
    // Verificăm dacă URL-ul este valid
    new URL(url);

    // Verificăm dacă URL-ul este de tip Firebase Storage și îi lipsește parametrul alt=media
    if (url.includes("firebasestorage.googleapis.com") && !url.includes("alt=media")) {
      // Adăugăm parametrul alt=media pentru a permite încărcarea imaginii
      return `${url}${url.includes("?") ? "&" : "?"}alt=media`;
    }

    return url;
  } catch (e) {
    console.error("URL invalid:", url);
    return "";
  }
};

// Add formatDate function
const formatDate = (date: any): string => {
  if (!date) return "";

  try {
    // Handle Date objects
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }

    // Handle Firestore Timestamp
    if (typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString();
    }

    // Handle timestamp with seconds
    if (typeof date.seconds === "number") {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }

    // Try to parse as a date string
    return new Date(date).toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Helper function to get date time value
const getDateTimeValue = (date: any): number => {
  if (!date) return 0;

  try {
    if (date instanceof Date) {
      return date.getTime();
    }

    if (typeof date.toDate === "function") {
      return date.toDate().getTime();
    }

    if (typeof date.seconds === "number") {
      return date.seconds * 1000;
    }

    return new Date(date).getTime();
  } catch (error) {
    console.error("Error getting date time value:", error);
    return 0;
  }
};

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentNote, setAppointmentNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistDocument[]>([]);
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [specialSessions, setSpecialSessions] = useState<SpecialSessionDocument[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [days, setDays] = useState<Day[]>([]);

  // State pentru afișarea CV-ului specialistului
  const [showSpecialistCV, setShowSpecialistCV] = useState<string | null>(null);
  const [specialistCVData, setSpecialistCVData] = useState<any>(null);
  const [loadingCV, setLoadingCV] = useState<boolean>(false);

  // Funcție pentru încărcarea CV-ului specialistului selectat
  const loadSpecialistCV = async (specialistId: string) => {
    if (!specialistId) return;

    setLoadingCV(true);
    try {
      // Încercăm mai întâi în colecția specialists
      const specialistDoc = await getDoc(doc(db, "specialists", specialistId));

      if (specialistDoc.exists()) {
        const specialistData = specialistDoc.data();

        // Obținem imaginea de profil (verificăm ambele câmpuri posibile)
        const profileImageURL = specialistData.photoURL || specialistData.imageUrl || "";

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
          photoURL: profileImageURL,
        };

        setSpecialistCVData(cvData);
        return;
      }

      // Dacă nu există în colecția specialists, încercăm în colecția users
      const userDoc = await getDoc(doc(db, "users", specialistId));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Obținem imaginea de profil (verificăm toate câmpurile posibile)
        const profileImageURL = userData.photoURL || userData.imageUrl || userData.profilePicture || "";

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
          photoURL: profileImageURL,
        };

        setSpecialistCVData(cvData);
      } else {
        // Dacă nu găsim date, setăm un CV gol
        setSpecialistCVData({
          experience: 0,
          education: [],
          certifications: [],
          languages: [],
          awards: [],
          publications: [],
          bio: "",
          experienceDetails: [],
          photoURL: "",
        });
      }
    } catch (error) {
      console.error("Eroare la încărcarea CV-ului specialistului:", error);
      setSpecialistCVData(null);
    } finally {
      setLoadingCV(false);
    }
  };

  // Pentru debugging
  useEffect(() => {
    console.log("Step curent:", step);
    console.log("Specialist selectat:", selectedSpecialist);
    console.log("Serviciu selectat:", selectedService);
  }, [step, selectedSpecialist, selectedService]);

  // Fix avatar rendering with special wrapper component
  const _SpecialistAvatar = ({ specialist }: { specialist: SpecialistDocument }) => {
    const specialistName = specialist?.name || "Specialist";
    const initial = specialistName.charAt(0).toUpperCase();

    return (
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center">
        <span className="text-blue-700 font-bold text-lg">
          {initial}
        </span>
      </div>
    );
  };

  // Set service selection function
  const _handleServiceSelection = useCallback((serviceId: string) => {
    console.log("Service selected:", serviceId);
    setSelectedService(serviceId);
  }, []);

  // Generează un avatar din inițialele numelui
  const getInitialsAvatar = (name: string): string => {
    const initials = name?.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase()).join("") || "?";
    // Generează o culoare bazată pe nume pentru fundal
    let hash = 0;
    for (let i = 0; i < name?.length || 0; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const bgColor = `hsl(${hue}, 70%, 80%)`;
    const textColor = `hsl(${hue}, 70%, 30%)`;

    // Crează un SVG data URL cu inițiale
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${bgColor}" />
      <text x="50%" y="50%" dy=".1em" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="20" font-weight="bold">${initials.substring(0, 2)}</text>
    </svg>`;
  };

  // Fetch specialists with role "specialist" from users collection and other possible sources
  useEffect(() => {
    const fetchSpecialistsFromUsers = async () => {
      try {
        setFetchingData(true);
        const specialistsList: SpecialistDocument[] = [];
        console.log("Starting to fetch specialists...");

        // First try multiple ways to find specialists
        try {
          // First check for specialists collection with isActive filter
          const specialistsRef = collection(db, "specialists");
          const specialistsSnapshot = await getDocs(specialistsRef);

          if (!specialistsSnapshot.empty) {
            const specialistsFromCollection = specialistsSnapshot.docs
              .map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  name: data.name || "Specialist",
                  role: data.role || data.specialization || "Specialist",
                  isActive: data.isActive !== false, // Assume active if not explicitly false
                  imageUrl: data.imageUrl || getInitialsAvatar(data.name || "Specialist"),
                  photoURL: data.photoURL || null,
                  // Add required properties for Specialist interface
                  description: data.bio || data.description || "",
                  serviceType: data.serviceType || "",
                  services: data.services || [],
                  // Other possible properties
                  email: data.email || "",
                  phone: data.phone || ""
                } as SpecialistDocument;
              })
              .filter(s => s.isActive !== false); // Filter active specialists

            console.log(`Found ${specialistsFromCollection.length} specialists in specialists collection`);
            specialistsList.push(...specialistsFromCollection);
          }
        } catch (error) {
          console.error("Error fetching from specialists collection:", error);
        }

        try {
          // Check users collection for specialist role
          const usersRef = collection(db, "users");
          const usersSnapshot = await getDocs(usersRef);

          if (!usersSnapshot.empty) {
            const specialistIds = new Set(specialistsList.map(s => s.id));

            const specialistsFromUsers = usersSnapshot.docs
              .filter(doc => {
                const userData = doc.data();
                return !specialistIds.has(doc.id) && 
                       (userData.role === "specialist" || 
                        userData.role === "SPECIALIST" || 
                        userData.isSpecialist === true) &&
                       userData.isActive !== false;
              })
              .map(doc => {
                const userData = doc.data();
                const displayName = userData.displayName || userData.email || "Specialist";

                return {
                  id: doc.id,
                  name: displayName,
                  role: userData.specialization || userData.specializationCategory || userData.serviceType || "Specialist",
                  email: userData.email,
                  phone: userData.phone,
                  // Utilizăm atât photoURL cât și imageUrl pentru compatibilitate
                  photoURL: userData.photoURL || null,
                  imageUrl: userData.imageUrl || userData.photoURL || getInitialsAvatar(displayName),
                  description: userData.bio || userData.specialization || "Specialist în domeniul sănătății.",
                  serviceType: userData.serviceType || "",
                  isActive: true,
                  schedule: userData.schedule || [
                    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
                    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
                    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
                    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
                    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true }
                  ]
                };
              });

            console.log(`Found ${specialistsFromUsers.length} specialists in users collection`);
            specialistsList.push(...specialistsFromUsers);
          }
        } catch (error) {
          console.error("Error fetching specialists from users collection:", error);
        }

        if (specialistsList.length > 0) {
          console.log(`Total specialists found: ${specialistsList.length}`);
          setSpecialists(specialistsList);
        } else {
          console.warn("No specialists found in any collection");
          setError("Nu am găsit specialiști disponibili momentan. Vă rugăm să reveniți mai târziu.");
        }
      } catch (error) {
        console.error("Error fetching specialists:", error);
        setError("Eroare la încărcarea specialiștilor. Vă rugăm încercați din nou.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchSpecialistsFromUsers();
  }, []);

  // Fetch services from Firestore when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setFetchingData(true);
        const servicesRef = collection(db, "services");
        const servicesSnapshot = await getDocs(servicesRef);

        if (!servicesSnapshot.empty) {
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ServiceDocument[];

          setServices(servicesData);
          console.log("Loaded services:", servicesData.length);
        } else {
          console.log("No services found in Firestore");
          // Add fallback default services if none found
          const defaultServices = [
            {
              id: "service1",
              name: "Consultație Psihologică",
              category: "Psihologie",
              duration: 60,
              price: 150,
              description: "Consultație individuală cu psiholog"
            },
            {
              id: "service2",
              name: "Terapie de Cuplu",
              category: "Terapie",
              duration: 90,
              price: 200,
              description: "Ședință de terapie pentru cupluri"
            },
            {
              id: "service3",
              name: "Coaching Personal",
              category: "Coaching",
              duration: 60,
              price: 180,
              description: "Coaching pentru dezvoltare personală și profesională"
            }
          ];
          setServices(defaultServices as ServiceDocument[]);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Eroare la încărcarea serviciilor. Vă rugăm încercați din nou.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchServices();
  }, []);

  // Încărcăm serviciile specifice oferite de specialist când este selectat
  useEffect(() => {
    const fetchSpecialistServices = async () => {
      if (!selectedSpecialist) return;

      setFetchingData(true);
      setError(null);

      try {
        console.log(`Încărcăm serviciile specifice pentru specialistul cu ID: ${selectedSpecialist}`);

        // Căutăm doar serviciile adăugate și active ale specialistului în colecția specialistServices
        const specialistServicesRef = collection(db, "specialistServices");
        const q = query(
          specialistServicesRef, 
          where("specialistId", "==", selectedSpecialist),
          where("isActive", "==", true)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Specialistul are servicii specifice definite
          console.log(`Am găsit ${querySnapshot.docs.length} servicii specifice active pentru specialist`);

          // Folosim direct serviciile specialistului din specialistServices
          // fără a mai face căutări suplimentare în colecția services
          const specialistServicesData = querySnapshot.docs.map(doc => ({
            id: doc.data().serviceId, // Folosim serviceId original pentru compatibilitate
            name: doc.data().name,
            category: doc.data().category,
            duration: doc.data().duration,
            price: doc.data().price,
            description: doc.data().description
          }));

          // Elimin orice posibile duplicate folosind un Set bazat pe ID
          const uniqueServicesMap = new Map();
          specialistServicesData.forEach(service => {
            if (!uniqueServicesMap.has(service.id)) {
              uniqueServicesMap.set(service.id, service);
            }
          });

          const uniqueServices = Array.from(uniqueServicesMap.values());
          console.log(`După eliminarea duplicatelor: ${uniqueServices.length} servicii unice`);

          setServices(uniqueServices);
          return;
        } else {
          console.log("Nu am găsit servicii specifice active în colecția specialistServices");
        }

        // Dacă nu există servicii specifice, căutăm servicii pentru specialist prin relația directă
        const specialist = specialists.find(s => s.id === selectedSpecialist);
        if (specialist && specialist.services && specialist.services.length > 0) {
          console.log(`Specialistul are ${specialist.services.length} servicii definite direct`);

          // Convertim și filtrăm pentru a avea doar servicii valide
          const specialistDirectServices = specialist.services
            .filter((serviceId: string) => typeof serviceId === "string" && serviceId.trim() !== "");

          if (specialistDirectServices.length > 0) {
            const completeServices: ServiceDocument[] = [];

            for (const serviceId of specialistDirectServices) {
              const serviceDoc = await getDoc(doc(db, "services", serviceId));
              if (serviceDoc.exists()) {
                completeServices.push({
                  id: serviceDoc.id,
                  ...serviceDoc.data()
                } as ServiceDocument);
              }
            }

            if (completeServices.length > 0) {
              console.log(`Servicii complete din relația directă: ${completeServices.length}`);
              setServices(completeServices);
              return;
            }
          }
        }

        // Dacă nu există nici servicii specifice, nici servicii directe,
        // dar specialistul are un serviceType definit, căutăm servicii după tip
        if (specialist && specialist.serviceType) {
          console.log(`Căutăm servicii pentru serviceType: ${specialist.serviceType}`);

          const servicesRef = collection(db, "services");
          const servicesSnapshot = await getDocs(servicesRef);

          if (!servicesSnapshot.empty) {
            const normalizeText = (text: string | undefined) => {
              return (text || "").toLowerCase().trim();
            };

            const filteredByType = servicesSnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              } as ServiceDocument))
              .filter(service => {
                // Normalizăm textul pentru comparare
                const serviceType = normalizeText(specialist.serviceType);
                const serviceCategory = normalizeText(service.category);

                return serviceCategory.includes(serviceType) || 
                       serviceType.includes(serviceCategory) ||
                       normalizeText(service.name).includes(serviceType);
              });

            if (filteredByType.length > 0) {
              console.log(`Am găsit ${filteredByType.length} servicii potrivite pentru serviceType`);
              setServices(filteredByType);
              return;
            }
          }
        }

        // Cazul default: afișăm un set minimal de servicii generale
        console.log("Nicio potrivire specifică. Afișăm servicii generale.");
        const defaultServices = [
          {
            id: "default1",
            name: "Consultație Psihologică",
            category: "Psihologie",
            duration: 60,
            price: 150,
            description: "Consultație psihologică individuală"
          },
          {
            id: "default2", 
            name: "Terapie de Cuplu",
            category: "Terapie",
            duration: 90,
            price: 200,
            description: "Ședință de terapie pentru cupluri"
          },
          {
            id: "default3",
            name: "Coaching Personal",
            category: "Coaching",
            duration: 60,
            price: 180,
            description: "Coaching pentru dezvoltare personală"
          }
        ];

        setServices(defaultServices as ServiceDocument[]);
      } catch (error) {
        console.error("Eroare la încărcarea serviciilor pentru specialist:", error);
        setError("Eroare la încărcarea serviciilor pentru specialist. Vă rugăm încercați din nou.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchSpecialistServices();
  }, [selectedSpecialist, specialists]);

  // Încărcă sesiunile speciale pentru un specialist când este selectat
  useEffect(() => {
    const fetchSpecialSessions = async () => {
      if (!selectedSpecialist) return;

      setLoadingSessions(true);
      try {
        const sessionsRef = collection(db, "specialSessions");
        const q = query(
          sessionsRef, 
          where("specialistId", "==", selectedSpecialist)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const sessionsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
          })) as SpecialSessionDocument[];

          // Sortăm sesiunile după dată (cele mai apropiate primele)
          sessionsData.sort((a, b) => {
            return getDateTimeValue(a.date) - getDateTimeValue(b.date);
          });

          setSpecialSessions(sessionsData);
        } else {
          setSpecialSessions([]);
        }
      } catch (error) {
        console.error("Eroare la încărcarea sesiunilor speciale:", error);
        setSpecialSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSpecialSessions();
  }, [selectedSpecialist]);

  // Funcție pentru înscrierea la o sesiune specială
  const enrollInSpecialSession = async (session: SpecialSessionDocument) => {
    if (!user) {
      setError("Trebuie să fiți autentificat pentru a vă înscrie la o sesiune.");
      return;
    }

    setLoading(true);
    setError(null); // Resetăm starea de eroare la început

    try {
      console.log("Începe procesul de înscriere pentru sesiunea:", session.id);

      // Verificăm dacă mai sunt locuri disponibile
      if (session.currentParticipants >= session.capacity) {
        setError("Ne pare rău, dar această sesiune a atins numărul maxim de participanți.");
        return;
      }

      // Verificăm dacă utilizatorul este deja înscris
      const enrollmentsRef = collection(db, "sessionEnrollments");
      const q = query(
        enrollmentsRef,
        where("sessionId", "==", session.id),
        where("userId", "==", user.uid)
      );

      const existingEnrollment = await getDocs(q);

      if (!existingEnrollment.empty) {
        setError("Sunteți deja înscris la această sesiune.");
        return;
      }

      // Obținem mai multe detalii despre utilizator din colecția users
      let userData = {};
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        userData = userDoc.exists() ? userDoc.data() : {};
        console.log("Date utilizator preluate cu succes");
      } catch (userError) {
        console.warn("Nu s-au putut prelua detaliile utilizatorului:", userError);
        // Continuăm fără datele suplimentare ale utilizatorului
      }

      // Pregătim datele participantului cu informații mai detaliate
      const participantData = {
        sessionId: session.id,
        userId: user.uid,
        userName: user.displayName || (userData as any).displayName || "Participant",
        userEmail: user.email || (userData as any).email,
        userPhone: (userData as any).phone || "",
        profilePicture: user.photoURL || (userData as any).photoURL || "",
        specialistId: session.specialistId,
        specialistName: session.specialistName,
        sessionTitle: session.title,
        // Asigurăm-ne că data este un Timestamp valid
        sessionDate: session.date instanceof Date 
          ? Timestamp.fromDate(session.date) 
          : session.date || Timestamp.now(),
        sessionTime: `${session.startTime} - ${session.endTime}`,
        status: "confirmed",
        createdAt: Timestamp.now(),
        additionalInfo: appointmentNote || "",
        notificationsEnabled: true
      };

      console.log("Date participant pregătite:", participantData.userName);

      // Adăugăm înregistrarea în baza de date - pas 1
      let enrollmentRef;
      try {
        enrollmentRef = await addDoc(collection(db, "sessionEnrollments"), participantData);
        console.log("Înscriere adăugată în baza de date cu ID:", enrollmentRef.id);
      } catch (enrollmentError) {
        console.error("Eroare la adăugarea înscrierii:", enrollmentError);
        throw new Error("Nu s-a putut salva înscrierea. Vă rugăm să încercați din nou.");
      }

      // Actualizăm numărul de participanți în sesiune - pas 2
      const sessionRef = doc(db, "specialSessions", session.id);

      try {
        // Obținem lista actuală de participanți (dacă există)
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists()) {
          throw new Error("Sesiunea nu mai există sau a fost ștearsă.");
        }

        const sessionData = sessionDoc.data();
        const participants = sessionData.participants || [];

        // Adăugăm noul participant la listă
        const newParticipant = {
          id: enrollmentRef.id,
          userId: user.uid,
          name: participantData.userName,
          email: participantData.userEmail,
          phone: participantData.userPhone,
          profilePicture: participantData.profilePicture,
          enrollmentDate: Timestamp.now(),
          status: "confirmed"
        };

        participants.push(newParticipant);

        // Actualizăm sesiunea cu lista de participanți și numărul total
        await updateDoc(sessionRef, {
          currentParticipants: (sessionData.currentParticipants || 0) + 1,
          participants: participants,
          lastUpdated: Timestamp.now()
        });

        console.log("Sesiune actualizată cu succes, participanți:", participants.length);
      } catch (sessionUpdateError) {
        console.error("Eroare la actualizarea sesiunii:", sessionUpdateError);

        // Încercăm o abordare mai simplă dacă actualizarea complexă eșuează
        try {
          await updateDoc(sessionRef, {
            currentParticipants: session.currentParticipants + 1,
            lastUpdated: Timestamp.now()
          });
          console.log("Actualizare simplificată a sesiunii reușită");
        } catch (simpleUpdateError) {
          console.error("Eroare și la actualizarea simplificată:", simpleUpdateError);
          // Nu aruncăm excepție aici, continuăm cu înscrierea
        }
      }

      // Adăugăm și un eveniment în calendar pentru specialistul care a creat sesiunea - pas 3
      try {
        const sessionDate = session.date instanceof Date 
          ? session.date 
          : (session.date?.toDate ? session.date.toDate() : new Date());

        const calendarEvent = {
          title: `Sesiune: ${session.title}`,
          specialistId: session.specialistId,
          participantId: user.uid,
          participantName: participantData.userName,
          participantEmail: participantData.userEmail,
          participantPhone: participantData.userPhone,
          date: Timestamp.fromDate(sessionDate),
          startTime: session.startTime,
          endTime: session.endTime,
          location: session.location || (session.isOnline ? "Online" : "La cabinet"),
          type: "specialSession",
          sessionId: session.id,
          enrollmentId: enrollmentRef.id,
          notes: "Sesiune specială cu participanți multipli",
          createdAt: Timestamp.now()
        };

        await addDoc(collection(db, "calendar"), calendarEvent);
        console.log("Eveniment adăugat în calendar cu succes");
      } catch (calendarError) {
        console.error("Eroare la adăugarea în calendar:", calendarError);
        // Nu oprim procesul dacă adăugarea în calendar eșuează
      }

      // Actualizăm starea locală a sesiunilor
      setSpecialSessions(specialSessions.map(s => 
        s.id === session.id 
          ? { ...s, currentParticipants: s.currentParticipants + 1 } 
          : s
      ));

      console.log("Procesul de înscriere finalizat cu succes!");
      alert(`V-ați înscris cu succes la sesiunea "${session.title}"!`);
    } catch (error: any) {
      console.error("Eroare generală la înscrierea în sesiunea specială:", error);
      setError(`A apărut o eroare la înscrierea în sesiune: ${error.message || "Vă rugăm încercați din nou."}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate available days based on specialist schedule
  const generateDays = (): Day[] => {
    const generatedDays: Day[] = [];
    const today = new Date();

    const selectedSpecialistObj = specialists.find(s => s.id === selectedSpecialist);
    const specialistSchedule = selectedSpecialistObj?.schedule || [];

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7

      const scheduleForDay = specialistSchedule.find((s: any) => s.dayOfWeek === dayOfWeek && s.available);

      if (scheduleForDay) {
        const formattedDate = date.toISOString().split("T")[0];

        const slots: _AppointmentDocument[] = [];
        const startHour = parseInt(scheduleForDay.startTime.split(":")[0]);
        const endHour = parseInt(scheduleForDay.endTime.split(":")[0]);

        for (let hour = startHour; hour < endHour; hour++) {
          slots.push({
            id: `${formattedDate}-${hour}`,
            time: `${hour.toString().padStart(2, "0")}:00`,
            available: Math.random() > 0.3 // Just for demo. In production, check against existing appointments
          });
        }

        generatedDays.push({
          date: formattedDate,
          formattedDate: new Date(formattedDate).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }),
          dayName: new Date(formattedDate).toLocaleDateString("ro-RO", { weekday: "long" }),
          slots
        });
      }
    }

    return generatedDays;
  };

  // Update days when specialist changes
  useEffect(() => {
    if (selectedSpecialist) {
      setDays(generateDays());
    } else {
      setDays([]);
    }
  }, [selectedSpecialist, specialists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        setError("Trebuie să fiți autentificat pentru a face o programare.");
        return;
      }

      const specialist = specialists.find(s => s.id === selectedSpecialist);
      const service = services.find(s => s.id === selectedService);
      const dateObj = new Date(`${selectedDate}T${selectedTime}`);
      const endTimeDate = new Date(dateObj);

      // Calculate end time based on service duration
      const duration = service?.duration || 60;
      endTimeDate.setMinutes(endTimeDate.getMinutes() + duration);

      const endTime = `${endTimeDate.getHours().toString().padStart(2, "0")}:${
        endTimeDate.getMinutes().toString().padStart(2, "0")}`;

      const appointmentData = {
        userId: user.uid,
        userName: user.displayName || "Utilizator",
        userEmail: user.email,
        specialistId: selectedSpecialist,
        specialistName: specialist?.name,
        serviceType: specialist?.role,
        serviceName: service?.name || "Consultație",
        date: Timestamp.fromDate(dateObj),
        startTime: selectedTime,
        endTime: endTime,
        status: "scheduled",
        notes: appointmentNote,
        createdAt: Timestamp.now(),
        price: service?.price || 150
      };

      await addDoc(collection(db, "appointments"), appointmentData);
      console.log("Programare salvată:", appointmentData);
      setStep(4);
    } catch (error) {
      console.error("Eroare la salvarea programării:", error);
      setError("A apărut o eroare la salvarea programării. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const renderSpecialistSelection = () => {
    if (fetchingData) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă specialiștii...</p>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaUserMd className="mr-2 text-blue-500" />
          Alege un specialist
        </h2>

        {specialists.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Nu există specialiști disponibili momentan. Vă rugăm să reveniți mai târziu.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map((specialist, idx) => {
              // Generare culoare unică pentru fiecare specialist
              const name = specialist?.name || "Specialist";
              const initial = name.charAt(0).toUpperCase();

              return (
                <div
                  key={specialist?.id || `specialist-${idx}`}
                  className={`border rounded-lg p-4 cursor-pointer transition shadow-sm hover:shadow-md ${
                    selectedSpecialist === specialist?.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => {
                    console.log("Selectat specialist:", specialist?.id, name);
                    setSelectedSpecialist(specialist?.id || null);
                    // Resetăm afișarea CV-ului când se schimbă specialistul
                    if (showSpecialistCV === specialist?.id) {
                      setShowSpecialistCV(null);
                    }
                  }}
                >
                  <div className="flex items-center mb-3">
                    {specialist?.imageUrl || specialist?.photoURL ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={getValidImageUrl(specialist?.photoURL || specialist?.imageUrl)} 
                          alt={name}
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            // Dacă imaginea nu se încarcă, afișăm inițialele
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-200"><span class="text-blue-800 font-bold text-lg">${initial}</span></div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-200 flex items-center justify-center">
                        <span className="text-blue-800 font-bold text-lg">
                          {initial}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <h3 className="font-medium">{name}</h3>
                      <p className="text-sm text-gray-600">{specialist?.role || "Specialist"}</p>
                      {specialist?.serviceType && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          Serviciu: {specialist.serviceType}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{specialist?.description || "Specialist în domeniul sănătății și stării de bine."}</p>

                  {/* Buton pentru afișarea CV-ului specialistului */}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Previne propagarea click-ului la parent
                        if (showSpecialistCV === specialist?.id) {
                          setShowSpecialistCV(null);
                        } else {
                          setShowSpecialistCV(specialist?.id || null);
                          loadSpecialistCV(specialist?.id || "");
                        }
                      }}
                      className="text-blue-600 text-sm flex items-center hover:text-blue-800 transition"
                    >
                      {showSpecialistCV === specialist?.id ? (
                        <>
                          <FaAngleUp className="mr-1" /> Ascunde CV
                        </>
                      ) : (
                        <>
                          <FaAngleDown className="mr-1" /> Vezi detalii profesionale
                        </>
                      )}
                    </button>
                  </div>

                  {/* Afișare CV dacă este selectat */}
                  {showSpecialistCV === specialist?.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {loadingCV ? (
                        <div className="flex justify-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : specialistCVData ? (
                        <SpecialistCVDisplay cvData={specialistCVData} specialist={specialist} />
                      ) : (
                        <p className="text-gray-500 italic text-center p-4">
                          Nu există informații detaliate despre acest specialist.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderServiceSelection = () => {
    if (fetchingData) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă serviciile...</p>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaBookOpen className="mr-2 text-blue-500" />
          Alege un serviciu
        </h2>

        {services.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Nu există servicii disponibile pentru acest specialist. Vă rugăm să alegeți alt specialist sau reveniți mai târziu.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <div
                key={service.id || `service-${index}`}
                className={`border rounded-lg p-4 cursor-pointer transition shadow-sm hover:shadow-md ${
                  selectedService === service.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => {
                  console.log("Service selected:", service.id);
                  setSelectedService(service.id);
                }}
              >
                <h3 className="font-medium mb-2">{service.name}</h3>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Durată: {service.duration} min</span>
                  <span className="font-semibold text-blue-600">{new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(service.price)}</span>
                </div>
                <p className="text-sm text-gray-700">{service.description || "Serviciu oferit de specialist"}</p>
                {service.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {service.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDateSelection = () => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-500" />
          Alege o dată
        </h2>
        {days.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Nu există zile disponibile pentru programare. Vă rugăm să alegeți alt specialist.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {days.map((day) => (
              <button
                key={day.date}
                className={`border p-3 rounded-lg text-left transition ${
                  selectedDate === day.date
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <p className="text-sm text-gray-500 capitalize">{day.dayName}</p>
                <p className="font-medium">{day.formattedDate}</p>
                <p className="text-xs mt-1 text-gray-500">
                  {day.slots.filter(slot => slot.available).length} intervale disponibile
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTimeSelection = () => {
    const selectedDay = days.find(day => day.date === selectedDate);

    if (!selectedDay) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaClock className="mr-2 text-blue-500" />
          Alege o oră
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {selectedDay.slots.map((slot) => (
            <button
              key={slot.id}
              disabled={!slot.available}
              className={`p-3 rounded-lg text-center transition ${
                !slot.available
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedTime === slot.time
                    ? "bg-blue-500 text-white"
                    : "border border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => slot.available && setSelectedTime(slot.time)}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAppointmentDetails = () => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaInfoCircle className="mr-2 text-blue-500" />
          Detalii programare
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observații (opțional)
            </label>
            <textarea
              value={appointmentNote}
              onChange={(e) => setAppointmentNote(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Adaugă orice informații relevante pentru specialist..."
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const specialist = specialists.find(s => s.id === selectedSpecialist);
    const service = services.find(s => s.id === selectedService);
    const day = days.find(d => d.date === selectedDate);

    return (
      <div className="mb-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Rezumatul programării</h2>
        <div className="space-y-3">
          <div className="flex">
            <span className="font-medium w-32">Specialist:</span>
            <span>{specialist?.name}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Serviciu:</span>
            <span>{service?.name}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Data:</span>
            <span>{day?.formattedDate}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Ora:</span>
            <span>{selectedTime}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Durată:</span>
            <span>{service?.duration} minute</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Preț:</span>
            <span>{service?.price} RON</span>
          </div>
          {appointmentNote && (
            <div className="flex">
              <span className="font-medium w-32">Observații:</span>
              <span>{appointmentNote}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSuccessMessage = () => {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Programare confirmată!</h2>
        <p className="text-gray-600 mb-6">Am trimis detaliile programării pe email-ul tău.</p>
        <button
          onClick={() => {
            setStep(1);
            setSelectedSpecialist(null);
            setSelectedService(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setAppointmentNote("");
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Fă o altă programare
        </button>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            {renderSpecialistSelection()}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  console.log("Trecere la pasul 2");
                  setStep(2);
                }}
                disabled={!selectedSpecialist || fetchingData || specialists.length === 0}
                className={`px-6 py-2 rounded transition ${
                  selectedSpecialist && !fetchingData && specialists.length > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continuă
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            {renderServiceSelection()}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  console.log("Înapoi la pasul 1");
                  setStep(1);
                }}
                className="px-6 py-2 text-blue-600 hover:underline transition"
              >
                Înapoi
              </button>
              <button
                onClick={() => {
                  console.log("Trecere la pasul 3, serviciu selectat:", selectedService);
                  setStep(3);
                }}
                disabled={!selectedService}
                className={`px-6 py-2 rounded transition ${
                  selectedService
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continuă
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            {renderDateSelection()}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  console.log("Înapoi la pasul 2");
                  setStep(2);
                }}
                className="px-6 py-2 text-blue-600 hover:underline transition"
              >
                Înapoi
              </button>
              <button
                onClick={() => {
                  console.log("Trecere la pasul 4, dată selectată:", selectedDate);
                  setStep(4);
                }}
                disabled={!selectedDate || days.length === 0}
                className={`px-6 py-2 rounded transition ${
                  selectedDate && days.length > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continuă
              </button>
            </div>
          </>
        );
      case 4:
        return (
          <>
            {renderTimeSelection()}
            {selectedTime && renderAppointmentDetails()}
            {selectedTime && renderSummary()}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  console.log("Înapoi la pasul 3");
                  setStep(3);
                }}
                className="px-6 py-2 text-blue-600 hover:underline transition"
              >
                Înapoi
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedTime || loading}
                className={`px-6 py-2 rounded transition ${
                  selectedTime && !loading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se procesează...
                  </span>
                ) : "Confirmă programare"}
              </button>
            </div>
          </>
        );
      case 5:
        return renderSuccessMessage();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Programează o Ședință</h1>
          <p className="text-gray-600 mb-8 border-b pb-4">Completează formularul pentru a programa o ședință cu unul din specialiștii noștri.</p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div key={`step-${i}`} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= i ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {i}
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    {i === 1 && "Specialist"}
                    {i === 2 && "Serviciu"}
                    {i === 3 && "Data"}
                    {i === 4 && "Ora"}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative h-1 mt-3">
              <div className="absolute h-1 bg-gray-200 top-0 left-0 right-0"></div>
              <div 
                className="absolute h-1 bg-blue-500 top-0 left-0" 
                style={{ width: `${(step - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg">
            {renderStepContent()}
          </div>
        </div>

        {/* Sesiuni speciale - dacă este selectat un specialist */}
        {selectedSpecialist && specialSessions.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800">
              <FaBookOpen className="mr-2 text-blue-500" />
              Sesiuni Speciale Organizate
            </h2>
            <p className="text-gray-600 mb-6">
              Specialistul organizează următoarele sesiuni speciale la care te poți înscrie:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loadingSessions ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                specialSessions.map(session => (
                  <div key={session.id} className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow">
                    {session.imageUrl && (
                      <div className="h-48 overflow-hidden bg-gray-200">
                        <img 
                          src={getValidImageUrl(session.imageUrl)} 
                          alt={session.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold">{session.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.isOnline 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {session.isOnline ? "Online" : "Fizic"}
                        </span>
                      </div>

                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-700">{session.description}</p>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 h-3 w-3" />
                            {formatDate(session.date instanceof Date 
                              ? session.date 
                              : (session.date?.toDate ? session.date.toDate() : new Date()))}
                          </div>
                          <div className="flex items-center mt-1">
                            <FaClock className="mr-2 h-3 w-3" />
                            {session.startTime} - {session.endTime}
                          </div>
                          {session.location && (
                            <div className="mt-1">
                              <span className="font-medium">Locație:</span> {session.location}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium">Participanți:</span>
                            <span className="ml-1 text-sm">
                              {session.currentParticipants}/{session.capacity}
                            </span>
                          </div>
                          {session.price > 0 && (
                            <span className="text-lg font-semibold">{session.price} RON</span>
                          )}
                        </div>

                        <button
                          onClick={() => enrollInSpecialSession(session)}
                          disabled={loading || session.currentParticipants >= session.capacity || !user}
                          className={`w-full mt-4 py-2 px-4 rounded-md text-white ${
                            loading 
                              ? "bg-gray-400 cursor-not-allowed" 
                              : session.currentParticipants >= session.capacity
                                ? "bg-red-400 cursor-not-allowed"
                                : !user
                                  ? "bg-gray-500 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {loading
                            ? "Se procesează..." 
                            : session.currentParticipants >= session.capacity
                              ? "Locuri epuizate"
                              : !user
                                ? "Conectează-te pentru înscriere"
                                : "Înscrie-te"}
                        </button>

                        {session.currentParticipants >= session.capacity && (
                          <p className="text-xs text-center text-red-600 mt-1">
                            Această sesiune a atins numărul maxim de participanți
                          </p>
                        )}

                        {!user && (
                          <p className="text-xs text-center text-gray-600 mt-1">
                            Trebuie să fii autentificat pentru a te înscrie
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user && step !== 5 && (
          <UserAppointments />
        )}

        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">De ce să programezi o ședință cu noi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50 shadow-sm">
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-800">Specialiști Certificați</h3>
              <p className="text-gray-600 text-sm">Echipa noastră este formată din specialiști cu experiență vastă în domeniul lor.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50 shadow-sm">
              <div className="rounded-full bg-green-100 p-4 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-800">Programare Rapidă</h3>
              <p className="text-gray-600 text-sm">Procesul de programare este simplu și rapid, cu confirmare instantă.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50 shadow-sm">
              <div className="rounded-full bg-purple-100 p-4 mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-800">Asistență Dedicată</h3>
              <p className="text-gray-600 text-sm">Oferim suport continuu și răspunsuri la toate întrebările tale.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Ai nevoie de ajutor? Contactează-ne la <span className="text-blue-600">lupulsicorbul@gmail.com</span> sau sună la <span className="text-blue-600">0734 931 703</span></p>
        </div>
      </div>
    </div>
  );
};

export default Appointments;