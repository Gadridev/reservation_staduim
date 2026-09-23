import type { BadgeStatus } from "../../../components/ui/Badge";

export interface OwnerTodayBooking {
  id: string;
  playerName: string;
  stadiumName: string;
  date: string;
  time: string;
  price: string;
  status: BadgeStatus;
  avatarTone: "dark" | "green" | "orange";
}

export interface OwnerRecentBooking {
  id: string;
  playerName: string;
  stadiumName: string;
  dateTime: string;
  price: string;
  status: BadgeStatus;
  action: string;
}
