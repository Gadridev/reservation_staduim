

import type { WorkingHour } from "../features/stadium/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface WorkingHoursGroup {
  label: string;
  hoursLabel: string;
  isOpen: boolean;
  isToday: boolean;
}

function toMondayFirst(hours: WorkingHour[]): WorkingHour[] {
  return [...hours].sort((a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7));
}

function sameSchedule(a: WorkingHour, b: WorkingHour): boolean {
  return a.isOpen === b.isOpen && a.openTime === b.openTime && a.closeTime === b.closeTime;
}

export function groupWorkingHours(hours: WorkingHour[]): WorkingHoursGroup[] {
  const ordered = toMondayFirst(hours);
  const today = new Date().getDay();
  const groups: WorkingHoursGroup[] = [];

  let i = 0;
  while (i < ordered.length) {
    const start = ordered[i];
    let j = i;
    while (j + 1 < ordered.length && sameSchedule(ordered[j + 1], start)) {
      j++;
    }

    const startLabel = DAY_LABELS[start.dayOfWeek];
    const endLabel = DAY_LABELS[ordered[j].dayOfWeek];
    const label = i === j ? startLabel : `${startLabel} – ${endLabel}`;
    const hoursLabel = start.isOpen ? `${start.openTime} – ${start.closeTime}` : "Closed";
    const isToday = ordered.slice(i, j + 1).some((d) => d.dayOfWeek === today);

    groups.push({ label, hoursLabel, isOpen: start.isOpen, isToday });
    i = j + 1;
  }

  return groups;
}

export function isOpenNow(hours: WorkingHour[]): boolean {
  const now = new Date();
  const today = hours.find((d) => d.dayOfWeek === now.getDay());
  if (!today || !today.isOpen || !today.openTime || !today.closeTime) return false;

  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current >= today.openTime && current < today.closeTime;
}