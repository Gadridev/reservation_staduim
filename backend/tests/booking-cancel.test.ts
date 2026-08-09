import request from "supertest";
import app from "../src/app.js";
import { Booking } from "../src/modules/booking/booking.model.js";
import { createTestUser, createTestStadium, createTestBooking } from "./helpers.js";
import { completeExpiredBookings } from "../src/modules/booking/booking.service.js";

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

describe("PATCH /api/bookings/:bookingId/cancel", () => {
  it("allows PLAYER to cancel their own CONFIRMED booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Changed my plans for the day" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("rejects PLAYER cancelling another player's booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA } = await createTestUser("PLAYER");
    const { token: tokenB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(playerA._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ reason: "Trying to cancel someone else's booking" });

    expect(res.status).toBe(403);
  });

  it("rejects OWNER cancelling a booking", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ reason: "Owner trying to cancel this booking" });

    expect(res.status).toBe(403);
  });

  it("allows ADMIN to cancel another player's booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const { token: adminToken } = await createTestUser("ADMIN");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Admin cancelling on behalf of the platform" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("rejects cancelling an already CANCELLED booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CANCELLED",
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Trying to cancel again" });

    expect(res.status).toBe(409);
  });

  it("rejects cancelling a COMPLETED booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "COMPLETED",
      startAt: hoursFromNow(-5),
      endAt: hoursFromNow(-4),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Trying to cancel a completed booking" });

    expect(res.status).toBe(409);
  });

  it("allows PLAYER to cancel when more than 2 hours remain", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(3),
      endAt: hoursFromNow(4),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Cancelling well ahead of time" });

    expect(res.status).toBe(200);
  });

  it("allows PLAYER to cancel exactly 2 hours before start", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(2),
      endAt: hoursFromNow(3),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Cancelling right at the deadline" });

    expect(res.status).toBe(200);
  });

  it("rejects PLAYER cancelling when less than 2 hours remain", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(1.98), // 1h59m
      endAt: hoursFromNow(2.98),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Cancelling too close to the start time" });

    expect(res.status).toBe(400);
  });

  it("rejects PLAYER cancelling after the booking has started", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(-1),
      endAt: hoursFromNow(0),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Cancelling after it already started" });

    expect(res.status).toBe(400);
  });

  it("allows ADMIN to cancel even when less than 2 hours remain", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const { token: adminToken } = await createTestUser("ADMIN");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(0.5),
      endAt: hoursFromNow(1.5),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Admin override close to start time" });

    expect(res.status).toBe(200);
  });

  it("rejects a missing reason", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("rejects a reason shorter than 5 characters", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Hi" });

    expect(res.status).toBe(400);
  });

  it("rejects a reason longer than 500 characters", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "a".repeat(501) });

    expect(res.status).toBe(400);
  });

  it("rejects unknown body fields", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Changed plans", status: "CONFIRMED" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid booking ID", async () => {
    const { token } = await createTestUser("PLAYER");

    const res = await request(app)
      .patch("/api/bookings/not-a-valid-id/cancel")
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Trying an invalid booking id" });

    expect(res.status).toBe(400);
  });

  it("stores cancellation data correctly on success", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Verifying stored cancellation fields" });

    expect(res.status).toBe(200);

    const updated = await Booking.findById(booking._id);
    expect(updated!.status).toBe("CANCELLED");
    expect(updated!.cancelledAt).not.toBeNull();
    expect(updated!.cancelledBy!.toString()).toBe(player._id.toString());
    expect(updated!.cancellationReason).toBe("Verifying stored cancellation fields");
  });

  it("frees the slot for another player after cancellation", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA, token: tokenA } = await createTestUser("PLAYER");
    const { token: tokenB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const startAt = hoursFromNow(5);
    const booking = await createTestBooking(playerA._id, stadium._id, {
      startAt,
      endAt: new Date(startAt.getTime() + 60 * 60 * 1000),
    });

    const cancelRes = await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reason: "Freeing up this slot for someone else" });

    expect(cancelRes.status).toBe(200);

    const newBookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        stadiumId: (stadium._id as any).toString(),
        startAt: startAt.toISOString(),
      });

    expect(newBookingRes.status).toBe(201);
  });
});



describe("completeExpiredBookings", () => {
  it("marks a CONFIRMED booking whose endAt has passed as COMPLETED", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CONFIRMED",
      startAt: hoursFromNow(-2),
      endAt: hoursFromNow(-1),
    });

    await completeExpiredBookings();

    const updated = await Booking.findById(booking._id);
    expect(updated!.status).toBe("COMPLETED");
  });

  it("leaves a CONFIRMED booking whose endAt is in the future unchanged", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CONFIRMED",
      startAt: hoursFromNow(1),
      endAt: hoursFromNow(2),
    });

    await completeExpiredBookings();

    const updated = await Booking.findById(booking._id);
    expect(updated!.status).toBe("CONFIRMED");
  });

  it("does not turn an expired CANCELLED booking into COMPLETED", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CANCELLED",
      startAt: hoursFromNow(-2),
      endAt: hoursFromNow(-1),
      cancelledAt: new Date(),
      cancellationReason: "Player cancelled before completion window",
    });

    await completeExpiredBookings();

    const updated = await Booking.findById(booking._id);
    expect(updated!.status).toBe("CANCELLED");
  });

  it("leaves an already COMPLETED booking unchanged", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const originalCompletedAt = hoursFromNow(-1);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "COMPLETED",
      startAt: hoursFromNow(-3),
      endAt: hoursFromNow(-2),
      completedAt: originalCompletedAt,
    });

    await completeExpiredBookings();

    const updated = await Booking.findById(booking._id);
    expect(updated!.status).toBe("COMPLETED");
    expect(updated!.completedAt!.getTime()).toBe(originalCompletedAt.getTime());
  });

  it("sets completedAt when a booking becomes COMPLETED", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CONFIRMED",
      startAt: hoursFromNow(-2),
      endAt: hoursFromNow(-1),
    });

    await completeExpiredBookings();

    const updated = await Booking.findById(booking._id);
    expect(updated!.completedAt).not.toBeNull();
  });

  it("does not set completedAt for a CONFIRMED booking that has not ended", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CONFIRMED",
      startAt: hoursFromNow(1),
      endAt: hoursFromNow(2),
    });

    await completeExpiredBookings();

    const updated = await Booking.findById(booking._id);
    expect(updated!.completedAt).toBeNull();
  });

  it("does not modify cancellation fields during completion", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const cancelledAt = new Date();
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CANCELLED",
      startAt: hoursFromNow(-2),
      endAt: hoursFromNow(-1),
      cancelledBy: player._id,
      cancelledAt,
      cancellationReason: "Original cancellation reason",
    });

    await completeExpiredBookings();

    const updated = await Booking.findById(booking._id);
    expect(updated!.cancelledBy!.toString()).toBe(player._id.toString());
    expect(updated!.cancellationReason).toBe("Original cancellation reason");
    expect(updated!.cancelledAt!.getTime()).toBe(cancelledAt.getTime());
    expect(updated!.completedAt).toBeNull();
  });

  it("is idempotent — running it multiple times does not change an already COMPLETED booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CONFIRMED",
      startAt: hoursFromNow(-2),
      endAt: hoursFromNow(-1),
    });

    await completeExpiredBookings();
    const afterFirstRun = await Booking.findById(booking._id);
    const firstCompletedAt = afterFirstRun!.completedAt!.getTime();

    await completeExpiredBookings();
    const afterSecondRun = await Booking.findById(booking._id);

    expect(afterSecondRun!.status).toBe("COMPLETED");
    expect(afterSecondRun!.completedAt!.getTime()).toBe(firstCompletedAt);
  });
});