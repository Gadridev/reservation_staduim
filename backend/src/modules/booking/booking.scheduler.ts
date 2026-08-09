import { completeExpiredBookings } from "./booking.service.js";

const INTERVAL_MS = 60 * 1000; 

let intervalId: NodeJS.Timeout | null = null;

export function startBookingCompletionScheduler(): void {
  if (intervalId) {
    return;
  }

  intervalId = setInterval(async () => {
    try {
      const completedCount = await completeExpiredBookings();
      if (completedCount > 0) {
        console.log(`[booking-scheduler] Completed ${completedCount} expired booking(s)`);
      }
    } catch (err) {
      console.error("[booking-scheduler] Failed to complete expired bookings:", err);
    }
  }, INTERVAL_MS);
}

export function stopBookingCompletionScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}