import React, { useState } from 'react';
import { Users, MapPin, Star, Phone, Mail, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const OperatorManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy' | 'offline'>('all');

  const filteredOperators = state.operators.filter(operator => 
    filterStatus === 'all' || operator.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-orange-600 bg-orange-50';
      case 'offline': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'busy': return Clock;
      case 'offline': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const updateOperatorStatus = (operatorId: string, newStatus: 'available' | 'busy' | 'offline') => {
    dispatch({
      type: 'UPDATE_OPERATOR_STATUS',
      payload: { id: operatorId, status: newStatus }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Operator Management</h2>
            <p className="text-gray-600">Manage your fleet operators and track their performance in real-time.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Operators</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operators List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Operators ({filteredOperators.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredOperators.map((operator) => {
                const StatusIcon = getStatusIcon(operator.status);
                return (
                  <div
                    key={operator.id}
                    onClick={() => setSelectedOperator(operator.id)}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedOperator === operator.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{operator.name}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">{operator.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Truck className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{operator.vehicle}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{operator.currentLocation}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operator.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {operator.status.charAt(0).toUpperCase() + operator.status.slice(1)}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {operator.totalDeliveries} deliveries • {operator.onTimeRate}% on-time
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operator Details */}
        <div>
          {selectedOperator ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {(() => {
                const operator = state.operators.find(o => o.id === selectedOperator);
                if (!operator) return null;
                
                const StatusIcon = getStatusIcon(operator.status);
                
                return (
                  <>
                    <div className="text-center mb-6">
                      <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{operator.name}</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(operator.status)}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {operator.status.charAt(0).toUpperCase() + operator.status.slice(1)}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Contact Information</label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{operator.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{operator.email}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Performance</label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rating</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{operator.rating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Deliveries</span>
                            <span className="text-sm font-medium">{operator.totalDeliveries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">On-Time Rate</span>
                            <span className="text-sm font-medium">{operator.onTimeRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Earnings</span>
                            <span className="text-sm font-medium">₹{operator.earnings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Vehicle & Location</label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Truck className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{operator.vehicle}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{operator.currentLocation}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Specializations</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {operator.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">Update Status</label>
                        <div className="space-y-2">
                          {(['available', 'busy', 'offline'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOperatorStatus(operator.id, status)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                operator.status === status
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an operator to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorManagement;