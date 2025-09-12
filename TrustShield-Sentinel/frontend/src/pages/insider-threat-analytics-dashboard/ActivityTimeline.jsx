import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BehavioralTimeline from './components/BehavioralTimeline';
import { fetchEmployee, fetchAlert } from '../../utils/api';
import Button from '../../components/ui/Button';

// Note: timelineData is built from the raw alert payload when available.

const ActivityTimeline = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const raw = state?.raw || null;
  const navigate = useNavigate();
  const [employeeDetails, setEmployeeDetails] = useState(null);

  useEffect(() => {
    const load = async () => {
      let alertData = raw;
      if (!alertData) {
        const res = await fetchAlert(id);
        alertData = res?.alert || null;
      }
      const empId = alertData?.eventRef?.employeeId || id;
      const data = await fetchEmployee(empId);
      setEmployeeDetails(data?.employee || null);
    };
    load();
  }, [id, raw]);

  // If raw has an eventRef, use it; otherwise, provide a small sample timeline
  const timelineData = raw?.eventRef
    ? [
        {
          id: raw.eventRef.id || `evt-${id}`,
          title: raw.eventRef.action || 'Event',
          description: JSON.stringify(raw.eventRef.details || {}),
          eventType: raw.eventRef.action || 'unknown',
          severity: raw.riskLevel || 'medium',
          timestamp: raw.createdAt || new Date().toISOString(),
          user: raw.employeeHash || id,
          source: raw.eventRef.ip || 'unknown',
        },
      ]
    : [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Activity Timeline</h2>
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      {employeeDetails && (
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">Employee: <span className="text-foreground font-medium">{employeeDetails.name || employeeDetails.id}</span></div>
          <div className="text-sm text-muted-foreground">Role: {employeeDetails.role}</div>
        </div>
      )}

      <BehavioralTimeline timelineData={timelineData} />
    </div>
  );
};

export default ActivityTimeline;
