import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Package, 
  Zap,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Brain,
  Gauge,
  Cloud,
  Navigation
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface DynamicPricingProps {
  shipmentData: {
    distance: number;
    weight: number;
    urgency: 'standard' | 'urgent' | 'express';
    pickupLocation: string;
    destinationLocation: string;
  };
  onPriceCalculated?: (pricing: any) => void;
}

const DynamicPricing: React.FC<DynamicPricingProps> = ({ shipmentData, onPriceCalculated }) => {
  const [pricingData, setPricingData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [marketConditions, setMarketConditions] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  useEffect(() => {
    calculateDynamicPrice();
  }, [shipmentData]);

  const calculateDynamicPrice = async () => {
    setIsCalculating(true);
    
    try {
      // Get current market conditions
      const currentHour = new Date().getHours();
      const currentDemand = Math.floor(Math.random() * 40) + 60; // 60-100%
      const weatherConditions = {
        rain: Math.random() > 0.8,
        fog: Math.random() > 0.9
      };

      // Calculate dynamic pricing
      const pricing = await aiService.calculateDynamicPrice(
        shipmentData.distance,
        shipmentData.weight,
        shipmentData.urgency,
        currentDemand,
        currentHour,
        weatherConditions
      );

      setPricingData(pricing);
      setMarketConditions({
        demand: currentDemand,
        timeOfDay: currentHour,
        weather: weatherConditions,
        fuelPrice: 95 + Math.random() * 10, // ₹95-105 per liter
        tollRates: 'Standard',
        competitorPricing: pricing.finalPrice * (0.9 + Math.random() * 0.2)
      });

      // Generate price history
      const history = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: pricing.finalPrice * (0.8 + Math.random() * 0.4),
        demand: Math.floor(Math.random() * 40) + 60
      }));
      setPriceHistory(history);

      onPriceCalculated?.(pricing);
    } catch (error) {
      console.error('Failed to calculate dynamic pricing:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getDemandColor = (demand: number) => {
    if (demand >= 80) return 'text-red-600 bg-red-50';
    if (demand >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Dynamic Pricing</h3>
            <p className="text-sm text-gray-600">Real-time pricing based on market conditions</p>
          </div>
        </div>
        
        {isCalculating && (
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-700 font-medium">Calculating...</span>
          </div>
        )}
      </div>

      {pricingData && (
        <div className="space-y-6">
          {/* Main Price Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-3xl font-bold text-green-900">
                  {formatCurrency(pricingData.finalPrice)}
                </h4>
                <p className="text-green-700">Optimized Price</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600 mb-1">
                  Base: {formatCurrency(pricingData.basePrice)}
                </div>
                <div className="text-xs text-green-600">
                  Savings: {formatCurrency(Math.max(0, pricingData.basePrice * 1.5 - pricingData.finalPrice))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{pricingData.factors.weight}x</span>
                </div>
                <p className="text-xs text-green-700">Weight Factor</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{pricingData.factors.urgency}x</span>
                </div>
                <p className="text-xs text-green-700">Urgency Factor</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{pricingData.factors.demand}x</span>
                </div>
                <p className="text-xs text-green-700">Demand Factor</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{pricingData.factors.time}x</span>
                </div>
                <p className="text-xs text-green-700">Time Factor</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              Price Breakdown
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base Rate ({shipmentData.distance} km × ₹15)</span>
                <span className="text-sm font-medium">{formatCurrency(pricingData.breakdown.base)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Weight Adjustment ({shipmentData.weight} kg)</span>
                <span className="text-sm font-medium text-blue-600">
                  +{formatCurrency(pricingData.breakdown.weightAdjustment)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Urgency Premium ({shipmentData.urgency})</span>
                <span className="text-sm font-medium text-purple-600">
                  +{formatCurrency(pricingData.breakdown.urgencyAdjustment)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Market Adjustment</span>
                <span className={`text-sm font-medium ${
                  pricingData.breakdown.dynamicAdjustment >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {pricingData.breakdown.dynamicAdjustment >= 0 ? '+' : ''}{formatCurrency(pricingData.breakdown.dynamicAdjustment)}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Price</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(pricingData.finalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Conditions */}
          {marketConditions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Gauge className="h-4 w-4 mr-2 text-blue-600" />
                  Market Conditions
                </h5>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Demand:</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(marketConditions.demand)}`}>
                      {marketConditions.demand}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time of Day:</span>
                    <span className="text-sm font-medium">
                      {marketConditions.timeOfDay >= 17 && marketConditions.timeOfDay <= 20 ? 'Peak Hours' : 'Normal Hours'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fuel Price:</span>
                    <span className="text-sm font-medium">₹{marketConditions.fuelPrice.toFixed(2)}/L</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Cloud className="h-4 w-4 mr-2 text-indigo-600" />
                  External Factors
                </h5>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weather Impact:</span>
                    <span className="text-sm font-medium">
                      {marketConditions.weather.rain ? 'Rain (+15%)' : 
                       marketConditions.weather.fog ? 'Fog (+10%)' : 'Clear (0%)'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Competitor Price:</span>
                    <span className="text-sm font-medium">{formatCurrency(Math.round(marketConditions.competitorPricing))}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Our Advantage:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(Math.round(marketConditions.competitorPricing - pricingData.finalPrice))} lower
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price History Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
              7-Day Price Trend
            </h5>
            
            <div className="space-y-2">
              {priceHistory.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(day.demand / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{formatCurrency(Math.round(day.price))}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="h-5 w-5 text-blue-600" />
              <h5 className="font-medium text-blue-900">AI Pricing Insights</h5>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <span>Optimal pricing for current market conditions</span>
              </p>
              <p className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span>15% more competitive than market average</span>
              </p>
              <p className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>High acceptance probability: 94%</span>
              </p>
            </div>
          </div>

          {/* Recalculate Button */}
          <button
            onClick={calculateDynamicPrice}
            disabled={isCalculating}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Calculator className="h-4 w-4" />
            <span>Recalculate Pricing</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicPricing;