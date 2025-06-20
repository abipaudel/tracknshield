import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  AlertCircle, CheckCircle, Clock, Archive, Circle, 
  RefreshCw, MoreHorizontal, List, Grid, 
  ArrowUp, ArrowDown, Calendar, User, Tag 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

// Types
type TicketStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  submitterEmail: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  slaDeadline: Date;
}

const AllTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ticket; direction: 'ascending' | 'descending' } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState({
    status: [] as TicketStatus[],
    priority: [] as TicketPriority[],
    category: [] as string[],
  });

  // Available filter options
  const statusOptions: TicketStatus[] = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
  const priorityOptions: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
  const categoryOptions = [
    'hardware', 'software', 'network', 'accounts', 'email', 'system',
    'phishing', 'malware', 'suspicious_login', 'siem_alert', 'vulnerability', 'incident_response'
  ];

  // Fetch tickets (in a real app, this would be an API call)
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get from localStorage (mock data)
        const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
        
        // Convert string dates to Date objects
        const parsedTickets = storedTickets.map((ticket: any) => ({
          ...ticket,
          createdAt: new Date(ticket.createdAt),
          updatedAt: new Date(ticket.updatedAt),
          slaDeadline: new Date(ticket.slaDeadline)
        }));
        
        setTickets(parsedTickets);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Apply sorting
  const sortedTickets = React.useMemo(() => {
    let sortableTickets = [...tickets];
    if (sortConfig !== null) {
      sortableTickets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTickets;
  }, [tickets, sortConfig]);

  // Apply filters and search
  const filteredTickets = React.useMemo(() => {
    return sortedTickets.filter(ticket => {
      // Search term filter
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.submitterEmail.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = 
        filters.status.length === 0 || filters.status.includes(ticket.status);

      // Priority filter
      const matchesPriority = 
        filters.priority.length === 0 || filters.priority.includes(ticket.priority);

      // Category filter
      const matchesCategory = 
        filters.category.length === 0 || filters.category.includes(ticket.category);

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [sortedTickets, searchTerm, filters]);

  // Pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  // Sort request
  const requestSort = (key: keyof Ticket) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Toggle filters
  const toggleFilter = (type: 'status' | 'priority' | 'category', value: string) => {
    setFilters(prev => {
      const currentFilters = [...prev[type]] as string[];
      const updatedFilters = currentFilters.includes(value)
        ? currentFilters.filter(item => item !== value)
        : [...currentFilters, value];
      
      return { ...prev, [type]: updatedFilters };
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: [],
      priority: [],
      category: []
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate SLA status
  const getSlaStatus = (slaDeadline: Date) => {
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursRemaining <= 0) return 'breached';
    if (hoursRemaining <= 24) return 'warning';
    return 'ok';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading tickets...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
          <p className="text-gray-600">
            {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/tickets/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Ticket
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tickets by title, number or submitter..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-end lg:justify-start lg:col-span-2">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        {(filters.status.length > 0 || filters.priority.length > 0 || filters.category.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {filters.status.map(status => (
              <span 
                key={status}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {status.replace('_', ' ')}
                <button 
                  onClick={() => toggleFilter('status', status)}
                  className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.priority.map(priority => (
              <span 
                key={priority}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                {priority}
                <button 
                  onClick={() => toggleFilter('priority', priority)}
                  className="ml-1.5 inline-flex text-yellow-400 hover:text-yellow-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.category.map(category => (
              <span 
                key={category}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {category.replace('_', ' ')}
                <button 
                  onClick={() => toggleFilter('category', category)}
                  className="ml-1.5 inline-flex text-green-400 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Sidebar and Tickets */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-500" />
              Filters
            </h3>

            {/* Status Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                Status
              </h4>
              <div className="space-y-2">
                {statusOptions.map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleFilter('status', status)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-gray-500" />
                Priority
              </h4>
              <div className="space-y-2">
                {priorityOptions.map(priority => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority)}
                      onChange={() => toggleFilter('priority', priority)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {priority}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                Category
              </h4>
              <div className="space-y-2">
                {categoryOptions.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => toggleFilter('category', category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {category.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1">
          {/* List View */}
          {viewMode === 'list' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div 
                  className="col-span-4 md:col-span-5 flex items-center cursor-pointer"
                  onClick={() => requestSort('title')}
                >
                  <span>Ticket</span>
                  {sortConfig?.key === 'title' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="ml-1 w-4 h-4" /> 
                      : <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </div>
                <div 
                  className="col-span-3 md:col-span-2 flex items-center cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <span>Status</span>
                  {sortConfig?.key === 'status' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="ml-1 w-4 h-4" /> 
                      : <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </div>
                <div 
                  className="hidden md:flex md:col-span-2 items-center cursor-pointer"
                  onClick={() => requestSort('priority')}
                >
                  <span>Priority</span>
                  {sortConfig?.key === 'priority' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="ml-1 w-4 h-4" /> 
                      : <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </div>
                <div 
                  className="col-span-3 md:col-span-2 flex items-center justify-end cursor-pointer"
                  onClick={() => requestSort('createdAt')}
                >
                  <span>Created</span>
                  {sortConfig?.key === 'createdAt' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="ml-1 w-4 h-4" /> 
                      : <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </div>
                <div className="col-span-2 md:col-span-1"></div>
              </div>

              {/* Table Body */}
              {currentTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No tickets found matching your criteria</p>
                  <button 
                    onClick={resetFilters}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {currentTickets.map(ticket => (
                    <li key={ticket.id} className="hover:bg-gray-50">
                      <Link 
                        to={`/tickets/${ticket.id}`}
                        className="grid grid-cols-12 px-4 py-4 items-center"
                      >
                        <div className="col-span-4 md:col-span-5">
                          <div className="flex items-center">
                            <span className="font-medium text-blue-600 mr-2">
                              {ticket.ticketNumber}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 truncate">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <User className="w-3 h-3 mr-1" />
                            {ticket.submitterEmail}
                          </p>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <StatusBadge status={ticket.status} />
                        </div>
                        <div className="hidden md:flex md:col-span-2">
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                        <div className="col-span-3 md:col-span-2 text-right">
                          <div className="text-sm text-gray-500">
                            {formatDate(ticket.createdAt)}
                          </div>
                          <div className={`text-xs mt-1 ${
                            getSlaStatus(ticket.slaDeadline) === 'breached' 
                              ? 'text-red-500' 
                              : getSlaStatus(ticket.slaDeadline) === 'warning' 
                                ? 'text-yellow-500' 
                                : 'text-green-500'
                          }`}>
                            <Clock className="inline w-3 h-3 mr-1" />
                            {getSlaStatus(ticket.slaDeadline) === 'breached' 
                              ? 'SLA Breached' 
                              : getSlaStatus(ticket.slaDeadline) === 'warning' 
                                ? 'Approaching deadline' 
                                : 'On track'}
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 text-right">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTickets.length === 0 ? (
                <div className="col-span-full p-8 text-center text-gray-500">
                  <p>No tickets found matching your criteria</p>
                  <button 
                    onClick={resetFilters}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                currentTickets.map(ticket => (
                  <Link 
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-blue-600">
                        {ticket.ticketNumber}
                      </span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-3 line-clamp-2">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <User className="w-4 h-4 mr-1" />
                      <span>{ticket.submitterEmail}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <PriorityBadge priority={ticket.priority} />
                      <div className="text-xs text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                    <div className={`text-xs mt-3 ${
                      getSlaStatus(ticket.slaDeadline) === 'breached' 
                        ? 'text-red-500' 
                        : getSlaStatus(ticket.slaDeadline) === 'warning' 
                          ? 'text-yellow-500' 
                          : 'text-green-500'
                    }`}>
                      <Clock className="inline w-3 h-3 mr-1" />
                      {getSlaStatus(ticket.slaDeadline) === 'breached' 
                        ? 'SLA Breached' 
                        : getSlaStatus(ticket.slaDeadline) === 'warning' 
                          ? 'Approaching deadline' 
                          : 'On track'}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredTickets.length > ticketsPerPage && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstTicket + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastTicket, filteredTickets.length)}
                </span>{' '}
                of <span className="font-medium">{filteredTickets.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTickets;
