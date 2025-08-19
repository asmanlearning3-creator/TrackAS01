import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Users,
  Package,
  DollarSign,
  MapPin,
  Clock,
  Brain,
  Lightbulb
} from 'lucide-react';
import { aiService } from '../services/aiService';

const DemandForecasting: React.FC = () => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateForecast();
  }, [selectedTimeRange, selectedRegion]);

  const generateForecast = async () => {
    setIsLoading(true);
    
    try {
      const forecast = await aiService.forecastDemand(selectedTimeRange, selectedRegion);
      setForecastData(forecast);
    } catch (error) {
      console.error('Failed to generate forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'north', name: 'North India' },
    { id: 'south', name: 'South India' },
    { id: 'west', name: 'West India' },
    { id: 'east', name: 'East India' },
    { id: 'metro', name: 'Metro Cities' }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 10) return { icon: TrendingUp, color: 'text-green-600' };
    if (growth > 0) return { icon: TrendingUp, color: 'text-blue-600' };
    return { icon: TrendingUp, color: 'text-red-600', rotation: 'rotate-180' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Demand Forecasting</h2>
            <p className="text-gray-600">Predictive analytics for logistics demand planning</p>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="24h">Next 24 Hours</option>
              <option value="7d">Next 7 Days</option>
              <option value="30d">Next 30 Days</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateForecast}
              disabled={isLoading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>Generate Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {forecastData && (
        <div className="space-y-8">
          {/* Forecast Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expected Growth</p>
                  <p className="text-2xl font-bold text-gray-900">+{forecastData.trends.growth.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Peak Demand Day</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...forecastData.predictions.map((p: any) => p.expectedShipments))}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(forecastData.predictions.reduce((sum: number, p: any) => sum + p.confidence, 0) / forecastData.predictions.length)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Predictions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Predictions</h3>
            
            <div className="space-y-4">
              {forecastData.predictions.map((prediction: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {new Date(prediction.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Expected: {prediction.expectedShipments} shipments
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence}% Confidence
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prediction.factors.map((factor: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trends and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Market Trends
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Seasonal Pattern</h5>
                  <p className="text-sm text-blue-800">{forecastData.trends.seasonality}</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Growth Indicators</h5>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {forecastData.trends.growth > 0 ? 'Positive' : 'Negative'} growth trend: 
                      <span className="font-medium ml-1">{forecastData.trends.growth.toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                AI Recommendations
              </h3>
              
              <div className="space-y-3">
                {forecastData.trends.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <span className="text-sm text-yellow-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capacity Planning */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">Capacity Planning Recommendations</h3>
                <p className="text-sm text-indigo-700">AI-driven resource allocation suggestions</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-800">Fleet Expansion</span>
                </div>
                <p className="text-xs text-gray-600">Add 3-5 vehicles for peak demand periods</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-800">Operator Recruitment</span>
                </div>
                <p className="text-xs text-gray-600">Recruit 8-10 additional operators for festival season</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-800">Dynamic Pricing</span>
                </div>
                <p className="text-xs text-gray-600">Implement surge pricing during peak hours</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecasting;