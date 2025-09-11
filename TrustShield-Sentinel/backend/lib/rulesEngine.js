const dayjs = require("dayjs");

function computeRiskForEvent(employee, event, eventsForEmployee = []) {
  let risk = 0;
  const reasons = [];

  // Rule 1: login outside baseline hours
  if (event.action === "login") {
    const hr = dayjs(event.timestamp).hour();
    if (hr < employee.baseline.loginStart || hr > employee.baseline.loginEnd) {
      risk += 30;
      reasons.push("login_outside_hours");
    }

    // Rule 2: new IP/device
    const ipKnown = employee.baseline.knownIps.includes(event.ip);
    const deviceKnown = employee.baseline.knownDevices.includes(event.deviceId);
    if (!ipKnown || !deviceKnown) {
      risk += 25;
      reasons.push("new_ip_or_device");
    }
  }

  // Rule 3: bulk download
  if (event.action === "download") {
    const cnt = event.details && event.details.count ? event.details.count : 0;
    if (cnt > employee.baseline.avgDownloads * 3) {
      risk += 40;
      reasons.push("bulk_download");
    }
  }

  // Rule 4: large transaction approval
  if (event.action === "approve_transaction") {
    const amount =
      event.details && event.details.amount ? event.details.amount : 0;
    if (amount > employee.baseline.maxApproval) {
      risk += 30;
      reasons.push("large_transaction");
    }
  }

  // Rule 5: multiple anomalies within short time
  const recent = eventsForEmployee.filter((e) => {
    const diff = Math.abs(
      dayjs(event.timestamp).diff(dayjs(e.timestamp), "minute")
    );
    return diff <= 60 && e.id !== event.id;
  });
  if (recent.length >= 2) {
    risk += 10;
    reasons.push("multiple_recent_events");
  }

  if (risk > 100) risk = 100;

  return { risk, reasons };
}

function riskLevelFromScore(score) {
  if (score >= 70) return "high";
  if (score >= 35) return "medium";
  return "low";
}

module.exports = {
  computeRiskForEvent,
  riskLevelFromScore,
};
