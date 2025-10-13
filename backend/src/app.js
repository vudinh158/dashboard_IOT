import express from "express";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));

// Health check cho Target Group ALB (KHÔNG có /api)
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, path: "/health" });
});

// Health check qua CloudFront (vì CF route /api/*)
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, path: "/api/health" });
});

// Test endpoint đơn giản
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Hello from the simplest server!" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Ultimate test server listening on :${PORT}`);
});

export default app;
