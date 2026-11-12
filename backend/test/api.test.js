import { afterAll, afterEach, beforeAll, describe, expect, test } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../src/app.js";
import { Click } from "../src/models/Click.js";
import { Url } from "../src/models/Url.js";
import vercelHandler from "../../api/[...path].js";

let mongo;
let token;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await request(app)
    .post("/api/auth/register")
    .send({ email: "student@example.com", password: "a-strong-password" })
    .expect(201)
    .then(({ body }) => {
      token = body.data.accessToken;
    });
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
  if (mongo) {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "student@example.com", password: "a-strong-password" });
    token = response.body.data.accessToken;
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

describe("URL API", () => {
  test("serves a Vercel-compatible health route and redirect rewrite", async () => {
    await request(vercelHandler).get("/api/health").expect(200, { status: "ok" });

    const created = await request(app)
      .post("/api/urls")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com/vercel-route" })
      .expect(201);
    const { shortCode } = created.body.data.url;

    await request(vercelHandler)
      .get(`/api/redirect/${shortCode}`)
      .expect(302)
      .expect("Location", "https://example.com/vercel-route");
  });

  test("requires authentication for link creation", async () => {
    const response = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "https://example.com" })
      .expect(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  test("does not allow another account to access or change a link", async () => {
    const created = await request(app)
      .post("/api/urls")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com/private" })
      .expect(201);
    const otherAccount = await request(app)
      .post("/api/auth/register")
      .send({ email: "another@example.com", password: "another-strong-password" })
      .expect(201);
    const otherToken = otherAccount.body.data.accessToken;

    await request(app)
      .get(`/api/urls/${created.body.data.url._id}/analytics`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(404);
    await request(app)
      .patch(`/api/urls/${created.body.data.url._id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ isActive: false })
      .expect(404);
  });

  test("creates a link, records its redirect, and reports analytics", async () => {
    const created = await request(app)
      .post("/api/urls")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com/article" })
      .expect(201);
    const { _id: id, shortCode } = created.body.data.url;
    expect(shortCode).toMatch(/^[0-9A-Za-z]{7}$/);

    await request(app)
      .get(`/${shortCode}`)
      .set("user-agent", "Mozilla/5.0 Chrome/120.0")
      .expect(302)
      .expect("Location", "https://example.com/article");

    const analytics = await request(app)
      .get(`/api/urls/${id}/analytics`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(analytics.body.data.analytics.totalClicks).toBe(1);
    expect(analytics.body.data.analytics.recentClicks).toHaveLength(1);
  });

  test("supports updating, disabling, expiry, and deleting a link", async () => {
    const created = await request(app)
      .post("/api/urls")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com/first" })
      .expect(201);
    const { _id: id, shortCode } = created.body.data.url;

    await request(app)
      .patch(`/api/urls/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.org/updated" })
      .expect(200);
    await request(app)
      .get(`/${shortCode}`)
      .expect(302)
      .expect("Location", "https://example.org/updated");

    await request(app)
      .patch(`/api/urls/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: false })
      .expect(200);
    const disabled = await request(app).get(`/${shortCode}`).expect(404);
    expect(disabled.body.error.code).toBe("LINK_UNAVAILABLE");

    await request(app)
      .patch(`/api/urls/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: true })
      .expect(200);
    await Url.findByIdAndUpdate(id, { expiresAt: new Date(Date.now() - 1000) });
    const expired = await request(app).get(`/${shortCode}`).expect(410);
    expect(expired.body.error.code).toBe("LINK_EXPIRED");

    await request(app)
      .delete(`/api/urls/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    expect(await Click.countDocuments({ url: id })).toBe(0);
  });

  test("rejects unsafe URLs and duplicate custom aliases", async () => {
    await request(app)
      .post("/api/urls")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "javascript:alert(1)" })
      .expect(400);

    await request(app)
      .post("/api/urls")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.com", customAlias: "interview-link" })
      .expect(201);
    const duplicate = await request(app)
      .post("/api/urls")
      .set("Authorization", `Bearer ${token}`)
      .send({ originalUrl: "https://example.org", customAlias: "interview-link" })
      .expect(409);
    expect(duplicate.body.error.code).toBe("ALIAS_TAKEN");
  });
});
