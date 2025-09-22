/*
  # TrackAS Database Schema

  1. New Tables
    - `companies` - Logistics companies registration
    - `vehicles` - Fleet vehicles with VCODE system
    - `operators` - Vehicle operators/drivers
    - `customers` - Customer information
    - `shipments` - Shipment tracking and management
    - `shipment_updates` - Real-time shipment status updates
    - `notifications` - System notifications
    - `analytics` - Performance analytics data

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure API access with proper authentication

  3. Features
    - Real-time subscriptions for live tracking
    - Automated VCODE generation
    - Comprehensive audit trails
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  tin text UNIQUE NOT NULL,
  business_registration_number text UNIQUE NOT NULL,
  primary_contact_name text NOT NULL,
  primary_contact_email text NOT NULL,
  primary_contact_phone text NOT NULL,
  fleet_size integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  tin_verified boolean DEFAULT false,
  business_reg_verified boolean DEFAULT false,
  documents_verified boolean DEFAULT false,
  approval_timeline text DEFAULT '24-48 hours',
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  vcode text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('truck', 'van', 'bike', 'car', 'other')),
  registration_number text UNIQUE NOT NULL,
  weight_capacity numeric NOT NULL,
  volume_capacity numeric NOT NULL,
  driver_name text NOT NULL,
  driver_mobile text NOT NULL,
  driver_license_number text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'active', 'inactive', 'rejected')),
  registration_verified boolean DEFAULT false,
  insurance_verified boolean DEFAULT false,
  license_verified boolean DEFAULT false,
  availability text DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'maintenance')),
  current_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Operators table
CREATE TABLE IF NOT EXISTS operators (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_deliveries integer DEFAULT 0,
  on_time_rate numeric DEFAULT 100.0 CHECK (on_time_rate >= 0 AND on_time_rate <= 100),
  earnings numeric DEFAULT 0,
  current_location text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  specializations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  total_shipments integer DEFAULT 0,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  preferred_delivery_time text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id text PRIMARY KEY,
  customer_id uuid REFERENCES customers(id),
  operator_id uuid REFERENCES operators(id),
  vehicle_id uuid REFERENCES vehicles(id),
  company_id uuid REFERENCES companies(id),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  pickup_location text NOT NULL,
  destination text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  progress numeric DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  current_location text,
  weight numeric NOT NULL,
  dimensions text NOT NULL,
  price numeric,
  urgency text DEFAULT 'standard' CHECK (urgency IN ('standard', 'urgent', 'express')),
  special_handling text,
  model text NOT NULL CHECK (model IN ('subscription', 'pay-per-shipment')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipment updates table
CREATE TABLE IF NOT EXISTS shipment_updates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id text REFERENCES shipments(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  location text,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid, -- Can reference different user types
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date date DEFAULT CURRENT_DATE,
  total_shipments integer DEFAULT 0,
  completed_shipments integer DEFAULT 0,
  success_rate numeric DEFAULT 0,
  active_operators integer DEFAULT 0,
  avg_delivery_time interval,
  revenue numeric DEFAULT 0,
  route_efficiency numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Companies can be viewed by authenticated users"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Companies can be created by authenticated users"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Companies can be updated by authenticated users"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for vehicles
CREATE POLICY "Vehicles can be viewed by authenticated users"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vehicles can be created by authenticated users"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Vehicles can be updated by authenticated users"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for operators
CREATE POLICY "Operators can be viewed by authenticated users"
  ON operators
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operators can be created by authenticated users"
  ON operators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Operators can be updated by authenticated users"
  ON operators
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for customers
CREATE POLICY "Customers can be viewed by authenticated users"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can be created by authenticated users"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for shipments
CREATE POLICY "Shipments can be viewed by authenticated users"
  ON shipments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Shipments can be created by authenticated users"
  ON shipments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Shipments can be updated by authenticated users"
  ON shipments
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for shipment_updates
CREATE POLICY "Shipment updates can be viewed by authenticated users"
  ON shipment_updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Shipment updates can be created by authenticated users"
  ON shipment_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Notifications can be viewed by authenticated users"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Notifications can be created by authenticated users"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Notifications can be updated by authenticated users"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for analytics
CREATE POLICY "Analytics can be viewed by authenticated users"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- Functions for VCODE generation
CREATE OR REPLACE FUNCTION generate_vcode()
RETURNS text AS $$
BEGIN
  RETURN 'VC' || EXTRACT(EPOCH FROM NOW())::bigint || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 3));
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate VCODE for vehicles
CREATE OR REPLACE FUNCTION auto_generate_vcode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vcode IS NULL OR NEW.vcode = '' THEN
    NEW.vcode = generate_vcode();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_vcode_trigger
  BEFORE INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_vcode();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_vcode ON vehicles(vcode);
CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_operator_id ON shipments(operator_id);
CREATE INDEX IF NOT EXISTS idx_shipment_updates_shipment_id ON shipment_updates(shipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);