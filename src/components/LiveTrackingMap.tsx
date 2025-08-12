import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock, 
  Phone, 
  MessageCircle,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface TrackingData {
  shipmentId: string;
  currentLocation: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  progress: number;
  eta: string;
  speed: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  lastUpdate: string;
  status: string;
  route: Array<{ lat: number; lng: number }>;
}

interface LiveTrackingMapProps {
  shipmentId: string;
  onStatusUpdate?: (status: string) => void;
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ shipmentId, onStatusUpdate }) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize tracking data
    const mockTrackingData: TrackingData = {
      shipmentId,
      currentLocation: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Near Red Fort, Delhi'
      },
      destination: {
        lat: 19.0760,
        lng: 72.8777,
        address: 'Gateway of India, Mumbai'
      },
      progress: 65,
      eta: '18:30',
      speed: 65,
      driverName: 'Amit Singh',
      driverPhone: '+91-9876543210',
      vehicleNumber: 'HR-26-AB-1234',
      lastUpdate: new Date().toLocaleTimeString(),
      status: 'in_transit',
      route: [
        { lat: 28.6139, lng: 77.2090 },
        { lat: 27.1767, lng: 78.0081 },
        { lat: 26.2389, lng: 73.0243 },
        { lat: 23.2599, lng: 77.4126 },
        { lat: 21.1458, lng: 79.0882 },
        { lat: 19.0760, lng: 72.8777 }
      ]
    };

    setTrackingData(mockTrackingData);

    // Simulate live updates
    const interval = setInterval(() => {
      setTrackingData(prev => {
        if (!prev) return null;
        
        const newProgress = Math.min(prev.progress + Math.random() * 2, 100);
        const newSpeed = 60 + Math.random() * 20;
        
        return {
          ...prev,
          progress: newProgress,
          speed: Math.round(newSpeed),
          lastUpdate: new Date().toLocaleTimeString(),
          currentLocation: {
            ...prev.currentLocation,
            address: `Highway ${Math.floor(Math.random() * 100)}, En route`
          }
        };
      });
      setLastUpdateTime(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [shipmentId]);

  const handleRefresh = () => {
    setLastUpdateTime(new Date());
    // Trigger a manual update
  };

  const handleContactDriver = () => {
    if (trackingData) {
      window.open(`tel:${trackingData.driverPhone}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return 'text-blue-600 bg-blue-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'delayed': return 'text-yellow-600 bg-yellow-50';
      case 'issue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!trackingData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Live Tracking</h3>
            <p className="text-blue-100">Shipment #{trackingData.shipmentId}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isLive && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
              <span className="text-sm">{isLive ? 'Live' : 'Offline'}</span>
            </div>
            
            <button
              onClick={handleRefresh}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-green-50 to-blue-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Interactive Map</p>
            <p className="text-sm text-gray-600">Real-time GPS tracking with route visualization</p>
          </div>
        </div>
        
        {/* Mock GPS Points */}
        <div className="absolute top-4 left-4 bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 bg-blue-500 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2">
          <Truck className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
        </div>
        <div className="absolute bottom-4 right-4 bg-red-500 w-3 h-3 rounded-full"></div>
      </div>

      {/* Status and Progress */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
              {trackingData.status.replace('_', ' ').toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">
              Last updated: {trackingData.lastUpdate}
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">ETA: {trackingData.eta}</p>
            <p className="text-sm text-gray-600">{trackingData.speed} km/h</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{trackingData.progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${trackingData.progress}%` }}
            />
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Current Location</span>
            </div>
            <p className="text-sm text-gray-900">{trackingData.currentLocation.address}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Destination</span>
            </div>
            <p className="text-sm text-gray-900">{trackingData.destination.address}</p>
          </div>
        </div>

        {/* Driver Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{trackingData.driverName}</p>
                <p className="text-sm text-gray-600">{trackingData.vehicleNumber}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleContactDriver}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-5 w-5 text-purple-600" />
            <h5 className="font-medium text-purple-900">AI Insights</h5>
          </div>
          <div className="space-y-2 text-sm text-purple-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>On-time delivery probability: 94%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Traffic conditions: Moderate, no major delays expected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-indigo-600" />
              <span>Route efficiency: 96% - optimal path selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;