import { describe, expect, it } from "vitest";
import { app, request } from "./helpers.js";

describe("health", () => {
  it("returns 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
