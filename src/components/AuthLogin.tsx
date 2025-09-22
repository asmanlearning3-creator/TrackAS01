import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Shield, Building2, Truck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthLoginProps {
  onLogin: (role: 'admin' | 'logistics' | 'operator' | 'customer', userData: any) => void;
}

const AuthLogin: React.FC<AuthLoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'logistics' | 'operator' | 'customer'>('logistics');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const roles = [
    {
      id: 'admin' as const,
      title: 'Admin',
      description: 'System administration and oversight',
      icon: Shield,
      color: 'bg-red-600',
      demoCredentials: { email: 'admin@trackas.com', password: 'admin123' }
    },
    {
      id: 'logistics' as const,
      title: 'Logistics Company',
      description: 'Manage shipments and fleet operations',
      icon: Building2,
      color: 'bg-blue-600',
      demoCredentials: { email: 'logistics@trackas.com', password: 'logistics123' }
    },
    {
      id: 'operator' as const,
      title: 'Operator/Driver',
      description: 'Accept jobs and manage deliveries',
      icon: Truck,
      color: 'bg-green-600',
      demoCredentials: { email: 'operator@trackas.com', password: 'operator123' }
    },
    {
      id: 'customer' as const,
      title: 'Customer',
      description: 'Track shipments and manage orders',
      icon: User,
      color: 'bg-purple-600',
      demoCredentials: { email: 'customer@trackas.com', password: 'customer123' }
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would authenticate with your backend
      // For demo purposes, we'll simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedRoleData = roles.find(r => r.id === selectedRole);
      const userData = {
        id: `${selectedRole}-user-1`,
        email: formData.email,
        role: selectedRole,
        name: selectedRoleData?.title || 'User',
        verified: true,
        permissions: getRolePermissions(selectedRole)
      };

      // Create simple token for demo (in production, this would come from backend)
      const tokenPayload = {
        sub: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        verified: userData.verified,
        permissions: userData.permissions,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
      };
      const token = btoa(JSON.stringify(tokenPayload));
      localStorage.setItem('trackas_token', token);

      onLogin(selectedRole, userData);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return ['manage_users', 'approve_shipments', 'view_analytics', 'manage_disputes'];
      case 'logistics':
        return ['create_shipments', 'manage_fleet', 'view_analytics', 'assign_operators'];
      case 'operator':
        return ['view_jobs', 'accept_shipments', 'update_status', 'view_earnings'];
      case 'customer':
        return ['view_shipments', 'track_orders', 'download_invoices', 'provide_feedback'];
      default:
        return [];
    }
  };

  const handleDemoLogin = (role: typeof selectedRole) => {
    const roleData = roles.find(r => r.id === role);
    if (roleData) {
      setSelectedRole(role);
      setFormData(roleData.demoCredentials);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/LOGO.png" alt="TrackAS Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TrackAS</h1>
              <p className="text-sm text-gray-600">AI-Powered Logistics Platform</p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Role</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`${role.color} rounded-lg p-2 w-8 h-8 flex items-center justify-center mb-2`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{role.title}</p>
                </button>
              );
            })}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => window.location.href = '/admin-login'}
                className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
              >
                Admin Portal
              </button>
              <button
                onClick={() => window.location.href = '/company-login'}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
              >
                Company Portal
              </button>
              <button
                onClick={() => window.location.href = '/operator-login'}
                className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
              >
                Operator Portal
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleDemoLogin(role.id)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  {role.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <span>Powered by</span>
            <img 
              src="/Vipul.png" 
              alt="Vipul Sharma" 
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="font-medium">Vipul Sharma</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;