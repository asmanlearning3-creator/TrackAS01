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
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  Hash,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UnifiedRegistration: React.FC = () => {
  const { signIn } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'logistics' | 'operator'>('logistics');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    emailOtp: '',
    
    // Company Information
    companyName: '',
    companyAddress: '',
    tin: '',
    businessRegistrationNumber: '',
    contactPerson: '',
    fleetSize: '',
    
    // Operator Information
    vehicleType: 'truck',
    vehicleRegistrationNumber: '',
    driverLicenseNumber: '',
    vehicleWeightCapacity: '',
    vehicleVolumeCapacity: '',
    bankAccountNumber: '',
    bankIFSC: '',
    bankAccountHolder: '',
    
    // Security
    captcha: '',
    termsAccepted: false,
    privacyAccepted: false,
    twoFactorEnabled: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});

  const roles = [
    {
      id: 'logistics' as const,
      title: 'Logistics Company',
      description: 'Register your company to manage fleet and shipments',
      icon: Building2,
      color: 'bg-blue-600',
      features: ['Fleet Management', 'Shipment Creation', 'Analytics Dashboard', 'Operator Management']
    },
    {
      id: 'operator' as const,
      title: 'Operator/Driver',
      description: 'Register as an independent operator to accept shipments',
      icon: Truck,
      color: 'bg-green-600',
      features: ['Job Assignments', 'Route Optimization', 'Earnings Tracking', 'Performance Metrics']
    }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedRole) newErrors.role = 'Please select a role';
    }

    if (step === 2) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Phone validation
      const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
      if (formData.phone && !phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      
      // Password validation
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      if (!emailVerified) newErrors.emailVerification = 'Please verify your email';
      if (!phoneVerified) newErrors.phoneVerification = 'Please verify your phone number';
    }

    if (step === 4) {
      if (selectedRole === 'logistics') {
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required';
        if (!formData.tin.trim()) newErrors.tin = 'TIN is required';
        if (!formData.businessRegistrationNumber.trim()) newErrors.businessRegistrationNumber = 'Business registration number is required';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
      } else {
        if (!formData.vehicleRegistrationNumber.trim()) newErrors.vehicleRegistrationNumber = 'Vehicle registration number is required';
        if (!formData.driverLicenseNumber.trim()) newErrors.driverLicenseNumber = 'Driver license number is required';
        if (!formData.vehicleWeightCapacity || parseFloat(formData.vehicleWeightCapacity) <= 0) {
          newErrors.vehicleWeightCapacity = 'Valid weight capacity is required';
        }
        if (!formData.vehicleVolumeCapacity || parseFloat(formData.vehicleVolumeCapacity) <= 0) {
          newErrors.vehicleVolumeCapacity = 'Valid volume capacity is required';
        }
        if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
        if (!formData.bankIFSC.trim()) newErrors.bankIFSC = 'Bank IFSC code is required';
        if (!formData.bankAccountHolder.trim()) newErrors.bankAccountHolder = 'Account holder name is required';
      }
    }

    if (step === 5) {
      if (!formData.termsAccepted) newErrors.terms = 'Please accept the terms and conditions';
      if (!formData.privacyAccepted) newErrors.privacy = 'Please accept the privacy policy';
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

  const sendEmailVerification = async () => {
    try {
      // Simulate email verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Verification email sent! Please check your inbox.');
      // In real app, this would send actual verification email
      setTimeout(() => setEmailVerified(true), 3000);
    } catch (error) {
      setErrors(prev => ({ ...prev, email: 'Failed to send verification email' }));
    }
  };

  const sendPhoneOTP = async () => {
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      alert('OTP sent to your phone number!');
    } catch (error) {
      setErrors(prev => ({ ...prev, phone: 'Failed to send OTP' }));
    }
  };

  const verifyOTP = async () => {
    if (formData.otp.length === 6) {
      setPhoneVerified(true);
      alert('Phone number verified successfully!');
    } else {
      setErrors(prev => ({ ...prev, otp: 'Please enter a valid 6-digit OTP' }));
    }
  };

  const handleFileUpload = (docType: string, file: File) => {
    setUploadedDocs(prev => ({ ...prev, [docType]: file }));
  };

  const handleSubmit = async () => {
    if (!validateStep(5) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare registration data
      const registrationData = {
        role: selectedRole,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, // In production, this would be hashed on the backend
        emailVerified,
        phoneVerified,
        ...(selectedRole === 'logistics' ? {
          companyName: formData.companyName,
          companyAddress: formData.companyAddress,
          tin: formData.tin,
          businessRegistrationNumber: formData.businessRegistrationNumber,
          contactPerson: formData.contactPerson,
          fleetSize: formData.fleetSize ? parseInt(formData.fleetSize) : null
        } : {
          vehicleType: formData.vehicleType,
          vehicleRegistrationNumber: formData.vehicleRegistrationNumber,
          driverLicenseNumber: formData.driverLicenseNumber,
          vehicleWeightCapacity: parseFloat(formData.vehicleWeightCapacity),
          vehicleVolumeCapacity: parseFloat(formData.vehicleVolumeCapacity),
          bankDetails: {
            accountNumber: formData.bankAccountNumber,
            ifscCode: formData.bankIFSC,
            accountHolder: formData.bankAccountHolder
          }
        }),
        uploadedDocuments: Object.keys(uploadedDocs),
        twoFactorEnabled: formData.twoFactorEnabled,
        registrationDate: new Date().toISOString(),
        status: 'pending_approval'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Registration submitted successfully! You will receive approval updates within 24-48 hours.');
      setCurrentStep(6); // Success step
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'Registration failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: '',
      emailOtp: '',
      companyName: '',
      companyAddress: '',
      tin: '',
      businessRegistrationNumber: '',
      contactPerson: '',
      fleetSize: '',
      vehicleType: 'truck',
      vehicleRegistrationNumber: '',
      driverLicenseNumber: '',
      vehicleWeightCapacity: '',
      vehicleVolumeCapacity: '',
      bankAccountNumber: '',
      bankIFSC: '',
      bankAccountHolder: '',
      captcha: '',
      termsAccepted: false,
      privacyAccepted: false,
      twoFactorEnabled: false
    });
    setCurrentStep(1);
    setErrors({});
    setOtpSent(false);
    setEmailVerified(false);
    setPhoneVerified(false);
    setUploadedDocs({});
  };

  // Success page
  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your {selectedRole === 'logistics' ? 'company' : 'operator'} registration has been submitted 
                and is now under review by TrackAS Admin.
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
                    <span className="text-blue-800">Account activation & login access</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={resetForm}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register Another Account
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go to Login
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 max-w-2xl mx-auto text-xs text-gray-600">
            <span>Role</span>
            <span>Basic Info</span>
            <span>Verification</span>
            <span>Details</span>
            <span>Review</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Select Your Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`${role.color} rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h4>
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
            </div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
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
                      placeholder="Enter your email"
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

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="twoFactorEnabled"
                      checked={formData.twoFactorEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-600">
                      Enable Two-Factor Authentication (Recommended)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Verification</h3>
              
              <div className="space-y-6">
                {/* Email Verification */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">Email Verification</h4>
                        <p className="text-sm text-blue-700">{formData.email}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {emailVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                  
                  {!emailVerified && (
                    <button
                      onClick={sendEmailVerification}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Verification Email
                    </button>
                  )}
                </div>

                {/* Phone Verification */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">Phone Verification</h4>
                        <p className="text-sm text-green-700">{formData.phone}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      phoneVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {phoneVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                  
                  {!phoneVerified && (
                    <div className="space-y-4">
                      {!otpSent ? (
                        <button
                          onClick={sendPhoneOTP}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Send OTP
                        </button>
                      ) : (
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                          />
                          <button
                            onClick={verifyOTP}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Role-Specific Details */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {selectedRole === 'logistics' ? 'Company Details' : 'Vehicle & Driver Details'}
              </h3>
              
              {selectedRole === 'logistics' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Address *
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TIN Number *
                      </label>
                      <input
                        type="text"
                        name="tin"
                        value={formData.tin}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.tin ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Tax Identification Number"
                      />
                      {errors.tin && <p className="text-red-500 text-sm mt-1">{errors.tin}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Registration Number *
                      </label>
                      <input
                        type="text"
                        name="businessRegistrationNumber"
                        value={formData.businessRegistrationNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.businessRegistrationNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Business registration number"
                      />
                      {errors.businessRegistrationNumber && <p className="text-red-500 text-sm mt-1">{errors.businessRegistrationNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fleet Size (Optional)
                      </label>
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
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type *
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Registration Number *
                      </label>
                      <input
                        type="text"
                        name="vehicleRegistrationNumber"
                        value={formData.vehicleRegistrationNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.vehicleRegistrationNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., HR-26-AB-1234"
                      />
                      {errors.vehicleRegistrationNumber && <p className="text-red-500 text-sm mt-1">{errors.vehicleRegistrationNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driver License Number *
                      </label>
                      <input
                        type="text"
                        name="driverLicenseNumber"
                        value={formData.driverLicenseNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.driverLicenseNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Driver license number"
                      />
                      {errors.driverLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.driverLicenseNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight Capacity (kg) *
                      </label>
                      <input
                        type="number"
                        name="vehicleWeightCapacity"
                        value={formData.vehicleWeightCapacity}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.vehicleWeightCapacity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Maximum weight capacity"
                        min="1"
                      />
                      {errors.vehicleWeightCapacity && <p className="text-red-500 text-sm mt-1">{errors.vehicleWeightCapacity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Volume Capacity (m³) *
                      </label>
                      <input
                        type="number"
                        name="vehicleVolumeCapacity"
                        value={formData.vehicleVolumeCapacity}
                        onChange={handleChange}
                        step="0.1"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.vehicleVolumeCapacity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Volume capacity"
                        min="0.1"
                      />
                      {errors.vehicleVolumeCapacity && <p className="text-red-500 text-sm mt-1">{errors.vehicleVolumeCapacity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Bank account number"
                      />
                      {errors.bankAccountNumber && <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank IFSC Code *
                      </label>
                      <input
                        type="text"
                        name="bankIFSC"
                        value={formData.bankIFSC}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bankIFSC ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="IFSC code"
                      />
                      {errors.bankIFSC && <p className="text-red-500 text-sm mt-1">{errors.bankIFSC}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        name="bankAccountHolder"
                        value={formData.bankAccountHolder}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bankAccountHolder ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Account holder name"
                      />
                      {errors.bankAccountHolder && <p className="text-red-500 text-sm mt-1">{errors.bankAccountHolder}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Document Upload & Terms */}
          {currentStep === 5 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Document Upload & Terms</h3>
              
              <div className="space-y-6">
                {/* Document Upload */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Required Documents</h4>
                  <div className="space-y-4">
                    {selectedRole === 'logistics' ? (
                      <>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Business Registration Certificate</p>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                              Choose File
                            </button>
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">TIN Certificate</p>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                              Choose File
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Driver License</p>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                              Choose File
                            </button>
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Vehicle Registration Certificate</p>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                              Choose File
                            </button>
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Bank Account Proof</p>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                              Choose File
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label className="text-sm text-gray-700">
                      I agree to the <a href="/terms" className="text-blue-600 hover:text-blue-800">Terms and Conditions</a>
                    </label>
                  </div>
                  {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="privacyAccepted"
                      checked={formData.privacyAccepted}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label className="text-sm text-gray-700">
                      I agree to the <a href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
                    </label>
                  </div>
                  {errors.privacy && <p className="text-red-500 text-sm">{errors.privacy}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Registration</span>
                )}
              </button>
            )}
          </div>

          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <span>Already have an account?</span>
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in here
            </a>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm mt-2">
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