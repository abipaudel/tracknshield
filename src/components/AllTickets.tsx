import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  Building, 
  Calendar, 
  ArrowUpDown, 
  MoreHorizontal,
  FileText,
  Send,
  Paperclip,
  X,
  Save,
  UserPlus,
  Flag,
  Archive,
  RefreshCw,
  Download,
  Mail,
  Phone,
  MapPin,
  Tag,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockOrganizations, mockUsers } from '../data/mockData';
import { Ticket as TicketType, TicketStatus, TicketPriority, TicketCategory, User as UserType } from '../types';

const AllTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority' | 'sla'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [viewingTicket, setViewingTicket] = useState<TicketType | null>(null);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Load tickets from localStorage
  useEffect(() => {
    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) {
      const parsedTickets = JSON.parse(storedTickets).map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        slaDeadline: new Date(ticket.slaDeadline),
        resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined,
        internalNotes: ticket.internalNotes?.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        })) || []
      }));
      setTickets(parsedTickets);
    }
  }, []);

  // Filter and sort tickets
  useEffect(() => {
    let filtered = tickets.filter(ticket => {
      // Permission check
      const hasPermission = user?.role === 'super_admin' || 
                           (user?.role === 'org_admin' && ticket.organizationId === user.organizationId) ||
                           ((user?.role === 'it_support' || user?.role === 'soc_analyst') && ticket.organizationId === user.organizationId);
      
      if (!hasPermission) return false;

      // Search filter
      const matchesSearch = !searchTerm || 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.submitterEmail.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = !filterStatus || ticket.status === filterStatus;
      
      // Priority filter
      const matchesPriority = !filterPriority || ticket.priority === filterPriority;
      
      // Category filter
      const matchesCategory = !filterCategory || ticket.category === filterCategory;
      
      // Organization filter
      const matchesOrg = !filterOrg || ticket.organizationId === filterOrg;
      
      // Assignee filter
      const matchesAssignee = !filterAssignee || 
        (filterAssignee === 'unassigned' && !ticket.assignedTo) ||
        (filterAssignee === 'me' && ticket.assignedToEmail === user?.email) ||
        ticket.assignedToEmail === filterAssignee;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesOrg && matchesAssignee;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'sla':
          comparison = a.slaDeadline.getTime() - b.slaDeadline.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filterStatus, filterPriority, filterCategory, filterOrg, filterAssignee, sortBy, sortOrder, user]);

  const statuses = [
    { id: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
    { id: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    { id: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { id: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: Archive },
    { id: 'escalated', label: 'Escalated', color: 'bg-red-100 text-red-800', icon: Flag }
  ];

  const priorities = [
    { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' }
  ];

  const categories = [
    { id: 'hardware', label: 'Hardware', icon: '🖥️' },
    { id: 'software', label: 'Software', icon: '💻' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'accounts', label: 'Accounts', icon: '👤' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'phishing', label: 'Phishing', icon: '🎣' },
    { id: 'malware', label: 'Malware', icon: '🦠' },
    { id: 'suspicious_login', label: 'Suspicious Login', icon: '🔐' },
    { id: 'siem_alert', label: 'SIEM Alert', icon: '🚨' },
    { id: 'vulnerability', label: 'Vulnerability', icon: '🛡️' },
    { id: 'incident_response', label: 'Incident Response', icon: '🚑' },
    { id: 'compliance', label: 'Compliance', icon: '📋' }
  ];

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus, 
            updatedAt: new Date(),
            resolvedAt: newStatus === 'resolved' || newStatus === 'closed' ? new Date() : undefined
          }
        : ticket
    ));
    
    // Update localStorage
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus, 
            updatedAt: new Date(),
            resolvedAt: newStatus === 'resolved' || newStatus === 'closed' ? new Date() : undefined
          }
        : ticket
    );
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  };

  const updateTicketPriority = (ticketId: string, newPriority: TicketPriority) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, priority: newPriority, updatedAt: new Date() }
        : ticket
    ));
    
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, priority: newPriority, updatedAt: new Date() }
        : ticket
    );
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  };

  const assignTicket = (ticketId: string, assigneeEmail: string) => {
    const assignee = mockUsers.find(u => u.email === assigneeEmail);
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            assignedTo: assignee?.id,
            assignedToEmail: assigneeEmail,
            updatedAt: new Date()
          }
        : ticket
    ));
    
    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            assignedTo: assignee?.id,
            assignedToEmail: assigneeEmail,
            updatedAt: new Date()
          }
        : ticket
    );
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  };

  const addComment = async (ticketId: string, comment: string, isInternal: boolean = false) => {
    if (!comment.trim()) return;

    setIsAddingComment(true);
    
    const newNote = {
      id: Date.now().toString(),
      content: comment,
      authorId: user?.id || '',
      authorEmail: user?.email || '',
      createdAt: new Date(),
      isInternal
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            internalNotes: [...ticket.internalNotes, newNote],
            updatedAt: new Date()
          }
        : ticket
    ));

    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            internalNotes: [...ticket.internalNotes, newNote],
            updatedAt: new Date()
          }
        : ticket
    );
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    setNewComment('');
    setIsAddingComment(false);
  };

  const bulkUpdateStatus = (status: TicketStatus) => {
    selectedTickets.forEach(ticketId => {
      updateTicketStatus(ticketId, status);
    });
    setSelectedTickets([]);
    setShowBulkActions(false);
  };

  const bulkAssign = (assigneeEmail: string) => {
    selectedTickets.forEach(ticketId => {
      assignTicket(ticketId, assigneeEmail);
    });
    setSelectedTickets([]);
    setShowBulkActions(false);
  };

  const exportTickets = () => {
    const csvContent = [
      ['Ticket Number', 'Title', 'Status', 'Priority', 'Category', 'Organization', 'Assignee', 'Created', 'SLA Deadline'].join(','),
      ...filteredTickets.map(ticket => [
        ticket.ticketNumber,
        `"${ticket.title}"`,
        ticket.status,
        ticket.priority,
        ticket.category,
        ticket.organizationName,
        ticket.assignedToEmail || 'Unassigned',
        ticket.createdAt.toLocaleDateString(),
        ticket.slaDeadline.toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: TicketStatus) => {
    return statuses.find(s => s.id === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: TicketPriority) => {
    return priorities.find(p => p.id === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: TicketCategory) => {
    return categories.find(c => c.id === category)?.icon || '📋';
  };

  const isOverdue = (ticket: TicketType) => {
    return new Date() > ticket.slaDeadline && ticket.status !== 'resolved' && ticket.status !== 'closed';
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return `Overdue by ${Math.abs(hours)}h ${Math.abs(minutes)}m`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const PriorityBadge: React.FC<{ priority: TicketPriority; onClick?: () => void }> = ({ priority, onClick }) => (
    <span 
      className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 ${getPriorityColor(priority)}`}
      onClick={onClick}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );

  const StatusBadge: React.FC<{ status: TicketStatus; onClick?: () => void }> = ({ status, onClick }) => {
    const statusInfo = statuses.find(s => s.id === status);
    const Icon = statusInfo?.icon || Clock;
    
    return (
      <span 
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 cursor-pointer hover:opacity-80 ${getStatusColor(status)}`}
        onClick={onClick}
      >
        <Icon className="w-3 h-3" />
        <span>{statusInfo?.label || status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Ticket className="w-8 h-8 mr-3 text-blue-600" />
            All Tickets
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all support tickets across organizations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportTickets}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.id} value={priority.id}>{priority.label}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>

          {user?.role === 'super_admin' && (
            <select
              value={filterOrg}
              onChange={(e) => setFilterOrg(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Organizations</option>
              {mockOrganizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            <option value="me">Assigned to Me</option>
            {mockUsers.filter(u => u.role === 'it_support' || u.role === 'soc_analyst').map(user => (
              <option key={user.id} value={user.email}>{user.email}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created">Created Date</option>
                <option value="updated">Last Updated</option>
                <option value="priority">Priority</option>
                <option value="sla">SLA Deadline</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            
            {selectedTickets.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Bulk Actions ({selectedTickets.length})
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {filteredTickets.length} tickets found
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedTickets.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">Bulk Actions:</span>
              <div className="flex items-center space-x-2">
                <select
                  onChange={(e) => e.target.value && bulkUpdateStatus(e.target.value as TicketStatus)}
                  className="px-2 py-1 border border-blue-300 rounded text-sm"
                  defaultValue=""
                >
                  <option value="">Change Status</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
                <select
                  onChange={(e) => e.target.value && bulkAssign(e.target.value)}
                  className="px-2 py-1 border border-blue-300 rounded text-sm"
                  defaultValue=""
                >
                  <option value="">Assign To</option>
                  {mockUsers.filter(u => u.role === 'it_support' || u.role === 'soc_analyst').map(user => (
                    <option key={user.id} value={user.email}>{user.email}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setSelectedTickets([]);
                    setShowBulkActions(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tickets Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTickets(filteredTickets.map(t => t.id));
                        } else {
                          setSelectedTickets([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTickets([...selectedTickets, ticket.id]);
                          } else {
                            setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{getCategoryIcon(ticket.category)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">{ticket.title}</div>
                          <div className="text-xs text-gray-500">
                            Created {ticket.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        status={ticket.status} 
                        onClick={() => {
                          const nextStatus = ticket.status === 'open' ? 'in_progress' : 
                                           ticket.status === 'in_progress' ? 'resolved' : 'open';
                          updateTicketStatus(ticket.id, nextStatus);
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge 
                        priority={ticket.priority}
                        onClick={() => {
                          const priorities: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
                          const currentIndex = priorities.indexOf(ticket.priority);
                          const nextPriority = priorities[(currentIndex + 1) % priorities.length];
                          updateTicketPriority(ticket.id, nextPriority);
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">
                        {ticket.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{ticket.organizationName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.assignedToEmail ? (
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{ticket.assignedToEmail}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const assignee = prompt('Enter assignee email:');
                            if (assignee) assignTicket(ticket.id, assignee);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Assign
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-xs ${isOverdue(ticket) ? 'text-red-600' : 'text-gray-600'}`}>
                        {getTimeRemaining(ticket.slaDeadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setViewingTicket(ticket)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTicket(ticket)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Edit Ticket"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(ticket.category)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.ticketNumber}</h3>
                    <p className="text-sm text-gray-600">{ticket.title}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedTickets.includes(ticket.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTickets([...selectedTickets, ticket.id]);
                    } else {
                      setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Organization:</span>
                  <span className="text-sm font-medium">{ticket.organizationName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assignee:</span>
                  <span className="text-sm font-medium">{ticket.assignedToEmail || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SLA:</span>
                  <span className={`text-sm ${isOverdue(ticket) ? 'text-red-600' : 'text-gray-600'}`}>
                    {getTimeRemaining(ticket.slaDeadline)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewingTicket(ticket)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTicket(ticket)}
                    className="text-green-600 hover:text-green-900 p-1 rounded"
                    title="Edit Ticket"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {ticket.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Ticket Details Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getCategoryIcon(viewingTicket.category)}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{viewingTicket.ticketNumber}</h3>
                    <p className="text-gray-600">{viewingTicket.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Ticket Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <StatusBadge status={viewingTicket.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <PriorityBadge priority={viewingTicket.priority} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{viewingTicket.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium">{viewingTicket.organizationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{viewingTicket.department}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Assignment & Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted by:</span>
                      <span className="font-medium">{viewingTicket.submitterEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned to:</span>
                      <span className="font-medium">{viewingTicket.assignedToEmail || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{viewingTicket.createdAt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{viewingTicket.updatedAt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SLA Deadline:</span>
                      <span className={`font-medium ${isOverdue(viewingTicket) ? 'text-red-600' : ''}`}>
                        {viewingTicket.slaDeadline.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingTicket.description}</p>
                </div>
              </div>

              {/* Comments/Notes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Comments & Notes</h4>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {viewingTicket.internalNotes.map((note) => (
                    <div key={note.id} className={`p-4 rounded-lg ${note.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{note.authorEmail}</span>
                          {note.isInternal && (
                            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">Internal</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{note.createdAt.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-4 space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => addComment(viewingTicket.id, newComment, false)}
                        disabled={!newComment.trim() || isAddingComment}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Add Comment</span>
                      </button>
                      <button
                        onClick={() => addComment(viewingTicket.id, newComment, true)}
                        disabled={!newComment.trim() || isAddingComment}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Internal Note</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => (
                    <button
                      key={status.id}
                      onClick={() => updateTicketStatus(viewingTicket.id, status.id as TicketStatus)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        viewingTicket.status === status.id 
                          ? status.color 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTickets;
