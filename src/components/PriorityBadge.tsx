import React from 'react';
import { ChevronDown, AlertCircle, AlertTriangle } from 'lucide-react';

type PriorityBadgeProps = {
  priority: 'low' | 'medium' | 'high' | 'critical';
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const priorityConfig = {
    low: {
      icon: <ChevronDown className="w-3 h-3" />,
      color: 'bg-green-100 text-green-800',
      label: 'Low'
    },
    medium: {
      icon: <AlertCircle className="w-3 h-3" />,
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Medium'
    },
    high: {
      icon: <AlertTriangle className="w-3 h-3" />,
      color: 'bg-orange-100 text-orange-800',
      label: 'High'
    },
    critical: {
      icon: <AlertTriangle className="w-3 h-3" />,
      color: 'bg-red-100 text-red-800',
      label: 'Critical'
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[priority].color}`}>
      {priorityConfig[priority].icon}
      <span className="ml-1">{priorityConfig[priority].label}</span>
    </span>
  );
};

export default PriorityBadge;
