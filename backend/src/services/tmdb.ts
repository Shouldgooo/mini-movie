export const MISSING_OVERVIEW = "暂无简介";

export type CatalogMovie = {
  externalId: string;
  titleZh: string;
  titleEn: string | null;
  titleOriginal?: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  overview: string;
  overviewZh?: string;
  overviewEn?: string;
  director: string | null;
  directorZh?: string | null;
  directorEn?: string | null;
  countries: string[];
  countriesZh?: string[];
  countriesEn?: string[];
  originCountries?: string[];
  rating: number | null;
};

export type TmdbCandidate = CatalogMovie & {
  originalLanguage: string;
  popularity: number;
  voteCount: number;
  genreIds: number[];
  originCountries: string[];
  directorOriginal?: string | null;
};

export type TmdbMovieResult = {
  id?: number;
  title?: string;
  original_title?: string;
  original_language?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  genres?: { id?: number }[];
  origin_country?: string[];
  production_countries?: { iso_3166_1?: string; name?: string }[];
  credits?: {
    crew?: { job?: string; name?: string; original_name?: string }[];
  };
};

type TmdbListResponse = {
  results?: TmdbMovieResult[];
};

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export class TmdbNotFoundError extends Error {
  constructor() {
    super("Movie not found");
    this.name = "TmdbNotFoundError";
  }
}

export class TmdbUnavailableError extends Error {
  constructor() {
    super("Movie service unavailable");
    this.name = "TmdbUnavailableError";
  }
}

function getAccessToken() {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();

  if (!token) {
    throw new TmdbUnavailableError();
  }

  return token;
}

function tmdbImageUrl(
  path: string | null | undefined,
  size: "w500" | "w1280"
): string | null {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

function releaseYearFromDate(releaseDate: string | undefined): number | null {
  if (!releaseDate || !/^\d{4}/.test(releaseDate)) {
    return null;
  }

  const year = Number(releaseDate.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

function nonEmptyName(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function directorFromCredits(movie: TmdbMovieResult): {
  localized: string | null;
  original: string | null;
} {
  const director = movie.credits?.crew?.find((person) => person.job === "Director");
  return {
    localized: nonEmptyName(director?.name),
    original: nonEmptyName(director?.original_name),
  };
}

function productionCountryNames(movie: TmdbMovieResult): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const country of movie.production_countries ?? []) {
    const name = country.name?.trim();

    if (!name || seen.has(name)) {
      continue;
    }

    seen.add(name);
    names.push(name);
  }

  return names;
}

function isChineseLanguage(language: string) {
  return language.toLowerCase().startsWith("zh");
}

export function ensureOverview(overview: string | null | undefined): string {
  const trimmed = overview?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : MISSING_OVERVIEW;
}

export function isMissingOverview(overview: string | null | undefined): boolean {
  const trimmed = overview?.trim() ?? "";
  return trimmed.length === 0 || trimmed === MISSING_OVERVIEW;
}

const COUNTRY_NAMES: Record<string, string> = {
  CN: "中国",
  HK: "中国香港",
  TW: "中国台湾",
  JP: "日本",
  KR: "韩国",
  IN: "印度",
  TH: "泰国",
  VN: "越南",
  ID: "印度尼西亚",
  IR: "伊朗",
  TR: "土耳其",
  AE: "阿联酋",
  IL: "以色列",
  GB: "英国",
  FR: "法国",
  DE: "德国",
  IT: "意大利",
  ES: "西班牙",
  SE: "瑞典",
  DK: "丹麦",
  NO: "挪威",
  FI: "芬兰",
  IE: "爱尔兰",
  NL: "荷兰",
  BE: "比利时",
  PT: "葡萄牙",
  GR: "希腊",
  PL: "波兰",
  CZ: "捷克",
  HU: "匈牙利",
  RO: "罗马尼亚",
  RU: "俄罗斯",
  AT: "奥地利",
  CH: "瑞士",
  US: "美国",
  CA: "加拿大",
  MX: "墨西哥",
  BR: "巴西",
  AR: "阿根廷",
  CL: "智利",
  CO: "哥伦比亚",
  PE: "秘鲁",
  CU: "古巴",
  VE: "委内瑞拉",
  UY: "乌拉圭",
  AU: "澳大利亚",
  NZ: "新西兰",
};

export function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

function uniqueCodes(codes: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const code of codes) {
    const normalized = code.trim().toUpperCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

export function toCatalogMovie(
  movie: TmdbCandidate,
  language = "zh-CN"
): CatalogMovie {
  const originCountries = uniqueCodes(movie.originCountries);
  const chinese = isChineseLanguage(language);
  const localizedCountries =
    movie.countries.length > 0
      ? movie.countries
      : chinese
        ? originCountries.map(countryLabel)
        : [];
  const directorLocalized = movie.director;
  const directorOriginal = movie.directorOriginal ?? null;

  return {
    externalId: movie.externalId,
    titleZh: movie.titleZh,
    titleEn: movie.titleEn,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    releaseYear: movie.releaseYear,
    overview: ensureOverview(movie.overview),
    director: directorLocalized || directorOriginal,
    directorZh: chinese ? directorLocalized : null,
    directorEn: chinese ? directorOriginal : directorLocalized || directorOriginal,
    countries: chinese ? localizedCountries : movie.countries,
    countriesZh: chinese ? localizedCountries : [],
    countriesEn: chinese ? [] : localizedCountries,
    originCountries,
    rating: movie.rating,
  };
}

export function toTmdbCandidate(
  movie: TmdbMovieResult,
  language = "zh-CN"
): TmdbCandidate | null {
  if (typeof movie.id !== "number" || movie.id <= 0) {
    return null;
  }

  const localized = movie.title?.trim() ?? "";
  const original = movie.original_title?.trim() ?? "";
  const titleZh = localized || original;

  if (!titleZh) {
    return null;
  }

  const overview = movie.overview?.trim() ?? "";
  const hasRating =
    typeof movie.vote_average === "number" &&
    movie.vote_average > 0 &&
    (movie.vote_count ?? 0) > 0;
  const genreIds =
    movie.genre_ids ??
    (movie.genres ?? [])
      .map((genre) => genre.id)
      .filter((id): id is number => typeof id === "number");
  const originCountries = uniqueCodes([
    ...(movie.origin_country ?? []),
    ...((movie.production_countries ?? [])
      .map((country) => country.iso_3166_1)
      .filter((code): code is string => Boolean(code))),
  ]);
  const credits = directorFromCredits(movie);
  const localizedCountries = productionCountryNames(movie);
  const countries =
    localizedCountries.length > 0
      ? localizedCountries
      : isChineseLanguage(language)
        ? originCountries.map(countryLabel)
        : [];

  return {
    externalId: String(movie.id),
    titleZh,
    titleEn: original && original !== titleZh ? original : null,
    posterUrl: tmdbImageUrl(movie.poster_path, "w500"),
    backdropUrl: tmdbImageUrl(movie.backdrop_path, "w1280"),
    releaseYear: releaseYearFromDate(movie.release_date),
    overview,
    director: credits.localized,
    directorOriginal: credits.original,
    countries,
    rating: hasRating ? Math.round(movie.vote_average! * 10) / 10 : null,
    originalLanguage: movie.original_language ?? "",
    popularity: movie.popularity ?? 0,
    voteCount: movie.vote_count ?? 0,
    genreIds,
    originCountries,
  };
}

export function normalizeTmdbMovie(
  movie: TmdbMovieResult,
  language = "zh-CN"
): CatalogMovie | null {
  const candidate = toTmdbCandidate(movie, language);
  return candidate ? toCatalogMovie(candidate, language) : null;
}

async function tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = getAccessToken();
  const url = new URL(`${TMDB_API_BASE}${path}`);

  url.searchParams.set("language", "zh-CN");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.error(error);
    throw new TmdbUnavailableError();
  }

  if (response.status === 404) {
    throw new TmdbNotFoundError();
  }

  if (!response.ok) {
    console.error(`TMDB request failed with status ${response.status}`);
    throw new TmdbUnavailableError();
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error(error);
    throw new TmdbUnavailableError();
  }
}

function mapCandidates(results: TmdbMovieResult[] | undefined): TmdbCandidate[] {
  return (results ?? [])
    .map((movie) => toTmdbCandidate(movie))
    .filter((movie): movie is TmdbCandidate => movie !== null);
}

async function getPopularMovies(): Promise<CatalogMovie[]> {
  const data = await tmdbGet<TmdbListResponse>("/movie/popular");
  return mapCandidates(data.results).map((movie) => toCatalogMovie(movie));
}

async function searchMovies(query: string): Promise<CatalogMovie[]> {
  const data = await tmdbGet<TmdbListResponse>("/search/movie", {
    query,
    include_adult: "false",
  });

  return mapCandidates(data.results).map((movie) => toCatalogMovie(movie));
}

async function getMovieDetails(
  externalId: string,
  language = "zh-CN"
): Promise<CatalogMovie> {
  const data = await tmdbGet<TmdbMovieResult>(`/movie/${externalId}`, {
    append_to_response: "credits",
    language,
  });
  const movie = toTmdbCandidate(data, language);

  if (!movie) {
    throw new TmdbNotFoundError();
  }

  return toCatalogMovie(movie, language);
}

async function getTrendingMovies(): Promise<TmdbCandidate[]> {
  const data = await tmdbGet<TmdbListResponse>("/trending/movie/day");
  return mapCandidates(data.results);
}

async function discoverMovies(
  params: Record<string, string>
): Promise<TmdbCandidate[]> {
  const data = await tmdbGet<TmdbListResponse>("/discover/movie", {
    include_adult: "false",
    ...params,
  });

  return mapCandidates(data.results);
}

export const tmdbClient = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getTrendingMovies,
  discoverMovies,
};
