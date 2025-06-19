import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Settings, 
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Globe,
  Shield
} from 'lucide-react';
import { mockOrganizations } from '../data/mockData';
import { Organization } from '../types';

const OrganizationManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [newOrg, setNewOrg] = useState({
    name: '',
    domain: '',
    isActive: true,
    settings: {
      slaHours: { critical: 1, high: 4, medium: 24, low: 72 },
      categories: ['hardware', 'software', 'network'],
      departments: ['IT', 'Administration'],
      escalationRules: []
    }
  });

  // Load organizations from localStorage on component mount
  useEffect(() => {
    const storedOrgs = localStorage.getItem('organizations');
    if (storedOrgs) {
      const parsedOrgs = JSON.parse(storedOrgs).map((org: any) => ({
        ...org,
        createdAt: new Date(org.createdAt)
      }));
      setOrganizations(parsedOrgs);
    } else {
      // Initialize with mock data if no stored data exists
      const orgsWithDates = mockOrganizations.map(org => ({
        ...org,
        createdAt: new Date(org.createdAt)
      }));
      setOrganizations(orgsWithDates);
      localStorage.setItem('organizations', JSON.stringify(orgsWithDates));
    }
  }, []);

  // Save organizations to localStorage whenever organizations state changes
  useEffect(() => {
    if (organizations.length > 0) {
      localStorage.setItem('organizations', JSON.stringify(organizations));
    }
  }, [organizations]);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrganization = () => {
    if (!newOrg.name || !newOrg.domain) return;

    const organization: Organization = {
      id: Date.now().toString(),
      name: newOrg.name,
      domain: newOrg.domain,
      isActive: newOrg.isActive,
      settings: newOrg.settings,
      createdAt: new Date()
    };

    setOrganizations(prev => [...prev, organization]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditOrganization = (org: Organization) => {
    setEditingOrg(org);
    setNewOrg({
      name: org.name,
      domain: org.domain,
      isActive: org.isActive,
      settings: org.settings
    });
  };

  const handleUpdateOrganization = () => {
    if (!editingOrg || !newOrg.name || !newOrg.domain) return;

    setOrganizations(prev => prev.map(o => 
      o.id === editingOrg.id 
        ? {
            ...o,
            name: newOrg.name,
            domain: newOrg.domain,
            isActive: newOrg.isActive,
            settings: newOrg.settings
          }
        : o
    ));

    setEditingOrg(null);
    resetForm();
  };

  const handleDeleteOrganization = (orgId: string) => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      setOrganizations(prev => prev.filter(o => o.id !== orgId));
    }
  };

  const toggleOrganizationStatus = (orgId: string) => {
    setOrganizations(prev => prev.map(o => 
      o.id === orgId ? { ...o, isActive: !o.isActive } : o
    ));
  };

  const resetForm = () => {
    setNewOrg({
      name: '',
      domain: '',
      isActive: true,
      settings: {
        slaHours: { critical: 1, high: 4, medium: 24, low: 72 },
        categories: ['hardware', 'software', 'network'],
        departments: ['IT', 'Administration'],
        escalationRules: []
      }
    });
  };

  const availableCategories = [
    'hardware', 'software', 'network', 'accounts', 'email', 'system',
    'phishing', 'malware', 'suspicious_login', 'siem_alert', 'vulnerability', 
    'incident_response', 'compliance'
  ];

  const availableDepartments = [
    'IT', 'Security Operations', 'Administration', 'Finance', 'HR', 'Operations', 
    'Management', 'Incident Response', 'Compliance', 'Engineering', 'Sales', 'Marketing', 'Front Office', 'F&B Production', 'F&B Service'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building className="w-8 h-8 mr-3 text-blue-600" />
            Organization Management
          </h1>
          <p className="text-gray-600 mt-1">Manage organizations and their configurations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {filteredOrganizations.length} organizations found
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <div key={org.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="w-3 h-3 mr-1" />
                    {org.domain}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleOrganizationStatus(org.id)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  org.isActive 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                } transition-colors`}
              >
                {org.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">SLA Critical:</span>
                <span className="font-medium">{org.settings.slaHours.critical}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Categories:</span>
                <span className="font-medium">{org.settings.categories.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Departments:</span>
                <span className="font-medium">{org.settings.departments.length}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Created {org.createdAt.toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditOrganization(org)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                  title="Edit Organization"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOrganization(org.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  title="Delete Organization"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>0 users</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Organization Modal */}
      {(showAddModal || editingOrg) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingOrg ? 'Edit Organization' : 'Add New Organization'}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={newOrg.name}
                      onChange={(e) => setNewOrg(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                    <input
                      type="text"
                      value={newOrg.domain}
                      onChange={(e) => setNewOrg(prev => ({ ...prev, domain: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="acme.com"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="orgActive"
                    checked={newOrg.isActive}
                    onChange={(e) => setNewOrg(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="orgActive" className="ml-2 block text-sm text-gray-900">
                    Active Organization
                  </label>
                </div>
              </div>

              {/* SLA Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">SLA Response Times (hours)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Critical</label>
                    <input
                      type="number"
                      value={newOrg.settings.slaHours.critical}
                      onChange={(e) => setNewOrg(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          slaHours: { ...prev.settings.slaHours, critical: parseInt(e.target.value) || 1 }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">High</label>
                    <input
                      type="number"
                      value={newOrg.settings.slaHours.high}
                      onChange={(e) => setNewOrg(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          slaHours: { ...prev.settings.slaHours, high: parseInt(e.target.value) || 4 }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
                    <input
                      type="number"
                      value={newOrg.settings.slaHours.medium}
                      onChange={(e) => setNewOrg(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          slaHours: { ...prev.settings.slaHours, medium: parseInt(e.target.value) || 24 }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low</label>
                    <input
                      type="number"
                      value={newOrg.settings.slaHours.low}
                      onChange={(e) => setNewOrg(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          slaHours: { ...prev.settings.slaHours, low: parseInt(e.target.value) || 72 }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Enabled Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableCategories.map(category => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newOrg.settings.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewOrg(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                categories: [...prev.settings.categories, category]
                              }
                            }));
                          } else {
                            setNewOrg(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                categories: prev.settings.categories.filter(c => c !== category)
                              }
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departments */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Available Departments</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableDepartments.map(department => (
                    <label key={department} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newOrg.settings.departments.includes(department)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewOrg(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                departments: [...prev.settings.departments, department]
                              }
                            }));
                          } else {
                            setNewOrg(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                departments: prev.settings.departments.filter(d => d !== department)
                              }
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{department}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingOrg(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingOrg ? handleUpdateOrganization : handleAddOrganization}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {editingOrg ? 'Update Organization' : 'Add Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
