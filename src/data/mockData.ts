import { User, Organization, Ticket, DashboardStats, Asset } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'paudel.abi@gmail.com',
    role: 'super_admin',
    organizationId: 'global',
    organizationName: 'Global Administration',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'admin@soc1.com',
    role: 'org_admin',
    organizationId: 'soc1',
    organizationName: 'SOC Operations Alpha',
    department: 'Administration',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    email: 'it.support@soc2.com',
    role: 'it_support',
    organizationId: 'soc2',
    organizationName: 'SOC Operations Beta',
    department: 'IT Support',
    isActive: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '4',
    email: 'soc.analyst@soc3.com',
    role: 'soc_analyst',
    organizationId: 'soc3',
    organizationName: 'SOC Operations Gamma',
    department: 'Security Operations',
    isActive: true,
    createdAt: new Date('2024-02-15')
  },
  {
    id: '5',
    email: 'user@soc4.com',
    role: 'end_user',
    organizationId: 'soc4',
    organizationName: 'SOC Operations Delta',
    department: 'Finance',
    isActive: true,
    createdAt: new Date('2024-03-01')
  }
];

export const mockOrganizations: Organization[] = [
  {
    id: 'soc1',
    name: 'SOC Operations Alpha',
    domain: 'soc1.com',
    isActive: true,
    settings: {
      slaHours: { critical: 1, high: 4, medium: 24, low: 72 },
      categories: ['hardware', 'software', 'network', 'phishing', 'malware'],
      departments: ['IT', 'Security', 'Administration', 'Finance'],
      escalationRules: []
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'soc2',
    name: 'SOC Operations Beta',
    domain: 'soc2.com',
    isActive: true,
    settings: {
      slaHours: { critical: 2, high: 6, medium: 48, low: 96 },
      categories: ['hardware', 'software', 'network', 'accounts', 'email'],
      departments: ['IT Support', 'Operations', 'Management'],
      escalationRules: []
    },
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'soc3',
    name: 'SOC Operations Gamma',
    domain: 'soc3.com',
    isActive: true,
    settings: {
      slaHours: { critical: 1, high: 2, medium: 12, low: 48 },
      categories: ['siem_alert', 'vulnerability', 'incident_response', 'compliance'],
      departments: ['Security Operations', 'Incident Response', 'Compliance'],
      escalationRules: []
    },
    createdAt: new Date('2024-02-15')
  },
  {
    id: 'soc4',
    name: 'SOC Operations Delta',
    domain: 'soc4.com',
    isActive: true,
    settings: {
      slaHours: { critical: 4, high: 8, medium: 24, low: 72 },
      categories: ['hardware', 'software', 'accounts', 'email', 'system'],
      departments: ['Finance', 'HR', 'Operations', 'IT'],
      escalationRules: []
    },
    createdAt: new Date('2024-03-01')
    },
    {
    id: 'lpr',
    name: 'Lumbini Palace Resort',
    domain: 'lumbinipalace.com',
    isActive: true,
    settings: {
      slaHours: { critical: 4, high: 8, medium: 24, low: 72 },
      categories: ['hardware', 'software', 'accounts', 'email', 'system'],
      departments: ['Finance', 'HR', 'Operations', 'IT', 'Front Office', 'F&B Production', 'F&B Service'],
      escalationRules: []
    },
    createdAt: new Date('2024-03-01')
  },
];

export const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    title: 'Laptop not booting - Critical hardware failure',
    description: 'Employee laptop showing blue screen on startup. Unable to access work files.',
    category: 'hardware',
    priority: 'high',
    status: 'open',
    organizationId: 'soc1',
    organizationName: 'SOC Operations Alpha',
    department: 'Finance',
    submitterId: '2',
    submitterEmail: 'admin@soc1.com',
    attachments: [],
    internalNotes: [],
    slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    title: 'Suspicious phishing email received',
    description: 'Received email claiming to be from bank asking for credentials. Forwarding for analysis.',
    category: 'phishing',
    priority: 'critical',
    status: 'in_progress',
    organizationId: 'soc3',
    organizationName: 'SOC Operations Gamma',
    department: 'Security Operations',
    submitterId: '4',
    submitterEmail: 'soc.analyst@soc3.com',
    assignedTo: '4',
    assignedToEmail: 'soc.analyst@soc3.com',
    attachments: [],
    internalNotes: [],
    slaDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date()
  }
];

export const mockAssets: Asset[] = [
  {
    id: '1',
    assetTag: 'SOC-001234',
    name: 'Dell OptiPlex 7090',
    category: 'computer',
    type: 'Desktop Computer',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    serialNumber: 'DL7090ABC123',
    status: 'active',
    condition: 'excellent',
    organizationId: 'soc1',
    organizationName: 'SOC Operations Alpha',
    department: 'IT',
    assignedTo: 'Abi Paudel',
    assignedToEmail: 'paudel.abi@gmail.com',
    location: 'Office Floor 2, Desk 15',
    purchaseDate: new Date('2024-01-15'),
    warrantyExpiry: new Date('2027-01-15'),
    purchasePrice: 1200,
    currentValue: 800,
    supplier: 'Dell Technologies',
    notes: 'Primary workstation for IT department',
    maintenanceHistory: [],
    specifications: {
      'CPU': 'Intel Core i7-11700',
      'RAM': '16GB DDR4',
      'Storage': '512GB SSD',
      'OS': 'Windows 11 Pro'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    assetTag: 'SOC-001235',
    name: 'HP EliteBook 850 G8',
    category: 'laptop',
    type: 'Business Laptop',
    brand: 'HP',
    model: 'EliteBook 850 G8',
    serialNumber: 'HP850G8XYZ789',
    status: 'active',
    condition: 'good',
    organizationId: 'soc2',
    organizationName: 'SOC Operations Beta',
    department: 'Security Operations',
    assignedTo: 'Jane Smith',
    assignedToEmail: 'jane.smith@soc2.com',
    location: 'Remote Work',
    purchaseDate: new Date('2024-02-01'),
    warrantyExpiry: new Date('2027-02-01'),
    purchasePrice: 1500,
    currentValue: 1100,
    supplier: 'HP Inc.',
    notes: 'Mobile workstation for security analyst',
    maintenanceHistory: [],
    specifications: {
      'CPU': 'Intel Core i7-1165G7',
      'RAM': '32GB DDR4',
      'Storage': '1TB SSD',
      'OS': 'Windows 11 Pro'
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

export const mockDashboardStats: DashboardStats = {
  totalTickets: 156,
  openTickets: 23,
  inProgressTickets: 12,
  resolvedTickets: 121,
  slaBreaches: 3,
  avgResolutionTime: 18.5,
  ticketsByCategory: {
    hardware: 45,
    software: 32,
    network: 28,
    accounts: 15,
    email: 12,
    system: 8,
    phishing: 6,
    malware: 4,
    suspicious_login: 3,
    siem_alert: 2,
    vulnerability: 1,
    incident_response: 0,
    compliance: 0
  },
  ticketsByPriority: {
    critical: 8,
    high: 34,
    medium: 89,
    low: 25
  },
  recentTickets: mockTickets
};
