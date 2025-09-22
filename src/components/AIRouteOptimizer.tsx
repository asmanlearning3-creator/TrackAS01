import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Fuel, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';

interface RouteOption {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelCost: number;
  tollCost: number;
  trafficScore: number;
  weatherScore: number;
  totalCost: number;
  eta: string;
  confidence: number;
  waypoints: Array<{ lat: number; lng: number; address: string }>;
}

interface AIRouteOptimizerProps {
  pickup: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  vehicleType: string;
  urgency: 'standard' | 'urgent' | 'express';
  onRouteSelect: (route: RouteOption) => void;
}

const AIRouteOptimizer: React.FC<AIRouteOptimizerProps> = ({
  pickup,
  destination,
  vehicleType,
  urgency,
  onRouteSelect
}) => {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);

  useEffect(() => {
    optimizeRoutes();
  }, [pickup, destination, vehicleType, urgency]);

  const optimizeRoutes = async () => {
    setIsOptimizing(true);
    setOptimizationComplete(false);

    // Simulate AI route optimization
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockRoutes: RouteOption[] = [
      {
        id: 'fastest',
        name: 'AI Optimized - Fastest',
        distance: 245,
        duration: 180, // minutes
        fuelCost: 850,
        tollCost: 120,
        trafficScore: 85,
        weatherScore: 90,
        totalCost: 970,
        eta: new Date(Date.now() + 180 * 60 * 1000).toLocaleTimeString(),
        confidence: 92,
        waypoints: [
          pickup,
          { lat: pickup.lat + 0.1, lng: pickup.lng + 0.1, address: 'Highway Junction' },
          { lat: destination.lat - 0.1, lng: destination.lng - 0.1, address: 'City Bypass' },
          destination
        ]
      },
      {
        id: 'economical',
        name: 'AI Optimized - Most Economical',
        distance: 280,
        duration: 220,
        fuelCost: 720,
        tollCost: 60,
        trafficScore: 70,
        weatherScore: 88,
        totalCost: 780,
        eta: new Date(Date.now() + 220 * 60 * 1000).toLocaleTimeString(),
        confidence: 88,
        waypoints: [
          pickup,
          { lat: pickup.lat + 0.05, lng: pickup.lng + 0.15, address: 'State Highway' },
          { lat: destination.lat - 0.05, lng: destination.lng - 0.15, address: 'Rural Route' },
          destination
        ]
      },
      {
        id: 'balanced',
        name: 'AI Optimized - Balanced',
        distance: 260,
        duration: 195,
        fuelCost: 790,
        tollCost: 90,
        trafficScore: 80,
        weatherScore: 92,
        totalCost: 880,
        eta: new Date(Date.now() + 195 * 60 * 1000).toLocaleTimeString(),
        confidence: 95,
        waypoints: [
          pickup,
          { lat: pickup.lat + 0.08, lng: pickup.lng + 0.12, address: 'Express Highway' },
          { lat: destination.lat - 0.08, lng: destination.lng - 0.12, address: 'Ring Road' },
          destination
        ]
      }
    ];

    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0].id); // Auto-select the fastest route
    setIsOptimizing(false);
    setOptimizationComplete(true);
  };

  const getRouteRecommendation = (route: RouteOption) => {
    if (urgency === 'express' && route.id === 'fastest') return 'Recommended for Express';
    if (urgency === 'standard' && route.id === 'economical') return 'Recommended for Standard';
    if (route.id === 'balanced') return 'Best Overall Choice';
    return '';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route.id);
    onRouteSelect(route);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Route Optimizer</h3>
            <p className="text-sm text-gray-600">Intelligent route planning with real-time optimization</p>
          </div>
        </div>
        
        {optimizationComplete && (
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Optimization Complete</span>
          </div>
        )}
      </div>

      {/* Route Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Pickup</span>
          </div>
          <p className="text-sm text-gray-900">{pickup.address}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Destination</span>
          </div>
          <p className="text-sm text-gray-900">{destination.address}</p>
        </div>
      </div>

      {/* Optimization Status */}
      {isOptimizing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-900">AI Optimization in Progress</p>
              <p className="text-sm text-blue-700">Analyzing traffic, weather, and route conditions...</p>
            </div>
          </div>
        </div>
      )}

      {/* Route Options */}
      {routes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Optimized Route Options</h4>
          
          {routes.map((route) => (
            <div
              key={route.id}
              onClick={() => handleRouteSelect(route)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedRoute === route.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-gray-900">{route.name}</h5>
                    {getRouteRecommendation(route) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {getRouteRecommendation(route)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{route.totalCost}</p>
                  <p className="text-sm text-gray-600">Total Cost</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Navigation className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{route.distance} km</span>
                  </div>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{Math.floor(route.duration / 60)}h {route.duration % 60}m</span>
                  </div>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Fuel className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">₹{route.fuelCost}</span>
                  </div>
                  <p className="text-xs text-gray-500">Fuel Cost</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">₹{route.tollCost}</span>
                  </div>
                  <p className="text-xs text-gray-500">Toll Cost</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Traffic:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(route.trafficScore)}`}>
                      {route.trafficScore}%
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Weather:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(route.weatherScore)}`}>
                      {route.weatherScore}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{route.confidence}% Confidence</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>ETA:</strong> {route.eta} • <strong>Waypoints:</strong> {route.waypoints.length - 2} stops
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      {optimizationComplete && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <h5 className="font-medium text-purple-900">AI Insights</h5>
          </div>
          <div className="space-y-2 text-sm text-purple-800">
            <p>• Current traffic conditions are optimal for the selected route</p>
            <p>• Weather conditions are favorable with clear visibility</p>
            <p>• Fuel prices are 5% lower on the recommended route</p>
            <p>• Expected delivery time accuracy: 95%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRouteOptimizer;