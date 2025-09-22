import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  CreditCard, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Scale,
  Ruler,
  ThermometerSun,
  Shield,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import LoadingSpinner from './LoadingSpinner';
import DynamicPricing from './DynamicPricing';

const EnhancedShipmentCreation: React.FC = () => {
  const { dispatch } = useApp();
  const { createShipment, createCustomer, shipmentsLoading } = useDatabase();
  const [currentStep, setCurrentStep] = useState(1);
  const [model, setModel] = useState<'subscription' | 'pay-per-shipment'>('subscription');
  const [showPricing, setShowPricing] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    // Pickup Details
    pickupAddress: '',
    pickupPincode: '',
    pickupContactPerson: '',
    pickupContactPhone: '',
    pickupTimeWindow: '',
    
    // Destination Details
    destinationAddress: '',
    destinationPincode: '',
    destinationContactPerson: '',
    destinationContactPhone: '',
    deliveryTimeWindow: '',
    
    // Cargo Details
    cargoType: '',
    weight: '',
    volume: '',
    dimensions: '',
    specialInstructions: '',
    
    // Handling Requirements
    isFragile: false,
    isTemperatureControlled: false,
    isOversized: false,
    isHazardous: false,
    temperatureRange: '',
    handlingInstructions: '',
    
    // Customer Details
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    
    // Pricing (Pay-Per-Shipment)
    shipmentCost: '',
    urgency: 'standard',
    
    // Additional
    insuranceRequired: false,
    trackingPreferences: 'sms_email',
    deliveryInstructions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.pickupAddress.trim()) newErrors.pickupAddress = 'Pickup address is required';
      if (!formData.pickupPincode.trim()) newErrors.pickupPincode = 'Pickup pincode is required';
      if (!formData.pickupContactPerson.trim()) newErrors.pickupContactPerson = 'Pickup contact person is required';
      if (!formData.pickupContactPhone.trim()) newErrors.pickupContactPhone = 'Pickup contact phone is required';
      
      if (!formData.destinationAddress.trim()) newErrors.destinationAddress = 'Destination address is required';
      if (!formData.destinationPincode.trim()) newErrors.destinationPincode = 'Destination pincode is required';
      if (!formData.destinationContactPerson.trim()) newErrors.destinationContactPerson = 'Destination contact person is required';
      if (!formData.destinationContactPhone.trim()) newErrors.destinationContactPhone = 'Destination contact phone is required';
    }

    if (step === 2) {
      if (!formData.cargoType.trim()) newErrors.cargoType = 'Cargo type is required';
      if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = 'Valid weight is required';
      if (!formData.volume || parseFloat(formData.volume) <= 0) newErrors.volume = 'Valid volume is required';
      if (!formData.dimensions.trim()) newErrors.dimensions = 'Dimensions are required';
      
      if (formData.isTemperatureControlled && !formData.temperatureRange.trim()) {
        newErrors.temperatureRange = 'Temperature range is required for temperature-controlled cargo';
      }
    }

    if (step === 3) {
      if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
      if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Customer phone is required';
      if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Customer email is required';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
      
      // Phone validation
      const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
      if (formData.customerPhone && !phoneRegex.test(formData.customerPhone)) {
        newErrors.customerPhone = 'Please enter a valid phone number';
      }
    }

    if (step === 4 && model === 'pay-per-shipment') {
      if (!formData.shipmentCost || parseFloat(formData.shipmentCost) <= 0) {
        newErrors.shipmentCost = 'Valid shipment cost is required';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async () => {
    if (!validateStep(4) || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create customer first
      const customer = await createCustomer({
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail,
        address: formData.customerAddress
      });

      // Prepare shipment data
      const shipmentData = {
        customer_id: customer.id,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail,
        pickup_address: `${formData.pickupAddress}, ${formData.pickupPincode}`,
        destination_address: `${formData.destinationAddress}, ${formData.destinationPincode}`,
        weight: parseFloat(formData.weight),
        dimensions: formData.dimensions,
        price: model === 'pay-per-shipment' ? parseFloat(formData.shipmentCost) : null,
        urgency: formData.urgency,
        special_handling: [
          formData.isFragile && 'Fragile',
          formData.isTemperatureControlled && `Temperature Controlled (${formData.temperatureRange})`,
          formData.isOversized && 'Oversized',
          formData.isHazardous && 'Hazardous',
          formData.specialInstructions && formData.specialInstructions
        ].filter(Boolean).join(', '),
        model,
        estimated_delivery: formData.deliveryTimeWindow,
        cargo_details: {
          type: formData.cargoType,
          volume: parseFloat(formData.volume),
          handling_requirements: {
            fragile: formData.isFragile,
            temperature_controlled: formData.isTemperatureControlled,
            oversized: formData.isOversized,
            hazardous: formData.isHazardous,
            temperature_range: formData.temperatureRange,
            instructions: formData.handlingInstructions
          },
          pickup_contact: {
            person: formData.pickupContactPerson,
            phone: formData.pickupContactPhone
          },
          delivery_contact: {
            person: formData.destinationContactPerson,
            phone: formData.destinationContactPhone
          }
        }
      };

      const newShipment = await createShipment(shipmentData);

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'success',
          title: 'Shipment Created Successfully',
          message: `Shipment ${newShipment.id} created and ${model === 'subscription' ? 'assigned to fleet' : 'offered to operators'}`,
          timestamp: 'Just now',
          read: false
        }
      });

      // Reset form
      setFormData({
        pickupAddress: '',
        pickupPincode: '',
        pickupContactPerson: '',
        pickupContactPhone: '',
        pickupTimeWindow: '',
        destinationAddress: '',
        destinationPincode: '',
        destinationContactPerson: '',
        destinationContactPhone: '',
        deliveryTimeWindow: '',
        cargoType: '',
        weight: '',
        volume: '',
        dimensions: '',
        specialInstructions: '',
        isFragile: false,
        isTemperatureControlled: false,
        isOversized: false,
        isHazardous: false,
        temperatureRange: '',
        handlingInstructions: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        shipmentCost: '',
        urgency: 'standard',
        insuranceRequired: false,
        trackingPreferences: 'sms_email',
        deliveryInstructions: ''
      });
      
      setCurrentStep(5); // Success step
    } catch (error) {
      console.error('Failed to create shipment:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'error',
          title: 'Shipment Creation Failed',
          message: 'Failed to create shipment. Please try again.',
          timestamp: 'Just now',
          read: false
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceCalculated = (pricing: any) => {
    setCalculatedPrice(pricing.finalPrice);
    setFormData(prev => ({ ...prev, shipmentCost: pricing.finalPrice.toString() }));
  };

  const getShipmentDataForPricing = () => ({
    distance: 250, // Would be calculated from addresses
    weight: parseFloat(formData.weight) || 0,
    urgency: formData.urgency as 'standard' | 'urgent' | 'express',
    pickupLocation: formData.pickupAddress,
    destinationLocation: formData.destinationAddress
  });

  // Success page
  if (currentStep === 5) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipment Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your shipment has been created and is now {model === 'subscription' ? 'being assigned to your fleet' : 'available for operators to accept'}.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                {model === 'subscription' ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Automatic assignment to nearest available vehicle (VCODE system)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Operator notification and acceptance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Customer notification with operator details</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Shipment offered to qualified operators</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Operator acceptance and assignment</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800">Customer notification and tracking activation</span>
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Real-time tracking and updates begin</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another Shipment
              </button>
              <button
                onClick={() => window.location.href = '/tracking'}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Shipments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Shipment</h2>
        <p className="text-gray-600">Complete shipment details for professional logistics management</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-24 h-1 mx-4 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">Locations</span>
          <span className="text-sm text-gray-600">Cargo Details</span>
          <span className="text-sm text-gray-600">Customer Info</span>
          <span className="text-sm text-gray-600">Pricing & Review</span>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Business Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setModel('subscription')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              model === 'subscription' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${model === 'subscription' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Truck className={`h-5 w-5 ${model === 'subscription' ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Subscription Model</h4>
                <p className="text-sm text-gray-600">Auto-assign to company fleet via VCODE</p>
              </div>
            </div>
          </div>
          
          <div
            onClick={() => setModel('pay-per-shipment')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              model === 'pay-per-shipment' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${model === 'pay-per-shipment' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CreditCard className={`h-5 w-5 ${model === 'pay-per-shipment' ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Pay-Per-Shipment</h4>
                <p className="text-sm text-gray-600">Offer to external operators with custom pricing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Location Details */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Pickup & Destination Details
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pickup Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-green-800 bg-green-50 px-3 py-2 rounded-lg">Pickup Location</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                <textarea
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.pickupAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete pickup address"
                />
                {errors.pickupAddress && <p className="text-red-500 text-sm mt-1">{errors.pickupAddress}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pickupPincode"
                    value={formData.pickupPincode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.pickupPincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Pincode"
                  />
                  {errors.pickupPincode && <p className="text-red-500 text-sm mt-1">{errors.pickupPincode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Window</label>
                  <input
                    type="time"
                    name="pickupTimeWindow"
                    value={formData.pickupTimeWindow}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input
                  type="text"
                  name="pickupContactPerson"
                  value={formData.pickupContactPerson}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.pickupContactPerson ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contact person name"
                />
                {errors.pickupContactPerson && <p className="text-red-500 text-sm mt-1">{errors.pickupContactPerson}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                <input
                  type="tel"
                  name="pickupContactPhone"
                  value={formData.pickupContactPhone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.pickupContactPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contact phone number"
                />
                {errors.pickupContactPhone && <p className="text-red-500 text-sm mt-1">{errors.pickupContactPhone}</p>}
              </div>
            </div>

            {/* Destination Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-red-800 bg-red-50 px-3 py-2 rounded-lg">Destination Location</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination Address *</label>
                <textarea
                  name="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.destinationAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete destination address"
                />
                {errors.destinationAddress && <p className="text-red-500 text-sm mt-1">{errors.destinationAddress}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="destinationPincode"
                    value={formData.destinationPincode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.destinationPincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Pincode"
                  />
                  {errors.destinationPincode && <p className="text-red-500 text-sm mt-1">{errors.destinationPincode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Window</label>
                  <input
                    type="datetime-local"
                    name="deliveryTimeWindow"
                    value={formData.deliveryTimeWindow}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input
                  type="text"
                  name="destinationContactPerson"
                  value={formData.destinationContactPerson}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.destinationContactPerson ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contact person name"
                />
                {errors.destinationContactPerson && <p className="text-red-500 text-sm mt-1">{errors.destinationContactPerson}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                <input
                  type="tel"
                  name="destinationContactPhone"
                  value={formData.destinationContactPhone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.destinationContactPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contact phone number"
                />
                {errors.destinationContactPhone && <p className="text-red-500 text-sm mt-1">{errors.destinationContactPhone}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Cargo Details */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Cargo Details & Handling Requirements
          </h3>
          
          <div className="space-y-6">
            {/* Basic Cargo Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Type *</label>
                <select
                  name="cargoType"
                  value={formData.cargoType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cargoType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select cargo type</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food Items</option>
                  <option value="documents">Documents</option>
                  <option value="machinery">Machinery</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="other">Other</option>
                </select>
                {errors.cargoType && <p className="text-red-500 text-sm mt-1">{errors.cargoType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="urgent">Urgent</option>
                  <option value="express">Express</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter weight"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Volume (m³) *</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.volume ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter volume"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                {errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L x W x H) *</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dimensions ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 100cm x 50cm x 30cm"
                />
                {errors.dimensions && <p className="text-red-500 text-sm mt-1">{errors.dimensions}</p>}
              </div>
            </div>

            {/* Handling Requirements */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Handling Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isFragile"
                    checked={formData.isFragile}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Fragile Items</label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isTemperatureControlled"
                    checked={formData.isTemperatureControlled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Temperature Controlled</label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isOversized"
                    checked={formData.isOversized}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Oversized Cargo</label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isHazardous"
                    checked={formData.isHazardous}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Hazardous Materials</label>
                </div>
              </div>

              {formData.isTemperatureControlled && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temperature Range *</label>
                  <div className="relative">
                    <ThermometerSun className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="temperatureRange"
                      value={formData.temperatureRange}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.temperatureRange ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 2°C to 8°C"
                    />
                  </div>
                  {errors.temperatureRange && <p className="text-red-500 text-sm mt-1">{errors.temperatureRange}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special handling instructions..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Customer Details */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Customer Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter customer name"
              />
              {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.customerPhone && <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Preferences</label>
              <select
                name="trackingPreferences"
                value={formData.trackingPreferences}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sms_email">SMS + Email</option>
                <option value="sms_only">SMS Only</option>
                <option value="email_only">Email Only</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="all">All Channels</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Address (Optional)</label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Customer's primary address for future reference"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions</label>
              <textarea
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Special delivery instructions for the operator..."
              />
            </div>

            {/* Additional Options */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Additional Options</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="insuranceRequired"
                  checked={formData.insuranceRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Insurance Required (Recommended for high-value items)</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Pricing & Review */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Pricing (Pay-Per-Shipment only) */}
          {model === 'pay-per-shipment' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Define Shipment Cost
              </h3>
              
              {!showPricing ? (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowPricing(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Get AI Pricing Suggestion</span>
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Get AI-optimized pricing based on market conditions
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <DynamicPricing
                    shipmentData={getShipmentDataForPricing()}
                    onPriceCalculated={handlePriceCalculated}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Shipment Cost (₹) *
                    </label>
                    <input
                      type="number"
                      name="shipmentCost"
                      value={formData.shipmentCost}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.shipmentCost ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter shipment cost"
                      min="1"
                    />
                    {errors.shipmentCost && <p className="text-red-500 text-sm mt-1">{errors.shipmentCost}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      This amount will be offered to operators for this shipment
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Route:</span>
                  <p className="text-sm text-gray-900">{formData.pickupAddress} → {formData.destinationAddress}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Cargo:</span>
                  <p className="text-sm text-gray-900">{formData.cargoType} - {formData.weight}kg - {formData.dimensions}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Customer:</span>
                  <p className="text-sm text-gray-900">{formData.customerName} ({formData.customerPhone})</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Model:</span>
                  <p className="text-sm text-gray-900 capitalize">{model.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Urgency:</span>
                  <p className="text-sm text-gray-900 capitalize">{formData.urgency}</p>
                </div>
                {model === 'pay-per-shipment' && formData.shipmentCost && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Cost:</span>
                    <p className="text-sm text-gray-900 font-semibold">₹{parseFloat(formData.shipmentCost).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requirements Summary */}
            {(formData.isFragile || formData.isTemperatureControlled || formData.isOversized || formData.isHazardous) && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Special Handling Required</span>
                </div>
                <div className="space-y-1">
                  {formData.isFragile && <p className="text-xs text-yellow-700">• Fragile items - Handle with care</p>}
                  {formData.isTemperatureControlled && <p className="text-xs text-yellow-700">• Temperature controlled ({formData.temperatureRange})</p>}
                  {formData.isOversized && <p className="text-xs text-yellow-700">• Oversized cargo - Special vehicle required</p>}
                  {formData.isHazardous && <p className="text-xs text-yellow-700">• Hazardous materials - Certified handling required</p>}
                </div>
              </div>
            )}
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
        
        {currentStep < 4 ? (
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
                <LoadingSpinner size="sm" text="" />
                <span>Creating Shipment...</span>
              </>
            ) : (
              <span>Create Shipment</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnhancedShipmentCreation;