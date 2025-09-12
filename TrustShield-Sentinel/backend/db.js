const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.TRUSTSHIELD_DB_PATH || path.join(__dirname, 'trustshield.db');

function init() {
  const exists = fs.existsSync(DB_PATH);
  const db = new Database(DB_PATH);

  if (!exists) {
    // create tables
    db.exec(`
      CREATE TABLE employees (
        id TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        meta TEXT
      );

      CREATE TABLE events (
        id TEXT PRIMARY KEY,
        employeeId TEXT,
        timestamp TEXT,
        action TEXT,
        ip TEXT,
        deviceId TEXT,
        details TEXT
      );

      CREATE TABLE alerts (
        id TEXT PRIMARY KEY,
        alertId TEXT,
        createdAt TEXT,
        employeeHash TEXT,
        employeeRole TEXT,
        riskScore INTEGER,
        riskLevel TEXT,
        reasons TEXT,
        status TEXT,
        eventRef TEXT
      );
    `);
  }

  return db;
}

module.exports = { init, DB_PATH };
