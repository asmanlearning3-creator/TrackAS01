import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'logistics' | 'operator' | 'customer';
  name: string;
  verified: boolean;
  permissions: string[];
  companyId?: string;
  operatorId?: string;
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
        const userData = JSON.parse(atob(token));
        if (userData.exp > Date.now()) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData, token }
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

      const token = btoa(JSON.stringify({ ...userData, exp: Date.now() + 24 * 60 * 60 * 1000 }));
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
      case 'logistics': return 'Logistics Manager';
      case 'operator': return 'Vehicle Operator';
      case 'customer': return 'Customer';
      default: return 'User';
    }
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['manage_users', 'approve_shipments', 'view_analytics', 'manage_disputes', 'system_settings'];
      case 'logistics':
        return ['create_shipments', 'manage_fleet', 'view_analytics', 'assign_operators', 'manage_customers'];
      case 'operator':
        return ['view_jobs', 'accept_shipments', 'update_status', 'view_earnings', 'update_location'];
      case 'customer':
        return ['view_shipments', 'track_orders', 'download_invoices', 'provide_feedback', 'manage_profile'];
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