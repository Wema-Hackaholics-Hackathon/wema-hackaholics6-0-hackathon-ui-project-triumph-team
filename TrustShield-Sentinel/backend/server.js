// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const ADMIN_SECRET = process.env.ADMIN_SECRET || "wema-demo-secret";
const { v4: uuidv4 } = require("uuid");
const {
  computeRiskForEvent,
  riskLevelFromScore,
} = require("./lib/rulesEngine");
const { shortHash } = require("./lib/utils");

const DATA_DIR = path.join(__dirname, "data");
const EMP_PATH = path.join(DATA_DIR, "employees.json");
const EVT_PATH = path.join(DATA_DIR, "events.json");

let employees = JSON.parse(fs.readFileSync(EMP_PATH));
let events = JSON.parse(fs.readFileSync(EVT_PATH));
let alerts = [];
const sseClients = new Set();

const app = express();
app.use(cors());
app.use(express.json());

function requireAdminAuth(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || auth !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function buildAlerts() {
  alerts = [];
  events.forEach((evt) => {
    const emp = employees.find((e) => e.id === evt.employeeId);
    if (!emp) return;

    const empEvents = events.filter((e) => e.employeeId === emp.id);
    const { risk, reasons } = computeRiskForEvent(emp, evt, empEvents);

    if (risk >= 25) {
      const alert = {
        alertId: uuidv4(),
        createdAt: new Date().toISOString(),
        employeeHash: shortHash(emp.id),
        employeeRole: emp.role,
        riskScore: risk,
        riskLevel: riskLevelFromScore(risk),
        reasons,
        status: "pending", // pending | resolved | escalated | assist
        eventRef: evt,
      };
      alerts.push(alert);
    }
  });
  // notify SSE clients
  const payload = JSON.stringify({ alerts });
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // ignore write errors
    }
  });
}
buildAlerts();

app.get("/api/employees", (req, res) => {
  const anonymized = employees.map((e) => ({
    employeeHash: shortHash(e.id),
    role: e.role,
  }));
  res.json({ employees: anonymized });
});

// get full employee by id
app.get('/api/employees/:id', (req, res) => {
  const id = req.params.id;
  const emp = employees.find((e) => e.id === id || shortHash(e.id) === id);
  if (!emp) return res.status(404).json({ error: 'employee not found' });
  res.json({ employee: emp });
});

// get alerts
app.get("/api/alerts", (req, res) => {
  res.json({ alerts });
});

// get single alert by id
app.get('/api/alerts/:id', (req, res) => {
  const id = req.params.id;
  const alert = alerts.find((a) => a.alertId === id || a.alertId === id);
  if (!alert) return res.status(404).json({ error: 'alert not found' });
  res.json({ alert });
});

app.post("/api/alerts/:id/respond", (req, res) => {
  const id = req.params.id;
  const { response } = req.body; // 'yes' | 'no' | 'need_help'
  const alert = alerts.find((a) => a.alertId === id);
  if (!alert) return res.status(404).json({ error: "alert not found" });

  if (response === "yes") {
    alert.status = "resolved";
    alert.resolution = {
      by: "employee",
      at: new Date().toISOString(),
      note: "confirmed",
    };
    return res.json({ alert });
  }
  if (response === "no") {
    alert.status = "escalated";
    alert.resolution = {
      by: "employee",
      at: new Date().toISOString(),
      note: "denied",
    };
    return res.json({ alert });
  }
  if (response === "need_help") {
    alert.status = "assist";
    alert.resolution = {
      by: "employee",
      at: new Date().toISOString(),
      note: "requested_help",
    };
    return res.json({ alert });
  }
  return res.status(400).json({ error: "invalid response" });
});

app.post("/api/alerts/:id/unmask", (req, res) => {
  const id = req.params.id;
  const alert = alerts.find((a) => a.alertId === id);
  if (!alert) return res.status(404).json({ error: "alert not found" });

  const emp = employees.find((e) => e.id === alert.eventRef.employeeId);
  alert.unmasked = { id: emp.id, name: emp.name };
  res.json({ alert });
});

// fetch dashboard aggregate
app.get("/api/dashboard", (req, res) => {
  const total = alerts.length;
  const counts = alerts.reduce((acc, a) => {
    acc[a.riskLevel] = (acc[a.riskLevel] || 0) + 1;
    return acc;
  }, {});
  res.json({
    totalAlerts: total,
    counts,
    lastUpdated: new Date().toISOString(),
  });
});

// add a new event (simulate)
app.post("/api/events", (req, res) => {
  const evt = req.body;
  evt.id = evt.id || `evt-${uuidv4()}`;
  events.push(evt);
  // recompute alerts
  buildAlerts();
  res.json({ ok: true, evt });
});

// static mock data endpoints for debugging
app.get("/api/events", (req, res) => res.json({ events }));

// SSE stream for alerts
app.get('/api/stream/alerts', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders && res.flushHeaders();

  // send current alerts once
  res.write(`data: ${JSON.stringify({ alerts })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

const logger = require('./logger');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`TrustShield API running on http://localhost:${PORT}`));
