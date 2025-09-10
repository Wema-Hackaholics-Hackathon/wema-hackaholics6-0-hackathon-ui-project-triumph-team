import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const DashboardFilters = ({ 
  onFiltersChange,
  initialFilters = {},
  className = '' 
}) => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    department: 'all',
    riskScoreMin: 0,
    riskScoreMax: 100,
    timeWindow: 7,
    anomalyType: 'all',
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'legal', label: 'Legal' },
    { value: 'executive', label: 'Executive' }
  ];

  const timeWindowOptions = [
    { value: 1, label: 'Last 24 Hours' },
    { value: 3, label: 'Last 3 Days' },
    { value: 7, label: 'Last 7 Days' },
    { value: 14, label: 'Last 14 Days' },
    { value: 30, label: 'Last 30 Days' },
    { value: 90, label: 'Last 90 Days' }
  ];

  const anomalyTypeOptions = [
    { value: 'all', label: 'All Anomalies' },
    { value: 'data_access', label: 'Data Access' },
    { value: 'login_pattern', label: 'Login Patterns' },
    { value: 'file_transfer', label: 'File Transfers' },
    { value: 'api_usage', label: 'API Usage' },
    { value: 'privilege_escalation', label: 'Privilege Changes' },
    { value: 'behavioral', label: 'Behavioral' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleRiskScoreChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    const newFilters = { ...filters, [type]: numValue };
    setFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      searchQuery: '',
      department: 'all',
      riskScoreMin: 0,
      riskScoreMax: 100,
      timeWindow: 7,
      anomalyType: 'all'
    };
    setFilters(resetFilters);
    
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.searchQuery) count++;
    if (filters?.department !== 'all') count++;
    if (filters?.riskScoreMin > 0 || filters?.riskScoreMax < 100) count++;
    if (filters?.timeWindow !== 7) count++;
    if (filters?.anomalyType !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      <div className="p-4">
        {/* Simplified Primary Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Input
              type="search"
              placeholder="Search users..."
              value={filters?.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
              className="pl-8 h-9"
            />
            <Icon 
              name="Search" 
              size={14} 
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
          </div>

          <Select
            placeholder="Department"
            options={departmentOptions}
            value={filters?.department}
            onChange={(value) => handleFilterChange('department', value)}
            className="min-w-36"
          />

          <Select
            placeholder="Time period"
            options={timeWindowOptions}
            value={filters?.timeWindow}
            onChange={(value) => handleFilterChange('timeWindow', value)}
            className="min-w-32"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            More
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Simplified Advanced Filters */}
        {isExpanded && (
          <div className="border-t border-border pt-3 mt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Anomaly Type"
                placeholder="Select type"
                options={anomalyTypeOptions}
                value={filters?.anomalyType}
                onChange={(value) => handleFilterChange('anomalyType', value)}
              />

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Risk Score Range
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={filters?.riskScoreMin}
                    onChange={(e) => handleRiskScoreChange('riskScoreMin', e?.target?.value)}
                    className="w-16 h-8 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={filters?.riskScoreMax}
                    onChange={(e) => handleRiskScoreChange('riskScoreMax', e?.target?.value)}
                    className="w-16 h-8 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    iconName="RotateCcw"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Simplified Risk Score Slider */}
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Range: {filters?.riskScoreMin}-{filters?.riskScoreMax}</span>
              <span>0=Low, 100=Critical</span>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full">
              <div 
                className="absolute h-full bg-primary rounded-full"
                style={{
                  left: `${filters?.riskScoreMin}%`,
                  width: `${filters?.riskScoreMax - filters?.riskScoreMin}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Compact Active Filters Summary */}
        {activeFilterCount > 0 && !isExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                iconName="X"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;