import { useState } from "react";
import { Link } from "react-router-dom";
import { DateStrip, type DateOption } from "./DateStrip";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getBookingDates(): DateOption[] {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      id: formatDate(date),
      dayOfWeek: date
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      dayOfMonth: date.getDate(),
    };
  });
}

interface BookingPanelProps {
  stadiumId: string;
  pricePerHour: number;
}

export function BookingPanel({ stadiumId, pricePerHour }: BookingPanelProps) {
  const [dates] = useState(getBookingDates);
  const [selectedDate, setSelectedDate] = useState(dates[0].id);

  return (
    <div className="sticky top-24 rounded-[14px] bg-pitch-dark p-6 text-cream">
      <p className="font-mono text-[30px] font-semibold text-amber">
        {pricePerHour} DH <span className="text-[13px] font-normal text-cream/60">/ hour</span>
      </p>
      <p className="mb-4 mt-1 text-[13px] text-cream/70">Pick a date to see live availability</p>

      <DateStrip dates={dates} selectedId={selectedDate} onSelect={setSelectedDate} />

      <Link
        to={`/bookings/${stadiumId}?date=${selectedDate}`}
        className="bg-amber block w-full rounded-[10px]  py-3.5 text-center text-sm font-extrabold uppercase tracking-wide text-pitch-dark hover:bg-amber-deep"
      >
        See time slots
      </Link>

      <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-cream/55">
        Live availability is checked when you continue.
      </p>
    </div>
  );
}
