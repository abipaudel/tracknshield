import React, { useState } from 'react';
import { X, Save, Network, Globe, MapPin, Tag, Building } from 'lucide-react';
import { IPAMSubnet } from '../types/ipam';
import { useAuth } from '../context/AuthContext';
import { mockOrganizations } from '../data/mockData';

interface IPSubnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subnet: Partial<IPAMSubnet>) => void;
  subnet?: IPAMSubnet;
  mode: 'create' | 'edit';
}

const IPSubnetModal: React.FC<IPSubnetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subnet,
  mode
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: subnet?.name || '',
    network: subnet?.network || '',
    cidr: subnet?.cidr || 24,
    gateway: subnet?.gateway || '',
    description: subnet?.description || '',
    vlanId: subnet?.vlanId || undefined,
    organizationId: subnet?.organizationId || user?.organizationId || '',
    organizationName: subnet?.organizationName || user?.organizationName || '',
    location: subnet?.location || '',
    status: subnet?.status || 'active' as const,
    tags: subnet?.tags?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subnet name is required';
    }

    if (!formData.network.trim()) {
      newErrors.network = 'Network address is required';
    } else {
      // Basic IP validation
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.network)) {
        newErrors.network = 'Invalid network address format';
      }
    }

    if (formData.cidr < 8 || formData.cidr > 30) {
      newErrors.cidr = 'CIDR must be between 8 and 30';
    }

    if (!formData.gateway.trim()) {
      newErrors.gateway = 'Gateway address is required';
    } else {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.gateway)) {
        newErrors.gateway = 'Invalid gateway address format';
      }
    }

    if (!formData.organizationId) {
      newErrors.organizationId = 'Organization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const totalIPs = Math.pow(2, 32 - formData.cidr) - 2; // Subtract network and broadcast
    const subnetData: Partial<IPAMSubnet> = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      totalIPs,
      usedIPs: subnet?.usedIPs || 0,
      availableIPs: totalIPs - (subnet?.usedIPs || 0),
      utilization: subnet?.usedIPs ? Math.round((subnet.usedIPs / totalIPs) * 100) : 0
    };

    onSave(subnetData);
    onClose();
  };

  const calculateTotalIPs = (cidr: number) => {
    return Math.pow(2, 32 - cidr) - 2;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Network className="w-5 h-5 mr-2" />
              {mode === 'create' ? 'Create New Subnet' : 'Edit Subnet'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subnet Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Corporate LAN"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Main Office"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the purpose and usage of this subnet..."
              />
            </div>
          </div>

          {/* Network Configuration */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Network Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Network Address *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.network}
                    onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.network ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="192.168.1.0"
                  />
                </div>
                {errors.network && <p className="mt-1 text-xs text-red-600">{errors.network}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIDR *
                </label>
                <input
                  type="number"
                  min="8"
                  max="30"
                  value={formData.cidr}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidr: parseInt(e.target.value) || 24 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cidr ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.cidr && <p className="mt-1 text-xs text-red-600">{errors.cidr}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Total IPs: {calculateTotalIPs(formData.cidr).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gateway *
                </label>
                <input
                  type="text"
                  value={formData.gateway}
                  onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gateway ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="192.168.1.1"
                />
                {errors.gateway && <p className="mt-1 text-xs text-red-600">{errors.gateway}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VLAN ID (Optional)
              </label>
              <input
                type="number"
                min="1"
                max="4094"
                value={formData.vlanId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vlanId: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
            </div>
          </div>

          {/* Organization & Status */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Organization & Status</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization *
                </label>
                {user?.role === 'super_admin' ? (
                  <select
                    value={formData.organizationId}
                    onChange={(e) => {
                      const org = mockOrganizations.find(o => o.id === e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        organizationId: e.target.value,
                        organizationName: org?.name || ''
                      }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.organizationId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Organization</option>
                    {mockOrganizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.organizationName}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                )}
                {errors.organizationId && <p className="mt-1 text-xs text-red-600">{errors.organizationId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="reserved">Reserved</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="corporate, production, critical"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{mode === 'create' ? 'Create Subnet' : 'Update Subnet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IPSubnetModal;
