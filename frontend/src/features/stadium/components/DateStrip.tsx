export interface DateOption {
  id: string;
  dayOfWeek: string;
  dayOfMonth: number;
}

interface DateStripProps {
  dates: DateOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DateStrip({ dates, selectedId, onSelect }: DateStripProps) {
  return (
    <div className="mb-4 grid grid-cols-7 gap-1.5">
      {dates.map((date) => {
        const isSelected = date.id === selectedId;
        return (
          <button
            key={date.id}
            type="button"
            onClick={() => onSelect(date.id)}
            className={`rounded-lg px-1 py-2 text-center font-mono text-[11px] transition-colors ${
              isSelected ? "bg-amber text-pitch-dark" : "bg-white/[0.06] text-cream hover:bg-white/10"
            }`}
          >
            {date.dayOfWeek}
            <span className="mt-0.5 block text-sm font-bold">{date.dayOfMonth}</span>
          </button>
        );
      })}
    </div>
  );
}
