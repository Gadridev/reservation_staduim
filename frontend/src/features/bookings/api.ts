import api from "../../api/client";
import type {
  AvailabilityResponse,
  BookingPayload,
  MyBooking,
  OwnerDashboardData,
  OwnerDashboardResponse,
} from "./types";

export async function getAvailability(
  stadiumId: string,
  date: string,
): Promise<AvailabilityResponse> {
  const response = await api.get(`/stadiums/${stadiumId}/availability`, {
    params: { date },
  });

  return response.data.data;
}

export async function createBooking(payload: BookingPayload) {
  const response = await api.post("/bookings", payload);
  return response.data;
}

export async function getMyBookings(): Promise<MyBooking[]> {
  const response = await api.get<{ data: MyBooking[] }>("/bookings/my");
  return response.data.data;
}

export async function cancelBooking({
  bookingId,
  reason,
}: {
  bookingId: string;
  reason: string;
}): Promise<void> {
  await api.patch(`/bookings/${bookingId}/cancel`, { reason });
}

export async function getOwnerDashboard(): Promise<OwnerDashboardData> {
  const response = await api.get<OwnerDashboardResponse>(
    "/bookings/dashboard/owner",
  );

  return response.data.data;
}
