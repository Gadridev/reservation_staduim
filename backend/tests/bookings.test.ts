import request from "supertest";
import app from "../src/app.js";
import { createTestUser, createTestStadium } from "./helpers.js";
import { Booking } from "../src/modules/booking/booking.model.js";

describe("POST /api/bookings — smoke test", () => {
  it("creates a booking successfully for a valid PLAYER request", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { token: playerToken } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 1);
    startAt.setHours(18, 0, 0, 0);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        stadiumId: (stadium._id as any).toString(),
        startAt: startAt.toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("CONFIRMED");
    expect(res.body.data.price).toBe(100);
  });

  it("rejects booking creation for OWNER role", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 1);
    startAt.setHours(18, 0, 0, 0);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        stadiumId: (stadium._id as any).toString(),
        startAt: startAt.toISOString(),
      });

    expect(res.status).toBe(403);
  });

  it("rejects a booking that does not start on an exact hour", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { token: playerToken } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 1);
    startAt.setHours(18, 30, 0, 0);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: stadium._id.toString(), startAt: startAt.toISOString() });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Booking must start on an exact hour");
  });
});

describe("GET /api/bookings/dashboard/owner", () => {
  it("returns only the owner's booking counts", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const { user: otherOwner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const otherStadium = await createTestStadium(otherOwner._id);
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 1);
    startAt.setHours(18, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

    await Booking.create([
      { playerId: player._id, stadiumId: stadium._id, startAt, endAt, price: 100, currency: "MAD", status: "CONFIRMED" },
      { playerId: player._id, stadiumId: otherStadium._id, startAt, endAt, price: 200, currency: "MAD", status: "CONFIRMED" },
    ]);

    const res = await request(app)
      .get("/api/bookings/dashboard/owner")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.stats.upcomingBookings).toBe(1);
    expect(res.body.data.recentBookings).toHaveLength(1);
  });

  it("rejects players", async () => {
    const { token } = await createTestUser("PLAYER");
    const res = await request(app)
      .get("/api/bookings/dashboard/owner")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
