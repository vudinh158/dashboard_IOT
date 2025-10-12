import express from "express";
import morgan from "morgan";
import devicesRouter from "./src/routes/devices.js"; // Điều chỉnh đường dẫn nếu cần

const app = express();

// Chỉ giữ lại morgan để chúng ta có thể thấy log
app.use(morgan("dev"));

// Endpoint Health Check cho Load Balancer
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Endpoint kiểm tra API đơn giản nhất có thể
app.get("/api/test", (req, res) => {
  console.log("Request received at /api/test endpoint.");
  res.status(200).json({ message: "Hello from the simplest server!" });
});

// Mount router từ devices.js tại base path /api
app.use("/api", devicesRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Ultimate test server listening on :${PORT}`);
});

export default app;
