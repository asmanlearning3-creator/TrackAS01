import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Package, Clock, CreditCard, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';
import LoadingSpinner from './LoadingSpinner';

const Analytics: React.FC = () => {
  const { state } = useApp();
  const { analytics, realTimeMetrics, analyticsLoading, refetchAnalytics } = useDatabase();
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = [
    { 
      title: 'Total Shipments',
      value: analytics?.totalShipments?.toLocaleString() || state.analytics.totalShipments.toLocaleString(),
      change: '+12.5%', 
      trend: 'up', 
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      title: 'Success Rate', 
      value: `${analytics?.successRate || state.analytics.successRate}%`,
      change: '+2.1%', 
      trend: 'up', 
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      title: 'Active Operators', 
      value: (analytics?.activeOperators || state.analytics.activeOperators).toString(),
      change: '+8.3%', 
      trend: 'up', 
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      title: 'Avg. Delivery Time', 
      value: analytics?.avgDeliveryTime || state.analytics.avgDeliveryTime,
      change: '-15.2%', 
      trend: 'down', 
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      title: 'Revenue', 
      value: analytics?.revenue || state.analytics.revenue,
      change: '+18.7%', 
      trend: 'up', 
      icon: CreditCard,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    { 
      title: 'Route Efficiency', 
      value: `${analytics?.routeEfficiency || state.analytics.routeEfficiency}%`,
      change: '+3.8%', 
      trend: 'up', 
      icon: MapPin,
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    },
  ];

  const topRoutes = analytics?.topRoutes || state.analytics.topRoutes;
  const operatorPerformance = analytics?.operatorPerformance || state.analytics.operatorPerformance;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
            <p className="text-gray-600">Performance insights and operational metrics for your logistics operations.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {analyticsLoading && <LoadingSpinner size="sm" text="Loading..." />}
            <div className="hidden lg:flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm border">
              <img 
                src="/Vipul.png" 
                alt="Vipul Sharma" 
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="text-xs text-gray-600">Analytics by Vipul</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                refetchAnalytics();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.bg}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Routes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Routes</h3>
          <div className="space-y-4">
            {topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{route.route}</p>
                  <p className="text-sm text-gray-600">{route.shipments} shipments</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{route.revenue}</p>
                  <p className="text-sm text-green-600">{route.efficiency} efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operator Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Operators</h3>
          <div className="space-y-4">
            {operatorPerformance.map((operator, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{operator.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>★ {operator.rating}</span>
                      <span>•</span>
                      <span>{operator.deliveries} deliveries</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{operator.earnings}</p>
                  <p className="text-sm text-green-600">{operator.onTime} on-time</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Trends</h3>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Interactive Charts</p>
              <p className="text-sm text-gray-600">Daily/Weekly/Monthly shipment trends</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Revenue Growth</p>
              <p className="text-sm text-gray-600">Monthly revenue and profit analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;