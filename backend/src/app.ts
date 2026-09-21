import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import healthRouter from "./routes/health.routes.js";
import movieRouter from "./routes/movie.routes.js";
import collectionRouter from "./routes/collection.routes.js";
import authRouter from "./routes/auth.routes.js";
import favouriteRouter from "./routes/favourite.routes.js";
import reviewRouter from "./routes/review.routes.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "32kb" }));

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  cors({
    origin: corsOrigins,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
  },
  skip: () => process.env.NODE_ENV === "test",
});

app.use("/api/health", healthRouter);
app.use("/api/movies", movieRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/favourites", favouriteRouter);
app.use("/api/reviews", reviewRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
);

export default app;
