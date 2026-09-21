import { Router } from "express";
import {
  CollectionNotFoundError,
  getCollectionBySlug,
  listCollectionSummaries,
} from "../services/collections.js";
import {
  TmdbNotFoundError,
  TmdbUnavailableError,
} from "../services/tmdb.js";

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

router.get("/", (_req, res) => {
  return res.status(200).json(listCollectionSummaries());
});

router.get("/:slug", async (req, res) => {
  try {
    const collection = await getCollectionBySlug(req.params.slug);
    return res.status(200).json(collection);
  } catch (error) {
    if (error instanceof CollectionNotFoundError) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    return tmdbErrorResponse(error, res);
  }
});

export default router;
