import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDevices } from "../api.js";

export default function Devices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const items = await fetchDevices();
      setData(items);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (loading && data.length === 0) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Devices</h2>
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
