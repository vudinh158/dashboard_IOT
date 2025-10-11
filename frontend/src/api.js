const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function coerceArray(data) {
  // data là JSON đã parse từ fetch
  if (Array.isArray(data)) return data;                     // OK: mảng
  if (data?.Items && Array.isArray(data.Items)) return data.Items; // kiểu DynamoDB raw

  // Một số cấu hình API Gateway/Lambda trả { statusCode, body: "json-string" }
  if (data?.body) {
    try {
      const inner = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
      if (Array.isArray(inner)) return inner;
      if (inner?.Items && Array.isArray(inner.Items)) return inner.Items;
    } catch (_) { /* ignore */ }
  }
  return []; // fallback
}

export async function fetchDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || res.statusText || "Failed");
  }
  return coerceArray(json);
}

export async function fetchLatest(id) {
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(id)}/latest`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || res.statusText);
  // unwrap giống trên:
  if (json?.body) { try { return JSON.parse(json.body); } catch {} }
  return json;
}

export async function fetchReadings(id, limit=20) {
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(id)}/readings?limit=${limit}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || res.statusText);
  if (Array.isArray(json)) return json;
  if (json?.body) { try { const inner = JSON.parse(json.body); if (Array.isArray(inner)) return inner; } catch {} }
  return [];
}
