import React, { useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { respondToAlert, unmaskAlert } from '../../utils/api';

const reasonMap = {
  massive_data_exfiltration: 'Massive data transfer detected (>1GB)',
  suspicious_document_capture: 'Multiple screenshots of sensitive documents',
  screenshot_taken: 'Screenshot captured',
  unusual_access_pattern: 'Access to resources outside normal role scope',
  bulk_download: 'High-volume file downloads',
  new_ip_or_device: 'Login from new IP or device',
  login_outside_hours: 'Login outside normal hours',
  large_transaction: 'Large transaction approval',
  multiple_recent_events: 'Multiple anomalies in short time',
};

const Investigation = () => {
  const { id } = useParams();
  const location = useLocation();
  const payload = location.state?.raw || location.state?.user || {};
  const [status, setStatus] = useState(payload?.status || 'pending');
  const [unmasked, setUnmasked] = useState(payload?.unmasked || null);
  const [loading, setLoading] = useState(false);

  const event = payload?.eventRef || payload;
  const alertId = payload?.alertId || payload?.id || id;

  const formatTs = (ts) => {
    const t = ts || event?.timestamp || payload?.createdAt;
    if (!t) return 'Unknown';
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString();
  };

  const handleResolve = async () => {
    if (!alertId) return;
    setLoading(true);
    try {
      await respondToAlert(alertId, 'yes');
      setStatus('resolved');
    } catch (err) {
      console.error('Resolve failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!alertId) return;
    setLoading(true);
    try {
      await respondToAlert(alertId, 'no');
      setStatus('escalated');
    } catch (err) {
      console.error('Escalate failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnmask = async () => {
    if (!alertId) return;
    setLoading(true);
    try {
      const res = await unmaskAlert(alertId);
      if (res?.alert?.unmasked) setUnmasked(res.alert.unmasked);
    } catch (err) {
      console.error('Unmask failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link to="/insider-threat-analytics-dashboard" className="text-muted-foreground hover:underline">
              <Icon name="ArrowLeft" size={18} />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Investigation: {alertId}</h1>
            <span className="text-sm text-muted-foreground">Status: {status}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={handleEscalate} disabled={loading}>
              Escalate
            </Button>
            <Button variant="success" onClick={handleResolve} disabled={loading}>
              Resolve
            </Button>
            <Button variant="outline" onClick={handleUnmask} disabled={loading || unmasked}>
              Reveal Identity
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-foreground mb-2">Alert Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <div><strong className="text-foreground">Employee</strong></div>
                <div>{unmasked ? `${unmasked.name} (${unmasked.id})` : payload.employeeHash || 'Employee - unknown'}</div>
              </div>
              <div>
                <div><strong className="text-foreground">Role</strong></div>
                <div>{payload.employeeRole || event?.role || 'Unknown'}</div>
              </div>
              <div>
                <div><strong className="text-foreground">Timestamp</strong></div>
                <div>{formatTs(payload.createdAt || event?.timestamp)}</div>
              </div>
              <div>
                <div><strong className="text-foreground">Risk Score</strong></div>
                <div>{payload.riskScore ?? 'N/A'}</div>
              </div>
              <div>
                <div><strong className="text-foreground">IP</strong></div>
                <div>{event?.ip || payload.ip || 'Unknown'}</div>
              </div>
              <div>
                <div><strong className="text-foreground">Device</strong></div>
                <div>{event?.deviceId || payload.deviceId || 'Unknown'}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Reasons</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {(payload.reasons || payload.raw?.reasons || [])
                .map((r) => reasonMap[r] || r)
                .map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Raw Event / Alert</h3>
            <pre className="text-xs text-muted-foreground bg-muted/10 p-3 rounded-md overflow-auto">{JSON.stringify(payload, null, 2)}</pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Recommended Actions</h3>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Review the event timestamp, IP and device for anomalies.</li>
              <li>Cross-check related events in the timeline for context.</li>
              <li>Contact the employee or reveal identity if extra verification needed.</li>
              <li>Escalate to incident response if activity is confirmed malicious.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investigation;
