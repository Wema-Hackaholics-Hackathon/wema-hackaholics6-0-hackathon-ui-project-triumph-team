import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BehavioralTimeline = ({ 
  timelineData = [], 
  selectedUser = null,
  timeWindow = 7,
  onEventClick,
  className = '' 
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [filteredData, setFilteredData] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  useEffect(() => {
    // Filter and process timeline data based on selected time range
    const now = new Date();
    let startTime;
    
    switch (selectedTimeRange) {
      case '1h':
        startTime = new Date(now - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
    }

    const filtered = timelineData?.filter(event => new Date(event.timestamp) >= startTime)?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredData(filtered);
  }, [timelineData, selectedTimeRange]);

  const getEventTypeConfig = (eventType, severity) => {
    const configs = {
      login: { icon: 'LogIn', color: 'text-primary', bg: 'bg-primary/10' },
      data_access: { icon: 'Database', color: 'text-warning', bg: 'bg-warning/10' },
      file_transfer: { icon: 'FileText', color: 'text-error', bg: 'bg-error/10' },
      api_call: { icon: 'Zap', color: 'text-success', bg: 'bg-success/10' },
      privilege_change: { icon: 'ShieldAlert', color: 'text-error', bg: 'bg-error/10' },
      anomaly: { icon: 'AlertTriangle', color: 'text-error', bg: 'bg-error/10' }
    };

    const config = configs?.[eventType] || configs?.anomaly;
    
    if (severity === 'critical') {
      return { ...config, color: 'text-error', bg: 'bg-error/20' };
    } else if (severity === 'high') {
      return { ...config, color: 'text-warning', bg: 'bg-warning/20' };
    }
    
    return config;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const timeRangeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="Activity" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Behavioral Timeline</h3>
            {selectedUser && (
              <span className="text-sm text-muted-foreground">
                - {selectedUser?.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {timeRangeOptions?.map((option) => (
              <Button
                key={option?.value}
                variant={selectedTimeRange === option?.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(option?.value)}
              >
                {option?.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-error rounded-full" />
            <span>Critical Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full" />
            <span>High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>Normal Activity</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {filteredData?.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activity data for selected time range</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {filteredData?.map((event, index) => {
                const config = getEventTypeConfig(event?.eventType, event?.severity);
                const isAnomaly = event?.isAnomaly || event?.severity === 'critical';
                
                return (
                  <div
                    key={event?.id}
                    className="relative flex items-start space-x-4 group"
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    {/* Timeline Dot */}
                    <div className={`relative z-10 p-2 rounded-full ${config?.bg} border-2 border-card ${isAnomaly ? 'threat-pulse' : ''}`}>
                      <Icon name={config?.icon} size={16} className={config?.color} />
                    </div>
                    {/* Event Content */}
                    <div 
                      className="flex-1 bg-muted/20 rounded-lg p-4 cursor-pointer security-transition hover:bg-muted/40"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-foreground">{event?.title}</h4>
                          {isAnomaly && (
                            <span className="px-2 py-1 bg-error/20 text-error text-xs rounded-full">
                              Anomaly
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(event?.timestamp)} {formatTimestamp(event?.timestamp)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{event?.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          {event?.user && (
                            <span>User: {event?.user}</span>
                          )}
                          {event?.source && (
                            <span>Source: {event?.source}</span>
                          )}
                          {event?.riskScore && (
                            <span>Risk: {event?.riskScore}</span>
                          )}
                        </div>
                        
                        {event?.correlatedEvents && event?.correlatedEvents?.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-primary">
                            <Icon name="Link" size={12} />
                            <span>{event?.correlatedEvents?.length} correlated</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Hover Details */}
                    {hoveredEvent?.id === event?.id && (
                      <div className="absolute left-full top-0 ml-4 w-64 bg-popover border border-border rounded-lg p-3 shadow-security z-20">
                        <h5 className="font-medium text-popover-foreground mb-2">Event Details</h5>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Type: {event?.eventType}</div>
                          <div>Severity: {event?.severity}</div>
                          {event?.ipAddress && <div>IP: {event?.ipAddress}</div>}
                          {event?.deviceInfo && <div>Device: {event?.deviceInfo}</div>}
                          {event?.location && <div>Location: {event?.location}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehavioralTimeline;