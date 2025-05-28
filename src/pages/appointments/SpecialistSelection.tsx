import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserMd,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaEdit,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { AppointmentState } from "../../types/appointment";
import SpecialistAvatar from "../../components/SpecialistAvatar";
import "../../styles/AppointmentSteps.css";

interface Specialist {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  photoURL?: string;
  description?: string;
  serviceType?: string;
  schedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
  email?: string;
  phone?: string;
  services?: string[];
  isActive?: boolean; // Proprietate adăugată pentru a rezolva eroarea TS2339
}

const SpecialistSelection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(
    null
  );
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Retrieve existing appointment data from location state or sessionStorage
  const getAppointmentState = (): AppointmentState => {
    // Try to get from location state first
    const stateData = location.state?.appointmentData;
    if (stateData) return stateData;

    // Try to get from sessionStorage
    const storedData = sessionStorage.getItem("appointmentData");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error(
          "Error parsing appointment data from session storage:",
          e
        );
      }
    }

    // Return default empty state
    return {
      specialistId: null,
      serviceId: null,
      date: null,
      time: null,
      note: "",
    };
  };

  const [appointmentData, setAppointmentData] = useState<AppointmentState>(
    getAppointmentState()
  );

  // Save appointment data to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("appointmentData", JSON.stringify(appointmentData));
  }, [appointmentData]);

  // Initialize with selected specialist if exists in appointment data
  useEffect(() => {
    if (appointmentData.specialistId) {
      setSelectedSpecialist(appointmentData.specialistId);
    }
  }, [appointmentData.specialistId]);

  // Fetch specialists
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setFetchingData(true);
        const specialistsList: Specialist[] = [];
        console.log("Fetching specialists...");

        // First try specialists collection
        try {
          const specialistsRef = collection(db, "specialists");
          const specialistsSnapshot = await getDocs(specialistsRef);

          console.log(
            `Specialists collection raw count: ${specialistsSnapshot.docs.length}`
          );

          if (!specialistsSnapshot.empty) {
            // Log complete data pentru debugging
            console.log(
              "Raw specialists data:",
              specialistsSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  name: data.name || data.displayName || "No name",
                  hasImageUrl: !!data.imageUrl,
                  hasPhotoURL: !!data.photoURL,
                  isActive: data.isActive,
                  ...data,
                };
              })
            );

            const specialistsFromCollection = specialistsSnapshot.docs
              .map((doc) => {
                const data = doc.data();

                // Verificăm toate câmpurile relevante pentru debugging
                console.log(`Specialist [${doc.id}] raw data:`, data);

                // Logging fiecare specialist individual pentru debugging
                console.log(`Specialist [${doc.id}] processed fields:`, {
                  name:
                    data.name || data.displayName || data.fullName || "No name",
                  imageUrl:
                    data.photoURL ||
                    data.imageUrl ||
                    data.avatarURL ||
                    "No image",
                  role:
                    data.role ||
                    data.specialization ||
                    data.serviceType ||
                    "No role",
                  isActive: data.isActive !== false, // true dacă nu e explicit false
                });

                // Convertim și curățăm URL-ul imaginii dacă există
                let imageUrl =
                  data.photoURL || data.imageUrl || data.avatarURL || "";
                let photoURL =
                  data.photoURL || data.imageUrl || data.avatarURL || "";

                // Verificăm dacă URL-urile sunt valide și pot fi afișate
                if (imageUrl && typeof imageUrl === "string") {
                  console.log(`Original imageUrl for ${doc.id}:`, imageUrl);

                  // Adăugăm token-ul alt_media pentru URL-uri Firebase Storage dacă nu există
                  if (
                    imageUrl.includes("firebasestorage.googleapis.com") &&
                    !imageUrl.includes("alt=media")
                  ) {
                    imageUrl = `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}alt=media`;
                  }

                  // Fix incorrect bucket domain if needed
                  if (imageUrl.includes("lupulcorbul.appspot.com")) {
                    imageUrl = imageUrl.replace(
                      "lupulcorbul.appspot.com",
                      "lupulcorbul.firebasestorage.app"
                    );
                  }

                  console.log(`Processed imageUrl for ${doc.id}:`, imageUrl);
                }

                // Procesăm și photoURL în același mod
                if (photoURL && typeof photoURL === "string") {
                  if (
                    photoURL.includes("firebasestorage.googleapis.com") &&
                    !photoURL.includes("alt=media")
                  ) {
                    photoURL = `${photoURL}${photoURL.includes("?") ? "&" : "?"}alt=media`;
                  }

                  // Fix incorrect bucket domain if needed
                  if (photoURL.includes("lupulcorbul.appspot.com")) {
                    photoURL = photoURL.replace(
                      "lupulcorbul.appspot.com",
                      "lupulcorbul.firebasestorage.app"
                    );
                  }
                }

                // Generăm un specialist obiect complet cu valori implicite pentru toate câmpurile necesare
                return {
                  id: doc.id,
                  name:
                    data.name ||
                    data.displayName ||
                    data.fullName ||
                    "Specialist",
                  role:
                    data.role ||
                    data.specialization ||
                    data.serviceType ||
                    "Specialist",
                  imageUrl: imageUrl,
                  photoURL: photoURL, // Adăugăm explicit photoURL
                  description:
                    data.description ||
                    data.bio ||
                    "Specialist în domeniul sănătății",
                  serviceType:
                    data.serviceType || data.specializationCategory || "",
                  isActive: data.isActive !== false, // true dacă nu e explicit false
                  email: data.email || "",
                  phone: data.phone || "",
                  services: data.services || [],
                } as Specialist;
              })
              // Păstrăm doar specialiștii activi, dar logăm câți au fost excluși
              .filter((s) => {
                const isActive = s.isActive !== false;
                if (!isActive)
                  console.log(
                    `Excluding inactive specialist: ${s.id} - ${s.name}`
                  );
                return isActive;
              });

            console.log(
              `Found ${specialistsFromCollection.length} active specialists in collection`
            );
            specialistsList.push(...specialistsFromCollection);
          } else {
            console.log("Specialists collection is empty");
          }
        } catch (error) {
          console.error("Error fetching specialists collection:", error);
        }

        // Try users collection for specialists
        try {
          const usersRef = collection(db, "users");
          const usersSnapshot = await getDocs(usersRef);

          console.log(
            `Users collection raw count: ${usersSnapshot.docs.length}`
          );

          if (!usersSnapshot.empty) {
            // Creăm un set cu ID-uri ale specialiștilor existenți pentru a evita duplicatele
            const specialistIds = new Set(specialistsList.map((s) => s.id));
            console.log("Existing specialist IDs:", Array.from(specialistIds));

            // Filtrez utilizatorii pentru a găsi specialiști
            const potentialSpecialists = usersSnapshot.docs.filter((doc) => {
              const userData = doc.data();
              const isSpecialist =
                userData.role === "specialist" ||
                userData.role === "SPECIALIST" ||
                userData.isSpecialist === true;

              if (isSpecialist) {
                console.log(
                  `Found specialist user: ${doc.id}, Name: ${userData.displayName || userData.name || "No name"}`
                );
              }

              return (
                isSpecialist &&
                !specialistIds.has(doc.id) &&
                userData.isActive !== false
              );
            });

            console.log(
              `Found ${potentialSpecialists.length} potential specialists in users collection`
            );

            const specialistsFromUsers = potentialSpecialists.map((doc) => {
              const userData = doc.data();

              // Logging pentru debugging
              console.log(`User specialist [${doc.id}] raw data:`, userData);

              console.log(`User specialist [${doc.id}] processed fields:`, {
                name:
                  userData.displayName ||
                  userData.name ||
                  userData.email ||
                  "No name",
                imageUrl:
                  userData.photoURL ||
                  userData.avatarURL ||
                  userData.imageUrl ||
                  "No image",
                role:
                  userData.specialization ||
                  userData.serviceType ||
                  userData.role ||
                  "Specialist",
              });

              // Procesăm URL-ul imaginii similar cu codul anterior
              let imageUrl =
                userData.photoURL ||
                userData.avatarURL ||
                userData.imageUrl ||
                "";
              let photoURL =
                userData.photoURL ||
                userData.avatarURL ||
                userData.imageUrl ||
                "";

              if (imageUrl && typeof imageUrl === "string") {
                console.log(
                  `Original imageUrl for user specialist ${doc.id}:`,
                  imageUrl
                );

                // Adăugăm token-ul alt_media pentru URL-uri Firebase Storage dacă nu există
                if (
                  imageUrl.includes("firebasestorage.googleapis.com") &&
                  !imageUrl.includes("alt=media")
                ) {
                  imageUrl = `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}alt=media`;
                }

                // Fix incorrect bucket domain if needed
                if (imageUrl.includes("lupulcorbul.appspot.com")) {
                  imageUrl = imageUrl.replace(
                    "lupulcorbul.appspot.com",
                    "lupulcorbul.firebasestorage.app"
                  );
                }

                console.log(
                  `Processed imageUrl for user specialist ${doc.id}:`,
                  imageUrl
                );
              }

              if (photoURL && typeof photoURL === "string") {
                if (
                  photoURL.includes("firebasestorage.googleapis.com") &&
                  !photoURL.includes("alt=media")
                ) {
                  photoURL = `${photoURL}${photoURL.includes("?") ? "&" : "?"}alt=media`;
                }

                // Fix incorrect bucket domain if needed
                if (photoURL.includes("lupulcorbul.appspot.com")) {
                  photoURL = photoURL.replace(
                    "lupulcorbul.appspot.com",
                    "lupulcorbul.firebasestorage.app"
                  );
                }
              }

              return {
                id: doc.id,
                name:
                  userData.displayName ||
                  userData.name ||
                  userData.email ||
                  "Specialist",
                role:
                  userData.specialization ||
                  userData.serviceType ||
                  userData.role ||
                  "Specialist",
                email: userData.email || "",
                phone: userData.phone || "",
                imageUrl: imageUrl,
                photoURL: photoURL,
                description:
                  userData.bio ||
                  userData.description ||
                  "Specialist în domeniul sănătății și stării de bine.",
                serviceType:
                  userData.serviceType || userData.specializationCategory || "",
                isActive: true,
                schedule: userData.schedule || [
                  {
                    dayOfWeek: 1,
                    startTime: "09:00",
                    endTime: "17:00",
                    available: true,
                  },
                  {
                    dayOfWeek: 2,
                    startTime: "09:00",
                    endTime: "17:00",
                    available: true,
                  },
                  {
                    dayOfWeek: 3,
                    startTime: "09:00",
                    endTime: "17:00",
                    available: true,
                  },
                  {
                    dayOfWeek: 4,
                    startTime: "09:00",
                    endTime: "17:00",
                    available: true,
                  },
                  {
                    dayOfWeek: 5,
                    startTime: "09:00",
                    endTime: "17:00",
                    available: true,
                  },
                ],
              } as Specialist;
            });

            console.log(
              `Found ${specialistsFromUsers.length} specialists in users collection after processing`
            );
            specialistsList.push(...specialistsFromUsers);
          } else {
            console.log("Users collection is empty");
          }
        } catch (error) {
          console.error("Error fetching specialists from users:", error);
        }

        // Logăm lista finală pentru a verifica rezultatul
        console.log(
          "Final specialists list:",
          specialistsList.map((s) => ({
            id: s.id,
            name: s.name,
            hasImage: !!s.imageUrl,
            imageUrl: s.imageUrl,
            role: s.role,
          }))
        );

        if (specialistsList.length > 0) {
          setSpecialists(specialistsList);
          console.log(
            `Successfully set ${specialistsList.length} specialists in state`
          );
        } else {
          console.warn("No specialists found");
          setError(
            "Nu am găsit specialiști disponibili momentan. Vă rugăm să reveniți mai târziu."
          );
        }
      } catch (error) {
        console.error("Error fetching specialists:", error);
        setError(
          "Eroare la încărcarea specialiștilor. Vă rugăm încercați din nou."
        );
      } finally {
        setFetchingData(false);
      }
    };

    fetchSpecialists();
  }, []);

  const handleContinue = () => {
    if (selectedSpecialist) {
      const updatedData = {
        ...appointmentData,
        specialistId: selectedSpecialist,
      };
      setAppointmentData(updatedData);

      // Navigate to next step with state
      navigate("/appointments/service", {
        state: { appointmentData: updatedData },
      });
    }
  };

  // Funcție pentru navigarea la profilul unui specialist
  const handleViewProfile = (specialistId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Previne selecția cardului când se click-uiește pe butonul de profil
    navigate(`/appointments/specialist/${specialistId}`);
  };

  // Funcție pentru navigarea la editarea profilului de specialist
  const handleEditProfile = (event: React.MouseEvent) => {
    event.stopPropagation(); // Previne selecția cardului când se click-uiește pe buton
    // Navigăm către panoul de specialist cu un parametru care indică deschiderea formularului de CV
    navigate(`/specialist?openCVEdit=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Programează o Ședință
          </h1>
          <p className="text-gray-600 mb-8 border-b pb-4">
            Pasul 1: Alegerea specialistului
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={`step-${i}`} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i === 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i}
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    {i === 1 && "Specialist"}
                    {i === 2 && "Serviciu"}
                    {i === 3 && "Data"}
                    {i === 4 && "Ora"}
                    {i === 5 && "Confirmare"}
                  </div>
                </div>
              ))}
            </div>{" "}
            <div className="relative h-1 mt-3">
              <div className="progress-bar-background"></div>
              <div className="progress-bar-fill step-1"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg">
            {fetchingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Se încarcă specialiștii...</p>
              </div>
            ) : (
              <>
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
                            Nu există specialiști disponibili momentan. Vă rugăm
                            să reveniți mai târziu.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {specialists.map((specialist, index) => {
                        const specialistName = specialist?.name || "Specialist";

                        return (
                          <div
                            key={specialist?.id || `specialist-${index}`}
                            className={`border rounded-lg p-4 cursor-pointer transition shadow-sm hover:shadow-md ${
                              selectedSpecialist === specialist?.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => {
                              console.log(
                                "Selected specialist:",
                                specialist?.id
                              );
                              setSelectedSpecialist(specialist?.id || null);
                            }}
                          >
                            <div className="flex flex-col md:flex-row items-center mb-3">
                              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 mb-3 md:mb-0 transition transform hover:scale-105 shadow">
                                <SpecialistAvatar
                                  photoURL={
                                    specialist.photoURL || specialist.imageUrl
                                  }
                                  name={specialistName}
                                  id={specialist.id || `specialist-${index}`}
                                  size="large"
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="md:ml-4 text-center md:text-left flex-grow">
                                <h3 className="font-semibold text-lg">
                                  {specialistName}
                                </h3>
                                <p className="text-gray-600">
                                  {specialist?.role || "Specialist"}
                                </p>
                                {specialist?.serviceType && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                    {specialist.serviceType}
                                  </span>
                                )}

                                {/* Badge pentru profilul propriu */}
                                {user && specialist.id === user.uid && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1 ml-2">
                                    <FaUser className="mr-1" size={10} />
                                    Profilul meu
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2 border-t pt-2">
                              {specialist?.description ||
                                "Specialist în domeniul sănătății și stării de bine."}
                            </p>

                            {/* Butoane pentru acțiuni */}
                            <div className="mt-4 flex justify-between items-center">
                              {/* Buton pentru editarea profilului - vizibil doar pentru propriul profil */}
                              {user && specialist.id === user.uid && (
                                <button
                                  onClick={(e) => handleEditProfile(e)}
                                  className="text-green-600 hover:text-green-800 text-sm flex items-center bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                >
                                  <FaEdit className="mr-1" size={14} />
                                  Editează profilul meu
                                </button>
                              )}

                              {/* Buton pentru vizualizarea profilului detaliat */}
                              <button
                                onClick={(e) =>
                                  handleViewProfile(specialist.id, e)
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center ml-auto"
                              >
                                Vezi profilul complet{" "}
                                <FaExternalLinkAlt className="ml-1" size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-8">
                  <a
                    href="/appointments"
                    className="px-6 py-2 text-blue-600 hover:underline transition"
                  >
                    Înapoi
                  </a>
                  <button
                    onClick={handleContinue}
                    disabled={!selectedSpecialist || specialists.length === 0}
                    className={`px-6 py-2 rounded transition ${
                      selectedSpecialist && specialists.length > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Continuă
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistSelection;
