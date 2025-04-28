import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";

interface ScheduleProps {
  specialistId: string;
  date?: Date;
}

interface Appointment {
  id: string;
  userId: string;
  userName: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  status: string;
  serviceName: string;
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

const SpecialistSchedule: React.FC<ScheduleProps> = ({ specialistId, date = new Date() }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  useEffect(() => {
    const fetchSpecialistAndAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch specialist details
        const specialistDoc = await getDoc(doc(db, "specialists", specialistId));
        if (!specialistDoc.exists()) {
          throw new Error("Specialist not found");
        }

        const specialistData = {
          id: specialistDoc.id,
          ...specialistDoc.data()
        } as Specialist;
        
        setSpecialist(specialistData);

        // Fetch appointments for this specialist on the selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef, 
          where("specialistId", "==", specialistId),
          where("date", ">=", Timestamp.fromDate(startOfDay)),
          where("date", "<=", Timestamp.fromDate(endOfDay))
        );

        const querySnapshot = await getDocs(q);
        const appointmentList: Appointment[] = [];

        querySnapshot.forEach((doc) => {
          appointmentList.push({
            id: doc.id,
            ...doc.data()
          } as Appointment);
        });

        setAppointments(appointmentList);
      } catch (err) {
        console.error("Error fetching specialist schedule:", err);
        setError("A apărut o eroare la încărcarea programului.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialistAndAppointments();
  }, [specialistId, selectedDate]);

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const getTimeSlots = () => {
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = selectedDate.getDay();
    
    // Get schedule for this day
    const scheduleForDay = specialist?.schedule?.find(s => s.dayOfWeek === dayOfWeek);
    
    if (!scheduleForDay || !scheduleForDay.available) {
      return [];
    }
    
    // Generate time slots for this day's working hours
    const slots = [];
    const startHour = parseInt(scheduleForDay.startTime.split(":")[0]);
    const endHour = parseInt(scheduleForDay.endTime.split(":")[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      const appointment = appointments.find(a => a.startTime === timeString);
      
      slots.push({
        time: timeString,
        appointment
      });
    }
    
    return slots;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const formattedDate = selectedDate.toLocaleDateString("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const slots = getTimeSlots();
  const isWorkingDay = slots.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{specialist?.name || "Specialist"}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium">{formattedDate}</span>
          <button
            onClick={handleNextDay}
            className="p-2 rounded hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {!isWorkingDay ? (
        <div className="py-8 text-center text-gray-500">
          Nu este o zi lucrătoare pentru acest specialist.
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviciu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slots.map((slot, index) => (
                <tr key={index} className={slot.appointment ? "bg-blue-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slot.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {slot.appointment ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Ocupat
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Disponibil
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {slot.appointment ? slot.appointment.userName : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {slot.appointment ? slot.appointment.serviceName : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpecialistSchedule;
