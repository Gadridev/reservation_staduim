import { Card } from "../../../components/ui/Card";
import type { DashboardStadium } from "./playerDashboardData";

interface PlayerStadiumCardProps {
  stadium: DashboardStadium;
}

export function PlayerStadiumCard({ stadium }: PlayerStadiumCardProps) {
  return (
    <Card className="overflow-hidden rounded-[18px]">
      <div className="relative h-[224px] bg-gradient-to-br from-[#217b52] to-[#17683f]">
        <span className="absolute bottom-4 left-4 rounded-lg bg-pitch-dark px-3 py-2 font-mono text-[13px] font-semibold text-amber">
          {stadium.price}
        </span>
      </div>

      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-[26px] font-black uppercase leading-none tracking-wide text-ink">
            {stadium.name}
          </h3>
          <span className="whitespace-nowrap font-mono text-sm font-semibold text-amber-deep">
            <span aria-hidden="true">★</span> {stadium.rating}
          </span>
        </div>

        <p className="mt-3 text-sm text-ink-soft">
          <span aria-hidden="true">📍</span> {stadium.city}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4">
          <p className="font-mono text-[13px] text-ink-soft">
            Open until {stadium.openUntil}
          </p>
          <button
            type="button"
            className="rounded-[10px] border-2 border-pitch-dark px-5 py-2.5 text-sm font-bold text-pitch-dark transition-colors hover:bg-pitch-dark hover:text-cream"
          >
            View
          </button>
        </div>
      </div>
    </Card>
  );
}
