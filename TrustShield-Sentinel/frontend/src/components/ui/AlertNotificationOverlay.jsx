import React, { useState, useEffect } from "react";
import Icon from "../AppIcon";
import Button from "./Button";
import { respondToAlert, unmaskAlert } from "../../utils/api";

const AlertNotificationOverlay = ({
  alerts = [],
  onAlertClick,
  onAlertDismiss,
  severityThresholds = {
    critical: 1,
    high: 3,
    medium: 5,
  },
  maxVisible = 3,
  autoHideDelay = 5000,
  className = "",
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    // Filter and sort alerts by severity and timestamp
    const filteredAlerts = alerts
      ?.filter((alert) => !dismissedAlerts.has(alert.id))
      ?.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const severityDiff =
          severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      ?.slice(0, maxVisible);

    setVisibleAlerts(filteredAlerts);
  }, [alerts, dismissedAlerts, maxVisible]);

  useEffect(() => {
    // Auto-hide non-critical alerts
    const timers = visibleAlerts
      ?.filter(
        (alert) => alert?.severity !== "critical" && alert?.autoHide !== false
      )
      ?.map((alert) =>
        setTimeout(() => {
          handleDismiss(alert.id);
        }, autoHideDelay)
      );

    return () => {
      timers?.forEach((timer) => clearTimeout(timer));
    };
  }, [visibleAlerts, autoHideDelay]);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "critical":
        return {
          bgColor: "bg-error/90",
          borderColor: "border-error",
          textColor: "text-error-foreground",
          icon: "AlertTriangle",
          iconClass: "text-error-foreground threat-pulse",
        };
      case "high":
        return {
          bgColor: "bg-warning/90",
          borderColor: "border-warning",
          textColor: "text-error-foreground",
          icon: "AlertCircle",
          iconClass: "text-error-foreground",
        };
      case "medium":
        return {
          bgColor: "bg-card/95",
          borderColor: "border-border",
          textColor: "text-card-foreground",
          icon: "Info",
          iconClass: "text-primary",
        };
      case "low":
        return {
          bgColor: "bg-muted/90",
          borderColor: "border-border",
          textColor: "text-muted-foreground",
          icon: "Bell",
          iconClass: "text-muted-foreground",
        };
      default:
        return {
          bgColor: "bg-card/95",
          borderColor: "border-border",
          textColor: "text-card-foreground",
          icon: "Bell",
          iconClass: "text-muted-foreground",
        };
    }
  };

  const handleAlertClick = (alert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    }
    handleDismiss(alert.id);
  };

  const handleDismiss = (alertId) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
    if (onAlertDismiss) {
      onAlertDismiss(alertId);
    }
  };

  const handleResponse = async (alertId, response) => {
    try {
      await respondToAlert(alertId, response);
      handleDismiss(alertId); // optimistically remove
    } catch (err) {
      console.error(`Failed to respond (${response}):`, err);
    }
  };

  const handleUnmask = async (alertId) => {
    try {
      const updated = await unmaskAlert(alertId);
      if (updated?.alert?.unmasked) {
        // update visibleAlerts with unmasked data
        setVisibleAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId ? { ...a, unmasked: updated.alert.unmasked } : a
          )
        );
      }
    } catch (err) {
      console.error("Failed to unmask alert:", err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date?.toLocaleDateString();
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-300 space-y-3 ${className}`}
      role="alert"
      aria-live="polite"
      aria-label="Security alerts"
    >
      {visibleAlerts.map((alert, index) => {
        const config = getSeverityConfig(alert.severity);

        return (
          <div
            key={alert.id}
            className={`
              w-80 p-4 rounded-lg border backdrop-blur-sm
              ${config.bgColor} ${config.borderColor}
              shadow-security animate-slide-in
              security-transition hover:scale-105
            `}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="flex items-start space-x-3">
              <Icon name={config.icon} size={20} className={config.iconClass} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className={`text-sm font-semibold ${config.textColor} truncate`}
                  >
                    {alert.title}
                  </h4>
                  <span
                    className={`text-xs ${config.textColor} opacity-75 ml-2 flex-shrink-0`}
                  >
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>

                {/* Employee Identity */}
                {alert?.unmasked ? (
                  <p className={`text-xs font-medium ${config.textColor} mb-1`}>
                    Employee: {alert.unmasked.name} ({alert.unmasked.id})
                  </p>
                ) : (
                  <p className={`text-xs font-medium ${config.textColor} mb-1`}>
                    Employee: Employee-{alert.employeeHash}
                  </p>
                )}

                <p
                  className={`text-sm ${config.textColor} opacity-90 mb-3 line-clamp-2`}
                >
                  {alert.message}
                </p>

                {alert.metadata && (
                  <div className="flex items-center space-x-4 text-xs opacity-75 mb-3">
                    {alert.metadata.source && (
                      <span className={config.textColor}>
                        Source: {alert.metadata.source}
                      </span>
                    )}
                    {alert.metadata.affectedSystems && (
                      <span className={config.textColor}>
                        Systems: {alert.metadata.affectedSystems}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="success"
                      size="xs"
                      onClick={() => handleResponse(alert.id, "yes")}
                      className="h-6 px-2 text-xs"
                    >
                      Yes
                    </Button>

                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleResponse(alert.id, "no")}
                      className="h-6 px-2 text-xs"
                    >
                      No
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleResponse(alert.id, "need_help")}
                      className="h-6 px-2 text-xs"
                    >
                      Need Help
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleUnmask(alert.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Reveal Identity
                    </Button>
                  </div>

                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className={`p-1 rounded-md hover:bg-black/20 security-transition ${config.textColor}`}
                    aria-label="Dismiss alert"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Alert Counter */}
      {alerts.length > maxVisible && (
        <div className="w-80 p-3 bg-muted/90 border border-border rounded-lg backdrop-blur-sm text-center">
          <span className="text-sm text-muted-foreground">
            +{alerts.length - maxVisible} more alerts
          </span>
        </div>
      )}
    </div>
  );
};

export default AlertNotificationOverlay;
