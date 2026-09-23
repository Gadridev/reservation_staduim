import type { BookingDay } from "../types";

interface Props {
  selectedDate: string;
  onSelectedDate: (date: string) => void;
  days: BookingDay[];
}

export function BookingDatePicker({
  selectedDate,
  onSelectedDate,
  days,
}: Props) {
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectedDate(day.date)}
              className={[
                "flex h-17 w-17 flex-col items-center justify-center rounded-xl border transition",
                isSelected
                  ? "border-[#0d3c2d] bg-[#0d3c2d] text-white"
                  : "border-[#d9ddd7] bg-white text-[#17221e]",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[10px] font-medium tracking-wider",
                  isSelected ? "text-[#6d927f]" : "text-[#737d77]",
                ].join(" ")}
              >
                {day.label}
              </span>

              <span
                className={[
                  "mt-1 text-xl font-bold",
                  isSelected ? "text-[#f5a623]" : "",
                ].join(" ")}
              >
                {day.dayNumber}
              </span>

              {day.isToday && (
                <span className="mt-1 text-[8px] font-bold uppercase">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4">
        Selected date: <strong>{selectedDate}</strong>
      </p>
    </div>
  );
}
