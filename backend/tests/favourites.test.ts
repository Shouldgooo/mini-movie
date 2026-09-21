import { afterAll, describe, expect, it } from "vitest";
import {
  app,
  createTestMovie,
  deleteMovieById,
  deleteUserById,
  registerAndLogin,
  request,
} from "./helpers.js";

const createdUserIds: number[] = [];
const createdMovieIds: number[] = [];

afterAll(async () => {
  for (const userId of createdUserIds) {
    await deleteUserById(userId);
  }

  for (const movieId of createdMovieIds) {
    await deleteMovieById(movieId);
  }
});

describe("favourites", () => {
  it("returns 401 when unauthenticated", async () => {
    const response = await request(app).get("/api/favourites");

    expect(response.status).toBe(401);
  });

  it("creates, lists, rejects duplicates, and deletes a favourite", async () => {
    const { token, userId } = await registerAndLogin();
    const movie = await createTestMovie();
    createdUserIds.push(userId);
    createdMovieIds.push(movie.id);

    const createResponse = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ movieId: movie.id });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.movieId).toBe(movie.id);

    const duplicateResponse = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ movieId: movie.id });

    expect(duplicateResponse.status).toBe(409);

    const listResponse = await request(app)
      .get("/api/favourites")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].movie.titleZh).toBe(movie.titleZh);

    const deleteResponse = await request(app)
      .delete(`/api/favourites/${movie.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);

    const emptyListResponse = await request(app)
      .get("/api/favourites")
      .set("Authorization", `Bearer ${token}`);

    expect(emptyListResponse.body).toHaveLength(0);
  });

  it("rejects an invalid movieId", async () => {
    const { token, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ movieId: -1 });

    expect(response.status).toBe(400);
  });
});
