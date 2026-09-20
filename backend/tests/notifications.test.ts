import request from "supertest";
import app from "../src/app.js";
import { Notification } from "../src/modules/notifications/notifications.model.js";
import { sendMessage } from "../src/modules/conversation/conversation.service.js";
import {
  createTestUser,
  createTestStadium,
  createTestBooking,
  createTestConversation,
} from "./helpers.js";

describe("Notification triggers", () => {
  it("notifies the OWNER when a PLAYER creates a booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 1);
    startAt.setHours(18, 0, 0, 0);

    await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ stadiumId: stadium._id.toString(), startAt: startAt.toISOString() });

    const notification = await Notification.findOne({ recipientId: owner._id, type: "NEW_BOOKING" });
    expect(notification).not.toBeNull();
  });

  it("notifies the OWNER when the PLAYER cancels their booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    const startAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt,
      endAt: new Date(startAt.getTime() + 60 * 60 * 1000),
    });

    await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Changed my plans for today" });

    const notification = await Notification.findOne({
      recipientId: owner._id,
      type: "BOOKING_CANCELLED",
    });
    expect(notification).not.toBeNull();
  });

  it("notifies the PLAYER when ADMIN cancels their booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const { token: adminToken } = await createTestUser("ADMIN");
    const stadium = await createTestStadium(owner._id);
    const startAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const booking = await createTestBooking(player._id, stadium._id, {
      startAt,
      endAt: new Date(startAt.getTime() + 60 * 60 * 1000),
    });

    await request(app)
      .patch(`/api/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Administrative cancellation for testing" });

    const notification = await Notification.findOne({
      recipientId: player._id,
      type: "BOOKING_CANCELLED",
    });
    expect(notification).not.toBeNull();
  });

  it("notifies the recipient when a message is sent", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    await createTestBooking(player._id, stadium._id, { status: "CONFIRMED" });
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    await sendMessage(conversation._id.toString(), { _id: player._id, role: "PLAYER" }, { content: "Hello!" });

    const notification = await Notification.findOne({
      recipientId: owner._id,
      type: "NEW_MESSAGE",
    });
    expect(notification).not.toBeNull();
  });

  it("notifies the user when ADMIN deactivates their account", async () => {
    const { token: adminToken } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");

    await request(app)
      .patch(`/api/admin/users/${player._id}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Repeated violation of platform rules" });

    const notification = await Notification.findOne({
      recipientId: player._id,
      type: "ACCOUNT_DEACTIVATED",
    });
    expect(notification).not.toBeNull();
  });

  it("notifies the user when ADMIN activates their account", async () => {
    const { token: adminToken } = await createTestUser("ADMIN");
    const { user: player } = await createTestUser("PLAYER");
    const { User } = await import("../src/modules/auth/auth.model.js");
    await User.findByIdAndUpdate(player._id, { isActive: false });

    await request(app)
      .patch(`/api/admin/users/${player._id}/activate`)
      .set("Authorization", `Bearer ${adminToken}`);

    const notification = await Notification.findOne({
      recipientId: player._id,
      type: "ACCOUNT_ACTIVATED",
    });
    expect(notification).not.toBeNull();
  });
});

describe("GET /api/notifications", () => {
  it("returns only the authenticated user's notifications", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const { user: player, token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    await createTestBooking(player._id, stadium._id, { status: "CONFIRMED" });
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    await sendMessage(conversation._id.toString(), { _id: player._id, role: "PLAYER" }, { content: "Hello!" });

    const ownerRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(ownerRes.body.data.length).toBeGreaterThanOrEqual(1);

    const playerRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`);
    expect(playerRes.body.data).toHaveLength(0);
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/notifications/unread-count", () => {
  it("returns the correct unread count", async () => {
    const { user: player, token } = await createTestUser("PLAYER");
    await Notification.create({
      recipientId: player._id,
      type: "NEW_MESSAGE",
      title: "Test",
      message: "Test",
      relatedEntityType: "CONVERSATION",
      relatedEntityId: player._id,
    });

    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.data.count).toBe(1);
  });
});

describe("PATCH /api/notifications/:notificationId/read", () => {
  it("marks a notification as read", async () => {
    const { user: player, token } = await createTestUser("PLAYER");
    const notification = await Notification.create({
      recipientId: player._id,
      type: "NEW_MESSAGE",
      title: "Test",
      message: "Test",
      relatedEntityType: "CONVERSATION",
      relatedEntityId: player._id,
    });

    const res = await request(app)
      .patch(`/api/notifications/${notification._id}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  it("rejects marking another user's notification as read", async () => {
    const { user: player } = await createTestUser("PLAYER");
    const { token: otherToken } = await createTestUser("PLAYER");
    const notification = await Notification.create({
      recipientId: player._id,
      type: "NEW_MESSAGE",
      title: "Test",
      message: "Test",
      relatedEntityType: "CONVERSATION",
      relatedEntityId: player._id,
    });

    const res = await request(app)
      .patch(`/api/notifications/${notification._id}/read`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/notifications/read-all", () => {
  it("marks all unread notifications as read", async () => {
    const { user: player, token } = await createTestUser("PLAYER");
    await Notification.create([
      { recipientId: player._id, type: "NEW_MESSAGE", title: "A", message: "A", relatedEntityType: "CONVERSATION", relatedEntityId: player._id },
      { recipientId: player._id, type: "NEW_MESSAGE", title: "B", message: "B", relatedEntityType: "CONVERSATION", relatedEntityId: player._id },
    ]);

    const res = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.modifiedCount).toBe(2);
  });
});
