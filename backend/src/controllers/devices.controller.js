import * as svc from "../services/dynamo.service.js";
import HttpError from "../utils/httpError.js";

export async function ingest(req, res, next) {
  try {
    const { deviceId, temperature, humidity } = req.body;
    if (!deviceId) throw new HttpError(400, "deviceId is required");
    const now = Date.now();
    await svc.putReading({
      deviceId,
      ts: new Date(now).toISOString(),
      temperature,
      humidity,
      updatedAt: new Date(now).toISOString(),
      status: "ok",
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// export async function getDevices(req, res, next) {
//   try {
//     const data = await svc.listDevicesLatest();
//     res.json(data);
//   } catch (err) {
//     next(err);
//   }
// }

export async function getDevices(req, res, next) {
  try {
    // BỎ QUA HOÀN TOÀN KẾT NỐI DATABASE
    // Trả về một mẩu dữ liệu giả ngay lập tức để kiểm tra
    const fakeData = [
      { deviceId: "test-device-1", deviceName: "Fake Device Alpha" },
      { deviceId: "test-device-2", deviceName: "Fake Device Beta" },
    ];

    // Gửi phản hồi ngay lập tức
    res.status(200).json(fakeData);

  } catch (err) {
    next(err);
  }
}

export async function getLatestById(req, res, next) {
  try {
    const id = req.params.id;
    const item = await svc.getLatestReading(id);
    if (!item) return res.status(404).json({ error: "not_found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function getReadingsById(req, res, next) {
  try {
    const id = req.params.id;
    const limit = Number(req.query.limit || 50);
    const data = await svc.getReadings(id, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
