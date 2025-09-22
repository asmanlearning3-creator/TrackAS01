import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Package, 
  Navigation, 
  Phone,
  MessageCircle,
  Download,
  Star,
  CheckCircle,
  Truck,
  User,
  AlertCircle,
  RefreshCw,
  Share2,
  Bell
} from 'lucide-react';

interface CustomerTrackingPortalProps {
  trackingId?: string;
}

const CustomerTrackingPortal: React.FC<CustomerTrackingPortalProps> = ({ trackingId: initialTrackingId }) => {
  const [trackingId, setTrackingId] = useState(initialTrackingId || '');
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState({
    sms: true,
    email: true,
    whatsapp: false
  });

  useEffect(() => {
    if (initialTrackingId) {
      handleTrackShipment();
    }
  }, [initialTrackingId]);

  const handleTrackShipment = async () => {
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to fetch shipment data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock shipment data
      const mockShipmentData = {
        id: trackingId,
        status: 'in_transit',
        progress: 65,
        customerName: 'Rajesh Kumar',
        customerPhone: '+91-9876543210',
        pickupAddress: 'Connaught Place, New Delhi, Delhi 110001',
        destinationAddress: 'Gateway of India, Mumbai, Maharashtra 400001',
        estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        currentLocation: 'Near Kota, Rajasthan',
        driver: {
          name: 'Amit Singh',
          phone: '+91-9876543210',
          rating: 4.9,
          vehicle: 'HR-26-AB-1234'
        },
        timeline: [
          {
            time: '08:00 AM',
            date: 'Today',
            message: 'Shipment created and confirmed',
            type: 'success',
            completed: true
          },
          {
            time: '09:30 AM',
            date: 'Today',
            message: 'Operator assigned and notified',
            type: 'info',
            completed: true
          },
          {
            time: '11:00 AM',
            date: 'Today',
            message: 'Package picked up from Delhi',
            type: 'success',
            completed: true
          },
          {
            time: '02:30 PM',
            date: 'Today',
            message: 'In transit - Crossed Gurgaon',
            type: 'info',
            completed: true
          },
          {
            time: '06:45 PM',
            date: 'Today',
            message: 'Currently near Kota, Rajasthan',
            type: 'info',
            completed: true,
            current: true
          },
          {
            time: '11:30 PM',
            date: 'Today',
            message: 'Expected to reach Udaipur',
            type: 'info',
            completed: false
          },
          {
            time: '08:00 AM',
            date: 'Tomorrow',
            message: 'Expected delivery in Mumbai',
            type: 'success',
            completed: false
          }
        ],
        packageDetails: {
          weight: '25 kg',
          dimensions: '50x40x30 cm',
          value: '₹15,000',
          specialHandling: 'Fragile items'
        },
        liveUpdates: [
          { time: '6:45 PM', message: 'Vehicle moving at 65 km/h on NH-8', location: 'Kota, Rajasthan' },
          { time: '6:30 PM', message: 'Rest stop completed, journey resumed', location: 'Highway Rest Area' },
          { time: '5:15 PM', message: 'Scheduled rest stop for driver', location: 'Dharuhera, Haryana' }
        ]
      };

      setShipmentData(mockShipmentData);
    } catch (err) {
      setError('Shipment not found. Please check your tracking ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async (channel: string, enabled: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [channel]: enabled }));
    // In real app, this would update notification preferences
  };

  const handleShareTracking = () => {
    const shareUrl = `${window.location.origin}/track/${trackingId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Tracking link copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'in_transit': return 'text-blue-600 bg-blue-50';
      case 'picked_up': return 'text-yellow-600 bg-yellow-50';
      case 'assigned': return 'text-purple-600 bg-purple-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/LOGO.png" alt="TrackAS Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Track Your Shipment</h1>
                <p className="text-sm text-gray-600">Real-time tracking powered by AI</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-700 font-medium">Live Tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Tracking ID</h2>
            <p className="text-gray-600">Track your shipment in real-time with AI-powered updates</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tracking ID (e.g., TAS-2024-001)"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                />
              </div>
              <button
                onClick={handleTrackShipment}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Track</span>
              </button>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shipment Details */}
        {shipmentData && (
          <div className="space-y-8">
            {/* Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Shipment {shipmentData.id}</h3>
                  <p className="text-gray-600">Customer: {shipmentData.customerName}</p>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(shipmentData.status)}`}>
                    {getStatusText(shipmentData.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ETA: {new Date(shipmentData.estimatedDelivery).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Delivery Progress</span>
                  <span>{shipmentData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${shipmentData.progress}%` }}
                  />
                </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Pickup Location</span>
                  </div>
                  <p className="text-sm text-green-700">{shipmentData.pickupAddress}</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Destination</span>
                  </div>
                  <p className="text-sm text-red-700">{shipmentData.destinationAddress}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Map */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Live Location</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Live</span>
                      </div>
                      <button
                        onClick={() => window.location.reload()}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-64 flex items-center justify-center relative">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900">Interactive Map</p>
                      <p className="text-sm text-gray-600">Real-time GPS tracking</p>
                    </div>
                    
                    {/* Mock GPS indicators */}
                    <div className="absolute top-4 left-4 bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center">
                        <Truck className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-red-500 w-3 h-3 rounded-full"></div>
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Current Location</span>
                    </div>
                    <p className="text-sm text-blue-700">{shipmentData.currentLocation}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Live Updates */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Updates</h3>
                  <div className="space-y-3">
                    {shipmentData.liveUpdates.map((update: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{update.message}</p>
                            <span className="text-xs text-gray-500">{update.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{update.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Driver Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{shipmentData.driver.name}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm text-gray-600">{shipmentData.driver.rating} rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vehicle:</span>
                      <span className="text-sm font-medium">{shipmentData.driver.vehicle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium">{shipmentData.driver.phone}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>

                {/* Package Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weight:</span>
                      <span className="text-sm font-medium">{shipmentData.packageDetails.weight}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dimensions:</span>
                      <span className="text-sm font-medium">{shipmentData.packageDetails.dimensions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Value:</span>
                      <span className="text-sm font-medium">{shipmentData.packageDetails.value}</span>
                    </div>
                    {shipmentData.packageDetails.specialHandling && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Special Handling</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">{shipmentData.packageDetails.specialHandling}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">SMS Updates</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.sms}
                          onChange={(e) => handleNotificationUpdate('sms', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Email Updates</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.email}
                          onChange={(e) => handleNotificationUpdate('email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">WhatsApp</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.whatsapp}
                          onChange={(e) => handleNotificationUpdate('whatsapp', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleShareTracking}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share Tracking</span>
                    </button>
                    
                    {shipmentData.status === 'delivered' && (
                      <>
                        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Download Invoice</span>
                        </button>
                        
                        <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Rate Service</span>
                        </button>
                      </>
                    )}
                    
                    <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Contact Support</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipment Timeline</h3>
              
              <div className="space-y-4">
                {shipmentData.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.completed 
                          ? event.current 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-green-500'
                          : 'bg-gray-300'
                      }`}>
                        {event.completed ? (
                          event.current ? (
                            <Navigation className="h-4 w-4 text-white" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )
                        ) : (
                          <Clock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      {index < shipmentData.timeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          event.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {event.message}
                        </p>
                        <div className="text-right">
                          <p className={`text-xs ${event.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                            {event.time}
                          </p>
                          <p className={`text-xs ${event.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                            {event.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <span>Powered by</span>
            <img 
              src="/Vipul.png" 
              alt="Vipul Sharma" 
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="font-medium">TrackAS AI Technology</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Real-time tracking with 99.9% accuracy • Founded by Vipul Sharma
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerTrackingPortal;