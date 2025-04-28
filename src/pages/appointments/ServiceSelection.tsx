import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBookOpen, FaInfoCircle } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { AppointmentState } from "../../types/appointment";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
}

interface Specialist {
  id: string;
  name: string;
  role: string;
  serviceType?: string;
  services?: string[];
}

const ServiceSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);

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
        console.error("Error parsing appointment data from session storage:", e);
      }
    }
    
    // Return default empty state
    return {
      specialistId: null,
      serviceId: null,
      date: null,
      time: null,
      note: ""
    };
  };

  const [appointmentData, setAppointmentData] = useState<AppointmentState>(getAppointmentState());

  // Redirect back to specialist selection if no specialist is selected
  useEffect(() => {
    if (!appointmentData.specialistId) {
      navigate("/appointments/specialist");
    }
  }, [appointmentData.specialistId, navigate]);

  // Initialize with selected service if exists in appointment data
  useEffect(() => {
    if (appointmentData.serviceId) {
      setSelectedService(appointmentData.serviceId);
    }
  }, [appointmentData.serviceId]);

  // Save appointment data to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("appointmentData", JSON.stringify(appointmentData));
  }, [appointmentData]);

  // Fetch specialist info
  useEffect(() => {
    const fetchSpecialist = async () => {
      if (!appointmentData.specialistId) return;

      try {
        // Try specialists collection first
        const specialistDoc = await getDocs(
          query(
            collection(db, "specialists"), 
            where("__name__", "==", appointmentData.specialistId)
          )
        );

        if (!specialistDoc.empty) {
          const specialistData = specialistDoc.docs[0].data();
          setSpecialist({
            id: specialistDoc.docs[0].id,
            name: specialistData.name || "Specialist",
            role: specialistData.role || specialistData.specialization || "Specialist",
            serviceType: specialistData.serviceType,
            services: specialistData.services
          });
          return;
        }

        // If not found, try users collection
        const userDoc = await getDocs(
          query(
            collection(db, "users"), 
            where("__name__", "==", appointmentData.specialistId)
          )
        );

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setSpecialist({
            id: userDoc.docs[0].id,
            name: userData.displayName || userData.email || "Specialist",
            role: userData.specialization || userData.role || "Specialist",
            serviceType: userData.serviceType,
            services: userData.services
          });
        }
      } catch (error) {
        console.error("Error fetching specialist info:", error);
      }
    };

    fetchSpecialist();
  }, [appointmentData.specialistId]);

  // Fetch services based on selected specialist
  useEffect(() => {
    const fetchServices = async () => {
      if (!appointmentData.specialistId) return;
      
      try {
        setFetchingData(true);
        setError(null);
        
        console.log(`Fetching services for specialist: ${appointmentData.specialistId}`);
        
        // First check for specialist-specific services
        const specialistServicesRef = collection(db, "specialistServices");
        const q = query(
          specialistServicesRef, 
          where("specialistId", "==", appointmentData.specialistId),
          where("isActive", "==", true)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log(`Found ${querySnapshot.docs.length} specialist-specific services`);
          
          const specialistServicesData = querySnapshot.docs.map(doc => ({
            id: doc.data().serviceId || doc.id,
            name: doc.data().name,
            category: doc.data().category,
            duration: doc.data().duration,
            price: doc.data().price,
            description: doc.data().description
          }));
          
          // Remove duplicates
          const uniqueServicesMap = new Map();
          specialistServicesData.forEach(service => {
            if (!uniqueServicesMap.has(service.id)) {
              uniqueServicesMap.set(service.id, service);
            }
          });
          
          const uniqueServices = Array.from(uniqueServicesMap.values());
          setServices(uniqueServices);
          setFetchingData(false);
          return;
        }
        
        // If no specialist-specific services, try general services
        const servicesRef = collection(db, "services");
        const servicesSnapshot = await getDocs(servicesRef);
        
        if (!servicesSnapshot.empty) {
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Service[];
          
          // Filter by service type if specialist has one
          if (specialist?.serviceType) {
            const filteredServices = servicesData.filter(service => 
              service.category?.toLowerCase().includes(specialist.serviceType?.toLowerCase() || "") || 
              specialist.serviceType?.toLowerCase().includes(service.category?.toLowerCase() || "")
            );
            
            if (filteredServices.length > 0) {
              setServices(filteredServices);
              setFetchingData(false);
              return;
            }
          }
          
          setServices(servicesData);
        } else {
          // Fallback to default services if none found
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
          setServices(defaultServices);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Eroare la încărcarea serviciilor. Vă rugăm încercați din nou.");
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchServices();
  }, [appointmentData.specialistId, specialist]);

  const handleContinue = () => {
    if (selectedService) {
      const updatedData = {
        ...appointmentData,
        serviceId: selectedService
      };
      setAppointmentData(updatedData);
      
      // Navigate to next step with state
      navigate("/appointments/date", { state: { appointmentData: updatedData } });
    }
  };

  const handleBack = () => {
    navigate("/appointments/specialist", { state: { appointmentData: appointmentData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Programează o Ședință</h1>
          <p className="text-gray-600 mb-8 border-b pb-4">Pasul 2: Alegerea serviciului</p>

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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={`step-${i}`} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i <= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
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
            <div className="relative h-1 mt-3">
              <div className="absolute h-1 bg-gray-200 top-0 left-0 right-0"></div>
              <div 
                className="absolute h-1 bg-blue-500 top-0 left-0" 
                style={{ width: `${(2 - 1) * 25}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg">
            {fetchingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Se încarcă serviciile...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaBookOpen className="mr-2 text-blue-500" />
                    Alege un serviciu pentru {specialist?.name || "specialist"}
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
                            console.log("Selected service:", service.id);
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
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 text-blue-600 hover:underline transition"
                  >
                    Înapoi
                  </button>
                  <button
                    onClick={handleContinue}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;