import {
  hasExcludedProductionCountry,
  isMissingOverview,
  tmdbClient,
  toCatalogMovie,
  withoutExcludedProductionCountries,
  type CatalogMovie,
  type TmdbCandidate,
} from "./tmdb.js";
import { mergeCatalogLocales } from "./movie-enrichment.js";
import type {
  RankingFilters,
  RankingRegion,
  YearFilter,
} from "../lib/validation.js";

export const RANKING_LIMIT = 10;

export type RankingKind = "today" | "classic" | "recent" | "hidden" | "top";

// TMDB has no reliable "arthouse" or "biography" flag. Genre, language, votes
// and a small title blocklist are practical heuristics, not an objective
// definition of art cinema or biopics.
const ACTION_GENRE = 28;
const ADVENTURE_GENRE = 12;
const ANIMATION_GENRE = 16;
const SCIENCE_FICTION_GENRE = 878;
const FAMILY_GENRE = 10751;
const TV_MOVIE_GENRE = 10770;
const DRAMA_GENRE = 18;
const DOCUMENTARY_GENRE = 99;
const HISTORY_GENRE = 36;
const WAR_GENRE = 10752;
const ROMANCE_GENRE = 10749;
const MYSTERY_GENRE = 9648;

const EXCLUDED_GENRES = [
  ANIMATION_GENRE,
  DOCUMENTARY_GENRE,
  TV_MOVIE_GENRE,
  FAMILY_GENRE,
].join(",");

const PREFERRED_GENRES = new Set([
  DRAMA_GENRE,
  ROMANCE_GENRE,
  MYSTERY_GENRE,
  HISTORY_GENRE,
  WAR_GENRE,
]);

const BLOCKBUSTER_TITLE_PATTERN =
  /\b(avengers|spider-?man|batman|superman|star wars|jurassic|fast(?: &| and)? furious|transformers|deadpool|minions|despicable me|moana|frozen|sonic|mario bros|harry potter|fantastic beasts|mission:? impossible|john wick|pirates of the caribbean|venom|x-men|wolverine|aquaman|black panther|captain america|iron man|guardians of the galaxy|the marvels|kung fu panda)\b/i;

const BIOPIC_TITLE_PATTERN =
  /传记|biography|biopic|巨星之路|\bthe story of\b/i;

const ASIA_COUNTRIES = new Set([
  "CN",
  "HK",
  "TW",
  "JP",
  "KR",
  "KP",
  "MN",
  "IN",
  "PK",
  "BD",
  "LK",
  "NP",
  "BT",
  "MM",
  "TH",
  "LA",
  "KH",
  "VN",
  "MY",
  "SG",
  "ID",
  "PH",
  "BN",
  "TL",
  "AF",
  "IR",
  "IQ",
  "SY",
  "JO",
  "LB",
  "IL",
  "PS",
  "SA",
  "AE",
  "QA",
  "KW",
  "BH",
  "OM",
  "YE",
  "UZ",
  "KZ",
  "KG",
  "TJ",
  "TM",
  "AM",
  "AZ",
]);

const EUROPE_COUNTRIES = new Set([
  "GB",
  "UK",
  "IE",
  "FR",
  "DE",
  "IT",
  "ES",
  "PT",
  "NL",
  "BE",
  "LU",
  "CH",
  "AT",
  "SE",
  "NO",
  "DK",
  "FI",
  "IS",
  "PL",
  "CZ",
  "SK",
  "HU",
  "RO",
  "BG",
  "GR",
  "HR",
  "SI",
  "RS",
  "BA",
  "ME",
  "MK",
  "AL",
  "EE",
  "LV",
  "LT",
  "UA",
  "BY",
  "MD",
  "RU",
  "MT",
  "CY",
  "MC",
  "AD",
  "SM",
  "LI",
  "VA",
  "XK",
  "TR",
  "GE",
]);

const NORTH_AMERICA_COUNTRIES = new Set(["US", "CA"]);

const LATIN_AMERICA_COUNTRIES = new Set([
  "MX",
  "GT",
  "BZ",
  "SV",
  "HN",
  "NI",
  "CR",
  "PA",
  "CU",
  "DO",
  "HT",
  "JM",
  "TT",
  "PR",
  "BR",
  "AR",
  "CL",
  "CO",
  "PE",
  "VE",
  "EC",
  "BO",
  "PY",
  "UY",
  "GY",
  "SR",
]);

const REGION_DISCOVER_COUNTRIES: Record<
  Exclude<RankingRegion, "all" | "other">,
  string[]
> = {
  asia: ["CN", "HK", "TW", "JP", "KR", "IN", "TH", "VN", "ID", "IR", "SG", "PH", "MY"],
  europe: [
    "GB",
    "FR",
    "DE",
    "IT",
    "ES",
    "SE",
    "DK",
    "PL",
    "RU",
    "IE",
    "NL",
    "BE",
    "PT",
    "GR",
    "RO",
    "TR",
  ],
  "north-america": ["US", "CA"],
  "latin-america": ["MX", "BR", "AR", "CL", "CO", "PE", "CU", "UY"],
};

function currentYear(now = new Date()) {
  return now.getUTCFullYear();
}

function classicCutoffDate(now = new Date()) {
  return `${currentYear(now) - 12}-12-31`;
}

function recentStartDate(now = new Date()) {
  return `${currentYear(now) - 5}-01-01`;
}

export function utcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function pickIndexForDay(length: number, dayKey: string) {
  if (length <= 0) {
    return 0;
  }

  let hash = 0;

  for (let index = 0; index < dayKey.length; index += 1) {
    hash = (hash * 33 + dayKey.charCodeAt(index)) >>> 0;
  }

  return hash % length;
}

function titleText(movie: TmdbCandidate) {
  return `${movie.titleZh} ${movie.titleEn ?? ""}`;
}

export function isExcludedFormat(movie: TmdbCandidate) {
  return (
    movie.genreIds.includes(ANIMATION_GENRE) ||
    movie.genreIds.includes(DOCUMENTARY_GENRE) ||
    movie.genreIds.includes(TV_MOVIE_GENRE)
  );
}

export function isLikelyBiopic(movie: TmdbCandidate) {
  return BIOPIC_TITLE_PATTERN.test(titleText(movie));
}

export function isLikelyBlockbuster(movie: TmdbCandidate, now = new Date()) {
  if (BLOCKBUSTER_TITLE_PATTERN.test(titleText(movie))) {
    return true;
  }

  if (movie.genreIds.includes(FAMILY_GENRE)) {
    return true;
  }

  if (
    movie.genreIds.includes(ACTION_GENRE) &&
    movie.genreIds.includes(ADVENTURE_GENRE)
  ) {
    return true;
  }

  const isRecent =
    movie.releaseYear !== null && movie.releaseYear >= currentYear(now) - 3;
  const isEnglishCommercial =
    movie.originalLanguage === "en" &&
    (movie.genreIds.includes(ACTION_GENRE) ||
      movie.genreIds.includes(SCIENCE_FICTION_GENRE));

  return isEnglishCommercial && isRecent && movie.popularity >= 40;
}

export function isEligibleNarrative(movie: TmdbCandidate, now = new Date()) {
  return (
    !isExcludedFormat(movie) &&
    !isLikelyBiopic(movie) &&
    !isLikelyBlockbuster(movie, now)
  );
}

function movieRegions(movie: TmdbCandidate): Set<RankingRegion> {
  const regions = new Set<RankingRegion>();

  for (const code of movie.originCountries) {
    if (ASIA_COUNTRIES.has(code)) {
      regions.add("asia");
    } else if (EUROPE_COUNTRIES.has(code)) {
      regions.add("europe");
    } else if (NORTH_AMERICA_COUNTRIES.has(code)) {
      regions.add("north-america");
    } else if (LATIN_AMERICA_COUNTRIES.has(code)) {
      regions.add("latin-america");
    } else {
      regions.add("other");
    }
  }

  return regions;
}

export function matchesRegion(movie: TmdbCandidate, region: RankingRegion) {
  if (region === "all") {
    return true;
  }

  if (movie.originCountries.length === 0) {
    return false;
  }

  return movieRegions(movie).has(region);
}

export function matchesYear(movie: TmdbCandidate, year: YearFilter) {
  if (year.kind === "all") {
    return true;
  }

  if (movie.releaseYear === null) {
    return false;
  }

  if (year.kind === "year") {
    return movie.releaseYear === year.year;
  }

  if (year.kind === "decade") {
    return movie.releaseYear >= year.start && movie.releaseYear <= year.start + 9;
  }

  return movie.releaseYear < 1960;
}

function minRatingForKind(kind: RankingKind) {
  if (kind === "top") {
    return 7.5;
  }

  if (kind === "hidden") {
    return 7.3;
  }

  if (kind === "classic" || kind === "recent") {
    return 7.2;
  }

  return 6.5;
}

export function curationScore(movie: TmdbCandidate, kind: RankingKind) {
  let score = 0;

  if (movie.genreIds.some((genreId) => PREFERRED_GENRES.has(genreId))) {
    score += 4;
  }

  if (movie.originalLanguage && movie.originalLanguage !== "en") {
    score += 3;
  }

  if ((movie.rating ?? 0) >= 7.2) {
    score += 2;
  }

  if ((movie.rating ?? 0) >= 8) {
    score += 1;
  }

  if (kind === "today") {
    score += Math.min(movie.popularity / 40, 2);
  }

  if (kind === "classic") {
    if (movie.releaseYear && movie.releaseYear <= currentYear() - 12) {
      score += 3;
    }

    if (movie.voteCount >= 800) {
      score += 1;
    }

    score -= Math.min(movie.popularity / 80, 1.5);
  }

  if (kind === "recent") {
    score += Math.min(Math.max((movie.rating ?? 0) - 7, 0) * 2, 3);
    score -= Math.min(movie.popularity / 100, 1);
  }

  if (kind === "hidden") {
    score += Math.min(Math.max((movie.rating ?? 0) - 7, 0) * 3, 4);
    score -= Math.min(movie.popularity / 20, 3);
    score -= Math.min(movie.voteCount / 8000, 2);
  }

  if (kind === "top") {
    score += Math.min(Math.max((movie.rating ?? 0) - 7, 0) * 4, 6);
    if (movie.voteCount >= 1500) {
      score += 2;
    }
  }

  if (movie.genreIds.includes(ACTION_GENRE)) {
    score -= 3;
  }

  return score;
}

function matchesRankingShape(movie: TmdbCandidate, kind: RankingKind, now = new Date()) {
  const year = currentYear(now);

  if (kind === "classic") {
    return (
      movie.releaseYear !== null &&
      movie.releaseYear <= year - 12 &&
      movie.voteCount >= 400
    );
  }

  if (kind === "recent") {
    return movie.releaseYear !== null && movie.releaseYear >= year - 5;
  }

  if (kind === "hidden") {
    return (
      movie.voteCount >= 150 &&
      movie.voteCount <= 5000 &&
      movie.popularity <= 40
    );
  }

  if (kind === "top") {
    return movie.voteCount >= 1000;
  }

  return true;
}

export function curateCandidates(
  movies: TmdbCandidate[],
  kind: RankingKind,
  now = new Date()
) {
  return movies
    .filter((movie) => isEligibleNarrative(movie, now))
    .filter((movie) => matchesRankingShape(movie, kind, now))
    .filter((movie) => (movie.rating ?? 0) >= minRatingForKind(kind))
    .sort((left, right) => curationScore(right, kind) - curationScore(left, kind));
}

export function dailyCandidatePool(movies: TmdbCandidate[]) {
  const curated = curateCandidates(movies, "today");
  return curated.length > 0
    ? curated
    : movies.filter((movie) => !isExcludedFormat(movie));
}

export function pickDailyFromPool(
  movies: TmdbCandidate[],
  dayKey = utcDayKey()
) {
  const pool = dailyCandidatePool(movies);

  if (pool.length === 0) {
    return null;
  }

  return pool[pickIndexForDay(pool.length, dayKey)] ?? null;
}

export async function firstAllowedHydratedMovie(
  movies: TmdbCandidate[],
  startIndex = 0
): Promise<CatalogMovie | null> {
  if (movies.length === 0) {
    return null;
  }

  const attempts = Math.min(movies.length, RANKING_LIMIT);

  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = movies[(startIndex + offset) % movies.length];

    if (!candidate) {
      continue;
    }

    const movie = await hydrateMovie(candidate);

    if (!hasExcludedProductionCountry(movie)) {
      return movie;
    }
  }

  return null;
}

export function uniqueCandidates(movies: TmdbCandidate[]) {
  const seen = new Set<string>();
  const unique: TmdbCandidate[] = [];

  for (const movie of movies) {
    if (seen.has(movie.externalId)) {
      continue;
    }

    seen.add(movie.externalId);
    unique.push(movie);
  }

  return unique;
}

function applyDiscoverFilters(
  params: Record<string, string>,
  filters: RankingFilters
) {
  const next = { ...params };

  if (filters.region !== "all" && filters.region !== "other") {
    next.with_origin_country = REGION_DISCOVER_COUNTRIES[filters.region].join("|");
  }

  if (filters.year.kind === "year") {
    next.primary_release_year = String(filters.year.year);
  }

  if (filters.year.kind === "decade") {
    next["primary_release_date.gte"] = `${filters.year.start}-01-01`;
    next["primary_release_date.lte"] = `${filters.year.start + 9}-12-31`;
  }

  if (filters.year.kind === "earlier") {
    next["primary_release_date.lte"] = "1959-12-31";
  }

  return next;
}

async function hydrateMovie(movie: TmdbCandidate): Promise<CatalogMovie> {
  const base = toCatalogMovie(movie);
  let chinese: CatalogMovie | null = null;
  let english: CatalogMovie | null = null;

  try {
    chinese = await tmdbClient.getMovieDetails(movie.externalId, "zh-CN");
  } catch (error) {
    console.error(error);
  }

  try {
    english = await tmdbClient.getMovieDetails(movie.externalId, "en-US");
  } catch (error) {
    console.error(error);
  }

  const merged = mergeCatalogLocales(chinese ?? base, english);

  return {
    ...merged,
    posterUrl: merged.posterUrl ?? movie.posterUrl,
    backdropUrl: merged.backdropUrl ?? movie.backdropUrl,
    originCountries:
      merged.originCountries && merged.originCountries.length > 0
        ? merged.originCountries
        : movie.originCountries,
  };
}

async function enrichOriginCountries(movies: TmdbCandidate[]): Promise<TmdbCandidate[]> {
  return Promise.all(
    movies.map(async (movie) => {
      if (movie.originCountries.length > 0) {
        return movie;
      }

      try {
        const details = await tmdbClient.getMovieDetails(movie.externalId, "zh-CN");

        return {
          ...movie,
          originCountries:
            details.originCountries && details.originCountries.length > 0
              ? details.originCountries
              : movie.originCountries,
          countries:
            details.countries.length > 0 ? details.countries : movie.countries,
          director: details.director ?? movie.director,
          overview: isMissingOverview(movie.overview)
            ? details.overview
            : movie.overview,
        };
      } catch (error) {
        console.error(error);
        return movie;
      }
    })
  );
}

async function discoverWithFallback(
  base: Record<string, string>,
  filters: RankingFilters
) {
  const constrained = await tmdbClient.discoverMovies(
    applyDiscoverFilters(base, filters)
  );

  if (
    filters.region === "all" ||
    filters.region === "other" ||
    constrained.length > 0
  ) {
    return constrained;
  }

  return tmdbClient.discoverMovies(
    applyDiscoverFilters(base, { ...filters, region: "all" })
  );
}

async function loadTodayCandidates(filters: RankingFilters) {
  const base = {
    with_genres: `${DRAMA_GENRE}|${ROMANCE_GENRE}|${MYSTERY_GENRE}`,
    without_genres: EXCLUDED_GENRES,
    sort_by: "popularity.desc",
    "vote_average.gte": "6.8",
    "vote_count.gte": "80",
  };
  const discovered = await tmdbClient.discoverMovies(
    applyDiscoverFilters(base, filters)
  );

  if (filters.region !== "all" || filters.year.kind !== "all") {
    const trending = await tmdbClient.getTrendingMovies();
    const matchedTrending = trending.filter(
      (movie) =>
        matchesRegion(movie, filters.region) &&
        matchesYear(movie, filters.year)
    );
    const fallbackDiscover =
      discovered.length > 0
        ? discovered
        : await tmdbClient.discoverMovies(
            applyDiscoverFilters(base, { ...filters, region: "all" })
          );

    return uniqueCandidates([...fallbackDiscover, ...matchedTrending]);
  }

  const trending = await tmdbClient.getTrendingMovies();
  return uniqueCandidates([...trending, ...discovered]);
}

async function loadClassicCandidates(filters: RankingFilters) {
  return discoverWithFallback(
    {
      without_genres: EXCLUDED_GENRES,
      sort_by: "vote_average.desc",
      "vote_average.gte": "7.4",
      "vote_count.gte": "800",
      "primary_release_date.lte": classicCutoffDate(),
    },
    filters
  );
}

async function loadRecentCandidates(filters: RankingFilters) {
  return discoverWithFallback(
    {
      without_genres: EXCLUDED_GENRES,
      with_genres: `${DRAMA_GENRE}|${ROMANCE_GENRE}|${MYSTERY_GENRE}`,
      sort_by: "vote_average.desc",
      "vote_average.gte": "7.2",
      "vote_count.gte": "150",
      "primary_release_date.gte": recentStartDate(),
    },
    filters
  );
}

async function loadHiddenCandidates(filters: RankingFilters) {
  return discoverWithFallback(
    {
      without_genres: EXCLUDED_GENRES,
      sort_by: "vote_average.desc",
      "vote_average.gte": "7.3",
      "vote_count.gte": "150",
      "vote_count.lte": "5000",
    },
    filters
  );
}

async function loadTopRatedCandidates(filters: RankingFilters) {
  return discoverWithFallback(
    {
      without_genres: EXCLUDED_GENRES,
      sort_by: "vote_average.desc",
      "vote_average.gte": "7.5",
      "vote_count.gte": "1000",
    },
    filters
  );
}

async function loadCandidates(kind: RankingKind, filters: RankingFilters) {
  if (kind === "classic") {
    return loadClassicCandidates(filters);
  }

  if (kind === "recent") {
    return loadRecentCandidates(filters);
  }

  if (kind === "hidden") {
    return loadHiddenCandidates(filters);
  }

  if (kind === "top") {
    return loadTopRatedCandidates(filters);
  }

  return loadTodayCandidates(filters);
}

const EMPTY_FILTERS: RankingFilters = {
  region: "all",
  year: { kind: "all" },
};

async function getDailyRecommendation(): Promise<CatalogMovie | null> {
  const [todayCandidates, classicCandidates] = await Promise.all([
    loadTodayCandidates(EMPTY_FILTERS),
    loadClassicCandidates(EMPTY_FILTERS),
  ]);
  const pool = dailyCandidatePool(
    withoutExcludedProductionCountries(
      uniqueCandidates([...todayCandidates, ...classicCandidates])
    )
  );

  if (pool.length === 0) {
    return null;
  }

  return firstAllowedHydratedMovie(
    pool,
    pickIndexForDay(pool.length, utcDayKey())
  );
}

async function getRanking(
  kind: RankingKind,
  filters: RankingFilters = EMPTY_FILTERS
): Promise<CatalogMovie[]> {
  let candidates = withoutExcludedProductionCountries(
    await loadCandidates(kind, filters)
  );

  if (filters.region !== "all") {
    candidates = withoutExcludedProductionCountries(
      await enrichOriginCountries(candidates)
    );
  }

  const ranked = withoutExcludedProductionCountries(
    curateCandidates(candidates, kind)
      .filter((movie) => matchesRegion(movie, filters.region))
      .filter((movie) => matchesYear(movie, filters.year))
  );

  const picked: CatalogMovie[] = [];
  let index = 0;

  while (picked.length < RANKING_LIMIT && index < ranked.length) {
    const batch = ranked.slice(
      index,
      index + (RANKING_LIMIT - picked.length)
    );
    const hydrated = await Promise.all(batch.map(hydrateMovie));
    picked.push(...withoutExcludedProductionCountries(hydrated));
    index += batch.length;
  }

  return picked.slice(0, RANKING_LIMIT);
}

export const curation = {
  getDailyRecommendation,
  getRanking,
  getTodayRanking: (filters?: RankingFilters) => getRanking("today", filters),
  getClassicRanking: (filters?: RankingFilters) =>
    getRanking("classic", filters),
  getRecentRanking: (filters?: RankingFilters) => getRanking("recent", filters),
  getHiddenGemsRanking: (filters?: RankingFilters) =>
    getRanking("hidden", filters),
  getTopRatedRanking: (filters?: RankingFilters) => getRanking("top", filters),
};
