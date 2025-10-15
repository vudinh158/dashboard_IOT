// api.js
const RAW_BASE = import.meta.env.VITE_API_BASE || "/api";

// Chuẩn hóa base: luôn bắt đầu bằng "/", không kết thúc "/"
function normalizeBase(b) {
  if (!b) return "/api";
  let x = b.trim();
  if (!x.startsWith("/")) x = "/" + x;
  if (x.endsWith("/")) x = x.slice(0, -1);
  return x;
}
const API_BASE = normalizeBase(RAW_BASE);

// Ghép URL an toàn
function joinUrl(path) {
  const p = String(path || "");
  return `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`;
}

// Fetch helper với AbortSignal + timeout client
async function httpGet(path, { signal, timeoutMs = 15000 } = {}) {
  const url = joinUrl(path);

  // timeout client
  const t = setTimeout(() => {
    try { controller.abort(); } catch {}
  }, timeoutMs);

  // nếu caller đã truyền signal, gắn “nối” vào controller mới
  const controller = new AbortController();
  if (signal) {
    signal.addEventListener("abort", () => {
      try { controller.abort(); } catch {}
    });
  }

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store", // tránh cache trình duyệt
    });

    // cố gắng parse JSON an toàn
    let data = null;
    try { data = await res.clone().json(); } catch { data = null; }

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`;
      throw new Error(`GET ${url} ${msg}`);
    }
    return data;
  } finally {
    clearTimeout(t);
  }
}

// Chuẩn hóa nhiều kiểu response (lambda proxy, api gateway, v.v.)
function coerceArray(data) {
  if (Array.isArray(data)) return data;
  if (data?.Items && Array.isArray(data.Items)) return data.Items;
  if (data?.body) {
    try {
      const inner = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      if (Array.isArray(inner)) return inner;
      if (inner?.Items && Array.isArray(inner.Items)) return inner.Items;
    } catch {}
  }
  return [];
}

export async function fetchDevices(opts) {
  const json = await httpGet("devices", opts); // -> /api/devices
  return coerceArray(json);
}

export async function fetchLatest(id, opts) {
  const json = await httpGet(`devices/${encodeURIComponent(id)}/latest`, opts);
  if (json?.body) { try { return JSON.parse(json.body); } catch {} }
  return json;
}

export async function fetchReadings(id, limit = 20, opts) {
  const json = await httpGet(`devices/${encodeURIComponent(id)}/readings?limit=${limit}`, opts);
  if (Array.isArray(json)) return json;
  if (json?.body) { try { const inner = JSON.parse(json.body); if (Array.isArray(inner)) return inner; } catch {} }
  return [];
}
