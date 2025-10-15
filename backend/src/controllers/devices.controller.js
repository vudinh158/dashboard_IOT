import * as svc from "../services/dynamo.service.js";
import HttpError from "../utils/httpError.js";

export async function getDevices(_req, res, next) {
  try {
    const data = await svc.listDevicesLatest();
    // Map ts -> lastTs cho UI
    const out = (data || []).map((it) => ({
      deviceId: it.deviceId,
      temperature: it.temperature,
      humidity: it.humidity,
      lastTs: it.ts,                 // <—
      deviceName: it.deviceName,
      status: it.status,
    }));
    res.json(out);
  } catch (err) { next(err); }
}

export async function getLatestById(req, res, next) {
  try {
    const item = await svc.getLatestReading(req.params.id);
    if (!item) return res.status(404).json({ error: "not_found" });
    // Map ts -> lastTs để UI hiển thị đúng
    res.json({ ...item, lastTs: item.ts });
  } catch (err) { next(err); }
}
