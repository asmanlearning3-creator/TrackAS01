import { supabase, dbHelpers } from '../lib/supabase';
import { isConnected } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// Base API class with common functionality
class BaseAPI {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected handleError(error: any, operation: string) {
    if (!isConnected) {
      console.warn(`${operation}: Supabase not connected. Using demo mode.`);
      return [] as never;
    }
    
    console.error(`${operation} error in ${this.tableName}:`, error);
    throw new Error(error.message || `Failed to ${operation.toLowerCase()}`);
  }

  protected async executeQuery(queryBuilder: any, operation: string) {
    // If not connected to Supabase, return empty array
    if (!isConnected) {
      console.warn('Supabase not connected. Please configure your .env file with valid credentials.');
      return [];
    }
    
    try {
      const { data, error } = await queryBuilder;
      if (error) this.handleError(error, operation);
      return data;
    } catch (err) {
      console.warn(`${operation} failed, using fallback:`, err);
      return this.getFallbackData(operation);
    }
  }

  protected getFallbackData(operation: string): any {
    // Return mock data when Supabase is not available
    switch (operation.toLowerCase()) {
      case 'get companies':
        return [];
      case 'get vehicles':
        return [];
      case 'get operators':
        return [];
      case 'get shipments':
        return [];
      default:
        return null;
    }
  }
}

// Company API with automation
export class CompanyAPI extends BaseAPI {
  constructor() {
    super('companies');
  }

  async getAll() {
    return this.executeQuery(
      supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false }),
      'Get companies'
    );
  }

  async getById(id: string) {
    return this.executeQuery(
      supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single(),
      'Get company by ID'
    );
  }

  async create(company: Tables['companies']['Insert']) {
    return this.executeQuery(
      supabase
        .from('companies')
        .insert(company)
        .select()
        .single(),
      'Create company'
    );
  }

  async update(id: string, updates: Tables['companies']['Update']) {
    return this.executeQuery(
      supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'Update company'
    );
  }

  async updateStatus(id: string, status: Tables['companies']['Row']['status'], rejectionReason?: string) {
    const updates: Tables['companies']['Update'] = { 
      status,
      rejection_reason: rejectionReason || null
    };

    if (status === 'approved') {
      updates.verification_status = {
        tin_verified: true,
        business_reg_verified: true,
        documents_verified: true
      };
    }

    return this.update(id, updates);
  }

  async getApproved() {
    return this.executeQuery(
      supabase
        .from('companies')
        .select('*')
        .eq('status', 'approved')
        .order('name'),
      'Get approved companies'
    );
  }

  async getByApiKey(apiKey: string) {
    return this.executeQuery(
      supabase
        .from('companies')
        .select('*')
        .eq('api_key', apiKey)
        .single(),
      'Get company by API key'
    );
  }
}

// Vehicle API with VCODE automation
export class VehicleAPI extends BaseAPI {
  constructor() {
    super('vehicles');
  }

  async getAll() {
    return this.executeQuery(
      supabase
        .from('vehicles')
        .select(`
          *,
          companies (
            name,
            status
          )
        `)
        .order('created_at', { ascending: false }),
      'Get vehicles'
    );
  }

  async getByCompany(companyId: string) {
    return this.executeQuery(
      supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false }),
      'Get vehicles by company'
    );
  }

  async create(vehicle: Tables['vehicles']['Insert']) {
    return this.executeQuery(
      supabase
        .from('vehicles')
        .insert(vehicle)
        .select()
        .single(),
      'Create vehicle'
    );
  }

  async update(id: string, updates: Tables['vehicles']['Update']) {
    return this.executeQuery(
      supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'Update vehicle'
    );
  }

  async updateStatus(id: string, status: Tables['vehicles']['Row']['status']) {
    const updates: Tables['vehicles']['Update'] = { status };

    if (status === 'verified') {
      updates.verification_status = {
        registration_verified: true,
        insurance_verified: true,
        license_verified: true
      };
      updates.availability = 'available';
    }

    return this.update(id, updates);
  }

  async getAvailable() {
    return this.executeQuery(
      supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'verified')
        .eq('availability', 'available')
        .order('created_at'),
      'Get available vehicles'
    );
  }

  async updateLocation(id: string, lat: number, lng: number, address?: string) {
    const updates: Tables['vehicles']['Update'] = {
      current_location: dbHelpers.createPoint(lat, lng),
      current_address: address || null
    };

    return this.update(id, updates);
  }

  async findNearby(lat: number, lng: number, radiusKm: number = 50) {
    const { data, error } = await supabase.rpc('find_nearby_vehicles', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm
    });

    if (error) this.handleError(error, 'Find nearby vehicles');
    return data;
  }
}

// Operator API with performance tracking
export class OperatorAPI extends BaseAPI {
  constructor() {
    super('operators');
  }

  async getAll() {
    return this.executeQuery(
      supabase
        .from('operators')
        .select(`
          *,
          vehicles (
            registration_number,
            type,
            vcode
          ),
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false }),
      'Get operators'
    );
  }

  async getByCompany(companyId: string) {
    return this.executeQuery(
      supabase
        .from('operators')
        .select('*')
        .eq('company_id', companyId)
        .order('rating', { ascending: false }),
      'Get operators by company'
    );
  }

  async create(operator: Tables['operators']['Insert']) {
    return this.executeQuery(
      supabase
        .from('operators')
        .insert(operator)
        .select()
        .single(),
      'Create operator'
    );
  }

  async update(id: string, updates: Tables['operators']['Update']) {
    return this.executeQuery(
      supabase
        .from('operators')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'Update operator'
    );
  }

  async updateStatus(id: string, status: 'available' | 'busy' | 'offline') {
    return this.update(id, { 
      status,
      last_active: new Date().toISOString()
    });
  }

  async updateLocation(id: string, lat: number, lng: number, address?: string) {
    return this.update(id, {
      current_location: dbHelpers.createPoint(lat, lng),
      current_address: address || null,
      last_active: new Date().toISOString()
    });
  }

  async updatePerformance(id: string, deliverySuccess: boolean, onTime: boolean) {
    const operator = await this.executeQuery(
      supabase
        .from('operators')
        .select('total_deliveries, successful_deliveries, on_time_rate')
        .eq('id', id)
        .single(),
      'Get operator for performance update'
    );

    const newTotalDeliveries = operator.total_deliveries + 1;
    const newSuccessfulDeliveries = operator.successful_deliveries + (deliverySuccess ? 1 : 0);
    
    // Calculate new on-time rate
    const currentOnTimeDeliveries = Math.round((operator.on_time_rate / 100) * operator.total_deliveries);
    const newOnTimeDeliveries = currentOnTimeDeliveries + (onTime ? 1 : 0);
    const newOnTimeRate = (newOnTimeDeliveries / newTotalDeliveries) * 100;

    return this.update(id, {
      total_deliveries: newTotalDeliveries,
      successful_deliveries: newSuccessfulDeliveries,
      on_time_rate: Math.round(newOnTimeRate * 100) / 100
    });
  }

  async getAvailable() {
    return this.executeQuery(
      supabase
        .from('operators')
        .select('*')
        .eq('status', 'available')
        .order('rating', { ascending: false }),
      'Get available operators'
    );
  }
}

// Customer API
export class CustomerAPI extends BaseAPI {
  constructor() {
    super('customers');
  }

  async getAll() {
    return this.executeQuery(
      supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false }),
      'Get customers'
    );
  }

  async create(customer: Tables['customers']['Insert']) {
    return this.executeQuery(
      supabase
        .from('customers')
        .insert(customer)
        .select()
        .single(),
      'Create customer'
    );
  }

  async upsert(customer: Tables['customers']['Insert']) {
    return this.executeQuery(
      supabase
        .from('customers')
        .upsert(customer, { onConflict: 'phone' })
        .select()
        .single(),
      'Upsert customer'
    );
  }

  async update(id: string, updates: Tables['customers']['Update']) {
    return this.executeQuery(
      supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'Update customer'
    );
  }

  async incrementShipmentCount(id: string) {
    const { data, error } = await supabase.rpc('increment_customer_shipments', {
      customer_id: id
    });

    if (error) this.handleError(error, 'Increment shipment count');
    return data;
  }
}

// Shipment API with automation
export class ShipmentAPI extends BaseAPI {
  constructor() {
    super('shipments');
  }

  async getAll() {
    return this.executeQuery(
      supabase
        .from('shipments')
        .select(`
          *,
          operators (
            name,
            phone,
            rating
          ),
          vehicles (
            registration_number,
            type,
            vcode
          ),
          companies (
            name
          ),
          shipment_updates (
            id,
            message,
            type,
            address,
            automated,
            created_at
          )
        `)
        .order('created_at', { ascending: false }),
      'Get shipments'
    );
  }

  async getById(id: string) {
    return this.executeQuery(
      supabase
        .from('shipments')
        .select(`
          *,
          operators (
            name,
            phone,
            rating
          ),
          vehicles (
            registration_number,
            type,
            vcode
          ),
          companies (
            name
          ),
          shipment_updates (
            id,
            message,
            type,
            address,
            automated,
            created_at
          )
        `)
        .eq('id', id)
        .single(),
      'Get shipment by ID'
    );
  }

  async create(shipment: Tables['shipments']['Insert']) {
    // Generate shipment ID
    const { data: idData } = await supabase.rpc('generate_shipment_id');
    shipment.id = idData;

    // Convert addresses to coordinates (you'd integrate with a geocoding service)
    shipment.pickup_location = dbHelpers.createPoint(28.6139, 77.2090); // Default Delhi coordinates
    shipment.destination_location = dbHelpers.createPoint(19.0760, 72.8777); // Default Mumbai coordinates

    const newShipment = await this.executeQuery(
      supabase
        .from('shipments')
        .insert(shipment)
        .select()
        .single(),
      'Create shipment'
    );

    // Add initial update
    await this.addUpdate(newShipment.id, 'Shipment created and awaiting operator assignment', 'info', true);
    
    return newShipment;
  }

  async update(id: string, updates: Tables['shipments']['Update']) {
    return this.executeQuery(
      supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'Update shipment'
    );
  }

  async updateStatus(id: string, status: Tables['shipments']['Row']['status'], message?: string) {
    const updates: Tables['shipments']['Update'] = { status };
    
    if (status === 'delivered') {
      updates.actual_delivery = new Date().toISOString();
      updates.progress = 100;
    } else if (status === 'in_transit') {
      updates.progress = 50;
    } else if (status === 'picked_up') {
      updates.progress = 25;
    }

    const updatedShipment = await this.update(id, updates);

    // Add automated update
    if (message) {
      await this.addUpdate(id, message, 'info', true);
    }

    return updatedShipment;
  }

  async addUpdate(shipmentId: string, message: string, type: 'info' | 'success' | 'warning' | 'error', automated: boolean = false, location?: { lat: number; lng: number }, address?: string) {
    const update: Tables['shipment_updates']['Insert'] = {
      shipment_id: shipmentId,
      message,
      type,
      automated,
      address
    };

    if (location) {
      update.location = dbHelpers.createPoint(location.lat, location.lng);
    }

    return this.executeQuery(
      supabase
        .from('shipment_updates')
        .insert(update)
        .select()
        .single(),
      'Add shipment update'
    );
  }

  async getByStatus(status: Tables['shipments']['Row']['status']) {
    return this.executeQuery(
      supabase
        .from('shipments')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false }),
      'Get shipments by status'
    );
  }

  async getByOperator(operatorId: string) {
    return this.executeQuery(
      supabase
        .from('shipments')
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false }),
      'Get shipments by operator'
    );
  }

  async getByCompany(companyId: string) {
    return this.executeQuery(
      supabase
        .from('shipments')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false }),
      'Get shipments by company'
    );
  }

  // Real-time subscriptions
  subscribeToUpdates(callback: (payload: any) => void) {
    if (!isConnected) {
      return { unsubscribe: () => {} };
    }
    
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

  subscribeToShipmentUpdates(callback: (payload: any) => void) {
    if (!isConnected) {
      return { unsubscribe: () => {} };
    }
    
    return supabase
      .channel('shipment_status_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'shipment_updates' 
        }, 
        callback
      )
      .subscribe();
  }
}

// Notification API with automation
export class NotificationAPI extends BaseAPI {
  constructor() {
    super('notifications');
  }

  async getAll(userId?: string, userType?: string) {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (userType) {
      query = query.eq('user_type', userType);
    }

    return this.executeQuery(query, 'Get notifications');
  }

  async create(notification: Tables['notifications']['Insert']) {
    const newNotification = await this.executeQuery(
      supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single(),
      'Create notification'
    );

    // Here you would integrate with SMS, email, and push notification services
    await this.sendNotification(newNotification);

    return newNotification;
  }

  async markAsRead(id: string) {
    return this.executeQuery(
      supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single(),
      'Mark notification as read'
    );
  }

  async markAllAsRead(userId: string, userType: string) {
    return this.executeQuery(
      supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('user_type', userType)
        .is('read_at', null),
      'Mark all notifications as read'
    );
  }

  private async sendNotification(notification: any) {
    // Integration with notification services would go here
    console.log('Sending notification:', notification);
    
    // Update sent_at timestamp
    await supabase
      .from('notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', notification.id);
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string, userType: string, callback: (payload: any) => void) {
    if (!isConnected) {
      return { unsubscribe: () => {} };
    }
    
    return supabase
      .channel(`notifications_${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
}

// Payment API
export class PaymentAPI extends BaseAPI {
  constructor() {
    super('payments');
  }

  async create(payment: Tables['payments']['Insert']) {
    return this.executeQuery(
      supabase
        .from('payments')
        .insert(payment)
        .select()
        .single(),
      'Create payment'
    );
  }

  async updateStatus(id: string, status: Tables['payments']['Row']['payment_status'], transactionId?: string, gatewayResponse?: any) {
    const updates: Tables['payments']['Update'] = { 
      payment_status: status,
      processed_at: new Date().toISOString()
    };

    if (transactionId) updates.transaction_id = transactionId;
    if (gatewayResponse) updates.gateway_response = gatewayResponse;

    return this.executeQuery(
      supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'Update payment status'
    );
  }

  async getByShipment(shipmentId: string) {
    return this.executeQuery(
      supabase
        .from('payments')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: false }),
      'Get payments by shipment'
    );
  }

  async getByOperator(operatorId: string) {
    return this.executeQuery(
      supabase
        .from('payments')
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false }),
      'Get payments by operator'
    );
  }
}

// Analytics API
export class AnalyticsAPI extends BaseAPI {
  constructor() {
    super('analytics');
  }

  async getDashboardStats(companyId?: string) {
    let shipmentsQuery = supabase
      .from('shipments')
      .select('status, model, price, created_at, actual_delivery, estimated_delivery');

    let operatorsQuery = supabase
      .from('operators')
      .select('status, total_deliveries, earnings');

    if (companyId) {
      shipmentsQuery = shipmentsQuery.eq('company_id', companyId);
      operatorsQuery = operatorsQuery.eq('company_id', companyId);
    }

    const [shipmentStats, operatorStats] = await Promise.all([
      this.executeQuery(shipmentsQuery, 'Get shipment stats'),
      this.executeQuery(operatorsQuery, 'Get operator stats')
    ]);

    // Calculate metrics
    const totalShipments = shipmentStats?.length || 0;
    const deliveredShipments = shipmentStats?.filter(s => s.status === 'delivered').length || 0;
    const successRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;
    const activeOperators = operatorStats?.filter(o => o.status !== 'offline').length || 0;
    const totalRevenue = shipmentStats?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;

    // Calculate average delivery time
    const deliveredWithTimes = shipmentStats?.filter(s => 
      s.status === 'delivered' && s.actual_delivery && s.created_at
    ) || [];
    
    const avgDeliveryTimeHours = deliveredWithTimes.length > 0 
      ? deliveredWithTimes.reduce((sum, s) => {
          const created = new Date(s.created_at).getTime();
          const delivered = new Date(s.actual_delivery).getTime();
          return sum + (delivered - created) / (1000 * 60 * 60);
        }, 0) / deliveredWithTimes.length
      : 0;

    return {
      totalShipments,
      successRate: Math.round(successRate * 10) / 10,
      activeOperators,
      avgDeliveryTime: `${avgDeliveryTimeHours.toFixed(1)}h`,
      revenue: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      routeEfficiency: 94.2, // This would need route optimization data
      topRoutes: await this.getTopRoutes(companyId),
      operatorPerformance: await this.getTopOperators(companyId)
    };
  }

  async getTopRoutes(companyId?: string, limit: number = 5) {
    let query = supabase
      .from('shipments')
      .select('pickup_address, destination_address, price')
      .eq('status', 'delivered');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const shipments = await this.executeQuery(query, 'Get route data');

    // Group by route and calculate metrics
    const routeMap = new Map();
    shipments?.forEach(s => {
      const route = `${s.pickup_address} → ${s.destination_address}`;
      if (!routeMap.has(route)) {
        routeMap.set(route, { shipments: 0, revenue: 0 });
      }
      const routeData = routeMap.get(route);
      routeData.shipments += 1;
      routeData.revenue += s.price || 0;
    });

    return Array.from(routeMap.entries())
      .map(([route, data]) => ({
        route,
        shipments: data.shipments,
        revenue: `₹${(data.revenue / 1000).toFixed(1)}K`,
        efficiency: `${Math.floor(Math.random() * 10) + 90}%` // Mock efficiency
      }))
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, limit);
  }

  async getTopOperators(companyId?: string, limit: number = 5) {
    let query = supabase
      .from('operators')
      .select('name, rating, total_deliveries, on_time_rate, earnings')
      .order('rating', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const operators = await this.executeQuery(query.limit(limit), 'Get top operators');

    return operators?.map(op => ({
      name: op.name,
      rating: op.rating,
      deliveries: op.total_deliveries,
      onTime: `${op.on_time_rate}%`,
      earnings: `₹${op.earnings.toLocaleString()}`
    })) || [];
  }

  async getRealTimeMetrics(companyId?: string) {
    let activeShipmentsQuery = supabase
      .from('shipments')
      .select('status')
      .in('status', ['assigned', 'picked_up', 'in_transit']);

    let availableOperatorsQuery = supabase
      .from('operators')
      .select('status')
      .eq('status', 'available');

    if (companyId) {
      activeShipmentsQuery = activeShipmentsQuery.eq('company_id', companyId);
      availableOperatorsQuery = availableOperatorsQuery.eq('company_id', companyId);
    }

    const [activeShipments, availableOperators] = await Promise.all([
      this.executeQuery(activeShipmentsQuery, 'Get active shipments'),
      this.executeQuery(availableOperatorsQuery, 'Get available operators')
    ]);

    return {
      activeShipments: activeShipments?.length || 0,
      availableOperators: availableOperators?.length || 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Route API for optimization
export class RouteAPI extends BaseAPI {
  constructor() {
    super('routes');
  }

  async create(route: Tables['routes']['Insert']) {
    return this.executeQuery(
      supabase
        .from('routes')
        .insert(route)
        .select()
        .single(),
      'Create route'
    );
  }

  async optimizeRoute(shipmentId: string, waypoints: Array<{lat: number, lng: number}>) {
    // Here you would integrate with Google Maps Directions API or similar
    // For now, we'll create a mock optimized route
    
    const optimizedRoute = {
      shipment_id: shipmentId,
      route_points: waypoints,
      total_distance: Math.random() * 500 + 50, // Mock distance
      estimated_duration: '02:30:00', // Mock duration
      optimized: true
    };

    return this.create(optimizedRoute);
  }
}

// Main API class that combines all APIs
export class TrackASAPI {
  public companies: CompanyAPI;
  public vehicles: VehicleAPI;
  public operators: OperatorAPI;
  public customers: CustomerAPI;
  public shipments: ShipmentAPI;
  public notifications: NotificationAPI;
  public payments: PaymentAPI;
  public analytics: AnalyticsAPI;
  public routes: RouteAPI;

  constructor() {
    this.companies = new CompanyAPI();
    this.vehicles = new VehicleAPI();
    this.operators = new OperatorAPI();
    this.customers = new CustomerAPI();
    this.shipments = new ShipmentAPI();
    this.notifications = new NotificationAPI();
    this.payments = new PaymentAPI();
    this.analytics = new AnalyticsAPI();
    this.routes = new RouteAPI();
  }

  // Real-time subscriptions
  subscribeToAllChanges(callback: (payload: any) => void) {
    if (!isConnected) {
      // Return a mock cleanup function for demo mode
      return () => {};
    }

    const channels = [
      this.shipments.subscribeToUpdates(callback),
      this.shipments.subscribeToShipmentUpdates(callback),
      supabase.channel('operators').on('postgres_changes', { event: '*', schema: 'public', table: 'operators' }, callback).subscribe(),
      supabase.channel('vehicles').on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, callback).subscribe(),
      supabase.channel('companies').on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, callback).subscribe(),
    ];
    
    return () => {
      channels.forEach(channel => {
        if (channel && typeof channel.unsubscribe === 'function') {
          channel.unsubscribe();
        }
      });
    };
  }

  // Utility functions
  utils = {
    generateShipmentId: async (): Promise<string> => {
      const { data } = await supabase.rpc('generate_shipment_id');
      return data;
    },

    formatCurrency: (amount: number): string => {
      return `₹${amount.toLocaleString()}`;
    },

    calculateDistance: dbHelpers.calculateDistance,

    calculatePrice: (distance: number, weight: number, urgency: 'standard' | 'urgent' | 'express'): number => {
      const baseRate = 10; // ₹10 per km
      const weightMultiplier = weight > 10 ? 1.5 : 1;
      const urgencyMultiplier = urgency === 'express' ? 2 : urgency === 'urgent' ? 1.5 : 1;
      
      return Math.round(distance * baseRate * weightMultiplier * urgencyMultiplier);
    },

    geocodeAddress: async (address: string): Promise<{lat: number, lng: number} | null> => {
      // Integration with geocoding service would go here
      // For now, return mock coordinates
      return { lat: 28.6139, lng: 77.2090 };
    }
  };
}

// Export singleton instance
export const api = new TrackASAPI();

// Export individual APIs for direct use
export const companyAPI = api.companies;
export const vehicleAPI = api.vehicles;
export const operatorAPI = api.operators;
export const customerAPI = api.customers;
export const shipmentAPI = api.shipments;
export const notificationAPI = api.notifications;
export const paymentAPI = api.payments;
export const analyticsAPI = api.analytics;
export const routeAPI = api.routes;