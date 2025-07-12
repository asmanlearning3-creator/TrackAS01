import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as api from '../services/api';

// Custom hook for companies
export const useCompanies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.companyAPI.getAll();
      setCompanies(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (company: any) => {
    try {
      const newCompany = await api.companyAPI.create(company);
      setCompanies(prev => [newCompany, ...prev]);
      return newCompany;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
      throw err;
    }
  };

  const updateCompanyStatus = async (id: string, status: any, rejectionReason?: string) => {
    try {
      const updatedCompany = await api.companyAPI.updateStatus(id, status, rejectionReason);
      setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
      return updatedCompany;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
      throw err;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies,
    createCompany,
    updateCompanyStatus
  };
};

// Custom hook for vehicles
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.vehicleAPI.getAll();
      setVehicles(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async (vehicle: any) => {
    try {
      const newVehicle = await api.vehicleAPI.create(vehicle);
      setVehicles(prev => [newVehicle, ...prev]);
      return newVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle');
      throw err;
    }
  };

  const updateVehicleStatus = async (id: string, status: any) => {
    try {
      const updatedVehicle = await api.vehicleAPI.updateStatus(id, status);
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle');
      throw err;
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
    createVehicle,
    updateVehicleStatus
  };
};

// Custom hook for shipments
export const useShipments = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await api.shipmentAPI.getAll();
      setShipments(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (shipment: any) => {
    try {
      const newShipment = await api.shipmentAPI.create(shipment);
      setShipments(prev => [newShipment, ...prev]);
      return newShipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shipment');
      throw err;
    }
  };

  const updateShipment = async (id: string, updates: any) => {
    try {
      const updatedShipment = await api.shipmentAPI.update(id, updates);
      setShipments(prev => prev.map(s => s.id === id ? updatedShipment : s));
      return updatedShipment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shipment');
      throw err;
    }
  };

  const addShipmentUpdate = async (shipmentId: string, message: string, type: any, location?: string) => {
    try {
      await api.shipmentAPI.addUpdate(shipmentId, message, type, location);
      // Refresh shipments to get updated data
      await fetchShipments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add shipment update');
      throw err;
    }
  };

  useEffect(() => {
    fetchShipments();

    // Subscribe to real-time updates
    const subscription = api.shipmentAPI.subscribeToUpdates((payload) => {
      if (payload.eventType === 'INSERT') {
        setShipments(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setShipments(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
      } else if (payload.eventType === 'DELETE') {
        setShipments(prev => prev.filter(s => s.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    shipments,
    loading,
    error,
    refetch: fetchShipments,
    createShipment,
    updateShipment,
    addShipmentUpdate
  };
};

// Custom hook for operators
export const useOperators = () => {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await api.operatorAPI.getAll();
      setOperators(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch operators');
    } finally {
      setLoading(false);
    }
  };

  const updateOperatorStatus = async (id: string, status: any) => {
    try {
      const updatedOperator = await api.operatorAPI.updateStatus(id, status);
      setOperators(prev => prev.map(o => o.id === id ? updatedOperator : o));
      return updatedOperator;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update operator');
      throw err;
    }
  };

  const updateOperatorLocation = async (id: string, location: string) => {
    try {
      const updatedOperator = await api.operatorAPI.updateLocation(id, location);
      setOperators(prev => prev.map(o => o.id === id ? updatedOperator : o));
      return updatedOperator;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update operator location');
      throw err;
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  return {
    operators,
    loading,
    error,
    refetch: fetchOperators,
    updateOperatorStatus,
    updateOperatorLocation
  };
};

// Custom hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notificationAPI.getAll();
      setNotifications(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notification: any) => {
    try {
      const newNotification = await api.notificationAPI.create(notification);
      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
      throw err;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const subscription = api.notificationAPI.subscribeToNotifications((payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications(prev => [payload.new, ...prev]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount: notifications.filter(n => !n.read).length,
    refetch: fetchNotifications,
    createNotification,
    markAsRead
  };
};

// Custom hook for analytics
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.analyticsAPI.getDashboardStats();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh analytics every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

// Custom hook for real-time data
export const useRealTime = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = api.realtimeAPI.subscribeToAllChanges((payload) => {
      console.log('Real-time update:', payload);
      // Handle real-time updates here
    });

    setIsConnected(true);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
};