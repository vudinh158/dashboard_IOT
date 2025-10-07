// Node.js script to simulate IoT readings and POST to API Gateway HTTP API
// Usage: set API_BASE and run: npm start
import fetch from "node-fetch";

const API_BASE = process.env.API_BASE || "https://az5hwgyc06.execute-api.ap-southeast-1.amazonaws.com";  //sửa lại path
const DEVICES = ["esp32-1", "esp32-2", "esp32-3"];
const INTERVAL_MS = 5000;

function randomReading(prev) {
  const t = (prev?.t ?? 28) + (Math.random() * 2 - 1);
  const h = (prev?.h ?? 60) + (Math.random() * 3 - 1.5);
  return { t: Number(t.toFixed(2)), h: Number(h.toFixed(2)) };
}

const last = {};

async function sendOnce(deviceId) {
  const r = (last[deviceId] = randomReading(last[deviceId]));
  const body = {
    deviceId,
    temperature: r.t,
    humidity: r.h,
    ts: new Date().toISOString(),
    extra: { status: "OK" }
  };
  const url = `${API_BASE}/ingest`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const txt = await res.text();
    console.log(new Date().toISOString(), deviceId, res.status, txt);
  } catch (e) {
    console.error("POST failed", e.message);
  }
}

function loop() {
  DEVICES.forEach(sendOnce);
}
setInterval(loop, INTERVAL_MS);
console.log("Simulating to", API_BASE, "every", INTERVAL_MS, "ms...");
loop();
