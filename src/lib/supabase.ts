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
          tin_verified: boolean;
          business_reg_verified: boolean;
          documents_verified: boolean;
          approval_timeline: string | null;
          rejection_reason: string | null;
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
          tin_verified?: boolean;
          business_reg_verified?: boolean;
          documents_verified?: boolean;
          approval_timeline?: string | null;
          rejection_reason?: string | null;
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
          tin_verified?: boolean;
          business_reg_verified?: boolean;
          documents_verified?: boolean;
          approval_timeline?: string | null;
          rejection_reason?: string | null;
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
          registration_verified: boolean;
          insurance_verified: boolean;
          license_verified: boolean;
          availability: 'available' | 'busy' | 'maintenance';
          current_location: string | null;
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
          registration_verified?: boolean;
          insurance_verified?: boolean;
          license_verified?: boolean;
          availability?: 'available' | 'busy' | 'maintenance';
          current_location?: string | null;
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
          registration_verified?: boolean;
          insurance_verified?: boolean;
          license_verified?: boolean;
          availability?: 'available' | 'busy' | 'maintenance';
          current_location?: string | null;
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
          pickup_location: string;
          destination: string;
          status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
          progress: number;
          estimated_delivery: string | null;
          actual_delivery: string | null;
          current_location: string | null;
          weight: number;
          dimensions: string;
          price: number | null;
          urgency: 'standard' | 'urgent' | 'express';
          special_handling: string | null;
          model: 'subscription' | 'pay-per-shipment';
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
          pickup_location: string;
          destination: string;
          status?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
          progress?: number;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          current_location?: string | null;
          weight: number;
          dimensions: string;
          price?: number | null;
          urgency?: 'standard' | 'urgent' | 'express';
          special_handling?: string | null;
          model: 'subscription' | 'pay-per-shipment';
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
          pickup_location?: string;
          destination?: string;
          status?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
          progress?: number;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          current_location?: string | null;
          weight?: number;
          dimensions?: string;
          price?: number | null;
          urgency?: 'standard' | 'urgent' | 'express';
          special_handling?: string | null;
          model?: 'subscription' | 'pay-per-shipment';
        };
      };
    };
  };
}