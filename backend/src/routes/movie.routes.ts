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
  const movies = await db.orm.public.Movie.all();

  res.status(200).json(movies);
});

export default router;