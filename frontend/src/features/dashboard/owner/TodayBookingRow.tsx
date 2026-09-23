import { Badge } from "../../../components/ui/Badge";
import type { OwnerTodayBooking } from "./ownerDashboardData";

interface TodayBookingRowProps {
  booking: OwnerTodayBooking;
}

const avatarClasses: Record<OwnerTodayBooking["avatarTone"], string> = {
  dark: "bg-[#0d4635]",
  green: "bg-[#1f8055]",
  orange: "bg-[#e89517]",
};

export function TodayBookingRow({ booking }: TodayBookingRowProps) {
  return (
    <article className="grid items-center gap-5 rounded-[18px] border border-line bg-chalk px-7 py-7 sm:grid-cols-[minmax(190px,1.45fr)_minmax(150px,0.9fr)_110px_auto] lg:grid-cols-[minmax(270px,1.65fr)_minmax(180px,1fr)_140px_150px_180px]">
      <div className="flex min-w-0 items-center gap-5">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${avatarClasses[booking.avatarTone]}`}
        >
          {booking.playerName.charAt(0)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-ink">
            {booking.playerName}
          </h3>
          <p className="truncate text-sm text-ink-soft">{booking.stadiumName}</p>
        </div>
      </div>

      <div className="sm:text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          {booking.date}
        </p>
        <p className="mt-1 font-mono text-sm text-ink">{booking.time}</p>
      </div>

      <p className="font-mono text-base font-semibold text-turf">
        {booking.price}
      </p>

      <div>
        <Badge status={booking.status}>{booking.status}</Badge>
      </div>

      <button
        type="button"
        className="rounded-[10px] border border-line px-5 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-pitch-dark hover:text-pitch-dark sm:col-span-4 lg:col-span-1"
      >
        Message player
      </button>
    </article>
  );
}
