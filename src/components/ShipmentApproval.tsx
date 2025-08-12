import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Truck,
  AlertTriangle,
  FileText,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';

interface ShipmentApprovalProps {
  userRole: 'admin' | 'logistics';
}

const ShipmentApproval: React.FC<ShipmentApprovalProps> = ({ userRole }) => {
  const { state, dispatch } = useApp();
  const { shipments, updateShipmentStatus } = useDatabase();
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const pendingShipments = shipments?.filter(s => s.status === 'pending') || [];
  const currentShipment = selectedShipment ? 
    pendingShipments.find(s => s.id === selectedShipment) : 
    pendingShipments[0];

  const handleApproval = async (shipmentId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'assigned' : 'cancelled';
      const message = action === 'approve' ? 
        'Shipment approved and ready for operator assignment' : 
        `Shipment rejected: ${approvalNotes || 'No reason provided'}`;

      await updateShipmentStatus(shipmentId, newStatus, message);

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: action === 'approve' ? 'success' : 'warning',
          title: `Shipment ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: `Shipment ${shipmentId} has been ${action}d`,
          timestamp: 'Just now',
          read: false
        }
      });

      setApprovalNotes('');
      setSelectedShipment(null);
    } catch (error) {
      console.error('Failed to update shipment status:', error);
    }
  };

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'express': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const calculateRiskScore = (shipment: any) => {
    let score = 0;
    if (shipment.urgency === 'express') score += 30;
    if (shipment.urgency === 'urgent') score += 20;
    if (shipment.weight > 100) score += 25;
    if (shipment.price && shipment.price > 5000) score += 25;
    return Math.min(score, 100);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'High', color: 'text-red-600 bg-red-50' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600 bg-green-50' };
  };

  if (pendingShipments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No shipments pending approval at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shipment Approvals</h2>
            <p className="text-gray-600">Review and approve pending shipment requests</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {pendingShipments.length} Pending Approval{pendingShipments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Pending Shipments</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {pendingShipments.map((shipment) => {
                const riskScore = calculateRiskScore(shipment);
                const risk = getRiskLevel(riskScore);
                
                return (
                  <div
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedShipment === shipment.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{shipment.id}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(shipment.urgency)}`}>
                        {shipment.urgency.toUpperCase()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{shipment.customer_name}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {shipment.pickup_address} → {shipment.destination_address}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{shipment.price?.toLocaleString() || 'TBD'}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                        {risk.level} Risk
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="lg:col-span-2">
          {currentShipment ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{currentShipment.id}</h3>
                      <p className="text-gray-600">Submitted {new Date(currentShipment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(currentShipment.urgency)}`}>
                      {currentShipment.urgency.toUpperCase()} PRIORITY
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Risk Assessment</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevel(calculateRiskScore(currentShipment)).color}`}>
                      {getRiskLevel(calculateRiskScore(currentShipment)).level} Risk ({calculateRiskScore(currentShipment)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      Customer Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {currentShipment.customer_name}</p>
                      <p><strong>Phone:</strong> {currentShipment.customer_phone}</p>
                      <p><strong>Email:</strong> {currentShipment.customer_email}</p>
                    </div>
                  </div>

                  {/* Package Information */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-blue-600" />
                      Package Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Weight:</strong> {currentShipment.weight} kg</p>
                      <p><strong>Dimensions:</strong> {currentShipment.dimensions}</p>
                      <p><strong>Value:</strong> ₹{currentShipment.price?.toLocaleString() || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Route Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800 mb-1">Pickup Location</p>
                      <p className="text-sm text-green-700">{currentShipment.pickup_address}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-800 mb-1">Destination</p>
                      <p className="text-sm text-red-700">{currentShipment.destination_address}</p>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {currentShipment.special_handling && (
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      Special Instructions
                    </h5>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">{currentShipment.special_handling}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Approval Decision</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any notes or comments about this approval decision..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleApproval(currentShipment.id, 'approve')}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve Shipment</span>
                    </button>
                    
                    <button
                      onClick={() => handleApproval(currentShipment.id, 'reject')}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Reject Shipment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a shipment to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentApproval;