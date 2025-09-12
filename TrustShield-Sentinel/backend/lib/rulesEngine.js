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
    // existing bulk download rule (count-based)
    if (cnt > employee.baseline.avgDownloads * 3) {
      risk += 40;
      reasons.push("bulk_download");
    }

    // New Rule: Massive data exfiltration by size (e.g., > 1GB)
    const bytes = event.details && event.details.bytes ? event.details.bytes : 0;
    // treat > 1_000_000_000 bytes (1GB) as high risk
    if (bytes > 1000000000) {
      risk += 60;
      reasons.push("massive_data_exfiltration");
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

  // New Rule: suspicious document capture (screenshots, camera capture events)
  // Many systems log "screenshot" actions or files created with screenshot metadata.
  if (event.action === "screenshot" || event.action === "screen_capture") {
    // multiple screenshots in short period is more suspicious
    const snaps = eventsForEmployee.filter((e) => e.action === "screenshot");
    if (snaps.length >= 3) {
      risk += 45;
      reasons.push("suspicious_document_capture");
    } else {
      risk += 20;
      reasons.push("screenshot_taken");
    }
  }

  // New Rule: unusual access patterns — accessing resources outside role scope
  // event.details.resourceType could be something like 'engineering_design', 'payroll', etc.
  if (event.action === "access_resource") {
    const resourceType = event.details && event.details.resourceType;
    if (resourceType) {
      // simple heuristic: if resourceType is not common for this role, mark higher risk
      const role = (employee.role || "").toLowerCase();
      const roleToCommon = {
        hr: ["employee_records", "payroll"],
        finance: ["payroll", "invoices", "payments"],
        engineering: ["engineering_design", "code_repo", "build_artifacts"],
        auditor: ["audit_logs", "financials"],
        teller: ["customer_transactions"],
      };
      const commons = roleToCommon[role] || [];
      if (!commons.includes(resourceType)) {
        risk += 35;
        reasons.push("unusual_access_pattern");
      }
    }
  }

  // New High-Risk Rule: multiple failed logins followed by new device/IP (credential dump / brute force)
  if (event.action === 'login_failed' || event.action === 'login') {
    const failures = eventsForEmployee.filter((e) => e.action === 'login_failed' && Math.abs(dayjs(event.timestamp).diff(dayjs(e.timestamp), 'minute')) <= 30);
    if (failures.length >= 5 && (!employee.baseline.knownIps.includes(event.ip) || !employee.baseline.knownDevices.includes(event.deviceId))) {
      risk += 55;
      reasons.push('credential_dumping_suspected');
    }
  }

  // New High-Risk Rule: upload to external endpoint or staging (data staging)
  if (event.action === 'upload') {
    const dest = event.details && event.details.destination ? event.details.destination : '';
    // treat external domains as high risk
    if (typeof dest === 'string' && dest.match(/https?:\/\/(?!internal\.)/)) {
      risk += 60;
      reasons.push('data_staging_to_external');
    }
    const bytesUp = event.details && event.details.bytes ? event.details.bytes : 0;
    if (bytesUp > 500000000) { // >500MB upload flagged
      risk += 45;
      reasons.push('large_data_upload');
    }
  }

  // New High-Risk Rule: privileged role change or unexpected permission grants
  if (event.action === 'grant_privilege' || event.action === 'privilege_change') {
    const roleBefore = event.details && event.details.before;
    const roleAfter = event.details && event.details.after;
    if (roleAfter && roleAfter.toLowerCase().includes('admin')) {
      risk += 50;
      reasons.push('privilege_escalation_detected');
    }
  }

  // New High-Risk Rule: suspicious process executed (e.g., data exfil tool, archiving + transfer)
  if (event.action === 'process_spawn') {
    const proc = (event.details && event.details.process) || '';
    const suspiciousProcs = ['rsync', 'scp', 'curl', 'wget', 'powershell', 'nc', 'ncat'];
    if (suspiciousProcs.some((p) => proc.toLowerCase().includes(p))) {
      risk += 45;
      reasons.push('suspicious_process_execution');
    }
  }

  // New High-Risk Rule: mass email with attachments to external recipients
  if (event.action === 'email_send') {
    const recipients = event.details && event.details.recipients ? event.details.recipients : [];
    const attachments = event.details && event.details.attachments ? event.details.attachments : 0;
    const external = recipients.filter((r) => !r.endsWith('@company.internal'));
    if (attachments >= 3 && external.length >= 5) {
      risk += 50;
      reasons.push('mass_external_email_with_attachments');
    }
  }

  // Medium-Risk: abnormal gateway/NAT access
  if (event.action === 'gateway_access') {
    const gateway = event.details && event.details.gateway;
    if (gateway && gateway !== employee.baseline.usualGateway) {
      risk += 25;
      reasons.push('abnormal_gateway_access');
    }
  }

  // Medium-Risk: sudden API call spikes
  if (event.action === 'api_call') {
    const cnt = event.details && event.details.count ? event.details.count : 0;
    if (cnt > 1000) {
      risk += 30;
      reasons.push('api_spike_unusual');
    }
  }

  // Medium-Risk: suspicious data tagging or label removal
  if (event.action === 'data_label_change') {
    const change = event.details && event.details.change;
    if (change && change === 'remove_sensitive_tag') {
      risk += 25;
      reasons.push('sensitive_tag_removed');
    }
  }

  // Additional High-Risk Rules (5)
  // 1) Large copy to removable media
  if (event.action === 'usb_copy') {
    const bytes = event.details && event.details.bytes ? event.details.bytes : 0;
    if (bytes > 200000000) { // >200MB copied to USB
      risk += 50;
      reasons.push('usb_large_copy');
    }
  }

  // 2) Token/credential export detected
  if (event.action === 'export_tokens' || (event.details && event.details.tokensExported)) {
    risk += 60;
    reasons.push('token_export_detected');
  }

  // 3) Anonymizing tunnel / Tor or suspicious VPN endpoint
  if (event.action === 'vpn_connect') {
    const provider = event.details && event.details.provider ? event.details.provider.toLowerCase() : '';
    const dest = event.details && event.details.destination ? event.details.destination.toLowerCase() : '';
    if (provider.includes('tor') || dest.includes('tor') || provider.includes('anonymous')) {
      risk += 55;
      reasons.push('anonymizing_tunnel_detected');
    }
  }

  // 4) Archive created then quickly uploaded externally (pack+ship tactic)
  if (event.action === 'upload') {
    const archiveNearby = eventsForEmployee.some((e) => {
      if (e.action !== 'archive_create') return false;
      const diff = Math.abs(dayjs(event.timestamp).diff(dayjs(e.timestamp), 'minute'));
      return diff <= 10; // archive within 10 minutes
    });
    const dest = event.details && event.details.destination ? event.details.destination : '';
    if (archiveNearby && typeof dest === 'string' && dest.match(/https?:\/\/(?!internal\.)/)) {
      risk += 50;
      reasons.push('archive_then_upload');
    }
  }

  // 5) Audit/log tampering or deletion
  if (event.action === 'log_delete' || event.action === 'clear_audit_logs') {
    risk += 65;
    reasons.push('log_wipe_detected');
  }

  // Additional Medium-Risk Rules (3)
  // 1) Geo-location mismatch on login
  if (event.action === 'login' && event.geo && employee.baseline && employee.baseline.country) {
    const c1 = (event.geo.country || '').toLowerCase();
    const c2 = (employee.baseline.country || '').toLowerCase();
    if (c1 && c2 && c1 !== c2) {
      risk += 20;
      reasons.push('geo_mismatch');
    }
  }

  // 2) File write spike
  if (event.action === 'file_write') {
    const cnt = event.details && event.details.count ? event.details.count : 0;
    const avg = employee.baseline && employee.baseline.avgWrites ? employee.baseline.avgWrites : 0;
    if (avg > 0 ? cnt > avg * 4 : cnt > 1000) {
      risk += 25;
      reasons.push('file_write_spike');
    }
  }

  // 3) Access denied spikes (many access_denied events in short time)
  if (event.action === 'access_denied') {
    const denials = eventsForEmployee.filter((e) => e.action === 'access_denied' && Math.abs(dayjs(event.timestamp).diff(dayjs(e.timestamp), 'minute')) <= 15);
    if (denials.length >= 4) {
      risk += 30;
      reasons.push('access_denied_spike');
    }
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
