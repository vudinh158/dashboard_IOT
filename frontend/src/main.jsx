import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Devices from "./page/Devices.jsx";
import DeviceDetail from "./page/DeviceDetail.jsx";
import Simulator from "./page/Simulator.jsx";

function Layout({ children }) {
  return (
    <div style={{ fontFamily: "system-ui, Arial", padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>IoT Sensor Dashboard</h1>
        <nav>
          <Link to="/" style={{ marginRight: 12 }}>Devices</Link>
          <Link to="/simulator">Simulator</Link>
        </nav>
      </header>
      <hr />
      <main>{children}</main>
      <footer style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        Demo dashboard (DynamoDB + API Gateway + Lambda)
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Devices /></Layout>} />
        <Route path="/device/:id" element={<Layout><DeviceDetail /></Layout>} />
        <Route path="/simulator" element={<Layout><Simulator /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
