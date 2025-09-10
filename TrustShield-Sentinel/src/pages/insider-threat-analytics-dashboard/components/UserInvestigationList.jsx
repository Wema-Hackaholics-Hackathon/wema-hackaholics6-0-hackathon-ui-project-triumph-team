import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserInvestigationList = ({ 
  users = [], 
  onUserSelect, 
  onInvestigate,
  className = '' 
}) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const getRiskBadgeConfig = (riskScore) => {
    if (riskScore >= 80) {
      return { color: 'bg-error text-error-foreground', label: 'Critical' };
    } else if (riskScore >= 60) {
      return { color: 'bg-warning text-warning-foreground', label: 'High' };
    } else if (riskScore >= 40) {
      return { color: 'bg-primary text-primary-foreground', label: 'Medium' };
    }
    return { color: 'bg-success text-success-foreground', label: 'Low' };
  };

  const getAnomalyIcon = (anomalyType) => {
    switch (anomalyType) {
      case 'data_access':
        return 'Database';
      case 'login_pattern':
        return 'LogIn';
      case 'file_transfer':
        return 'FileText';
      case 'api_usage':
        return 'Zap';
      case 'privilege_escalation':
        return 'ShieldAlert';
      default:
        return 'AlertTriangle';
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user?.id === selectedUser?.id ? null : user);
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const handleInvestigate = (user, event) => {
    event?.stopPropagation();
    if (onInvestigate) {
      onInvestigate(user);
    }
  };

  const formatLastActivity = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date?.toLocaleDateString();
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="UserSearch" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Investigation Queue</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {users?.length} users requiring attention
          </span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {users?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
            <p className="text-muted-foreground">No users requiring investigation</p>
          </div>
        ) : (
          <div className="space-y-1">
            {users?.map((user) => {
              const riskConfig = getRiskBadgeConfig(user?.riskScore);
              const isSelected = selectedUser?.id === user?.id;
              
              return (
                <div key={user?.id} className="border-b border-border last:border-b-0">
                  <div
                    className={`p-4 cursor-pointer security-transition hover:bg-muted/50 ${
                      isSelected ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={20} className="text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{user?.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskConfig?.color}`}>
                              {riskConfig?.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{user?.department}</span>
                            <span>•</span>
                            <span>Risk: {user?.riskScore}</span>
                            <span>•</span>
                            <span>{formatLastActivity(user?.lastActivity)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-sm font-medium text-foreground">
                          {user?.anomalyCount} anomalies
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleInvestigate(user, e)}
                          iconName="Search"
                          iconPosition="left"
                        >
                          Investigate
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Recent Anomalies</h5>
                            <div className="space-y-2">
                              {user?.recentAnomalies?.slice(0, 3)?.map((anomaly, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Icon 
                                    name={getAnomalyIcon(anomaly?.type)} 
                                    size={16} 
                                    className="text-warning" 
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {anomaly?.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Risk Factors</h5>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Behavioral Deviation</span>
                                <span className="text-foreground">{user?.behavioralDeviation}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Access Privilege</span>
                                <span className="text-foreground">{user?.accessPrivilegeLevel}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Data Access Score</span>
                                <span className="text-foreground">{user?.dataAccessScore}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="default"
                            size="sm"
                            iconName="Eye"
                            iconPosition="left"
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Clock"
                            iconPosition="left"
                          >
                            Activity Timeline
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Users"
                            iconPosition="left"
                          >
                            Compare Peers
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInvestigationList;