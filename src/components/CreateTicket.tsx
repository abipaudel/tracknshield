import React, { useState } from 'react';
import { 
  Plus, 
  AlertCircle, 
  Upload, 
  X, 
  Send, 
  Check,
  Building,
  Users,
  Tag,
  FileText,
  Clock,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockOrganizations } from '../data/mockData';
import { TicketCategory, TicketPriority, Ticket } from '../types';

interface TicketForm {
  title: string;
  organizationId: string;
  organizationName: string;
  department: string;
  category: TicketCategory | '';
  priority: TicketPriority;
  description: string;
  attachments: File[];
}

const CreateTicket: React.FC = () => {
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
  const [errors, setErrors] = useState<Partial<TicketForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const itCategories = [
    { id: 'hardware', label: 'Hardware Issues', icon: '🖥️', description: 'Computer, printer, phone hardware problems' },
    { id: 'software', label: 'Software Issues', icon: '💻', description: 'Application bugs, installation problems' },
    { id: 'network', label: 'Network Issues', icon: '🌐', description: 'Internet, WiFi, connectivity problems' },
    { id: 'accounts', label: 'Account Issues', icon: '👤', description: 'User accounts, permissions, access' },
    { id: 'email', label: 'Email Issues', icon: '📧', description: 'Email delivery, configuration problems' },
    { id: 'system', label: 'System Issues', icon: '⚙️', description: 'Server, database, system-wide problems' }
  ];

  const socCategories = [
    { id: 'phishing', label: 'Phishing Attack', icon: '🎣', description: 'Suspicious emails, fake websites' },
    { id: 'malware', label: 'Malware Detection', icon: '🦠', description: 'Virus, trojan, ransomware incidents' },
    { id: 'suspicious_login', label: 'Suspicious Login', icon: '🔐', description: 'Unusual login attempts, compromised accounts' },
    { id: 'siem_alert', label: 'SIEM Alert', icon: '🚨', description: 'Security information and event alerts' },
    { id: 'vulnerability', label: 'Vulnerability', icon: '🛡️', description: 'Security vulnerabilities, patches needed' },
    { id: 'incident_response', label: 'Incident Response', icon: '🚑', description: 'Active security incidents' },
    { id: 'compliance', label: 'Compliance Issue', icon: '📋', description: 'Regulatory compliance, audit findings' }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200', description: 'Minor issues, can wait' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Standard priority' },
    { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200', description: 'Urgent, affects productivity' },
    { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200', description: 'Emergency, immediate attention' }
  ];

  const departments = [
    'IT', 'Security Operations', 'Administration', 'Finance', 'HR', 'Operations', 
    'Management', 'Incident Response', 'Compliance', 'Engineering', 'Sales', 'Marketing', 'Front Office', 'F&B Production', 'F&B Service'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketForm> = {};

    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.organizationName.trim()) newErrors.organizationName = 'Organization is required';
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateTicketNumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `TKT-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const newTicketNumber = generateTicketNumber();
      
      // Create ticket object
      const newTicket: Ticket = {
        id: Date.now().toString(),
        ticketNumber: newTicketNumber,
        title: form.title,
        description: form.description,
        category: form.category as TicketCategory,
        priority: form.priority,
        status: 'open',
        organizationId: form.organizationId,
        organizationName: form.organizationName,
        department: form.department,
        submitterId: user?.id || '',
        submitterEmail: user?.email || '',
        attachments: [],
        internalNotes: [],
        slaDeadline: new Date(Date.now() + (form.priority === 'critical' ? 1 : form.priority === 'high' ? 4 : form.priority === 'medium' ? 24 : 72) * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Get existing tickets from localStorage
      const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      
      // Add new ticket
      const updatedTickets = [...existingTickets, newTicket];
      
      // Save back to localStorage
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTicketNumber(newTicketNumber);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setTicketNumber('');
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
        setErrors({});
      }, 3000);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setForm(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setForm(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Created Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your support ticket has been submitted and assigned a tracking number.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Ticket ID:</strong> {ticketNumber}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              You'll receive email updates on this ticket's progress.
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setTicketNumber('');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Plus className="w-8 h-8 mr-3 text-blue-600" />
          Create Support Ticket
        </h1>
        <p className="text-gray-600">
          Submit a detailed support request and our team will assist you promptly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Ticket Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Brief description of your issue..."
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Organization & Department */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  {user?.role === 'super_admin' ? (
                    <select
                      value={form.organizationId}
                      onChange={(e) => {
                        const org = mockOrganizations.find(o => o.id === e.target.value);
                        setForm(prev => ({ 
                          ...prev, 
                          organizationId: e.target.value,
                          organizationName: org?.name || ''
                        }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.organizationName ? 'border-red-300' : 'border-gray-300'
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                  {errors.organizationName && (
                    <p className="mt-1 text-xs text-red-600">{errors.organizationName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-600">{errors.department}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Issue Category
              </label>
              
              {/* IT Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  IT Support Categories
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {itCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, category: category.id as TicketCategory }))}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md text-left ${
                        form.category === category.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{category.label}</div>
                      <div className="text-xs text-gray-600">{category.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SOC Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Security Operations Categories
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {socCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, category: category.id as TicketCategory }))}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md text-left ${
                        form.category === category.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{category.label}</div>
                      <div className="text-xs text-gray-600">{category.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {errors.category && (
                <p className="mt-3 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Priority Level
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {priorities.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, priority: priority.id as TicketPriority }))}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      form.priority === priority.id
                        ? priority.color + ' border-current'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium mb-1">{priority.label}</div>
                    <div className="text-xs opacity-75">{priority.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Detailed Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Please provide detailed information about your issue:
• What happened?
• When did it occur?
• What steps led to the problem?
• Any error messages?
• Impact on your work?
• Steps you've already tried?"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* File Attachments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Attachments (Optional)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop files here, or{' '}
                  <label className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                    browse
                    <input
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf,.txt,.doc,.docx"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Screenshots, logs, documents (PNG, JPG, PDF, TXT up to 10MB each)
                </p>
              </div>

              {form.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {form.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted by:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">
                    {user?.role === 'super_admin' ? 'Super Admin' :
                     user?.role === 'org_admin' ? 'Org Admin' :
                     user?.role === 'it_support' ? 'IT Support' :
                     user?.role === 'soc_analyst' ? 'SOC Analyst' : 'End User'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* SLA Information */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Response Time SLA
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex justify-between">
                  <span>Critical:</span>
                  <span className="font-medium">1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span>High:</span>
                  <span className="font-medium">4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <span className="font-medium">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Low:</span>
                  <span className="font-medium">72 hours</span>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Need Immediate Support?</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>For critical security incidents:</p>
                <p className="font-medium text-red-600">Emergency: +977 9842812555-SOC</p>
                <p className="font-medium">Email: paudel.abi@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-sm hover:shadow-md"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Ticket...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Create Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
