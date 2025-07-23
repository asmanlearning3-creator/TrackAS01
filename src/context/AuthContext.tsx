import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'logistics' | 'operator' | 'customer';

interface AuthUser extends User {
  role?: UserRole;
  companyId?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: any) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<AuthUser> => {
    try {
      // Try to get user profile from users table
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Return basic user data from auth if profile doesn't exist
        const { data: { user } } = await supabase.auth.getUser();
        return user as AuthUser;
      }

      // Merge auth user with profile data
      const { data: { user } } = await supabase.auth.getUser();
      return {
        ...user,
        role: profile.role,
        companyId: profile.company_id,
        permissions: profile.permissions || []
      } as AuthUser;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      const { data: { user } } = await supabase.auth.getUser();
      return user as AuthUser;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (!error && data.user) {
        // Create user profile
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email,
          role: userData.role,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          company_id: userData.companyId,
          created_at: new Date().toISOString()
        });
      }

      return { error };
    } catch (err) {
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser(updates);
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};