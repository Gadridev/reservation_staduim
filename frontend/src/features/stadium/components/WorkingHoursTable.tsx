

import { groupWorkingHours, isOpenNow } from "../../../lib/workingHour";
import type { WorkingHour } from "../types";

interface WorkingHoursTableProps {
  hours: WorkingHour[];
}

export function WorkingHoursTable({ hours }: WorkingHoursTableProps) {
  const groups = groupWorkingHours(hours);
  const openNow = isOpenNow(hours);

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
          Working hours
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            openNow ? "bg-turf/10 text-turf" : "bg-ink-soft/10 text-ink-soft"
          }`}
        >
          {openNow ? "Open now" : "Closed now"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        {groups.map((group) => (
          <div
            key={group.label}
            className={`flex items-center justify-between px-4 py-2.5 text-[13.5px] ${
              group.isToday ? "bg-amber/10" : "bg-chalk"
            } [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line`}
          >
            <span className="font-semibold text-ink">
              {group.label}
              {group.isToday && (
                <span className="ml-2 font-mono text-[10px] font-bold uppercase text-amber-deep">
                  Today
                </span>
              )}
            </span>
            <span
              className={`font-mono ${group.isOpen ? "text-ink" : "text-ink-soft/70"}`}
            >
              {group.hoursLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}