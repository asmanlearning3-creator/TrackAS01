import React, { createContext, useContext, ReactNode } from 'react';
import { 
  useCompanies, 
  useVehicles, 
  useShipments, 
  useOperators, 
  useNotifications, 
  useAnalytics,
  useCustomers,
  usePayments,
  useRealTime,
  useLocationTracking
} from '../hooks/useSupabase';

interface DatabaseContextType {
  // Companies
  companies: any[];
  companiesLoading: boolean;
  companiesError: string | null;
  createCompany: (company: any) => Promise<any>;
  updateCompanyStatus: (id: string, status: any, rejectionReason?: string) => Promise<any>;
  refetchCompanies: () => Promise<void>;

  // Vehicles
  vehicles: any[];
  vehiclesLoading: boolean;
  vehiclesError: string | null;
  createVehicle: (vehicle: any) => Promise<any>;
  updateVehicleStatus: (id: string, status: any) => Promise<any>;
  updateVehicleLocation: (id: string, lat: number, lng: number, address?: string) => Promise<any>;
  refetchVehicles: () => Promise<void>;

  // Operators
  operators: any[];
  operatorsLoading: boolean;
  operatorsError: string | null;
  updateOperatorStatus: (id: string, status: any) => Promise<any>;
  updateOperatorLocation: (id: string, lat: number, lng: number, address?: string) => Promise<any>;
  updateOperatorPerformance: (id: string, deliverySuccess: boolean, onTime: boolean) => Promise<any>;
  refetchOperators: () => Promise<void>;

  // Customers
  customers: any[];
  customersLoading: boolean;
  customersError: string | null;
  createCustomer: (customer: any) => Promise<any>;
  upsertCustomer: (customer: any) => Promise<any>;
  refetchCustomers: () => Promise<void>;

  // Shipments
  shipments: any[];
  shipmentsLoading: boolean;
  shipmentsError: string | null;
  createShipment: (shipment: any) => Promise<any>;
  updateShipment: (id: string, updates: any) => Promise<any>;
  updateShipmentStatus: (id: string, status: any, message?: string) => Promise<any>;
  addShipmentUpdate: (shipmentId: string, message: string, type: any, location?: { lat: number; lng: number }, address?: string) => Promise<void>;
  refetchShipments: () => Promise<void>;

  // Notifications
  notifications: any[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  unreadCount: number;
  createNotification: (notification: any) => Promise<any>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refetchNotifications: () => Promise<void>;

  // Analytics
  analytics: any;
  realTimeMetrics: any;
  analyticsLoading: boolean;
  analyticsError: string | null;
  refetchAnalytics: () => Promise<void>;
  refetchRealTimeMetrics: () => Promise<void>;

  // Payments
  payments: any[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  createPayment: (payment: any) => Promise<any>;
  updatePaymentStatus: (id: string, status: any, transactionId?: string, gatewayResponse?: any) => Promise<any>;
  refetchPayments: () => Promise<void>;

  // Real-time & Location
  isConnected: boolean;
  lastUpdate: Date | null;
  currentLocation: {lat: number, lng: number} | null;
  locationError: string | null;
  getCurrentLocation: () => void;
  watchLocation: () => (() => void) | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
  userId?: string;
  userType?: 'company' | 'operator' | 'customer';
  companyId?: string;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ 
  children, 
  userId, 
  userType, 
  companyId 
}) => {
  // Use all the custom hooks
  const companiesHook = useCompanies();
  const vehiclesHook = useVehicles();
  const operatorsHook = useOperators();
  const customersHook = useCustomers();
  const shipmentsHook = useShipments();
  const notificationsHook = useNotifications(userId, userType);
  const analyticsHook = useAnalytics(companyId);
  const paymentsHook = usePayments();
  const { isConnected, lastUpdate } = useRealTime();
  const { location, error: locationError, getCurrentLocation, watchLocation } = useLocationTracking();

  const contextValue: DatabaseContextType = {
    // Companies
    companies: companiesHook.companies,
    companiesLoading: companiesHook.loading,
    companiesError: companiesHook.error,
    createCompany: companiesHook.createCompany,
    updateCompanyStatus: companiesHook.updateCompanyStatus,
    refetchCompanies: companiesHook.refetch,

    // Vehicles
    vehicles: vehiclesHook.vehicles,
    vehiclesLoading: vehiclesHook.loading,
    vehiclesError: vehiclesHook.error,
    createVehicle: vehiclesHook.createVehicle,
    updateVehicleStatus: vehiclesHook.updateVehicleStatus,
    updateVehicleLocation: vehiclesHook.updateVehicleLocation,
    refetchVehicles: vehiclesHook.refetch,

    // Operators
    operators: operatorsHook.operators,
    operatorsLoading: operatorsHook.loading,
    operatorsError: operatorsHook.error,
    updateOperatorStatus: operatorsHook.updateOperatorStatus,
    updateOperatorLocation: operatorsHook.updateOperatorLocation,
    updateOperatorPerformance: operatorsHook.updateOperatorPerformance,
    refetchOperators: operatorsHook.refetch,

    // Customers
    customers: customersHook.customers,
    customersLoading: customersHook.loading,
    customersError: customersHook.error,
    createCustomer: customersHook.createCustomer,
    upsertCustomer: customersHook.upsertCustomer,
    refetchCustomers: customersHook.refetch,

    // Shipments
    shipments: shipmentsHook.shipments,
    shipmentsLoading: shipmentsHook.loading,
    shipmentsError: shipmentsHook.error,
    createShipment: shipmentsHook.createShipment,
    updateShipment: shipmentsHook.updateShipment,
    updateShipmentStatus: shipmentsHook.updateShipmentStatus,
    addShipmentUpdate: shipmentsHook.addShipmentUpdate,
    refetchShipments: shipmentsHook.refetch,

    // Notifications
    notifications: notificationsHook.notifications,
    notificationsLoading: notificationsHook.loading,
    notificationsError: notificationsHook.error,
    unreadCount: notificationsHook.unreadCount,
    createNotification: notificationsHook.createNotification,
    markNotificationAsRead: notificationsHook.markAsRead,
    markAllNotificationsAsRead: notificationsHook.markAllAsRead,
    refetchNotifications: notificationsHook.refetch,

    // Analytics
    analytics: analyticsHook.analytics,
    realTimeMetrics: analyticsHook.realTimeMetrics,
    analyticsLoading: analyticsHook.loading,
    analyticsError: analyticsHook.error,
    refetchAnalytics: analyticsHook.refetch,
    refetchRealTimeMetrics: analyticsHook.refetchRealTime,

    // Payments
    payments: paymentsHook.payments,
    paymentsLoading: paymentsHook.loading,
    paymentsError: paymentsHook.error,
    createPayment: paymentsHook.createPayment,
    updatePaymentStatus: paymentsHook.updatePaymentStatus,
    refetchPayments: paymentsHook.refetch,

    // Real-time & Location
    isConnected,
    lastUpdate,
    currentLocation: location,
    locationError,
    getCurrentLocation,
    watchLocation
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// Utility hooks
export const useConnectionStatus = () => {
  const { isConnected, lastUpdate } = useDatabase();
  const hasErrors = false; // You can implement error checking logic here
  const isLoading = false; // You can implement loading state logic here

  return {
    isConnected,
    lastUpdate,
    hasErrors,
    isLoading,
  };
};

export const useRealTimeUpdates = (callback: (data: any) => void) => {
  const { lastUpdate } = useDatabase();
  
  React.useEffect(() => {
    if (lastUpdate) {
      callback({ timestamp: lastUpdate });
    }
  }, [lastUpdate, callback]);
};

// Specialized hooks for different user types
export const useLogisticsData = (companyId: string) => {
  const db = useDatabase();
  
  return {
    // Company-specific data
    vehicles: db.vehicles.filter(v => v.company_id === companyId),
    operators: db.operators.filter(o => o.company_id === companyId),
    shipments: db.shipments.filter(s => s.company_id === companyId),
    analytics: db.analytics,
    
    // Actions
    createVehicle: db.createVehicle,
    createShipment: db.createShipment,
    updateShipmentStatus: db.updateShipmentStatus,
    updateOperatorStatus: db.updateOperatorStatus,
  };
};

export const useOperatorData = (operatorId: string) => {
  const db = useDatabase();
  
  return {
    // Operator-specific data
    assignedShipments: db.shipments.filter(s => s.operator_id === operatorId),
    availableJobs: db.shipments.filter(s => s.status === 'pending'),
    earnings: db.payments.filter(p => p.operator_id === operatorId),
    
    // Actions
    updateLocation: (lat: number, lng: number, address?: string) => 
      db.updateOperatorLocation(operatorId, lat, lng, address),
    updateShipmentStatus: db.updateShipmentStatus,
    addShipmentUpdate: db.addShipmentUpdate,
  };
};

export const useCustomerData = (customerId: string) => {
  const db = useDatabase();
  
  return {
    // Customer-specific data
    myShipments: db.shipments.filter(s => s.customer_id === customerId),
    notifications: db.notifications.filter(n => n.user_id === customerId && n.user_type === 'customer'),
    
    // Actions
    createShipment: db.createShipment,
    markNotificationAsRead: db.markNotificationAsRead,
  };
};