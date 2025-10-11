const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * Helper function để "mở gói" response từ API Gateway.
 * Nhiều Lambda function trả về dạng { statusCode, body: "json-string" }.
 * Hàm này sẽ lấy và parse nội dung trong `body` nếu có.
 * @param {object} data - Dữ liệu JSON đã parse từ fetch.
 * @returns {object|Array} - Dữ liệu bên trong đã được "mở gói".
 */
function unwrapApiResponse(data) {
  if (data?.body) {
    try {
      return typeof data.body === "string" ? JSON.parse(data.body) : data.body;
    } catch {
      // Bỏ qua nếu parse lỗi, trả về data gốc
    }
  }
  return data;
}

/**
 * Helper function để đảm bảo kết quả luôn là một mảng.
 * Xử lý được cả kết quả thô từ DynamoDB (`{ Items: [...] }`).
 * @param {any} data - Dữ liệu đã được "mở gói".
 * @returns {Array} - Luôn trả về một mảng.
 */
function coerceArray(data) {
  if (Array.isArray(data)) return data;
  if (data?.Items && Array.isArray(data.Items)) return data.Items;
  return [];
}


export async function fetchDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  const rawJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(rawJson?.message || res.statusText || "Failed");
  }

  const unwrappedData = unwrapApiResponse(rawJson);
  return coerceArray(unwrappedData);
}

/**
 * Fetch thông số mới nhất của một thiết bị.
 * @param {string} id - ID của thiết bị.
 */
export async function fetchLatest(id) {
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(id)}/latest`);
  const rawJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(rawJson?.message || res.statusText);
  }

  return unwrapApiResponse(rawJson);
}

/**
 * Fetch lịch sử thông số của một thiết bị.
 * @param {string} id - ID của thiết bị.
 * @param {number} limit - Số lượng bản ghi cần lấy.
 */
export async function fetchReadings(id, limit = 20) {
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(id)}/readings?limit=${limit}`);
  const rawJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(rawJson?.message || res.statusText);
  }

  const unwrappedData = unwrapApiResponse(rawJson);
  // Đảm bảo luôn trả về một mảng
  return Array.isArray(unwrappedData) ? unwrappedData : [];
}