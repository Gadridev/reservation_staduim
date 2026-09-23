import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState } from "../components/ui/States";
import { Skeleton } from "../components/ui/Skeleton";
import {
  groupPlayerBookings,
  playerBookingTabs,
  type PlayerBookingPreview,
  type PlayerBookingTab,
} from "../features/bookings/playerBookingsData";
import { useMyBookings } from "../features/bookings/hooks/useMyBookings";
import { CancelBookingModal } from "../features/bookings/components/CancelBookingModal";
import { CreateReviewModal } from "../features/stadium/components/CreateReviewModal";

const actionLabels: Record<PlayerBookingPreview["actions"][number], string> = {
  cancel: "Cancel",
  contact: "Contact owner",
  details: "View details",
  review: "Leave review",
};

export function PlayerBookingsPage() {
  const [activeTab, setActiveTab] = useState<PlayerBookingTab>("upcoming");
  const [reviewBooking, setReviewBooking] = useState<{
    bookingId: string;
    stadiumName: string;
  } | null>(null);
  const [cancelBooking, setCancelBooking] = useState<{
    bookingId: string;
    stadiumName: string;
  } | null>(null);
  const bookingsQuery = useMyBookings();
  const playerBookingsByTab = groupPlayerBookings(bookingsQuery.data ?? []);
  const bookings = playerBookingsByTab[activeTab];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-cream pb-16">
      <div className="mx-auto max-w-[1770px] px-7 pt-10 sm:px-10 lg:px-7">
        <h1 className="font-display text-[44px] font-black uppercase leading-none tracking-wide text-ink sm:text-[54px]">
          My Bookings
        </h1>

        <div
          className="mt-10 grid w-full max-w-[568px] grid-cols-3 rounded-[16px] border border-line bg-chalk p-1.5"
          aria-label="Booking status"
        >
          {playerBookingTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-0 rounded-[12px] px-2 py-4 text-sm font-bold transition-colors sm:px-5 sm:text-lg ${
                  isActive
                    ? "bg-pitch-dark text-amber"
                    : "text-ink-soft hover:bg-cream/70 hover:text-ink"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-2 font-mono text-[0.9em]">
                  {bookingsQuery.isPending ? "–" : playerBookingsByTab[tab.id].length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-5">
          {bookingsQuery.isPending ? (
            <Card
              className="grid min-h-32 items-center gap-6 rounded-[20px] px-7 py-6 sm:px-8 lg:grid-cols-[minmax(360px,1.75fr)_minmax(110px,0.75fr)_minmax(170px,0.85fr)_auto] lg:gap-10"
              role="status"
              aria-label="Loading bookings"
            >
              <div className="flex items-center gap-5">
                <Skeleton className="h-[78px] w-[78px] shrink-0 rounded-[14px]" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-44 max-w-full" />
                  <Skeleton className="mt-3 h-4 w-56 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-11 w-36 rounded-[12px]" />
              <span className="sr-only">Loading bookings…</span>
            </Card>
          ) : bookingsQuery.isError ? (
            <ErrorState
              title="Could not load bookings"
              description={bookingsQuery.error.message}
              onRetry={() => void bookingsQuery.refetch()}
            />
          ) : bookings.length === 0 ? (
            <Card>
              <EmptyState
                icon="🏟️"
                title={`No ${activeTab} bookings`}
                description="Bookings in this category will appear here."
              />
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card
                key={booking.id}
                className="grid items-center gap-6 rounded-[20px] px-7 py-6 sm:px-8 lg:min-h-32 lg:grid-cols-[minmax(360px,1.75fr)_minmax(110px,0.75fr)_minmax(170px,0.85fr)_auto] lg:gap-10"
              >
                <div className="flex min-w-0 items-center gap-5">
                  <div
                    className="h-[78px] w-[78px] shrink-0 rounded-[14px] bg-[#237c50]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-ink sm:text-2xl">
                      {booking.stadiumName}
                    </h2>
                    <p className="mt-1 font-mono text-sm text-ink-soft sm:text-base">
                      {booking.dateTime}
                    </p>
                  </div>
                </div>

                <p className="font-mono text-lg font-bold text-turf sm:text-xl">
                  {booking.price}
                </p>

                <div>
                  <Badge status={booking.status}>{booking.status}</Badge>
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  {booking.actions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        if (action === "cancel") {
                          setCancelBooking({
                            bookingId: booking.id,
                            stadiumName: booking.stadiumName,
                          });
                        }
                        if (action === "review") {
                          setReviewBooking({
                            bookingId: booking.id,
                            stadiumName: booking.stadiumName,
                          });
                        }
                      }}
                      className={`whitespace-nowrap rounded-[12px] border bg-chalk px-5 py-3 text-sm font-bold transition-colors sm:text-base ${
                        action === "cancel"
                          ? "border-danger/35 text-danger hover:bg-danger/5"
                          : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
                      }`}
                    >
                      {actionLabels[action]}
                    </button>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {reviewBooking && (
        <CreateReviewModal
          bookingId={reviewBooking.bookingId}
          stadiumName={reviewBooking.stadiumName}
          onClose={() => setReviewBooking(null)}
        />
      )}
      {cancelBooking && (
        <CancelBookingModal
          bookingId={cancelBooking.bookingId}
          stadiumName={cancelBooking.stadiumName}
          onClose={() => setCancelBooking(null)}
        />
      )}
    </div>
  );
}
