import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  Phone,
  Download,
  Star,
  MessageCircle,
  Navigation,
  AlertCircle,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import LiveTrackingMap from './LiveTrackingMap';

const CustomerShipments: React.FC = () => {
  const { state } = useApp();
  const { shipments } = useDatabase();
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'delivered' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTracking, setShowTracking] = useState(false);

  // Filter shipments for current customer (in real app, filter by customer ID)
  const customerShipments = shipments || state.shipments;
  
  const filteredShipments = customerShipments.filter(shipment => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && ['assigned', 'picked_up', 'in_transit'].includes(shipment.status)) ||
      (filterStatus === 'delivered' && shipment.status === 'delivered') ||
      (filterStatus === 'pending' && shipment.status === 'pending');
    
    const matchesSearch = searchTerm === '' || 
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.pickup_address || shipment.from).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.destination_address || shipment.to).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_transit': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'picked_up': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'assigned': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'picked_up': return 'Picked Up';
      case 'assigned': return 'Assigned';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const handleDownloadInvoice = (shipmentId: string) => {
    // In a real app, this would generate and download the invoice
    alert(`Downloading invoice for shipment ${shipmentId}`);
  };

  const handleRateShipment = (shipmentId: string) => {
    // In a real app, this would open a rating modal
    alert(`Rate shipment ${shipmentId}`);
  };

  const selectedShipmentData = selectedShipment ? 
    filteredShipments.find(s => s.id === selectedShipment) : null;

  if (showTracking && selectedShipmentData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowTracking(false)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Navigation className="h-4 w-4 rotate-180" />
            <span>Back to Shipments</span>
          </button>
        </div>
        <LiveTrackingMap shipmentId={selectedShipmentData.id} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Shipments</h2>
            <p className="text-gray-600">Track your shipments and manage delivery preferences</p>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <Package className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">{filteredShipments.length} Shipments</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Shipments</option>
                <option value="active">Active</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredShipments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shipments Found</h3>
                  <p className="text-gray-600">No shipments match your current filters</p>
                </div>
              </div>
            ) : (
              filteredShipments.map((shipment) => {
                const isSelected = selectedShipment === shipment.id;
                
                return (
                  <div
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment.id)}
                    className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-purple-500 shadow-md' 
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{shipment.id}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(shipment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(shipment.status)}`}>
                            {getStatusText(shipment.status)}
                          </div>
                          {shipment.price && (
                            <p className="text-lg font-bold text-gray-900 mt-1">₹{shipment.price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">From</span>
                          </div>
                          <p className="text-sm text-green-700">{shipment.pickup_address || shipment.from}</p>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">To</span>
                          </div>
                          <p className="text-sm text-red-700">{shipment.destination_address || shipment.to}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{shipment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${shipment.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{shipment.weight} kg</span>
                          </div>
                          {shipment.estimated_delivery && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>ETA: {new Date(shipment.estimated_delivery).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {shipment.status === 'delivered' && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Shipment Details */}
        <div>
          {selectedShipmentData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tracking ID</label>
                  <p className="text-gray-900 font-mono">{selectedShipmentData.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Current Status</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getStatusColor(selectedShipmentData.status)}`}>
                    {getStatusText(selectedShipmentData.status)}
                  </div>
                </div>

                {selectedShipmentData.driver && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Driver Information</label>
                    <div className="bg-gray-50 rounded-lg p-3 mt-1">
                      <p className="font-medium">{selectedShipmentData.driver}</p>
                      <p className="text-sm text-gray-600">{selectedShipmentData.driverPhone}</p>
                      <p className="text-sm text-gray-600">{selectedShipmentData.vehicle}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Package Information</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Weight:</span>
                      <span className="text-sm font-medium">{selectedShipmentData.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dimensions:</span>
                      <span className="text-sm font-medium">{selectedShipmentData.dimensions}</span>
                    </div>
                    {selectedShipmentData.price && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-medium">₹{selectedShipmentData.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Updates */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Recent Updates</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 max-h-32 overflow-y-auto">
                    {selectedShipmentData.updates?.slice(0, 3).map((update, index) => (
                      <div key={index} className="flex items-start space-x-2 mb-2 last:mb-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          update.type === 'success' ? 'bg-green-500' :
                          update.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm text-gray-900">{update.message}</p>
                          <p className="text-xs text-gray-500">{update.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {['assigned', 'picked_up', 'in_transit'].includes(selectedShipmentData.status) && (
                    <button
                      onClick={() => setShowTracking(true)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Live Tracking</span>
                    </button>
                  )}
                  
                  {selectedShipmentData.driver && (
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Contact Driver</span>
                    </button>
                  )}

                  {selectedShipmentData.status === 'delivered' && (
                    <>
                      <button
                        onClick={() => handleDownloadInvoice(selectedShipmentData.id)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Invoice</span>
                      </button>
                      
                      <button
                        onClick={() => handleRateShipment(selectedShipmentData.id)}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Star className="h-4 w-4" />
                        <span>Rate Service</span>
                      </button>
                    </>
                  )}

                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Support</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a shipment to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerShipments;