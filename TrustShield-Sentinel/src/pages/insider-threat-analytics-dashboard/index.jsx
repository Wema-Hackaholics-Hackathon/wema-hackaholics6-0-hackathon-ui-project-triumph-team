import React, { useState, useEffect } from 'react';
import SecuritySidebar from '../../components/ui/SecuritySidebar';
import ThreatContextHeader from '../../components/ui/ThreatContextHeader';
import AlertNotificationOverlay from '../../../../TrustShield-Sentinel/src/components/ui/AlertNotificationOverlay';
import MetricsStrip from './components/MetricsStrip';
import DashboardFilters from './components/DashboardFilters';
import UserRiskMatrix from './components/UserRiskMatrix';
import UserInvestigationList from './components/UserInvestigationList';
import BehavioralTimeline from './components/BehavioralTimeline';
import Icon from '../../components/AppIcon';

const InsiderThreatAnalyticsDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed by default
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    department: 'all',
    riskScoreMin: 0,
    riskScoreMax: 100,
    timeWindow: 7,
    anomalyType: 'all'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data for dashboard
  const mockUsers = [
    {
      id: 'user-001',
      name: 'Ayokunle Olayinka',
      department: 'Engineering',
      riskScore: 85,
      behavioralDeviation: 78,
      accessPrivilegeLevel: 92,
      anomalyCount: 5,
      dataAccessScore: 88,
      lastActivity: '2025-09-09T22:15:00Z',
      recentAnomalies: [
        { type: 'data_access', description: 'Unusual database queries after hours' },
        { type: 'file_transfer', description: 'Large file downloads to personal device' },
        { type: 'api_usage', description: 'Excessive API calls to customer data' }
      ]
    },
    {
      id: 'user-002',
      name: 'Yewande Akilu',
      department: 'Finance',
      riskScore: 72,
      behavioralDeviation: 65,
      accessPrivilegeLevel: 85,
      anomalyCount: 3,
      dataAccessScore: 75,
      lastActivity: '2025-09-09T21:45:00Z',
      recentAnomalies: [
        { type: 'login_pattern', description: 'Login from unusual geographic location' },
        { type: 'privilege_escalation', description: 'Attempted access to restricted financial data' }
      ]
    },
    {
      id: 'user-003',
      name: 'Eniola Oladeji',
      department: 'HR',
      riskScore: 68,
      behavioralDeviation: 55,
      accessPrivilegeLevel: 78,
      anomalyCount: 4,
      dataAccessScore: 82,
      lastActivity: '2025-09-09T20:30:00Z',
      recentAnomalies: [
        { type: 'data_access', description: 'Access to employee records outside normal hours' },
        { type: 'file_transfer', description: 'Downloaded multiple employee files' }
      ]
    },
    {
      id: 'user-004',
      name: 'Adebowale Ilesanmi',
      department: 'Sales',
      riskScore: 45,
      behavioralDeviation: 35,
      accessPrivilegeLevel: 60,
      anomalyCount: 2,
      dataAccessScore: 55,
      lastActivity: '2025-09-09T19:20:00Z',
      recentAnomalies: [
        { type: 'api_usage', description: 'Higher than normal CRM API usage' }
      ]
    },
    {
      id: 'user-005',
      name: 'Abiola Olarinde',
      department: 'Operations',
      riskScore: 38,
      behavioralDeviation: 28,
      accessPrivilegeLevel: 45,
      anomalyCount: 1,
      dataAccessScore: 42,
      lastActivity: '2025-09-09T18:15:00Z',
      recentAnomalies: [
        { type: 'login_pattern', description: 'Extended session duration' }
      ]
    }
  ];

  const mockTimelineData = [
    {
      id: 'event-001',
      title: 'Suspicious Database Access',
      description: 'Ayokunle Olayinka accessed customer database outside normal business hours with unusual query patterns',
      eventType: 'data_access',
      severity: 'critical',
      isAnomaly: true,
      timestamp: '2025-09-09T22:15:00Z',
      user: 'Ayokunle Olayinka',
      source: 'Database Server',
      riskScore: 85,
      ipAddress: '192.168.1.45',
      deviceInfo: 'MacBook Pro',
      location: 'Lagos, Nigeria',
      correlatedEvents: ['event-002', 'event-003']
    },
    {
      id: 'event-002',
      title: 'Large File Download',
      description: 'Multiple large files downloaded to external device',
      eventType: 'file_transfer',
      severity: 'high',
      isAnomaly: true,
      timestamp: '2025-09-09T22:10:00Z',
      user: 'Yewande Akilu',
      source: 'File Server',
      riskScore: 78,
      correlatedEvents: ['event-001']
    },
    {
      id: 'event-003',
      title: 'Unusual Login Location',
      description: 'Eniola Oladeji logged in from an unusual geographic location',
      eventType: 'login',
      severity: 'medium',
      isAnomaly: true,
      timestamp: '2025-09-09T21:45:00Z',
      user: 'Eniola Oladeji',
      source: 'Authentication Server',
      riskScore: 65,
      location: 'Oyo, Nigeria',
    },
    {
      id: 'event-004',
      title: 'API Rate Limit Exceeded',
      description: 'Excessive API calls detected from user session',
      eventType: 'api_call',
      severity: 'medium',
      isAnomaly: false,
      timestamp: '2025-09-09T21:30:00Z',
      user: 'Adebowale Ilesanmi',
      source: 'API Gateway',
      riskScore: 45
    },
    {
      id: 'event-005',
      title: 'Privilege Escalation Attempt',
      description: 'User attempted to access resources beyond their permission level',
      eventType: 'privilege_change',
      severity: 'high',
      isAnomaly: true,
      timestamp: '2025-09-09T20:45:00Z',
      user: 'Abiola Olarinde',
      source: 'Access Control System',
      riskScore: 72
    }
  ];

  const mockAlerts = [
    {
      id: 'alert-001',
      title: 'Critical Insider Threat Detected',
      message: 'Ayokunle Olayinka exhibits multiple high-risk behaviors requiring immediate investigation',
      severity: 'critical',
      timestamp: '2025-09-09T22:20:00Z',
      metadata: {
        source: 'Behavioral Analytics Engine',
        affectedSystems: 'Customer Database, File Server'
      },
      actions: {
        view: true,
        investigate: true
      }
    },
    {
      id: 'alert-002',
      title: 'Unusual Access Pattern',
      message: 'Yewande Akilu accessed financial systems from unusual location',
      severity: 'high',
      timestamp: '2025-09-09T21:50:00Z',
      metadata: {
        source: 'Geographic Analysis',
        affectedSystems: 'Financial Database'
      },
      actions: {
        view: true,
        investigate: true
      }
    }
  ];

  const mockMetrics = {
    highRiskUsers: { value: 12, trend: 8.5, trendDirection: 'up' },
    anomalyDetectionRate: { value: 94.2, trend: 2.1, trendDirection: 'up' },
    investigationQueue: { value: 8, trend: -15.3, trendDirection: 'down' },
    baselineAccuracy: { value: 97.8, trend: 0.8, trendDirection: 'up' }
  };

  // Filter users based on current filters
  const filteredUsers = mockUsers?.filter(user => {
    if (filters?.searchQuery && !user?.name?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase())) {
      return false;
    }
    if (filters?.department !== 'all' && user?.department?.toLowerCase() !== filters?.department) {
      return false;
    }
    if (user?.riskScore < filters?.riskScoreMin || user?.riskScore > filters?.riskScoreMax) {
      return false;
    }
    return true;
  });

  // Sort users by risk score for investigation list
  const highRiskUsers = filteredUsers?.filter(user => user?.riskScore >= 60)?.sort((a, b) => b?.riskScore - a?.riskScore);

  useEffect(() => {
    // Simulate data refresh every 10 minutes
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleUserInvestigate = (user) => {
    console.log('Investigating user:', user);
    // In a real app, this would navigate to investigation page
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    // In a real app, this would show event details
  };

  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
    // In a real app, this would navigate to alert details
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const formatLastUpdated = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
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
      <div className={`${sidebarCollapsed ? 'ml-16' : 'ml-60'} security-transition`}>
        {/* Header */}
        <ThreatContextHeader
          threatStatus="warning"
          activeInvestigations={highRiskUsers?.length}
          userSession={{
            name: 'Security Analyst',
            role: 'SOC Analyst',
            lastActivity: '2025-09-09T22:35:00Z'
          }}
        />

        {/* Page Content */}
        <div className="p-4 space-y-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-foreground">Insider Threat Analytics</h1>
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
                  className={`text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} 
                />
              </button>
            </div>
          </div>

          {/* Metrics Strip */}
          <MetricsStrip metrics={mockMetrics} />

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
                users={filteredUsers}
                onUserClick={handleUserSelect}
                selectedTimeWindow={filters?.timeWindow}
              />
            </div>

            {/* Investigation List - 4 columns */}
            <div className="lg:col-span-4">
              <UserInvestigationList
                users={highRiskUsers}
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
      <AlertNotificationOverlay
        alerts={mockAlerts}
        onAlertClick={handleAlertClick}
        maxVisible={3}
        autoHideDelay={8000}
      />
    </div>
  );
};

export default InsiderThreatAnalyticsDashboard;