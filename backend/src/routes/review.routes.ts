import { Router } from "express";
import { db } from "../prisma/db.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// ========================================
// Create Review
// POST /api/reviews
// ========================================
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { movieId, content } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!movieId || typeof movieId !== "number") {
      return res.status(400).json({
        message: "Valid movieId is required",
      });
    }

    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Review content is required",
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

    const review = await db.orm.public.Review.create({
      content: content.trim(),
      userId,
      movieId,
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "sqlState" in error &&
      error.sqlState === "23505"
    ) {
      return res.status(409).json({
        message: "You have already reviewed this movie",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

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
router.put("/:reviewId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const reviewId = Number(req.params.reviewId);
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        message: "Valid reviewId is required",
      });
    }

    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Review content is required",
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
        content: content.trim(),
      });

    return res.status(200).json(updatedReview);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Delete My Review
// DELETE /api/reviews/:reviewId
// ========================================
router.delete("/:reviewId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const reviewId = Number(req.params.reviewId);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
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