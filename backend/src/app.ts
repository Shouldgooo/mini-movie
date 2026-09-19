import express from "express";
import healthRouter from "./routes/health.routes.js";
import movieRouter from "./routes/movie.routes.js";
import authRouter from "./routes/auth.routes.js";
import favouriteRouter from "./routes/favourite.routes.js";
import reviewRouter from "./routes/review.routes.js";

const app = express();

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/movies", movieRouter);
app.use("/api/auth", authRouter);
app.use("/api/favourites", favouriteRouter);
app.use("/api/reviews", reviewRouter);

export default app;