import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  getCollectionDefinition,
  listCollectionSlugs,
} from "../src/data/collections/index.js";
import { publishedRestrictedFilms } from "../src/data/restricted-films.js";
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
  const known: Record<string, { titleZh: string; titleEn: string; director: string }> =
    {
      "17422": { titleZh: "颐和园", titleEn: "Summer Palace", director: "娄烨" },
      "843": { titleZh: "花样年华", titleEn: "In the Mood for Love", director: "王家卫" },
      "147": { titleZh: "四百击", titleEn: "The 400 Blows", director: "François Truffaut" },
    };

  const title = known[externalId] ?? {
    titleZh: `影片${externalId}`,
    titleEn: `Movie ${externalId}`,
    director: "导演",
  };

  return {
    externalId,
    titleZh: title.titleZh,
    titleEn: title.titleEn,
    posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
    backdropUrl: null,
    releaseYear: 2000,
    overview:
      language === "en-US" ? "English overview from TMDB." : "中文简介来自 TMDB。",
    director: title.director,
    countries: ["法国"],
    rating: 8.1,
  };
}

function mockDetails() {
  vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
    async (externalId, language = "zh-CN") => detailsFor(externalId, language)
  );
}

describe("collection catalogue", () => {
  it("has a unique slug for each curated collection", () => {
    const slugs = listCollectionSlugs();

    expect(slugs).toHaveLength(22);
    expect(new Set(slugs).size).toBe(22);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "french-new-wave",
        "taiwan-new-cinema",
        "iranian-new-wave",
        "korean-new-cinema",
        "dogme-95",
        "italian-neorealism",
        "japanese-new-wave",
        "new-german-cinema",
        "sixth-generation",
        "hong-kong-new-wave",
        "mainland-restricted",
        "wong-kar-wai",
        "edward-yang",
        "hou-hsiao-hsien",
        "abbas-kiarostami",
        "andrei-tarkovsky",
        "hirokazu-kore-eda",
        "film-noir",
        "road-movies",
        "cyberpunk",
        "queer-cinema",
        "shadows-of-espionage",
      ])
    );
  });

  it("keeps director collections to films those filmmakers directed", () => {
    const wong = getCollectionDefinition("wong-kar-wai");
    const yang = getCollectionDefinition("edward-yang");
    const hou = getCollectionDefinition("hou-hsiao-hsien");
    const kiarostami = getCollectionDefinition("abbas-kiarostami");
    const tarkovsky = getCollectionDefinition("andrei-tarkovsky");

    expect(wong?.filmIds).not.toContain(9261);
    expect(yang?.filmIds).not.toContain(49982);
    expect(yang?.filmIds).not.toContain(130922);
    expect(hou?.filmIds).not.toContain(25538);
    expect(kiarostami?.filmIds).not.toContain(21334);
    expect(tarkovsky?.filmIds).toEqual([
      31442, 895, 593, 1396, 1398, 1394, 24657,
    ]);
    expect(getCollectionDefinition("dogme-95")?.filmIds).not.toContain(16);
  });

  it("includes Shadows of Espionage without franchise spy blockbusters or TV series", () => {
    const collection = getCollectionDefinition("shadows-of-espionage");

    expect(collection?.titleEn).toBe("Shadows of Espionage");
    expect(collection?.titleZh).toBe("暗影年代：战争与间谍电影");
    expect(collection?.category).toBe("culture");
    expect(collection?.filmIds).toEqual([
      260, 289, 303, 1092, 982, 13580, 15247, 15383, 592, 11963, 582, 49517,
    ]);
    expect(collection?.filmIds).not.toContain(616);
    expect(collection?.description.en).toMatch(/not a list of action spy movies/i);
  });

  it("reuses the existing restricted-mainland dataset", () => {
    const collection = getCollectionDefinition("mainland-restricted");

    expect(collection?.movieSource).toBe("restricted-mainland");
    expect(collection?.filmIds).toEqual(
      publishedRestrictedFilms().map((entry) => entry.tmdbId)
    );
    expect(collection?.filmIds.length).toBeGreaterThanOrEqual(50);
  });
});

describe("GET /api/collections", () => {
  it("returns collection summaries without TMDB movie objects", async () => {
    const detailsSpy = vi.spyOn(tmdbClient, "getMovieDetails");

    const response = await request(app).get("/api/collections");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(22);
    expect(detailsSpy).not.toHaveBeenCalled();

    const first = response.body[0];
    expect(first).toEqual(
      expect.objectContaining({
        slug: "french-new-wave",
        titleZh: "法国新浪潮",
        titleEn: "French New Wave",
        category: "movement",
        featured: true,
        filmCount: expect.any(Number),
        descriptionZh: expect.any(String),
        descriptionEn: expect.any(String),
      })
    );
    expect(first.movies).toBeUndefined();
    expect(first.descriptionEn.length).toBeGreaterThan(20);
    expect(first.filmCount).toBeGreaterThanOrEqual(8);
    expect(JSON.stringify(response.body)).not.toMatch(/access.?token|bearer /i);

    const restricted = response.body.find(
      (item: { slug: string }) => item.slug === "mainland-restricted"
    );
    expect(restricted.filmCount).toBe(publishedRestrictedFilms().length);
    expect(restricted.featured).toBe(true);
  });
});

describe("GET /api/collections/:slug", () => {
  it("returns editorial metadata with TMDB-enriched movies", async () => {
    mockDetails();

    const response = await request(app).get(
      "/api/collections/french-new-wave"
    );

    expect(response.status).toBe(200);
    expect(response.body.slug).toBe("french-new-wave");
    expect(response.body.titleZh).toBe("法国新浪潮");
    expect(response.body.people.length).toBeGreaterThan(3);
    expect(response.body.people[0]).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        roleZh: expect.any(String),
        roleEn: expect.any(String),
      })
    );
    expect(response.body.descriptionEn).toMatch(/French New Wave/i);
    expect(response.body.sources[0].url).toMatch(/^https:\/\//);
    expect(response.body.movies.length).toBeGreaterThanOrEqual(8);
    expect(response.body.movies[0]).toEqual(
      expect.objectContaining({
        externalId: expect.any(String),
        titleZh: expect.any(String),
        overview: "中文简介来自 TMDB。",
        overviewZh: "中文简介来自 TMDB。",
        overviewEn: "English overview from TMDB.",
        director: expect.any(String),
        directorZh: expect.any(String),
        directorEn: expect.any(String),
      })
    );
    expect(response.body.movies[0]).not.toHaveProperty("original_title");
    expect(JSON.stringify(response.body)).not.toMatch(/access.?token|bearer /i);
  });

  it("falls back from Chinese to English overview", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockImplementation(
      async (externalId, language = "zh-CN") => ({
        ...detailsFor(externalId, language),
        overview: language === "en-US" ? "English fallback overview." : "",
      })
    );

    const response = await request(app).get("/api/collections/dogme-95");

    expect(response.status).toBe(200);
    expect(response.body.movies[0].overview).toBe("English fallback overview.");
  });

  it("returns optional restriction metadata for the mainland collection", async () => {
    mockDetails();

    const response = await request(app).get(
      "/api/collections/mainland-restricted"
    );

    expect(response.status).toBe(200);
    expect(response.body.movies.length).toBeGreaterThanOrEqual(50);
    const palace = response.body.movies.find(
      (movie: { externalId: string }) => movie.externalId === "17422"
    );
    expect(palace.titleZh).toBe("颐和园");
    expect(palace.restrictionStatus).toBe("未获大陆公映许可");
    expect(palace.restrictionStatusEn).toBe(
      "Not granted a mainland theatrical release"
    );
    expect(palace.restrictionContext).toContain("公映许可证");
    expect(palace.restrictionContextEn).toMatch(/MV CAT/);
    expect(palace.currentStatus).toBeTruthy();
    expect(palace.currentStatusEn).toBeTruthy();
    expect(
      palace.restrictionSources.map((source: { publisher: string }) => source.publisher)
    ).toContain("MV CAT");
  });

  it("returns 404 for an unknown collection", async () => {
    const response = await request(app).get("/api/collections/not-a-real-slug");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Collection not found");
  });

  it("handles TMDB unavailability", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockRejectedValue(
      new TmdbUnavailableError()
    );

    const response = await request(app).get("/api/collections/wong-kar-wai");

    expect(response.status).toBe(502);
    expect(response.body.message).toBe("Movie service unavailable");
  });

  it("still supports favourite by externalId for a collection film", async () => {
    vi.spyOn(tmdbClient, "getMovieDetails").mockResolvedValue(
      detailsFor("843")
    );

    const { token, userId } = await registerAndLogin();
    createdUserIds.push(userId);

    const response = await request(app)
      .post("/api/favourites")
      .set("Authorization", `Bearer ${token}`)
      .send({ externalId: "843" });

    expect(response.status).toBe(201);

    const localMovie = await db.orm.public.Movie.where({
      externalId: "843",
    }).first();

    expect(localMovie).toBeTruthy();
    createdMovieIds.push(localMovie!.id);
  });
});
