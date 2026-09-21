import { describe, expect, it } from "vitest";
import {
  curateCandidates,
  isExcludedFormat,
  isLikelyBiopic,
  isLikelyBlockbuster,
  matchesRegion,
  matchesYear,
  pickDailyFromPool,
  pickIndexForDay,
} from "../src/services/curation.js";
import { ensureOverview, isMissingOverview } from "../src/services/tmdb.js";
import type { TmdbCandidate } from "../src/services/tmdb.js";

function candidate(
  overrides: Partial<TmdbCandidate> & Pick<TmdbCandidate, "externalId" | "titleZh">
): TmdbCandidate {
  return {
    titleEn: null,
    posterUrl: null,
    backdropUrl: null,
    releaseYear: 2015,
    overview: "A film.",
    rating: 8,
    director: null,
    countries: [],
    originalLanguage: "fr",
    popularity: 12,
    voteCount: 2000,
    genreIds: [18],
    originCountries: ["FR"],
    ...overrides,
  };
}

describe("MiniMovie curation heuristics", () => {
  it("filters likely mainstream blockbusters", () => {
    const avengers = candidate({
      externalId: "1",
      titleZh: "复仇者联盟",
      titleEn: "Avengers: Endgame",
      originalLanguage: "en",
      genreIds: [28, 12],
      popularity: 120,
      rating: 8.2,
    });
    const portrait = candidate({
      externalId: "2",
      titleZh: "燃烧女子的肖像",
      titleEn: "Portrait of a Lady on Fire",
    });

    expect(isLikelyBlockbuster(avengers)).toBe(true);
    expect(isLikelyBlockbuster(portrait)).toBe(false);
    expect(curateCandidates([avengers, portrait], "today").map((movie) => movie.externalId)).toEqual([
      "2",
    ]);
  });

  it("excludes animation, documentary and TV movies", () => {
    const animation = candidate({
      externalId: "3",
      titleZh: "千与千寻",
      genreIds: [16, 14],
    });
    const documentary = candidate({
      externalId: "4",
      titleZh: "地球脉动",
      genreIds: [99],
    });
    const tvMovie = candidate({
      externalId: "5",
      titleZh: "电视电影",
      genreIds: [18, 10770],
    });
    const drama = candidate({
      externalId: "6",
      titleZh: "东京物语",
    });

    expect(isExcludedFormat(animation)).toBe(true);
    expect(isExcludedFormat(documentary)).toBe(true);
    expect(isExcludedFormat(tvMovie)).toBe(true);
    expect(isExcludedFormat(drama)).toBe(false);
    expect(
      curateCandidates(
        [animation, documentary, tvMovie, drama],
        "today"
      ).map((movie) => movie.externalId)
    ).toEqual(["6"]);
  });

  it("reduces likely biopics using a title heuristic", () => {
    const biopic = candidate({
      externalId: "7",
      titleZh: "The Biography of a Star",
      titleEn: "The Biography of a Star",
    });
    const drama = candidate({
      externalId: "8",
      titleZh: "花样年华",
    });

    expect(isLikelyBiopic(biopic)).toBe(true);
    expect(isLikelyBiopic(drama)).toBe(false);
    expect(
      curateCandidates([biopic, drama], "today").map((movie) => movie.externalId)
    ).toEqual(["8"]);
  });

  it("filters by region using origin countries", () => {
    const asian = candidate({
      externalId: "9",
      titleZh: "小偷家族",
      originCountries: ["JP"],
    });
    const european = candidate({
      externalId: "10",
      titleZh: "四个月，三周，两天",
      originCountries: ["RO"],
    });
    const coproduction = candidate({
      externalId: "11",
      titleZh: "合拍片",
      originCountries: ["FR", "JP"],
    });

    expect(matchesRegion(asian, "asia")).toBe(true);
    expect(matchesRegion(asian, "europe")).toBe(false);
    expect(matchesRegion(european, "europe")).toBe(true);
    expect(matchesRegion(coproduction, "asia")).toBe(true);
    expect(matchesRegion(coproduction, "europe")).toBe(true);
  });

  it("filters by exact year, decade and earlier eras", () => {
    const recent = candidate({
      externalId: "12",
      titleZh: "近年",
      releaseYear: 2024,
    });
    const nineties = candidate({
      externalId: "13",
      titleZh: "九十年代",
      releaseYear: 1995,
    });
    const earlier = candidate({
      externalId: "14",
      titleZh: "更早",
      releaseYear: 1953,
    });

    expect(matchesYear(recent, { kind: "year", year: 2024 })).toBe(true);
    expect(matchesYear(recent, { kind: "year", year: 2023 })).toBe(false);
    expect(matchesYear(nineties, { kind: "decade", start: 1990 })).toBe(true);
    expect(matchesYear(recent, { kind: "decade", start: 1990 })).toBe(false);
    expect(matchesYear(earlier, { kind: "earlier" })).toBe(true);
    expect(matchesYear(nineties, { kind: "earlier" })).toBe(false);
    expect(matchesYear(recent, { kind: "all" })).toBe(true);
  });

  it("falls back to a placeholder when no overview exists", () => {
    expect(isMissingOverview("")).toBe(true);
    expect(isMissingOverview("暂无简介")).toBe(true);
    expect(isMissingOverview("A quiet film.")).toBe(false);
    expect(ensureOverview("")).toBe("暂无简介");
    expect(ensureOverview("  中文简介  ")).toBe("中文简介");
  });

  it("picks a stable daily film for the same day key", () => {
    const pool = [
      candidate({ externalId: "11", titleZh: "电影甲" }),
      candidate({ externalId: "22", titleZh: "电影乙" }),
      candidate({ externalId: "33", titleZh: "电影丙" }),
    ];

    const first = pickDailyFromPool(pool, "2026-09-21");
    const second = pickDailyFromPool(pool, "2026-09-21");
    const anotherDay = pickDailyFromPool(pool, "2026-09-22");

    expect(first).toEqual(second);
    expect(first?.externalId).toBeTruthy();
    expect(pickIndexForDay(pool.length, "2026-09-21")).toBe(
      pickIndexForDay(pool.length, "2026-09-21")
    );
    expect(anotherDay?.externalId).toBeTruthy();
  });
});
