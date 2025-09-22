import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Package,
  Navigation,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Shield,
  Gauge
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

const AIInsightsDashboard: React.FC = () => {
  const { analytics, realTimeMetrics } = useDatabase();
  const [selectedInsight, setSelectedInsight] = useState('performance');
  const [timeRange, setTimeRange] = useState('7d');

  // Mock AI insights data
  const aiInsights = {
    performance: {
      title: 'Performance Optimization',
      score: 87,
      trend: 'up',
      insights: [
        {
          type: 'success',
          title: 'Route Efficiency Improved',
          description: 'AI optimization reduced average delivery time by 15% this week',
          impact: 'High',
          recommendation: 'Continue using AI-suggested routes for all shipments'
        },
        {
          type: 'warning',
          title: 'Peak Hour Congestion',
          description: 'Deliveries between 5-7 PM show 23% longer transit times',
          impact: 'Medium',
          recommendation: 'Schedule non-urgent deliveries outside peak hours'
        },
        {
          type: 'info',
          title: 'Operator Performance',
          description: 'Top 20% operators maintain 98% on-time delivery rate',
          impact: 'High',
          recommendation: 'Implement performance-based incentive system'
        }
      ]
    },
    predictive: {
      title: 'Predictive Analytics',
      score: 92,
      trend: 'up',
      insights: [
        {
          type: 'success',
          title: 'Demand Forecast',
          description: 'Expected 35% increase in shipments next week based on historical patterns',
          impact: 'High',
          recommendation: 'Prepare additional vehicle capacity for peak demand'
        },
        {
          type: 'warning',
          title: 'Weather Impact',
          description: 'Monsoon season may affect 15% of routes in next 2 weeks',
          impact: 'Medium',
          recommendation: 'Pre-plan alternative routes for weather-sensitive areas'
        },
        {
          type: 'info',
          title: 'Customer Behavior',
          description: 'Express deliveries increase by 40% during festival seasons',
          impact: 'Medium',
          recommendation: 'Adjust pricing strategy for seasonal demand'
        }
      ]
    },
    anomaly: {
      title: 'Anomaly Detection',
      score: 95,
      trend: 'stable',
      insights: [
        {
          type: 'warning',
          title: 'Route Deviation Detected',
          description: '3 shipments took unusual routes, increasing delivery time by 45 minutes',
          impact: 'Medium',
          recommendation: 'Investigate route deviations and provide driver training'
        },
        {
          type: 'error',
          title: 'Delivery Delay Pattern',
          description: 'Specific operator shows consistent 20% delay in evening deliveries',
          impact: 'High',
          recommendation: 'Review operator schedule and provide performance coaching'
        },
        {
          type: 'success',
          title: 'Cost Optimization',
          description: 'AI detected fuel-efficient routes saving ₹2,500 per week',
          impact: 'High',
          recommendation: 'Expand fuel optimization to all vehicle types'
        }
      ]
    }
  };

  const realTimeAlerts = [
    {
      id: 'ALERT-001',
      type: 'traffic',
      severity: 'medium',
      title: 'Traffic Congestion Detected',
      description: 'Heavy traffic on Delhi-Mumbai highway affecting 5 active shipments',
      affectedShipments: 5,
      estimatedDelay: '45 minutes',
      recommendation: 'Reroute via alternate highway'
    },
    {
      id: 'ALERT-002',
      type: 'weather',
      severity: 'high',
      title: 'Weather Alert',
      description: 'Heavy rainfall expected in Chennai affecting delivery operations',
      affectedShipments: 8,
      estimatedDelay: '2 hours',
      recommendation: 'Delay non-urgent deliveries until weather clears'
    },
    {
      id: 'ALERT-003',
      type: 'performance',
      severity: 'low',
      title: 'Operator Efficiency',
      description: 'Operator OP-005 showing improved performance with 98% on-time rate',
      affectedShipments: 12,
      estimatedDelay: null,
      recommendation: 'Consider for performance bonus and additional assignments'
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return Target;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Lightbulb;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 text-green-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const currentInsights = aiInsights[selectedInsight as keyof typeof aiInsights];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Insights Dashboard</h2>
            <p className="text-gray-600">Advanced analytics and predictive insights powered by artificial intelligence</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">AI Powered</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(aiInsights).map(([key, insight]) => (
          <div
            key={key}
            onClick={() => setSelectedInsight(key)}
            className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer transition-all ${
              selectedInsight === key ? 'border-purple-500 shadow-md' : 'border-gray-100 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              <div className={`p-2 rounded-lg ${
                insight.trend === 'up' ? 'bg-green-100' : 
                insight.trend === 'down' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {insight.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : insight.trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <Activity className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>AI Score</span>
                  <span>{insight.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      insight.score >= 90 ? 'bg-green-500' :
                      insight.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${insight.score}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{insight.score}</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            Real-Time Alerts
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Monitoring</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {realTimeAlerts.map((alert) => (
            <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{alert.title}</h4>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                  {alert.severity.toUpperCase()}
                </div>
              </div>
              <p className="text-sm mb-3">{alert.description}</p>
              <div className="space-y-1 text-xs">
                <p><strong>Affected:</strong> {alert.affectedShipments} shipments</p>
                {alert.estimatedDelay && (
                  <p><strong>Delay:</strong> {alert.estimatedDelay}</p>
                )}
                <p><strong>Action:</strong> {alert.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{currentInsights.title}</h3>
          
          <div className="space-y-4">
            {currentInsights.insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              
              return (
                <div key={index} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'success' ? 'bg-green-100' :
                      insight.type === 'warning' ? 'bg-yellow-100' :
                      insight.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        insight.type === 'success' ? 'text-green-600' :
                        insight.type === 'warning' ? 'text-yellow-600' :
                        insight.type === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                          insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {insight.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      <div className="bg-white bg-opacity-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-800 mb-1">AI Recommendation:</p>
                        <p className="text-xs text-gray-700">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Metrics */}
        <div className="space-y-6">
          {/* Predictive ETA Accuracy */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Predictive ETA Accuracy
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Accuracy</span>
                <span className="text-lg font-bold text-green-600">94.2%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '94.2%' }} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-green-800 font-medium">On-Time Predictions</p>
                  <p className="text-2xl font-bold text-green-600">847</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-red-800 font-medium">Missed Predictions</p>
                  <p className="text-2xl font-bold text-red-600">52</p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Optimization Impact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-blue-600" />
              Route Optimization Impact
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Distance Saved</p>
                  <p className="text-xl font-bold text-blue-600">1,247 km</p>
                  <p className="text-xs text-green-600">↓ 18% reduction</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-xl font-bold text-purple-600">23.5 hrs</p>
                  <p className="text-xs text-green-600">↓ 15% reduction</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-800">Cost Savings</span>
                </div>
                <p className="text-2xl font-bold text-green-600">₹18,450</p>
                <p className="text-xs text-gray-600">Fuel + Time savings this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Categories */}
      <div className="mt-8">
        <div className="flex space-x-4 mb-6">
          {Object.entries(aiInsights).map(([key, insight]) => (
            <button
              key={key}
              onClick={() => setSelectedInsight(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedInsight === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {insight.title}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendations Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">AI-Powered Recommendations</h3>
            <p className="text-sm text-purple-700">Actionable insights to optimize your logistics operations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">Efficiency Boost</span>
            </div>
            <p className="text-xs text-gray-600">Implement AI route suggestions to improve delivery efficiency by 22%</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-800">Operator Training</span>
            </div>
            <p className="text-xs text-gray-600">Focus training on time management for 15% performance improvement</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-800">Cost Optimization</span>
            </div>
            <p className="text-xs text-gray-600">Optimize fuel consumption patterns to save ₹5,000 monthly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;