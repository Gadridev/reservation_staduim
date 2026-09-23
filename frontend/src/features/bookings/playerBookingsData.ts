import type { BadgeStatus } from "../../components/ui/Badge";
import type { MyBooking } from "./types";

export type PlayerBookingTab = "upcoming" | "completed" | "cancelled";

export interface PlayerBookingPreview {
  id: string;
  stadiumName: string;
  dateTime: string;
  price: string;
  status: BadgeStatus;
  actions: Array<"cancel" | "contact" | "details" | "review">;
}

export const playerBookingTabs: Array<{
  id: PlayerBookingTab;
  label: string;
}> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

type PlayerBookingsByTab = Record<PlayerBookingTab, PlayerBookingPreview[]>;

const statusToTab: Record<string, PlayerBookingTab | undefined> = {
  CONFIRMED: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatBookingDateTime(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startAt}–${endAt}`;
  }

  const dateParts = dateFormatter.formatToParts(start);
  const weekday = dateParts.find((part) => part.type === "weekday")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;

  return `${weekday} ${day} ${month} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`;
}

export function groupPlayerBookings(bookings: MyBooking[]): PlayerBookingsByTab {
  const grouped: PlayerBookingsByTab = {
    upcoming: [],
    completed: [],
    cancelled: [],
  };

  bookings.forEach((booking) => {
    const normalizedStatus = booking.status.toUpperCase();
    const tab = statusToTab[normalizedStatus];

    if (!tab) return;

    const status = normalizedStatus.toLowerCase() as BadgeStatus;

    grouped[tab].push({
      id: booking._id,
      stadiumName: booking.stadiumId.name,
      dateTime: formatBookingDateTime(booking.startAt, booking.endAt),
      price: `${booking.price} ${booking.currency}`,
      status,
      actions:
        tab === "upcoming"
          ? ["cancel", "contact"]
          : tab === "completed"
            ? ["review"]
            : ["details"],
    });
  });

  return grouped;
}
