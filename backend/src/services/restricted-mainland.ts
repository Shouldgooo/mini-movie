import {
  publishedRestrictedFilms,
  type RestrictedFilmEntry,
  type RestrictionSource,
} from "../data/restricted-films.js";
import { TmdbNotFoundError, TmdbUnavailableError } from "./tmdb.js";
import { enrichCatalogMovie } from "./movie-enrichment.js";
import { localizeRestrictionFields } from "./restriction-i18n.js";
import type { YearFilter } from "../lib/validation.js";
import type { CatalogMovie } from "./tmdb.js";

export type RestrictedMainlandMovie = CatalogMovie & {
  restrictionStatus: string;
  restrictionStatusEn: string;
  restrictionPeriod: string;
  restrictionPeriodEn: string;
  restrictionContext: string;
  restrictionContextEn: string;
  currentStatus: string;
  currentStatusEn: string;
  restrictionSources: RestrictionSource[];
};

function matchesReleaseYear(releaseYear: number | null, year: YearFilter) {
  if (year.kind === "all") {
    return true;
  }

  if (releaseYear === null) {
    return false;
  }

  if (year.kind === "year") {
    return releaseYear === year.year;
  }

  if (year.kind === "decade") {
    return releaseYear >= year.start && releaseYear <= year.start + 9;
  }

  return releaseYear < 1960;
}

async function enrichEntry(
  entry: RestrictedFilmEntry
): Promise<RestrictedMainlandMovie | null> {
  try {
    const movie = await enrichCatalogMovie(String(entry.tmdbId));

    return {
      ...movie,
      ...localizeRestrictionFields(entry),
      restrictionSources: entry.sources,
    };
  } catch (error) {
    if (error instanceof TmdbNotFoundError) {
      console.error(
        `Restricted collection skipped missing TMDB title ${entry.tmdbId}`
      );
      return null;
    }

    throw error;
  }
}

export async function getRestrictedMainlandCollection(
  year: YearFilter = { kind: "all" }
): Promise<RestrictedMainlandMovie[]> {
  const published = publishedRestrictedFilms();
  const settled = await Promise.all(
    published.map(async (entry) => {
      try {
        return { movie: await enrichEntry(entry), unavailable: false };
      } catch (error) {
        if (error instanceof TmdbUnavailableError) {
          return { movie: null, unavailable: true };
        }

        throw error;
      }
    })
  );

  const movies = settled
    .map((item) => item.movie)
    .filter((movie): movie is RestrictedMainlandMovie => movie !== null);
  const unavailable = settled.some((item) => item.unavailable);

  if (movies.length === 0 && unavailable) {
    throw new TmdbUnavailableError();
  }

  return movies.filter((movie) => matchesReleaseYear(movie.releaseYear, year));
}
