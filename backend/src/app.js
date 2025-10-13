// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import routes from "./routes/index.js";
// import errorHandler from "./middlewares/error.js";
// import 'dotenv/config';

// const app = express();


// const FRONTEND_URL = "https://dl1ia0lsfuabj.cloudfront.net";

// const LOCAL_DEV_URL = process.env.CORS_ORIGIN || "http://localhost:5173";

// const corsOptions = {
//   origin: [LOCAL_DEV_URL, FRONTEND_URL]
// };

// app.use(express.json());
// // app.use(helmet());
// // app.use(cors(corsOptions));
// app.use(morgan("dev"));

// app.get("/health", (req, res) => res.json({ ok: true }));


// app.use("/api", routes);

// app.use(errorHandler);

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`API listening on :${PORT}`);
//   console.log(`Allowed origins: ${corsOptions.origin.join(', ')}`);
// });

// export default app;
import express from "express";
import morgan from "morgan";

const app = express();

// Chỉ giữ lại morgan để chúng ta có thể thấy log
app.use(morgan("dev"));

// Endpoint Health Check cho Load Balancer
app.get("/health", (req, res) => {
  // Gửi phản hồi ngay lập tức
  res.status(200).json({ status: "ok" });
});

// Endpoint kiểm tra API đơn giản nhất có thể
app.get("/api/test", (req, res) => {
  console.log("Request received at /api/test endpoint.");
  // Gửi phản hồi ngay lập tức
  res.status(200).json({ message: "Hello from the simplest server!" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Ultimate test server listening on :${PORT}`);
});

export default app;
