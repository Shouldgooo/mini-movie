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

describe("reviews", () => {
  it("returns 401 for unauthenticated protected operations", async () => {
    const createResponse = await request(app).post("/api/reviews").send({
      movieId: 1,
      content: "Nice film",
    });
    const meResponse = await request(app).get("/api/reviews/me");
    const updateResponse = await request(app).put("/api/reviews/1").send({
      content: "Updated",
    });
    const deleteResponse = await request(app).delete("/api/reviews/1");

    expect(createResponse.status).toBe(401);
    expect(meResponse.status).toBe(401);
    expect(updateResponse.status).toBe(401);
    expect(deleteResponse.status).toBe(401);
  });

  it("creates, lists, updates, rejects duplicates, and deletes a review", async () => {
    const { token, userId } = await registerAndLogin();
    const movie = await createTestMovie();
    createdUserIds.push(userId);
    createdMovieIds.push(movie.id);

    const createResponse = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        movieId: movie.id,
        content: "  很喜欢这部电影  ",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.content).toBe("很喜欢这部电影");
    expect(JSON.stringify(createResponse.body)).not.toContain("passwordHash");

    const duplicateResponse = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        movieId: movie.id,
        content: "重复影评",
      });

    expect(duplicateResponse.status).toBe(409);

    const listResponse = await request(app)
      .get("/api/reviews/me")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].movie.titleZh).toBe(movie.titleZh);

    const publicListResponse = await request(app).get(
      `/api/movies/${movie.id}/reviews`
    );

    expect(publicListResponse.status).toBe(200);
    expect(publicListResponse.body[0].user.passwordHash).toBeUndefined();
    expect(JSON.stringify(publicListResponse.body)).not.toContain(
      "passwordHash"
    );

    const reviewId = createResponse.body.id as number;

    const updateResponse = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "更新后的影评",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.content).toBe("更新后的影评");

    const emptyUpdateResponse = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "   ",
      });

    expect(emptyUpdateResponse.status).toBe(400);

    const deleteResponse = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);

    const emptyListResponse = await request(app)
      .get("/api/reviews/me")
      .set("Authorization", `Bearer ${token}`);

    expect(emptyListResponse.body).toHaveLength(0);
  });
});
