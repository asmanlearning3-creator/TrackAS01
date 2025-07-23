export interface Shipment {
  id: string;
  customer: string;
  customerPhone: string;
  customerEmail: string;
  from: string;
  to: string;
  status:
    | "pending"
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "cancelled";
  progress: number;
  driver?: string;
  driverPhone?: string;
  vehicle?: string;
  estimatedDelivery: string;
  currentLocation: string;
  weight: number;
  dimensions: string;
  price?: number;
  urgency: "standard" | "urgent" | "express";
  specialHandling?: string;
  createdAt: string;
  updates: ShipmentUpdate[];
  model: "subscription" | "pay-per-shipment";
}

export interface ShipmentUpdate {
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  location?: string;
}

export interface Operator {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalDeliveries: number;
  onTimeRate: number;
  earnings: number;
  vehicle: string;
  currentLocation: string;
  status: "available" | "busy" | "offline";
  specializations: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalShipments: number;
  rating: number;
  preferredDeliveryTime?: string;
}

export interface Analytics {
  totalShipments: number;
  successRate: number;
  activeOperators: number;
  avgDeliveryTime: string;
  revenue: string;
  routeEfficiency: number;
  dailyTrends: { date: string; shipments: number; revenue: number }[];
  topRoutes: {
    route: string;
    shipments: number;
    revenue: string;
    efficiency: string;
  }[];
  operatorPerformance: {
    name: string;
    rating: number;
    deliveries: number;
    onTime: string;
    earnings: string;
  }[];
}

export interface Company {
  id: string;
  name: string;
  address: string;
  tin: string;
  businessRegistrationNumber: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  fleetSize?: number;
  registrationDate: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  verificationStatus: {
    tinVerified: boolean;
    businessRegVerified: boolean;
    documentsVerified: boolean;
  };
  approvalTimeline?: string;
  rejectionReason?: string;
}

export interface Vehicle {
  id: string;
  companyId: string;
  vcode: string;
  type: "truck" | "van" | "bike" | "car" | "other";
  registrationNumber: string;
  capacity: {
    weight: number; // in kg
    volume: number; // in cubic meters
  };
  driver: {
    name: string;
    mobile: string;
    licenseNumber: string;
  };
  status: "pending" | "verified" | "active" | "inactive" | "rejected";
  verificationStatus: {
    registrationVerified: boolean;
    insuranceVerified: boolean;
    licenseVerified: boolean;
  };
  registrationDate: string;
  approvalDate?: string;
  currentLocation?: string;
  availability: "available" | "busy" | "maintenance";
}

export interface RegistrationApplication {
  id: string;
  type: "company" | "vehicle";
  applicantId: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  submissionDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  comments?: string;
  documents: {
    name: string;
    type: string;
    status: "pending" | "verified" | "rejected";
  }[];
}
