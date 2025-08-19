import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  FileText,
  MapPin,
  Hash,
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const UnifiedRegistration: React.FC = () => {
  const { dispatch } = useApp();
  const [selectedRole, setSelectedRole] = useState<'logistics' | 'operator'>('logistics');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'email' | 'phone' | 'documents' | 'complete'>('email');

  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Company-specific
    companyName: '',
    companyAddress: '',
    tin: '',
    businessRegistrationNumber: '',
    contactPerson: '',
    fleetSize: '',
    
    // Operator-specific
    vehicleType: 'truck',
    vehicleRegistrationNumber: '',
    driverLicenseNumber: '',
    vehicleCapacity: '',
    bankAccountNumber: '',
    ifscCode: '',
    
    // Verification
    emailOTP: '',
    phoneOTP: '',
    captcha: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});

  const roles = [
    {
      id: 'logistics' as const,
      title: 'Logistics Company',
      description: 'Register your company to manage fleet and shipments',
      icon: Building2,
      color: 'bg-blue-600',
      features: ['Fleet Management', 'Shipment Creation', 'Analytics Dashboard', 'VCODE System']
    },
    {
      id: 'operator' as const,
      title: 'Operator/Driver',
      description: 'Register as an independent operator to accept shipments',
      icon: Truck,
      color: 'bg-green-600',
      features: ['Job Assignments', 'Route Optimization', 'Earnings Tracking', 'Performance Analytics']
    }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Password strength
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    if (step === 2) {
      if (selectedRole === 'logistics') {
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required';
        if (!formData.tin.trim()) newErrors.tin = 'TIN is required';
        if (!formData.businessRegistrationNumber.trim()) newErrors.businessRegistrationNumber = 'Business registration number is required';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
      } else {
        if (!formData.vehicleRegistrationNumber.trim()) newErrors.vehicleRegistrationNumber = 'Vehicle registration number is required';
        if (!formData.driverLicenseNumber.trim()) newErrors.driverLicenseNumber = 'Driver license number is required';
        if (!formData.vehicleCapacity.trim()) newErrors.vehicleCapacity = 'Vehicle capacity is required';
        if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
        if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
      }
    }

    if (step === 3) {
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
      if (!formData.privacyAccepted) newErrors.privacyAccepted = 'You must accept the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const sendEmailOTP = async () => {
    // Simulate email OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'info',
        title: 'Email OTP Sent',
        message: `Verification code sent to ${formData.email}`,
        timestamp: 'Just now',
        read: false
      }
    });
  };

  const sendPhoneOTP = async () => {
    // Simulate phone OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'info',
        title: 'Phone OTP Sent',
        message: `Verification code sent to ${formData.phone}`,
        timestamp: 'Just now',
        read: false
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (selectedRole === 'logistics') {
        const companyData = {
          id: `COMP-${Date.now()}`,
          name: formData.companyName,
          address: formData.companyAddress,
          tin: formData.tin,
          businessRegistrationNumber: formData.businessRegistrationNumber,
          primaryContact: {
            name: formData.contactPerson,
            email: formData.email,
            phone: formData.phone
          },
          fleetSize: parseInt(formData.fleetSize) || 0,
          registrationDate: new Date().toISOString(),
          status: 'pending' as const,
          verificationStatus: {
            tinVerified: false,
            businessRegVerified: false,
            documentsVerified: false
          }
        };

        dispatch({ type: 'ADD_COMPANY_REGISTRATION', payload: companyData });
      } else {
        const vehicleData = {
          id: `VEH-${Date.now()}`,
          companyId: '', // For independent operators
          vcode: `VC${Date.now()}`,
          type: formData.vehicleType as any,
          registrationNumber: formData.vehicleRegistrationNumber,
          capacity: {
            weight: parseFloat(formData.vehicleCapacity),
            volume: parseFloat(formData.vehicleCapacity) * 0.5 // Estimate
          },
          driver: {
            name: formData.fullName,
            mobile: formData.phone,
            licenseNumber: formData.driverLicenseNumber
          },
          status: 'pending' as const,
          verificationStatus: {
            registrationVerified: false,
            insuranceVerified: false,
            licenseVerified: false
          },
          registrationDate: new Date().toISOString(),
          availability: 'available' as const
        };

        dispatch({ type: 'ADD_VEHICLE_REGISTRATION', payload: vehicleData });
      }

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'success',
          title: 'Registration Submitted',
          message: `Your ${selectedRole} registration has been submitted for approval. You will receive updates within 24-48 hours.`,
          timestamp: 'Just now',
          read: false
        }
      });

      setCurrentStep(4);
    } catch (error) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'error',
          title: 'Registration Failed',
          message: 'Failed to submit registration. Please try again.',
          timestamp: 'Just now',
          read: false
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = (docType: string) => {
    // Simulate document upload
    setUploadedDocs(prev => ({ ...prev, [docType]: true }));
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'success',
        title: 'Document Uploaded',
        message: `${docType} uploaded successfully`,
        timestamp: 'Just now',
        read: false
      }
    });
  };

  // Success page
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your {selectedRole} registration has been submitted and is now under review by TrackAS Admin.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800">Document verification (2-4 hours)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800">Background checks (4-8 hours)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800">Admin approval (12-24 hours)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800">Account activation and welcome email</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setFormData({
                      fullName: '', email: '', phone: '', password: '', confirmPassword: '',
                      companyName: '', companyAddress: '', tin: '', businessRegistrationNumber: '',
                      contactPerson: '', fleetSize: '', vehicleType: 'truck', vehicleRegistrationNumber: '',
                      driverLicenseNumber: '', vehicleCapacity: '', bankAccountNumber: '', ifscCode: '',
                      emailOTP: '', phoneOTP: '', captcha: '', termsAccepted: false, privacyAccepted: false
                    });
                  }}
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Register Another Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/LOGO.png" alt="TrackAS Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Join TrackAS</h1>
              <p className="text-sm text-gray-600">AI-Powered Logistics Platform</p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Role</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`${role.color} rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                    <p className="text-gray-600 mb-4">{role.description}</p>
                    <div className="space-y-1">
                      {role.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Basic Information Form */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role-Specific Information */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedRole === 'logistics' ? 'Company Information' : 'Vehicle & Driver Information'}
            </h2>

            {selectedRole === 'logistics' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Primary contact person"
                    />
                    {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Address *</label>
                    <textarea
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.companyAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter complete company address"
                    />
                    {errors.companyAddress && <p className="text-red-500 text-sm mt-1">{errors.companyAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TIN Number *</label>
                    <input
                      type="text"
                      name="tin"
                      value={formData.tin}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.tin ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter TIN number"
                    />
                    {errors.tin && <p className="text-red-500 text-sm mt-1">{errors.tin}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number *</label>
                    <input
                      type="text"
                      name="businessRegistrationNumber"
                      value={formData.businessRegistrationNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.businessRegistrationNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter business registration number"
                    />
                    {errors.businessRegistrationNumber && <p className="text-red-500 text-sm mt-1">{errors.businessRegistrationNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fleet Size (Optional)</label>
                    <input
                      type="number"
                      name="fleetSize"
                      value={formData.fleetSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of vehicles"
                      min="0"
                    />
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Business Registration Certificate</span>
                        {uploadedDocs.businessReg ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentUpload('businessReg')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploadedDocs.businessReg ? 'Uploaded' : 'Upload'}</span>
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">TIN Certificate</span>
                        {uploadedDocs.tinCert ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentUpload('tinCert')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploadedDocs.tinCert ? 'Uploaded' : 'Upload'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="bike">Bike</option>
                      <option value="car">Car</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Registration Number *</label>
                    <input
                      type="text"
                      name="vehicleRegistrationNumber"
                      value={formData.vehicleRegistrationNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.vehicleRegistrationNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="HR-26-AB-1234"
                    />
                    {errors.vehicleRegistrationNumber && <p className="text-red-500 text-sm mt-1">{errors.vehicleRegistrationNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver License Number *</label>
                    <input
                      type="text"
                      name="driverLicenseNumber"
                      value={formData.driverLicenseNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.driverLicenseNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter license number"
                    />
                    {errors.driverLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.driverLicenseNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Capacity (kg) *</label>
                    <input
                      type="number"
                      name="vehicleCapacity"
                      value={formData.vehicleCapacity}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.vehicleCapacity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter capacity in kg"
                      min="1"
                    />
                    {errors.vehicleCapacity && <p className="text-red-500 text-sm mt-1">{errors.vehicleCapacity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number *</label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter bank account number"
                    />
                    {errors.bankAccountNumber && <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter IFSC code"
                    />
                    {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Driver License</span>
                        {uploadedDocs.driverLicense ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentUpload('driverLicense')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploadedDocs.driverLicense ? 'Uploaded' : 'Upload'}</span>
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Vehicle Registration</span>
                        {uploadedDocs.vehicleReg ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentUpload('vehicleReg')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploadedDocs.vehicleReg ? 'Uploaded' : 'Upload'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Terms and Verification */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Terms & Verification</h2>

            <div className="space-y-6">
              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <label className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms and Conditions</a> *
                    </label>
                    {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <label className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a> *
                    </label>
                    {errors.privacyAccepted && <p className="text-red-500 text-sm mt-1">{errors.privacyAccepted}</p>}
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Security & Verification</h4>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• Email verification link will be sent to your email address</p>
                  <p>• Phone OTP will be sent for mobile verification</p>
                  <p>• Documents will be verified by TrackAS Admin team</p>
                  <p>• Account activation within 24-48 hours after approval</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.termsAccepted || !formData.privacyAccepted}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <span>Submit Registration</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : null}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">Sign in here</a>
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm mt-4">
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

export default UnifiedRegistration;