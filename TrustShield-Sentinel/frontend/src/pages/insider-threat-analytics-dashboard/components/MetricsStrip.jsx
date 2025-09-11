import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsStrip = ({ 
  metrics = {},
  className = '' 
}) => {
  const defaultMetrics = {
    highRiskUsers: { value: 12, trend: 8.5, trendDirection: 'up' },
    anomalyDetectionRate: { value: 94.2, trend: 2.1, trendDirection: 'up' },
    investigationQueue: { value: 8, trend: -15.3, trendDirection: 'down' },
    baselineAccuracy: { value: 97.8, trend: 0.8, trendDirection: 'up' }
  };

  const finalMetrics = { ...defaultMetrics, ...metrics };

  const metricCards = [
    {
      key: 'highRiskUsers',
      title: 'High-Risk Users',
      icon: 'Users',
      iconColor: 'text-error',
      bgColor: 'bg-error/10',
      suffix: '',
      description: 'Users requiring immediate attention'
    },
    {
      key: 'anomalyDetectionRate',
      title: 'Detection Rate',
      icon: 'Target',
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      suffix: '%',
      description: 'Anomaly detection accuracy'
    },
    {
      key: 'investigationQueue',
      title: 'Investigation Queue',
      icon: 'Search',
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      suffix: '',
      description: 'Pending investigations'
    },
    {
      key: 'baselineAccuracy',
      title: 'Baseline Accuracy',
      icon: 'TrendingUp',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      suffix: '%',
      description: 'Behavioral baseline precision'
    }
  ];

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return 'TrendingUp';
      case 'down':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getTrendColor = (direction, isPositive = true) => {
    if (direction === 'up') {
      return isPositive ? 'text-success' : 'text-error';
    } else if (direction === 'down') {
      return isPositive ? 'text-error' : 'text-success';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metricCards?.map((card) => {
        const metric = finalMetrics?.[card?.key];
        const isPositiveTrend = card?.key === 'investigationQueue' ? metric?.trendDirection === 'down' : metric?.trendDirection === 'up';
        
        return (
          <div
            key={card?.key}
            className="bg-card rounded-lg border border-border p-4 security-transition hover:shadow-security"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card?.bgColor}`}>
                <Icon name={card?.icon} size={20} className={card?.iconColor} />
              </div>
              <div className="flex items-center space-x-1">
                <Icon 
                  name={getTrendIcon(metric?.trendDirection)} 
                  size={14} 
                  className={getTrendColor(metric?.trendDirection, isPositiveTrend)}
                />
                <span className={`text-xs font-medium ${getTrendColor(metric?.trendDirection, isPositiveTrend)}`}>
                  {Math.abs(metric?.trend)}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground">{card?.title}</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-foreground">
                  {metric?.value?.toLocaleString()}
                </span>
                {card?.suffix && (
                  <span className="text-sm text-muted-foreground">{card?.suffix}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-tight">{card?.description}</p>
            </div>
            {/* Simplified Mini Sparkline */}
            <div className="mt-3 h-6 flex items-end space-x-1">
              {[...Array(8)]?.map((_, index) => {
                const height = Math.random() * 100;
                return (
                  <div
                    key={index}
                    className={`flex-1 ${card?.iconColor?.replace('text-', 'bg-')} opacity-60 rounded-sm`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsStrip;