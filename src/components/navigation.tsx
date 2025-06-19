import React from 'react';
import { 
  Home, 
  Plus, 
  Ticket, 
  BarChart3, 
  Users, 
  Settings, 
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['super_admin', 'org_admin', 'it_support', 'soc_analyst', 'end_user'] },
    { id: 'create-ticket', label: 'Create Ticket', icon: Plus, roles: ['super_admin', 'org_admin', 'it_support', 'soc_analyst', 'end_user'] },
    { id: 'tickets', label: 'My Tickets', icon: Ticket, roles: ['super_admin', 'org_admin', 'it_support', 'soc_analyst', 'end_user'] },
    { id: 'all-tickets', label: 'All Tickets', icon: AlertTriangle, roles: ['super_admin', 'org_admin', 'it_support', 'soc_analyst'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['super_admin', 'org_admin', 'it_support', 'soc_analyst'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['super_admin', 'org_admin'] },
    { id: 'organizations', label: 'Organizations', icon: Shield, roles: ['super_admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'org_admin', 'it_support', 'soc_analyst', 'end_user'] }
  ];

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
