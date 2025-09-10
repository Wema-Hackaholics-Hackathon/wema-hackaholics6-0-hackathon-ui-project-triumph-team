import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';


const ThreatContextHeader = ({
  threatStatus = 'operational',
  activeInvestigations = 2,
  userSession = {
    name: 'Security Analyst',
    role: 'SOC Analyst',
    lastActivity: '2025-09-09T22:35:00Z'
  },
  onLogout,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getThreatStatusConfig = (status) => {
    switch (status) {
      case 'critical':
        return {
          color: 'text-error',
          bgColor: 'bg-error/10',
          icon: 'AlertTriangle',
          label: 'Critical Threats Active'
        };
      case 'warning':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'AlertCircle',
          label: 'Elevated Threat Level'
        };
      case 'operational':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'Shield',
          label: 'Systems Operational'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          icon: 'HelpCircle',
          label: 'Status Unknown'
        };
    }
  };

  const statusConfig = getThreatStatusConfig(threatStatus);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header 
      className={`
        sticky top-0 z-200 bg-card border-b border-border
        px-4 py-2 flex items-center justify-between
        ${className}
      `}
      role="banner"
    >
      {/* Left Section - Threat Status */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 px-2 py-1 rounded-lg ${statusConfig?.bgColor}`}>
          <Icon 
            name={statusConfig?.icon} 
            size={14} 
            className={`${statusConfig?.color} ${threatStatus === 'critical' ? 'threat-pulse' : ''}`} 
          />
          <span className={`text-xs font-medium ${statusConfig?.color}`}>
            {statusConfig?.label}
          </span>
        </div>

        {activeInvestigations > 0 && (
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Icon name="Search" size={14} />
            <span className="text-xs">
              {activeInvestigations} Active Investigation{activeInvestigations !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      {/* Right Section - Time and User */}
      <div className="flex items-center space-x-4">
        {/* Simplified User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-muted security-transition focus:outline-none"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={14} className="text-primary-foreground" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-medium text-foreground">{userSession?.name}</span>
            </div>
            <Icon 
              name="ChevronDown" 
              size={12} 
              className={`text-muted-foreground security-transition ${showUserMenu ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Keep existing dropdown menu but with reduced padding */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-security z-300">
              <div className="p-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} className="text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-popover-foreground">{userSession?.name}</span>
                    <span className="text-xs text-muted-foreground">{userSession?.role}</span>
                  </div>
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-muted security-transition text-left"
                >
                  <Icon name="Settings" size={14} className="text-muted-foreground" />
                  <span className="text-sm text-popover-foreground">Settings</span>
                </button>
                
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-muted security-transition text-left"
                >
                  <Icon name="HelpCircle" size={14} className="text-muted-foreground" />
                  <span className="text-sm text-popover-foreground">Help</span>
                </button>

                <div className="border-t border-border my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive security-transition text-left"
                >
                  <Icon name="LogOut" size={14} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-100" 
          onClick={() => setShowUserMenu(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default ThreatContextHeader;