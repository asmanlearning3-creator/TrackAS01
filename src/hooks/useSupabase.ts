import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

// Generic hook for API operations with fallback
function useAPI<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.warn("API call failed:", errorMessage);
      // Set empty data instead of null for better UX
      setData([] as unknown as T);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}

// Companies hook
export const useCompanies = () => {
  const {
    data: companies,
    loading,
    error,
    refetch,
    setData,
  } = useAPI(() => api.companies.getAll(), []);

  const createCompany = async (company: any) => {
    try {
      const newCompany = await api.companies.create(company);
      setData((prev) => (prev ? [newCompany, ...prev] : [newCompany]));
      return newCompany;
    } catch (err) {
      throw err;
    }
  };

  const updateCompanyStatus = async (
    id: string,
    status: any,
    rejectionReason?: string,
  ) => {
    try {
      const updatedCompany = await api.companies.updateStatus(
        id,
        status,
        rejectionReason,
      );
      setData((prev) =>
        prev ? prev.map((c) => (c.id === id ? updatedCompany : c)) : [],
      );
      return updatedCompany;
    } catch (err) {
      throw err;
    }
  };

  return {
    companies: companies || [],
    loading,
    error,
    refetch,
    createCompany,
    updateCompanyStatus,
  };
};

// Vehicles hook
export const useVehicles = () => {
  const {
    data: vehicles,
    loading,
    error,
    refetch,
    setData,
  } = useAPI(() => api.vehicles.getAll(), []);

  const createVehicle = async (vehicle: any) => {
    try {
      const newVehicle = await api.vehicles.create(vehicle);
      setData((prev) => (prev ? [newVehicle, ...prev] : [newVehicle]));
      return newVehicle;
    } catch (err) {
      throw err;
    }
  };

  const updateVehicleStatus = async (id: string, status: any) => {
    try {
      const updatedVehicle = await api.vehicles.updateStatus(id, status);
      setData((prev) =>
        prev ? prev.map((v) => (v.id === id ? updatedVehicle : v)) : [],
      );
      return updatedVehicle;
    } catch (err) {
      throw err;
    }
  };

  const updateVehicleLocation = async (
    id: string,
    lat: number,
    lng: number,
    address?: string,
  ) => {
    try {
      const updatedVehicle = await api.vehicles.updateLocation(
        id,
        lat,
        lng,
        address,
      );
      setData((prev) =>
        prev ? prev.map((v) => (v.id === id ? updatedVehicle : v)) : [],
      );
      return updatedVehicle;
    } catch (err) {
      throw err;
    }
  };

  return {
    vehicles: vehicles || [],
    loading,
    error,
    refetch,
    createVehicle,
    updateVehicleStatus,
    updateVehicleLocation,
  };
};

// Operators hook
export const useOperators = () => {
  const {
    data: operators,
    loading,
    error,
    refetch,
    setData,
  } = useAPI(() => api.operators.getAll(), []);

  const updateOperatorStatus = async (id: string, status: any) => {
    try {
      const updatedOperator = await api.operators.updateStatus(id, status);
      setData((prev) =>
        prev ? prev.map((o) => (o.id === id ? updatedOperator : o)) : [],
      );
      return updatedOperator;
    } catch (err) {
      throw err;
    }
  };

  const updateOperatorLocation = async (
    id: string,
    lat: number,
    lng: number,
    address?: string,
  ) => {
    try {
      const updatedOperator = await api.operators.updateLocation(
        id,
        lat,
        lng,
        address,
      );
      setData((prev) =>
        prev ? prev.map((o) => (o.id === id ? updatedOperator : o)) : [],
      );
      return updatedOperator;
    } catch (err) {
      throw err;
    }
  };

  const updateOperatorPerformance = async (
    id: string,
    deliverySuccess: boolean,
    onTime: boolean,
  ) => {
    try {
      const updatedOperator = await api.operators.updatePerformance(
        id,
        deliverySuccess,
        onTime,
      );
      setData((prev) =>
        prev ? prev.map((o) => (o.id === id ? updatedOperator : o)) : [],
      );
      return updatedOperator;
    } catch (err) {
      throw err;
    }
  };

  return {
    operators: operators || [],
    loading,
    error,
    refetch,
    updateOperatorStatus,
    updateOperatorLocation,
    updateOperatorPerformance,
  };
};

// Customers hook
export const useCustomers = () => {
  const {
    data: customers,
    loading,
    error,
    refetch,
    setData,
  } = useAPI(() => api.customers.getAll(), []);

  const createCustomer = async (customer: any) => {
    try {
      const newCustomer = await api.customers.create(customer);
      setData((prev) => (prev ? [newCustomer, ...prev] : [newCustomer]));
      return newCustomer;
    } catch (err) {
      throw err;
    }
  };

  const upsertCustomer = async (customer: any) => {
    try {
      const upsertedCustomer = await api.customers.upsert(customer);
      setData((prev) => {
        if (!prev) return [upsertedCustomer];
        const existingIndex = prev.findIndex((c) => c.phone === customer.phone);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = upsertedCustomer;
          return updated;
        }
        return [upsertedCustomer, ...prev];
      });
      return upsertedCustomer;
    } catch (err) {
      throw err;
    }
  };

  return {
    customers: customers || [],
    loading,
    error,
    refetch,
    createCustomer,
    upsertCustomer,
  };
};

// Shipments hook with real-time updates
export const useShipments = () => {
  const {
    data: shipments,
    loading,
    error,
    refetch,
    setData,
  } = useAPI(() => api.shipments.getAll(), []);

  const createShipment = async (shipment: any) => {
    try {
      const newShipment = await api.shipments.create(shipment);
      setData((prev) => (prev ? [newShipment, ...prev] : [newShipment]));
      return newShipment;
    } catch (err) {
      throw err;
    }
  };

  const updateShipment = async (id: string, updates: any) => {
    try {
      const updatedShipment = await api.shipments.update(id, updates);
      setData((prev) =>
        prev ? prev.map((s) => (s.id === id ? updatedShipment : s)) : [],
      );
      return updatedShipment;
    } catch (err) {
      throw err;
    }
  };

  const updateShipmentStatus = async (
    id: string,
    status: any,
    message?: string,
  ) => {
    try {
      const updatedShipment = await api.shipments.updateStatus(
        id,
        status,
        message,
      );
      setData((prev) =>
        prev ? prev.map((s) => (s.id === id ? updatedShipment : s)) : [],
      );
      return updatedShipment;
    } catch (err) {
      throw err;
    }
  };

  const addShipmentUpdate = async (
    shipmentId: string,
    message: string,
    type: any,
    location?: { lat: number; lng: number },
    address?: string,
  ) => {
    try {
      await api.shipments.addUpdate(
        shipmentId,
        message,
        type,
        false,
        location,
        address,
      );
      // Refresh shipments to get updated data
      await refetch();
    } catch (err) {
      throw err;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const unsubscribeShipments = api.shipments.subscribeToUpdates((payload) => {
      if (payload.eventType === "INSERT") {
        setData((prev) => (prev ? [payload.new, ...prev] : [payload.new]));
      } else if (payload.eventType === "UPDATE") {
        setData((prev) =>
          prev
            ? prev.map((s) => (s.id === payload.new.id ? payload.new : s))
            : [],
        );
      } else if (payload.eventType === "DELETE") {
        setData((prev) =>
          prev ? prev.filter((s) => s.id !== payload.old.id) : [],
        );
      }
    });

    const unsubscribeUpdates = api.shipments.subscribeToShipmentUpdates(
      (payload) => {
        if (payload.eventType === "INSERT") {
          // Refresh the specific shipment to get updated data
          refetch();
        }
      },
    );

    return () => {
      unsubscribeShipments.unsubscribe();
      unsubscribeUpdates.unsubscribe();
    };
  }, [refetch, setData]);

  return {
    shipments: shipments || [],
    loading,
    error,
    refetch,
    createShipment,
    updateShipment,
    updateShipmentStatus,
    addShipmentUpdate,
  };
};

// Notifications hook with real-time updates
export const useNotifications = (userId?: string, userType?: string) => {
  const {
    data: notifications,
    loading,
    error,
    refetch,
    setData,
  } = useAPI(
    () => api.notifications.getAll(userId, userType),
    [userId, userType],
  );

  const createNotification = async (notification: any) => {
    try {
      const newNotification = await api.notifications.create(notification);
      setData((prev) =>
        prev ? [newNotification, ...prev] : [newNotification],
      );
      return newNotification;
    } catch (err) {
      throw err;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setData((prev) =>
        prev
          ? prev.map((n) =>
              n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
            )
          : [],
      );
    } catch (err) {
      throw err;
    }
  };

  const markAllAsRead = async () => {
    if (!userId || !userType) return;

    try {
      await api.notifications.markAllAsRead(userId, userType);
      setData((prev) =>
        prev
          ? prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
          : [],
      );
    } catch (err) {
      throw err;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId || !userType) return;

    const unsubscribe = api.notifications.subscribeToNotifications(
      userId,
      userType,
      (payload) => {
        if (payload.eventType === "INSERT") {
          setData((prev) => (prev ? [payload.new, ...prev] : [payload.new]));
        }
      },
    );

    return () => {
      unsubscribe.unsubscribe();
    };
  }, [userId, userType, setData]);

  const unreadCount = notifications?.filter((n) => !n.read_at).length || 0;

  return {
    notifications: notifications || [],
    loading,
    error,
    unreadCount,
    refetch,
    createNotification,
    markAsRead,
    markAllAsRead,
  };
};

// Analytics hook
export const useAnalytics = (companyId?: string) => {
  const {
    data: analytics,
    loading,
    error,
    refetch,
  } = useAPI(() => api.analytics.getDashboardStats(companyId), [companyId]);

  const { data: realTimeMetrics, refetch: refetchRealTime } = useAPI(
    () => api.analytics.getRealTimeMetrics(companyId),
    [companyId],
  );

  // Refresh real-time metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(refetchRealTime, 30000);
    return () => clearInterval(interval);
  }, [refetchRealTime]);

  return {
    analytics,
    realTimeMetrics,
    loading,
    error,
    refetch,
    refetchRealTime,
  };
};

// Payments hook
export const usePayments = (shipmentId?: string, operatorId?: string) => {
  const {
    data: payments,
    loading,
    error,
    refetch,
    setData,
  } = useAPI(() => {
    if (shipmentId) return api.payments.getByShipment(shipmentId);
    if (operatorId) return api.payments.getByOperator(operatorId);
    return Promise.resolve([]);
  }, [shipmentId, operatorId]);

  const createPayment = async (payment: any) => {
    try {
      const newPayment = await api.payments.create(payment);
      setData((prev) => (prev ? [newPayment, ...prev] : [newPayment]));
      return newPayment;
    } catch (err) {
      throw err;
    }
  };

  const updatePaymentStatus = async (
    id: string,
    status: any,
    transactionId?: string,
    gatewayResponse?: any,
  ) => {
    try {
      const updatedPayment = await api.payments.updateStatus(
        id,
        status,
        transactionId,
        gatewayResponse,
      );
      setData((prev) =>
        prev ? prev.map((p) => (p.id === id ? updatedPayment : p)) : [],
      );
      return updatedPayment;
    } catch (err) {
      throw err;
    }
  };

  return {
    payments: payments || [],
    loading,
    error,
    refetch,
    createPayment,
    updatePaymentStatus,
  };
};

// Real-time connection hook
export const useRealTime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = api.subscribeToAllChanges((payload) => {
        setLastUpdate(new Date());
        console.log("Real-time update:", payload);
      });
    } catch (error) {
      console.warn("Failed to set up real-time subscriptions:", error);
    }

    setIsConnected(true);

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
      setIsConnected(false);
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
  };
};

// Location tracking hook
export const useLocationTracking = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    error,
    getCurrentLocation,
    watchLocation,
  };
};
