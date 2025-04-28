import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { addDoc, collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { AppointmentState } from "../../types/appointment";

interface ConfirmationData {
  specialist: {
    id: string;
    name: string;
    role?: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  date: string;
  formattedDate: string;
  time: string;
}

const AppointmentConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [appointmentNote, setAppointmentNote] = useState<string>("");
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

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

  // Initialize note from appointment data
  useEffect(() => {
    if (appointmentData.note) {
      setAppointmentNote(appointmentData.note);
    }
  }, [appointmentData.note]);

  // Redirect back if previous steps are not completed
  useEffect(() => {
    if (!appointmentData.specialistId) {
      navigate("/appointments/specialist");
    } else if (!appointmentData.serviceId) {
      navigate("/appointments/service", { state: { appointmentData } });
    } else if (!appointmentData.date) {
      navigate("/appointments/date", { state: { appointmentData } });
    } else if (!appointmentData.time) {
      navigate("/appointments/time", { state: { appointmentData } });
    }
  }, [appointmentData, navigate]);

  // Fetch all appointment details
  useEffect(() => {
    const fetchConfirmationData = async () => {
      if (!appointmentData.specialistId || 
          !appointmentData.serviceId || 
          !appointmentData.date || 
          !appointmentData.time) {
        return;
      }

      try {
        setFetchingData(true);
        setError(null);
        
        // 1. Fetch specialist info
        let specialistName = "Specialist";
        let specialistRole = "";
        
        try {
          // Try specialists collection first
          const specialistDoc = await getDoc(doc(db, "specialists", appointmentData.specialistId));
          
          if (specialistDoc.exists()) {
            const specialistData = specialistDoc.data();
            specialistName = specialistData.name || "Specialist";
            specialistRole = specialistData.role || specialistData.specialization || "";
          } else {
            // If not found, try users collection
            const userDoc = await getDoc(doc(db, "users", appointmentData.specialistId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              specialistName = userData.displayName || userData.email || "Specialist";
              specialistRole = userData.specialization || userData.role || "";
            }
          }
        } catch (error) {
          console.error("Error fetching specialist:", error);
        }
        
        // 2. Fetch service info
        let serviceName = "Serviciu";
        let serviceDuration = 60;
        let servicePrice = 0;
        
        try {
          // First try specialistServices collection
          const specialistServiceQuery = query(
            collection(db, "specialistServices"),
            where("serviceId", "==", appointmentData.serviceId)
          );
          
          const specialistServiceDoc = await getDocs(specialistServiceQuery);
          
          if (!specialistServiceDoc.empty) {
            const serviceData = specialistServiceDoc.docs[0].data();
            serviceName = serviceData.name || "Serviciu";
            serviceDuration = serviceData.duration || 60;
            servicePrice = serviceData.price || 0;
          } else {
            // Try services collection
            const serviceDoc = await getDoc(doc(db, "services", appointmentData.serviceId));
            
            if (serviceDoc.exists()) {
              const serviceData = serviceDoc.data();
              serviceName = serviceData.name || "Serviciu";
              serviceDuration = serviceData.duration || 60;
              servicePrice = serviceData.price || 0;
            }
          }
        } catch (error) {
          console.error("Error fetching service:", error);
        }
        
        // 3. Format the date
        const appointmentDate = new Date(appointmentData.date);
        const formattedDate = appointmentDate.toLocaleDateString("ro-RO", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        
        // 4. Compile all data
        setConfirmationData({
          specialist: {
            id: appointmentData.specialistId,
            name: specialistName,
            role: specialistRole
          },
          service: {
            id: appointmentData.serviceId,
            name: serviceName,
            duration: serviceDuration,
            price: servicePrice
          },
          date: appointmentData.date,
          formattedDate: formattedDate,
          time: appointmentData.time
        });
      } catch (error) {
        console.error("Error fetching confirmation data:", error);
        setError("A apărut o eroare la încărcarea detaliilor programării. Vă rugăm încercați din nou.");
      } finally {
        setFetchingData(false);
      }
    };

    fetchConfirmationData();
  }, [appointmentData]);

  // Save the note to session storage
  useEffect(() => {
    const updatedData = {
      ...appointmentData,
      note: appointmentNote
    };
    setAppointmentData(updatedData);
    sessionStorage.setItem("appointmentData", JSON.stringify(updatedData));
  }, [appointmentNote]);

  const handleSubmit = async () => {
    if (!user) {
      setError("Trebuie să fiți autentificat pentru a face o programare.");
      return;
    }

    if (!confirmationData) {
      setError("Datele programării nu sunt complete. Vă rugăm să verificați toate detaliile.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateObj = new Date(`${appointmentData.date}T${appointmentData.time}`);
      
      // Calculate end time based on service duration
      const endTimeDate = new Date(dateObj);
      endTimeDate.setMinutes(endTimeDate.getMinutes() + confirmationData.service.duration);
      
      const endTime = `${endTimeDate.getHours().toString().padStart(2, "0")}:${
        endTimeDate.getMinutes().toString().padStart(2, "0")}`;

      // Create appointment document
      const appointmentDoc = {
        userId: user.uid,
        userName: user.displayName || "Utilizator",
        userEmail: user.email,
        specialistId: confirmationData.specialist.id,
        specialistName: confirmationData.specialist.name,
        serviceId: confirmationData.service.id,
        serviceName: confirmationData.service.name,
        serviceType: confirmationData.specialist.role,
        date: dateObj,
        startTime: appointmentData.time,
        endTime: endTime,
        status: "scheduled",
        notes: appointmentNote,
        createdAt: new Date(),
        price: confirmationData.service.price || 0
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "appointments"), appointmentDoc);
      console.log("Programare salvată cu ID:", docRef.id);
      
      // Also add to calendar collection
      const calendarEvent = {
        title: `Programare: ${confirmationData.service.name}`,
        specialistId: confirmationData.specialist.id,
        participantId: user.uid,
        participantName: user.displayName || "Utilizator",
        participantEmail: user.email,
        date: dateObj,
        startTime: appointmentData.time,
        endTime: endTime,
        type: "appointment",
        appointmentId: docRef.id,
        notes: appointmentNote,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, "calendar"), calendarEvent);

      // Show success
      setSuccess(true);
      
      // Clear appointment data from session storage
      sessionStorage.removeItem("appointmentData");
    } catch (error) {
      console.error("Eroare la salvarea programării:", error);
      setError("A apărut o eroare la salvarea programării. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/appointments/time", { state: { appointmentData } });
  };

  const handleNewAppointment = () => {
    // Clear session storage
    sessionStorage.removeItem("appointmentData");
    
    // Navigate to first step
    navigate("/appointments/specialist");
  };

  // If success, show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Programare confirmată!</h1>
            <p className="text-gray-600 mb-8">
              Am confirmat programarea ta pentru {confirmationData?.service.name} 
              cu {confirmationData?.specialist.name}, 
              în data de {confirmationData?.formattedDate}, 
              la ora {confirmationData?.time}.
            </p>
            <p className="text-gray-600 mb-8">
              Am trimis detaliile programării pe email-ul tău.
            </p>
            <button
              onClick={handleNewAppointment}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Fă o altă programare
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Programează o Ședință</h1>
          <p className="text-gray-600 mb-8 border-b pb-4">Pasul 5: Confirmarea programării</p>

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
                    i <= 5 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
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
                style={{ width: `${(5 - 1) * 25}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg">
            {fetchingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Se încarcă detaliile programării...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    Detalii programare
                  </h2>
                  
                  {confirmationData && (
                    <>
                      <div className="mb-8 bg-blue-50 rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-4">Rezumatul programării</h3>
                        <div className="space-y-3">
                          <div className="flex">
                            <span className="font-medium w-32">Specialist:</span>
                            <span>{confirmationData.specialist.name}</span>
                          </div>
                          {confirmationData.specialist.role && (
                            <div className="flex">
                              <span className="font-medium w-32">Specializare:</span>
                              <span>{confirmationData.specialist.role}</span>
                            </div>
                          )}
                          <div className="flex">
                            <span className="font-medium w-32">Serviciu:</span>
                            <span>{confirmationData.service.name}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Data:</span>
                            <span>{confirmationData.formattedDate}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Ora:</span>
                            <span>{confirmationData.time}</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-32">Durată:</span>
                            <span>{confirmationData.service.duration} minute</span>
                          </div>
                          {confirmationData.service.price > 0 && (
                            <div className="flex">
                              <span className="font-medium w-32">Preț:</span>
                              <span>{new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(confirmationData.service.price)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
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
                    </>
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
                    onClick={handleSubmit}
                    disabled={loading || !confirmationData || !user}
                    className={`px-6 py-2 rounded transition ${
                      !loading && confirmationData && user
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;