import { supabase, logActivity } from '../lib/supabase';
import { Ticket, TicketStatus, TicketPriority } from '../types';

export class TicketService {
  // Create a new ticket
  static async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket | null> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ticket_number: ticketData.ticketNumber,
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority,
          status: ticketData.status,
          organization_id: ticketData.organizationId,
          organization_name: ticketData.organizationName,
          department: ticketData.department,
          submitter_id: ticketData.submitterId,
          submitter_email: ticketData.submitterEmail,
          assigned_to: ticketData.assignedTo,
          assigned_to_email: ticketData.assignedToEmail,
          attachments: ticketData.attachments || [],
          sla_deadline: ticketData.slaDeadline.toISOString(),
          resolved_at: ticketData.resolvedAt?.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        return null;
      }

      // Log activity
      await logActivity(
        ticketData.submitterEmail,
        'CREATE',
        'ticket',
        data.id,
        { ticket_number: data.ticket_number, title: data.title }
      );

      // Convert database format to application format
      return this.convertDbTicketToAppTicket(data);
    } catch (err) {
      console.error('Error creating ticket:', err);
      return null;
    }
  }

  // Get all tickets for a user based on their role and organization
  static async getTickets(userEmail: string, userRole: string, organizationId: string): Promise<Ticket[]> {
    try {
      let query = supabase.from('tickets').select(`
        *,
        ticket_notes (
          id,
          content,
          author_email,
          is_internal,
          created_at
        )
      `);

      // Apply filters based on user role
      if (userRole === 'super_admin') {
        // Super admin can see all tickets
      } else if (userRole === 'org_admin' || userRole === 'it_support' || userRole === 'soc_analyst') {
        // Org staff can see tickets in their organization
        query = query.eq('organization_id', organizationId);
      } else {
        // End users can only see their own tickets or tickets assigned to them
        query = query.or(`submitter_email.eq.${userEmail},assigned_to_email.eq.${userEmail}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        return [];
      }

      return data?.map(ticket => this.convertDbTicketToAppTicket(ticket)) || [];
    } catch (err) {
      console.error('Error fetching tickets:', err);
      return [];
    }
  }

  // Update ticket status
  static async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    userEmail: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket status:', error);
        return false;
      }

      // Log activity
      await logActivity(
        userEmail,
        'UPDATE_STATUS',
        'ticket',
        ticketId,
        { new_status: status }
      );

      return true;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      return false;
    }
  }

  // Update ticket priority
  static async updateTicketPriority(
    ticketId: string,
    priority: TicketPriority,
    userEmail: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket priority:', error);
        return false;
      }

      // Log activity
      await logActivity(
        userEmail,
        'UPDATE_PRIORITY',
        'ticket',
        ticketId,
        { new_priority: priority }
      );

      return true;
    } catch (err) {
      console.error('Error updating ticket priority:', err);
      return false;
    }
  }

  // Assign ticket to user
  static async assignTicket(
    ticketId: string,
    assigneeEmail: string,
    userEmail: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          assigned_to_email: assigneeEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error assigning ticket:', error);
        return false;
      }

      // Log activity
      await logActivity(
        userEmail,
        'ASSIGN',
        'ticket',
        ticketId,
        { assigned_to: assigneeEmail }
      );

      return true;
    } catch (err) {
      console.error('Error assigning ticket:', err);
      return false;
    }
  }

  // Add comment/note to ticket
  static async addTicketNote(
    ticketId: string,
    content: string,
    authorEmail: string,
    isInternal: boolean = false
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ticket_notes')
        .insert({
          ticket_id: ticketId,
          content,
          author_email: authorEmail,
          is_internal: isInternal
        });

      if (error) {
        console.error('Error adding ticket note:', error);
        return false;
      }

      // Update ticket's updated_at timestamp
      await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      // Log activity
      await logActivity(
        authorEmail,
        isInternal ? 'ADD_INTERNAL_NOTE' : 'ADD_COMMENT',
        'ticket',
        ticketId,
        { content_length: content.length }
      );

      return true;
    } catch (err) {
      console.error('Error adding ticket note:', err);
      return false;
    }
  }

  // Delete ticket (only for submitters or admins)
  static async deleteTicket(ticketId: string, userEmail: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) {
        console.error('Error deleting ticket:', error);
        return false;
      }

      // Log activity
      await logActivity(
        userEmail,
        'DELETE',
        'ticket',
        ticketId,
        {}
      );

      return true;
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return false;
    }
  }

  // Convert database ticket format to application format
  private static convertDbTicketToAppTicket(dbTicket: any): Ticket {
    return {
      id: dbTicket.id,
      ticketNumber: dbTicket.ticket_number,
      title: dbTicket.title,
      description: dbTicket.description,
      category: dbTicket.category,
      priority: dbTicket.priority,
      status: dbTicket.status,
      organizationId: dbTicket.organization_id,
      organizationName: dbTicket.organization_name,
      department: dbTicket.department,
      submitterId: dbTicket.submitter_id,
      submitterEmail: dbTicket.submitter_email,
      assignedTo: dbTicket.assigned_to,
      assignedToEmail: dbTicket.assigned_to_email,
      attachments: dbTicket.attachments || [],
      internalNotes: dbTicket.ticket_notes?.map((note: any) => ({
        id: note.id,
        content: note.content,
        authorEmail: note.author_email,
        isInternal: note.is_internal,
        createdAt: new Date(note.created_at)
      })) || [],
      slaDeadline: new Date(dbTicket.sla_deadline),
      resolvedAt: dbTicket.resolved_at ? new Date(dbTicket.resolved_at) : undefined,
      createdAt: new Date(dbTicket.created_at),
      updatedAt: new Date(dbTicket.updated_at)
    };
  }

  // Generate unique ticket number
  static generateTicketNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `TKT-${year}-${random}`;
  }
}
