import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/modules/auth/auth.model.js";

import { createTestUser } from "./helpers.js";
import { AdminAction } from "../src/modules/admin/admin.model.js";

describe("GET /api/admin/users", () => {
  it("allows ADMIN to list users", async () => {
    const { token } = await createTestUser("ADMIN");
    await createTestUser("PLAYER");
    await createTestUser("OWNER");

    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("rejects PLAYER", async () => {
    const { token } = await createTestUser("PLAYER");
    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("rejects OWNER", async () => {
    const { token } = await createTestUser("OWNER");
    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("supports pagination", async () => {
    const { token } = await createTestUser("ADMIN");
    for (let i = 0; i < 3; i++) await createTestUser("PLAYER");

    const res = await request(app)
      .get("/api/admin/users?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.limit).toBe(2);
  });

  it("filters by role", async () => {
    const { token } = await createTestUser("ADMIN");
    await createTestUser("OWNER");

    const res = await request(app)
      .get("/api/admin/users?role=OWNER")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((u: any) => u.role === "OWNER")).toBe(true);
  });

  it("filters by isActive", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: inactivePlayer } = await createTestUser("PLAYER");
    await User.findByIdAndUpdate(inactivePlayer._id, { isActive: false });

    const res = await request(app)
      .get("/api/admin/users?isActive=false")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((u: any) => u.isActive === false)).toBe(true);
  });

  it("never returns the password field", async () => {
    const { token } = await createTestUser("ADMIN");
    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);
    expect(res.body.data.every((u: any) => u.password === undefined)).toBe(true);
  });
});

describe("GET /api/admin/users/:userId", () => {
  it("allows ADMIN to get a user by ID", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");

    const res = await request(app)
      .get(`/api/admin/users/${player._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(player.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it("returns 404 for an invalid ObjectId", async () => {
    const { token } = await createTestUser("ADMIN");
    const res = await request(app)
      .get("/api/admin/users/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("returns 404 for a nonexistent user", async () => {
    const { token } = await createTestUser("ADMIN");
    const res = await request(app)
      .get("/api/admin/users/507f191e810c19729de860ea")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("rejects PLAYER", async () => {
    const { token } = await createTestUser("PLAYER");
    const { user: other } = await createTestUser("PLAYER");
    const res = await request(app)
      .get(`/api/admin/users/${other._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("rejects OWNER", async () => {
    const { token } = await createTestUser("OWNER");
    const { user: other } = await createTestUser("PLAYER");
    const res = await request(app)
      .get(`/api/admin/users/${other._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/admin/users/:userId/deactivate", () => {
  it("allows ADMIN to deactivate a PLAYER", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");

    const res = await request(app)
      .patch(`/api/admin/users/${player._id}/deactivate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Repeated violation of platform rules" });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it("allows ADMIN to deactivate an OWNER", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: owner } = await createTestUser("OWNER");

    const res = await request(app)
      .patch(`/api/admin/users/${owner._id}/deactivate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Repeated violation of platform rules" });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it("rejects deactivating another ADMIN", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: otherAdmin } = await createTestUser("ADMIN");

    const res = await request(app)
      .patch(`/api/admin/users/${otherAdmin._id}/deactivate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Trying to deactivate another admin" });

    expect(res.status).toBe(403);
  });

  it("rejects an admin deactivating himself", async () => {
    const { user: admin, token } = await createTestUser("ADMIN");

    const res = await request(app)
      .patch(`/api/admin/users/${admin._id}/deactivate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Trying to deactivate my own account" });

    expect(res.status).toBe(403);
  });

  it("rejects deactivating an already inactive user", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");
    await User.findByIdAndUpdate(player._id, { isActive: false });

    const res = await request(app)
      .patch(`/api/admin/users/${player._id}/deactivate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Already inactive user" });

    expect(res.status).toBe(409);
  });

  it("rejects an invalid reason", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");

    const res = await request(app)
      .patch(`/api/admin/users/${player._id}/deactivate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Hi" });

    expect(res.status).toBe(400);
  });

  it("creates an AdminAction on success", async () => {
    const { user: admin, token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");

    await request(app)
      .patch(`/api/admin/users/${player._id}/deactivate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Repeated violation of platform rules" });

    const action = await AdminAction.findOne({ targetId: player._id, action: "DEACTIVATE_USER" });
    expect(action).not.toBeNull();
    expect(action!.adminId.toString()).toBe(admin._id.toString());
    expect(action!.reason).toBe("Repeated violation of platform rules");
  });
});

describe("PATCH /api/admin/users/:userId/activate", () => {
  it("allows ADMIN to activate a PLAYER", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");
    await User.findByIdAndUpdate(player._id, { isActive: false });

    const res = await request(app)
      .patch(`/api/admin/users/${player._id}/activate`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });

  it("allows ADMIN to activate an OWNER", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: owner } = await createTestUser("OWNER");
    await User.findByIdAndUpdate(owner._id, { isActive: false });

    const res = await request(app)
      .patch(`/api/admin/users/${owner._id}/activate`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });

  it("rejects activating an already active user", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");

    const res = await request(app)
      .patch(`/api/admin/users/${player._id}/activate`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it("rejects managing another ADMIN", async () => {
    const { token } = await createTestUser("ADMIN");
    const { user: otherAdmin } = await createTestUser("ADMIN");
    await User.findByIdAndUpdate(otherAdmin._id, { isActive: false });

    const res = await request(app)
      .patch(`/api/admin/users/${otherAdmin._id}/activate`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("creates an AdminAction on success", async () => {
    const { user: admin, token } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");
    await User.findByIdAndUpdate(player._id, { isActive: false });

    await request(app)
      .patch(`/api/admin/users/${player._id}/activate`)
      .set("Authorization", `Bearer ${token}`);

    const action = await AdminAction.findOne({ targetId: player._id, action: "ACTIVATE_USER" });
    expect(action).not.toBeNull();
    expect(action!.adminId.toString()).toBe(admin._id.toString());
  });
});

describe("Inactive user authentication", () => {
  it("prevents an inactive user from accessing protected routes", async () => {
    const { user: player, token } = await createTestUser("PLAYER");
    await User.findByIdAndUpdate(player._id, { isActive: false });

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("allows an active user to access protected routes normally", async () => {
    const { token } = await createTestUser("PLAYER");

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});