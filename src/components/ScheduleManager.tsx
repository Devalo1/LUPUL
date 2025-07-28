import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaCalendarWeek,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle,
} from "react-icons/fa";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface ScheduleDay {
  dayOfWeek: number; // 1=Monday, 7=Sunday
  startTime: string;
  endTime: string;
  available: boolean;
}

interface ScheduleManagerProps {
  specialistId: string;
  onScheduleUpdate?: (schedule: ScheduleDay[]) => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  specialistId,
  onScheduleUpdate,
}) => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true },
    { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", available: false },
    { dayOfWeek: 7, startTime: "10:00", endTime: "14:00", available: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const dayNames = [
    { day: 1, name: "Luni", shortName: "L" },
    { day: 2, name: "Marți", shortName: "Ma" },
    { day: 3, name: "Miercuri", shortName: "Mi" },
    { day: 4, name: "Joi", shortName: "J" },
    { day: 5, name: "Vineri", shortName: "V" },
    { day: 6, name: "Sâmbătă", shortName: "S" },
    { day: 7, name: "Duminică", shortName: "D" },
  ];

  // Load existing schedule
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        // Try specialists collection first
        const specialistDoc = await getDoc(
          doc(db, "specialists", specialistId)
        );
        if (specialistDoc.exists() && specialistDoc.data().schedule) {
          setSchedule(specialistDoc.data().schedule);
          return;
        }

        // Try users collection
        const userDoc = await getDoc(doc(db, "users", specialistId));
        if (userDoc.exists() && userDoc.data().schedule) {
          setSchedule(userDoc.data().schedule);
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      }
    };

    if (specialistId) {
      loadSchedule();
    }
  }, [specialistId]);

  const updateScheduleDay = (
    dayIndex: number,
    field: keyof ScheduleDay,
    value: string | boolean
  ) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setSchedule(newSchedule);
  };

  const toggleAllDays = (available: boolean) => {
    const newSchedule = schedule.map((day) => ({ ...day, available }));
    setSchedule(newSchedule);
  };

  const setWorkingHoursForAll = (startTime: string, endTime: string) => {
    const newSchedule = schedule.map((day) => ({
      ...day,
      startTime,
      endTime,
    }));
    setSchedule(newSchedule);
  };

  const saveSchedule = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Update both specialists and users collections
      const scheduleData = { schedule };

      // Try specialists collection first
      try {
        await updateDoc(doc(db, "specialists", specialistId), scheduleData);
      } catch (e) {
        // If specialists doc doesn't exist, update users collection
        await updateDoc(doc(db, "users", specialistId), scheduleData);
      }

      setMessage({
        type: "success",
        text: "Programul a fost salvat cu succes! Clienții vor vedea noile ore disponibile.",
      });

      if (onScheduleUpdate) {
        onScheduleUpdate(schedule);
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving schedule:", error);
      setMessage({
        type: "error",
        text: "A apărut o eroare la salvarea programului. Încercați din nou.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDaysCount = () => {
    return schedule.filter((day) => day.available).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaCalendarWeek className="mr-2 text-blue-500" />
              Gestionează Programul Săptămânal
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Setează orele în care ești disponibil pentru programări
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Zile disponibile</div>
            <div className="text-2xl font-bold text-blue-600">
              {getAvailableDaysCount()}/7
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Actions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <FaInfoCircle className="mr-2" />
            Acțiuni Rapide
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleAllDays(true)}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200 transition-colors"
            >
              Activează toate zilele
            </button>
            <button
              onClick={() => toggleAllDays(false)}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200 transition-colors"
            >
              Dezactivează toate zilele
            </button>
            <button
              onClick={() => setWorkingHoursForAll("09:00", "17:00")}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              Program 9-17 pentru toate
            </button>
            <button
              onClick={() => setWorkingHoursForAll("08:00", "16:00")}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm hover:bg-purple-200 transition-colors"
            >
              Program 8-16 pentru toate
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="space-y-3">
          {dayNames.map((dayInfo, index) => {
            const daySchedule = schedule[index];
            return (
              <div
                key={dayInfo.day}
                className={`p-4 rounded-lg border-2 transition-all ${
                  daySchedule.available
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          daySchedule.available
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {dayInfo.shortName}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {dayInfo.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {daySchedule.available
                            ? "Disponibil"
                            : "Nedisponibil"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Time inputs */}
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400 text-sm" />
                      <input
                        type="time"
                        value={daySchedule.startTime}
                        onChange={(e) =>
                          updateScheduleDay(index, "startTime", e.target.value)
                        }
                        disabled={!daySchedule.available}
                        aria-label={`Ora de început pentru ${dayInfo.name}`}
                        className={`px-2 py-1 border rounded text-sm ${
                          daySchedule.available
                            ? "border-gray-300 bg-white"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                        }`}
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={daySchedule.endTime}
                        onChange={(e) =>
                          updateScheduleDay(index, "endTime", e.target.value)
                        }
                        disabled={!daySchedule.available}
                        aria-label={`Ora de sfârșit pentru ${dayInfo.name}`}
                        className={`px-2 py-1 border rounded text-sm ${
                          daySchedule.available
                            ? "border-gray-300 bg-white"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                        }`}
                      />
                    </div>

                    {/* Toggle button */}
                    <button
                      onClick={() =>
                        updateScheduleDay(
                          index,
                          "available",
                          !daySchedule.available
                        )
                      }
                      className={`p-2 rounded-full transition-colors ${
                        daySchedule.available
                          ? "text-green-600 hover:bg-green-100"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={
                        daySchedule.available
                          ? "Dezactivează această zi"
                          : "Activează această zi"
                      }
                    >
                      {daySchedule.available ? (
                        <FaToggleOn size={24} />
                      ) : (
                        <FaToggleOff size={24} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message display */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSchedule}
            disabled={loading}
            className={`px-6 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                <span>Se salvează...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>Salvează Programul</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
