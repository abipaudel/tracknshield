import React, { useState } from 'react';
import { X, Save, Globe, Monitor, Server, Printer, Router, Network, Shield, Wifi, Camera, Smartphone, Zap, HardDrive, User, Building, Tag } from 'lucide-react';
import { IPAddress, IPAMSubnet } from '../types/ipam';
import { useAuth } from '../context/AuthContext';

interface IPAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ipAddress: Partial<IPAddress>) => void;
  ipAddress?: IPAddress;
  subnets: IPAMSubnet[];
  mode: 'create' | 'edit';
}

const IPAddressModal: React.FC<IPAddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ipAddress,
  subnets,
  mode
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ip: ipAddress?.ip || '',
    subnetId: ipAddress?.subnetId || '',
    hostname: ipAddress?.hostname || '',
    macAddress: ipAddress?.macAddress || '',
    deviceType: ipAddress?.deviceType || 'workstation' as const,
    status: ipAddress?.status || 'allocated' as const,
    assignedTo: ipAddress?.assignedTo || '',
    assignedToEmail: ipAddress?.assignedToEmail || '',
    department: ipAddress?.department || '',
    description: ipAddress?.description || '',
    tags: ipAddress?.tags?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const deviceTypes = [
    { id: 'server', label: 'Server', icon: Server },
    { id: 'workstation', label: 'Workstation', icon: Monitor },
    { id: 'printer', label: 'Printer', icon: Printer },
    { id: 'router', label: 'Router', icon: Router },
    { id: 'switch', label: 'Switch', icon: Network },
    { id: 'firewall', label: 'Firewall', icon: Shield },
    { id: 'access_point', label: 'Access Point', icon: Wifi },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'phone', label: 'Phone', icon: Smartphone },
    { id: 'iot', label: 'IoT Device', icon: Zap },
    { id: 'other', label: 'Other', icon: HardDrive }
  ];

  const statuses = [
    { id: 'allocated', label: 'Allocated', color: 'bg-green-100 text-green-800' },
    { id: 'reserved', label: 'Reserved', color: 'bg-blue-100 text-blue-800' },
    { id: 'available', label: 'Available', color: 'bg-gray-100 text-gray-800' },
    { id: 'offline', label: 'Offline', color: 'bg-red-100 text-red-800' },
    { id: 'conflict', label: 'Conflict', color: 'bg-orange-100 text-orange-800' }
  ];

  const departments = [
    'IT', 'Security Operations', 'Administration', 'Finance', 'HR', 'Operations', 
    'Management', 'Incident Response', 'Compliance', 'Engineering', 'Sales', 'Marketing'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else {
      // Basic IP validation
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.ip)) {
        newErrors.ip = 'Invalid IP address format';
      } else {
        // Check if IP is within selected subnet range
        const selectedSubnet = subnets.find(s => s.id === formData.subnetId);
        if (selectedSubnet && !isIPInSubnet(formData.ip, selectedSubnet.network, selectedSubnet.cidr)) {
          newErrors.ip = 'IP address is not within the selected subnet range';
        }
      }
    }

    if (!formData.subnetId) {
      newErrors.subnetId = 'Subnet is required';
    }

    if (formData.macAddress && !isValidMacAddress(formData.macAddress)) {
      newErrors.macAddress = 'Invalid MAC address format';
    }

    if (formData.assignedToEmail && !isValidEmail(formData.assignedToEmail)) {
      newErrors.assignedToEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isIPInSubnet = (ip: string, network: string, cidr: number): boolean => {
    const ipToNumber = (ip: string) => {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    };

    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    const mask = (0xffffffff << (32 - cidr)) >>> 0;

    return (ipNum & mask) === (networkNum & mask);
  };

  const isValidMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const selectedSubnet = subnets.find(s => s.id === formData.subnetId);
    const ipAddressData: Partial<IPAddress> = {
      ...formData,
      organizationId: selectedSubnet?.organizationId || user?.organizationId || '',
      organizationName: selectedSubnet?.organizationName || user?.organizationName || '',
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      dnsRecords: ipAddress?.dnsRecords || [],
      lastSeen: formData.status === 'allocated' ? new Date() : undefined
    };

    onSave(ipAddressData);
    onClose();
  };

  const generateNextIP = () => {
    if (!formData.subnetId) return;
    
    const selectedSubnet = subnets.find(s => s.id === formData.subnetId);
    if (!selectedSubnet) return;

    // Simple logic to suggest next available IP
    const networkParts = selectedSubnet.network.split('.');
    const baseIP = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.`;
    const suggestedIP = `${baseIP}${parseInt(networkParts[3]) + 10}`;
    
    setFormData(prev => ({ ...prev, ip: suggestedIP }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              {mode === 'create' ? 'Allocate IP Address' : 'Edit IP Address'}
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
          {/* Network Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Network Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subnet *
                </label>
                <select
                  value={formData.subnetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, subnetId: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.subnetId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Subnet</option>
                  {subnets.map(subnet => (
                    <option key={subnet.id} value={subnet.id}>
                      {subnet.name} ({subnet.network}/{subnet.cidr})
                    </option>
                  ))}
                </select>
                {errors.subnetId && <p className="mt-1 text-xs text-red-600">{errors.subnetId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => setFormData(prev => ({ ...prev, ip: e.target.value }))}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.ip ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="192.168.1.10"
                  />
                  {mode === 'create' && (
                    <button
                      type="button"
                      onClick={generateNextIP}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                    >
                      Auto
                    </button>
                  )}
                </div>
                {errors.ip && <p className="mt-1 text-xs text-red-600">{errors.ip}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hostname
                </label>
                <input
                  type="text"
                  value={formData.hostname}
                  onChange={(e) => setFormData(prev => ({ ...prev, hostname: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="server01.domain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MAC Address
                </label>
                <input
                  type="text"
                  value={formData.macAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, macAddress: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.macAddress ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="00:1B:44:11:3A:B7"
                />
                {errors.macAddress && <p className="mt-1 text-xs text-red-600">{errors.macAddress}</p>}
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Device Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Type
                </label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => setFormData(prev => ({ ...prev, deviceType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {deviceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
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
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
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
                placeholder="Describe the device and its purpose..."
              />
            </div>
          </div>

          {/* Assignment Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Assignment Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Email
                </label>
                <input
                  type="email"
                  value={formData.assignedToEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedToEmail: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.assignedToEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@company.com"
                />
                {errors.assignedToEmail && <p className="mt-1 text-xs text-red-600">{errors.assignedToEmail}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
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
                    placeholder="critical, production, web-server"
                  />
                </div>
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
              <span>{mode === 'create' ? 'Allocate IP' : 'Update IP'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IPAddressModal;
