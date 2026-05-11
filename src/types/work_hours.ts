/**
 * WORK HOURS TYPES
 * Project working calendar — which days of the week a project operates
 * and its start/end time window.
 *
 * Note: the aggregate `WorkHours` type in `src/types/health.ts` is a separate
 * model used for OSHA rate calculation (weekly totals per project).
 * This type defines the project-level working calendar / schedule.
 */

export type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

/**
 * Hour slot (0–23, 24-hour). Display uses 12-hour AM/PM in the UI.
 * Minutes are in 5-minute increments (0, 5, 10, … 55).
 */
export interface TimeSlot {
  hour: number;    // 0–23
  minute: number;  // 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55
}

export interface WorkDaySchedule {
  day: DayOfWeek;
  active: boolean;     // whether the project works this day
  startTime: TimeSlot;
  endTime: TimeSlot;
  // totalHours = endTime - startTime (computed at runtime)
}

/**
 * Project-level working calendar.
 * One record per project (or per phase if phased schedules are needed).
 */
export interface ProjectWorkCalendar {
  id: string;
  accountId: string;
  projectId: string;
  /** Human-readable name, e.g. "Standard Work Week" */
  name: string;
  workDays: WorkDaySchedule[];
  /** Optional date range this calendar applies to */
  effectiveFrom: string | null;   // ISO date
  effectiveTo: string | null;     // ISO date
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute total hours for a work day schedule. Returns 0 if day is inactive. */
export function calcWorkDayHours(day: WorkDaySchedule): number {
  if (!day.active) return 0;
  const startMinutes = day.startTime.hour * 60 + day.startTime.minute;
  const endMinutes = day.endTime.hour * 60 + day.endTime.minute;
  return Math.max(0, (endMinutes - startMinutes) / 60);
}

/** Compute total weekly hours across all active days. */
export function calcWeeklyHours(calendar: ProjectWorkCalendar): number {
  return calendar.workDays.reduce((sum, d) => sum + calcWorkDayHours(d), 0);
}

/** Format a TimeSlot as a 12-hour AM/PM string, e.g. "7:00 AM", "5:30 PM". */
export function formatTimeSlot(slot: TimeSlot): string {
  const period = slot.hour < 12 ? 'AM' : 'PM';
  const displayHour = slot.hour === 0 ? 12 : slot.hour > 12 ? slot.hour - 12 : slot.hour;
  const displayMinute = String(slot.minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export const ALL_DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const STANDARD_WORK_WEEK: Omit<WorkDaySchedule, 'day'>[] = [
  { active: false, startTime: { hour: 7, minute: 0 }, endTime: { hour: 17, minute: 0 } }, // Sun
  { active: true,  startTime: { hour: 7, minute: 0 }, endTime: { hour: 17, minute: 0 } }, // Mon
  { active: true,  startTime: { hour: 7, minute: 0 }, endTime: { hour: 17, minute: 0 } }, // Tue
  { active: true,  startTime: { hour: 7, minute: 0 }, endTime: { hour: 17, minute: 0 } }, // Wed
  { active: true,  startTime: { hour: 7, minute: 0 }, endTime: { hour: 17, minute: 0 } }, // Thu
  { active: true,  startTime: { hour: 7, minute: 0 }, endTime: { hour: 17, minute: 0 } }, // Fri
  { active: false, startTime: { hour: 7, minute: 0 }, endTime: { hour: 17, minute: 0 } }, // Sat
];
