
import type { Stadium } from "../../types";

interface StadiumListCardProps {
  stadium: Stadium;
  isSelected: boolean;
  onClick: () => void;
}

export function StadiumListCard({ stadium, isSelected, onClick }: StadiumListCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-colors ${
        isSelected ? "border-amber bg-amber/10" : "border-line bg-chalk hover:border-ink-soft/30"
      }`}
    >
      <div
        className="h-16 w-16 flex-shrink-0 rounded-lg bg-pitch-dark/20 bg-cover bg-center"
        style={
          stadium.primaryImageUrl
            ? { backgroundImage: `url(${stadium.primaryImageUrl})` }
            : undefined
        }
      />
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-bold text-ink">{stadium.name}</h3>
        <div className="mb-1 flex items-center gap-2 text-xs text-ink-soft">
          <span className="font-mono font-semibold text-amber-deep">
            ★ {stadium.averageRating > 0 ? stadium.averageRating.toFixed(1) : "New"}
          </span>
          <span className="truncate">{stadium.location.city}</span>
        </div>
        <p className="font-mono text-[13px] font-bold text-turf">{stadium.pricePerHour} DH / hr</p>
      </div>
    </button>
  );
}
