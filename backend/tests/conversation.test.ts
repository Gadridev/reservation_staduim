import request from "supertest";
import app from "../src/app.js";
import { Conversation, Message } from "../src/modules/conversation/conversation.model.js";
import {
  createTestUser,
  createTestStadium,
  createTestBooking,
  createTestConversation,
} from "./helpers.js";

async function setupEligiblePlayer() {
  const { user: owner, token: ownerToken } = await createTestUser("OWNER");
  const { user: player, token: playerToken } = await createTestUser("PLAYER");
  const stadium = await createTestStadium(owner._id);
  await createTestBooking(player._id, stadium._id, { status: "CONFIRMED" });
  return { owner, ownerToken, player, playerToken, stadium };
}

describe("POST /api/conversations", () => {
  it("allows an eligible PLAYER to create a conversation", async () => {
    const { playerToken, stadium } = await setupEligiblePlayer();

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: stadium._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.data.stadiumId).toBe(stadium._id.toString());
  });

  it("associates the correct owner from the stadium", async () => {
    const { playerToken, stadium, owner } = await setupEligiblePlayer();

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: stadium._id.toString() });

    expect(res.body.data.ownerId).toBe(owner._id.toString());
  });

  it("prevents duplicate conversations for the same player/owner/stadium", async () => {
    const { playerToken, stadium } = await setupEligiblePlayer();

    const first = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: stadium._id.toString() });

    const second = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: stadium._id.toString() });

    expect(second.body.data._id).toBe(first.body.data._id);

    const count = await Conversation.countDocuments({ stadiumId: stadium._id });
    expect(count).toBe(1);
  });

  it("rejects a player with no eligible booking", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { token: playerToken } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: stadium._id.toString() });

    expect(res.status).toBe(403);
  });

  it("rejects a player whose only booking is CANCELLED", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { user: player, token: playerToken } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);
    await createTestBooking(player._id, stadium._id, { status: "CANCELLED" });

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: stadium._id.toString() });

    expect(res.status).toBe(403);
  });

  it("rejects OWNER trying to create a conversation", async () => {
    const { ownerToken, stadium } = await setupEligiblePlayer();

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ stadiumId: stadium._id.toString() });

    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existing stadium", async () => {
    const { token: playerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ stadiumId: "507f191e810c19729de860ea" });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/conversations", () => {
  it("allows PLAYER to retrieve their conversations", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .get("/api/conversations")
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("allows OWNER to retrieve their conversations", async () => {
    const { ownerToken, owner, stadium, player } = await setupEligiblePlayer();
    await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .get("/api/conversations")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("does not return conversations belonging to unrelated users", async () => {
    const { owner, stadium, player } = await setupEligiblePlayer();
    await createTestConversation(player._id, owner._id, stadium._id);

    const { token: unrelatedPlayerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .get("/api/conversations")
      .set("Authorization", `Bearer ${unrelatedPlayerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/conversations");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/conversations/:conversationId", () => {
  it("allows a participant PLAYER to access the conversation", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    console.log(playerToken)
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(200);
  });

  it("allows a participant OWNER to access the conversation", async () => {
    const { ownerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });

  it("rejects an unrelated player", async () => {
    const { owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const { token: unrelatedPlayerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}`)
      .set("Authorization", `Bearer ${unrelatedPlayerToken}`);

    expect(res.status).toBe(403);
  });

  it("rejects an unrelated owner", async () => {
    const { owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const { token: unrelatedOwnerToken } = await createTestUser("OWNER");

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}`)
      .set("Authorization", `Bearer ${unrelatedOwnerToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 400/404-consistent error for an invalid conversationId", async () => {
    const { token: playerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .get("/api/conversations/not-a-valid-id")
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 for a non-existing conversation", async () => {
    const { token: playerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .get("/api/conversations/507f191e810c19729de860ea")
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/conversations/:conversationId/messages", () => {
  it("allows a participant PLAYER to send a message", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ content: "Hello, is the stadium available tomorrow?" });

    expect(res.status).toBe(201);
    expect(res.body.data.senderId).toBe(player._id.toString());
  });

  it("allows a participant OWNER to send a message", async () => {
    const { ownerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ content: "Yes, it's available." });

    expect(res.status).toBe(201);
    expect(res.body.data.senderId).toBe(owner._id.toString());
  });

  it("cannot be impersonated via a client-provided senderId", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const { user: otherPlayer } = await createTestUser("PLAYER");
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ content: "Hello", senderId: otherPlayer._id.toString() });

    // .strict() rejects the unexpected field entirely
    expect(res.status).toBe(400);
  });

  it("rejects a non-participant", async () => {
    const { owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);
    const { token: unrelatedPlayerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${unrelatedPlayerToken}`)
      .send({ content: "Trying to sneak in" });

    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existing conversation", async () => {
    const { token: playerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .post("/api/conversations/507f191e810c19729de860ea/messages")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ content: "Hello" });

    expect(res.status).toBe(404);
  });

  it("rejects missing content", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("rejects empty content", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ content: "" });

    expect(res.status).toBe(400);
  });

  it("rejects whitespace-only content", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ content: "   " });

    expect(res.status).toBe(400);
  });

  it("rejects content longer than 2000 characters", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app)
      .post(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({ content: "a".repeat(2001) });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/conversations/:conversationId/messages", () => {
  it("allows a participant to retrieve messages", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);
    await Message.create({ conversationId: conversation._id, senderId: player._id, content: "Hi" });

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("rejects a non-participant", async () => {
    const { owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);
    const { token: unrelatedPlayerToken } = await createTestUser("PLAYER");

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${unrelatedPlayerToken}`);

    expect(res.status).toBe(403);
  });

  it("supports pagination", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    for (let i = 0; i < 5; i++) {
      await Message.create({
        conversationId: conversation._id,
        senderId: player._id,
        content: `Message ${i}`,
      });
    }

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}/messages?page=1&limit=2`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 5, totalPages: 3 });
  });

  it("returns messages only for the requested conversation", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversationA = await createTestConversation(player._id, owner._id, stadium._id);

    const { user: ownerB } = await createTestUser("OWNER");
    const { user: playerB } = await createTestUser("PLAYER");
    const stadiumB = await createTestStadium(ownerB._id);
    const conversationB = await createTestConversation(playerB._id, ownerB._id, stadiumB._id);

    await Message.create({ conversationId: conversationA._id, senderId: player._id, content: "A" });
    await Message.create({ conversationId: conversationB._id, senderId: playerB._id, content: "B" });

    const res = await request(app)
      .get(`/api/conversations/${conversationA._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].content).toBe("A");
  });

  it("returns messages in a deterministic createdAt order", async () => {
    const { playerToken, owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const first = await Message.create({
      conversationId: conversation._id,
      senderId: player._id,
      content: "First",
    });
    await new Promise((r) => setTimeout(r, 10));
    const second = await Message.create({
      conversationId: conversation._id,
      senderId: player._id,
      content: "Second",
    });

    const res = await request(app)
      .get(`/api/conversations/${conversation._id}/messages`)
      .set("Authorization", `Bearer ${playerToken}`);

    // Newest first (createdAt DESC)
    expect(res.body.data[0]._id).toBe(second._id.toString());
    expect(res.body.data[1]._id).toBe(first._id.toString());
  });

  it("rejects unauthenticated requests", async () => {
    const { owner, stadium, player } = await setupEligiblePlayer();
    const conversation = await createTestConversation(player._id, owner._id, stadium._id);

    const res = await request(app).get(`/api/conversations/${conversation._id}/messages`);
    expect(res.status).toBe(401);
  });
});