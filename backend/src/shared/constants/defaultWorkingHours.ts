export interface DefaultWorkingHourEntry {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export const DEFAULT_WORKING_HOURS: DefaultWorkingHourEntry[] = [
  { dayOfWeek: 0, isOpen: true, openTime: "08:00", closeTime: "23:00" },
  { dayOfWeek: 1, isOpen: true, openTime: "08:00", closeTime: "23:00" },
  { dayOfWeek: 2, isOpen: true, openTime: "08:00", closeTime: "23:00" },
  { dayOfWeek: 3, isOpen: true, openTime: "08:00", closeTime: "23:00" },
  { dayOfWeek: 4, isOpen: true, openTime: "08:00", closeTime: "23:00" },
  { dayOfWeek: 5, isOpen: true, openTime: "08:00", closeTime: "23:00" },
  { dayOfWeek: 6, isOpen: true, openTime: "08:00", closeTime: "23:00" },
];
