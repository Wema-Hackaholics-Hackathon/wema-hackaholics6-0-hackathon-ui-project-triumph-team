const fs = require("fs");
const path = require("path");

const employees = require("../data/employees.json");
const events = require("../data/events.json");

fs.writeFileSync(
  path.join(__dirname, "../data/employees.json"),
  JSON.stringify(employees, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, "../data/events.json"),
  JSON.stringify(events, null, 2)
);
console.log("Seeded data in /data/");
