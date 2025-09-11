import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const UserRiskMatrix = ({ 
  users = [], 
  onUserClick, 
  selectedTimeWindow = 7,
  className = '' 
}) => {
  const [hoveredUser, setHoveredUser] = useState(null);
  const [matrixData, setMatrixData] = useState([]);

  useEffect(() => {
    // Transform user data for matrix visualization
    const transformedData = users?.map(user => ({
      ...user,
      x: user?.behavioralDeviation || 0,
      y: user?.accessPrivilegeLevel || 0,
      size: Math.max(8, user?.riskScore * 0.8),
      color: getRiskColor(user?.riskScore)
    }));
    setMatrixData(transformedData);
  }, [users]);

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return 'bg-error';
    if (riskScore >= 60) return 'bg-warning';
    if (riskScore >= 40) return 'bg-primary';
    return 'bg-success';
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore >= 80) return 'Critical';
    if (riskScore >= 60) return 'High';
    if (riskScore >= 40) return 'Medium';
    return 'Low';
  };

  const handleUserClick = (user) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Target" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">User Risk Matrix</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>Last {selectedTimeWindow} days</span>
        </div>
      </div>
      <div className="relative">
        {/* Matrix Container */}
        <div className="relative w-full h-96 bg-muted/20 rounded-lg border border-border overflow-hidden">
          {/* Grid Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Vertical grid lines */}
            {[0, 25, 50, 75, 100]?.map(x => (
              <line
                key={`v-${x}`}
                x1={`${x}%`}
                y1="0"
                x2={`${x}%`}
                y2="100%"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100]?.map(y => (
              <line
                key={`h-${y}`}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* User Points */}
          {matrixData?.map((user) => (
            <div
              key={user?.id}
              className={`absolute rounded-full cursor-pointer security-transition hover:scale-125 ${user?.color}`}
              style={{
                left: `${user?.x}%`,
                bottom: `${user?.y}%`,
                width: `${user?.size}px`,
                height: `${user?.size}px`,
                transform: 'translate(-50%, 50%)'
              }}
              onClick={() => handleUserClick(user)}
              onMouseEnter={() => setHoveredUser(user)}
              onMouseLeave={() => setHoveredUser(null)}
              title={`${user?.name} - Risk: ${user?.riskScore}`}
            />
          ))}

          {/* Hover Tooltip */}
          {hoveredUser && (
            <div className="absolute z-10 bg-popover border border-border rounded-lg p-3 shadow-security pointer-events-none">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${hoveredUser?.color}`} />
                <span className="font-medium text-popover-foreground">{hoveredUser?.name}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Risk Score: {hoveredUser?.riskScore}</div>
                <div>Department: {hoveredUser?.department}</div>
                <div>Anomalies: {hoveredUser?.anomalyCount}</div>
              </div>
            </div>
          )}
        </div>

        {/* Axis Labels */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            <Icon name="ArrowRight" size={16} className="inline mr-1" />
            Behavioral Deviation
          </div>
          <div className="text-sm text-muted-foreground">
            <Icon name="ArrowUp" size={16} className="inline mr-1" />
            Access Privilege Level
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 p-3 bg-muted/20 rounded-lg">
          {[
            { label: 'Low Risk', color: 'bg-success', range: '0-39' },
            { label: 'Medium Risk', color: 'bg-primary', range: '40-59' },
            { label: 'High Risk', color: 'bg-warning', range: '60-79' },
            { label: 'Critical Risk', color: 'bg-error', range: '80-100' }
          ]?.map((item) => (
            <div key={item?.label} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item?.color}`} />
              <span className="text-xs text-muted-foreground">
                {item?.label} ({item?.range})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRiskMatrix;