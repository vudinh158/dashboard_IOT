import { Router } from "express";
import devicesRouter from "./devices.js";

const router = Router();

router.use("/", devicesRouter); // /ingest, /devices, /devices/:id...

export default router;
