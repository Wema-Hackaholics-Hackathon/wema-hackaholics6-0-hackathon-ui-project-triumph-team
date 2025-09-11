import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const SecuritySidebar = ({ 
  isCollapsed = false, 
  onToggleCollapse, 
  activeModule = 'insider-threat-analytics-dashboard',
  userRole = 'analyst'
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigationModules = [
    {
      moduleId: 'insider-threat-analytics-dashboard',
      label: 'Threat Analytics',
      icon: 'Shield',
      route: '/insider-threat-analytics-dashboard',
      alertCount: 3,
      requiredPermissions: ['analyst', 'manager', 'ciso'],
      description: 'Behavioral analytics and risk assessment'
    },
    // {
    //   moduleId: 'incident-response',
    //   label: 'Incident Response',
    //   icon: 'AlertTriangle',
    //   route: '/incident-response',
    //   alertCount: 0,
    //   requiredPermissions: ['analyst', 'manager', 'ciso'],
    //   description: 'Active incident management and response'
    // },
    {
      moduleId: 'compliance-monitoring',
      label: 'Compliance',
      icon: 'FileCheck',
      route: '/compliance-monitoring',
      alertCount: 1,
      requiredPermissions: ['compliance', 'manager', 'ciso'],
      description: 'Regulatory compliance tracking'
    },
    // {
    //   moduleId: 'threat-intelligence',
    //   label: 'Threat Intel',
    //   icon: 'Eye',
    //   route: '/threat-intelligence',
    //   alertCount: 0,
    //   requiredPermissions: ['analyst', 'manager', 'ciso'],
    //   description: 'External threat intelligence feeds'
    // },
    {
      moduleId: 'security-reports',
      label: 'Reports',
      icon: 'BarChart3',
      route: '/security-reports',
      alertCount: 0,
      requiredPermissions: ['manager', 'ciso'],
      description: 'Executive security reporting'
    }
  ];

  const filteredModules = navigationModules?.filter(module => 
    module.requiredPermissions?.includes(userRole)
  );

  const handleModuleClick = (moduleId, route) => {
    if (route === window.location?.pathname) return;
    window.location.href = route;
  };

  const handleKeyDown = (event, moduleId, route) => {
    if (event?.key === 'Enter' || event?.key === ' ') {
      event?.preventDefault();
      handleModuleClick(moduleId, route);
    }
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full bg-card border-r border-border z-100
        security-transition flex flex-col
        ${isCollapsed ? 'w-16' : 'w-60'}
        lg:translate-x-0
      `}
      role="navigation"
      aria-label="Security modules navigation"
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={16} className="text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">TrustShield</span>
              <span className="text-xs text-muted-foreground opacity-75">Security</span>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Icon name="Shield" size={16} className="text-primary-foreground" />
          </div>
        )}
        
        {isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted security-transition"
            aria-label="Expand sidebar"
          >
            <Icon name="ChevronRight" size={12} className="text-muted-foreground" />
          </button>
        )}
        
        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-muted security-transition"
            aria-label="Collapse sidebar"
          >
            <Icon name="ChevronLeft" size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>
      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredModules?.map((module) => {
          const isActive = activeModule === module.moduleId;
          const hasAlerts = module.alertCount > 0;
          
          return (
            <div
              key={module.moduleId}
              className="relative"
              onMouseEnter={() => setHoveredItem(module.moduleId)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => handleModuleClick(module.moduleId, module.route)}
                onKeyDown={(e) => handleKeyDown(e, module.moduleId, module.route)}
                className={`
                  w-full flex items-center space-x-2 px-2 py-2 rounded-lg
                  security-transition text-left
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                `}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? module.label : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Icon 
                    name={module.icon} 
                    size={16} 
                    className={hasAlerts ? 'threat-pulse' : ''} 
                  />
                  {hasAlerts && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-error rounded-full" />
                  )}
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-xs font-medium">{module.label}</span>
                    {hasAlerts && (
                      <span className="bg-error text-error-foreground text-xs px-1 py-0.5 rounded-full min-w-[1rem] text-center">
                        {module.alertCount}
                      </span>
                    )}
                  </>
                )}
              </button>
              
              {/* Simplified Tooltip */}
              {isCollapsed && hoveredItem === module.moduleId && (
                <div className="absolute left-full top-0 ml-2 px-2 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-security z-300 whitespace-nowrap">
                  <div className="font-medium">{module.label}</div>
                  {hasAlerts && (
                    <div className="text-xs text-error mt-0.5">{module.alertCount} alerts</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* Status Indicator */}
      <div className="p-3 border-t border-border">
        <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-1.5 h-1.5 bg-success rounded-full" />
          {!isCollapsed && (
            <span className="text-xs text-success">Online</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SecuritySidebar;