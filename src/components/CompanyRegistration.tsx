import React, { useState } from 'react';
import { Building2, FileText, User, Phone, Mail, MapPin, Hash, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Company } from '../types';

const CompanyRegistration: React.FC = () => {
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    tin: '',
    businessRegistrationNumber: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    fleetSize: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required';
    }

    if (step === 2) {
      if (!formData.tin.trim()) newErrors.tin = 'TIN is required';
      if (!formData.businessRegistrationNumber.trim()) newErrors.businessRegistrationNumber = 'Business registration number is required';
    }

    if (step === 3) {
      if (!formData.primaryContactName.trim()) newErrors.primaryContactName = 'Primary contact name is required';
      if (!formData.primaryContactEmail.trim()) newErrors.primaryContactEmail = 'Email is required';
      if (!formData.primaryContactPhone.trim()) newErrors.primaryContactPhone = 'Phone number is required';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.primaryContactEmail && !emailRegex.test(formData.primaryContactEmail)) {
        newErrors.primaryContactEmail = 'Please enter a valid email address';
      }
      
      // Phone validation
      const phoneRegex = /^[+]?[\d\s-()]+$/;
      if (formData.primaryContactPhone && !phoneRegex.test(formData.primaryContactPhone)) {
        newErrors.primaryContactPhone = 'Please enter a valid phone number';
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    const newCompany: Company = {
      id: `COMP-${Date.now()}`,
      name: formData.companyName,
      address: formData.companyAddress,
      tin: formData.tin,
      businessRegistrationNumber: formData.businessRegistrationNumber,
      primaryContact: {
        name: formData.primaryContactName,
        email: formData.primaryContactEmail,
        phone: formData.primaryContactPhone,
      },
      fleetSize: formData.fleetSize ? parseInt(formData.fleetSize) : undefined,
      registrationDate: new Date().toISOString(),
      status: 'pending',
      verificationStatus: {
        tinVerified: false,
        businessRegVerified: false,
        documentsVerified: false,
      },
      approvalTimeline: '24-48 hours',
    };

    dispatch({ type: 'ADD_COMPANY_REGISTRATION', payload: newCompany });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'success',
        title: 'Registration Submitted',
        message: `Company registration for ${newCompany.name} submitted successfully. You will receive updates within 24-48 hours.`,
        timestamp: 'Just now',
        read: false
      }
    });

    // Reset form
    setFormData({
      companyName: '',
      companyAddress: '',
      tin: '',
      businessRegistrationNumber: '',
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      fleetSize: '',
    });
    setCurrentStep(4); // Success step
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const steps = [
    { number: 1, title: 'Company Information', icon: Building2 },
    { number: 2, title: 'Business Details', icon: FileText },
    { number: 3, title: 'Contact Information', icon: User },
    { number: 4, title: 'Confirmation', icon: CheckCircle },
  ];

  if (currentStep === 4) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your company registration has been submitted for review. Our verification team will process your application within 24-48 hours.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">TIN/Business Registration Verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Document Review & Validation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Approval & Account Activation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Vehicle Registration Access</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentStep(1)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Another Company
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Registration</h2>
            <p className="text-gray-600">Register your logistics company for subscription-based fleet management</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <img 
              src="/Vipul.png" 
              alt="Vipul Sharma" 
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="text-xs text-purple-700 font-medium">Docs by Vipul Sharma</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.slice(0, 3).map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 2 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Company Information
              </h3>
              
              <div className="space-y-6">
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
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                  )}
                </div>
                
                <div>
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
                    placeholder="Enter your complete company address"
                  />
                  {errors.companyAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyAddress}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Business Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Identification Number (TIN) *
                  </label>
                  <input
                    type="text"
                    name="tin"
                    value={formData.tin}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.tin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your TIN number"
                  />
                  {errors.tin && (
                    <p className="text-red-500 text-sm mt-1">{errors.tin}</p>
                  )}
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
                    placeholder="Enter your business registration number"
                  />
                  {errors.businessRegistrationNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessRegistrationNumber}</p>
                  )}
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
                    placeholder="Number of vehicles in your fleet"
                    min="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">This helps us understand your scalability needs</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Primary Contact Information
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="primaryContactName"
                    value={formData.primaryContactName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.primaryContactName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter primary contact person name"
                  />
                  {errors.primaryContactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryContactName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="primaryContactEmail"
                    value={formData.primaryContactEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.primaryContactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.primaryContactEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryContactEmail}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="primaryContactPhone"
                    value={formData.primaryContactPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.primaryContactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number with country code"
                  />
                  {errors.primaryContactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryContactPhone}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Registration
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyRegistration;