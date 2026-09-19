import app from "./app.js";

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`MiniMovie API running on http://localhost:${PORT}`);
});