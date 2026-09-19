import { Router } from "express";
import { db } from "../prisma/db.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// ========================================
// Add Favourite
// POST /api/favourites
// ========================================
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { movieId } = req.body;

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

    const favourite = await db.orm.public.Favourite.create({
      userId,
      movieId,
    });

    return res.status(201).json(favourite);
  } catch (error) {
    console.error(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "sqlState" in error &&
      error.sqlState === "23505"
    ) {
      return res.status(409).json({
        message: "Movie is already in favourites",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Get My Favourites
// GET /api/favourites
// ========================================
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const favourites = await db.orm.public.Favourite
      .where({
        userId,
      })
      .include("movie")
      .all();

    return res.status(200).json(favourites);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Delete Favourite
// DELETE /api/favourites/:movieId
// ========================================
router.delete("/:movieId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const movieId = Number(req.params.movieId);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({
        message: "Valid movieId is required",
      });
    }

    const favourite = await db.orm.public.Favourite
      .where({
        userId,
        movieId,
      })
      .delete();

    if (!favourite) {
      return res.status(404).json({
        message: "Favourite not found",
      });
    }

    return res.status(200).json({
      message: "Favourite removed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;