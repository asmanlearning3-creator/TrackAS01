import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';

const AdminDashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const { companies, vehicles, shipments, notifications } = useDatabase();
  const [activeTab, setActiveTab] = useState('overview');

  const pendingApprovals = {
    companies: companies?.filter(c => c.status === 'pending').length || 0,
    vehicles: vehicles?.filter(v => v.status === 'pending').length || 0,
    shipments: shipments?.filter(s => s.status === 'pending').length || 0,
  };

  const systemStats = {
    totalUsers: (companies?.length || 0) + (vehicles?.length || 0),
    activeShipments: shipments?.filter(s => ['assigned', 'picked_up', 'in_transit'].includes(s.status)).length || 0,
    completedToday: shipments?.filter(s => s.status === 'delivered' && 
      new Date(s.created_at).toDateString() === new Date().toDateString()).length || 0,
    revenue: shipments?.reduce((sum, s) => sum + (s.price || 0), 0) || 0,
  };

  const handleApproval = (type: 'company' | 'vehicle' | 'shipment', id: string, action: 'approve' | 'reject') => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: action === 'approve' ? 'success' : 'warning',
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `${type} ${id} has been ${action}d`,
        timestamp: 'Just now',
        read: false
      }
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.activeShipments}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.completedToday}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{(systemStats.revenue / 1000).toFixed(1)}K</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Companies</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingApprovals.companies}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Vehicles</p>
                <p className="text-2xl font-bold text-blue-900">{pendingApprovals.vehicles}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Shipments</p>
                <p className="text-2xl font-bold text-purple-900">{pendingApprovals.shipments}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      {/* Company Approvals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Registrations</h3>
        <div className="space-y-4">
          {companies?.filter(c => c.status === 'pending').map((company) => (
            <div key={company.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{company.name}</h4>
                  <p className="text-sm text-gray-600">{company.primaryContact.email}</p>
                  <p className="text-sm text-gray-600">TIN: {company.tin}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproval('company', company.id, 'approve')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleApproval('company', company.id, 'reject')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Approvals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Registrations</h3>
        <div className="space-y-4">
          {vehicles?.filter(v => v.status === 'pending').map((vehicle) => (
            <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{vehicle.registrationNumber}</h4>
                  <p className="text-sm text-gray-600">Driver: {vehicle.driver.name}</p>
                  <p className="text-sm text-gray-600">VCODE: {vehicle.vcode}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproval('vehicle', vehicle.id, 'approve')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleApproval('vehicle', vehicle.id, 'reject')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Advanced Analytics</p>
            <p className="text-sm text-gray-600">System-wide performance metrics and insights</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">System administration and oversight</p>
          </div>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="text-xs text-red-700 font-medium">Admin Access</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'approvals' && renderApprovals()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
          <p className="text-gray-600">System configuration and management options</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;