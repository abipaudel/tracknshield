import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          domain: string;
          is_active: boolean;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          is_active?: boolean;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          is_active?: boolean;
          settings?: any;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          organization_id: string;
          organization_name: string;
          department: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: string;
          organization_id: string;
          organization_name: string;
          department?: string;
          is_active?: boolean;
          last_login?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          organization_id?: string;
          organization_name?: string;
          department?: string;
          is_active?: boolean;
          last_login?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          ticket_number: string;
          title: string;
          description: string;
          category: string;
          priority: string;
          status: string;
          organization_id: string;
          organization_name: string;
          department: string;
          submitter_id: string;
          submitter_email: string;
          assigned_to: string | null;
          assigned_to_email: string | null;
          attachments: any;
          sla_deadline: string;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_number: string;
          title: string;
          description: string;
          category: string;
          priority: string;
          status: string;
          organization_id: string;
          organization_name: string;
          department: string;
          submitter_id: string;
          submitter_email: string;
          assigned_to?: string;
          assigned_to_email?: string;
          attachments?: any;
          sla_deadline: string;
          resolved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          title?: string;
          description?: string;
          category?: string;
          priority?: string;
          status?: string;
          organization_id?: string;
          organization_name?: string;
          department?: string;
          submitter_id?: string;
          submitter_email?: string;
          assigned_to?: string;
          assigned_to_email?: string;
          attachments?: any;
          sla_deadline?: string;
          resolved_at?: string;
          updated_at?: string;
        };
      };
      ticket_notes: {
        Row: {
          id: string;
          ticket_id: string;
          content: string;
          author_id: string;
          author_email: string;
          is_internal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          content: string;
          author_id: string;
          author_email: string;
          is_internal?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          content?: string;
          author_id?: string;
          author_email?: string;
          is_internal?: boolean;
        };
      };
      assets: {
        Row: {
          id: string;
          asset_tag: string;
          name: string;
          category: string;
          type: string | null;
          brand: string | null;
          model: string | null;
          serial_number: string | null;
          status: string;
          condition: string | null;
          organization_id: string;
          organization_name: string;
          department: string | null;
          assigned_to: string | null;
          assigned_to_email: string | null;
          location: string | null;
          purchase_date: string | null;
          warranty_expiry: string | null;
          purchase_price: number;
          current_value: number;
          supplier: string | null;
          notes: string | null;
          specifications: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_tag: string;
          name: string;
          category: string;
          type?: string;
          brand?: string;
          model?: string;
          serial_number?: string;
          status: string;
          condition?: string;
          organization_id: string;
          organization_name: string;
          department?: string;
          assigned_to?: string;
          assigned_to_email?: string;
          location?: string;
          purchase_date?: string;
          warranty_expiry?: string;
          purchase_price?: number;
          current_value?: number;
          supplier?: string;
          notes?: string;
          specifications?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_tag?: string;
          name?: string;
          category?: string;
          type?: string;
          brand?: string;
          model?: string;
          serial_number?: string;
          status?: string;
          condition?: string;
          organization_id?: string;
          organization_name?: string;
          department?: string;
          assigned_to?: string;
          assigned_to_email?: string;
          location?: string;
          purchase_date?: string;
          warranty_expiry?: string;
          purchase_price?: number;
          current_value?: number;
          supplier?: string;
          notes?: string;
          specifications?: any;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: any;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          user_email: string;
          action: string;
          resource_type: string;
          resource_id?: string;
          details?: any;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          details?: any;
          ip_address?: string;
          user_agent?: string;
        };
      };
    };
  };
}

// Helper functions for database operations
export const logActivity = async (
  userEmail: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
) => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_email: userEmail,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: null, // Could be populated from request
        user_agent: navigator.userAgent
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};
