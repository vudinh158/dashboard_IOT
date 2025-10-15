import { Router } from "express";
import {
  getDevices,
  getLatestById,
  getReadingsById,
  ingest,
} from "../controllers/devices.controller.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";

const router = Router();

// Nhận dữ liệu từ thiết bị / simulator
router.post(
  "/ingest",
  validateBody({
    deviceId: "string",
    temperature: "number?",
    humidity: "number?",
    ts: "string?",
  }),
  ingest
);

// Danh sách thiết bị (mỗi device 1 bản mới nhất)
router.get("/devices", getDevices);

// Bản ghi mới nhất theo deviceId
router.get("/devices/:id/latest", getLatestById);

// Lịch sử readings theo deviceId
router.get(
  "/devices/:id/readings",
  validateQuery({ limit: "number?" }),
  getReadingsById
);

export default router;
