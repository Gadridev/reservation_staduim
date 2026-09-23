export type SlotStatus = "available" | "booked";

export interface BookingDay {
  label: string;
  dayNumber: number;
  date: string;
  isToday: boolean;
}

export interface BookingSlot {
  startTime: string;
  endTime: string;
  status: SlotStatus;
}

export interface AvailabilityResponse {
  slots: BookingSlot[];
}

export interface BookingPayload {
  stadiumId: string;
  startAt: string;
}

export interface MyBooking {
  _id: string;
  playerId: string;
  stadiumId: {
    _id: string;
    name: string;
  };
  startAt: string;
  endAt: string;
  price: number;
  currency: string;
  status: string;
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OwnerDashboardPlayer {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface OwnerDashboardStadium {
  _id: string;
  name: string;
}

export interface OwnerDashboardBooking {
  _id: string;
  playerId: OwnerDashboardPlayer | null;
  stadiumId: OwnerDashboardStadium;
  startAt: string;
  endAt: string;
  price: number;
  currency: string;
  status: string;
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OwnerDashboardData {
  stats: {
    todaysBookings: number;
    upcomingBookings: number;
    cancelledThisMonth: number;
    totalRevenue: number;
    currency: string;
  };
  todayBookings: OwnerDashboardBooking[];
  recentBookings: OwnerDashboardBooking[];
}

export interface OwnerDashboardResponse {
  success: boolean;
  data: OwnerDashboardData;
}
