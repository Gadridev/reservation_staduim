import request from "supertest";
import app from "../src/app.js";
import { createTestUser, createTestStadium, createTestBooking } from "./helpers.js";

describe("GET /api/bookings/:bookingId", () => {
  it("allows PLAYER to view their own booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id);

    const res = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(booking._id.toString());
  });

  it("rejects PLAYER viewing another player's booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA } = await createTestUser("PLAYER");
    const { token: tokenB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(playerA._id, stadium._id);

    const res = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it("allows OWNER to view a booking for their own stadium", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id);

    const res = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });

  it("rejects OWNER viewing a booking from another owner's stadium", async () => {
    const { user: ownerA } = await createTestUser("OWNER");
    const { token: ownerBToken } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(ownerA._id);
    const booking = await createTestBooking(player._id, stadium._id);

    const res = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${ownerBToken}`);

    expect(res.status).toBe(403);
  });

  it("allows ADMIN to view any booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const { token: adminToken } = await createTestUser("ADMIN");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id);

    const res = await request(app)
      .get(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("returns 404 for a non-existing booking", async () => {
    const { token } = await createTestUser("PLAYER");

    const res = await request(app)
      .get("/api/bookings/507f191e810c19729de860ea")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("GET /api/bookings/my", () => {
  it("returns only the authenticated player's bookings", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA, token: tokenA } = await createTestUser("PLAYER");
    const { user: playerB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    await createTestBooking(playerA._id, stadium._id);
    await createTestBooking(playerB._id, stadium._id);

    const res = await request(app)
      .get("/api/bookings/my")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].playerId).toBe(playerA._id.toString());
  });

  it("supports pagination", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    for (let i = 0; i < 3; i++) {
      const startAt = new Date();
      startAt.setDate(startAt.getDate() + i + 1);
      startAt.setHours(10, 0, 0, 0);
      await createTestBooking(player._id, stadium._id, {
        startAt,
        endAt: new Date(startAt.getTime() + 60 * 60 * 1000),
      });
    }

    const res = await request(app)
      .get("/api/bookings/my?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it("filters by status", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    await createTestBooking(player._id, stadium._id, { status: "CONFIRMED" });
    await createTestBooking(player._id, stadium._id, {
      status: "CANCELLED",
      startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    });

    const res = await request(app)
      .get("/api/bookings/my?status=CANCELLED")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe("CANCELLED");
  });

  it("rejects an invalid status value", async () => {
    const { token } = await createTestUser("PLAYER");

    const res = await request(app)
      .get("/api/bookings/my?status=NOT_A_STATUS")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("rejects OWNER access to this endpoint", async () => {
    const { token } = await createTestUser("OWNER");

    const res = await request(app)
      .get("/api/bookings/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/bookings/stadium/:stadiumId", () => {
  it("allows OWNER to view bookings for their own stadium", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    await createTestBooking(player._id, stadium._id);

    const res = await request(app)
      .get(`/api/bookings/stadium/${stadium._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("rejects OWNER viewing another owner's stadium bookings", async () => {
    const { user: ownerA } = await createTestUser("OWNER");
    const { token: ownerBToken } = await createTestUser("OWNER");
    const stadium = await createTestStadium(ownerA._id);

    const res = await request(app)
      .get(`/api/bookings/stadium/${stadium._id}`)
      .set("Authorization", `Bearer ${ownerBToken}`);

    expect(res.status).toBe(403);
  });

  it("allows ADMIN to view any stadium's bookings", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { token: adminToken } = await createTestUser("ADMIN");
    const stadium = await createTestStadium(owner._id);

    const res = await request(app)
      .get(`/api/bookings/stadium/${stadium._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("supports pagination", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    for (let i = 0; i < 3; i++) {
      const startAt = new Date();
      startAt.setDate(startAt.getDate() + i + 1);
      startAt.setHours(10, 0, 0, 0);
      await createTestBooking(player._id, stadium._id, {
        startAt,
        endAt: new Date(startAt.getTime() + 60 * 60 * 1000),
      });
    }

    const res = await request(app)
      .get(`/api/bookings/stadium/${stadium._id}?page=1&limit=2`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(3);
  });

  it("filters by status", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    await createTestBooking(player._id, stadium._id, { status: "CONFIRMED" });
    await createTestBooking(player._id, stadium._id, {
      status: "CANCELLED",
      startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    });

    const res = await request(app)
      .get(`/api/bookings/stadium/${stadium._id}?status=CONFIRMED`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe("CONFIRMED");
  });

  it("returns 404 for a non-existing stadium", async () => {
    const { token } = await createTestUser("OWNER");

    const res = await request(app)
      .get("/api/bookings/stadium/507f191e810c19729de860ea")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});