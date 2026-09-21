import { afterAll, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import {
  app,
  deleteUserById,
  registerAndLogin,
  request,
  uniqueSuffix,
} from "./helpers.js";

const createdUserIds: number[] = [];

afterAll(async () => {
  for (const userId of createdUserIds) {
    await deleteUserById(userId);
  }
});

describe("authentication", () => {
  it("rejects registration with missing fields", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "incomplete@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeTruthy();
  });

  it("rejects registration with a short password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "shortpass",
      email: "shortpass@example.com",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Password");
  });

  it("rejects registration with an invalid email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "bademail",
      email: "not-an-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
  });

  it("registers and logs in a user without exposing password hashes", async () => {
    const { registerResponse, loginResponse, userId } =
      await registerAndLogin();
    createdUserIds.push(userId);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.passwordHash).toBeUndefined();
    expect(JSON.stringify(registerResponse.body)).not.toContain("passwordHash");
    expect(registerResponse.body.token).toBeUndefined();

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeTruthy();
    expect(loginResponse.body.user.email).toBeTruthy();
    expect(loginResponse.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(loginResponse.body)).not.toContain("passwordHash");
  });

  it("rejects a duplicate email without exposing internals", async () => {
    const { user, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app).post("/api/auth/register").send({
      username: `other_${uniqueSuffix()}`.slice(0, 30),
      email: user.email,
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Email or username already exists");
    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash|jwt|secret/i);
  });

  it("returns 401 for the wrong password", async () => {
    const { user, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("returns 401 for a protected route without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-valid-token");

    expect(response.status).toBe(401);
  });

  it("returns 401 for an expired token", async () => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is required for tests");
    }

    const expiredToken = jwt.sign(
      {
        userId: 1,
        exp: Math.floor(Date.now() / 1000) - 60,
      },
      jwtSecret
    );

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it("returns the current user with a valid token", async () => {
    const { token, user, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(user.email);
    expect(response.body.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });
});
