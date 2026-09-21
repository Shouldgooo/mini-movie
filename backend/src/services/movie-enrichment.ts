import {
  ensureOverview,
  isMissingOverview,
  TmdbNotFoundError,
  TmdbUnavailableError,
  tmdbClient,
  type CatalogMovie,
} from "./tmdb.js";

function nonEmptyOverview(overview: string | null | undefined): string {
  const trimmed = overview?.trim() ?? "";
  return isMissingOverview(trimmed) ? "" : trimmed;
}

function firstName(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    const trimmed = value?.trim() ?? "";

    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
}

function firstCountries(...lists: Array<string[] | undefined>): string[] {
  for (const list of lists) {
    if (list && list.length > 0) {
      return list;
    }
  }

  return [];
}

export function mergeCatalogLocales(
  chinese: CatalogMovie,
  english: CatalogMovie | null
): CatalogMovie {
  const overviewZh =
    nonEmptyOverview(chinese.overviewZh) || nonEmptyOverview(chinese.overview);
  const overviewEn =
    nonEmptyOverview(english?.overviewEn) ||
    nonEmptyOverview(english?.overview);
  const directorZh = firstName(
    chinese.directorZh,
    chinese.director,
    english?.directorZh
  );
  const directorEn = firstName(
    english?.directorEn,
    english?.director,
    chinese.directorEn
  );
  const countriesZh = firstCountries(chinese.countriesZh, chinese.countries);
  const countriesEn = firstCountries(english?.countriesEn, english?.countries);

  const originCountries =
    chinese.originCountries && chinese.originCountries.length > 0
      ? chinese.originCountries
      : english?.originCountries && english.originCountries.length > 0
        ? english.originCountries
        : undefined;

  return {
    ...chinese,
    titleEn: english?.titleZh || chinese.titleEn,
    titleOriginal: chinese.titleOriginal ?? chinese.titleEn,
    overview: ensureOverview(overviewZh || overviewEn),
    overviewZh: overviewZh || overviewEn,
    overviewEn: overviewEn || overviewZh,
    director: directorZh || directorEn,
    directorZh,
    directorEn,
    countries: countriesZh,
    countriesZh,
    countriesEn,
    posterUrl: chinese.posterUrl ?? english?.posterUrl ?? null,
    backdropUrl: chinese.backdropUrl ?? english?.backdropUrl ?? null,
    ...(originCountries ? { originCountries } : {}),
  };
}

export async function enrichCatalogMovie(
  externalId: string
): Promise<CatalogMovie> {
  const chinese = await tmdbClient.getMovieDetails(externalId, "zh-CN");
  let english: CatalogMovie | null = null;

  try {
    english = await tmdbClient.getMovieDetails(externalId, "en-US");
  } catch {
    english = null;
  }

  return mergeCatalogLocales(chinese, english);
}

export async function enrichCatalogMovies(
  tmdbIds: number[]
): Promise<CatalogMovie[]> {
  const uniqueIds = [...new Set(tmdbIds)];
  const settled = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        return {
          movie: await enrichCatalogMovie(String(id)),
          unavailable: false,
        };
      } catch (error) {
        if (error instanceof TmdbNotFoundError) {
          console.error(`Collection skipped missing TMDB title ${id}`);
          return { movie: null, unavailable: false };
        }

        if (error instanceof TmdbUnavailableError) {
          return { movie: null, unavailable: true };
        }

        throw error;
      }
    })
  );

  const movies = settled
    .map((item) => item.movie)
    .filter((movie): movie is CatalogMovie => movie !== null);
  const unavailable = settled.some((item) => item.unavailable);

  if (movies.length === 0 && unavailable) {
    throw new TmdbUnavailableError();
  }

  const byId = new Map(
    movies.map((movie) => [movie.externalId, movie] as const)
  );

  return tmdbIds
    .map((id) => byId.get(String(id)))
    .filter((movie): movie is CatalogMovie => movie !== undefined);
}
