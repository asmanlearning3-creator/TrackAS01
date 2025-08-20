import React, { useState } from 'react';
import { Shield, Eye, EyeOff, LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess?: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate 2FA requirement for admin
      if (!twoFactorRequired && formData.email && formData.password) {
        setTwoFactorRequired(true);
        setIsLoading(false);
        return;
      }

      // Validate 2FA code
      if (twoFactorRequired && formData.twoFactorCode.length !== 6) {
        setError('Please enter a valid 6-digit 2FA code');
        setIsLoading(false);
        return;
      }

      await signIn(formData.email, formData.password, 'admin');
      onSuccess?.();
    } catch (err) {
      setError('Invalid credentials or 2FA code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData(prev => ({
      ...prev,
      email: 'admin@trackas.com',
      password: 'admin123'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-red-600 rounded-xl p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TrackAS Admin Portal</h1>
              <p className="text-sm text-gray-600">System Administration & Oversight</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter admin email"
                  required
                  disabled={twoFactorRequired}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter password"
                  required
                  disabled={twoFactorRequired}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 2FA Code */}
            {twoFactorRequired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Two-Factor Authentication Required</span>
                </div>
                <input
                  type="text"
                  value={formData.twoFactorCode}
                  onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-yellow-700 mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">Remember me</label>
              </div>
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-800"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>{twoFactorRequired ? 'Verify & Sign In' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Demo Access:</p>
            <button
              onClick={handleDemoLogin}
              className="w-full text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
            >
              Use Demo Admin Credentials
            </button>
          </div>

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Admin Features:</h4>
            <div className="space-y-2">
              {[
                'User Verification & Approval',
                'System-wide Analytics',
                'Dispute Management',
                'Platform Governance'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <span>Secured by</span>
            <Shield className="h-4 w-4" />
            <span className="font-medium">TrackAS Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;