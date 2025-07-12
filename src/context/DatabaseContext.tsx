import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  useCompanies, 
  useVehicles, 
  useShipments, 
  useOperators, 
  useNotifications, 
  useAnalytics,
  useRealTime 
} from '../hooks/useSupabase';
import * as api from '../services/api';

interface DatabaseState {
  companies: any[];
  vehicles: any[];
  shipments: any[];
  operators: any[];
  notifications: any[];
  analytics: any;
  loading: {
    companies: boolean;
    vehicles: boolean;
    shipments: boolean;
    operators: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  error: {
    companies: string | null;
    vehicles: string | null;
    shipments: string | null;
    operators: string | null;
    notifications: string | null;
    analytics: string | null;
  };
  isConnected: boolean;
}

interface DatabaseActions {
  // Company actions
  createCompany: (company: any) => Promise<any>;
  updateCompanyStatus: (id: string, status: any, rejectionReason?: string) => Promise<any>;
  
  // Vehicle actions
  createVehicle: (vehicle: any) => Promise<any>;
  updateVehicleStatus: (id: string, status: any) => Promise<any>;
  
  // Shipment actions
  createShipment: (shipment: any) => Promise<any>;
  updateShipment: (id: string, updates: any) => Promise<any>;
  addShipmentUpdate: (shipmentId: string, message: string, type: any, location?: string) => Promise<void>;
  
  // Operator actions
  updateOperatorStatus: (id: string, status: any) => Promise<any>;
  updateOperatorLocation: (id: string, location: string) => Promise<any>;
  
  // Notification actions
  createNotification: (notification: any) => Promise<any>;
  markNotificationAsRead: (id: string) => Promise<void>;
  
  // Utility actions
  refreshAll: () => Promise<void>;
}

const DatabaseContext = createContext<{
  state: DatabaseState;
  actions: DatabaseActions;
} | null>(null);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use all the custom hooks
  const companiesHook = useCompanies();
  const vehiclesHook = useVehicles();
  const shipmentsHook = useShipments();
  const operatorsHook = useOperators();
  const notificationsHook = useNotifications();
  const analyticsHook = useAnalytics();
  const { isConnected } = useRealTime();

  // Combine state
  const state: DatabaseState = {
    companies: companiesHook.companies,
    vehicles: vehiclesHook.vehicles,
    shipments: shipmentsHook.shipments,
    operators: operatorsHook.operators,
    notifications: notificationsHook.notifications,
    analytics: analyticsHook.analytics,
    loading: {
      companies: companiesHook.loading,
      vehicles: vehiclesHook.loading,
      shipments: shipmentsHook.loading,
      operators: operatorsHook.loading,
      notifications: notificationsHook.loading,
      analytics: analyticsHook.loading,
    },
    error: {
      companies: companiesHook.error,
      vehicles: vehiclesHook.error,
      shipments: shipmentsHook.error,
      operators: operatorsHook.error,
      notifications: notificationsHook.error,
      analytics: analyticsHook.error,
    },
    isConnected,
  };

  // Combine actions
  const actions: DatabaseActions = {
    // Company actions
    createCompany: companiesHook.createCompany,
    updateCompanyStatus: companiesHook.updateCompanyStatus,
    
    // Vehicle actions
    createVehicle: vehiclesHook.createVehicle,
    updateVehicleStatus: vehiclesHook.updateVehicleStatus,
    
    // Shipment actions
    createShipment: shipmentsHook.createShipment,
    updateShipment: shipmentsHook.updateShipment,
    addShipmentUpdate: shipmentsHook.addShipmentUpdate,
    
    // Operator actions
    updateOperatorStatus: operatorsHook.updateOperatorStatus,
    updateOperatorLocation: operatorsHook.updateOperatorLocation,
    
    // Notification actions
    createNotification: notificationsHook.createNotification,
    markNotificationAsRead: notificationsHook.markAsRead,
    
    // Utility actions
    refreshAll: async () => {
      await Promise.all([
        companiesHook.refetch(),
        vehiclesHook.refetch(),
        shipmentsHook.refetch(),
        operatorsHook.refetch(),
        notificationsHook.refetch(),
        analyticsHook.refetch(),
      ]);
    },
  };

  return (
    <DatabaseContext.Provider value={{ state, actions }}>
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

// Utility hook for connection status
export const useConnectionStatus = () => {
  const { state } = useDatabase();
  return {
    isConnected: state.isConnected,
    hasErrors: Object.values(state.error).some(error => error !== null),
    isLoading: Object.values(state.loading).some(loading => loading),
  };
};