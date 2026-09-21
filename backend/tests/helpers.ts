import request from "supertest";
import app from "../src/app.js";
import { db } from "../src/prisma/db.js";

export { app, db, request };

export function uniqueSuffix() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

export async function registerAndLogin(suffix = uniqueSuffix()) {
  const user = {
    username: `user_${suffix}`,
    displayName: "Test User",
    email: `user_${suffix}@example.com`,
    password: "password123",
  };

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send(user);

  if (registerResponse.status !== 201) {
    throw new Error(
      `Register failed: ${registerResponse.status} ${JSON.stringify(registerResponse.body)}`
    );
  }

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: user.password,
  });

  if (loginResponse.status !== 200 || !loginResponse.body?.user?.id) {
    throw new Error(
      `Login failed: ${loginResponse.status} ${JSON.stringify(loginResponse.body)}`
    );
  }

  return {
    user,
    token: loginResponse.body.token as string,
    userId: loginResponse.body.user.id as number,
    registerResponse,
    loginResponse,
  };
}

export async function createTestMovie(suffix = uniqueSuffix()) {
  return db.orm.public.Movie.create({
    externalId: `test-${suffix}`,
    titleZh: `测试电影 ${suffix}`,
    titleEn: `Test Movie ${suffix}`,
    posterUrl: null,
    releaseYear: 2024,
  });
}

export async function deleteUserById(userId: number) {
  await db.orm.public.User.where({ id: userId }).delete();
}

export async function deleteMovieById(movieId: number) {
  await db.orm.public.Movie.where({ id: movieId }).delete();
}
