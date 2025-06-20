import React, { useState, useEffect } from 'react';
import { 
  Plus, AlertCircle, Upload, X, Send, Check, 
  Building, Users, Tag, FileText, Clock, Shield, 
  Edit, ChevronDown, Circle, CheckCircle, AlertTriangle, Pause, Archive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockOrganizations } from '../data/mockData';

// Type definitions
type TicketStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
type TicketCategory = 
  | 'hardware' | 'software' | 'network' | 'accounts' | 'email' | 'system'
  | 'phishing' | 'malware' | 'suspicious_login' | 'siem_alert' | 'vulnerability' | 'incident_response' | 'compliance';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  organizationId: string;
  organizationName: string;
  department: string;
  submitterId: string;
  submitterEmail: string;
  assigneeId?: string;
  assigneeName?: string;
  attachments: string[];
  internalNotes: {
    content: string;
    author: string;
    createdAt: Date;
  }[];
  slaDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TicketForm {
  id?: string;
  title: string;
  organizationId: string;
  organizationName: string;
  department: string;
  category: TicketCategory | '';
  priority: TicketPriority;
  description: string;
  attachments: File[];
}

const statusOptions: {
  id: TicketStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: 'open', label: 'Open', icon: <Circle className="w-3 h-3" />, color: 'bg-gray-100 text-gray-800' },
  { id: 'in_progress', label: 'In Progress', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800' },
  { id: 'on_hold', label: 'On Hold', icon: <Pause className="w-3 h-3" />, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'resolved', label: 'Resolved', icon: <Check className="w-3 h-3" />, color: 'bg-green-100 text-green-800' },
  { id: 'closed', label: 'Closed', icon: <Archive className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
];

const priorityOptions: {
  id: TicketPriority;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: 'low', label: 'Low', icon: <ChevronDown className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
  { id: 'medium', label: 'Medium', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'high', label: 'High', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' },
  { id: 'critical', label: 'Critical', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-100 text-red-800' },
];

const TicketManager: React.FC<{ mode: 'create' | 'edit'; ticketId?: string }> = ({ mode, ticketId }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<TicketForm>({
    title: '',
    organizationId: user?.organizationId || '',
    organizationName: user?.organizationName || '',
    department: user?.department || '',
    category: '',
    priority: 'medium',
    description: '',
    attachments: []
  });
  const [status, setStatus] = useState<TicketStatus>('open');
  const [errors, setErrors] = useState<Partial<TicketForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Load ticket data in edit mode
  useEffect(() => {
    if (mode === 'edit' && ticketId) {
      const loadTicket = async () => {
        try {
          // In a real app, you would fetch from API
          const tickets = JSON.parse(localStorage.getItem('tickets') || [];
          const ticket = tickets.find((t: Ticket) => t.id === ticketId);
          
          if (ticket) {
            setForm({
              title: ticket.title,
              organizationId: ticket.organizationId,
              organizationName: ticket.organizationName,
              department: ticket.department,
              category: ticket.category,
              priority: ticket.priority,
              description: ticket.description,
              attachments: [] // Files would need to be re-uploaded or fetched differently
            });
            setStatus(ticket.status);
          }
        } catch (error) {
          console.error('Failed to load ticket', error);
        }
      };
      loadTicket();
    }
  }, [mode, ticketId]);

  const categories = [
    {
      group: 'IT Support',
      icon: <Users className="w-4 h-4" />,
      items: [
        { id: 'hardware', label: 'Hardware', description: 'Computer, printer, phone issues' },
        { id: 'software', label: 'Software', description: 'Application bugs, installations' },
        { id: 'network', label: 'Network', description: 'Internet, WiFi, connectivity' },
        { id: 'accounts', label: 'Accounts', description: 'User access, permissions' },
        { id: 'email', label: 'Email', description: 'Email delivery, configuration' },
        { id: 'system', label: 'System', description: 'Server, database issues' }
      ]
    },
    {
      group: 'Security',
      icon: <Shield className="w-4 h-4" />,
      items: [
        { id: 'phishing', label: 'Phishing', description: 'Suspicious emails, websites' },
        { id: 'malware', label: 'Malware', description: 'Virus, trojan, ransomware' },
        { id: 'suspicious_login', label: 'Suspicious Login', description: 'Unusual access attempts' },
        { id: 'siem_alert', label: 'SIEM Alert', description: 'Security monitoring alerts' },
        { id: 'vulnerability', label: 'Vulnerability', description: 'Security patches needed' },
        { id: 'incident_response', label: 'Incident', description: 'Active security incident' }
      ]
    }
  ];

  const departments = [
    'IT', 'Security', 'Administration', 'Finance', 'HR', 
    'Operations', 'Engineering', 'Sales', 'Marketing'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketForm> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.organizationId) newErrors.organizationId = 'Organization is required';
    if (!form.department) newErrors.department = 'Department is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateTicketNumber = (): string => {
    const prefix = mode === 'edit' ? 'UPD' : 'TKT';
    const date = new Date();
    return `${prefix}-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const ticketData: Ticket = {
        id: ticketId || Date.now().toString(),
        ticketNumber: mode === 'edit' ? '' : generateTicketNumber(),
        title: form.title,
        description: form.description,
        category: form.category as TicketCategory,
        priority: form.priority,
        status: mode === 'edit' ? status : 'open',
        organizationId: form.organizationId,
        organizationName: form.organizationName,
        department: form.department,
        submitterId: user?.id || '',
        submitterEmail: user?.email || '',
        attachments: form.attachments.map(f => f.name),
        internalNotes: [],
        slaDeadline: calculateSLADeadline(form.priority),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // In a real app, you would call an API here
      const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      let updatedTickets;
      
      if (mode === 'edit') {
        updatedTickets = existingTickets.map((t: Ticket) => 
          t.id === ticketId ? { ...t, ...ticketData, status } : t
        );
      } else {
        updatedTickets = [...existingTickets, ticketData];
      }

      localStorage.setItem('tickets', JSON.stringify(updatedTickets));

      setTicketNumber(ticketData.ticketNumber);
      setSubmitted(true);

      // Reset form after submission (for create mode)
      if (mode === 'create') {
        setTimeout(() => {
          setSubmitted(false);
          setForm({
            title: '',
            organizationId: user?.organizationId || '',
            organizationName: user?.organizationName || '',
            department: user?.department || '',
            category: '',
            priority: 'medium',
            description: '',
            attachments: []
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSLADeadline = (priority: TicketPriority): Date => {
    const hours = {
      critical: 1,
      high: 4,
      medium: 24,
      low: 72
    };
    return new Date(Date.now() + hours[priority] * 60 * 60 * 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'edit' ? 'Ticket Updated' : 'Ticket Created'}
          </h2>
          <p className="text-gray-600 mb-4">
            {mode === 'edit' 
              ? 'Your changes have been saved successfully.' 
              : `Ticket #${ticketNumber} has been created.`}
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === 'edit' ? 'Continue Editing' : 'Create Another'}
            </button>
            <button
              onClick={() => window.location.href = '/tickets'}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              View All Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          {mode === 'edit' ? (
            <>
              <Edit className="w-6 h-6 mr-2 text-blue-600" />
              Edit Ticket
            </>
          ) : (
            <>
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Create New Ticket
            </>
          )}
        </h1>
        <p className="text-gray-600 mt-1">
          {mode === 'edit' 
            ? 'Update the ticket details and status' 
            : 'Submit a detailed request for IT support'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Selector (Edit Mode) */}
            {mode === 'edit' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ticket Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setStatus(option.id)}
                      className={`px-4 py-2 rounded-md border flex items-center space-x-2 text-sm ${
                        status === option.id 
                          ? `${option.color} border-current font-medium`
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Title */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ticket Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Brief summary of the issue"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Organization & Department */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization *
                  </label>
                  {user?.role === 'admin' ? (
                    <select
                      value={form.organizationId}
                      onChange={(e) => {
                        const org = mockOrganizations.find(o => o.id === e.target.value);
                        setForm({
                          ...form,
                          organizationId: e.target.value,
                          organizationName: org?.name || ''
                        });
                      }}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.organizationId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Organization</option>
                      {mockOrganizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.organizationName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  )}
                  {errors.organizationId && (
                    <p className="mt-1 text-sm text-red-600">{errors.organizationId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Issue Category *
              </label>
              <div className="space-y-6">
                {categories.map((group) => (
                  <div key={group.group}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                      {group.icon}
                      <span className="ml-2">{group.group}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setForm({ ...form, category: item.id as TicketCategory })}
                          className={`p-3 rounded-md border text-left transition-colors ${
                            form.category === item.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.category && (
                <p className="mt-3 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {priorityOptions.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setForm({ ...form, priority: priority.id as TicketPriority })}
                    className={`px-3 py-2 rounded-md border flex items-center space-x-2 text-sm ${
                      form.priority === priority.id
                        ? `${priority.color} border-current font-medium`
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {priority.icon}
                    <span>{priority.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Detailed Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={`Describe your issue in detail. Include:
- What you were doing when the problem occurred
- Error messages you received
- Steps to reproduce the issue
- Any troubleshooting you've already tried`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Attachments
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files) {
                    setForm({
                      ...form,
                      attachments: [...form.attachments, ...Array.from(e.dataTransfer.files)]
                    });
                  }
                }}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">
                  Drag & drop files here or{' '}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                    browse files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  Max file size: 10MB (Images, PDFs, Documents)
                </p>
              </div>

              {form.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {form.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center truncate">
                        <FileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Ticket Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Ticket Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created by:</span>
                  <span className="font-medium">{user?.name || user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {mode === 'edit' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last updated:</span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* SLA Information */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Response Time SLA
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Critical:</span>
                  <span className="font-medium">1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">High:</span>
                  <span className="font-medium">4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Medium:</span>
                  <span className="font-medium">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Low:</span>
                  <span className="font-medium">72 hours</span>
                </div>
              </div>
            </div>

            {/* Support Contacts */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Support Contacts
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">IT Help Desk:</p>
                  <p className="font-medium">helpdesk@company.com</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Security Emergency:</p>
                  <p className="font-medium text-red-600">security@company.com</p>
                  <p className="font-medium text-red-600">+1 (555) 987-6543</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-white flex items-center space-x-2 ${
              isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{mode === 'edit' ? 'Update Ticket' : 'Create Ticket'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketManager;
