/*
  # Complete IT & SOC Support System Database Schema

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `domain` (text)
      - `is_active` (boolean)
      - `settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text)
      - `organization_id` (uuid, foreign key)
      - `organization_name` (text)
      - `department` (text)
      - `is_active` (boolean)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tickets`
      - `id` (uuid, primary key)
      - `ticket_number` (text, unique)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `priority` (text)
      - `status` (text)
      - `organization_id` (uuid, foreign key)
      - `organization_name` (text)
      - `department` (text)
      - `submitter_id` (uuid, foreign key)
      - `submitter_email` (text)
      - `assigned_to` (uuid, foreign key)
      - `assigned_to_email` (text)
      - `attachments` (jsonb)
      - `sla_deadline` (timestamp)
      - `resolved_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ticket_notes`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key)
      - `content` (text)
      - `author_id` (uuid, foreign key)
      - `author_email` (text)
      - `is_internal` (boolean)
      - `created_at` (timestamp)
    
    - `assets`
      - `id` (uuid, primary key)
      - `asset_tag` (text, unique)
      - `name` (text)
      - `category` (text)
      - `type` (text)
      - `brand` (text)
      - `model` (text)
      - `serial_number` (text)
      - `status` (text)
      - `condition` (text)
      - `organization_id` (uuid, foreign key)
      - `organization_name` (text)
      - `department` (text)
      - `assigned_to` (text)
      - `assigned_to_email` (text)
      - `location` (text)
      - `purchase_date` (date)
      - `warranty_expiry` (date)
      - `purchase_price` (decimal)
      - `current_value` (decimal)
      - `supplier` (text)
      - `notes` (text)
      - `specifications` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `asset_maintenance`
      - `id` (uuid, primary key)
      - `asset_id` (uuid, foreign key)
      - `maintenance_date` (date)
      - `maintenance_type` (text)
      - `description` (text)
      - `cost` (decimal)
      - `performed_by` (text)
      - `next_maintenance_date` (date)
      - `created_at` (timestamp)
    
    - `ipam_subnets`
      - `id` (uuid, primary key)
      - `name` (text)
      - `network` (inet)
      - `cidr` (integer)
      - `gateway` (inet)
      - `description` (text)
      - `vlan_id` (integer)
      - `organization_id` (uuid, foreign key)
      - `organization_name` (text)
      - `location` (text)
      - `status` (text)
      - `utilization` (integer)
      - `total_ips` (integer)
      - `used_ips` (integer)
      - `available_ips` (integer)
      - `tags` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ipam_addresses`
      - `id` (uuid, primary key)
      - `ip_address` (inet)
      - `subnet_id` (uuid, foreign key)
      - `hostname` (text)
      - `mac_address` (macaddr)
      - `device_type` (text)
      - `status` (text)
      - `assigned_to` (text)
      - `assigned_to_email` (text)
      - `department` (text)
      - `description` (text)
      - `last_seen` (timestamp)
      - `organization_id` (uuid, foreign key)
      - `organization_name` (text)
      - `tags` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ipam_vlans`
      - `id` (uuid, primary key)
      - `vlan_id` (integer)
      - `name` (text)
      - `description` (text)
      - `organization_id` (uuid, foreign key)
      - `organization_name` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `user_email` (text)
      - `action` (text)
      - `resource_type` (text)
      - `resource_id` (uuid)
      - `details` (jsonb)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on organization access
    - Add policies for super admins to access all data
    - Add policies for org admins to access their organization data
    - Add policies for support staff to access tickets and assets

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for common filter combinations
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'it_support', 'soc_analyst', 'end_user')),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name text,
  department text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed', 'escalated')),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name text,
  department text,
  submitter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  submitter_email text NOT NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_to_email text,
  attachments jsonb DEFAULT '[]',
  sla_deadline timestamptz NOT NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket notes table
CREATE TABLE IF NOT EXISTS ticket_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  author_email text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  type text,
  brand text,
  model text,
  serial_number text,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance', 'retired', 'lost', 'stolen', 'disposed')),
  condition text CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name text,
  department text,
  assigned_to text,
  assigned_to_email text,
  location text,
  purchase_date date,
  warranty_expiry date,
  purchase_price decimal(10,2) DEFAULT 0,
  current_value decimal(10,2) DEFAULT 0,
  supplier text,
  notes text,
  specifications jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create asset maintenance table
CREATE TABLE IF NOT EXISTS asset_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_date date NOT NULL,
  maintenance_type text NOT NULL CHECK (maintenance_type IN ('repair', 'maintenance', 'upgrade', 'inspection')),
  description text NOT NULL,
  cost decimal(10,2) DEFAULT 0,
  performed_by text NOT NULL,
  next_maintenance_date date,
  created_at timestamptz DEFAULT now()
);

-- Create IPAM subnets table
CREATE TABLE IF NOT EXISTS ipam_subnets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  network inet NOT NULL,
  cidr integer NOT NULL CHECK (cidr >= 8 AND cidr <= 30),
  gateway inet NOT NULL,
  description text,
  vlan_id integer,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name text,
  location text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'reserved', 'deprecated')),
  utilization integer DEFAULT 0 CHECK (utilization >= 0 AND utilization <= 100),
  total_ips integer DEFAULT 0,
  used_ips integer DEFAULT 0,
  available_ips integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create IPAM addresses table
CREATE TABLE IF NOT EXISTS ipam_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  subnet_id uuid REFERENCES ipam_subnets(id) ON DELETE CASCADE,
  hostname text,
  mac_address macaddr,
  device_type text DEFAULT 'workstation' CHECK (device_type IN ('server', 'workstation', 'printer', 'router', 'switch', 'firewall', 'access_point', 'camera', 'phone', 'iot', 'other')),
  status text DEFAULT 'allocated' CHECK (status IN ('allocated', 'reserved', 'available', 'offline', 'conflict')),
  assigned_to text,
  assigned_to_email text,
  department text,
  description text,
  last_seen timestamptz,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ip_address, subnet_id)
);

-- Create IPAM VLANs table
CREATE TABLE IF NOT EXISTS ipam_vlans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vlan_id integer NOT NULL,
  name text NOT NULL,
  description text,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vlan_id, organization_id)
);

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_email text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipam_subnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipam_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipam_vlans ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Super admins can manage all organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Org admins can view their organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = organizations.id
      AND users.role IN ('org_admin', 'it_support', 'soc_analyst', 'end_user')
    )
  );

-- Users policies
CREATE POLICY "Super admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'super_admin'
    )
  );

CREATE POLICY "Org admins can manage users in their organization"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'org_admin'
      AND u.organization_id = users.organization_id
    )
  );

CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (users.id = auth.uid());

-- Tickets policies
CREATE POLICY "Super admins can manage all tickets"
  ON tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Org staff can manage tickets in their organization"
  ON tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = tickets.organization_id
      AND users.role IN ('org_admin', 'it_support', 'soc_analyst')
    )
  );

CREATE POLICY "Users can view and create tickets in their organization"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = tickets.organization_id
    )
    OR tickets.submitter_id = auth.uid()
    OR tickets.assigned_to = auth.uid()
  );

CREATE POLICY "Users can create tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = tickets.organization_id
    )
  );

-- Ticket notes policies
CREATE POLICY "Users can manage notes for accessible tickets"
  ON ticket_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN users u ON u.id = auth.uid()
      WHERE t.id = ticket_notes.ticket_id
      AND (
        u.role = 'super_admin'
        OR (u.organization_id = t.organization_id AND u.role IN ('org_admin', 'it_support', 'soc_analyst'))
        OR t.submitter_id = auth.uid()
        OR t.assigned_to = auth.uid()
      )
    )
  );

-- Assets policies
CREATE POLICY "Super admins can manage all assets"
  ON assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Org staff can manage assets in their organization"
  ON assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = assets.organization_id
      AND users.role IN ('org_admin', 'it_support')
    )
  );

-- Asset maintenance policies
CREATE POLICY "Users can manage maintenance for accessible assets"
  ON asset_maintenance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assets a
      JOIN users u ON u.id = auth.uid()
      WHERE a.id = asset_maintenance.asset_id
      AND (
        u.role = 'super_admin'
        OR (u.organization_id = a.organization_id AND u.role IN ('org_admin', 'it_support'))
      )
    )
  );

-- IPAM subnets policies
CREATE POLICY "Super admins can manage all subnets"
  ON ipam_subnets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Org staff can manage subnets in their organization"
  ON ipam_subnets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = ipam_subnets.organization_id
      AND users.role IN ('org_admin', 'it_support')
    )
  );

-- IPAM addresses policies
CREATE POLICY "Super admins can manage all IP addresses"
  ON ipam_addresses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Org staff can manage IP addresses in their organization"
  ON ipam_addresses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = ipam_addresses.organization_id
      AND users.role IN ('org_admin', 'it_support')
    )
  );

-- IPAM VLANs policies
CREATE POLICY "Super admins can manage all VLANs"
  ON ipam_vlans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Org staff can manage VLANs in their organization"
  ON ipam_vlans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = ipam_vlans.organization_id
      AND users.role IN ('org_admin', 'it_support')
    )
  );

-- Activity logs policies
CREATE POLICY "Super admins can view all activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (activity_logs.user_id = auth.uid());

CREATE POLICY "All authenticated users can create activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_tickets_organization_id ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_submitter_id ON tickets(submitter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);

CREATE INDEX IF NOT EXISTS idx_ticket_notes_ticket_id ON ticket_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_notes_author_id ON ticket_notes(author_id);

CREATE INDEX IF NOT EXISTS idx_assets_organization_id ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);

CREATE INDEX IF NOT EXISTS idx_asset_maintenance_asset_id ON asset_maintenance(asset_id);

CREATE INDEX IF NOT EXISTS idx_ipam_subnets_organization_id ON ipam_subnets(organization_id);
CREATE INDEX IF NOT EXISTS idx_ipam_addresses_subnet_id ON ipam_addresses(subnet_id);
CREATE INDEX IF NOT EXISTS idx_ipam_addresses_organization_id ON ipam_addresses(organization_id);
CREATE INDEX IF NOT EXISTS idx_ipam_addresses_ip_address ON ipam_addresses(ip_address);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipam_subnets_updated_at BEFORE UPDATE ON ipam_subnets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipam_addresses_updated_at BEFORE UPDATE ON ipam_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipam_vlans_updated_at BEFORE UPDATE ON ipam_vlans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
