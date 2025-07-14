import React, { useState } from 'react';
import { Building2, FileText, User, Phone, Mail, MapPin, Hash, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CompanyRegistration: React.FC = () => {
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'success',
          title: 'Registration Submitted',
          message: `Company registration for ${formData.companyName} submitted successfully. You will receive updates within 24-48 hours.`,
          timestamp: 'Just now',
          read: false
        }
      });

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
      setCurrentStep(4);
    } catch (error: any) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'error',
          title: 'Registration Failed',
          message: 'Failed to submit company registration. Please try again.',
          timestamp: 'Just now',
          read: false
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
    setCurrentStep(1);
    setErrors({});
  };

  // Success page
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
              Your company registration has been submitted and is now under review. 
              You will receive updates within 24-48 hours.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">TIN verification (2-4 hours)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Business registration cross-check (4-8 hours)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Document verification (12-24 hours)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Final approval and account activation</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={resetForm}
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
            <p className="text-gray-600">Register your logistics company to start using TrackAS platform</p>
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
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-24 h-1 mx-4 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">Company Info</span>
          <span className="text-sm text-gray-600">Business Details</span>
          <span className="text-sm text-gray-600">Contact Info</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                  placeholder="Enter complete company address"
                />
                {errors.companyAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyAddress}</p>
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
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Business Registration Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TIN (Tax Identification Number) *
                </label>
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
                  placeholder="Enter business registration number"
                />
                {errors.businessRegistrationNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessRegistrationNumber}</p>
                )}
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Verification Process</h4>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  These details will be verified with government databases. 
                  Please ensure all information is accurate to avoid delays in approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                  placeholder="Enter contact person's full name"
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Approval Timeline</h4>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  After submission, your registration will be reviewed within 24-48 hours. 
                  You'll receive email notifications about the status updates.
                </p>
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
      </form>
    </div>
  );
};

export default CompanyRegistration;