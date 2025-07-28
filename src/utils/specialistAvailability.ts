// Helper function to create default availability for specialists
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { ensureValidSchedule } from "../utils/specialistSchedule";

interface AvailabilityTimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface SpecialistAvailability {
  specialistId: string;
  date: string; // YYYY-MM-DD format
  timeSlots: AvailabilityTimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates default availability for a specialist based on their schedule
 */
export const createDefaultAvailability = async (
  specialistId: string,
  schedule?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    available: boolean;
  }>
): Promise<void> => {
  try {
    const validSchedule = ensureValidSchedule(schedule);
    const today = new Date();

    // Create availability for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      const scheduleForDay = validSchedule.find(
        (s) => s.dayOfWeek === dayOfWeek && s.available
      );

      if (scheduleForDay) {
        const dateStr = date.toISOString().split("T")[0];

        // Check if availability already exists for this date
        const existingQuery = query(
          collection(db, "specialistAvailability"),
          where("specialistId", "==", specialistId),
          where("date", "==", dateStr)
        );

        const existingDocs = await getDocs(existingQuery);

        if (existingDocs.empty) {
          // Create time slots based on working hours (1-hour slots)
          const timeSlots: AvailabilityTimeSlot[] = [];
          const startHour = parseInt(scheduleForDay.startTime.split(":")[0]);
          const endHour = parseInt(scheduleForDay.endTime.split(":")[0]);

          for (let hour = startHour; hour < endHour; hour++) {
            timeSlots.push({
              startTime: `${hour.toString().padStart(2, "0")}:00`,
              endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
              isAvailable: true,
            });
          }

          const availabilityData: SpecialistAvailability = {
            specialistId,
            date: dateStr,
            timeSlots,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Create new availability document
          const newDocRef = doc(collection(db, "specialistAvailability"));
          await setDoc(newDocRef, availabilityData);

          console.log(`Created availability for ${specialistId} on ${dateStr}`);
        }
      }
    }
  } catch (error) {
    console.error("Error creating default availability:", error);
  }
};

/**
 * Ensures a specialist has availability data, creating it if necessary
 */
export const ensureSpecialistAvailability = async (
  specialistId: string,
  schedule?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    available: boolean;
  }>
): Promise<void> => {
  try {
    // Check if specialist has any availability data
    const availabilityQuery = query(
      collection(db, "specialistAvailability"),
      where("specialistId", "==", specialistId)
    );

    const availabilityDocs = await getDocs(availabilityQuery);

    if (availabilityDocs.empty) {
      console.log(
        `No availability found for specialist ${specialistId}, creating default availability`
      );
      await createDefaultAvailability(specialistId, schedule);
    }
  } catch (error) {
    console.error("Error ensuring specialist availability:", error);
  }
};
