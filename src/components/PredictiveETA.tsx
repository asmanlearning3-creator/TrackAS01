import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Cloud,
  Car,
  BarChart3,
  Target,
  Brain
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface PredictiveETAProps {
  shipmentId: string;
  currentLocation: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  onETAUpdate?: (eta: any) => void;
}

const PredictiveETA: React.FC<PredictiveETAProps> = ({
  shipmentId,
  currentLocation,
  destination,
  onETAUpdate
}) => {
  const [etaData, setEtaData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [historicalAccuracy, setHistoricalAccuracy] = useState(94.2);
  const [realTimeFactors, setRealTimeFactors] = useState<any>(null);

  useEffect(() => {
    calculatePredictiveETA();
    
    // Update ETA every 2 minutes
    const interval = setInterval(calculatePredictiveETA, 120000);
    return () => clearInterval(interval);
  }, [currentLocation, destination]);

  const calculatePredictiveETA = async () => {
    setIsCalculating(true);
    
    try {
      // Get real-time conditions
      const conditions = await aiService.getRealTimeConditions(currentLocation);
      setRealTimeFactors(conditions);

      // Calculate predictive ETA
      const eta = await aiService.calculatePredictiveETA(
        currentLocation,
        destination,
        [], // Historical data would be passed here
        conditions.traffic,
        conditions.weather
      );

      setEtaData(eta);
      onETAUpdate?.(eta);
    } catch (error) {
      console.error('Failed to calculate predictive ETA:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'light': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'heavy': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Predictive ETA</h3>
            <p className="text-sm text-gray-600">Real-time delivery time prediction</p>
          </div>
        </div>
        
        {isCalculating && (
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-700 font-medium">Calculating...</span>
          </div>
        )}
      </div>

      {etaData && (
        <div className="space-y-6">
          {/* Main ETA Display */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold text-purple-900">
                  {formatTime(etaData.estimatedMinutes)}
                </h4>
                <p className="text-purple-700">Estimated Time to Delivery</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(etaData.confidence)}`}>
                  <Target className="h-4 w-4 mr-1" />
                  {etaData.confidence}% Confidence
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  Arrival: {new Date(etaData.arrivalTime).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Car className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">+{etaData.factors.traffic}m</span>
                </div>
                <p className="text-xs text-purple-700">Traffic Impact</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Cloud className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">+{etaData.factors.weather}m</span>
                </div>
                <p className="text-xs text-purple-700">Weather Impact</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">+{etaData.factors.historical}m</span>
                </div>
                <p className="text-xs text-purple-700">Historical Data</p>
              </div>
            </div>
          </div>

          {/* Real-Time Factors */}
          {realTimeFactors && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Car className="h-5 w-5 text-blue-600" />
                  <h5 className="font-medium text-gray-900">Traffic Conditions</h5>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Level:</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrafficColor(realTimeFactors.traffic.level)}`}>
                      {realTimeFactors.traffic.level.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Speed:</span>
                    <span className="text-sm font-medium">{Math.round(realTimeFactors.traffic.averageSpeed)} km/h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Incidents:</span>
                    <span className="text-sm font-medium">{realTimeFactors.traffic.incidents}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Cloud className="h-5 w-5 text-indigo-600" />
                  <h5 className="font-medium text-gray-900">Weather Conditions</h5>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Condition:</span>
                    <span className="text-sm font-medium capitalize">{realTimeFactors.weather.condition}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Temperature:</span>
                    <span className="text-sm font-medium">{Math.round(realTimeFactors.weather.temperature)}°C</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Visibility:</span>
                    <span className="text-sm font-medium">{realTimeFactors.weather.visibility} km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <h5 className="font-medium text-blue-900">AI Insights</h5>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{realTimeFactors?.recommendations || 'Optimal delivery conditions detected'}</span>
              </p>
              <p className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span>Historical accuracy for this route: {historicalAccuracy}%</span>
              </p>
              <p className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-indigo-600" />
                <span>Route optimization active - saving 12 minutes</span>
              </p>
            </div>
          </div>

          {/* ETA History */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">ETA Updates</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Initial ETA:</span>
                <span className="font-medium">3h 45m</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Updated ETA:</span>
                <span className="font-medium text-green-600">{formatTime(etaData.estimatedMinutes)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time Saved:</span>
                <span className="font-medium text-green-600">-15 minutes</span>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={calculatePredictiveETA}
            disabled={isCalculating}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Navigation className="h-4 w-4" />
            <span>Recalculate ETA</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictiveETA;