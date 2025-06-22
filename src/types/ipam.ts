export interface IPAMSubnet {
  id: string;
  name: string;
  network: string;
  cidr: number;
  gateway: string;
  description: string;
  vlanId?: number;
  organizationId: string;
  organizationName: string;
  location: string;
  status: 'active' | 'inactive' | 'reserved' | 'deprecated';
  utilization: number;
  totalIPs: number;
  usedIPs: number;
  availableIPs: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPAddress {
  id: string;
  ip: string;
  subnetId: string;
  hostname?: string;
  macAddress?: string;
  deviceType: 'server' | 'workstation' | 'printer' | 'router' | 'switch' | 'firewall' | 'access_point' | 'camera' | 'phone' | 'iot' | 'other';
  status: 'allocated' | 'reserved' | 'available' | 'offline' | 'conflict';
  assignedTo?: string;
  assignedToEmail?: string;
  department?: string;
  description: string;
  lastSeen?: Date;
  dnsRecords: DNSRecord[];
  organizationId: string;
  organizationName: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'PTR' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl: number;
}

export interface VLAN {
  id: string;
  vlanId: number;
  name: string;
  description: string;
  organizationId: string;
  organizationName: string;
  subnets: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IPAMStats {
  totalSubnets: number;
  totalIPs: number;
  allocatedIPs: number;
  availableIPs: number;
  reservedIPs: number;
  conflictIPs: number;
  utilizationPercentage: number;
  subnetsByStatus: Record<string, number>;
  devicesByType: Record<string, number>;
  topUtilizedSubnets: IPAMSubnet[];
  recentAllocations: IPAddress[];
}

export interface NetworkScan {
  id: string;
  subnetId: string;
  scanType: 'ping' | 'arp' | 'port' | 'full';
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  discoveredDevices: number;
  results: ScanResult[];
  createdBy: string;
}

export interface ScanResult {
  ip: string;
  hostname?: string;
  macAddress?: string;
  vendor?: string;
  openPorts?: number[];
  responseTime?: number;
  status: 'online' | 'offline';
}
