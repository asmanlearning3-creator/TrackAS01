import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          address: string;
          tin: string;
          business_registration_number: string;
          primary_contact_name: string;
          primary_contact_email: string;
          primary_contact_phone: string;
          fleet_size: number | null;
          status: 'pending' | 'under_review' | 'approved' | 'rejected';
          verification_status: {
            tin_verified: boolean;
            business_reg_verified: boolean;
            documents_verified: boolean;
          };
          approval_timeline: string | null;
          rejection_reason: string | null;
          api_key: string;
          subscription_plan: 'basic' | 'premium' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          tin: string;
          business_registration_number: string;
          primary_contact_name: string;
          primary_contact_email: string;
          primary_contact_phone: string;
          fleet_size?: number | null;
          status?: 'pending' | 'under_review' | 'approved' | 'rejected';
          verification_status?: any;
          approval_timeline?: string | null;
          rejection_reason?: string | null;
          api_key?: string;
          subscription_plan?: 'basic' | 'premium' | 'enterprise';
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          tin?: string;
          business_registration_number?: string;
          primary_contact_name?: string;
          primary_contact_email?: string;
          primary_contact_phone?: string;
          fleet_size?: number | null;
          status?: 'pending' | 'under_review' | 'approved' | 'rejected';
          verification_status?: any;
          approval_timeline?: string | null;
          rejection_reason?: string | null;
          api_key?: string;
          subscription_plan?: 'basic' | 'premium' | 'enterprise';
        };
      };
      vehicles: {
        Row: {
          id: string;
          company_id: string | null;
          vcode: string;
          type: 'truck' | 'van' | 'bike' | 'car' | 'other';
          registration_number: string;
          weight_capacity: number;
          volume_capacity: number;
          driver_name: string;
          driver_mobile: string;
          driver_license_number: string;
          status: 'pending' | 'verified' | 'active' | 'inactive' | 'rejected';
          verification_status: {
            registration_verified: boolean;
            insurance_verified: boolean;
            license_verified: boolean;
          };
          availability: 'available' | 'busy' | 'maintenance';
          current_location: any;
          current_address: string | null;
          fuel_efficiency: number;
          maintenance_due_date: string | null;
          insurance_expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          vcode?: string;
          type: 'truck' | 'van' | 'bike' | 'car' | 'other';
          registration_number: string;
          weight_capacity: number;
          volume_capacity: number;
          driver_name: string;
          driver_mobile: string;
          driver_license_number: string;
          status?: 'pending' | 'verified' | 'active' | 'inactive' | 'rejected';
          verification_status?: any;
          availability?: 'available' | 'busy' | 'maintenance';
          current_location?: any;
          current_address?: string | null;
          fuel_efficiency?: number;
          maintenance_due_date?: string | null;
          insurance_expiry_date?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          vcode?: string;
          type?: 'truck' | 'van' | 'bike' | 'car' | 'other';
          registration_number?: string;
          weight_capacity?: number;
          volume_capacity?: number;
          driver_name?: string;
          driver_mobile?: string;
          driver_license_number?: string;
          status?: 'pending' | 'verified' | 'active' | 'inactive' | 'rejected';
          verification_status?: any;
          availability?: 'available' | 'busy' | 'maintenance';
          current_location?: any;
          current_address?: string | null;
          fuel_efficiency?: number;
          maintenance_due_date?: string | null;
          insurance_expiry_date?: string | null;
        };
      };
      operators: {
        Row: {
          id: string;
          vehicle_id: string | null;
          company_id: string | null;
          name: string;
          phone: string;
          email: string;
          license_number: string;
          rating: number;
          total_deliveries: number;
          successful_deliveries: number;
          on_time_rate: number;
          earnings: number;
          current_location: any;
          current_address: string | null;
          status: 'available' | 'busy' | 'offline';
          specializations: string[];
          emergency_contact: string | null;
          joining_date: string;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id?: string | null;
          company_id?: string | null;
          name: string;
          phone: string;
          email: string;
          license_number: string;
          rating?: number;
          total_deliveries?: number;
          successful_deliveries?: number;
          on_time_rate?: number;
          earnings?: number;
          current_location?: any;
          current_address?: string | null;
          status?: 'available' | 'busy' | 'offline';
          specializations?: string[];
          emergency_contact?: string | null;
          joining_date?: string;
          last_active?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string | null;
          company_id?: string | null;
          name?: string;
          phone?: string;
          email?: string;
          license_number?: string;
          rating?: number;
          total_deliveries?: number;
          successful_deliveries?: number;
          on_time_rate?: number;
          earnings?: number;
          current_location?: any;
          current_address?: string | null;
          status?: 'available' | 'busy' | 'offline';
          specializations?: string[];
          emergency_contact?: string | null;
          joining_date?: string;
          last_active?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          address: string | null;
          total_shipments: number;
          rating: number;
          preferred_delivery_time: string | null;
          notification_preferences: {
            sms: boolean;
            email: boolean;
            push: boolean;
          };
          payment_method: 'cash' | 'card' | 'upi' | 'wallet';
          loyalty_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email: string;
          address?: string | null;
          total_shipments?: number;
          rating?: number;
          preferred_delivery_time?: string | null;
          notification_preferences?: any;
          payment_method?: 'cash' | 'card' | 'upi' | 'wallet';
          loyalty_points?: number;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string;
          address?: string | null;
          total_shipments?: number;
          rating?: number;
          preferred_delivery_time?: string | null;
          notification_preferences?: any;
          payment_method?: 'cash' | 'card' | 'upi' | 'wallet';
          loyalty_points?: number;
        };
      };
      shipments: {
        Row: {
          id: string;
          customer_id: string | null;
          operator_id: string | null;
          vehicle_id: string | null;
          company_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          pickup_location: any;
          pickup_address: string;
          destination_location: any;
          destination_address: string;
          status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
          progress: number;
          estimated_delivery: string | null;
          actual_delivery: string | null;
          weight: number;
          dimensions: string;
          price: number | null;
          urgency: 'standard' | 'urgent' | 'express';
          special_handling: string | null;
          model: 'subscription' | 'pay-per-shipment';
          distance_km: number | null;
          estimated_duration: string | null;
          actual_duration: string | null;
          fuel_cost: number | null;
          toll_cost: number | null;
          delivery_proof: any;
          customer_rating: number | null;
          customer_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          customer_id?: string | null;
          operator_id?: string | null;
          vehicle_id?: string | null;
          company_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          pickup_location: any;
          pickup_address: string;
          destination_location: any;
          destination_address: string;
          status?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
          progress?: number;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          weight: number;
          dimensions: string;
          price?: number | null;
          urgency?: 'standard' | 'urgent' | 'express';
          special_handling?: string | null;
          model: 'subscription' | 'pay-per-shipment';
          distance_km?: number | null;
          estimated_duration?: string | null;
          actual_duration?: string | null;
          fuel_cost?: number | null;
          toll_cost?: number | null;
          delivery_proof?: any;
          customer_rating?: number | null;
          customer_feedback?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          operator_id?: string | null;
          vehicle_id?: string | null;
          company_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          pickup_location?: any;
          pickup_address?: string;
          destination_location?: any;
          destination_address?: string;
          status?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
          progress?: number;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          weight?: number;
          dimensions?: string;
          price?: number | null;
          urgency?: 'standard' | 'urgent' | 'express';
          special_handling?: string | null;
          model?: 'subscription' | 'pay-per-shipment';
          distance_km?: number | null;
          estimated_duration?: string | null;
          actual_duration?: string | null;
          fuel_cost?: number | null;
          toll_cost?: number | null;
          delivery_proof?: any;
          customer_rating?: number | null;
          customer_feedback?: string | null;
        };
      };
      shipment_updates: {
        Row: {
          id: string;
          shipment_id: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          location: any;
          address: string | null;
          automated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          location?: any;
          address?: string | null;
          automated?: boolean;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          location?: any;
          address?: string | null;
          automated?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          user_type: 'company' | 'operator' | 'customer' | null;
          type: 'info' | 'success' | 'warning' | 'error';
          title: string;
          message: string;
          data: any;
          channels: string[];
          sent_at: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_type?: 'company' | 'operator' | 'customer' | null;
          type: 'info' | 'success' | 'warning' | 'error';
          title: string;
          message: string;
          data?: any;
          channels?: string[];
          sent_at?: string | null;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_type?: 'company' | 'operator' | 'customer' | null;
          type?: 'info' | 'success' | 'warning' | 'error';
          title?: string;
          message?: string;
          data?: any;
          channels?: string[];
          sent_at?: string | null;
          read_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          shipment_id: string | null;
          company_id: string | null;
          operator_id: string | null;
          amount: number;
          currency: string;
          payment_method: string;
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          transaction_id: string | null;
          gateway_response: any;
          operator_share: number | null;
          platform_fee: number | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id?: string | null;
          company_id?: string | null;
          operator_id?: string | null;
          amount: number;
          currency?: string;
          payment_method: string;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          gateway_response?: any;
          operator_share?: number | null;
          platform_fee?: number | null;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          shipment_id?: string | null;
          company_id?: string | null;
          operator_id?: string | null;
          amount?: number;
          currency?: string;
          payment_method?: string;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          gateway_response?: any;
          operator_share?: number | null;
          platform_fee?: number | null;
          processed_at?: string | null;
        };
      };
      analytics: {
        Row: {
          id: string;
          date: string;
          company_id: string | null;
          metrics: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          company_id?: string | null;
          metrics: any;
        };
        Update: {
          id?: string;
          date?: string;
          company_id?: string | null;
          metrics?: any;
        };
      };
      routes: {
        Row: {
          id: string;
          shipment_id: string | null;
          operator_id: string | null;
          route_points: any;
          total_distance: number;
          estimated_duration: string;
          actual_duration: string | null;
          fuel_consumption: number | null;
          traffic_conditions: string | null;
          weather_conditions: string | null;
          optimized: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id?: string | null;
          operator_id?: string | null;
          route_points: any;
          total_distance: number;
          estimated_duration: string;
          actual_duration?: string | null;
          fuel_consumption?: number | null;
          traffic_conditions?: string | null;
          weather_conditions?: string | null;
          optimized?: boolean;
        };
        Update: {
          id?: string;
          shipment_id?: string | null;
          operator_id?: string | null;
          route_points?: any;
          total_distance?: number;
          estimated_duration?: string;
          actual_duration?: string | null;
          fuel_consumption?: number | null;
          traffic_conditions?: string | null;
          weather_conditions?: string | null;
          optimized?: boolean;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values: any;
          new_values: any;
          user_id: string | null;
          user_type: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: any;
          new_values?: any;
          user_id?: string | null;
          user_type?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: any;
          new_values?: any;
          user_id?: string | null;
          user_type?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
    };
    Functions: {
      generate_shipment_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      calculate_daily_analytics: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
  };
}

// Helper functions for common operations
export const dbHelpers = {
  // Convert coordinates to PostGIS point
  createPoint: (lat: number, lng: number) => `POINT(${lng} ${lat})`,
  
  // Parse PostGIS point to coordinates
  parsePoint: (point: string) => {
    const match = point.match(/POINT\(([^)]+)\)/);
    if (match) {
      const [lng, lat] = match[1].split(' ').map(Number);
      return { lat, lng };
    }
    return null;
  },
  
  // Calculate distance between two points (in km)
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};