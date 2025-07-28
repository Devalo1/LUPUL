// Utility functions for handling specialist schedules

export interface ScheduleDay {
  dayOfWeek: number; // 1=Monday, 2=Tuesday, ..., 7=Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  available: boolean;
}

export const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true }, // Monday
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true }, // Tuesday
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true }, // Wednesday
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true }, // Thursday
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true }, // Friday
];

/**
 * Ensures a specialist has a valid schedule, providing defaults if missing
 */
export const ensureValidSchedule = (
  schedule?: ScheduleDay[]
): ScheduleDay[] => {
  if (!schedule || schedule.length === 0) {
    console.log("No schedule provided, using default schedule");
    return DEFAULT_SCHEDULE;
  }

  // Validate that all schedule entries have required properties
  const validSchedule = schedule.filter(
    (day) =>
      typeof day.dayOfWeek === "number" &&
      day.dayOfWeek >= 1 &&
      day.dayOfWeek <= 7 &&
      typeof day.startTime === "string" &&
      typeof day.endTime === "string" &&
      typeof day.available === "boolean"
  );

  if (validSchedule.length === 0) {
    console.log("Invalid schedule data, using default schedule");
    return DEFAULT_SCHEDULE;
  }

  return validSchedule;
};

/**
 * Converts JavaScript Date.getDay() (0=Sunday) to our format (1=Monday, 7=Sunday)
 */
export const convertJSDay = (jsDay: number): number => {
  return jsDay === 0 ? 7 : jsDay;
};

/**
 * Gets the day name in Romanian
 */
export const getDayName = (dayOfWeek: number): string => {
  const dayNames = {
    1: "Luni",
    2: "Marți",
    3: "Miercuri",
    4: "Joi",
    5: "Vineri",
    6: "Sâmbătă",
    7: "Duminică",
  };
  return dayNames[dayOfWeek as keyof typeof dayNames] || "Necunoscut";
};

/**
 * Checks if a specialist is available on a specific day of the week
 */
export const isAvailableOnDay = (
  schedule: ScheduleDay[],
  dayOfWeek: number
): boolean => {
  const daySchedule = schedule.find((s) => s.dayOfWeek === dayOfWeek);
  return daySchedule?.available || false;
};

/**
 * Gets the working hours for a specific day
 */
export const getWorkingHours = (
  schedule: ScheduleDay[],
  dayOfWeek: number
): { startTime: string; endTime: string } | null => {
  const daySchedule = schedule.find(
    (s) => s.dayOfWeek === dayOfWeek && s.available
  );
  if (!daySchedule) return null;

  return {
    startTime: daySchedule.startTime,
    endTime: daySchedule.endTime,
  };
};
