import { useState } from "react";
import { Link } from "react-router-dom";
import type { BadgeStatus } from "../components/ui/Badge";
import { EmptyState, ErrorState } from "../components/ui/States";
import { PageLoadingSkeleton } from "../components/ui/PageLoadingSkeleton";
import { StatisticCard } from "../features/dashboard/components/StatisticCard";
import { RecentBookingsTable } from "../features/dashboard/owner/RecentBookingsTable";
import { TodayBookingRow } from "../features/dashboard/owner/TodayBookingRow";
import type {
  OwnerRecentBooking,
  OwnerTodayBooking,
} from "../features/dashboard/owner/ownerDashboardData";
import { useOwnerDashboard } from "../features/bookings/hooks/useOwnerDashboard";
import { CreateStadiumModal } from "../features/dashboard/owner/CreateStadiumModal";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
    .format(new Date(value))
    .replace(",", "");
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatStatus(status: string): BadgeStatus {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "confirmed" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "cancelled"
  ) {
    return normalizedStatus;
  }

  return "pending";
}

export function OwnerDashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dashboardQuery = useOwnerDashboard();

  if (dashboardQuery.isPending) {
    return <PageLoadingSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="mx-auto max-w-[1180px] px-7 py-12">
        <ErrorState
          title="Could not load owner dashboard"
          description={dashboardQuery.error.message}
          onRetry={() => void dashboardQuery.refetch()}
        />
      </div>
    );
  }

  const { stats, todayBookings, recentBookings } = dashboardQuery.data;

  const stadiumNames = Array.from(
    new Set(
      [...todayBookings, ...recentBookings].map(
        (booking) => booking.stadiumId.name,
      ),
    ),
  ).join(" · ");

  const statistics = [
    {
      label: "Today's bookings",
      value: stats.todaysBookings,
      tone: "green",
    },
    {
      label: "Upcoming bookings",
      value: stats.upcomingBookings,
      tone: "orange",
    },
    {
      label: "Cancelled this month",
      value: stats.cancelledThisMonth,
      tone: "red",
    },
    {
      label: "Total revenue",
      value: `${stats.totalRevenue} ${stats.currency}`,
      tone: "default",
    },
  ] as const;

  const avatarTones = ["dark", "green", "orange"] as const;

  const formattedTodayBookings: OwnerTodayBooking[] = todayBookings.map(
    (booking, index) => ({
      id: booking._id,
      playerName: booking.playerId
        ? `${booking.playerId.firstName} ${booking.playerId.lastName}`
        : "Unavailable player",
      stadiumName: booking.stadiumId.name,
      date: formatDate(booking.startAt),
      time: `${formatTime(booking.startAt)} – ${formatTime(booking.endAt)}`,
      price: `${booking.price} ${booking.currency}`,
      status: formatStatus(booking.status),
      avatarTone: avatarTones[index % avatarTones.length],
    }),
  );

  const formattedRecentBookings: OwnerRecentBooking[] = recentBookings.map(
    (booking) => ({
      id: booking._id,
      playerName: booking.playerId
        ? `${booking.playerId.firstName} ${booking.playerId.lastName}`
        : "Unavailable player",
      stadiumName: booking.stadiumId.name,
      dateTime: `${formatDate(booking.startAt)} · ${formatTime(
        booking.startAt,
      )}–${formatTime(booking.endAt)}`,
      price: `${booking.price} ${booking.currency}`,
      status: formatStatus(booking.status),
      action: "View details",
    }),
  );

  return (
    <div className="bg-cream pb-16">
      <div className="mx-auto max-w-[1770px] px-7 py-8 sm:px-10 lg:px-11">
        <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-[42px] font-black uppercase leading-none tracking-wide text-ink">
              Owner Dashboard
            </h1>

            <p className="mt-3 text-base text-ink-soft">
              {stadiumNames || "Your stadium booking overview"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/owner/photos"
              className="self-start rounded-[12px] border border-pitch-dark px-7 py-4 text-sm font-bold text-pitch-dark hover:bg-pitch-dark hover:text-cream"
            >
              Manage photos
            </Link>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="self-start rounded-[12px] bg-pitch-dark px-7 py-4 text-sm font-bold text-cream transition-colors hover:bg-pitch sm:self-auto"
            >
              + Add stadium
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((statistic) => (
            <StatisticCard
              key={statistic.label}
              label={statistic.label}
              value={statistic.value}
              tone={statistic.tone}
              className="xl:min-h-[144px]"
            />
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-[28px] font-black uppercase tracking-wide text-ink">
            Today&apos;s Bookings
          </h2>

          <p className="mt-1 text-sm text-ink-soft sm:text-base">
            Bookings are confirmed instantly when a player reserves a slot —
            there&apos;s nothing to approve.
          </p>

          {formattedTodayBookings.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No bookings today"
              description="Today's bookings will appear here."
            />
          ) : (
            <div className="mt-6 grid gap-4">
              {formattedTodayBookings.map((booking) => (
                <TodayBookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-[28px] font-black uppercase tracking-wide text-ink">
            Recent Bookings
          </h2>

          {formattedRecentBookings.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No recent bookings"
              description="Recent stadium bookings will appear here."
            />
          ) : (
            <div className="mt-5">
              <RecentBookingsTable bookings={formattedRecentBookings} />
            </div>
          )}
        </section>
      </div>

      <CreateStadiumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
