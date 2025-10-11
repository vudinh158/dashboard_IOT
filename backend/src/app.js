import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/error.js";
import 'dotenv/config';

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: ORIGIN }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/", routes);

// error handler cuối cùng
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
  console.log(`CORS_ORIGIN = ${ORIGIN}`);
});

export default app;
