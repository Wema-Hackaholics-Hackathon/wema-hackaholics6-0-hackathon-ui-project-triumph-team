import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { fetchEmployee, fetchAlert } from '../../utils/api';

const Profile = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const raw = state?.raw || null;
  const navigate = useNavigate();
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // If we don't have raw payload, try to fetch alert by id param
      let alertData = raw;
      if (!alertData) {
        const res = await fetchAlert(id);
        alertData = res?.alert || null;
      }
      const empId = alertData?.eventRef?.employeeId || id;
      const data = await fetchEmployee(empId);
      setEmployeeDetails(data?.employee || null);
      setLoading(false);
    };
    load();
  }, [id, raw]);

  // If raw isn't provided, we show the id and a fallback
  const employee = employeeDetails || raw?.unmasked || raw?.eventRef?.employeeId || { id };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Employee Profile</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm text-muted-foreground">Employee</h4>
            <div className="text-foreground font-medium">{loading ? 'Loading...' : (employee.name || `Employee-${employee.id}`)}</div>
            <div className="text-sm text-muted-foreground">ID: {employee.id}</div>
          </div>

          <div>
            <h4 className="text-sm text-muted-foreground">Role</h4>
            <div className="text-foreground font-medium">{raw?.employeeRole || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">Last activity: {raw?.createdAt || 'N/A'}</div>
          </div>

          <div>
            <h4 className="text-sm text-muted-foreground">Risk</h4>
            <div className="text-foreground font-medium">{raw?.riskScore || '-'}</div>
            <div className="text-sm text-muted-foreground">Level: {raw?.riskLevel || '-'}</div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm text-muted-foreground mb-2">Recent Alerts / Events</h4>
          <pre className="text-xs bg-muted p-3 rounded">{JSON.stringify(raw?.eventRef || raw, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default Profile;
