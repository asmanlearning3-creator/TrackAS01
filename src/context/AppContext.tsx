import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Shipment, Operator, Customer, Analytics, Company, Vehicle } from '../types';

interface AppState {
  shipments: Shipment[];
  operators: Operator[];
  customers: Customer[];
  companies: Company[];
  vehicles: Vehicle[];
  analytics: Analytics;
  notifications: Notification[];
  selectedShipment: string | null;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

type AppAction = 
  | { type: 'ADD_SHIPMENT'; payload: Shipment }
  | { type: 'UPDATE_SHIPMENT'; payload: { id: string; updates: Partial<Shipment> } }
  | { type: 'SELECT_SHIPMENT'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_OPERATOR_STATUS'; payload: { id: string; status: Operator['status'] } }
  | { type: 'ADD_COMPANY_REGISTRATION'; payload: Company }
  | { type: 'ADD_VEHICLE_REGISTRATION'; payload: Vehicle }
  | { type: 'UPDATE_COMPANY_STATUS'; payload: { id: string; status: Company['status']; rejectionReason?: string } }
  | { type: 'UPDATE_VEHICLE_STATUS'; payload: { id: string; status: Vehicle['status'] } };

const initialState: AppState = {
  shipments: [
    {
      id: 'TAS-2024-001',
      customer: 'Rajesh Kumar',
      customerPhone: '+91-9876543210',
      customerEmail: 'rajesh.kumar@email.com',
      from: 'Delhi',
      to: 'Mumbai',
      status: 'in_transit',
      progress: 65,
      driver: 'Amit Singh',
      driverPhone: '+91-9876543210',
      vehicle: 'HR-26-AB-1234',
      estimatedDelivery: '2024-01-15 18:00',
      currentLocation: 'Near Kota, Rajasthan',
      weight: 25,
      dimensions: '50x40x30 cm',
      price: 2500,
      urgency: 'standard',
      specialHandling: 'Fragile items',
      createdAt: '2024-01-15 08:00',
      model: 'pay-per-shipment',
      updates: [
        { time: '14:30', message: 'Vehicle departed from Delhi', type: 'info' },
        { time: '16:45', message: 'Crossed Gurgaon checkpoint', type: 'info' },
        { time: '18:20', message: 'Rest stop at Dharuhera', type: 'warning' },
        { time: '19:30', message: 'Resumed journey', type: 'info' },
        { time: '21:15', message: 'Approaching Kota', type: 'info' },
      ]
    },
    {
      id: 'TAS-2024-002',
      customer: 'Priya Sharma',
      customerPhone: '+91-9876543211',
      customerEmail: 'priya.sharma@email.com',
      from: 'Bangalore',
      to: 'Chennai',
      status: 'picked_up',
      progress: 25,
      driver: 'Ravi Kumar',
      driverPhone: '+91-9876543211',
      vehicle: 'KA-05-CD-5678',
      estimatedDelivery: '2024-01-15 16:00',
      currentLocation: 'Hosur, Tamil Nadu',
      weight: 15,
      dimensions: '40x30x20 cm',
      urgency: 'urgent',
      createdAt: '2024-01-15 10:00',
      model: 'subscription',
      updates: [
        { time: '12:00', message: 'Package picked up from Bangalore', type: 'success' },
        { time: '13:30', message: 'Crossed city limits', type: 'info' },
        { time: '14:45', message: 'Entered Tamil Nadu', type: 'info' },
      ]
    }
  ],
  operators: [
    {
      id: 'OP-001',
      name: 'Amit Singh',
      phone: '+91-9876543210',
      email: 'amit.singh@email.com',
      rating: 4.9,
      totalDeliveries: 67,
      onTimeRate: 98,
      earnings: 18450,
      vehicle: 'HR-26-AB-1234',
      currentLocation: 'Kota, Rajasthan',
      status: 'busy',
      specializations: ['Fragile', 'Express']
    },
    {
      id: 'OP-002',
      name: 'Ravi Kumar',
      phone: '+91-9876543211',
      email: 'ravi.kumar@email.com',
      rating: 4.8,
      totalDeliveries: 54,
      onTimeRate: 96,
      earnings: 15230,
      vehicle: 'KA-05-CD-5678',
      currentLocation: 'Chennai, Tamil Nadu',
      status: 'busy',
      specializations: ['Standard', 'Urgent']
    }
  ],
  companies: [],
  vehicles: [],
  customers: [
    {
      id: 'CUST-001',
      name: 'Rajesh Kumar',
      phone: '+91-9876543210',
      email: 'rajesh.kumar@email.com',
      totalShipments: 12,
      rating: 4.7
    }
  ],
  analytics: {
    totalShipments: 2847,
    successRate: 98.4,
    activeOperators: 156,
    avgDeliveryTime: '2.4h',
    revenue: '₹12.8L',
    routeEfficiency: 94.2,
    dailyTrends: [],
    topRoutes: [
      { route: 'Delhi → Mumbai', shipments: 245, revenue: '₹2.8L', efficiency: '96%' },
      { route: 'Bangalore → Chennai', shipments: 189, revenue: '₹1.9L', efficiency: '94%' }
    ],
    operatorPerformance: [
      { name: 'Amit Singh', rating: 4.9, deliveries: 67, onTime: '98%', earnings: '₹18,450' }
    ]
  },
  notifications: [
    {
      id: 'NOT-001',
      type: 'info',
      title: 'Shipment Update',
      message: 'TAS-2024-001 is approaching destination',
      timestamp: '2 mins ago',
      read: false
    },
    {
      id: 'NOT-002',
      type: 'success',
      title: 'Delivery Completed',
      message: 'TAS-2024-003 delivered successfully',
      timestamp: '15 mins ago',
      read: false
    }
  ],
  selectedShipment: null
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_SHIPMENT':
      return {
        ...state,
        shipments: [...state.shipments, action.payload]
      };
    case 'UPDATE_SHIPMENT':
      return {
        ...state,
        shipments: state.shipments.map(shipment =>
          shipment.id === action.payload.id
            ? { ...shipment, ...action.payload.updates }
            : shipment
        )
      };
    case 'SELECT_SHIPMENT':
      return {
        ...state,
        selectedShipment: action.payload
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };
    case 'UPDATE_OPERATOR_STATUS':
      return {
        ...state,
        operators: state.operators.map(operator =>
          operator.id === action.payload.id
            ? { ...operator, status: action.payload.status }
            : operator
        )
      };
    case 'ADD_COMPANY_REGISTRATION':
      return {
        ...state,
        companies: [...state.companies, action.payload]
      };
    case 'ADD_VEHICLE_REGISTRATION':
      return {
        ...state,
        vehicles: [...state.vehicles, action.payload]
      };
    case 'UPDATE_COMPANY_STATUS':
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id
            ? { 
                ...company, 
                status: action.payload.status,
                rejectionReason: action.payload.rejectionReason,
                verificationStatus: action.payload.status === 'approved' ? {
                  tinVerified: true,
                  businessRegVerified: true,
                  documentsVerified: true
                } : company.verificationStatus
              }
            : company
        )
      };
    case 'UPDATE_VEHICLE_STATUS':
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.id
            ? { 
                ...vehicle, 
                status: action.payload.status,
                verificationStatus: action.payload.status === 'verified' ? {
                  registrationVerified: true,
                  insuranceVerified: true,
                  licenseVerified: true
                } : vehicle.verificationStatus,
                availability: action.payload.status === 'verified' ? 'available' : vehicle.availability
              }
            : vehicle
        )
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};