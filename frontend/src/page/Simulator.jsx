// frontend/src/pages/Simulator.jsx
import React, { useState, useRef } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://az5hwgyc06.execute-api.ap-southeast-1.amazonaws.com";

function makeReading(prev) {
  const t = (prev?.t ?? 28) + (Math.random() * 2 - 1);      // 27..29
  const h = (prev?.h ?? 60) + (Math.random() * 3 - 1.5);    // 58.5..61.5
  return { t: Number(t.toFixed(2)), h: Number(h.toFixed(2)) };
}

export default function Simulator() {
  const [running, setRunning] = useState(false);
  const [intervalMs, setIntervalMs] = useState(3000);
  const [devicesText, setDevicesText] = useState("esp32-1,esp32-2,esp32-3");
  const [logs, setLogs] = useState([]);
  const last = useRef({});
  const timer = useRef(null);

  function devices() {
    return devicesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function sendOnce(deviceId) {
    const r = (last.current[deviceId] = makeReading(last.current[deviceId]));
    const body = {
      deviceId,
      temperature: r.t,
      humidity: r.h,
      ts: new Date().toISOString(),
      extra: { source: "browser-sim" },
    };
    try {
      const res = await fetch(`${API_BASE}/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      setLogs((L) => [
        `${new Date().toLocaleTimeString()} ${deviceId} → ${res.status}`,
        ...L,
      ].slice(0, 200));
    } catch (e) {
      setLogs((L) => [
        `${new Date().toLocaleTimeString()} ${deviceId} → ERROR ${e.message}`,
        ...L,
      ].slice(0, 200));
    }
  }

  function start() {
    if (running) return;
    setRunning(true);
    // fire immediately
    devices().forEach(sendOnce);
    // schedule
    timer.current = setInterval(() => {
      devices().forEach(sendOnce);
    }, Number(intervalMs));
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  }

  return (
    <div>
      <h2>IoT Simulator (Browser)</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 700 }}>
        <label>
          API base:&nbsp;
          <code>{API_BASE}</code>
        </label>
        <label>
          Device IDs (comma-separated):
          <input
            style={{ width: "100%" }}
            value={devicesText}
            onChange={(e) => setDevicesText(e.target.value)}
            placeholder="esp32-1,esp32-2,esp32-3"
          />
        </label>
        <label>
          Interval (ms):
          <input
            type="number"
            value={intervalMs}
            min={500}
            step={500}
            onChange={(e) => setIntervalMs(e.target.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={start} disabled={running}>
            Start
          </button>
          <button onClick={stop} disabled={!running}>
            Stop
          </button>
          <button
            onClick={() => {
              devices().forEach(sendOnce);
            }}
          >
            Send once now
          </button>
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Logs</h3>
      <div
        style={{
          background: "#0b0b0b",
          color: "#bfb",
          padding: 8,
          borderRadius: 8,
          maxHeight: 300,
          overflow: "auto",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ opacity: 0.6 }}>No logs yet</div>
        ) : (
          logs.map((l, i) => <div key={i}>{l}</div>)
        )}
      </div>
    </div>
  );
}
