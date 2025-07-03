import { supabase, logActivity } from '../lib/supabase';
import { Asset, AssetStatus, AssetCondition, AssetCategory } from '../types';

export class AssetService {
  // Create a new asset
  static async createAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          asset_tag: assetData.assetTag,
          name: assetData.name,
          category: assetData.category,
          type: assetData.type,
          brand: assetData.brand,
          model: assetData.model,
          serial_number: assetData.serialNumber,
          status: assetData.status,
          condition: assetData.condition,
          organization_id: assetData.organizationId,
          organization_name: assetData.organizationName,
          department: assetData.department,
          assigned_to: assetData.assignedTo,
          assigned_to_email: assetData.assignedToEmail,
          location: assetData.location,
          purchase_date: assetData.purchaseDate.toISOString().split('T')[0],
          warranty_expiry: assetData.warrantyExpiry?.toISOString().split('T')[0],
          purchase_price: assetData.purchasePrice,
          current_value: assetData.currentValue,
          supplier: assetData.supplier,
          notes: assetData.notes,
          specifications: assetData.specifications || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating asset:', error);
        return null;
      }

      // Log activity
      await logActivity(
        'system', // Could be passed from user context
        'CREATE',
        'asset',
        data.id,
        { asset_tag: data.asset_tag, name: data.name }
      );

      return this.convertDbAssetToAppAsset(data);
    } catch (err) {
      console.error('Error creating asset:', err);
      return null;
    }
  }

  // Get all assets for a user based on their role and organization
  static async getAssets(userRole: string, organizationId: string): Promise<Asset[]> {
    try {
      let query = supabase.from('assets').select('*');

      // Apply filters based on user role
      if (userRole === 'super_admin') {
        // Super admin can see all assets
      } else {
        // Other roles can only see assets in their organization
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        return [];
      }

      return data?.map(asset => this.convertDbAssetToAppAsset(asset)) || [];
    } catch (err) {
      console.error('Error fetching assets:', err);
      return [];
    }
  }

  // Update asset
  static async updateAsset(
    assetId: string,
    updateData: Partial<Asset>,
    userEmail: string
  ): Promise<boolean> {
    try {
      const dbUpdateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map application fields to database fields
      if (updateData.assetTag) dbUpdateData.asset_tag = updateData.assetTag;
      if (updateData.name) dbUpdateData.name = updateData.name;
      if (updateData.category) dbUpdateData.category = updateData.category;
      if (updateData.type) dbUpdateData.type = updateData.type;
      if (updateData.brand) dbUpdateData.brand = updateData.brand;
      if (updateData.model) dbUpdateData.model = updateData.model;
      if (updateData.serialNumber) dbUpdateData.serial_number = updateData.serialNumber;
      if (updateData.status) dbUpdateData.status = updateData.status;
      if (updateData.condition) dbUpdateData.condition = updateData.condition;
      if (updateData.organizationId) dbUpdateData.organization_id = updateData.organizationId;
      if (updateData.organizationName) dbUpdateData.organization_name = updateData.organizationName;
      if (updateData.department) dbUpdateData.department = updateData.department;
      if (updateData.assignedTo !== undefined) dbUpdateData.assigned_to = updateData.assignedTo;
      if (updateData.assignedToEmail !== undefined) dbUpdateData.assigned_to_email = updateData.assignedToEmail;
      if (updateData.location) dbUpdateData.location = updateData.location;
      if (updateData.purchaseDate) dbUpdateData.purchase_date = updateData.purchaseDate.toISOString().split('T')[0];
      if (updateData.warrantyExpiry !== undefined) {
        dbUpdateData.warranty_expiry = updateData.warrantyExpiry?.toISOString().split('T')[0] || null;
      }
      if (updateData.purchasePrice !== undefined) dbUpdateData.purchase_price = updateData.purchasePrice;
      if (updateData.currentValue !== undefined) dbUpdateData.current_value = updateData.currentValue;
      if (updateData.supplier) dbUpdateData.supplier = updateData.supplier;
      if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes;
      if (updateData.specifications) dbUpdateData.specifications = updateData.specifications;

      const { error } = await supabase
        .from('assets')
        .update(dbUpdateData)
        .eq('id', assetId);

      if (error) {
        console.error('Error updating asset:', error);
        return false;
      }

      // Log activity
      await logActivity(
        userEmail,
        'UPDATE',
        'asset',
        assetId,
        { updated_fields: Object.keys(updateData) }
      );

      return true;
    } catch (err) {
      console.error('Error updating asset:', err);
      return false;
    }
  }

  // Delete asset
  static async deleteAsset(assetId: string, userEmail: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) {
        console.error('Error deleting asset:', error);
        return false;
      }

      // Log activity
      await logActivity(
        userEmail,
        'DELETE',
        'asset',
        assetId,
        {}
      );

      return true;
    } catch (err) {
      console.error('Error deleting asset:', err);
      return false;
    }
  }

  // Convert database asset format to application format
  private static convertDbAssetToAppAsset(dbAsset: any): Asset {
    return {
      id: dbAsset.id,
      assetTag: dbAsset.asset_tag,
      name: dbAsset.name,
      category: dbAsset.category,
      type: dbAsset.type || '',
      brand: dbAsset.brand || '',
      model: dbAsset.model || '',
      serialNumber: dbAsset.serial_number || '',
      status: dbAsset.status,
      condition: dbAsset.condition || 'good',
      organizationId: dbAsset.organization_id,
      organizationName: dbAsset.organization_name,
      department: dbAsset.department || '',
      assignedTo: dbAsset.assigned_to,
      assignedToEmail: dbAsset.assigned_to_email,
      location: dbAsset.location || '',
      purchaseDate: new Date(dbAsset.purchase_date || Date.now()),
      warrantyExpiry: dbAsset.warranty_expiry ? new Date(dbAsset.warranty_expiry) : undefined,
      purchasePrice: dbAsset.purchase_price || 0,
      currentValue: dbAsset.current_value || 0,
      supplier: dbAsset.supplier || '',
      notes: dbAsset.notes || '',
      maintenanceHistory: [], // Would need separate query for maintenance records
      specifications: dbAsset.specifications || {},
      createdAt: new Date(dbAsset.created_at),
      updatedAt: new Date(dbAsset.updated_at)
    };
  }

  // Generate unique asset tag
  static generateAssetTag(organizationName: string): string {
    const prefix = organizationName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }
}
