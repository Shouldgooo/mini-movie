import app from "./app.js";

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MiniMovie API running on http://localhost:${PORT}`);
});
