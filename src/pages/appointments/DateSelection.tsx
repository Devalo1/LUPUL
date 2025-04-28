import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { AppointmentState } from "../../types/appointment";

interface Day {
  date: string;
  formattedDate: string;
  dayName: string;
  hasSlots: boolean;
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

const DateSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
    }
  }, [appointmentData, navigate]);

  // Initialize with selected date if exists in appointment data
  useEffect(() => {
    if (appointmentData.date) {
      setSelectedDate(appointmentData.date);
    }
  }, [appointmentData.date]);

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

  // Generate available days based on specialist schedule
  useEffect(() => {
    if (!specialist) return;
    
    try {
      setFetchingData(true);
      setError(null);
      
      const generatedDays: Day[] = [];
      const today = new Date();
      
      const specialistSchedule = specialist.schedule || [];
      
      // Generate days for the next 2 weeks
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Convert JS day (0=Sunday) to our format (1=Monday, 7=Sunday)
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        
        // Check if specialist is available on this day
        const scheduleForDay = specialistSchedule.find(s => s.dayOfWeek === dayOfWeek && s.available);
        
        if (scheduleForDay) {
          const formattedDate = date.toISOString().split("T")[0];
          
          generatedDays.push({
            date: formattedDate,
            formattedDate: date.toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric"
            }),
            dayName: date.toLocaleDateString("ro-RO", { weekday: "long" }),
            hasSlots: true
          });
        }
      }
      
      setDays(generatedDays);
    } catch (error) {
      console.error("Error generating days:", error);
      setError("Eroare la generarea zilelor disponibile. Vă rugăm încercați din nou.");
    } finally {
      setFetchingData(false);
    }
  }, [specialist]);

  const handleContinue = () => {
    if (selectedDate) {
      const updatedData = {
        ...appointmentData,
        date: selectedDate
      };
      setAppointmentData(updatedData);
      
      // Navigate to next step with state
      navigate("/appointments/time", { state: { appointmentData: updatedData } });
    }
  };

  const handleBack = () => {
    navigate("/appointments/service", { state: { appointmentData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Programează o Ședință</h1>
          <p className="text-gray-600 mb-8 border-b pb-4">Pasul 3: Alegerea datei</p>

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
                    i <= 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
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
                style={{ width: `${(3 - 1) * 25}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg">
            {fetchingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Se încarcă zilele disponibile...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Alege o dată disponibilă
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
                        <div
                          key={day.date}
                          className={`border p-3 rounded-lg text-left transition cursor-pointer ${
                            selectedDate === day.date
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <p className="text-sm text-gray-500 capitalize">{day.dayName}</p>
                          <p className="font-medium">{day.formattedDate}</p>
                          <p className="text-xs mt-1 text-gray-500">
                            Program disponibil
                          </p>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelection;