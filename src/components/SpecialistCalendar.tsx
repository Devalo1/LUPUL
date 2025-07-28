import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { ro } from "date-fns/locale";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes } from "react-icons/fa";

interface Availability {
  id?: string;
  specialistId: string;
  date: string; // YYYY-MM-DD format
  timeSlots: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    isAvailable: boolean;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface Appointment {
  id: string;
  specialistId: string;
  userName: string;
  serviceName: string;
  date: Timestamp; // Firebase Timestamp
  startTime: string;
  endTime: string;
  status: string;
}

interface SpecialistCalendarProps {
  specialistId?: string;
  onDateSelect?: (date: Date) => void;
  mode?: "availability" | "appointments" | "both";
}

const SpecialistCalendar: React.FC<SpecialistCalendarProps> = ({
  specialistId,
  onDateSelect,
  mode = "both",
}) => {
  const { user } = useAuth();
  const currentSpecialistId = specialistId || user?.uid || "";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availabilities, setAvailabilities] = useState<
    Record<string, Availability>
  >({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedDateForSlots, setSelectedDateForSlots] = useState<Date | null>(
    null
  );
  const [tempTimeSlots, setTempTimeSlots] = useState<
    {
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[]
  >([]);

  // Fetch availabilities and appointments for the current month
  useEffect(() => {
    if (!currentSpecialistId) return;

    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        // Fetch availabilities
        if (mode === "availability" || mode === "both") {
          const availabilitiesRef = collection(db, "specialistAvailability");
          const availabilitiesQuery = query(
            availabilitiesRef,
            where("specialistId", "==", currentSpecialistId),
            where("date", ">=", format(monthStart, "yyyy-MM-dd")),
            where("date", "<=", format(monthEnd, "yyyy-MM-dd"))
          );

          const availabilitiesSnapshot = await getDocs(availabilitiesQuery);
          const availabilitiesData: Record<string, Availability> = {};

          availabilitiesSnapshot.forEach((doc) => {
            const data = doc.data() as Availability;
            data.id = doc.id;
            availabilitiesData[data.date] = data;
          });

          setAvailabilities(availabilitiesData);
        }

        // Fetch appointments
        if (mode === "appointments" || mode === "both") {
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
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentDate, currentSpecialistId, mode]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleSetAvailability = (date: Date) => {
    setSelectedDateForSlots(date);
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = availabilities[dateStr];

    if (existing && existing.timeSlots) {
      setTempTimeSlots([...existing.timeSlots]);
    } else {
      // Default time slots (8 AM to 6 PM, 1-hour slots)
      const defaultSlots = [];
      for (let hour = 8; hour < 18; hour++) {
        defaultSlots.push({
          startTime: `${hour.toString().padStart(2, "0")}:00`,
          endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
          isAvailable: true,
        });
      }
      setTempTimeSlots(defaultSlots);
    }

    setShowTimeSlotModal(true);
  };

  const handleSaveTimeSlots = async () => {
    if (!selectedDateForSlots || !currentSpecialistId) return;

    try {
      const dateStr = format(selectedDateForSlots, "yyyy-MM-dd");
      const availabilityData: Availability = {
        specialistId: currentSpecialistId,
        date: dateStr,
        timeSlots: tempTimeSlots,
        updatedAt: new Date(),
      };

      const existingAvailability = availabilities[dateStr];
      if (existingAvailability && existingAvailability.id) {
        // Update existing
        await setDoc(
          doc(db, "specialistAvailability", existingAvailability.id),
          availabilityData
        );
      } else {
        // Create new
        availabilityData.createdAt = new Date();
        const newDocRef = doc(collection(db, "specialistAvailability"));
        await setDoc(newDocRef, availabilityData);
        availabilityData.id = newDocRef.id;
      }

      // Update local state
      setAvailabilities((prev) => ({
        ...prev,
        [dateStr]: availabilityData,
      }));

      setShowTimeSlotModal(false);
      setSelectedDateForSlots(null);
      setTempTimeSlots([]);
    } catch (error) {
      console.error("Error saving availability:", error);
    }
  };

  const addTimeSlot = () => {
    setTempTimeSlots((prev) => [
      ...prev,
      {
        startTime: "09:00",
        endTime: "10:00",
        isAvailable: true,
      },
    ]);
  };

  const removeTimeSlot = (index: number) => {
    setTempTimeSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (
    index: number,
    field: keyof (typeof tempTimeSlots)[0],
    value: string | boolean
  ) => {
    setTempTimeSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
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
          aria-label="Luna anterioară"
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
          aria-label="Luna următoare"
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
        const dateStr = format(day, "yyyy-MM-dd");
        const cloneDay = day;

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentDay = isToday(day);
        const isPast = isBefore(day, startOfDay(new Date()));

        const hasAvailability = availabilities[dateStr];
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
              ${isPast ? "opacity-60" : ""}
            `}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${isCurrentDay ? "font-bold text-blue-600" : ""}`}
              >
                {formattedDate}
              </span>
              {isCurrentMonth &&
                !isPast &&
                (mode === "availability" || mode === "both") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetAvailability(cloneDay);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded"
                    title="Setează disponibilitatea"
                  >
                    <FaPlus size={10} />
                  </button>
                )}
            </div>

            <div className="mt-1 space-y-1">
              {/* Show availability indicator */}
              {hasAvailability && hasAvailability.timeSlots && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  {
                    hasAvailability.timeSlots.filter((slot) => slot.isAvailable)
                      .length
                  }{" "}
                  slot-uri
                </div>
              )}

              {/* Show appointments */}
              {dayAppointments.slice(0, 2).map((apt) => (
                <div
                  key={apt.id}
                  className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                  title={`${apt.userName} - ${apt.serviceName}`}
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

  const renderTimeSlotModal = () => {
    if (!showTimeSlotModal || !selectedDateForSlots) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">
              Disponibilitate pentru{" "}
              {format(selectedDateForSlots, "dd MMMM yyyy", { locale: ro })}
            </h3>
            <button
              onClick={() => setShowTimeSlotModal(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Închide modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {tempTimeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg"
                >
                  <label className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Început:</span>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateTimeSlot(index, "startTime", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                      aria-label={`Ora de început pentru intervalul ${index + 1}`}
                    />
                  </label>
                  <span className="text-gray-500">-</span>
                  <label className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Sfârșit:</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateTimeSlot(index, "endTime", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                      aria-label={`Ora de sfârșit pentru intervalul ${index + 1}`}
                    />
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={slot.isAvailable}
                      onChange={(e) =>
                        updateTimeSlot(index, "isAvailable", e.target.checked)
                      }
                      className="mr-1"
                    />
                    <span className="text-sm">Disponibil</span>
                  </label>
                  <button
                    onClick={() => removeTimeSlot(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label={`Șterge intervalul orar ${index + 1}`}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addTimeSlot}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaPlus className="mr-1" size={12} />
              Adaugă interval orar
            </button>
          </div>

          <div className="flex justify-end space-x-2 p-4 border-t">
            <button
              onClick={() => setShowTimeSlotModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Anulează
            </button>
            <button
              onClick={handleSaveTimeSlots}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salvează
            </button>
          </div>
        </div>
      </div>
    );
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
      {renderTimeSlotModal()}
    </div>
  );
};

export default SpecialistCalendar;
