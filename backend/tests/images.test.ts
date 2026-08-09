import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/modules/image/image.cloudinary.js", () => ({
  uploadBuffer: jest.fn(async (_buffer: Buffer, folder: string) => ({
    secureUrl: `https://res.cloudinary.com/test/${folder}/${Date.now()}-${Math.random()}.jpg`,
    publicId: `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}`,
  })),
  deleteAsset: jest.fn(async () => {}),
}));

const { default: app } = await import("../src/app.js");
const request = (await import("supertest")).default;
const { Image } = await import("../src/modules/image/image.model.js");
const { createTestUser, createTestStadium } = await import("./helpers.js");

function fakeImageBuffer(): Buffer {
  // 1x1 PNG صغيرة، كافية لـ multer/tests (بلا حاجة لملف حقيقي على القرص)
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  );
}

describe("POST /api/stadiums/:stadiumId/images", () => {
  it("allows OWNER to upload an image to their own stadium", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const res = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "photo.png", contentType: "image/png" });

    expect(res.status).toBe(201);
    expect(res.body.data.isPrimary).toBe(true); // أول صورة = primary
  });

  it("rejects PLAYER trying to upload an image", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const { token } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const res = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "photo.png", contentType: "image/png" });

    expect(res.status).toBe(403);
  });

  it("rejects OWNER uploading to another owner's stadium", async () => {
    const { user: ownerA } = await createTestUser("OWNER");
    const { token: ownerBToken } = await createTestUser("OWNER");
    const stadium = await createTestStadium(ownerA._id);

    const res = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${ownerBToken}`)
      .attach("image", fakeImageBuffer(), { filename: "photo.png", contentType: "image/png" });

    expect(res.status).toBe(403);
  });

  it("rejects an upload without a file", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const res = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("rejects an unsupported file type", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const res = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("not an image"), {
        filename: "file.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
  });

  it("marks the second uploaded image as not primary", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const secondRes = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "b.png", contentType: "image/png" });

    expect(secondRes.body.data.isPrimary).toBe(false);
  });

  it("rejects uploading more than 5 real images", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/api/stadiums/${stadium._id}/images`)
        .set("Authorization", `Bearer ${token}`)
        .attach("image", fakeImageBuffer(), { filename: `${i}.png`, contentType: "image/png" });
    }

    const res = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "sixth.png", contentType: "image/png" });

    expect(res.status).toBe(409);
  });
});

describe("GET /api/stadiums/:stadiumId/images", () => {
  it("returns 3 default images when the stadium has no real images", async () => {
    const { user: owner } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const res = await request(app).get(`/api/stadiums/${stadium._id}/images`);

    expect(res.status).toBe(200);
    expect(res.body.isDefault).toBe(true);
    expect(res.body.data).toHaveLength(3);
  });

  it("returns only real images once at least one has been uploaded", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const res = await request(app).get(`/api/stadiums/${stadium._id}/images`);

    expect(res.status).toBe(200);
    expect(res.body.isDefault).toBe(false);
    expect(res.body.data).toHaveLength(1);
  });

  it("returns the primary image first", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });
    const second = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "b.png", contentType: "image/png" });

    await request(app)
      .patch(`/api/stadiums/${stadium._id}/images/${second.body.data.id ?? second.body.data._id}/primary`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app).get(`/api/stadiums/${stadium._id}/images`);

    expect(res.body.data[0].isPrimary).toBe(true);
  });
});

describe("PATCH /api/stadiums/:stadiumId/images/:imageId/primary", () => {
  it("allows OWNER to change the primary image, keeping only one primary", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });
    const second = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "b.png", contentType: "image/png" });

    const secondId = second.body.data.id ?? second.body.data._id;

    const res = await request(app)
      .patch(`/api/stadiums/${stadium._id}/images/${secondId}/primary`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const allImages = await Image.find({ stadiumId: stadium._id });
    const primaryCount = allImages.filter((img) => img.isPrimary).length;
    expect(primaryCount).toBe(1);
  });

  it("rejects PLAYER trying to change the primary image", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const { token: playerToken } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const uploaded = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const imageId = uploaded.body.data.id ?? uploaded.body.data._id;

    const res = await request(app)
      .patch(`/api/stadiums/${stadium._id}/images/${imageId}/primary`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(403);
  });

  it("rejects selecting an image belonging to another stadium", async () => {
    const { user: ownerA, token: ownerAToken } = await createTestUser("OWNER");
    const stadiumA = await createTestStadium(ownerA._id);
    const stadiumB = await createTestStadium(ownerA._id);

    const uploadedToB = await request(app)
      .post(`/api/stadiums/${stadiumB._id}/images`)
      .set("Authorization", `Bearer ${ownerAToken}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const imageIdFromB = uploadedToB.body.data.id ?? uploadedToB.body.data._id;

    const res = await request(app)
      .patch(`/api/stadiums/${stadiumA._id}/images/${imageIdFromB}/primary`)
      .set("Authorization", `Bearer ${ownerAToken}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/stadiums/:stadiumId/images/:imageId", () => {
  it("allows OWNER to delete their own image", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const uploaded = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const imageId = uploaded.body.data.id ?? uploaded.body.data._id;

    const res = await request(app)
      .delete(`/api/stadiums/${stadium._id}/images/${imageId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const stillExists = await Image.findById(imageId);
    expect(stillExists).toBeNull();
  });

  it("rejects PLAYER trying to delete an image", async () => {
    const { user: owner, token: ownerToken } = await createTestUser("OWNER");
    const { token: playerToken } = await createTestUser("PLAYER");
    const stadium = await createTestStadium(owner._id);

    const uploaded = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const imageId = uploaded.body.data.id ?? uploaded.body.data._id;

    const res = await request(app)
      .delete(`/api/stadiums/${stadium._id}/images/${imageId}`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(res.status).toBe(403);
  });

  it("promotes another real image to primary when the primary is deleted", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const first = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });
    await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "b.png", contentType: "image/png" });

    const firstId = first.body.data.id ?? first.body.data._id;

    await request(app)
      .delete(`/api/stadiums/${stadium._id}/images/${firstId}`)
      .set("Authorization", `Bearer ${token}`);

    const remaining = await Image.find({ stadiumId: stadium._id });
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.isPrimary).toBe(true);
  });

  it("falls back to default images once the last real image is deleted", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadium = await createTestStadium(owner._id);

    const uploaded = await request(app)
      .post(`/api/stadiums/${stadium._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const imageId = uploaded.body.data.id ?? uploaded.body.data._id;

    await request(app)
      .delete(`/api/stadiums/${stadium._id}/images/${imageId}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app).get(`/api/stadiums/${stadium._id}/images`);

    expect(res.body.isDefault).toBe(true);
    expect(res.body.data).toHaveLength(3);
  });

  it("rejects deleting an image belonging to another stadium", async () => {
    const { user: owner, token } = await createTestUser("OWNER");
    const stadiumA = await createTestStadium(owner._id);
    const stadiumB = await createTestStadium(owner._id);

    const uploaded = await request(app)
      .post(`/api/stadiums/${stadiumB._id}/images`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", fakeImageBuffer(), { filename: "a.png", contentType: "image/png" });

    const imageId = uploaded.body.data.id ?? uploaded.body.data._id;

    const res = await request(app)
      .delete(`/api/stadiums/${stadiumA._id}/images/${imageId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});