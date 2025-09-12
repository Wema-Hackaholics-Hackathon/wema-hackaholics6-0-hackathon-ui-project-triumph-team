const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { init } = require('../db');
const { computeRiskForEvent } = require('../lib/rulesEngine');

const EVENTS_JSON = path.join(__dirname, '..', 'data', 'events.json');
const EMPLOYEES_JSON = path.join(__dirname, '..', 'data', 'employees.json');

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    return [];
  }
}

function runOnce() {
  const db = init();
  const events = loadJson(EVENTS_JSON);
  const employees = loadJson(EMPLOYEES_JSON);

  const getEmployee = (id) => employees.find((e) => e.id === id) || null;

  const insert = db.prepare(
    `INSERT OR IGNORE INTO alerts (id, alertId, createdAt, employeeHash, employeeRole, riskScore, riskLevel, reasons, status, eventRef) VALUES (@id,@alertId,@createdAt,@employeeHash,@employeeRole,@riskScore,@riskLevel,@reasons,@status,@eventRef)`
  );

  for (const evt of events) {
    const emp = getEmployee(evt.employeeId);
    const scoreObj = computeRiskForEvent(emp || {}, evt, events.filter((e) => e.employeeId === evt.employeeId));
    if (scoreObj.riskScore >= 25) {
      const alertId = uuidv4();
      const row = {
        id: alertId,
        alertId: alertId,
        createdAt: new Date().toISOString(),
        employeeHash: evt.employeeId,
        employeeRole: emp?.role || 'unknown',
        riskScore: scoreObj.riskScore,
        riskLevel: scoreObj.riskLevel || 'high',
        reasons: JSON.stringify(scoreObj.reasons || []),
        status: 'pending',
        eventRef: JSON.stringify(evt),
      };
      try {
        insert.run(row);
      } catch (err) {
        console.error('Failed to insert alert:', err);
      }
    }
  }
}

if (require.main === module) {
  // run periodically if invoked directly
  const interval = process.env.RULES_INTERVAL_MS ? parseInt(process.env.RULES_INTERVAL_MS, 10) : 30_000;
  console.log('Starting rules worker, running once then every', interval, 'ms');
  runOnce();
  setInterval(runOnce, interval);
}

module.exports = { runOnce };
