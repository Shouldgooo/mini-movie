import { Router } from "express";
import { db } from "../prisma/db.js";

const router = Router();

router.get("/daily", (req, res) => {
  res.status(200).json({
    titleZh: "星际穿越",
    titleEn: "Interstellar",
    releaseYear: 2014,
  });
});

router.get("/", async (req, res) => {
  try {
    const movies = await db.orm.public.Movie.all();

    return res.status(200).json(movies);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ========================================
// Get Reviews For A Movie
// GET /api/movies/:movieId/reviews
// ========================================
router.get("/:movieId/reviews", async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId) || movieId <= 0) {
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

    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;