import { Badge } from "../../../components/ui/Badge";
import type { OwnerRecentBooking } from "./ownerDashboardData";

interface RecentBookingsTableProps {
  bookings: OwnerRecentBooking[];
}

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-[18px] border border-line bg-chalk">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead className="bg-[#ede9d9]">
          <tr className="text-xs font-bold uppercase tracking-[0.06em] text-ink-soft">
            <th className="px-6 py-5">Player</th>
            <th className="px-6 py-5">Stadium</th>
            <th className="px-6 py-5">Date &amp; time</th>
            <th className="px-6 py-5">Price</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-6 py-5" aria-label="Action" />
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-t border-line text-sm text-ink">
              <td className="px-6 py-5">{booking.playerName}</td>
              <td className="px-6 py-5">{booking.stadiumName}</td>
              <td className="px-6 py-5">{booking.dateTime}</td>
              <td className="px-6 py-5">{booking.price}</td>
              <td className="px-6 py-5">
                <Badge status={booking.status}>
                  {booking.status}
                </Badge>
              </td>
              <td className="px-6 py-5 text-right">
                <button
                  type="button"
                  className="font-semibold text-ink-soft hover:text-pitch-dark"
                >
                  {booking.action}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
