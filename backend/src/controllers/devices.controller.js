// controllers/devices.controller.js
let devicesCache = { data: null, ts: 0 };
const DEVICES_TTL_MS = 20_000;

export async function getDevices(_req, res, next) {
  try {
    const now = Date.now();
    if (devicesCache.data && now - devicesCache.ts < DEVICES_TTL_MS) {
      return res.json(devicesCache.data);
    }
    const items = await svc.scanDevicesProjection(); // quét nhẹ (ProjectionExpression)
    const latest = Object.values((items||[]).reduce((acc, it) => {
      const cur = acc[it.deviceId];
      if (!cur || new Date(it.ts) > new Date(cur.ts)) acc[it.deviceId] = it;
      return acc;
    }, {})).sort((a,b)=> String(a.deviceId).localeCompare(String(b.deviceId)))
      .map(it => ({ deviceId: it.deviceId, deviceName: it.deviceName,
                    temperature: it.temperature, humidity: it.humidity,
                    lastTs: it.ts, status: it.status }));
    devicesCache = { data: latest, ts: now };
    res.json(latest);
  } catch (e) { next(e); }
}
