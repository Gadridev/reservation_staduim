import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState } from "../components/ui/States";
import { PageLoadingSkeleton } from "../components/ui/PageLoadingSkeleton";
import { StatisticCard } from "../features/dashboard/components/StatisticCard";
import { StadiumCard } from "../features/stadium/components/StadiumCard";
import { useAuthStore } from "../features/auth/store";
import { useMyBookings } from "../features/bookings/hooks/useMyBookings";
import { groupPlayerBookings } from "../features/bookings/playerBookingsData";
import { useAllStadium } from "../features/stadium/hooks/useAllStadium";
import { useUnreadNotification } from "../features/dashboard/player/hooks/useUnReadNotification";
import { useAllNotifications } from "../features/dashboard/player/hooks/useAllNotifications";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";

  return "Good Evening";
}

function formatNotificationDate(date?: string) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActivityColor(type: string) {
  if (type === "BOOKING_CONFIRMED") return "bg-turf";
  if (type === "BOOKING_CANCELLED") return "bg-danger";

  return "bg-amber-deep";
}

export function PlayerDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const bookingsQuery = useMyBookings();
  const stadiumsQuery = useAllStadium();
  const unreadCountQuery = useUnreadNotification();
  const notificationsQuery = useAllNotifications();

  const isLoading =
    bookingsQuery.isPending ||
    stadiumsQuery.isPending ||
    unreadCountQuery.isPending ||
    notificationsQuery.isPending;

  const hasError =
    bookingsQuery.isError ||
    stadiumsQuery.isError ||
    unreadCountQuery.isError ||
    notificationsQuery.isError;

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  if (hasError) {
    return (
      <div className="mx-auto max-w-[1180px] px-7 py-12">
        <ErrorState
          title="Could not load dashboard"
          description="Some dashboard information could not be loaded."
          onRetry={() => {
            if (bookingsQuery.isError) void bookingsQuery.refetch();
            if (stadiumsQuery.isError) void stadiumsQuery.refetch();
            if (unreadCountQuery.isError) void unreadCountQuery.refetch();
            if (notificationsQuery.isError) void notificationsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const bookingGroups = groupPlayerBookings(bookingsQuery.data ?? []);
  const upcomingBooking = bookingGroups.upcoming[0];

  const stadiums = stadiumsQuery.data ?? [];
  const notifications = (notificationsQuery.data ?? []).slice(0, 3);
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  const statistics = [
    {
      label: "Upcoming bookings",
      value: bookingGroups.upcoming.length,
      tone: "green",
    },
    {
      label: "Completed games",
      value: bookingGroups.completed.length,
      tone: "default",
    },
    {
      label: "Unread notifications",
      value: unreadCount,
      tone: "orange",
    },
  ] as const;

  return (
    <div className="bg-cream pb-16">
      <section className="mx-auto max-w-[1770px] border-t-4 border-amber bg-pitch-dark px-7 py-16 text-cream sm:px-10 lg:px-11">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h1 className="font-display text-[40px] font-black uppercase leading-none tracking-wide sm:text-[54px]">
              {getGreeting()}
              {user?.firstName ? `, ${user.firstName}` : ""}
            </h1>

            <p className="mt-3 text-[15px] text-cream/65 sm:text-lg">
              You have {bookingGroups.upcoming.length} upcoming{" "}
              {bookingGroups.upcoming.length === 1 ? "booking" : "bookings"} and{" "}
              {unreadCount} unread{" "}
              {unreadCount === 1 ? "notification" : "notifications"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-xl border border-white/15 bg-white/[0.07] px-6 py-3.5 text-sm font-semibold text-cream hover:bg-white/[0.12]"
            >
              Find stadium
            </Link>

            <Link
              to="/bookings"
              className="rounded-xl border border-white/15 bg-white/[0.07] px-6 py-3.5 text-sm font-semibold text-cream hover:bg-white/[0.12]"
            >
              My bookings
            </Link>

            <Link
              to="/messages"
              className="rounded-xl border border-white/15 bg-white/[0.07] px-6 py-3.5 text-sm font-semibold text-cream hover:bg-white/[0.12]"
            >
              Messages
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1770px] px-7 pt-10 sm:px-10 lg:px-11">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
          <div>
            {upcomingBooking ? (
              <Card className="grid items-center gap-5 rounded-[18px] px-7 py-7 sm:grid-cols-[96px_minmax(0,1fr)_auto_auto]">
                <div
                  className="h-24 w-24 rounded-[15px] bg-gradient-to-br from-[#238358] to-[#1d704b]"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-ink">
                    {upcomingBooking.stadiumName}
                  </h2>

                  <p className="mt-1 font-mono text-[13px] text-ink-soft">
                    {upcomingBooking.dateTime} · {upcomingBooking.price}
                  </p>
                </div>

                <Badge status={upcomingBooking.status}>
                  {upcomingBooking.status}
                </Badge>

                <Link
                  to="/bookings"
                  className="rounded-[11px] border-2 border-pitch-dark px-5 py-3 text-center text-sm font-bold text-pitch-dark hover:bg-pitch-dark hover:text-cream"
                >
                  View
                </Link>
              </Card>
            ) : (
              <Card>
                <EmptyState
                  icon="⚽"
                  title="No upcoming bookings"
                  description="Your next confirmed booking will appear here."
                />
              </Card>
            )}

            <section className="mt-9">
              <h2 className="font-display text-[28px] font-black uppercase tracking-wide text-ink">
                Recent Activity
              </h2>

              {notifications.length === 0 ? (
                <EmptyState
                  title="No recent activity"
                  description="Your booking updates will appear here."
                />
              ) : (
                <div className="mt-5 divide-y divide-line">
                  {notifications.map((notification) => (
                    <article
                      key={notification._id}
                      className="flex gap-4 py-4 first:pt-2"
                    >
                      <span
                        className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${getActivityColor(
                          notification.type,
                        )}`}
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-sm leading-relaxed text-ink sm:text-base">
                          {notification.message}
                        </p>

                        {notification.createdAt && (
                          <p className="mt-1 font-mono text-xs text-ink-soft">
                            {formatNotificationDate(notification.createdAt)}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="grid content-start gap-5">
            {statistics.map((statistic) => (
              <StatisticCard
                key={statistic.label}
                label={statistic.label}
                value={statistic.value}
                tone={statistic.tone}
              />
            ))}
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-[28px] font-black uppercase tracking-wide text-ink">
            Browse Stadiums
          </h2>

          {stadiums.length === 0 ? (
            <EmptyState
              icon="🏟️"
              title="No stadiums available"
              description="Available stadiums will appear here."
            />
          ) : (
            <div className="mt-5 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {stadiums.slice(0, 3).map((stadium) => (
                <StadiumCard key={stadium._id} stadium={stadium} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
