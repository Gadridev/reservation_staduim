import type { BadgeStatus } from "../../../components/ui/Badge";

export interface PlayerDashboardBooking {
  stadiumName: string;
  dateTime: string;
  price: string;
  status: BadgeStatus;
}

export interface PlayerActivity {
  id: string;
  message: string;
  emphasizedText: string;
  suffix: string;
  time: string;
  tone: "green" | "orange" | "red";
}

export interface DashboardStadium {
  id: string;
  name: string;
  city: string;
  price: string;
  rating: string;
  openUntil: string;
}

export const playerDashboardData = {
  greeting: "Good evening, Ahmed",
  welcomeMessage: "You have 1 upcoming booking and 2 unread notifications.",
  upcomingBooking: {
    stadiumName: "Stade Al Wahda",
    dateTime: "Fri 25 Jul · 20:00–21:00",
    price: "250 DH",
    status: "confirmed",
  } satisfies PlayerDashboardBooking,
  statistics: [
    { label: "Upcoming bookings", value: 1, tone: "green" },
    { label: "Completed games", value: 14, tone: "default" },
    { label: "Unread notifications", value: 2, tone: "orange" },
  ] as const,
  activities: [
    {
      id: "activity-1",
      message: "Your booking at ",
      emphasizedText: "Stade Al Wahda",
      suffix: " is confirmed.",
      time: "2 hours ago",
      tone: "green",
    },
    {
      id: "activity-2",
      message: "New message from ",
      emphasizedText: "Youssef",
      suffix: ", owner of Green Arena.",
      time: "Yesterday",
      tone: "orange",
    },
    {
      id: "activity-3",
      message: "Your booking at ",
      emphasizedText: "Complexe Ennasr",
      suffix: " was cancelled.",
      time: "3 days ago",
      tone: "red",
    },
  ] satisfies PlayerActivity[],
  stadiums: [
    {
      id: "green-arena",
      name: "Green Arena",
      city: "Beni Mellal",
      price: "180 DH / hr",
      rating: "4.6",
      openUntil: "22:00",
    },
    {
      id: "royal-arena",
      name: "Royal Arena",
      city: "Beni Mellal",
      price: "300 DH / hr",
      rating: "4.8",
      openUntil: "00:00",
    },
    {
      id: "complexe-ennasr",
      name: "Complexe Ennasr",
      city: "Beni Mellal",
      price: "200 DH / hr",
      rating: "4.4",
      openUntil: "22:00",
    },
  ] satisfies DashboardStadium[],
};
