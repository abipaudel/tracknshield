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
  Flag,
  Archive,
  RefreshCw,
  Download,
  Mail,
  Phone,
  MapPin,
  Tag,
  Activity,
  Star,
  StarOff,
  Bell,
  BellOff,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockOrganizations, mockUsers } from '../data/mockData';
import { Ticket as TicketType, TicketStatus, TicketPriority, TicketCategory, User as UserType } from '../types';

const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority' | 'sla'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [viewingTicket, setViewingTicket] = useState<TicketType | null>(null);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [favoriteTickets, setFavoriteTickets] = useState<string[]>([]);
  const [watchedTickets, setWatchedTickets] = useState<string[]>([]);
  const [showClosedTickets, setShowClosedTickets] = useState(false);

  // Load tickets and user preferences from localStorage
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

    // Load user preferences
    const storedFavorites = localStorage.getItem(`favorites_${user?.id}`);
    if (storedFavorites) {
      setFavoriteTickets(JSON.parse(storedFavorites));
    }

    const storedWatched = localStorage.getItem(`watched_${user?.id}`);
    if (storedWatched) {
      setWatchedTickets(JSON.parse(storedWatched));
    }
  }, [user?.id]);

  // Filter tickets to show only user's tickets
  useEffect(() => {
    let filtered = tickets.filter(ticket => {
      // Show tickets submitted by user or assigned to user
      const isMyTicket = ticket.submitterEmail === user?.email || 
                        ticket.assignedToEmail === user?.email;
      
      if (!isMyTicket) return false;

      // Hide closed/resolved tickets unless explicitly shown
      if (!showClosedTickets && (ticket.status === 'closed' || ticket.status === 'resolved')) {
        return false;
      }

      // Search filter
      const matchesSearch = !searchTerm || 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = !filterStatus || ticket.status === filterStatus;
      
      // Priority filter
      const matchesPriority = !filterPriority || ticket.priority === filterPriority;
      
      // Category filter
      const matchesCategory = !filterCategory || ticket.category === filterCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
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
  }, [tickets, searchTerm, filterStatus, filterPriority, filterCategory, sortBy, sortOrder, user, showClosedTickets]);

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

  const toggleFavorite = (ticketId: string) => {
    const newFavorites = favoriteTickets.includes(ticketId)
      ? favoriteTickets.filter(id => id !== ticketId)
      : [...favoriteTickets, ticketId];
    
    setFavoriteTickets(newFavorites);
    localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavorites));
  };

  const toggleWatch = (ticketId: string) => {
    const newWatched = watchedTickets.includes(ticketId)
      ? watchedTickets.filter(id => id !== ticketId)
      : [...watchedTickets, ticketId];
    
    setWatchedTickets(newWatched);
    localStorage.setItem(`watched_${user?.id}`, JSON.stringify(newWatched));
  };

  const deleteTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      const updatedTickets = tickets.filter(t => t.id !== ticketId);
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    }
  };

  const exportMyTickets = () => {
    const csvContent = [
      ['Ticket Number', 'Title', 'Status', 'Priority', 'Category', 'Created', 'SLA Deadline', 'Role'].join(','),
      ...filteredTickets.map(ticket => [
        ticket.ticketNumber,
        `"${ticket.title}"`,
        ticket.status,
        ticket.priority,
        ticket.category,
        ticket.createdAt.toLocaleDateString(),
        ticket.slaDeadline.toLocaleDateString(),
        ticket.submitterEmail === user?.email ? 'Submitter' : 'Assignee'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-tickets-${new Date().toISOString().split('T')[0]}.csv`;
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

  const getTicketStats = () => {
    const myTickets = tickets.filter(t => 
      t.submitterEmail === user?.email || t.assignedToEmail === user?.email
    );
    
    return {
      total: myTickets.length,
      open: myTickets.filter(t => t.status === 'open').length,
      inProgress: myTickets.filter(t => t.status === 'in_progress').length,
      pending: myTickets.filter(t => t.status === 'pending').length,
      resolved: myTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      overdue: myTickets.filter(t => isOverdue(t)).length,
      favorites: favoriteTickets.length,
      watched: watchedTickets.length
    };
  };

  const stats = getTicketStats();

  const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );

  const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const statusInfo = statuses.find(s => s.id === status);
    const Icon = statusInfo?.icon || Clock;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(status)}`}>
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
            <User className="w-8 h-8 mr-3 text-blue-600" />
            My Tickets
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your submitted and assigned support tickets
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportMyTickets}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          <div className="text-sm text-gray-600">Open</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.favorites}</div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-indigo-600">{stats.watched}</div>
          <div className="text-sm text-gray-600">Watched</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search my tickets..."
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showClosed"
              checked={showClosedTickets}
              onChange={(e) => setShowClosedTickets(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showClosed" className="text-sm text-gray-700">
              Show closed tickets
            </label>
          </div>
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
          </div>

          <div className="text-sm text-gray-600">
            {filteredTickets.length} tickets found
          </div>
        </div>
      </div>

      {/* Tickets Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
              isOverdue(ticket) ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(ticket.category)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.ticketNumber}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toggleFavorite(ticket.id)}
                    className={`p-1 rounded ${favoriteTickets.includes(ticket.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  >
                    {favoriteTickets.includes(ticket.id) ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleWatch(ticket.id)}
                    className={`p-1 rounded ${watchedTickets.includes(ticket.id) ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                  >
                    {watchedTickets.includes(ticket.id) ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4" />}
                  </button>
                </div>
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
                  <span className="text-sm text-gray-600">Role:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    ticket.submitterEmail === user?.email 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.submitterEmail === user?.email ? 'Submitter' : 'Assignee'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SLA:</span>
                  <span className={`text-sm ${isOverdue(ticket) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {getTimeRemaining(ticket.slaDeadline)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Comments:</span>
                  <span className="text-sm font-medium">{ticket.internalNotes.length}</span>
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
                  {ticket.submitterEmail === user?.email && (
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {ticket.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className={`hover:bg-gray-50 ${isOverdue(ticket) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{getCategoryIcon(ticket.category)}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</span>
                            {favoriteTickets.includes(ticket.id) && (
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            )}
                            {watchedTickets.includes(ticket.id) && (
                              <Bell className="w-3 h-3 text-blue-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">{ticket.title}</div>
                          <div className="text-xs text-gray-500">
                            Created {ticket.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">
                        {ticket.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        ticket.submitterEmail === user?.email 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.submitterEmail === user?.email ? 'Submitter' : 'Assignee'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-xs ${isOverdue(ticket) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {getTimeRemaining(ticket.slaDeadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{ticket.internalNotes.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleFavorite(ticket.id)}
                          className={`p-1 rounded ${favoriteTickets.includes(ticket.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                          title="Toggle Favorite"
                        >
                          {favoriteTickets.includes(ticket.id) ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleWatch(ticket.id)}
                          className={`p-1 rounded ${watchedTickets.includes(ticket.id) ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                          title="Toggle Watch"
                        >
                          {watchedTickets.includes(ticket.id) ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4" />}
                        </button>
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
                        {ticket.submitterEmail === user?.email && (
                          <button
                            onClick={() => deleteTicket(ticket.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500 mb-4">
            {tickets.filter(t => t.submitterEmail === user?.email || t.assignedToEmail === user?.email).length === 0
              ? "You haven't submitted or been assigned any tickets yet."
              : "Try adjusting your filters or search terms."}
          </p>
          <button
            onClick={() => window.location.hash = '#create-ticket'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Create Your First Ticket
          </button>
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(viewingTicket.id)}
                    className={`p-2 rounded ${favoriteTickets.includes(viewingTicket.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  >
                    {favoriteTickets.includes(viewingTicket.id) ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => toggleWatch(viewingTicket.id)}
                    className={`p-2 rounded ${watchedTickets.includes(viewingTicket.id) ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                  >
                    {watchedTickets.includes(viewingTicket.id) ? <Bell className="w-5 h-5 fill-current" /> : <BellOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setViewingTicket(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">My Role:</span>
                      <span className={`font-medium px-2 py-1 rounded-full text-sm ${
                        viewingTicket.submitterEmail === user?.email 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {viewingTicket.submitterEmail === user?.email ? 'Submitter' : 'Assignee'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Timeline & SLA</h4>
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Remaining:</span>
                      <span className={`font-medium ${isOverdue(viewingTicket) ? 'text-red-600' : 'text-green-600'}`}>
                        {getTimeRemaining(viewingTicket.slaDeadline)}
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
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Comments & Updates</h4>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {viewingTicket.internalNotes.map((note) => (
                    <div key={note.id} className={`p-4 rounded-lg ${note.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{note.authorEmail}</span>
                          {note.isInternal && (
                            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">Internal</span>
                          )}
                          {note.authorEmail === user?.email && (
                            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">You</span>
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
                    placeholder="Add a comment or update..."
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
                      {(user?.role === 'it_support' || user?.role === 'soc_analyst' || user?.role === 'org_admin' || user?.role === 'super_admin') && (
                        <button
                          onClick={() => addComment(viewingTicket.id, newComment, true)}
                          disabled={!newComment.trim() || isAddingComment}
                          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Internal Note</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
