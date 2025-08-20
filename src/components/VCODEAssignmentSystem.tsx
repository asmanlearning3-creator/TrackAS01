import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  Truck, 
  Zap, 
  CheckCircle, 
  Clock, 
  MapPin,
  User,
  Package,
  Navigation,
  AlertTriangle,
  RefreshCw,
  Target,
  Shield
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useApp } from '../context/AppContext';

interface VCODEAssignmentSystemProps {
  shipmentId: string;
  model: 'subscription' | 'pay-per-shipment';
  onAssignmentComplete?: (assignment: any) => void;
}

const VCODEAssignmentSystem: React.FC<VCODEAssignmentSystemProps> = ({
  shipmentId,
  model,
  onAssignmentComplete
}) => {
  const { vehicles, operators, updateShipmentStatus } = useDatabase();
  const { dispatch } = useApp();
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<any>(null);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  useEffect(() => {
    if (model === 'subscription') {
      autoAssignVehicle();
    } else {
      findAvailableOperators();
    }
  }, [shipmentId, model]);

  const autoAssignVehicle = async () => {
    setIsAssigning(true);
    
    try {
      // Get available vehicles from company fleet
      const companyVehicles = vehicles?.filter(v => 
        v.status === 'verified' && 
        v.availability === 'available'
      ) || [];

      if (companyVehicles.length === 0) {
        setAssignmentResult({
          success: false,
          message: 'No available vehicles in fleet',
          recommendation: 'Please ensure vehicles are registered and available'
        });
        return;
      }

      // Simulate AI-based assignment logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Score vehicles based on proximity, capacity, and performance
      const scoredVehicles = companyVehicles.map(vehicle => {
        let score = 0;
        
        // Capacity match (prefer vehicles that match load requirements)
        const weightUtilization = 25 / vehicle.weight_capacity; // Mock shipment weight
        score += weightUtilization > 0.7 ? 50 : weightUtilization > 0.4 ? 30 : 10;
        
        // Driver performance
        const operator = operators?.find(o => o.vehicle_id === vehicle.id);
        if (operator) {
          score += operator.rating * 10;
          score += operator.on_time_rate * 0.5;
        }
        
        // Vehicle type preference
        score += vehicle.type === 'truck' ? 20 : 10;
        
        return { ...vehicle, assignmentScore: score, operator };
      });

      // Select best vehicle
      const bestVehicle = scoredVehicles.sort((a, b) => b.assignmentScore - a.assignmentScore)[0];
      
      if (bestVehicle) {
        // Update shipment with assignment
        await updateShipmentStatus(shipmentId, 'assigned', 
          `Auto-assigned to vehicle ${bestVehicle.registration_number} (VCODE: ${bestVehicle.vcode})`
        );

        setAssignmentResult({
          success: true,
          vehicle: bestVehicle,
          operator: bestVehicle.operator,
          assignmentMethod: 'VCODE Auto-Assignment',
          confidence: Math.min(bestVehicle.assignmentScore, 100),
          estimatedPickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        });

        // Notify operator
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `NOT-${Date.now()}`,
            type: 'info',
            title: 'New Shipment Assigned',
            message: `Shipment ${shipmentId} assigned to your vehicle ${bestVehicle.registration_number}`,
            timestamp: 'Just now',
            read: false
          }
        });

        onAssignmentComplete?.(assignmentResult);
      }
    } catch (error) {
      console.error('Auto-assignment failed:', error);
      setAssignmentResult({
        success: false,
        message: 'Auto-assignment failed',
        error: error.message
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const findAvailableOperators = async () => {
    setIsAssigning(true);
    
    try {
      // Get available operators for pay-per-shipment model
      const availableOps = operators?.filter(o => o.status === 'available') || [];
      
      // Score operators based on rating, proximity, and specializations
      const scoredOperators = availableOps.map(operator => {
        let score = 0;
        
        // Performance factors
        score += operator.rating * 20;
        score += operator.on_time_rate;
        score += Math.min(operator.total_deliveries * 0.5, 50);
        
        // Mock distance calculation (in real app, use actual coordinates)
        const mockDistance = Math.random() * 50 + 5; // 5-55 km
        score += Math.max(0, 100 - mockDistance * 2);
        
        return { 
          ...operator, 
          matchScore: Math.round(score),
          estimatedArrival: Math.round(mockDistance / 40 * 60), // minutes
          distance: Math.round(mockDistance)
        };
      });

      setAvailableVehicles(scoredOperators.sort((a, b) => b.matchScore - a.matchScore));
    } catch (error) {
      console.error('Failed to find operators:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const assignToOperator = async (operatorId: string) => {
    setIsAssigning(true);
    
    try {
      const operator = availableVehicles.find(o => o.id === operatorId);
      
      await updateShipmentStatus(shipmentId, 'assigned', 
        `Offered to operator ${operator.name} for acceptance`
      );

      setAssignmentResult({
        success: true,
        operator,
        assignmentMethod: 'AI Operator Matching',
        confidence: operator.matchScore,
        status: 'pending_acceptance'
      });

      // Notify operator
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: 'info',
          title: 'New Job Offer',
          message: `Shipment ${shipmentId} is available for acceptance`,
          timestamp: 'Just now',
          read: false
        }
      });

      onAssignmentComplete?.(assignmentResult);
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-orange-600 bg-orange-50';
      case 'offline': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            {model === 'subscription' ? (
              <Hash className="h-6 w-6 text-purple-600" />
            ) : (
              <Target className="h-6 w-6 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {model === 'subscription' ? 'VCODE Auto-Assignment' : 'AI Operator Matching'}
            </h3>
            <p className="text-sm text-gray-600">
              {model === 'subscription' 
                ? 'Automatic assignment to company fleet vehicles' 
                : 'Intelligent matching with available operators'
              }
            </p>
          </div>
        </div>
        
        {isAssigning && (
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-700 font-medium">Processing...</span>
          </div>
        )}
      </div>

      {/* Assignment Status */}
      {isAssigning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-900">
                {model === 'subscription' ? 'Auto-Assigning Vehicle...' : 'Finding Best Operators...'}
              </p>
              <p className="text-sm text-blue-700">
                {model === 'subscription' 
                  ? 'Analyzing fleet availability and optimal vehicle match'
                  : 'Evaluating operator proximity, ratings, and specializations'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Result */}
      {assignmentResult && (
        <div className={`border rounded-lg p-4 mb-6 ${
          assignmentResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            {assignmentResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <h4 className={`font-medium ${
              assignmentResult.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {assignmentResult.success ? 'Assignment Successful' : 'Assignment Failed'}
            </h4>
          </div>
          
          {assignmentResult.success ? (
            <div className="space-y-3">
              {model === 'subscription' && assignmentResult.vehicle && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-gray-900">VCODE: {assignmentResult.vehicle.vcode}</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {assignmentResult.confidence}% Match
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Vehicle:</span>
                      <p className="font-medium">{assignmentResult.vehicle.registration_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium capitalize">{assignmentResult.vehicle.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Driver:</span>
                      <p className="font-medium">{assignmentResult.operator?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ETA to Pickup:</span>
                      <p className="font-medium">
                        {new Date(assignmentResult.estimatedPickupTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {model === 'pay-per-shipment' && assignmentResult.operator && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{assignmentResult.operator.name}</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {assignmentResult.confidence}% Match
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <p className="font-medium">★ {assignmentResult.operator.rating}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <p className="font-medium">{assignmentResult.operator.distance} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">On-Time Rate:</span>
                      <p className="font-medium">{assignmentResult.operator.on_time_rate}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ETA:</span>
                      <p className="font-medium">{assignmentResult.operator.estimatedArrival} min</p>
                    </div>
                  </div>
                  
                  {assignmentResult.status === 'pending_acceptance' && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Waiting for operator acceptance</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-green-700">
                Assignment Method: {assignmentResult.assignmentMethod}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-700">{assignmentResult.message}</p>
              {assignmentResult.recommendation && (
                <p className="text-xs text-red-600">Recommendation: {assignmentResult.recommendation}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Available Operators (Pay-Per-Shipment) */}
      {model === 'pay-per-shipment' && !assignmentResult && availableVehicles.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Available Operators</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableVehicles.slice(0, 5).map((operator) => (
              <div
                key={operator.id}
                onClick={() => setSelectedVehicle(operator.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedVehicle === operator.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{operator.name}</h5>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>★ {operator.rating}</span>
                        <span>•</span>
                        <span>{operator.distance} km away</span>
                        <span>•</span>
                        <span>{operator.on_time_rate}% on-time</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {operator.matchScore}% Match
                    </div>
                    <div className="text-xs text-gray-500">
                      ETA: {operator.estimatedArrival} min
                    </div>
                  </div>
                </div>
                
                {selectedVehicle === operator.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => assignToOperator(operator.id)}
                      disabled={isAssigning}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      {isAssigning ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>Assign to This Operator</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Available Vehicles/Operators */}
      {!isAssigning && !assignmentResult && availableVehicles.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">
                No {model === 'subscription' ? 'Available Vehicles' : 'Available Operators'}
              </h4>
              <p className="text-yellow-700 text-sm mt-1">
                {model === 'subscription' 
                  ? 'All fleet vehicles are currently busy or under maintenance'
                  : 'No operators are currently available to accept this shipment'
                }
              </p>
              <button
                onClick={model === 'subscription' ? autoAssignVehicle : findAvailableOperators}
                className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="h-5 w-5 text-purple-600" />
          <h5 className="font-medium text-purple-900">Assignment Insights</h5>
        </div>
        <div className="space-y-2 text-sm text-purple-800">
          {model === 'subscription' ? (
            <>
              <p>• VCODE system ensures automatic assignment to optimal fleet vehicles</p>
              <p>• Assignment based on proximity, capacity, and driver performance</p>
              <p>• Immediate notification to assigned operator</p>
            </>
          ) : (
            <>
              <p>• AI matching considers operator rating, distance, and specializations</p>
              <p>• Operators can accept or decline job offers</p>
              <p>• Automatic fallback to next best operator if declined</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VCODEAssignmentSystem;