import { describe, expect, it } from "vitest";
import { isConfidentTitleYearMatch } from "../src/data/tmdb-match.js";
import {
  publishedRestrictedFilms,
  UNMATCHED_MVCAT_CANDIDATES,
} from "../src/data/restricted-films.js";

describe("TMDB title/year matching", () => {
  it("accepts an exact Chinese title with the same year", () => {
    expect(
      isConfidentTitleYearMatch({
        candidateTitle: "霸王别姬",
        candidateYear: 1993,
        tmdbTitle: "霸王别姬",
        tmdbOriginalTitle: "霸王别姬",
        tmdbYear: 1993,
      })
    ).toBe(true);
  });

  it("accepts a one-year catalog difference for the same original title", () => {
    expect(
      isConfidentTitleYearMatch({
        candidateTitle: "鬼子来了",
        candidateYear: 2000,
        tmdbTitle: "鬼子来了",
        tmdbOriginalTitle: "鬼子来了",
        tmdbYear: 2001,
      })
    ).toBe(true);
  });

  it("does not match a translated English film that shares a short Chinese title", () => {
    expect(
      isConfidentTitleYearMatch({
        candidateTitle: "儿子",
        candidateYear: 1999,
        tmdbTitle: "儿子",
        tmdbOriginalTitle: "The Boys",
        tmdbYear: 1998,
      })
    ).toBe(false);
  });

  it("does not match when the year gap is larger than one", () => {
    expect(
      isConfidentTitleYearMatch({
        candidateTitle: "儿子",
        candidateYear: 1999,
        tmdbTitle: "儿子",
        tmdbOriginalTitle: "儿子",
        tmdbYear: 1996,
      })
    ).toBe(false);
  });
});

describe("expanded restricted collection", () => {
  it("contains a substantial sourced dataset in MV CAT order", () => {
    const published = publishedRestrictedFilms();

    expect(published.length).toBeGreaterThanOrEqual(50);
    expect(published[0]?.candidateTitle).toBe("国产凌凌漆");
    expect(UNMATCHED_MVCAT_CANDIDATES.map((item) => item.title)).toEqual([
      "儿子",
    ]);
  });

  it("keeps later-release and disputed cases out of a blanket banned label", () => {
    const published = publishedRestrictedFilms();
    const hibiscus = published.find((item) => item.candidateTitle === "芙蓉镇");
    const noMansLand = published.find((item) => item.candidateTitle === "无人区");
    const palace = published.find((item) => item.candidateTitle === "颐和园");

    expect(hibiscus?.status).toBe("曾被报道为受限");
    expect(hibiscus?.currentStatus).toContain("公映");
    expect(noMansLand?.status).toBe("修改后公映");
    expect(noMansLand?.currentStatus).toContain("上映");
    expect(palace?.sources.map((source) => source.publisher)).toEqual([
      "MV CAT",
      "Variety",
      "China Daily",
    ]);
  });
});
