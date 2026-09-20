import request from "supertest";
import app from "../src/app.js";
import { createTestUser, createTestStadium } from "./helpers.js";

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
});