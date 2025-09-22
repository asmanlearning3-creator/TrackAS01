import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'shipper' | 'fleet_operator' | 'individual_vehicle_owner' | 'customer';
  name: string;
  verified: boolean;
  permissions: string[];
  companyId?: string;
  operatorId?: string;
  fleetId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  signIn: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('trackas_token');
    if (token) {
      try {
        const userData = jwtDecode<any>(token);
        if (userData.exp * 1000 > Date.now()) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { 
              user: {
                id: userData.sub || userData.id,
                email: userData.email,
                role: userData.role,
                name: userData.name,
                verified: userData.verified || true,
                permissions: userData.permissions || []
              }, 
              token 
            }
          });
        } else {
          localStorage.removeItem('trackas_token');
        }
      } catch (error) {
        localStorage.removeItem('trackas_token');
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const signIn = async (email: string, password: string, role: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: `${role}-user-1`,
        email,
        role: role as User['role'],
        name: getRoleName(role),
        verified: true,
        permissions: getRolePermissions(role)
      };

      // Create a simple token structure (in production, this would come from your backend)
      const tokenPayload = {
        sub: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        verified: userData.verified,
        permissions: userData.permissions,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
      };
      
      // Simple base64 encoding for demo (in production, use proper JWT from backend)
      const token = btoa(JSON.stringify(tokenPayload));
      localStorage.setItem('trackas_token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData, token }
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('trackas_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const hasPermission = (permission: string): boolean => {
    return state.user?.permissions.includes(permission) || false;
  };

  const getRoleName = (role: string): string => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'shipper': return 'Logistics Company (Shipper)';
      case 'fleet_operator': return 'Fleet Operator';
      case 'individual_vehicle_owner': return 'Individual Vehicle Owner';
      case 'customer': return 'Customer';
      default: return 'User';
    }
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return [
          'manage_users', 'approve_shipments', 'view_analytics', 'manage_disputes', 'system_settings',
          'manage_commission', 'manage_subscriptions', 'manage_escrow', 'approve_companies', 'approve_vehicles',
          'approve_drivers', 'waive_fees', 'manage_dynamic_pricing'
        ];
      case 'shipper':
        return [
          'create_shipments', 'set_shipment_price', 'pay_commission', 'track_shipments', 'rate_drivers',
          'approve_invoices', 'manage_company_profile', 'view_analytics'
        ];
      case 'fleet_operator':
        return [
          'manage_fleet', 'receive_shipment_requests', 'assign_to_drivers', 'manage_subscriptions',
          'view_fleet_analytics', 'monitor_vehicles', 'view_earnings', 'manage_company_profile'
        ];
      case 'individual_vehicle_owner':
        return [
          'mark_availability', 'receive_shipment_requests', 'accept_reject_shipments', 'navigate_routes',
          'upload_pod', 'view_earnings', 'view_ratings', 'manage_vehicle_profile'
        ];
      case 'customer':
        return [
          'view_shipments', 'track_orders', 'download_invoices', 'provide_feedback', 'manage_profile',
          'receive_tracking_updates'
        ];
      default:
        return [];
    }
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, updateUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};