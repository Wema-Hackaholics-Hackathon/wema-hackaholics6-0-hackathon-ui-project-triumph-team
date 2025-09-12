const { computeRiskForEvent } = require('../lib/rulesEngine');

test('flags massive data exfiltration for >1GB downloads', () => {
  const employee = {
    id: 'emp-test',
    role: 'engineering',
    baseline: {
      loginStart: 8,
      loginEnd: 18,
      knownIps: [],
      knownDevices: [],
      avgDownloads: 1,
      maxApproval: 1000,
    },
  };

  const event = {
    id: 'evt-large-download',
    action: 'download',
    timestamp: new Date().toISOString(),
    details: { count: 10, bytes: 2500000000 },
  };

  const res = computeRiskForEvent(employee, event, [event]);
  expect(res.reasons).toContain('massive_data_exfiltration');
  expect(res.risk).toBeGreaterThanOrEqual(60);
});
