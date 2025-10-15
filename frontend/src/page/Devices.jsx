import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDevices } from "../api.js";

const POLL_MS = 20_000; // 20s: khớp cache BE; đừng để < TTL

export default function Devices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // các cờ để chống chồng request
  const inFlightRef = useRef(false);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const hiddenRef = useRef(document.visibilityState === "hidden");

  async function loadOnce() {
    if (inFlightRef.current || hiddenRef.current) return; // đã có request đang chạy hoặc tab ẩn
    inFlightRef.current = true;

    // hủy request cũ (nếu có) trước khi tạo cái mới
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setError(prev => (data.length ? prev : "")); // giữ dữ liệu cũ, chỉ xóa lỗi nếu đang trống
      if (!data.length) setLoading(true);

      const items = await fetchDevices({ signal: controller.signal }); // truyền signal để hủy được
      setData(Array.isArray(items) ? items : []);
      setLastUpdated(new Date());
      setError("");
    } catch (e) {
      // nếu là abort thì bỏ qua
      if (e?.name !== "AbortError") {
        setError(String(e.message || e));
      }
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }

  // setup polling an toàn
  useEffect(() => {
    // lần đầu tải
    loadOnce();

    // poll định kỳ
    timerRef.current = setInterval(loadOnce, POLL_MS);

    // tạm dừng/tiếp tục khi tab ẩn/hiện
    const onVis = () => {
      hiddenRef.current = document.visibilityState === "hidden";
      if (hiddenRef.current) {
        try { abortRef.current?.abort(); } catch {}
      } else {
        // tab vừa hiện lại -> tải ngay
        loadOnce();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(timerRef.current);
      try { abortRef.current?.abort(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && data.length === 0) return <p>Loading...</p>;
  if (error && data.length === 0) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Devices</h2>
      <div style={{ fontSize: 12, color: "#666", margin: "6px 0 12px" }}>
        {error ? <span style={{ color: "red" }}>Error: {error}</span> : null}
        {lastUpdated ? (
          <span>Last updated: {lastUpdated.toISOString()}</span>
        ) : null}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Device ID</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Temp (°C)</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Humidity (%)</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Last Update</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(data) ? data : []).map((d) => (
            <tr key={d.deviceId}>
              <td>{d.deviceId}</td>
              <td style={{ textAlign: "right" }}>{d.temperature ?? "-"}</td>
              <td style={{ textAlign: "right" }}>{d.humidity ?? "-"}</td>
              <td>{d.lastTs}</td>
              <td><Link to={`/device/${encodeURIComponent(d.deviceId)}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
