import React from 'react';
import { 
  Circle, CheckCircle, Pause, Archive, AlertTriangle 
} from 'lucide-react';

type StatusBadgeProps = {
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    open: {
      icon: <Circle className="w-3 h-3" />,
      color: 'bg-gray-100 text-gray-800',
      label: 'Open'
    },
    in_progress: {
      icon: <CheckCircle className="w-3 h-3" />,
      color: 'bg-blue-100 text-blue-800',
      label: 'In Progress'
    },
    on_hold: {
      icon: <Pause className="w-3 h-3" />,
      color: 'bg-yellow-100 text-yellow-800',
      label: 'On Hold'
    },
    resolved: {
      icon: <CheckCircle className="w-3 h-3" />,
      color: 'bg-green-100 text-green-800',
      label: 'Resolved'
    },
    closed: {
      icon: <Archive className="w-3 h-3" />,
      color: 'bg-purple-100 text-purple-800',
      label: 'Closed'
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
      {statusConfig[status].icon}
      <span className="ml-1">{statusConfig[status].label}</span>
    </span>
  );
};

export default StatusBadge;
