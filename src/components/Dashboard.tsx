import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Shield,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockDashboardStats } from '../data/mockData';
import { Ticket as TicketType } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [stats, setStats] = useState(mockDashboardStats);

  // Load tickets from localStorage and update stats
  useEffect(() => {
    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) {
      const parsedTickets = JSON.parse(storedTickets).map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        slaDeadline: new Date(ticket.slaDeadline),
        resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined
      }));
      
      setTickets(parsedTickets);
      
      // Update stats based on actual tickets
      const openTickets = parsedTickets.filter((t: TicketType) => t.status === 'open').length;
      const inProgressTickets = parsedTickets.filter((t: TicketType) => t.status === 'in_progress').length;
      const resolvedTickets = parsedTickets.filter((t: TicketType) => t.status === 'resolved' || t.status === 'closed').length;
      const slaBreaches = parsedTickets.filter((t: TicketType) => new Date() > t.slaDeadline && t.status !== 'resolved' && t.status !== 'closed').length;
      
      // Calculate category breakdown
      const ticketsByCategory: Record<string, number> = {};
      parsedTickets.forEach((ticket: TicketType) => {
        ticketsByCategory[ticket.category] = (ticketsByCategory[ticket.category] || 0) + 1;
      });
      
      // Calculate priority breakdown
      const ticketsByPriority: Record<string, number> = {};
      parsedTickets.forEach((ticket: TicketType) => {
        ticketsByPriority[ticket.priority] = (ticketsByPriority[ticket.priority] || 0) + 1;
      });
      
      setStats(prev => ({
        ...prev,
        totalTickets: parsedTickets.length,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        slaBreaches,
        ticketsByCategory: { ...prev.ticketsByCategory, ...ticketsByCategory },
        ticketsByPriority: { ...prev.ticketsByPriority, ...ticketsByPriority },
        recentTickets: parsedTickets.slice(-5).reverse() // Show 5 most recent tickets
      }));
    }
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[priority as keyof typeof colors]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.email}
            </h1>
            <p className="text-blue-100 text-lg">
              {user?.organizationName} • {user?.role === 'super_admin' ? 'Super Administrator' : 
               user?.role === 'org_admin' ? 'Organization Admin' :
               user?.role === 'it_support' ? 'IT Support' :
               user?.role === 'soc_analyst' ? 'SOC Analyst' : 'End User'}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={stats.totalTickets}
          icon={<Ticket className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
          trend="+12% from last month"
        />
        <StatCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
        />
        <StatCard
          title="SLA Breaches"
          value={stats.slaBreaches}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="bg-red-100"
        />
        <StatCard
          title="Resolved Today"
          value={stats.resolvedTickets}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          trend="+8% efficiency"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {stats.recentTickets.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {ticket.ticketNumber}
                        </span>
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                      <p className="text-sm text-gray-600">
                        {ticket.organizationName} • {ticket.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tickets created yet</p>
                <p className="text-sm text-gray-400">Create your first ticket to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Top Categories
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.ticketsByCategory)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              {Object.keys(stats.ticketsByCategory).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
