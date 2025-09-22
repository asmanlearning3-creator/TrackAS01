import React, { useState } from 'react';
import { 
  Shield, 
  Building2, 
  Truck, 
  Eye, 
  EyeOff, 
  LogIn, 
  Mail, 
  Lock,
  Phone,
  AlertCircle,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DedicatedLoginProps {
  userType: 'admin' | 'logistics' | 'operator';
  onSuccess?: () => void;
}

const DedicatedLoginPages: React.FC<DedicatedLoginProps> = ({ userType, onSuccess }) => {
  const { signIn } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'otp'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
    captcha: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const getPageConfig = () => {
    switch (userType) {
      case 'admin':
        return {
          title: 'TrackAS Admin Portal',
          subtitle: 'System Administration & Oversight',
          icon: Shield,
          color: 'bg-red-600',
          gradient: 'from-red-50 to-pink-50',
          demoCredentials: { email: 'admin@trackas.com', password: 'admin123' },
          features: [
            'User Verification & Approval',
            'System-wide Analytics',
            'Dispute Management',
            'Platform Governance'
          ]
        };
      case 'logistics':
        return {
          title: 'Company Dashboard',
          subtitle: 'Fleet Management & Operations',
          icon: Building2,
          color: 'bg-blue-600',
          gradient: 'from-blue-50 to-indigo-50',
          demoCredentials: { email: 'logistics@trackas.com', password: 'logistics123' },
          features: [
            'Shipment Creation & Management',
            'Fleet Tracking & Analytics',
            'Operator Performance',
            'Revenue Analytics'
          ]
        };
      case 'operator':
        return {
          title: 'Operator Portal',
          subtitle: 'Job Management & Earnings',
          icon: Truck,
          color: 'bg-green-600',
          gradient: 'from-green-50 to-emerald-50',
          demoCredentials: { email: 'operator@trackas.com', password: 'operator123' },
          features: [
            'Available Job Assignments',
            'Route Optimization',
            'Earnings Tracking',
            'Performance Metrics'
          ]
        };
      default:
        return {
          title: 'TrackAS Login',
          subtitle: 'Access Your Account',
          icon: LogIn,
          color: 'bg-gray-600',
          gradient: 'from-gray-50 to-slate-50',
          demoCredentials: { email: 'user@trackas.com', password: 'user123' },
          features: []
        };
    }
  };

  const config = getPageConfig();
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (loginMethod === 'otp' && !otpSent) {
        // Send OTP
        await sendOTP();
        return;
      }

      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      const loginCredential = loginMethod === 'email' ? formData.email : formData.phone;
      const password = loginMethod === 'otp' ? formData.otp : formData.password;

      await signIn(loginCredential, password, userType);
      onSuccess?.();
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData(prev => ({
      ...prev,
      email: config.demoCredentials.email,
      password: config.demoCredentials.password
    }));
    setLoginMethod('email');
  };

  const handleForgotPassword = () => {
    alert('Password reset link will be sent to your email address.');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className={`${config.color} rounded-xl p-3`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-sm text-gray-600">{config.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Login Method Selection */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
              {userType === 'operator' && (
                <>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      loginMethod === 'phone'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      loginMethod === 'otp'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="h-4 w-4 inline mr-2" />
                    OTP
                  </button>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Login */}
            {loginMethod === 'email' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {userType === 'logistics' ? 'Company Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
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
              </>
            )}

            {/* Phone Login */}
            {loginMethod === 'phone' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
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
              </>
            )}

            {/* OTP Login */}
            {loginMethod === 'otp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 9876543210"
                      required
                      disabled={otpSent}
                    />
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      OTP sent to {formData.phone}. 
                      <button type="button" className="text-blue-600 hover:text-blue-800 ml-1">
                        Resend OTP
                      </button>
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 2FA */}
            {twoFactorRequired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Two-Factor Authentication Required</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter 2FA code"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  maxLength={6}
                />
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">Remember me</label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800"
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
              className={`w-full ${config.color} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>
                    {loginMethod === 'otp' && !otpSent ? 'Send OTP' : 'Sign In'}
                  </span>
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
              Use Demo Credentials
            </button>
          </div>

          {/* Features */}
          {config.features.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Platform Features:</h4>
              <div className="space-y-2">
                {config.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account? 
            <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
              Register here
            </a>
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm mt-4">
            <span>Secured by</span>
            <Shield className="h-4 w-4" />
            <span className="font-medium">TrackAS Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DedicatedLoginPages;