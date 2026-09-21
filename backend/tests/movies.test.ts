import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  tmdbClient,
  type CatalogMovie,
  type TmdbCandidate,
} from "../src/services/tmdb.js";
import { TmdbUnavailableError } from "../src/services/tmdb.js";
import {
  app,
  db,
  deleteMovieById,
  deleteUserById,
  registerAndLogin,
  request,
} from "./helpers.js";

const sampleMovie: CatalogMovie = {
  externalId: "157336",
  titleZh: "星际穿越",
  titleEn: "Interstellar",
  posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
  backdropUrl: "https://image.tmdb.org/t/p/w1280/backdrop.jpg",
  releaseYear: 2014,
  overview: "A team of explorers travel through a wormhole in space.",
  director: "Christopher Nolan",
  countries: ["美国", "英国"],
  rating: 8.4,
};

function candidate(
  overrides: Partial<TmdbCandidate> = {}
): TmdbCandidate {
  return {
    ...sampleMovie,
    originalLanguage: "fr",
    popularity: 18,
    voteCount: 4200,
    genreIds: [18],
    director: null,
    countries: ["法国"],
    originCountries: ["FR"],
    ...overrides,
  };
}

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

describe("TMDB movie catalogue", () => {
  it("returns normalized popular movies", async () => {
    vi.spyOn(tmdbClient, "getPopularMovies").mockResolvedValue([sampleMovie]);

    const response = await request(app).get("/api/movies");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleMovie]);
    expect(JSON.stringify(response.body)).not.toMatch(/access.?token|bearer /i);
  });

  it("searches TMDB when a query is supplied", async () => {
    const searchSpy = vi
      .spyOn(tmdbClient, "searchMovies")
      .mockResolvedValue([sampleMovie]);

    const response = await request(app).get("/api/movies").query({
      query: "interstellar",
    });

    expect(response.status).toBe(200);
    expect(searchSpy).toHaveBeenCalledWith("interstellar");
    expect(response.body).toEqual([sampleMovie]);
  });

  it("returns an empty list for a search with no matches", async () => {
    vi.spyOn(tmdbClient, "searchMovies").mockResolvedValue([]);

    const response = await request(app).get("/api/movies").query({
      query: "zzzznotamovie",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns movie details by TMDB id", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockResolvedValue(sampleMovie);

    const response = await request(app).get("/api/movies/157336");

    expect(response.status).toBe(200);
    expect(response.body.externalId).toBe("157336");
    expect(response.body.titleZh).toBe("星际穿越");
  });

  it("does not leak TMDB failures to the client", async () => {
    vi.spyOn(tmdbClient, "getPopularMovies").mockRejectedValue(
      new TmdbUnavailableError()
    );

    const response = await request(app).get("/api/movies");

    expect(response.status).toBe(502);
    expect(response.body.message).toBe("Movie service unavailable");
    expect(JSON.stringify(response.body)).not.toMatch(/access.?token|bearer /i);
  });
});

describe("daily recommendation and rankings", () => {
  function mockCuratedSources(pool?: TmdbCandidate[]) {
    const movies =
      pool ??
      [
        candidate({
          externalId: "496243",
          titleZh: "寄生虫",
          titleEn: "Parasite",
          releaseYear: 2019,
          originCountries: ["KR"],
          countries: ["韩国"],
        }),
        candidate({
          externalId: "194",
          titleZh: "天使爱美丽",
          titleEn: "Amélie",
          releaseYear: 2001,
          originCountries: ["FR"],
          countries: ["法国"],
        }),
        candidate({
          externalId: "11216",
          titleZh: "天堂电影院",
          titleEn: "Cinema Paradiso",
          releaseYear: 1988,
          originCountries: ["IT"],
          countries: ["意大利"],
        }),
        candidate({
          externalId: "966319",
          titleZh: "过往人生",
          titleEn: "Past Lives",
          releaseYear: 2023,
          originCountries: ["US", "KR"],
          countries: ["美国", "韩国"],
          voteCount: 1800,
          popularity: 22,
        }),
      ];

    vi.spyOn(tmdbClient, "getTrendingMovies").mockResolvedValue(movies);
    vi.spyOn(tmdbClient, "discoverMovies").mockResolvedValue(movies);
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (externalId, language = "zh-CN") => ({
        ...sampleMovie,
        externalId,
        director: "Bong Joon-ho",
        overview:
          language === "en-US"
            ? "English overview from TMDB."
            : "中文简介来自 TMDB。",
      })
    );

    return movies;
  }

  it("returns exactly one stable daily recommendation", async () => {
    mockCuratedSources();

    const first = await request(app).get("/api/movies/daily");
    const second = await request(app).get("/api/movies/daily");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.externalId).toBeTruthy();
    expect(Array.isArray(first.body)).toBe(false);
    expect(second.body.externalId).toBe(first.body.externalId);
    expect(typeof first.body.overview).toBe("string");
    expect(first.body.overview.length).toBeGreaterThan(0);
    expect(JSON.stringify(first.body)).not.toMatch(/access.?token|bearer /i);
  });

  it.each([
    ["/api/movies/rankings/today"],
    ["/api/movies/rankings/classic"],
    ["/api/movies/rankings/recent"],
    ["/api/movies/rankings/hidden-gems"],
    ["/api/movies/rankings/top-rated"],
  ])("returns a curated ranking from %s", async (path) => {
    mockCuratedSources();

    const response = await request(app).get(path);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.length).toBeLessThanOrEqual(10);
    expect(response.body[0].externalId).toBeTruthy();
    expect(response.body[0].titleZh).toBeTruthy();
    expect(typeof response.body[0].overview).toBe("string");
    expect(response.body[0].overview.length).toBeGreaterThan(0);
  });

  it("limits ranking results to about ten films", async () => {
    const pool = Array.from({ length: 15 }, (_, index) =>
      candidate({
        externalId: String(1000 + index),
        titleZh: `电影${index}`,
        releaseYear: 2000 + (index % 10),
        originCountries: ["FR"],
        voteCount: 2000,
        rating: 8,
      })
    );
    mockCuratedSources(pool);

    const response = await request(app).get("/api/movies/rankings/today");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);
  });

  it("filters rankings by region", async () => {
    mockCuratedSources();

    const response = await request(app)
      .get("/api/movies/rankings/today")
      .query({ region: "asia" });

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(
      response.body.every((movie: { externalId: string }) =>
        ["496243", "966319"].includes(movie.externalId)
      )
    ).toBe(true);
  });

  it("filters rankings by exact year", async () => {
    mockCuratedSources();

    const response = await request(app)
      .get("/api/movies/rankings/today")
      .query({ year: "2019" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].externalId).toBe("496243");
  });

  it("filters rankings by decade", async () => {
    mockCuratedSources();

    const byDecade = await request(app)
      .get("/api/movies/rankings/classic")
      .query({ decade: "1980" });
    const byYearParam = await request(app)
      .get("/api/movies/rankings/classic")
      .query({ year: "1980s" });

    expect(byDecade.status).toBe(200);
    expect(byDecade.body).toHaveLength(1);
    expect(byDecade.body[0].externalId).toBe("11216");
    expect(byYearParam.status).toBe(200);
    expect(byYearParam.body).toHaveLength(1);
    expect(byYearParam.body[0].externalId).toBe("11216");
  });

  it("returns 400 for invalid ranking filters", async () => {
    mockCuratedSources();

    const invalidRegion = await request(app)
      .get("/api/movies/rankings/today")
      .query({ region: "atlantis" });
    const invalidYear = await request(app)
      .get("/api/movies/rankings/classic")
      .query({ year: "not-a-year" });
    const invalidDecade = await request(app)
      .get("/api/movies/rankings/recent")
      .query({ decade: "1995" });

    expect(invalidRegion.status).toBe(400);
    expect(invalidYear.status).toBe(400);
    expect(invalidDecade.status).toBe(400);
  });

  it("falls back from Chinese to English overview, then a placeholder", async () => {
    const emptyOverview = candidate({
      externalId: "42",
      titleZh: "没有简介",
      overview: "",
      releaseYear: 2018,
    });
    vi.spyOn(tmdbClient, "getTrendingMovies").mockResolvedValue([emptyOverview]);
    vi.spyOn(tmdbClient, "discoverMovies").mockResolvedValue([emptyOverview]);
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (_externalId, language = "zh-CN") => ({
        ...sampleMovie,
        externalId: "42",
        overview: language === "en-US" ? "English fallback overview." : "",
      })
    );

    const withEnglish = await request(app).get("/api/movies/rankings/today");

    expect(withEnglish.status).toBe(200);
    expect(withEnglish.body[0].overview).toBe("English fallback overview.");

    vi.spyOn(tmdbClient, "getMovieDetails").mockResolvedValue({
      ...sampleMovie,
      externalId: "42",
      overview: "",
    });

    const placeholder = await request(app).get("/api/movies/rankings/today");

    expect(placeholder.status).toBe(200);
    expect(placeholder.body[0].overview).toBe("暂无简介");
  });

  it("hydrates bilingual director names instead of leaving Chinese in English", async () => {
    mockCuratedSources([
      candidate({
        externalId: "157336",
        titleZh: "星际穿越",
        titleEn: "Interstellar",
        releaseYear: 2014,
        originCountries: ["US", "GB"],
        countries: ["美国", "英国"],
        voteCount: 1800,
        popularity: 22,
      }),
    ]);
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (_externalId, language = "zh-CN") => ({
        ...sampleMovie,
        director:
          language === "en-US" ? "Christopher Nolan" : "克里斯托弗·诺兰",
        directorZh: language === "en-US" ? null : "克里斯托弗·诺兰",
        directorEn: "Christopher Nolan",
        countries:
          language === "en-US"
            ? ["United States of America", "United Kingdom"]
            : ["美国", "英国"],
        countriesZh: language === "en-US" ? [] : ["美国", "英国"],
        countriesEn:
          language === "en-US"
            ? ["United States of America", "United Kingdom"]
            : [],
        overview:
          language === "en-US"
            ? "English overview from TMDB."
            : "中文简介来自 TMDB。",
      })
    );

    const response = await request(app).get("/api/movies/rankings/today");

    expect(response.status).toBe(200);
    expect(response.body[0].directorEn).toBe("Christopher Nolan");
    expect(response.body[0].directorZh).toBe("克里斯托弗·诺兰");
    expect(response.body[0].directorEn).not.toBe("克里斯托弗·诺兰");
    expect(response.body[0].countriesEn).toEqual([
      "United States of America",
      "United Kingdom",
    ]);
  });

  it("handles TMDB ranking failures without leaking internals", async () => {
    vi.spyOn(tmdbClient, "getTrendingMovies").mockRejectedValue(
      new TmdbUnavailableError()
    );
    vi.spyOn(tmdbClient, "discoverMovies").mockRejectedValue(
      new TmdbUnavailableError()
    );

    const today = await request(app).get("/api/movies/rankings/today");
    const classic = await request(app).get("/api/movies/rankings/classic");
    const recent = await request(app).get("/api/movies/rankings/recent");

    expect(today.status).toBe(502);
    expect(classic.status).toBe(502);
    expect(recent.status).toBe(502);
    expect(today.body.message).toBe("Movie service unavailable");
    expect(JSON.stringify(today.body)).not.toMatch(/access.?token|bearer /i);
  });
});

describe("favourites and reviews with TMDB externalId", () => {
  it("upserts a local movie when favouriting by externalId", async () => {
    const catalogMovie: CatalogMovie = {
      ...sampleMovie,
      externalId: String(800000000 + Math.floor(Math.random() * 999999)),
    };

    vi.spyOn(tmdbClient, "getMovieDetails").mockResolvedValue(catalogMovie);

    const { token, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ externalId: catalogMovie.externalId });

    expect(response.status).toBe(201);

    const localMovie = await db.orm.public.Movie.where({
      externalId: catalogMovie.externalId,
    }).first();

    expect(localMovie).toBeTruthy();
    createdMovieIds.push(localMovie!.id);
    expect(response.body.movieId).toBe(localMovie!.id);
    expect(tmdbClient.getMovieDetails).toHaveBeenCalledWith(
      catalogMovie.externalId
    );
  });

  it("upserts a local movie when reviewing by externalId", async () => {
    const catalogMovie: CatalogMovie = {
      ...sampleMovie,
      externalId: String(810000000 + Math.floor(Math.random() * 999999)),
      titleZh: "盗梦空间",
      titleEn: "Inception",
    };

    vi.spyOn(tmdbClient, "getMovieDetails").mockResolvedValue(catalogMovie);

    const { token, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        externalId: catalogMovie.externalId,
        content: "结构精巧",
      });

    expect(response.status).toBe(201);
    expect(response.body.content).toBe("结构精巧");

    const localMovie = await db.orm.public.Movie.where({
      externalId: catalogMovie.externalId,
    }).first();

    expect(localMovie).toBeTruthy();
    createdMovieIds.push(localMovie!.id);
  });
});
