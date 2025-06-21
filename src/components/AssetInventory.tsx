import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Clock,
  MapPin,
  User,
  Tag,
  Laptop,
  Monitor,
  Server,
  Printer,
  Smartphone,
  Tablet,
  HardDrive,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockOrganizations } from '../data/mockData';
import { Asset, AssetCategory, AssetStatus, AssetCondition, MaintenanceRecord, AssetStats } from '../types';

const AssetInventory: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [stats, setStats] = useState<AssetStats>({
    totalAssets: 0,
    activeAssets: 0,
    maintenanceAssets: 0,
    retiredAssets: 0,
    totalValue: 0,
    assetsByCategory: {} as Record<AssetCategory, number>,
    assetsByStatus: {} as Record<AssetStatus, number>,
    warrantyExpiring: [],
    recentAssets: []
  });

  const [newAsset, setNewAsset] = useState({
    assetTag: '',
    name: '',
    category: 'computer' as AssetCategory,
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    status: 'active' as AssetStatus,
    condition: 'excellent' as AssetCondition,
    organizationId: user?.organizationId || '',
    organizationName: user?.organizationName || '',
    department: user?.department || '',
    assignedTo: '',
    assignedToEmail: '',
    location: '',
    purchaseDate: new Date(),
    warrantyExpiry: undefined as Date | undefined,
    purchasePrice: 0,
    currentValue: 0,
    supplier: '',
    notes: '',
    specifications: {} as Record<string, string>
  });

  const assetCategories = [
    { id: 'computer', label: 'Desktop Computer', icon: Monitor, color: 'bg-blue-100 text-blue-800' },
    { id: 'laptop', label: 'Laptop', icon: Laptop, color: 'bg-green-100 text-green-800' },
    { id: 'server', label: 'Server', icon: Server, color: 'bg-purple-100 text-purple-800' },
    { id: 'network', label: 'Network Equipment', icon: HardDrive, color: 'bg-orange-100 text-orange-800' },
    { id: 'printer', label: 'Printer', icon: Printer, color: 'bg-gray-100 text-gray-800' },
    { id: 'phone', label: 'Phone', icon: Smartphone, color: 'bg-pink-100 text-pink-800' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'monitor', label: 'Monitor', icon: Monitor, color: 'bg-cyan-100 text-cyan-800' },
    { id: 'peripheral', label: 'Peripheral', icon: Package, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'software', label: 'Software License', icon: Package, color: 'bg-red-100 text-red-800' },
    { id: 'security', label: 'Security Device', icon: Shield, color: 'bg-emerald-100 text-emerald-800' },
    { id: 'other', label: 'Other', icon: Package, color: 'bg-slate-100 text-slate-800' }
  ];

  const assetStatuses = [
    { id: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { id: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { id: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'retired', label: 'Retired', color: 'bg-red-100 text-red-800' },
    { id: 'lost', label: 'Lost', color: 'bg-orange-100 text-orange-800' },
    { id: 'stolen', label: 'Stolen', color: 'bg-red-100 text-red-800' },
    { id: 'disposed', label: 'Disposed', color: 'bg-gray-100 text-gray-800' }
  ];

  const assetConditions = [
    { id: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
    { id: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
    { id: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'poor', label: 'Poor', color: 'bg-orange-100 text-orange-800' },
    { id: 'damaged', label: 'Damaged', color: 'bg-red-100 text-red-800' }
  ];

  const departments = [
    'IT', 'Security Operations', 'Administration', 'Finance', 'HR', 'Operations', 
    'Management', 'Incident Response', 'Compliance', 'Engineering', 'Sales', 'Marketing', 'Front Office', 'F&B Production', 'F&B Service', 'Housekeeping'
  ];

  // Load assets from localStorage
  useEffect(() => {
    const storedAssets = localStorage.getItem('assets');
    if (storedAssets) {
      const parsedAssets = JSON.parse(storedAssets).map((asset: any) => ({
        ...asset,
        purchaseDate: new Date(asset.purchaseDate),
        warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry) : undefined,
        createdAt: new Date(asset.createdAt),
        updatedAt: new Date(asset.updatedAt),
        maintenanceHistory: asset.maintenanceHistory?.map((record: any) => ({
          ...record,
          date: new Date(record.date),
          nextMaintenanceDate: record.nextMaintenanceDate ? new Date(record.nextMaintenanceDate) : undefined
        })) || []
      }));
      setAssets(parsedAssets);
    }
  }, []);

  // Save assets to localStorage and update stats
  useEffect(() => {
    if (assets.length >= 0) {
      localStorage.setItem('assets', JSON.stringify(assets));
      updateStats();
    }
  }, [assets]);

  const updateStats = () => {
    const filteredAssets = getFilteredAssets();
    
    const totalAssets = filteredAssets.length;
    const activeAssets = filteredAssets.filter(a => a.status === 'active').length;
    const maintenanceAssets = filteredAssets.filter(a => a.status === 'maintenance').length;
    const retiredAssets = filteredAssets.filter(a => a.status === 'retired').length;
    const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.currentValue, 0);

    const assetsByCategory: Record<AssetCategory, number> = {} as Record<AssetCategory, number>;
    const assetsByStatus: Record<AssetStatus, number> = {} as Record<AssetStatus, number>;

    filteredAssets.forEach(asset => {
      assetsByCategory[asset.category] = (assetsByCategory[asset.category] || 0) + 1;
      assetsByStatus[asset.status] = (assetsByStatus[asset.status] || 0) + 1;
    });

    const warrantyExpiring = filteredAssets.filter(asset => {
      if (!asset.warrantyExpiry) return false;
      const daysUntilExpiry = Math.ceil((asset.warrantyExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });

    const recentAssets = filteredAssets
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    setStats({
      totalAssets,
      activeAssets,
      maintenanceAssets,
      retiredAssets,
      totalValue,
      assetsByCategory,
      assetsByStatus,
      warrantyExpiring,
      recentAssets
    });
  };

  const getFilteredAssets = () => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || asset.category === filterCategory;
      const matchesStatus = !filterStatus || asset.status === filterStatus;
      const matchesOrg = !filterOrg || asset.organizationId === filterOrg;
      
      // Permission check
      const hasPermission = user?.role === 'super_admin' || 
                           (user?.role === 'org_admin' && asset.organizationId === user.organizationId) ||
                           (user?.role === 'it_support' && asset.organizationId === user.organizationId);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesOrg && hasPermission;
    });
  };

  const generateAssetTag = (): string => {
    const prefix = user?.organizationName?.substring(0, 3).toUpperCase() || 'AST';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.assetTag) return;

    const asset: Asset = {
      id: Date.now().toString(),
      assetTag: newAsset.assetTag,
      name: newAsset.name,
      category: newAsset.category,
      type: newAsset.type,
      brand: newAsset.brand,
      model: newAsset.model,
      serialNumber: newAsset.serialNumber,
      status: newAsset.status,
      condition: newAsset.condition,
      organizationId: newAsset.organizationId,
      organizationName: newAsset.organizationName,
      department: newAsset.department,
      assignedTo: newAsset.assignedTo,
      assignedToEmail: newAsset.assignedToEmail,
      location: newAsset.location,
      purchaseDate: newAsset.purchaseDate,
      warrantyExpiry: newAsset.warrantyExpiry,
      purchasePrice: newAsset.purchasePrice,
      currentValue: newAsset.currentValue,
      supplier: newAsset.supplier,
      notes: newAsset.notes,
      maintenanceHistory: [],
      specifications: newAsset.specifications,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAssets(prev => [...prev, asset]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setNewAsset({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      type: asset.type,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      status: asset.status,
      condition: asset.condition,
      organizationId: asset.organizationId,
      organizationName: asset.organizationName,
      department: asset.department,
      assignedTo: asset.assignedTo || '',
      assignedToEmail: asset.assignedToEmail || '',
      location: asset.location,
      purchaseDate: asset.purchaseDate,
      warrantyExpiry: asset.warrantyExpiry,
      purchasePrice: asset.purchasePrice,
      currentValue: asset.currentValue,
      supplier: asset.supplier,
      notes: asset.notes,
      specifications: asset.specifications
    });
  };

  const handleUpdateAsset = () => {
    if (!editingAsset || !newAsset.name || !newAsset.assetTag) return;

    setAssets(prev => prev.map(a => 
      a.id === editingAsset.id 
        ? {
            ...a,
            assetTag: newAsset.assetTag,
            name: newAsset.name,
            category: newAsset.category,
            type: newAsset.type,
            brand: newAsset.brand,
            model: newAsset.model,
            serialNumber: newAsset.serialNumber,
            status: newAsset.status,
            condition: newAsset.condition,
            organizationId: newAsset.organizationId,
            organizationName: newAsset.organizationName,
            department: newAsset.department,
            assignedTo: newAsset.assignedTo,
            assignedToEmail: newAsset.assignedToEmail,
            location: newAsset.location,
            purchaseDate: newAsset.purchaseDate,
            warrantyExpiry: newAsset.warrantyExpiry,
            purchasePrice: newAsset.purchasePrice,
            currentValue: newAsset.currentValue,
            supplier: newAsset.supplier,
            notes: newAsset.notes,
            specifications: newAsset.specifications,
            updatedAt: new Date()
          }
        : a
    ));

    setEditingAsset(null);
    resetForm();
  };

  const handleDeleteAsset = (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      setAssets(prev => prev.filter(a => a.id !== assetId));
    }
  };

  const resetForm = () => {
    setNewAsset({
      assetTag: '',
      name: '',
      category: 'computer',
      type: '',
      brand: '',
      model: '',
      serialNumber: '',
      status: 'active',
      condition: 'excellent',
      organizationId: user?.organizationId || '',
      organizationName: user?.organizationName || '',
      department: user?.department || '',
      assignedTo: '',
      assignedToEmail: '',
      location: '',
      purchaseDate: new Date(),
      warrantyExpiry: undefined,
      purchasePrice: 0,
      currentValue: 0,
      supplier: '',
      notes: '',
      specifications: {}
    });
  };

  const getCategoryIcon = (category: AssetCategory) => {
    const categoryData = assetCategories.find(c => c.id === category);
    return categoryData ? categoryData.icon : Package;
  };

  const getCategoryColor = (category: AssetCategory) => {
    const categoryData = assetCategories.find(c => c.id === category);
    return categoryData ? categoryData.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: AssetStatus) => {
    const statusData = assetStatuses.find(s => s.id === status);
    return statusData ? statusData.color : 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: AssetCondition) => {
    const conditionData = assetConditions.find(c => c.id === condition);
    return conditionData ? conditionData.color : 'bg-gray-100 text-gray-800';
  };

  const filteredAssets = getFilteredAssets();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            IT Assets Inventory
          </h1>
          <p className="text-gray-600 mt-1">Manage and track IT assets across organizations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{showStats ? 'Hide Stats' : 'Show Stats'}</span>
          </button>
          <button
            onClick={() => {
              setNewAsset(prev => ({ ...prev, assetTag: generateAssetTag() }));
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Assets"
            value={stats.totalAssets}
            icon={<Package className="w-6 h-6 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Active Assets"
            value={stats.activeAssets}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="In Maintenance"
            value={stats.maintenanceAssets}
            icon={<Wrench className="w-6 h-6 text-yellow-600" />}
            color="bg-yellow-100"
          />
          <StatCard
            title="Retired Assets"
            value={stats.retiredAssets}
            icon={<XCircle className="w-6 h-6 text-red-600" />}
            color="bg-red-100"
          />
          <StatCard
            title="Total Value"
            value={`NPR ${stats.totalValue.toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-purple-600" />}
            color="bg-purple-100"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {assetCategories.map(category => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {assetStatuses.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
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
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredAssets.length} assets found</span>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const CategoryIcon = getCategoryIcon(asset.category);
          const isWarrantyExpiring = asset.warrantyExpiry && 
            Math.ceil((asset.warrantyExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30;
          
      return (
            <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(asset.category)}`}>
                    <CategoryIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Tag className="w-3 h-3 mr-1" />
                      {asset.assetTag}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {isWarrantyExpiring && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" title="Warranty expiring soon" />
                  )}
                  <button
                    onClick={() => setViewingAsset(asset)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{asset.brand}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{asset.model}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Condition:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.condition)}`}>
                    {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">NPR {asset.currentValue.toLocaleString()}</span>
                </div>
                {asset.assignedTo && (
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    Assigned to {asset.assignedTo}
                  </div>
                )}
                {asset.location && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {asset.location}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewingAsset(asset)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditAsset(asset)}
                    className="text-green-600 hover:text-green-900 p-1 rounded"
                    title="Edit Asset"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Building className="w-3 h-3" />
                  <span>{asset.organizationName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first IT asset.</p>
          <button
            onClick={() => {
              setNewAsset(prev => ({ ...prev, assetTag: generateAssetTag() }));
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add First Asset
          </button>
        </div>
      )}

      {/* Add/Edit Asset Modal */}
      {(showAddModal || editingAsset) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    value={newAsset.assetTag}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, assetTag: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ITA-123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dell OptiPlex 7090"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, category: e.target.value as AssetCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {assetCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    value={newAsset.type}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Desktop Computer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={newAsset.brand}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dell"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={newAsset.model}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="OptiPlex 7090"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC123DEF456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newAsset.status}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, status: e.target.value as AssetStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {assetStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, condition: e.target.value as AssetCondition }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {assetConditions.map(condition => (
                      <option key={condition.id} value={condition.id}>{condition.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organization & Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  {user?.role === 'super_admin' ? (
                    <select
                      value={newAsset.organizationId}
                      onChange={(e) => {
                        const org = mockOrganizations.find(o => o.id === e.target.value);
                        setNewAsset(prev => ({ 
                          ...prev, 
                          organizationId: e.target.value,
                          organizationName: org?.name || ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Organization</option>
                      {mockOrganizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newAsset.organizationName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={newAsset.department}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={newAsset.assignedTo}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Abi Paudel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Email</label>
                  <input
                    type="email"
                    value={newAsset.assignedToEmail}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, assignedToEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="paudel.abi@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Office Office , Desk 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newAsset.supplier}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dell Technologies"
                  />
                </div>
              </div>

              {/* Financial & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={newAsset.purchaseDate.toISOString().split('T')[0]}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, purchaseDate: new Date(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={newAsset.warrantyExpiry ? newAsset.warrantyExpiry.toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewAsset(prev => ({ 
                      ...prev, 
                      warrantyExpiry: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    value={newAsset.purchasePrice}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                  <input
                    type="number"
                    value={newAsset.currentValue}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about this asset..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAsset(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingAsset ? handleUpdateAsset : handleAddAsset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {editingAsset ? 'Update Asset' : 'Add Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {viewingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Asset Details</h3>
                <button
                  onClick={() => setViewingAsset(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Asset Header */}
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor(viewingAsset.category)}`}>
                  {React.createElement(getCategoryIcon(viewingAsset.category), { className: "w-8 h-8" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewingAsset.name}</h2>
                  <p className="text-gray-600">{viewingAsset.assetTag}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingAsset.status)}`}>
                      {viewingAsset.status.charAt(0).toUpperCase() + viewingAsset.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(viewingAsset.condition)}`}>
                      {viewingAsset.condition.charAt(0).toUpperCase() + viewingAsset.condition.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Asset Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{assetCategories.find(c => c.id === viewingAsset.category)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{viewingAsset.type || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span className="font-medium">{viewingAsset.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{viewingAsset.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serial Number:</span>
                      <span className="font-medium">{viewingAsset.serialNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Assignment & Location</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium">{viewingAsset.organizationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{viewingAsset.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned To:</span>
                      <span className="font-medium">{viewingAsset.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{viewingAsset.location || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium">{viewingAsset.supplier}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Financial Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Price:</span>
                      <span className="font-medium">NPR {viewingAsset.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Value:</span>
                      <span className="font-medium">NPR {viewingAsset.currentValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium">{viewingAsset.purchaseDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Warranty Expiry:</span>
                      <span className="font-medium">
                        {viewingAsset.warrantyExpiry ? viewingAsset.warrantyExpiry.toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">System Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{viewingAsset.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{viewingAsset.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingAsset.notes && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{viewingAsset.notes}</p>
                  </div>
                </div>
              )}

              {/* Maintenance History */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Maintenance History</h4>
                {viewingAsset.maintenanceHistory.length > 0 ? (
                  <div className="space-y-3">
                    {viewingAsset.maintenanceHistory.map((record) => (
                      <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{record.type.charAt(0).toUpperCase() + record.type.slice(1)}</span>
                          <span className="text-sm text-gray-500">{record.date.toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{record.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Performed by: {record.performedBy}</span>
                          <span className="text-gray-600">Cost: NPR {record.cost.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No maintenance records found</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setViewingAsset(null);
                  handleEditAsset(viewingAsset);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Edit Asset
              </button>
              <button
                onClick={() => setViewingAsset(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetInventory;
