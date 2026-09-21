import { describe, expect, it } from "vitest";
import { mergeCatalogLocales } from "../src/services/movie-enrichment.js";
import {
  normalizeTmdbMovie,
  type CatalogMovie,
} from "../src/services/tmdb.js";

function catalogMovie(overrides: Partial<CatalogMovie>): CatalogMovie {
  return {
    externalId: "1",
    titleZh: "影片",
    titleEn: "Movie",
    posterUrl: null,
    backdropUrl: null,
    releaseYear: 1974,
    overview: "简介",
    director: null,
    countries: [],
    rating: 8,
    ...overrides,
  };
}

describe("TMDB person and country localization", () => {
  it("keeps Chinese and canonical director names from zh-CN credits", () => {
    const movie = normalizeTmdbMovie(
      {
        id: 157336,
        title: "星际穿越",
        original_title: "Interstellar",
        overview: "中文简介",
        production_countries: [
          { iso_3166_1: "US", name: "美国" },
          { iso_3166_1: "GB", name: "英国" },
        ],
        credits: {
          crew: [
            {
              job: "Director",
              name: "克里斯托弗·诺兰",
              original_name: "Christopher Nolan",
            },
          ],
        },
      },
      "zh-CN"
    );

    expect(movie?.directorZh).toBe("克里斯托弗·诺兰");
    expect(movie?.directorEn).toBe("Christopher Nolan");
    expect(movie?.director).toBe("克里斯托弗·诺兰");
    expect(movie?.countriesZh).toEqual(["美国", "英国"]);
    expect(movie?.countriesEn).toEqual([]);
  });

  it("uses the English credits name for Francis Ford Coppola", () => {
    const movie = normalizeTmdbMovie(
      {
        id: 592,
        title: "The Conversation",
        original_title: "The Conversation",
        overview: "An English overview.",
        production_countries: [{ iso_3166_1: "US", name: "United States of America" }],
        credits: {
          crew: [
            {
              job: "Director",
              name: "Francis Ford Coppola",
              original_name: "Francis Ford Coppola",
            },
          ],
        },
      },
      "en-US"
    );

    expect(movie?.directorEn).toBe("Francis Ford Coppola");
    expect(movie?.directorZh).toBeNull();
    expect(movie?.countriesEn).toEqual(["United States of America"]);
    expect(movie?.countriesZh).toEqual([]);
  });

  it("merges bilingual director names without using a hardcoded map", () => {
    const merged = mergeCatalogLocales(
      catalogMovie({
        externalId: "157336",
        titleZh: "星际穿越",
        titleEn: "Interstellar",
        director: "克里斯托弗·诺兰",
        directorZh: "克里斯托弗·诺兰",
        directorEn: "Christopher Nolan",
        countries: ["美国", "英国"],
        countriesZh: ["美国", "英国"],
      }),
      catalogMovie({
        externalId: "157336",
        titleZh: "Interstellar",
        titleEn: null,
        overview: "English overview from TMDB.",
        director: "Christopher Nolan",
        directorZh: null,
        directorEn: "Christopher Nolan",
        countries: ["United States of America", "United Kingdom"],
        countriesEn: ["United States of America", "United Kingdom"],
      })
    );

    expect(merged.directorZh).toBe("克里斯托弗·诺兰");
    expect(merged.directorEn).toBe("Christopher Nolan");
    expect(merged.countriesZh).toEqual(["美国", "英国"]);
    expect(merged.countriesEn).toEqual([
      "United States of America",
      "United Kingdom",
    ]);
  });

  it("falls back to the canonical director name in Chinese when no zh name exists", () => {
    const merged = mergeCatalogLocales(
      catalogMovie({
        director: null,
        directorZh: null,
        directorEn: null,
      }),
      catalogMovie({
        director: "Francis Ford Coppola",
        directorEn: "Francis Ford Coppola",
        overview: "English overview from TMDB.",
      })
    );

    expect(merged.directorEn).toBe("Francis Ford Coppola");
    expect(merged.directorZh).toBeNull();
    expect(merged.director).toBe("Francis Ford Coppola");
  });

  it("does not keep a Chinese localized director name as the English value", () => {
    const merged = mergeCatalogLocales(
      catalogMovie({
        director: "克里斯托弗·诺兰",
        directorZh: "克里斯托弗·诺兰",
        directorEn: null,
      }),
      null
    );

    expect(merged.directorZh).toBe("克里斯托弗·诺兰");
    expect(merged.directorEn).toBeNull();
    expect(merged.director).toBe("克里斯托弗·诺兰");
  });
});
