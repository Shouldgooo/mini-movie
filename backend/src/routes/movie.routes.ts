import { Router } from "express";
import { db } from "../prisma/db.js";
import { toPublicUser } from "../lib/users.js";
import {
  parsePositiveInt,
  parseRankingQuery,
  parseSearchQuery,
  RankingFilterError,
  SearchQueryError,
} from "../lib/validation.js";
import {
  TmdbNotFoundError,
  TmdbUnavailableError,
  tmdbClient,
  withoutExcludedProductionCountries,
} from "../services/tmdb.js";
import { curation, type RankingKind } from "../services/curation.js";
import { getRestrictedMainlandCollection } from "../services/restricted-mainland.js";
import { enrichCatalogMovie } from "../services/movie-enrichment.js";

const router = Router();

function tmdbErrorResponse(error: unknown, res: import("express").Response) {
  if (error instanceof TmdbNotFoundError) {
    return res.status(404).json({
      message: "Movie not found",
    });
  }

  if (error instanceof TmdbUnavailableError) {
    return res.status(502).json({
      message: "Movie service unavailable",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
  });
}

// ========================================
// Daily recommendation
// GET /api/movies/daily
// ========================================
router.get("/daily", async (req, res) => {
  try {
    const movie = await curation.getDailyRecommendation();

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    return res.status(200).json(movie);
  } catch (error) {
    return tmdbErrorResponse(error, res);
  }
});

function rankingHandler(kind: RankingKind) {
  return async (
    req: import("express").Request,
    res: import("express").Response
  ) => {
    try {
      const filters = parseRankingQuery(req.query as Record<string, unknown>);
      const movies = await curation.getRanking(kind, filters);
      return res.status(200).json(movies);
    } catch (error) {
      if (error instanceof RankingFilterError) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return tmdbErrorResponse(error, res);
    }
  };
}

// ========================================
// Curated rankings
// GET /api/movies/rankings/today
// GET /api/movies/rankings/classic
// GET /api/movies/rankings/recent
// GET /api/movies/rankings/hidden-gems
// GET /api/movies/rankings/top-rated
// Optional query: region, year | decade
// ========================================
router.get("/rankings/today", rankingHandler("today"));
router.get("/rankings/classic", rankingHandler("classic"));
router.get("/rankings/recent", rankingHandler("recent"));
router.get("/rankings/hidden-gems", rankingHandler("hidden"));
router.get("/rankings/top-rated", rankingHandler("top"));

// ========================================
// Editorial collection
// GET /api/movies/restricted-mainland
// Optional query: year | decade
// Region is ignored: this is not a geographic ranking.
// ========================================
router.get("/restricted-mainland", async (req, res) => {
  try {
    const filters = parseRankingQuery(req.query as Record<string, unknown>);
    const movies = await getRestrictedMainlandCollection(filters.year);
    return res.status(200).json(movies);
  } catch (error) {
    if (error instanceof RankingFilterError) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return tmdbErrorResponse(error, res);
  }
});

// ========================================
// Title search
// GET /api/movies/search?query=Interstellar
// ========================================
router.get("/search", async (req, res) => {
  try {
    const query = parseSearchQuery(req.query as Record<string, unknown>);
    const movies = withoutExcludedProductionCountries(
      await tmdbClient.searchMovies(query)
    );
    return res.status(200).json(movies);
  } catch (error) {
    if (error instanceof SearchQueryError) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return tmdbErrorResponse(error, res);
  }
});

// ========================================
// Popular / search catalogue
// GET /api/movies
// GET /api/movies?query=interstellar
// ========================================
router.get("/", async (req, res) => {
  try {
    const rawQuery = req.query.query;
    const query =
      typeof rawQuery === "string" ? rawQuery.trim() : "";

    const movies = withoutExcludedProductionCountries(
      query
        ? await tmdbClient.searchMovies(query)
        : await tmdbClient.getPopularMovies()
    );

    return res.status(200).json(movies);
  } catch (error) {
    return tmdbErrorResponse(error, res);
  }
});

// ========================================
// Get Reviews For A Local Movie
// GET /api/movies/:movieId/reviews
// ========================================
router.get("/:movieId/reviews", async (req, res) => {
  try {
    const movieId = parsePositiveInt(req.params.movieId);

    if (!movieId) {
      return res.status(400).json({
        message: "Valid movieId is required",
      });
    }

    const movie = await db.orm.public.Movie
      .where({
        id: movieId,
      })
      .first();

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const reviews = await db.orm.public.Review
      .where({
        movieId,
      })
      .include("user")
      .all();

    const safeReviews = reviews.map((review) => ({
      id: review.id,
      content: review.content,
      movieId: review.movieId,
      userId: review.userId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: toPublicUser(review.user),
    }));

    return res.status(200).json(safeReviews);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Movie details from TMDB
// GET /api/movies/:externalId
// ========================================
router.get("/:externalId", async (req, res) => {
  try {
    const externalId = parsePositiveInt(req.params.externalId);

    if (!externalId) {
      return res.status(400).json({
        message: "Valid movie id is required",
      });
    }

    const movie = await enrichCatalogMovie(String(externalId));

    return res.status(200).json(movie);
  } catch (error) {
    return tmdbErrorResponse(error, res);
  }
});

export default router;
