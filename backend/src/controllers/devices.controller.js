import * as svc from "../services/dynamo.service.js";

/**
 * GET /api/devices
 * Trả về: MỖI deviceId đúng 1 record mới nhất (map sang lastTs cho FE)
 */
export async function getDevices(_req, res, next) {
  try {
    const items = await svc.scanDevicesProjection(); // quét nhẹ các field cần
    // Chọn bản ghi mới nhất theo ts cho mỗi deviceId
    const latest = Object.values(
      (items || []).reduce((acc, it) => {
        const cur = acc[it.deviceId];
        if (!cur || new Date(it.ts) > new Date(cur.ts)) acc[it.deviceId] = it;
        return acc;
      }, {})
    )
      .sort((a, b) => String(a.deviceId).localeCompare(String(b.deviceId)))
      .map((it) => ({
        deviceId: it.deviceId,
        deviceName: it.deviceName,
        temperature: it.temperature,
        humidity: it.humidity,
        lastTs: it.ts, // FE đang đọc lastTs
        status: it.status,
      }));

    res.json(latest);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/devices/:id/latest
 */
export async function getLatestById(req, res, next) {
  try {
    const item = await svc.getLatestReading(req.params.id);
    if (!item) return res.status(404).json({ error: "not_found" });
    res.json({ ...item, lastTs: item.ts });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/devices/:id/readings?limit=50
 */
export async function getReadingsById(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const items = await svc.listReadings(req.params.id, limit);
    res.json(items || []);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ingest  (Simulator)
 * Body: { deviceId, temperature?, humidity?, ts? }
 */
export async function ingest(req, res, next) {
  try {
    await svc.ingest(req.body);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
