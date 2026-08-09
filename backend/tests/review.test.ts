import request from "supertest";
import app from "../src/app.js";
import { Review } from "../src/modules/review/review.model.js";
import { createTestUser, createTestStadium, createTestBooking } from "./helpers.js";

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function createCompletedBooking(playerId: any, stadiumId: any) {
  return createTestBooking(playerId, stadiumId, {
    status: "COMPLETED",
    startAt: hoursFromNow(-3),
    endAt: hoursFromNow(-2),
    completedAt: hoursFromNow(-2),
  });
}

describe("POST /api/reviews", () => {
  it("allows PLAYER to review their completed booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: 5, comment: "Great stadium." });

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.stadiumId).toBe(stadium._id.toString());
  });

  it("rejects OWNER trying to create a review", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ bookingId: booking._id.toString(), rating: 4 });

    expect(res.status).toBe(403);
  });

  it("rejects reviewing a CONFIRMED booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CONFIRMED",
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
    });

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: 4 });

    expect(res.status).toBe(400);
  });

  it("rejects reviewing a CANCELLED booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createTestBooking(player._id, stadium._id, {
      status: "CANCELLED",
      startAt: hoursFromNow(5),
      endAt: hoursFromNow(6),
      cancelledAt: new Date(),
      cancellationReason: "Changed plans",
    });

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: 4 });

    expect(res.status).toBe(400);
  });

  it("rejects a player reviewing another player's booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA } = await createTestUser("PLAYER");
    const { token: tokenB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(playerA._id, stadium._id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ bookingId: booking._id.toString(), rating: 3 });

    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existing booking", async () => {
    const { token } = await createTestUser("PLAYER");

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: "507f191e810c19729de860ea", rating: 4 });

    expect(res.status).toBe(404);
  });

  it("rejects reviewing the same booking twice", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);

    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: 5 });

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: 3 });

    expect(res.status).toBe(409);
  });

  it("rejects a non-integer / invalid rating", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: "five" });

    expect(res.status).toBe(400);
  });

  it("rejects a rating below 1", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: 0 });

    expect(res.status).toBe(400);
  });

  it("rejects a rating above 5", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingId: booking._id.toString(), rating: 6 });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/reviews/:reviewId", () => {
  it("returns a review by ID", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);
    const review = await Review.create({
      bookingId: booking._id,
      playerId: player._id,
      stadiumId: stadium._id,
      rating: 4,
      comment: "Solid pitch",
    });

    const res = await request(app)
      .get(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(4);
  });
});

describe("GET /api/reviews/stadium/:stadiumId", () => {
  it("returns paginated reviews for a stadium", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    for (let i = 0; i < 3; i++) {
      const { user: player } = await createTestUser("PLAYER");
      const booking = await createCompletedBooking(player._id, stadium._id);
      await Review.create({
        bookingId: booking._id,
        playerId: player._id,
        stadiumId: stadium._id,
        rating: 4,
      });
    }

    const res = await request(app)
      .get(`/api/reviews/stadium/${stadium._id}?page=1&limit=2`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });
});

describe("GET /api/reviews/me", () => {
  it("returns only the authenticated player's reviews", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA, token: tokenA } = await createTestUser("PLAYER");
    const { user: playerB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const bookingA = await createCompletedBooking(playerA._id, stadium._id);
    const bookingB = await createCompletedBooking(playerB._id, stadium._id);
    await Review.create({ bookingId: bookingA._id, playerId: playerA._id, stadiumId: stadium._id, rating: 5 });
    await Review.create({ bookingId: bookingB._id, playerId: playerB._id, stadiumId: stadium._id, rating: 3 });

    const res = await request(app)
      .get("/api/reviews/me")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].playerId).toBe(playerA._id.toString());
  });
});

describe("PATCH /api/reviews/:reviewId", () => {
  it("allows PLAYER to update their own review", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);
    const review = await Review.create({
      bookingId: booking._id,
      playerId: player._id,
      stadiumId: stadium._id,
      rating: 3,
    });

    const res = await request(app)
      .patch(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, comment: "Updated my opinion" });

    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.comment).toBe("Updated my opinion");
  });

  it("rejects updating another player's review", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA } = await createTestUser("PLAYER");
    const { token: tokenB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(playerA._id, stadium._id);
    const review = await Review.create({
      bookingId: booking._id,
      playerId: playerA._id,
      stadiumId: stadium._id,
      rating: 3,
    });

    const res = await request(app)
      .patch(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ rating: 1 });

    expect(res.status).toBe(403);
  });

  it("rejects attempts to modify bookingId/playerId/stadiumId", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);
    const review = await Review.create({
      bookingId: booking._id,
      playerId: player._id,
      stadiumId: stadium._id,
      rating: 3,
    });

    const res = await request(app)
      .patch(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4, stadiumId: "507f191e810c19729de860ea" });

    expect(res.status).toBe(400); // rejected by .strict()
  });
});

describe("DELETE /api/reviews/:reviewId", () => {
  it("allows PLAYER to delete their own review", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(player._id, stadium._id);
    const review = await Review.create({
      bookingId: booking._id,
      playerId: player._id,
      stadiumId: stadium._id,
      rating: 3,
    });

    const res = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const deleted = await Review.findById(review._id);
    expect(deleted).toBeNull();
  });

  it("rejects deleting another player's review", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: playerA } = await createTestUser("PLAYER");
    const { token: tokenB } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const booking = await createCompletedBooking(playerA._id, stadium._id);
    const review = await Review.create({
      bookingId: booking._id,
      playerId: playerA._id,
      stadiumId: stadium._id,
      rating: 3,
    });

    const res = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);

    const stillExists = await Review.findById(review._id);
    expect(stillExists).not.toBeNull();
  });
});