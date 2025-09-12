import React, { useState, useEffect } from "react";
import SecuritySidebar from "../../components/ui/SecuritySidebar";
import ThreatContextHeader from "../../components/ui/ThreatContextHeader";
import AlertNotificationOverlay from "../../../../frontend/src/components/ui/AlertNotificationOverlay";
import MetricsStrip from "./components/MetricsStrip";
import DashboardFilters from "./components/DashboardFilters";
import UserRiskMatrix from "./components/UserRiskMatrix";
import UserInvestigationList from "./components/UserInvestigationList";
import BehavioralTimeline from "./components/BehavioralTimeline";
import Icon from "../../components/AppIcon";
import { fetchDashboard, fetchAlerts } from "../../utils/api";
import { useNavigate } from 'react-router-dom';

const InsiderThreatAnalyticsDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed by default
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: "",
    department: "all",
    riskScoreMin: 0,
    riskScoreMax: 100,
    timeWindow: 7,
    anomalyType: "all",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [investigationUsers, setInvestigationUsers] = useState([]);

  // Mock data for dashboard
  const mockUsers = [
    {
      id: "user-001",
      name: "Ayokunle Olayinka",
      department: "Engineering",
      riskScore: 85,
      behavioralDeviation: 78,
      accessPrivilegeLevel: 92,
      anomalyCount: 5,
      dataAccessScore: 88,
      lastActivity: "2025-09-09T22:15:00Z",
      recentAnomalies: [
        {
          type: "data_access",
          description: "Unusual database queries after hours",
        },
        {
          type: "file_transfer",
          description: "Large file downloads to personal device",
        },
        {
          type: "api_usage",
          description: "Excessive API calls to customer data",
        },
      ],
    },
    {
      id: "user-002",
      name: "Employee-005",
      department: "Finance",
      riskScore: 72,
      behavioralDeviation: 65,
      accessPrivilegeLevel: 85,
      anomalyCount: 3,
      dataAccessScore: 75,
      lastActivity: "2025-09-09T21:45:00Z",
      recentAnomalies: [
        {
          type: "login_pattern",
          description: "Login from unusual geographic location",
        },
        {
          type: "privilege_escalation",
          description: "Attempted access to restricted financial data",
        },
      ],
    },
    {
      id: "user-003",
      name: "Employee-005",
      department: "HR",
      riskScore: 68,
      behavioralDeviation: 55,
      accessPrivilegeLevel: 78,
      anomalyCount: 4,
      dataAccessScore: 82,
      lastActivity: "2025-09-09T20:30:00Z",
      recentAnomalies: [
        {
          type: "data_access",
          description: "Access to employee records outside normal hours",
        },
        {
          type: "file_transfer",
          description: "Downloaded multiple employee files",
        },
      ],
    },
    {
      id: "user-004",
      name: "Adebowale Ilesanmi",
      department: "Sales",
      riskScore: 45,
      behavioralDeviation: 35,
      accessPrivilegeLevel: 60,
      anomalyCount: 2,
      dataAccessScore: 55,
      lastActivity: "2025-09-09T19:20:00Z",
      recentAnomalies: [
        { type: "api_usage", description: "Higher than normal CRM API usage" },
      ],
    },
    {
      id: "user-005",
      name: "Abiola Olarinde",
      department: "Operations",
      riskScore: 38,
      behavioralDeviation: 28,
      accessPrivilegeLevel: 45,
      anomalyCount: 1,
      dataAccessScore: 42,
      lastActivity: "2025-09-09T18:15:00Z",
      recentAnomalies: [
        { type: "login_pattern", description: "Extended session duration" },
      ],
    },
  ];

  const mockTimelineData = [
    {
      id: "event-001",
      title: "Suspicious Database Access",
      description:
        "Ayokunle Olayinka accessed customer database outside normal business hours with unusual query patterns",
      eventType: "data_access",
      severity: "critical",
      isAnomaly: true,
      timestamp: "2025-09-09T22:15:00Z",
      user: "Ayokunle Olayinka",
      source: "Database Server",
      riskScore: 85,
      ipAddress: "192.168.1.45",
      deviceInfo: "MacBook Pro",
      location: "Lagos, Nigeria",
      correlatedEvents: ["event-002", "event-003"],
    },
    {
      id: "event-002",
      title: "Large File Download",
      description: "Multiple large files downloaded to external device",
      eventType: "file_transfer",
      severity: "high",
      isAnomaly: true,
      timestamp: "2025-09-09T22:10:00Z",
      user: "Employee-005",
      source: "File Server",
      riskScore: 78,
      correlatedEvents: ["event-001"],
    },
    {
      id: "event-003",
      title: "Unusual Login Location",
      description:
        "Employee-005 logged in from an unusual geographic location",
      eventType: "login",
      severity: "medium",
      isAnomaly: true,
      timestamp: "2025-09-09T21:45:00Z",
      user: "Employee-005",
      source: "Authentication Server",
      riskScore: 65,
      location: "Oyo, Nigeria",
    },
    {
      id: "event-004",
      title: "API Rate Limit Exceeded",
      description: "Excessive API calls detected from user session",
      eventType: "api_call",
      severity: "medium",
      isAnomaly: false,
      timestamp: "2025-09-09T21:30:00Z",
      user: "Adebowale Ilesanmi",
      source: "API Gateway",
      riskScore: 45,
    },
    {
      id: "event-005",
      title: "Privilege Escalation Attempt",
      description:
        "User attempted to access resources beyond their permission level",
      eventType: "privilege_change",
      severity: "high",
      isAnomaly: true,
      timestamp: "2025-09-09T20:45:00Z",
      user: "Abiola Olarinde",
      source: "Access Control System",
      riskScore: 72,
    },
    {
      id: "event-006",
      title: "Suspicious Database Access",
      description:
        "Ayokunle Olayinka accessed customer database outside normal business hours with unusual query patterns",
      eventType: "data_access",
      severity: "critical",
      isAnomaly: true,
      timestamp: "2025-09-09T22:15:00Z",
      user: "Ayokunle Olayinka",
      source: "Database Server",
      riskScore: 85,
      ipAddress: "192.168.1.45",
      deviceInfo: "MacBook Pro",
      location: "Lagos, Nigeria",
      // correlatedEvents: ["event-002", "event-003"],
    },
    {
      id: "event-007",
      title: "Large File Download",
      description: "Multiple large files downloaded to external device",
      eventType: "file_transfer",
      severity: "high",
      isAnomaly: true,
      timestamp: "2025-09-09T22:10:00Z",
      user: "Employee-005",
      source: "File Server",
      riskScore: 78,
      // correlatedEvents: ["event-001"],
    },
    {
      id: "event-008",
      title: "Unusual Login Location",
      description:
        "Employee-005 logged in from an unusual geographic location",
      eventType: "login",
      severity: "medium",
      isAnomaly: true,
      timestamp: "2025-09-09T21:45:00Z",
      user: "Employee-005",
      source: "Authentication Server",
      riskScore: 65,
      location: "Oyo, Nigeria",
    },
    {
      id: "event-009",
      title: "API Rate Limit Exceeded",
      description: "Excessive API calls detected from user session",
      eventType: "api_call",
      severity: "medium",
      isAnomaly: false,
      timestamp: "2025-09-09T21:30:00Z",
      user: "Employee-005",
      source: "API Gateway",
      riskScore: 45,
    },
    {
      id: "event-010",
      title: "Privilege Escalation Attempt",
      description:
        "User attempted to access resources beyond their permission level",
      eventType: "privilege_change",
      severity: "high",
      isAnomaly: true,
      timestamp: "2025-09-09T20:45:00Z",
      user: "Employee-005",
      source: "Access Control System",
      riskScore: 72,
    },
  ];

  const mapAlertsToUsers = (alerts) => {
    const users = data.alerts.map((alert) => ({
      id: alert.alertId,
      name: `Employee-${alert.employeeHash}`, // cleaner label
      department: alert.employeeRole,
      riskScore: alert.riskScore,
      lastActivity: alert.createdAt,
      anomalyCount: alert.reasons?.length || 0,
      recentAnomalies: alert.reasons?.map((r) => ({
        type: "behavior",
        description: r,
      })),
      behavioralDeviation: alert.riskScore, // temp mapping
      accessPrivilegeLevel: Math.floor(Math.random() * 100), // temp
      dataAccessScore: Math.floor(Math.random() * 100), // temp
    }));
  };

  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [backendUsers, setBackendUsers] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const navigate = useNavigate();

  const handleDismissOverlay = () => {
    // Only dismiss the overlay UI; keep alerts and user lists intact
    setOverlayVisible(false);
  };

  useEffect(() => {
    const reopen = () => setOverlayVisible(true);
    window.addEventListener('reopenAlerts', reopen);
    return () => window.removeEventListener('reopenAlerts', reopen);
  }, []);

  // Filter users based on current filters
  const filteredUsers = mockUsers?.filter((user) => {
    if (
      filters?.searchQuery &&
      !user?.name?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase())
    ) {
      return false;
    }
    if (
      filters?.department !== "all" &&
      user?.department?.toLowerCase() !== filters?.department
    ) {
      return false;
    }
    if (
      user?.riskScore < filters?.riskScoreMin ||
      user?.riskScore > filters?.riskScoreMax
    ) {
      return false;
    }
    return true;
  });

  // Sort users by risk score for investigation list
  const highRiskUsers = filteredUsers
    ?.filter((user) => user?.riskScore >= 60)
    ?.sort((a, b) => b?.riskScore - a?.riskScore);

  useEffect(() => {
    // Simulate data refresh every 10 minutes
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchDashboard(); // raw backend response

        // mapping layer: backend → MetricsStrip format
        const mapped = {
          highRiskUsers: {
            value: data.counts?.high || 0,
            trend: 0,
            trendDirection: "up",
          },
          anomalyDetectionRate: {
            value: ((data.totalAlerts || 0) / 100) * 100, // TEMP fake %
            trend: 0,
            trendDirection: "up",
          },
          investigationQueue: {
            value: data.totalAlerts || 0,
            trend: 0,
            trendDirection: "down",
          },
          baselineAccuracy: {
            value: 97.8, // static placeholder
            trend: 0.8,
            trendDirection: "up",
          },
        };

        setMetrics(mapped); // ✅ use the mapped format
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    loadDashboard();
  }, []);

  // Load alerts on mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        if (data && data.alerts) {
          // Map backend alerts → UI-friendly alerts
            const reasonMap = {
            massive_data_exfiltration:
              "Massive data transfer detected (>1GB)",
            suspicious_document_capture:
              "Multiple screenshots of sensitive documents",
            screenshot_taken: "Screenshot captured",
            unusual_access_pattern:
              "Access to resources outside normal role scope",
            bulk_download: "High-volume file downloads",
            new_ip_or_device: "Login from new IP or device",
            login_outside_hours: "Login outside normal hours",
            large_transaction: "Large transaction approval",
            multiple_recent_events: "Multiple anomalies in short time",
              // newly added reason codes
              usb_large_copy: "Large copy to removable media",
              token_export_detected: "Export of credentials or tokens detected",
              anonymizing_tunnel_detected: "Connection to anonymizing network (Tor/VPN)",
              archive_then_upload: "Archive created and quickly uploaded externally",
              log_wipe_detected: "Audit/log deletion detected",
              geo_mismatch: "Login geolocation mismatch",
              file_write_spike: "Spike in file writes",
              access_denied_spike: "Repeated access denied events",
          };

          const mapped = data.alerts.map((a) => {
            const friendlyReasons = (a.reasons || []).map(
              (r) => reasonMap[r] || r
            );
            return {
              id: a.alertId, // use backend's alertId
              title: `Risk Alert (${a.riskLevel.toUpperCase()})`,
              message:
                friendlyReasons.join("; ") || "Unusual activity detected",
              severity: a.riskLevel || "medium",
              timestamp: a.createdAt,
              metadata: {
                source: a.employeeRole,
                affectedSystems: a.eventRef?.type || "System",
              },
              actions: {
                view: true,
                investigate: true,
              },
              // include original payload for drill-downs
              raw: a,
            };
          });
          setAlerts(mapped);
        }
      } catch (err) {
        console.error("Failed to load alerts:", err);
      }
    };
    loadAlerts();
    // Subscribe to SSE for live updates
    let sub = null;
    try {
      const { subscribeToAlerts } = require('../../utils/api');
      sub = subscribeToAlerts((payload) => {
        if (payload?.alerts) {
          const mapped = payload.alerts.map((a) => {
            const friendlyReasons = (a.reasons || []).map((r) => r);
            return {
              id: a.alertId,
              title: `Risk Alert (${(a.riskLevel||'MED').toUpperCase()})`,
              message: (a.reasons || []).join('; '),
              severity: a.riskLevel || 'medium',
              timestamp: a.createdAt,
              metadata: { source: a.employeeRole },
              actions: { view: true, investigate: true },
              raw: a,
            };
          });
          setAlerts(mapped);
        }
      });
    } catch (err) {
      // optional: SSE not supported in this environment
    }

    return () => {
      try {
        sub && sub.close && sub.close();
      } catch (e) {}
    };
  }, []);

  //Load alerts on mount and map them into users for investigation list
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        if (data?.alerts) {
          const reasonMap = {
            massive_data_exfiltration:
              "Massive data transfer detected (>1GB)",
            suspicious_document_capture:
              "Multiple screenshots of sensitive documents",
            screenshot_taken: "Screenshot captured",
            unusual_access_pattern:
              "Access to resources outside normal role scope",
            bulk_download: "High-volume file downloads",
          };

          const mapped = data.alerts.map((a) => ({
            id: a.alertId,
            name: `Employee-${a.employeeHash}`,
            department: a.employeeRole || "Unknown",
            riskScore: a.riskScore,
            anomalyCount: a.reasons?.length || 1,
            behavioralDeviation: Math.min(100, a.riskScore + 10), // fake scaling
            accessPrivilegeLevel: Math.max(20, 100 - a.riskScore), // fake scaling
            recentAnomalies: a.reasons?.map((r) => ({
              type: "anomaly",
              description: reasonMap[r] || r,
            })),
            lastActivity: a.createdAt || new Date().toISOString(),
            raw: a,
          }));
          setBackendUsers(mapped);
        }
      } catch (err) {
        console.error("Failed to load alerts:", err);
      }
    };

    loadAlerts();
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        if (data?.alerts) {
          const users = data.alerts.map((alert) => ({
            id: alert.alertId,
            name: alert.employeeHash, // anonymized ID
            department: alert.employeeRole,
            riskScore: alert.riskScore,
            lastActivity: alert.createdAt || new Date().toISOString(),
            anomalyCount: alert.reasons?.length || 0,
            recentAnomalies: alert.reasons?.map((r) => ({
              type: "behavior",
              description: r,
            })),
            behavioralDeviation: alert.riskScore, // temp mapping
            accessPrivilegeLevel: Math.floor(Math.random() * 100), // temp
            dataAccessScore: Math.floor(Math.random() * 100), // temp
            raw: alert,
          }));
          setInvestigationUsers(users);
        }
      } catch (err) {
        console.error("Failed to load alerts:", err);
      }
    };

    loadAlerts();
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleUserInvestigate = (user) => {
    // Prefer to navigate with the original alert payload (`raw`) so Investigation has full context
    const raw = user?.raw || user?.alert || null;
    if (raw) {
      const aid = raw.alertId || raw.id || user?.id;
      navigate(`/investigation/${aid}`, { state: { raw } });
      return;
    }
    if (user?.id) {
      navigate(`/investigation/${user.id}`, { state: { user } });
      return;
    }
    console.log("Investigating user:", user);
  };

  const handleEventClick = (event) => {
    console.log("Event clicked:", event);
    // In a real app, this would show event details
  };

  const handleAlertClick = (alert) => {
    console.log("Alert clicked:", alert);
    // In a real app, this would navigate to alert details
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const formatLastUpdated = (date) => {
    return date?.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <SecuritySidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeModule="insider-threat-analytics-dashboard"
        userRole="analyst"
      />
      {/* Main Content */}
      <div
        className={`${
          sidebarCollapsed ? "ml-16" : "ml-60"
        } security-transition`}
      >
        {/* Header */}
        <ThreatContextHeader
          threatStatus="warning"
          activeInvestigations={highRiskUsers?.length}
          userSession={{
            name: "Security Analyst",
            role: "SOC Analyst",
            lastActivity: "2025-09-09T22:35:00Z",
          }}
        />

        {/* Page Content */}
        <div className="p-4 space-y-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Insider Threat Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Behavioral analytics and risk assessment
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-muted-foreground">
                Updated: {formatLastUpdated(lastUpdated)}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-muted security-transition disabled:opacity-50"
                title="Refresh data"
              >
                <Icon
                  name="RefreshCw"
                  size={14}
                  className={`text-muted-foreground ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Metrics Strip */}
          {metrics && <MetricsStrip metrics={metrics} />}

          {/* Filters */}
          <DashboardFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* User Risk Matrix - 8 columns */}
            <div className="lg:col-span-8">
              <UserRiskMatrix
                users={backendUsers} // 🔥 switched from mockUsers
                onUserClick={handleUserSelect}
                selectedTimeWindow={filters?.timeWindow}
              />
            </div>

            {/* Investigation List - 4 columns */}
            <div className="lg:col-span-4">
              <UserInvestigationList
                users={backendUsers} // 🔥 now from backend
                onUserSelect={handleUserSelect}
                onInvestigate={handleUserInvestigate}
              />
            </div>
          </div>

          {/* Behavioral Timeline - Full Width */}
          <BehavioralTimeline
            timelineData={mockTimelineData}
            selectedUser={selectedUser}
            timeWindow={filters?.timeWindow}
            onEventClick={handleEventClick}
          />
        </div>
      </div>
      {/* Alert Notifications */}
      {overlayVisible && (
        <AlertNotificationOverlay
          alerts={alerts}
          onAlertClick={handleAlertClick}
          onDismissOverlay={handleDismissOverlay}
          maxVisible={3}
          autoHideDelay={8000000}
        />
      )}
    </div>
  );
};

export default InsiderThreatAnalyticsDashboard;
