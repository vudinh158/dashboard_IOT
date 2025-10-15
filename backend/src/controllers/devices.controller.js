import * as svc from "../services/dynamo.service.js";

export async function getDevices(_req, res, next) {
  try {
    const items = await svc.listDevicesLatest(); // đọc from DynamoDB
    const out = (items || []).map(it => ({
      deviceId: it.deviceId,
      deviceName: it.deviceName,
      temperature: it.temperature,
      humidity: it.humidity,
      lastTs: it.ts, // FE đang cần lastTs
      status: it.status
    }));
    res.json(out);
  } catch (err) {
    next(err);
  }
}

export async function getLatestById(req, res, next) {
  try {
    const item = await svc.getLatestReading(req.params.id);
    if (!item) return res.status(404).json({ error: "not_found" });
    res.json({ ...item, lastTs: item.ts });
  } catch (err) {
    next(err);
  }
}

export async function getReadingsById(req, res, next) {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    const items = await svc.listReadings(id, limit ? Number(limit) : undefined);
    res.json(items || []);
  } catch (err) {
    next(err);
  }
}

export async function ingest(req, res, next) {
  try {
    await svc.ingest(req.body);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
