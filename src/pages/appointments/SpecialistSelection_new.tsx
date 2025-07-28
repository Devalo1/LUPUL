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
import { AppointmentState } from "../../types/appointment";
import SpecialistAvatar from "../../components/SpecialistAvatar";
import SpecialistSearch, {
  SearchFilters,
} from "../../components/SpecialistSearch";
import { searchSpecialists } from "../../utils/specialistSearch";
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
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
  experience?: number;
}

const SpecialistSelection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>(
    []
  );
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(
    null
  );
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);

  // Retrieve existing appointment data from location state or sessionStorage
  const getAppointmentState = (): AppointmentState => {
    const stateData = location.state?.appointmentData;
    if (stateData) return stateData;

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

  // Initial load of all specialists
  useEffect(() => {
    const loadInitialSpecialists = async () => {
      setFetchingData(true);
      try {
        const defaultFilters: SearchFilters = {
          searchTerm: "",
          specialization: "",
          isActive: true,
          sortBy: "name",
          sortOrder: "asc",
        };

        const result = await searchSpecialists(defaultFilters, 50);

        // Convert SearchSpecialist to Specialist format
        const convertedSpecialists: Specialist[] = result.specialists.map(
          (spec) => ({
            id: spec.id,
            name:
              spec.fullName ||
              spec.displayName ||
              spec.name ||
              "Nume necunoscut",
            role: spec.specialization || "Specialist",
            imageUrl: spec.imageUrl || spec.photoURL,
            photoURL: spec.photoURL,
            description: spec.bio || spec.description,
            serviceType: spec.specializationCategory,
            email: spec.email,
            phone: spec.phone,
            services: spec.services,
            isActive: spec.isActive,
            rating: spec.rating,
            reviewCount: spec.reviewsCount,
            experience: spec.experience,
            schedule: [],
          })
        );

        setSpecialists(convertedSpecialists);
        setFilteredSpecialists(convertedSpecialists);
        setTotalResults(result.totalCount);
        setError(null);
      } catch (err) {
        console.error("Error loading specialists:", err);
        setError("Nu s-au putut încărca specialiștii. Încercați din nou.");
      } finally {
        setFetchingData(false);
      }
    };

    loadInitialSpecialists();
  }, []);

  // Handle search
  const handleSearch = async (filters: SearchFilters) => {
    setSearchLoading(true);
    try {
      const result = await searchSpecialists(filters, 50);

      const convertedSpecialists: Specialist[] = result.specialists.map(
        (spec) => ({
          id: spec.id,
          name:
            spec.fullName || spec.displayName || spec.name || "Nume necunoscut",
          role: spec.specialization || "Specialist",
          imageUrl: spec.imageUrl || spec.photoURL,
          photoURL: spec.photoURL,
          description: spec.bio || spec.description,
          serviceType: spec.specializationCategory,
          email: spec.email,
          phone: spec.phone,
          services: spec.services,
          isActive: spec.isActive,
          rating: spec.rating,
          reviewCount: spec.reviewsCount,
          experience: spec.experience,
          schedule: [],
        })
      );

      setFilteredSpecialists(convertedSpecialists);
      setTotalResults(result.totalCount);
    } catch (err) {
      console.error("Error searching specialists:", err);
      setError("Eroare la căutarea specialiștilor.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setFilteredSpecialists(specialists);
    setTotalResults(specialists.length);
  };

  const handleContinue = () => {
    if (selectedSpecialist) {
      const updatedData = {
        ...appointmentData,
        specialistId: selectedSpecialist,
      };
      setAppointmentData(updatedData);
      navigate("/appointments/service-selection", {
        state: { appointmentData: updatedData },
      });
    }
  };

  const handleEditProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/specialist-panel");
  };

  const handleViewProfile = (specialistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/appointments/specialist/${specialistId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaUserMd className="mr-3 text-blue-600" />
              Selectează Specialistul
            </h1>
            <p className="text-gray-600 mb-8 border-b pb-4">
              Pasul 1: Alegerea specialistului
            </p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-red-500" />
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
              </div>
            </div>

            {/* Search Component */}
            <SpecialistSearch
              onSearch={handleSearch}
              onClear={handleClearSearch}
              loading={searchLoading}
              totalResults={totalResults}
            />
          </div>

          <div className="p-6">
            {fetchingData ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Se încarcă specialiștii...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  {filteredSpecialists.length === 0 ? (
                    <div className="text-center py-12">
                      <FaUserMd
                        className="mx-auto text-gray-400 mb-3"
                        size={48}
                      />
                      <p className="text-gray-600">
                        Nu s-au găsit specialiști care să corespundă criteriilor
                        de căutare.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSpecialists.map((specialist, index) => {
                        const specialistName =
                          specialist.name || `Specialist ${index + 1}`;
                        const isSelected = selectedSpecialist === specialist.id;

                        return (
                          <div
                            key={specialist.id || `specialist-${index}`}
                            className={`p-4 border rounded-lg cursor-pointer transition transform hover:scale-105 hover:shadow-lg ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
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

                                {/* Rating display */}
                                {specialist.rating && specialist.rating > 0 && (
                                  <div className="flex items-center mt-1">
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-sm text-gray-600 ml-1">
                                      {specialist.rating.toFixed(1)} (
                                      {specialist.reviewCount || 0} recenzii)
                                    </span>
                                  </div>
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
                    href="/dashboard"
                    className="px-6 py-2 text-blue-600 hover:underline transition"
                  >
                    Înapoi
                  </a>
                  <button
                    onClick={handleContinue}
                    disabled={
                      !selectedSpecialist || filteredSpecialists.length === 0
                    }
                    className={`px-6 py-2 rounded transition ${
                      selectedSpecialist && filteredSpecialists.length > 0
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
