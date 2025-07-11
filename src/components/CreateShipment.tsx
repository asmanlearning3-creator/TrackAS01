import React, { useState } from 'react';
import { Package, MapPin, Clock, User, CreditCard, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shipment } from '../types';

const CreateShipment: React.FC = () => {
  const { dispatch } = useApp();
  const [model, setModel] = useState<'subscription' | 'pay-per-shipment'>('subscription');
  const [formData, setFormData] = useState({
    pickupLocation: '',
    destination: '',
    weight: '',
    dimensions: '',
    specialHandling: '',
    expectedDelivery: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    price: '',
    urgency: 'standard',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newShipment: Shipment = {
      id: `TAS-2024-${String(Date.now()).slice(-3)}`,
      customer: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      from: formData.pickupLocation,
      to: formData.destination,
      status: 'pending',
      progress: 0,
      estimatedDelivery: formData.expectedDelivery,
      currentLocation: formData.pickupLocation,
      weight: parseFloat(formData.weight),
      dimensions: formData.dimensions,
      price: model === 'pay-per-shipment' ? parseFloat(formData.price) : undefined,
      urgency: formData.urgency as 'standard' | 'urgent' | 'express',
      specialHandling: formData.specialHandling,
      createdAt: new Date().toISOString(),
      model,
      updates: [
        {
          time: new Date().toLocaleTimeString(),
          message: 'Shipment created and awaiting operator assignment',
          type: 'info'
        }
      ]
    };

    dispatch({ type: 'ADD_SHIPMENT', payload: newShipment });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'success',
        title: 'Shipment Created',
        message: `New shipment ${newShipment.id} created successfully`,
        timestamp: 'Just now',
        read: false
      }
    });

    // Reset form
    setFormData({
      pickupLocation: '',
      destination: '',
      weight: '',
      dimensions: '',
      specialHandling: '',
      expectedDelivery: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      price: '',
      urgency: 'standard',
    });

    alert('Shipment created successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Shipment</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Fill in the details to create a new shipment and assign it to the best available operator.</p>
          <div className="hidden md:flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <img 
              src="/LOGO.png" 
              alt="TrackAS Logo" 
              className="h-4 w-auto"
            />
            <span className="text-xs text-purple-700 font-medium">TrackAS System</span>
          </div>
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
                <p className="text-sm text-gray-600">For companies with their own fleet</p>
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
                <p className="text-sm text-gray-600">Book logistics services as needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipment Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Shipment Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter pickup address"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter destination address"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter weight"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="L x W x H (cm)"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery</label>
              <input
                type="datetime-local"
                name="expectedDelivery"
                value={formData.expectedDelivery}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
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
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Handling Requirements</label>
              <textarea
                name="specialHandling"
                value={formData.specialHandling}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special handling instructions..."
              />
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Customer Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing (Only for Pay-Per-Shipment) */}
        {model === 'pay-per-shipment' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Pricing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipment Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter price"
                  required
                />
              </div>
              
              <div className="flex items-end">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Estimated based on:</p>
                  <ul className="text-xs text-gray-500 mt-1">
                    <li>• Distance & Weight</li>
                    <li>• Urgency Level</li>
                    <li>• Special Handling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Shipment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;