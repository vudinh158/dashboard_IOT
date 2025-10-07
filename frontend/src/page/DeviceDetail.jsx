import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchLatest, fetchReadings } from "../api.js";

export default function DeviceDetail() {
  const { id } = useParams();
  const [latest, setLatest] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const [l, r] = await Promise.all([fetchLatest(id), fetchReadings(id, 50)]);
      setLatest(l);
      setRows(r);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [id]);

  return (
    <div>
      <p><Link to="/">&larr; Back</Link></p>
      <h2>Device: {id}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {latest ? (
        <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <div><b>Latest:</b> {latest.lastTs}</div>
          <div>Temperature: {latest.temperature} °C</div>
          <div>Humidity: {latest.humidity} %</div>
        </div>
      ) : <p>Loading latest...</p>}

      <h3>Recent Readings</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Timestamp</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Temp (°C)</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Humidity (%)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ts}>
              <td>{r.ts}</td>
              <td style={{ textAlign: "right" }}>{r.temperature}</td>
              <td style={{ textAlign: "right" }}>{r.humidity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
