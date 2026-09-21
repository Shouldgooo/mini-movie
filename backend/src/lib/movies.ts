import { db } from "../prisma/db.js";
import { isUniqueConstraintError } from "./errors.js";
import {
  TmdbNotFoundError,
  tmdbClient,
  type CatalogMovie,
} from "../services/tmdb.js";

export class MovieNotFoundError extends Error {
  constructor() {
    super("Movie not found");
    this.name = "MovieNotFoundError";
  }
}

function toExternalId(value: string | number): string {
  return String(value).trim();
}

async function createLocalMovie(catalogMovie: CatalogMovie) {
  try {
    return await db.orm.public.Movie.create({
      externalId: catalogMovie.externalId,
      titleZh: catalogMovie.titleZh,
      titleEn: catalogMovie.titleEn,
      posterUrl: catalogMovie.posterUrl,
      releaseYear: catalogMovie.releaseYear,
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const existing = await db.orm.public.Movie.where({
      externalId: catalogMovie.externalId,
    }).first();

    if (!existing) {
      throw error;
    }

    return existing;
  }
}

export async function resolveLocalMovie(input: {
  movieId?: number;
  externalId?: string | number;
}) {
  if (input.movieId !== undefined) {
    const movie = await db.orm.public.Movie.where({
      id: input.movieId,
    }).first();

    if (!movie) {
      throw new MovieNotFoundError();
    }

    return movie;
  }

  if (input.externalId === undefined) {
    throw new MovieNotFoundError();
  }

  const externalId = toExternalId(input.externalId);

  if (!/^\d+$/.test(externalId)) {
    throw new MovieNotFoundError();
  }

  const existing = await db.orm.public.Movie.where({
    externalId,
  }).first();

  if (existing) {
    return existing;
  }

  try {
    const catalogMovie = await tmdbClient.getMovieDetails(externalId);
    return await createLocalMovie(catalogMovie);
  } catch (error) {
    if (error instanceof TmdbNotFoundError) {
      throw new MovieNotFoundError();
    }

    throw error;
  }
}
