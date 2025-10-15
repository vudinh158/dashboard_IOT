import express from "express";
import morgan from "morgan";
import devicesRouter from "./routes/devices.js";
import errorHandler from "./middlewares/error.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

// Health cho Target Group (ALB)
app.get("/health", (_req, res) => res.status(200).json({ ok: true, path: "/health" }));

// Health qua CloudFront (để test)
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true, path: "/api/health" }));

// Mount toàn bộ API thật dưới prefix /api
app.use("/api", devicesRouter);

// Error handler đặt cuối
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});

export default app;
