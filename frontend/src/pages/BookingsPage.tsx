import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ErrorState } from "../components/ui/States";
import { AvailabilityBoard } from "../features/bookings/components/AvailabilityBoard";
import { BookingDatePicker } from "../features/bookings/components/BookingDatePicker";
import { BookingProgress } from "../features/bookings/components/BookingsProgress";
import { BookingSummary } from "../features/bookings/components/BookingSummary";
import { useAvailabilityBookings } from "../features/bookings/hooks/useAvailabilityBookings";
import { useCreateBooking } from "../features/bookings/hooks/useBookings";
import type {
  BookingDay,
  BookingSlot,
} from "../features/bookings/types";
import { AvailabilityBoardSkeleton } from "../features/bookings/components/AvailabilityBoardSkeleton";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getBookingDays(): BookingDay[] {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + index);

    return {
      label: currentDate
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase(),
      dayNumber: currentDate.getDate(),
      date: formatDate(currentDate),
      isToday: formatDate(currentDate) === formatDate(today),
    };
  });
}

export function BookingPage() {
  const { stadiumId } = useParams<{ stadiumId: string }>();
  const [searchParams] = useSearchParams();
  const days = useMemo(() => getBookingDays(), []);
  const [selectedDate, setSelectedDate] = useState(
    () => searchParams.get("date") ?? formatDate(new Date()),
  );
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  const availabilityQuery = useAvailabilityBookings(stadiumId, selectedDate);
  const createBookingMutation = useCreateBooking();

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleBooking() {
    if (!stadiumId || !selectedSlot) return;

    const startAt = new Date(
      `${selectedDate}T${selectedSlot.startTime}:00`,
    ).toISOString();

    createBookingMutation.mutate(
      { stadiumId, startAt },
      { onSuccess: () => setSelectedSlot(null) },
    );
  }

  if (!stadiumId) {
    return (
      <main className="min-h-screen bg-[#f4f0e3] px-5 py-12 text-[#17231e]">
        <ErrorState description="The stadium link is incomplete." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f0e3] text-[#17231e]">
      <div className="mx-auto w-full max-w-[1020px] px-5 py-12 md:px-8">
        <BookingProgress />

        <section className="mt-7">
          <p className="font-mono text-sm uppercase tracking-[0.32em] text-[#e68a19]">
            Step 2 of 2 — Confirm your booking
          </p>

          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] text-[#10231c]">
            Choose a time slot
          </h1>

          <p className="mt-1 text-sm font-medium text-[#68736d]">
            Select a date to see the stadium&apos;s current availability.
          </p>
        </section>

        <section className="mt-7">
          <BookingDatePicker
            selectedDate={selectedDate}
            onSelectedDate={handleDateChange}
            days={days}
          />
        </section>

        <section className="mt-9">
          {availabilityQuery.isPending ? (
            <AvailabilityBoardSkeleton />
          ) : availabilityQuery.isError ? (
            <ErrorState
              title="Could not load availability"
              description={availabilityQuery.error.message}
              onRetry={() => void availabilityQuery.refetch()}
            />
          ) : availabilityQuery.data.slots.length === 0 ? (
            <div className="rounded-[20px] bg-[#073c2c] px-7 py-16 text-center text-white">
              No time slots are available for this date.
            </div>
          ) : (
            <AvailabilityBoard
              slots={availabilityQuery.data.slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          )}
        </section>

        <section className="mt-7">
          <BookingSummary
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            isPending={createBookingMutation.isPending}
            onConfirm={handleBooking}
          />
        </section>
      </div>
    </main>
  );
}
