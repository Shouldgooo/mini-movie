import { Router } from "express";
import { db } from "../prisma/db.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.middleware.js";
import { isUniqueConstraintError } from "../lib/errors.js";
import { MovieNotFoundError, resolveLocalMovie } from "../lib/movies.js";
import {
  createReviewSchema,
  parsePositiveInt,
  updateReviewSchema,
  validateBody,
} from "../lib/validation.js";
import { TmdbUnavailableError } from "../services/tmdb.js";

const router = Router();

// ========================================
// Create Review
// POST /api/reviews
// ========================================
router.post(
  "/",
  requireAuth,
  validateBody(createReviewSchema),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;
      const { movieId, externalId, content } = req.body;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const movie = await resolveLocalMovie({
        movieId,
        externalId,
      });

      const review = await db.orm.public.Review.create({
        content,
        userId,
        movieId: movie.id,
      });

      return res.status(201).json(review);
    } catch (error) {
      console.error(error);

      if (error instanceof MovieNotFoundError) {
        return res.status(404).json({
          message: "Movie not found",
        });
      }

      if (error instanceof TmdbUnavailableError) {
        return res.status(502).json({
          message: "Movie service unavailable",
        });
      }

      if (isUniqueConstraintError(error)) {
        return res.status(409).json({
          message: "You have already reviewed this movie",
        });
      }

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// ========================================
// Get My Reviews
// GET /api/reviews/me
// ========================================
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const reviews = await db.orm.public.Review
      .where({
        userId,
      })
      .include("movie")
      .all();

    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Update My Review
// PUT /api/reviews/:reviewId
// ========================================
router.put(
  "/:reviewId",
  requireAuth,
  validateBody(updateReviewSchema),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;
      const reviewId = parsePositiveInt(req.params.reviewId);
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      if (!reviewId) {
        return res.status(400).json({
          message: "Valid reviewId is required",
        });
      }

      const existingReview = await db.orm.public.Review
        .where({
          id: reviewId,
          userId,
        })
        .first();

      if (!existingReview) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      const updatedReview = await db.orm.public.Review
        .where({
          id: reviewId,
          userId,
        })
        .update({
          content,
        });

      return res.status(200).json(updatedReview);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// ========================================
// Delete My Review
// DELETE /api/reviews/:reviewId
// ========================================
router.delete("/:reviewId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const reviewId = parsePositiveInt(req.params.reviewId);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!reviewId) {
      return res.status(400).json({
        message: "Valid reviewId is required",
      });
    }

    const deletedReview = await db.orm.public.Review
      .where({
        id: reviewId,
        userId,
      })
      .delete();

    if (!deletedReview) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
