import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import { ro } from "date-fns/locale";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Appointment {
  id: string;
  specialistId: string;
  userName: string;
  serviceName: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  status: string;
}

interface SimpleCalendarProps {
  specialistId?: string;
  onDateSelect?: (date: Date) => void;
}

const SimpleSpecialistCalendar: React.FC<SimpleCalendarProps> = ({
  specialistId,
  onDateSelect,
}) => {
  const { user } = useAuth();
  const currentSpecialistId = specialistId || user?.uid || "";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentSpecialistId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        const appointmentsRef = collection(db, "appointments");
        const appointmentsQuery = query(
          appointmentsRef,
          where("specialistId", "==", currentSpecialistId),
          where("date", ">=", Timestamp.fromDate(monthStart)),
          where("date", "<=", Timestamp.fromDate(monthEnd))
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData: Appointment[] = [];

        appointmentsSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Appointment, "id">;
          appointmentsData.push({
            id: doc.id,
            ...data,
          });
        });

        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentDate, currentSpecialistId]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <h2 className="text-lg font-semibold text-gray-900">
        {format(currentDate, "MMMM yyyy", { locale: ro })}
      </h2>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentDate((prev) => subMonths(prev, 1))}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          title="Luna anterioară"
        >
          <FaChevronLeft size={16} />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
        >
          Astăzi
        </button>
        <button
          onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          title="Luna următoare"
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    // Week days header
    const weekDays = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
    rows.push(
      <div key="header" className="grid grid-cols-7 bg-gray-50">
        {weekDays.map((dayName) => (
          <div
            key={dayName}
            className="p-2 text-center text-sm font-medium text-gray-500"
          >
            {dayName}
          </div>
        ))}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentDay = isToday(day);

        const dayAppointments = appointments.filter((apt) => {
          const aptDate = apt.date.toDate();
          return isSameDay(aptDate, day);
        });

        days.push(
          <div
            key={day.toString()}
            className={`
              min-h-[80px] p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
              ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"}
              ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""}
              ${isCurrentDay ? "bg-blue-100" : ""}
            `}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${isCurrentDay ? "font-bold text-blue-600" : ""}`}
              >
                {formattedDate}
              </span>
            </div>

            <div className="mt-1 space-y-1">
              {/* Show appointments */}
              {dayAppointments.slice(0, 2).map((apt) => (
                <div
                  key={apt.id}
                  className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                  title={`${apt.userName} - ${apt.serviceName} la ${apt.startTime}`}
                >
                  {apt.startTime} {apt.userName}
                </div>
              ))}

              {dayAppointments.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayAppointments.length - 2} mai multe
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="bg-white">{rows}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {renderCalendarHeader()}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        renderCalendarGrid()
      )}
    </div>
  );
};

export default SimpleSpecialistCalendar;
