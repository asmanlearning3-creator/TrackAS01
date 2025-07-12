import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// Company API
export const companyAPI = {
  // Get all companies
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new company
  async create(company: Tables['companies']['Insert']) {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update company status
  async updateStatus(id: string, status: Tables['companies']['Row']['status'], rejectionReason?: string) {
    const updates: Tables['companies']['Update'] = { 
      status,
      rejection_reason: rejectionReason || null
    };

    if (status === 'approved') {
      updates.tin_verified = true;
      updates.business_reg_verified = true;
      updates.documents_verified = true;
    }

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get approved companies
  async getApproved() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'approved')
      .order('name');
    
    if (error) throw error;
    return data;
  }
};

// Vehicle API
export const vehicleAPI = {
  // Get all vehicles
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        companies (
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new vehicle
  async create(vehicle: Tables['vehicles']['Insert']) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update vehicle status
  async updateStatus(id: string, status: Tables['vehicles']['Row']['status']) {
    const updates: Tables['vehicles']['Update'] = { status };

    if (status === 'verified') {
      updates.registration_verified = true;
      updates.insurance_verified = true;
      updates.license_verified = true;
      updates.availability = 'available';
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get available vehicles
  async getAvailable() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'verified')
      .eq('availability', 'available')
      .order('created_at');
    
    if (error) throw error;
    return data;
  }
};

// Shipment API
export const shipmentAPI = {
  // Get all shipments
  async getAll() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        shipment_updates (
          id,
          message,
          type,
          location,
          created_at
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new shipment
  async create(shipment: Tables['shipments']['Insert']) {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single();
    
    if (error) throw error;

    // Add initial update
    await this.addUpdate(data.id, 'Shipment created and awaiting operator assignment', 'info');
    
    return data;
  },

  // Update shipment
  async update(id: string, updates: Tables['shipments']['Update']) {
    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Add shipment update
  async addUpdate(shipmentId: string, message: string, type: 'info' | 'success' | 'warning' | 'error', location?: string) {
    const { data, error } = await supabase
      .from('shipment_updates')
      .insert({
        shipment_id: shipmentId,
        message,
        type,
        location
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get shipment by ID with updates
  async getById(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        shipment_updates (
          id,
          message,
          type,
          location,
          created_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to shipment updates
  subscribeToUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('shipment_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'shipments' 
        }, 
        callback
      )
      .subscribe();
  }
};

// Operator API
export const operatorAPI = {
  // Get all operators
  async getAll() {
    const { data, error } = await supabase
      .from('operators')
      .select(`
        *,
        vehicles (
          registration_number,
          type
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update operator status
  async updateStatus(id: string, status: 'available' | 'busy' | 'offline') {
    const { data, error } = await supabase
      .from('operators')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update operator location
  async updateLocation(id: string, location: string) {
    const { data, error } = await supabase
      .from('operators')
      .update({ current_location: location })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Customer API
export const customerAPI = {
  // Get all customers
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create or update customer
  async upsert(customer: Tables['customers']['Insert']) {
    const { data, error } = await supabase
      .from('customers')
      .upsert(customer, { onConflict: 'phone' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Notification API
export const notificationAPI = {
  // Get all notifications
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  },

  // Create notification
  async create(notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    user_id?: string;
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mark as read
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to notifications
  subscribeToNotifications(callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        callback
      )
      .subscribe();
  }
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics
  async getDashboardStats() {
    // Get shipment counts
    const { data: shipmentStats } = await supabase
      .from('shipments')
      .select('status, model, price')
      .not('status', 'eq', 'cancelled');

    // Get operator counts
    const { data: operatorStats } = await supabase
      .from('operators')
      .select('status, total_deliveries, earnings');

    // Calculate analytics
    const totalShipments = shipmentStats?.length || 0;
    const deliveredShipments = shipmentStats?.filter(s => s.status === 'delivered').length || 0;
    const successRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;
    const activeOperators = operatorStats?.filter(o => o.status !== 'offline').length || 0;
    const totalRevenue = shipmentStats?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;

    return {
      totalShipments,
      successRate: Math.round(successRate * 10) / 10,
      activeOperators,
      avgDeliveryTime: '2.4h', // This would need more complex calculation
      revenue: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      routeEfficiency: 94.2, // This would need route optimization data
      topRoutes: [], // Would need aggregation query
      operatorPerformance: [] // Would need aggregation query
    };
  },

  // Get real-time metrics
  async getRealTimeMetrics() {
    const { data: activeShipments } = await supabase
      .from('shipments')
      .select('status')
      .in('status', ['assigned', 'picked_up', 'in_transit']);

    const { data: availableOperators } = await supabase
      .from('operators')
      .select('status')
      .eq('status', 'available');

    return {
      activeShipments: activeShipments?.length || 0,
      availableOperators: availableOperators?.length || 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Real-time subscriptions
export const realtimeAPI = {
  // Subscribe to all table changes
  subscribeToAllChanges(callback: (payload: any) => void) {
    const channels = [
      supabase.channel('shipments').on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, callback),
      supabase.channel('operators').on('postgres_changes', { event: '*', schema: 'public', table: 'operators' }, callback),
      supabase.channel('vehicles').on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, callback),
      supabase.channel('companies').on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, callback),
    ];

    channels.forEach(channel => channel.subscribe());
    
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }
};

// Utility functions
export const utils = {
  // Generate shipment ID
  generateShipmentId(): string {
    const timestamp = Date.now().toString().slice(-3);
    return `TAS-2024-${timestamp}`;
  },

  // Format currency
  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString()}`;
  },

  // Calculate distance (placeholder - would integrate with maps API)
  async calculateDistance(from: string, to: string): Promise<number> {
    // This would integrate with Google Maps Distance Matrix API
    // For now, return a random distance
    return Math.floor(Math.random() * 500) + 50;
  },

  // Calculate price based on distance and weight
  calculatePrice(distance: number, weight: number, urgency: 'standard' | 'urgent' | 'express'): number {
    const baseRate = 10; // ₹10 per km
    const weightMultiplier = weight > 10 ? 1.5 : 1;
    const urgencyMultiplier = urgency === 'express' ? 2 : urgency === 'urgent' ? 1.5 : 1;
    
    return Math.round(distance * baseRate * weightMultiplier * urgencyMultiplier);
  }
};