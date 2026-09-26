import { afterEach, describe, expect, it, vi } from "vitest";
import {
  firstAllowedHydratedMovie,
} from "../src/services/curation.js";
import {
  hasExcludedProductionCountry,
  normalizeTmdbMovie,
  tmdbClient,
  withoutExcludedProductionCountries,
  type CatalogMovie,
  type TmdbCandidate,
} from "../src/services/tmdb.js";
import { app, request } from "./helpers.js";

const interstellar: CatalogMovie = {
  externalId: "157336",
  titleZh: "星际穿越",
  titleEn: "Interstellar",
  posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
  backdropUrl: null,
  releaseYear: 2014,
  overview: "A team of explorers travel through a wormhole in space.",
  director: "Christopher Nolan",
  countries: ["美国", "英国"],
  originCountries: ["US", "GB"],
  rating: 8.4,
};

const threeIdiots: CatalogMovie = {
  ...interstellar,
  externalId: "20453",
  titleZh: "三傻大闹宝莱坞",
  titleEn: "3 Idiots",
  originCountries: ["IN"],
  countries: ["印度"],
};

const slumdog: CatalogMovie = {
  ...interstellar,
  externalId: "12405",
  titleZh: "贫民窟的百万富翁",
  titleEn: "Slumdog Millionaire",
  originCountries: ["GB", "IN"],
  countries: ["英国", "印度"],
};

function candidate(
  overrides: Partial<TmdbCandidate> = {}
): TmdbCandidate {
  return {
    ...interstellar,
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("excluded production country helper", () => {
  it("excludes India-only and mixed productions that include IN", () => {
    expect(hasExcludedProductionCountry({ originCountries: ["IN"] })).toBe(
      true
    );
    expect(
      hasExcludedProductionCountry({ originCountries: ["GB", "IN"] })
    ).toBe(true);
    expect(hasExcludedProductionCountry({ originCountries: ["FR"] })).toBe(
      false
    );
    expect(hasExcludedProductionCountry({ originCountries: [] })).toBe(false);
    expect(hasExcludedProductionCountry({})).toBe(false);
    expect(
      hasExcludedProductionCountry({
        originCountries: [],
        countries: ["India"],
        countriesEn: ["India"],
      })
    ).toBe(true);
    expect(
      hasExcludedProductionCountry({
        originCountries: [],
        countriesZh: ["印度"],
      })
    ).toBe(true);
  });

  it("keeps non-Indian movies and drops IN productions from a list", () => {
    const kept = withoutExcludedProductionCountries([
      interstellar,
      threeIdiots,
      slumdog,
    ]);

    expect(kept.map((movie) => movie.externalId)).toEqual(["157336"]);
  });

  it("treats TMDB origin_country IN as an excluded production country", () => {
    const indian = normalizeTmdbMovie({
      id: 20453,
      title: "3 Idiots",
      original_title: "3 Idiots",
      origin_country: ["IN"],
    });
    const french = normalizeTmdbMovie({
      id: 194,
      title: "Amélie",
      original_title: "Le Fabuleux Destin d'Amélie Poulain",
      origin_country: ["FR"],
    });

    expect(indian?.originCountries).toEqual(["IN"]);
    expect(hasExcludedProductionCountry(indian!)).toBe(true);
    expect(hasExcludedProductionCountry(french!)).toBe(false);
  });
});

describe("public catalogue exclusion", () => {
  it("omits Indian-produced titles from search results", async () => {
    vi.spyOn(tmdbClient, "searchMovies").mockResolvedValue([
      interstellar,
      threeIdiots,
      slumdog,
    ]);

    const response = await request(app).get("/api/movies/search").query({
      query: "idiots",
    });

    expect(response.status).toBe(200);
    expect(response.body.map((movie: CatalogMovie) => movie.externalId)).toEqual(
      ["157336"]
    );
  });

  it("still returns a successful empty search when every match is Indian-produced", async () => {
    vi.spyOn(tmdbClient, "searchMovies").mockResolvedValue([threeIdiots]);

    const response = await request(app).get("/api/movies/search").query({
      query: "3 Idiots",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("omits Indian-produced titles from rankings and still succeeds", async () => {
    const pool = [
      candidate({
        externalId: "194",
        titleZh: "天使爱美丽",
        titleEn: "Amélie",
        originCountries: ["FR"],
      }),
      candidate({
        externalId: "20453",
        titleZh: "三傻大闹宝莱坞",
        titleEn: "3 Idiots",
        originCountries: ["IN"],
      }),
      candidate({
        externalId: "12405",
        titleZh: "贫民窟的百万富翁",
        titleEn: "Slumdog Millionaire",
        originCountries: ["GB", "IN"],
      }),
    ];

    vi.spyOn(tmdbClient, "getTrendingMovies").mockResolvedValue(pool);
    vi.spyOn(tmdbClient, "discoverMovies").mockResolvedValue(pool);
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (externalId) => ({
        ...interstellar,
        externalId,
        originCountries:
          pool.find((movie) => movie.externalId === externalId)
            ?.originCountries ?? ["FR"],
      })
    );

    const response = await request(app).get("/api/movies/rankings/today");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(
      response.body.map((movie: CatalogMovie) => movie.externalId)
    ).toEqual(["194"]);
  });

  it("omits Indian-produced titles from collection movie lists", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (externalId) => {
        if (externalId === "147") {
          return { ...threeIdiots, externalId };
        }

        return {
          ...interstellar,
          externalId,
          originCountries: ["FR"],
        };
      }
    );

    const response = await request(app).get(
      "/api/collections/french-new-wave"
    );

    expect(response.status).toBe(200);
    expect(response.body.movies.length).toBeGreaterThan(0);
    expect(
      response.body.movies.some(
        (movie: CatalogMovie) => movie.externalId === "147"
      )
    ).toBe(false);
    expect(
      response.body.movies.every(
        (movie: CatalogMovie) =>
          !movie.originCountries?.includes("IN")
      )
    ).toBe(true);
  });
});

describe("post-hydration India exclusion", () => {
  const ddljCandidate = candidate({
    externalId: "19404",
    titleZh: "勇夺芳心",
    titleEn: "Dilwale Dulhania Le Jayenge",
    originalLanguage: "hi",
    releaseYear: 1995,
    rating: 8.7,
    voteCount: 4500,
    popularity: 20,
    director: null,
    countries: [],
    originCountries: [],
  });

  const amelieCandidate = candidate({
    externalId: "194",
    titleZh: "天使爱美丽",
    titleEn: "Amélie",
    originalLanguage: "fr",
    releaseYear: 2001,
    originCountries: ["FR"],
    countries: ["法国"],
  });

  function hydratedDdlj(): CatalogMovie {
    return {
      ...interstellar,
      externalId: "19404",
      titleZh: "勇夺芳心",
      titleEn: "Dilwale Dulhania Le Jayenge",
      releaseYear: 1995,
      director: "Aditya Chopra",
      originCountries: ["IN"],
      countries: ["India"],
      countriesEn: ["India"],
      countriesZh: ["印度"],
    };
  }

  function mockDdljSources() {
    const pool = [ddljCandidate, amelieCandidate];

    vi.spyOn(tmdbClient, "getTrendingMovies").mockResolvedValue(pool);
    vi.spyOn(tmdbClient, "discoverMovies").mockResolvedValue(pool);
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (externalId) => {
        if (externalId === "19404") {
          return hydratedDdlj();
        }

        return {
          ...interstellar,
          ...amelieCandidate,
          externalId,
        };
      }
    );
  }

  it("keeps Dilwale Dulhania Le Jayenge before hydration because the candidate has no country", () => {
    expect(hasExcludedProductionCountry(ddljCandidate)).toBe(false);
    expect(
      withoutExcludedProductionCountries([ddljCandidate, amelieCandidate]).map(
        (movie) => movie.externalId
      )
    ).toEqual(["19404", "194"]);
  });

  it("excludes Dilwale Dulhania Le Jayenge after detail hydration reveals IN", () => {
    expect(hasExcludedProductionCountry(hydratedDdlj())).toBe(true);
  });

  it("skips a hydrated Indian daily pick and returns the next allowed film", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (externalId) => {
        if (externalId === "19404") {
          return hydratedDdlj();
        }

        return {
          ...interstellar,
          ...amelieCandidate,
          externalId,
        };
      }
    );

    const movie = await firstAllowedHydratedMovie(
      [ddljCandidate, amelieCandidate],
      0
    );

    expect(movie?.externalId).toBe("194");
  });

  it("does not return Dilwale Dulhania Le Jayenge from the homepage daily endpoint", async () => {
    mockDdljSources();

    const response = await request(app).get("/api/movies/daily");

    expect(response.status).toBe(200);
    expect(response.body.externalId).toBe("194");
    expect(response.body.originCountries).not.toContain("IN");
    expect(response.body.countries).not.toContain("India");
  });

  it("does not return Dilwale Dulhania Le Jayenge from Discover rankings", async () => {
    mockDdljSources();

    const response = await request(app).get("/api/movies/rankings/classic");

    expect(response.status).toBe(200);
    expect(
      response.body.map((movie: CatalogMovie) => movie.externalId)
    ).toEqual(["194"]);
  });
});
