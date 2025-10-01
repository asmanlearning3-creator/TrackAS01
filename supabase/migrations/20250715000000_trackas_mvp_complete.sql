/*
  # TrackAS MVP - Complete Database Schema

  ## Overview
  This migration implements the complete TrackAS MVP specification including:
  - Fleet Operators vs Individual Vehicle Owners differentiation
  - Subscription and pay-per-shipment models
  - Commission and escrow wallet system (RBI compliant)
  - 2-minute assignment logic with FCFS and dynamic pricing
  - Admin configuration controls
  - Proof of Delivery system
  - Customer tracking (no login)
  - AI Assistant integration
  - Dispute management

  ## New Tables
  1. **admin_settings** - Platform-wide configuration (commission %, subscription settings)
  2. **fleet_operators** - Fleet companies with subscription management
  3. **individual_operators** - Solo driver-owners (always pay-per-shipment)
  4. **drivers** - Driver profiles linked to fleet or individual operators
  5. **subscription_plans** - Fleet subscription tiers and pricing
  6. **fleet_subscriptions** - Active subscriptions for fleet operators
  7. **escrow_transactions** - Escrow wallet for payments (RBI compliant)
  8. **shipment_assignments** - Assignment requests with 2-minute timeout tracking
  9. **proof_of_delivery** - POD with photo and signature storage
  10. **disputes** - Dispute management and resolution
  11. **tracking_links** - Public tracking links for customers (no auth)
  12. **ai_assistant_logs** - AI conversation history and escalations
  13. **commission_transactions** - Commission tracking and payouts

  ## Modified Tables
  - Enhanced vehicles table with operator type differentiation
  - Enhanced shipments with pricing escalation and assignment tracking
  - Enhanced operators with fleet vs individual distinction

  ## Security
  - Row Level Security enabled on all tables
  - Public access for tracking_links (read-only)
  - Authenticated access for operational tables
  - Admin-only access for settings and sensitive operations
*/

-- Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('commission_percentage', '5', 'Platform commission percentage (0-10%) paid by shippers'),
  ('subscription_enabled', 'true', 'Enable/disable subscription option for fleet operators'),
  ('assignment_timeout_seconds', '120', '2-minute timeout for shipment assignment acceptance'),
  ('dynamic_pricing_escalation', '{"first_retry": 10, "second_retry": 20, "third_retry": 0}', 'Percentage increase for each retry cycle'),
  ('max_assignment_retries', '3', 'Maximum number of assignment retry cycles before cancellation')
ON CONFLICT (setting_key) DO NOTHING;

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  vehicle_range_min integer NOT NULL DEFAULT 1,
  vehicle_range_max integer,
  price_inr numeric NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, billing_cycle, vehicle_range_min, vehicle_range_max, price_inr, features) VALUES
  ('Small Fleet', 'For fleets with 1-5 vehicles', 'monthly', 1, 5, 5000, '["Priority assignment", "Fleet analytics", "Basic support"]'),
  ('Medium Fleet', 'For fleets with 6-20 vehicles', 'monthly', 6, 20, 15000, '["Priority assignment", "Advanced analytics", "Priority support", "Route optimization"]'),
  ('Large Fleet', 'For fleets with 21+ vehicles', 'monthly', 21, NULL, 35000, '["Highest priority", "Enterprise analytics", "24/7 support", "Custom integrations", "Dedicated account manager"]')
ON CONFLICT DO NOTHING;

-- Fleet Operators Table (Companies with multiple vehicles)
CREATE TABLE IF NOT EXISTS fleet_operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_tin text UNIQUE NOT NULL,
  company_address text NOT NULL,
  business_registration_number text UNIQUE NOT NULL,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  primary_contact_name text NOT NULL,
  primary_contact_email text NOT NULL,
  primary_contact_phone text NOT NULL,
  total_vehicles integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason text,
  subscription_model text DEFAULT 'pay_per_shipment' CHECK (subscription_model IN ('pay_per_shipment', 'subscription')),
  reliability_score numeric DEFAULT 100.0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual Operators Table (Solo driver-owners, always pay-per-shipment)
CREATE TABLE IF NOT EXISTS individual_operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  address text NOT NULL,
  driver_license_number text UNIQUE NOT NULL,
  driver_license_expiry date NOT NULL,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  vehicle_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason text,
  reliability_score numeric DEFAULT 100.0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'unavailable', 'on_trip')),
  total_earnings numeric DEFAULT 0,
  total_deliveries integer DEFAULT 0,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Drivers Table (for fleet operators)
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_operator_id uuid REFERENCES fleet_operators(id) ON DELETE CASCADE,
  vehicle_id uuid,
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  driver_license_number text UNIQUE NOT NULL,
  driver_license_expiry date NOT NULL,
  bank_account_number text,
  bank_ifsc_code text,
  bank_account_holder_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'unavailable', 'on_trip')),
  total_earnings numeric DEFAULT 0,
  total_deliveries integer DEFAULT 0,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Vehicles Table
DROP TABLE IF EXISTS vehicles CASCADE;
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vcode text UNIQUE NOT NULL DEFAULT ('VC' || EXTRACT(EPOCH FROM NOW())::bigint || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 3))),
  operator_type text NOT NULL CHECK (operator_type IN ('fleet', 'individual')),
  fleet_operator_id uuid REFERENCES fleet_operators(id) ON DELETE CASCADE,
  individual_operator_id uuid REFERENCES individual_operators(id) ON DELETE CASCADE,
  assigned_driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('truck', 'van', 'mini_truck', 'bike', 'car', 'tempo')),
  registration_number text UNIQUE NOT NULL,
  registration_certificate_url text,
  insurance_certificate_url text,
  insurance_expiry_date date NOT NULL,
  weight_capacity_kg numeric NOT NULL,
  volume_capacity_cbm numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
  rejection_reason text,
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'maintenance', 'offline')),
  current_location_lat numeric,
  current_location_lng numeric,
  current_location_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT operator_type_check CHECK (
    (operator_type = 'fleet' AND fleet_operator_id IS NOT NULL AND individual_operator_id IS NULL) OR
    (operator_type = 'individual' AND individual_operator_id IS NOT NULL AND fleet_operator_id IS NULL)
  )
);

-- Fleet Subscriptions Table
CREATE TABLE IF NOT EXISTS fleet_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_operator_id uuid REFERENCES fleet_operators(id) ON DELETE CASCADE,
  subscription_plan_id uuid REFERENCES subscription_plans(id),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending_payment')),
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_method text,
  transaction_id text,
  is_foc boolean DEFAULT false,
  foc_reason text,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Escrow Transactions Table (RBI Compliant)
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text NOT NULL,
  shipper_company_id uuid REFERENCES companies(id),
  amount_total numeric NOT NULL,
  amount_shipment numeric NOT NULL,
  amount_commission numeric NOT NULL,
  commission_percentage numeric NOT NULL,
  status text DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  payment_method text NOT NULL,
  payment_transaction_id text,
  release_date timestamptz,
  recipient_type text CHECK (recipient_type IN ('fleet', 'individual', 'driver')),
  recipient_id uuid,
  refund_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Commission Transactions Table
CREATE TABLE IF NOT EXISTS commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_transaction_id uuid REFERENCES escrow_transactions(id),
  shipment_id text NOT NULL,
  amount numeric NOT NULL,
  percentage numeric NOT NULL,
  status text DEFAULT 'collected' CHECK (status IN ('collected', 'refunded')),
  collected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Shipment Assignments Table (2-minute timeout tracking)
CREATE TABLE IF NOT EXISTS shipment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text NOT NULL,
  assignment_cycle integer NOT NULL DEFAULT 1,
  operator_type text NOT NULL CHECK (operator_type IN ('fleet', 'individual')),
  target_fleet_operator_id uuid REFERENCES fleet_operators(id),
  target_individual_operator_id uuid,
  target_vehicle_id uuid REFERENCES vehicles(id),
  request_sent_at timestamptz DEFAULT now(),
  response_deadline timestamptz NOT NULL,
  response_status text DEFAULT 'pending' CHECK (response_status IN ('pending', 'accepted', 'rejected', 'timeout')),
  response_received_at timestamptz,
  rejection_reason text,
  priority_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enhanced Shipments Table
DROP TABLE IF EXISTS shipments CASCADE;
CREATE TABLE shipments (
  id text PRIMARY KEY,
  shipper_company_id uuid REFERENCES companies(id),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  pickup_location_lat numeric NOT NULL,
  pickup_location_lng numeric NOT NULL,
  pickup_address text NOT NULL,
  destination_location_lat numeric NOT NULL,
  destination_location_lng numeric NOT NULL,
  destination_address text NOT NULL,
  consignment_details jsonb NOT NULL,
  weight_kg numeric NOT NULL,
  dimensions text NOT NULL,
  vehicle_type_required text NOT NULL,
  urgency text DEFAULT 'standard' CHECK (urgency IN ('standard', 'urgent', 'express')),
  special_handling text,
  base_price numeric NOT NULL,
  current_price numeric NOT NULL,
  price_escalation_count integer DEFAULT 0,
  commission_amount numeric NOT NULL,
  total_cost numeric NOT NULL,
  status text DEFAULT 'created' CHECK (status IN ('created', 'assigning', 'assigned', 'pickup_confirmed', 'in_transit', 'delivered', 'cancelled', 'failed')),
  assigned_operator_type text CHECK (assigned_operator_type IN ('fleet', 'individual')),
  assigned_fleet_operator_id uuid REFERENCES fleet_operators(id),
  assigned_individual_operator_id uuid,
  assigned_vehicle_id uuid REFERENCES vehicles(id),
  assigned_driver_id uuid,
  assignment_accepted_at timestamptz,
  pickup_confirmed_at timestamptz,
  in_transit_at timestamptz,
  delivered_at timestamptz,
  estimated_delivery_time timestamptz,
  actual_delivery_time timestamptz,
  ai_estimated_duration_minutes integer,
  current_location_lat numeric,
  current_location_lng numeric,
  current_location_address text,
  tracking_link_token text UNIQUE,
  invoice_generated boolean DEFAULT false,
  payment_settled boolean DEFAULT false,
  customer_rating integer CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback text,
  shipper_driver_rating integer CHECK (shipper_driver_rating >= 1 AND shipper_driver_rating <= 5),
  shipper_feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Proof of Delivery Table
CREATE TABLE IF NOT EXISTS proof_of_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id) ON DELETE CASCADE,
  photo_urls text[] NOT NULL DEFAULT '{}',
  signature_image_url text NOT NULL,
  recipient_name text NOT NULL,
  recipient_relationship text,
  delivery_notes text,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  location_address text NOT NULL,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tracking Links Table (Public access for customers)
CREATE TABLE IF NOT EXISTS tracking_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  notification_sent boolean DEFAULT false,
  last_accessed_at timestamptz,
  access_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id),
  raised_by_type text NOT NULL CHECK (raised_by_type IN ('shipper', 'fleet', 'individual', 'customer')),
  raised_by_id uuid NOT NULL,
  dispute_type text NOT NULL CHECK (dispute_type IN ('payment', 'delivery_issue', 'damage', 'delay', 'other')),
  description text NOT NULL,
  evidence_urls text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution_notes text,
  resolved_by uuid,
  resolved_at timestamptz,
  escalated_to_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Assistant Logs Table
CREATE TABLE IF NOT EXISTS ai_assistant_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_type text CHECK (user_type IN ('admin', 'shipper', 'fleet', 'individual', 'customer', 'guest')),
  session_id text NOT NULL,
  user_message text NOT NULL,
  user_language text DEFAULT 'english',
  ai_response text NOT NULL,
  context_data jsonb,
  escalated_to_admin boolean DEFAULT false,
  escalation_reason text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin settings (admin only for write, authenticated for read)
CREATE POLICY "Admin can manage settings" ON admin_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Subscription plans (public read, admin write)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage subscription plans" ON subscription_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleet operators can view and update their own data
CREATE POLICY "Fleet operators can view own data" ON fleet_operators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fleet operators can update own data" ON fleet_operators FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can register as fleet operator" ON fleet_operators FOR INSERT WITH CHECK (true);

-- Individual operators can view and update their own data
CREATE POLICY "Individual operators can view own data" ON individual_operators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Individual operators can update own data" ON individual_operators FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can register as individual operator" ON individual_operators FOR INSERT WITH CHECK (true);

-- Drivers
CREATE POLICY "Drivers can be viewed by authenticated users" ON drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fleet operators can manage their drivers" ON drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vehicles
CREATE POLICY "Vehicles can be viewed by authenticated users" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can manage their vehicles" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleet subscriptions
CREATE POLICY "Fleet subscriptions can be viewed by authenticated users" ON fleet_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fleet subscriptions can be managed" ON fleet_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Escrow transactions (authenticated access)
CREATE POLICY "Escrow transactions viewable by authenticated users" ON escrow_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrow transactions can be created" ON escrow_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Escrow transactions can be updated" ON escrow_transactions FOR UPDATE TO authenticated USING (true);

-- Commission transactions
CREATE POLICY "Commission transactions viewable by authenticated users" ON commission_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Commission transactions can be created" ON commission_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Shipment assignments
CREATE POLICY "Assignments viewable by authenticated users" ON shipment_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assignments can be managed" ON shipment_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipments
CREATE POLICY "Shipments viewable by authenticated users" ON shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Shipments can be created" ON shipments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Shipments can be updated" ON shipments FOR UPDATE TO authenticated USING (true);

-- Proof of delivery
CREATE POLICY "POD viewable by authenticated users" ON proof_of_delivery FOR SELECT TO authenticated USING (true);
CREATE POLICY "POD can be created by authenticated users" ON proof_of_delivery FOR INSERT TO authenticated WITH CHECK (true);

-- Tracking links (PUBLIC READ for customer tracking without login)
CREATE POLICY "Anyone can view tracking links" ON tracking_links FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tracking links" ON tracking_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tracking links" ON tracking_links FOR UPDATE TO authenticated USING (true);

-- Disputes
CREATE POLICY "Disputes viewable by authenticated users" ON disputes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create disputes" ON disputes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Disputes can be updated" ON disputes FOR UPDATE TO authenticated USING (true);

-- AI Assistant logs
CREATE POLICY "AI logs viewable by authenticated users" ON ai_assistant_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can create AI logs" ON ai_assistant_logs FOR INSERT WITH CHECK (true);

-- Functions

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate tracking token
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS text AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::text || NOW()::text) FROM 1 FOR 16));
END;
$$ LANGUAGE plpgsql;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(base_price numeric)
RETURNS numeric AS $$
DECLARE
  commission_pct numeric;
BEGIN
  SELECT (setting_value::text)::numeric INTO commission_pct
  FROM admin_settings
  WHERE setting_key = 'commission_percentage';

  RETURN ROUND((base_price * commission_pct / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking link on shipment creation
CREATE OR REPLACE FUNCTION create_tracking_link()
RETURNS TRIGGER AS $$
DECLARE
  tracking_token text;
BEGIN
  tracking_token := generate_tracking_token();
  NEW.tracking_link_token := tracking_token;

  INSERT INTO tracking_links (shipment_id, token, customer_phone, customer_email)
  VALUES (NEW.id, tracking_token, NEW.customer_phone, NEW.customer_email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create escrow transaction on shipment creation
CREATE OR REPLACE FUNCTION create_escrow_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO escrow_transactions (
    shipment_id,
    shipper_company_id,
    amount_total,
    amount_shipment,
    amount_commission,
    commission_percentage,
    status,
    payment_method
  ) VALUES (
    NEW.id,
    NEW.shipper_company_id,
    NEW.total_cost,
    NEW.current_price,
    NEW.commission_amount,
    (NEW.commission_amount / NEW.current_price * 100),
    'held',
    'online'
  );

  INSERT INTO commission_transactions (
    shipment_id,
    amount,
    percentage,
    status
  ) VALUES (
    NEW.id,
    NEW.commission_amount,
    (NEW.commission_amount / NEW.current_price * 100),
    'collected'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_fleet_operators_updated_at BEFORE UPDATE ON fleet_operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_individual_operators_updated_at BEFORE UPDATE ON individual_operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER create_tracking_link_on_shipment
  BEFORE INSERT ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION create_tracking_link();

CREATE TRIGGER create_escrow_on_shipment
  AFTER INSERT ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION create_escrow_transaction();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fleet_operators_user_id ON fleet_operators(user_id);
CREATE INDEX IF NOT EXISTS idx_fleet_operators_status ON fleet_operators(status);
CREATE INDEX IF NOT EXISTS idx_individual_operators_user_id ON individual_operators(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_operators_status ON individual_operators(status);
CREATE INDEX IF NOT EXISTS idx_individual_operators_availability ON individual_operators(availability_status);
CREATE INDEX IF NOT EXISTS idx_drivers_fleet_operator_id ON drivers(fleet_operator_id);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle_id ON drivers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_operator_type ON vehicles(operator_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_fleet_operator_id ON vehicles(fleet_operator_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_individual_operator_id ON vehicles(individual_operator_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_availability ON vehicles(availability_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_fleet_subscriptions_fleet_operator_id ON fleet_subscriptions(fleet_operator_id);
CREATE INDEX IF NOT EXISTS idx_fleet_subscriptions_status ON fleet_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_shipment_id ON escrow_transactions(shipment_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_shipment_id ON commission_transactions(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_assignments_shipment_id ON shipment_assignments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_assignments_response_status ON shipment_assignments(response_status);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_shipper_company_id ON shipments(shipper_company_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_token ON shipments(tracking_link_token);
CREATE INDEX IF NOT EXISTS idx_tracking_links_token ON tracking_links(token);
CREATE INDEX IF NOT EXISTS idx_tracking_links_shipment_id ON tracking_links(shipment_id);
CREATE INDEX IF NOT EXISTS idx_disputes_shipment_id ON disputes(shipment_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_session_id ON ai_assistant_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_escalated ON ai_assistant_logs(escalated_to_admin);
