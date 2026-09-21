import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  isPublishableRestrictedFilm,
  publishedRestrictedFilms,
  RESTRICTED_MAINLAND_FILMS,
  UNMATCHED_MVCAT_CANDIDATES,
  type RestrictedFilmEntry,
} from "../src/data/restricted-films.js";
import {
  tmdbClient,
  TmdbUnavailableError,
  type CatalogMovie,
} from "../src/services/tmdb.js";
import {
  app,
  db,
  deleteMovieById,
  deleteUserById,
  registerAndLogin,
  request,
} from "./helpers.js";

const createdUserIds: number[] = [];
const createdMovieIds: number[] = [];

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  for (const userId of createdUserIds) {
    await deleteUserById(userId);
  }

  for (const movieId of createdMovieIds) {
    await deleteMovieById(movieId);
  }
});

function detailsFor(externalId: string, language = "zh-CN"): CatalogMovie {
  const titles: Record<string, { titleZh: string; titleEn: string }> = {
    "17422": { titleZh: "颐和园", titleEn: "Summer Palace" },
    "25838": { titleZh: "鬼子来了", titleEn: "Devils on the Doorstep" },
  };
  const title = titles[externalId] ?? {
    titleZh: "未知影片",
    titleEn: "Unknown",
  };

  return {
    externalId,
    titleZh: title.titleZh,
    titleEn: title.titleEn,
    posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
    backdropUrl: null,
    releaseYear: externalId === "17422" ? 2006 : 2000,
    overview:
      language === "en-US" ? "English overview from TMDB." : "中文简介来自 TMDB。",
    director: externalId === "17422" ? "娄烨" : "姜文",
    countries: ["中国"],
    rating: 7.4,
  };
}

function mockDetails() {
  vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
    async (externalId, language = "zh-CN") => detailsFor(externalId, language)
  );
}

describe("restricted mainland editorial dataset", () => {
  it("only publishes entries that include supporting sources", () => {
    const published = publishedRestrictedFilms();

    expect(published.length).toBeGreaterThanOrEqual(50);
    expect(published.length).toBe(RESTRICTED_MAINLAND_FILMS.length);
    expect(UNMATCHED_MVCAT_CANDIDATES).toHaveLength(1);

    for (const entry of published) {
      expect(isPublishableRestrictedFilm(entry)).toBe(true);
      expect(entry.sources.length).toBeGreaterThan(0);
      expect(entry.context.trim().length).toBeGreaterThan(0);
      expect(entry.status).not.toMatch(/因为题材|政治事件/);
    }

    const unsourced: RestrictedFilmEntry = {
      tmdbId: 1,
      candidateTitle: "未收录",
      candidateYear: 2000,
      status: "未获大陆公映许可",
      period: "未知",
      currentStatus: "资料不足",
      context: "No source should mean this stays unpublished.",
      sources: [],
    };

    expect(isPublishableRestrictedFilm(unsourced)).toBe(false);
  });
});

describe("GET /api/movies/restricted-mainland", () => {
  it("returns TMDB metadata merged with editorial restriction fields", async () => {
    mockDetails();

    const response = await request(app).get("/api/movies/restricted-mainland");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(50);
    const palace = response.body.find(
      (movie: { externalId: string }) => movie.externalId === "17422"
    );
    expect(palace.titleZh).toBe("颐和园");
    expect(palace.director).toBe("娄烨");
    expect(palace.overview).toBe("中文简介来自 TMDB。");
    expect(palace.restrictionStatus).toBe("未获大陆公映许可");
    expect(palace.currentStatus).toBeTruthy();
    expect(palace.restrictionPeriod).toBeTruthy();
    expect(palace.restrictionContext).toContain("公映许可证");
    expect(palace.restrictionSources.map((source: { publisher: string }) => source.publisher)).toContain(
      "MV CAT"
    );
    expect(palace.restrictionSources.map((source: { publisher: string }) => source.publisher)).toContain(
      "Variety"
    );
    expect(JSON.stringify(response.body)).not.toMatch(/access.?token|bearer /i);
  });

  it("falls back from Chinese to English overview", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (externalId, language = "zh-CN") => ({
        ...detailsFor(externalId, language),
        overview: language === "en-US" ? "English fallback overview." : "",
      })
    );

    const response = await request(app).get("/api/movies/restricted-mainland");

    expect(response.status).toBe(200);
    expect(response.body[0].overview).toBe("English fallback overview.");
  });

  it("can filter the collection by year without using ranking scores", async () => {
    mockDetails();

    const response = await request(app)
      .get("/api/movies/restricted-mainland")
      .query({ year: "2006" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].externalId).toBe("17422");
  });

  it("returns 400 for an invalid year filter", async () => {
    mockDetails();

    const response = await request(app)
      .get("/api/movies/restricted-mainland")
      .query({ year: "not-a-year" });

    expect(response.status).toBe(400);
  });

  it("handles TMDB unavailability", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockRejectedValue(
      new TmdbUnavailableError()
    );

    const response = await request(app).get("/api/movies/restricted-mainland");

    expect(response.status).toBe(502);
    expect(response.body.message).toBe("Movie service unavailable");
  });

  it("still supports favourite by externalId for a collection film", async () => {
    const catalogMovie = detailsFor("17422");
    vi.spyOn(tmdbClient, "getMovieDetails").mockResolvedValue(catalogMovie);

    const { token, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ externalId: "17422" });

    expect(response.status).toBe(201);

    const localMovie = await db.orm.public.Movie.where({
      externalId: "17422",
    }).first();

    expect(localMovie).toBeTruthy();
    createdMovieIds.push(localMovie!.id);
  });
});
