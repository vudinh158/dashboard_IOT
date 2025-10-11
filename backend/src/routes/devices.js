import { Router } from "express";
import * as ctrl from "../controllers/devices.controller.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";

const router = Router();

// POST /ingest
router.post(
  "/ingest",
  validateBody({
    deviceId: "string",
    temperature: "number?",
    humidity: "number?",
  }),
  ctrl.ingest
);

// GET /devices (danh sách + last reading mỗi thiết bị)
router.get("/devices", ctrl.getDevices);

// GET /devices/:id/latest
router.get("/devices/:id/latest", ctrl.getLatestById);

// GET /devices/:id/readings?limit=N
router.get(
  "/devices/:id/readings",
  validateQuery({ limit: "number?" }),
  ctrl.getReadingsById
);

export default router;
