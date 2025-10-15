import express from "express";
import morgan from "morgan";
import devicesRouter from "./routes/devices.js";
import errorHandler from "./middlewares/error.js";

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true, via: "cf" }));

app.use("/api", devicesRouter);

// đặt cuối cùng
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("API on", PORT));

export default app;
