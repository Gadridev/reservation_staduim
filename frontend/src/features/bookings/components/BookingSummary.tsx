import type { BookingSlot } from "../types";

interface BookingSummaryProps {
  selectedDate: string;
  selectedSlot: BookingSlot | null;
  isPending: boolean;
  onConfirm: () => void;
}

export function BookingSummary({
  selectedDate,
  selectedSlot,
  isPending,
  onConfirm,
}: BookingSummaryProps) {
  const canConfirm = selectedSlot !== null && !isPending;

  return (
    <section className="grid gap-6 rounded-2xl border border-[#deded6] bg-white px-7 py-6 md:grid-cols-[1fr_1fr_auto] md:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#526159]">
          Selected slot
        </p>

        <p className="mt-1 font-mono text-lg font-bold text-[#17231e]">
          {selectedSlot
            ? `${selectedSlot.startTime}–${selectedSlot.endTime}`
            : "Choose an available slot"}
        </p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#526159]">
          Date
        </p>
        <p className="mt-1 font-mono text-lg font-bold text-[#17231e]">
          {selectedDate}
        </p>
      </div>

      <button
        type="button"
        disabled={!canConfirm}
        className="h-12 rounded-xl bg-[#217a4e] px-8 font-semibold text-white transition hover:bg-[#1b6842] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onConfirm}
      >
        {isPending ? "Confirming..." : "Confirm booking"}
      </button>
    </section>
  );
}
