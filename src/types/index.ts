export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'org_admin' | 'it_support' | 'soc_analyst' | 'end_user';
  organizationId: string;
  organizationName: string;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  settings: OrganizationSettings;
  createdAt: Date;
}

export interface OrganizationSettings {
  slaHours: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  categories: string[];
  departments: string[];
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  id: string;
  priority: TicketPriority;
  hoursBeforeEscalation: number;
  escalateTo: string[];
}

export interface Ticket {
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
  assignedTo?: string;
  assignedToEmail?: string;
  attachments: Attachment[];
  internalNotes: InternalNote[];
  slaDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface InternalNote {
  id: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  organizationId: string;
  organizationName: string;
  department: string;
  assignedTo?: string;
  assignedToEmail?: string;
  location: string;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  purchasePrice: number;
  currentValue: number;
  supplier: string;
  notes: string;
  maintenanceHistory: MaintenanceRecord[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'repair' | 'maintenance' | 'upgrade' | 'inspection';
  description: string;
  cost: number;
  performedBy: string;
  nextMaintenanceDate?: Date;
}

export type AssetCategory = 
  | 'computer'
  | 'laptop'
  | 'server'
  | 'network'
  | 'printer'
  | 'IPCamera'
  | 'phone'
  | 'tablet'
  | 'monitor'
  | 'peripheral'
  | 'software'
  | 'security'
  | 'other';

export type AssetStatus = 
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'retired'
  | 'lost'
  | 'stolen'
  | 'disposed';

export type AssetCondition = 
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'damaged';

export type TicketCategory = 
  | 'hardware'
  | 'software' 
  | 'network'
  | 'accounts'
  | 'email'
  | 'system'
  | 'phishing'
  | 'malware'
  | 'suspicious_login'
  | 'siem_alert'
  | 'vulnerability'
  | 'incident_response'
  | 'compliance';

export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export type TicketStatus = 
  | 'open'
  | 'in_progress'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'escalated';

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  slaBreaches: number;
  avgResolutionTime: number;
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByPriority: Record<TicketPriority, number>;
  recentTickets: Ticket[];
}

export interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  retiredAssets: number;
  totalValue: number;
  assetsByCategory: Record<AssetCategory, number>;
  assetsByStatus: Record<AssetStatus, number>;
  warrantyExpiring: Asset[];
  recentAssets: Asset[];
}
