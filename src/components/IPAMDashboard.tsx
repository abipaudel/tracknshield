import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Globe, 
  Server, 
  Wifi, 
  Shield, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Zap,
  Router,
  Monitor,
  Smartphone,
  Camera,
  Printer,
  HardDrive,
  MapPin,
  Tag,
  Users,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IPAMSubnet, IPAddress, VLAN, IPAMStats } from '../types/ipam';

const IPAMDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [subnets, setSubnets] = useState<IPAMSubnet[]>([]);
  const [ipAddresses, setIPAddresses] = useState<IPAddress[]>([]);
  const [vlans, setVLANs] = useState<VLAN[]>([]);
  const [stats, setStats] = useState<IPAMStats>({
    totalSubnets: 0,
    totalIPs: 0,
    allocatedIPs: 0,
    availableIPs: 0,
    reservedIPs: 0,
    conflictIPs: 0,
    utilizationPercentage: 0,
    subnetsByStatus: {},
    devicesByType: {},
    topUtilizedSubnets: [],
    recentAllocations: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubnet, setSelectedSubnet] = useState<string>('');

  // Load IPAM data from localStorage
  useEffect(() => {
    loadIPAMData();
  }, []);

  const loadIPAMData = () => {
    const storedSubnets = localStorage.getItem('ipam_subnets');
    const storedIPs = localStorage.getItem('ipam_addresses');
    const storedVLANs = localStorage.getItem('ipam_vlans');

    if (storedSubnets) {
      const parsedSubnets = JSON.parse(storedSubnets).map((subnet: any) => ({
        ...subnet,
        createdAt: new Date(subnet.createdAt),
        updatedAt: new Date(subnet.updatedAt)
      }));
      setSubnets(parsedSubnets);
    } else {
      // Initialize with sample data
      const sampleSubnets = generateSampleSubnets();
      setSubnets(sampleSubnets);
      localStorage.setItem('ipam_subnets', JSON.stringify(sampleSubnets));
    }

    if (storedIPs) {
      const parsedIPs = JSON.parse(storedIPs).map((ip: any) => ({
        ...ip,
        createdAt: new Date(ip.createdAt),
        updatedAt: new Date(ip.updatedAt),
        lastSeen: ip.lastSeen ? new Date(ip.lastSeen) : undefined
      }));
      setIPAddresses(parsedIPs);
    } else {
      const sampleIPs = generateSampleIPs();
      setIPAddresses(sampleIPs);
      localStorage.setItem('ipam_addresses', JSON.stringify(sampleIPs));
    }

    if (storedVLANs) {
      const parsedVLANs = JSON.parse(storedVLANs).map((vlan: any) => ({
        ...vlan,
        createdAt: new Date(vlan.createdAt),
        updatedAt: new Date(vlan.updatedAt)
      }));
      setVLANs(parsedVLANs);
    } else {
      const sampleVLANs = generateSampleVLANs();
      setVLANs(sampleVLANs);
      localStorage.setItem('ipam_vlans', JSON.stringify(sampleVLANs));
    }
  };

  const generateSampleSubnets = (): IPAMSubnet[] => [
    {
      id: '1',
      name: 'Corporate LAN',
      network: '192.168.1.0',
      cidr: 24,
      gateway: '192.168.1.1',
      description: 'Main corporate network for workstations',
      vlanId: 100,
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      location: 'Main Office',
      status: 'active',
      utilization: 75,
      totalIPs: 254,
      usedIPs: 190,
      availableIPs: 64,
      tags: ['corporate', 'workstations'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Server Network',
      network: '10.0.1.0',
      cidr: 24,
      gateway: '10.0.1.1',
      description: 'Production server network',
      vlanId: 200,
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      location: 'Data Center',
      status: 'active',
      utilization: 45,
      totalIPs: 254,
      usedIPs: 114,
      availableIPs: 140,
      tags: ['servers', 'production'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Guest WiFi',
      network: '172.16.10.0',
      cidr: 24,
      gateway: '172.16.10.1',
      description: 'Guest wireless network',
      vlanId: 300,
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      location: 'All Floors',
      status: 'active',
      utilization: 25,
      totalIPs: 254,
      usedIPs: 63,
      availableIPs: 191,
      tags: ['guest', 'wifi'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date()
    }
  ];

  const generateSampleIPs = (): IPAddress[] => [
    {
      id: '1',
      ip: '192.168.1.10',
      subnetId: '1',
      hostname: 'dc01.corp.local',
      macAddress: '00:1B:44:11:3A:B7',
      deviceType: 'server',
      status: 'allocated',
      assignedTo: 'IT Infrastructure',
      assignedToEmail: 'it@corp.com',
      department: 'IT',
      description: 'Primary Domain Controller',
      lastSeen: new Date(),
      dnsRecords: [
        { id: '1', type: 'A', name: 'dc01.corp.local', value: '192.168.1.10', ttl: 3600 }
      ],
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      tags: ['critical', 'domain-controller'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: '2',
      ip: '192.168.1.50',
      subnetId: '1',
      hostname: 'ws-finance-01',
      macAddress: '00:1B:44:11:3A:C8',
      deviceType: 'workstation',
      status: 'allocated',
      assignedTo: 'John Smith',
      assignedToEmail: 'john.smith@corp.com',
      department: 'Finance',
      description: 'Finance department workstation',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      dnsRecords: [],
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      tags: ['workstation', 'finance'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date()
    },
    {
      id: '3',
      ip: '10.0.1.100',
      subnetId: '2',
      hostname: 'web-server-01',
      macAddress: '00:1B:44:11:3A:D9',
      deviceType: 'server',
      status: 'allocated',
      assignedTo: 'Web Services',
      assignedToEmail: 'webadmin@corp.com',
      department: 'IT',
      description: 'Primary web server',
      lastSeen: new Date(),
      dnsRecords: [
        { id: '2', type: 'A', name: 'www.corp.local', value: '10.0.1.100', ttl: 3600 }
      ],
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      tags: ['web-server', 'production'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date()
    }
  ];

  const generateSampleVLANs = (): VLAN[] => [
    {
      id: '1',
      vlanId: 100,
      name: 'Corporate',
      description: 'Main corporate VLAN for employee workstations',
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      subnets: ['1'],
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: '2',
      vlanId: 200,
      name: 'Servers',
      description: 'Server VLAN for production systems',
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      subnets: ['2'],
      status: 'active',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date()
    },
    {
      id: '3',
      vlanId: 300,
      name: 'Guest',
      description: 'Guest VLAN for visitor access',
      organizationId: user?.organizationId || 'soc1',
      organizationName: user?.organizationName || 'SOC Operations Alpha',
      subnets: ['3'],
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date()
    }
  ];

  // Calculate stats
  useEffect(() => {
    const totalSubnets = subnets.length;
    const totalIPs = subnets.reduce((sum, subnet) => sum + subnet.totalIPs, 0);
    const allocatedIPs = ipAddresses.filter(ip => ip.status === 'allocated').length;
    const reservedIPs = ipAddresses.filter(ip => ip.status === 'reserved').length;
    const conflictIPs = ipAddresses.filter(ip => ip.status === 'conflict').length;
    const availableIPs = totalIPs - allocatedIPs - reservedIPs;
    const utilizationPercentage = totalIPs > 0 ? Math.round((allocatedIPs / totalIPs) * 100) : 0;

    const subnetsByStatus: Record<string, number> = {};
    subnets.forEach(subnet => {
      subnetsByStatus[subnet.status] = (subnetsByStatus[subnet.status] || 0) + 1;
    });

    const devicesByType: Record<string, number> = {};
    ipAddresses.forEach(ip => {
      devicesByType[ip.deviceType] = (devicesByType[ip.deviceType] || 0) + 1;
    });

    const topUtilizedSubnets = [...subnets]
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 5);

    const recentAllocations = [...ipAddresses]
      .filter(ip => ip.status === 'allocated')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    setStats({
      totalSubnets,
      totalIPs,
      allocatedIPs,
      availableIPs,
      reservedIPs,
      conflictIPs,
      utilizationPercentage,
      subnetsByStatus,
      devicesByType,
      topUtilizedSubnets,
      recentAllocations
    });
  }, [subnets, ipAddresses]);

  const getDeviceIcon = (deviceType: string) => {
    const icons = {
      server: Server,
      workstation: Monitor,
      printer: Printer,
      router: Router,
      switch: Network,
      firewall: Shield,
      access_point: Wifi,
      camera: Camera,
      phone: Smartphone,
      iot: Zap,
      other: HardDrive
    };
    return icons[deviceType as keyof typeof icons] || HardDrive;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      reserved: 'bg-blue-100 text-blue-800',
      deprecated: 'bg-red-100 text-red-800',
      allocated: 'bg-green-100 text-green-800',
      available: 'bg-gray-100 text-gray-800',
      offline: 'bg-red-100 text-red-800',
      conflict: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Subnets"
          value={stats.totalSubnets}
          icon={<Network className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Total IP Addresses"
          value={stats.totalIPs.toLocaleString()}
          icon={<Globe className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="Allocated IPs"
          value={stats.allocatedIPs.toLocaleString()}
          icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          title="Utilization"
          value={`${stats.utilizationPercentage}%`}
          icon={<Activity className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Utilized Subnets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Utilized Subnets</h3>
          <div className="space-y-4">
            {stats.topUtilizedSubnets.map((subnet) => (
              <div key={subnet.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{subnet.name}</div>
                  <div className="text-sm text-gray-500">{subnet.network}/{subnet.cidr}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{subnet.utilization}%</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        subnet.utilization > 80 ? 'bg-red-500' : 
                        subnet.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${subnet.utilization}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
          <div className="space-y-3">
            {Object.entries(stats.devicesByType).map(([type, count]) => {
              const Icon = getDeviceIcon(type);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Allocations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent IP Allocations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostname</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Device Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentAllocations.map((ip) => {
                const Icon = getDeviceIcon(ip.deviceType);
                return (
                  <tr key={ip.id}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{ip.ip}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{ip.hostname || '-'}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 capitalize">{ip.deviceType.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{ip.assignedTo || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{ip.updatedAt.toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSubnets = () => (
    <div className="space-y-6">
      {/* Subnet Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subnet Management</h2>
          <p className="text-gray-600">Manage and monitor network subnets</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Scan Network</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Subnet</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subnets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deprecated">Deprecated</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Locations</option>
            <option value="main-office">Main Office</option>
            <option value="data-center">Data Center</option>
            <option value="branch">Branch Office</option>
          </select>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{subnets.length} subnets</span>
          </div>
        </div>
      </div>

      {/* Subnets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subnets.map((subnet) => (
          <div key={subnet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{subnet.name}</h3>
                <p className="text-sm text-gray-600">{subnet.network}/{subnet.cidr}</p>
                <div className="flex items-center mt-2">
                  <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{subnet.location}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subnet.status)}`}>
                {subnet.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gateway:</span>
                <span className="font-medium">{subnet.gateway}</span>
              </div>
              {subnet.vlanId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VLAN ID:</span>
                  <span className="font-medium">{subnet.vlanId}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Utilization:</span>
                <span className="font-medium">{subnet.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    subnet.utilization > 80 ? 'bg-red-500' : 
                    subnet.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${subnet.utilization}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used/Total:</span>
                <span className="font-medium">{subnet.usedIPs}/{subnet.totalIPs}</span>
              </div>
            </div>

            {subnet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {subnet.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-900 p-1 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900 p-1 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {subnet.organizationName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIPAddresses = () => (
    <div className="space-y-6">
      {/* IP Address Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IP Address Management</h2>
          <p className="text-gray-600">Track and manage individual IP addresses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Allocate IP</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search IPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedSubnet}
            onChange={(e) => setSelectedSubnet(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subnets</option>
            {subnets.map(subnet => (
              <option key={subnet.id} value={subnet.id}>{subnet.name}</option>
            ))}
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="allocated">Allocated</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="offline">Offline</option>
            <option value="conflict">Conflict</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Device Types</option>
            <option value="server">Server</option>
            <option value="workstation">Workstation</option>
            <option value="printer">Printer</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="firewall">Firewall</option>
          </select>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{ipAddresses.length} addresses</span>
          </div>
        </div>
      </div>

      {/* IP Addresses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostname</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ipAddresses
                .filter(ip => !selectedSubnet || ip.subnetId === selectedSubnet)
                .filter(ip => !searchTerm || 
                  ip.ip.includes(searchTerm) || 
                  (ip.hostname && ip.hostname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (ip.assignedTo && ip.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((ip) => {
                  const Icon = getDeviceIcon(ip.deviceType);
                  return (
                    <tr key={ip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ip.ip}</div>
                        {ip.macAddress && (
                          <div className="text-xs text-gray-500">{ip.macAddress}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ip.hostname || '-'}</div>
                        {ip.description && (
                          <div className="text-xs text-gray-500">{ip.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 capitalize">{ip.deviceType.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ip.status)}`}>
                          {ip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ip.assignedTo || '-'}</div>
                        {ip.department && (
                          <div className="text-xs text-gray-500">{ip.department}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {ip.lastSeen ? ip.lastSeen.toLocaleString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'subnets', label: 'Subnets', icon: Network },
    { id: 'addresses', label: 'IP Addresses', icon: Globe },
    { id: 'vlans', label: 'VLANs', icon: Router },
    { id: 'scanning', label: 'Network Scanning', icon: RefreshCw }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Network className="w-8 h-8 mr-3 text-blue-600" />
            IP Address Management
          </h1>
          <p className="text-gray-600 mt-1">
            Enterprise network management and IP address tracking
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Sync Network</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm rounded-xl">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'subnets' && renderSubnets()}
        {activeTab === 'addresses' && renderIPAddresses()}
        {activeTab === 'vlans' && (
          <div className="text-center py-12">
            <Router className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">VLAN Management</h3>
            <p className="text-gray-500">VLAN configuration and management coming soon...</p>
          </div>
        )}
        {activeTab === 'scanning' && (
          <div className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Network Scanning</h3>
            <p className="text-gray-500">Automated network discovery and scanning tools coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPAMDashboard;
