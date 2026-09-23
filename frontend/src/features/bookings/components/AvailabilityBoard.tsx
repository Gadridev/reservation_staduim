import type { BookingSlot } from "../types";

function getSlotClasses(status: BookingSlot["status"], isSelected: boolean) {
  if (isSelected) {
    return `
      border-[#d98f18]
      bg-[#f8ab39]
      text-[#0e2c22]
    `;
  }

  if (status === "booked") {
    return `
      cursor-not-allowed
      border-[#285545]
      bg-[#123e30]
      text-[#486f61]
    `;
  }

  return `
    border-[#7e6720]
    bg-[#173d30]
    text-[#f3a620]
  `;
}
interface AvailabilityBoardProps {
  slots: BookingSlot[];
  selectedSlot: BookingSlot | null;
  onSelectSlot: (slot: BookingSlot) => void;
}

export function AvailabilityBoard({
  slots,
  selectedSlot,
  onSelectSlot,
}: AvailabilityBoardProps) {
  return (
    <section className="rounded-[20px] bg-[#073c2c] px-7 py-7 shadow-xl shadow-[#0d3020]/10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-extrabold uppercase tracking-tight text-white">
          Availability Board
        </h2>

      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.startTime === slot.startTime;
          const isBooked = slot.status === "booked";

          return (
            <button
              key={slot.startTime}
              type="button"
              disabled={isBooked}
              aria-pressed={isSelected}
              className={[
                "flex h-[70px] flex-col items-center justify-center rounded-[11px] border",
                getSlotClasses(slot.status, isSelected),
              ].join(" ")}
              onClick={() => onSelectSlot(slot)}
            >
              <span className="text-[15px] font-bold">{slot.startTime}</span>

              <span className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
                Until {slot.endTime}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-[#94a89f]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px] border border-[#9a7722] bg-[#173d30]" />
          Available
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px] bg-[#f8ab39]" />
          Selected
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px] bg-[#285545]" />
          Booked
        </div>
      </div>
    </section>
  );
}
