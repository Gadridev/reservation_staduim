import { Link } from "react-router-dom";
import type { Stadium } from "../../types";

interface MapPopupProps {
  stadium: Stadium;
  top: string;
  left: string;
}

export function MapPopup({ stadium, top, left }: MapPopupProps) {
  return (
    <div
      style={{ top, left }}
      className="absolute z-20 w-[210px] -translate-x-1/2 -translate-y-[68px] overflow-hidden rounded-xl border border-line bg-chalk shadow-xl"
    >
      <div className="h-[70px] bg-[repeating-linear-gradient(115deg,var(--color-turf)_0_16px,var(--color-turf-light)_16px_32px)]" />
      <div className="p-3">
        <h4 className="mb-1 text-[14px] font-bold text-ink">{stadium.name}</h4>
        <div className="mb-2 flex items-center justify-between text-xs text-ink-soft">
          <span className="font-mono font-semibold text-amber-deep">★ {stadium.rating}</span>
          <span>{stadium.distanceKm} km away</span>
        </div>
        <Link
          to={`/stadiums/${stadium.id}`}
          className="block rounded-lg bg-pitch-dark py-2 text-center text-xs font-bold text-cream hover:bg-pitch"
        >
          View stadium
        </Link>
      </div>
    </div>
  );
}
