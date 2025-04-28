import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaClock, FaInfoCircle } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { AppointmentState } from "../../types/appointment";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Specialist {
  id: string;
  name: string;
  schedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
}

const TimeSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
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

  // Redirect back if previous steps are not completed
  useEffect(() => {
    if (!appointmentData.specialistId) {
      navigate("/appointments/specialist");
    } else if (!appointmentData.serviceId) {
      navigate("/appointments/service", { state: { appointmentData } });
    } else if (!appointmentData.date) {
      navigate("/appointments/date", { state: { appointmentData } });
    }
  }, [appointmentData, navigate]);

  // Initialize with selected time if exists in appointment data
  useEffect(() => {
    if (appointmentData.time) {
      setSelectedTime(appointmentData.time);
    }
  }, [appointmentData.time]);

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
            schedule: specialistData.schedule
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
            schedule: userData.schedule || [
              { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
              { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
              { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
              { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
              { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true }
            ]
          });
        }
      } catch (error) {
        console.error("Error fetching specialist info:", error);
      }
    };

    fetchSpecialist();
  }, [appointmentData.specialistId]);

  // Fetch service info
  useEffect(() => {
    const fetchService = async () => {
      if (!appointmentData.serviceId) return;

      try {
        // First check specialistServices collection
        const specialistServiceQuery = query(
          collection(db, "specialistServices"),
          where("serviceId", "==", appointmentData.serviceId)
        );
        
        const specialistServiceDoc = await getDocs(specialistServiceQuery);
        
        if (!specialistServiceDoc.empty) {
          // Verificăm doar dacă serviciul există
          return;
        }
        
        // If not found, check services collection
        const serviceDoc = await getDocs(
          query(
            collection(db, "services"), 
            where("__name__", "==", appointmentData.serviceId)
          )
        );

        if (!serviceDoc.empty) {
          // Verificăm doar dacă serviciul există
          return;
        }
      } catch (error) {
        console.error("Error fetching service info:", error);
      }
    };

    fetchService();
  }, [appointmentData.serviceId]);

  // Generate time slots based on specialist schedule and selected date
  useEffect(() => {
    if (!specialist || !appointmentData.date) return;
    
    try {
      setFetchingData(true);
      setError(null);
      
      const selectedDate = new Date(appointmentData.date);
      // JS day is 0-indexed with 0 = Sunday, we want 1 = Monday, 7 = Sunday
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      
      // Get schedule for the selected day
      const scheduleForDay = specialist.schedule?.find(s => s.dayOfWeek === dayOfWeek && s.available);
      
      if (!scheduleForDay) {
        setTimeSlots([]);
        setError("Nu există intervale orare disponibile pentru ziua selectată.");
        setFetchingData(false);
        return;
      }
      
      // Generate time slots based on specialist's schedule
      const startHour = parseInt(scheduleForDay.startTime.split(":")[0]);
      const endHour = parseInt(scheduleForDay.endTime.split(":")[0]);
      
      const slots: TimeSlot[] = [];
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          
          // For demo purposes, randomly make some slots unavailable
          // In production, you would check against existing appointments
          const isAvailable = Math.random() > 0.3;
          
          slots.push({
            id: `${appointmentData.date}-${timeString}`,
            time: timeString,
            available: isAvailable
          });
        }
      }
      
      setTimeSlots(slots);
    } catch (error) {
      console.error("Error generating time slots:", error);
      setError("Eroare la generarea intervalelor orare disponibile. Vă rugăm încercați din nou.");
    } finally {
      setFetchingData(false);
    }
  }, [specialist, appointmentData.date]);

  const handleContinue = () => {
    if (selectedTime) {
      const updatedData = {
        ...appointmentData,
        time: selectedTime
      };
      setAppointmentData(updatedData);
      
      // Navigate to next step with state
      navigate("/appointments/confirm", { state: { appointmentData: updatedData } });
    }
  };

  const handleBack = () => {
    navigate("/appointments/date", { state: { appointmentData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Programează o Ședință</h1>
          <p className="text-gray-600 mb-8 border-b pb-4">Pasul 4: Alegerea orei</p>

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
                    i <= 4 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
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
                style={{ width: `${(4 - 1) * 25}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg">
            {fetchingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Se încarcă intervalele orare disponibile...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaClock className="mr-2 text-blue-500" />
                    Alege o oră disponibilă
                  </h2>
                  
                  {timeSlots.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Nu există intervale orare disponibile pentru ziua selectată. Vă rugăm să alegeți altă zi.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {timeSlots.map((slot) => (
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
                    disabled={!selectedTime}
                    className={`px-6 py-2 rounded transition ${
                      selectedTime
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

export default TimeSelection;