import express from "express";
import healthRouter from "./routes/health.routes.js";
import movieRouter from "./routes/movie.routes.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/movies", movieRouter);
app.use("/api/auth", authRouter);

export default app;