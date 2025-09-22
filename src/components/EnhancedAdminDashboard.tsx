import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  Building2,
  UserCheck,
  TruckIcon,
  MessageSquare,
  Globe
} from 'lucide-react';
import { escrowService } from '../services/escrowService';
import { verificationService } from '../services/verificationService';
import { aiAssistantService } from '../services/aiAssistantService';

interface DashboardStats {
  totalUsers: number;
  activeShipments: number;
  totalRevenue: number;
  pendingApprovals: number;
  escrowHeld: number;
  commissionEarned: number;
  subscriptionRevenue: number;
  activeFleets: number;
  individualOperators: number;
}

interface PendingApproval {
  id: string;
  type: 'company' | 'vehicle' | 'driver';
  name: string;
  submittedAt: string;
  status: 'pending' | 'under_review';
  priority: 'low' | 'medium' | 'high';
}

const EnhancedAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [commissionConfig, setCommissionConfig] = useState({ percentage: 5 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all dashboard data in parallel
      const [
        statsData,
        approvalsData,
        commissionData,
        escrowData
      ] = await Promise.all([
        loadStats(),
        loadPendingApprovals(),
        escrowService.getCommissionConfig(),
        escrowService.getEscrowAnalytics('admin')
      ]);

      setStats(statsData);
      setPendingApprovals(approvalsData);
      if (commissionData) {
        setCommissionConfig({ percentage: commissionData.percentage });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async (): Promise<DashboardStats> => {
    // Mock data - in production, fetch from API
    return {
      totalUsers: 1247,
      activeShipments: 89,
      totalRevenue: 2450000,
      pendingApprovals: 23,
      escrowHeld: 450000,
      commissionEarned: 125000,
      subscriptionRevenue: 85000,
      activeFleets: 45,
      individualOperators: 156
    };
  };

  const loadPendingApprovals = async (): Promise<PendingApproval[]> => {
    // Mock data - in production, fetch from verification service
    return [
      {
        id: 'comp_001',
        type: 'company',
        name: 'ABC Logistics Pvt Ltd',
        submittedAt: '2024-01-15T10:30:00Z',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'veh_001',
        type: 'vehicle',
        name: 'MH-12-AB-1234',
        submittedAt: '2024-01-15T09:15:00Z',
        status: 'under_review',
        priority: 'medium'
      },
      {
        id: 'drv_001',
        type: 'driver',
        name: 'Rajesh Kumar',
        submittedAt: '2024-01-15T08:45:00Z',
        status: 'pending',
        priority: 'low'
      }
    ];
  };

  const handleCommissionUpdate = async (newPercentage: number) => {
    try {
      const success = await escrowService.updateCommissionConfig(newPercentage, 'admin');
      if (success) {
        setCommissionConfig({ percentage: newPercentage });
        alert('Commission percentage updated successfully!');
      } else {
        alert('Failed to update commission percentage');
      }
    } catch (error) {
      console.error('Error updating commission:', error);
      alert('Error updating commission percentage');
    }
  };

  const handleApproval = async (approvalId: string, type: string, action: 'approve' | 'reject') => {
    try {
      let success = false;
      
      if (action === 'approve') {
        success = await verificationService.approveVerification(approvalId, 'admin', type as any);
      } else {
        success = await verificationService.rejectVerification(approvalId, 'admin', type as any, 'Rejected by admin');
      }

      if (success) {
        await loadDashboardData(); // Refresh data
        alert(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
      } else {
        alert(`Failed to ${action} verification`);
      }
    } catch (error) {
      console.error(`Error ${action}ing verification:`, error);
      alert(`Error ${action}ing verification`);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeShipments}</p>
            </div>
            <Truck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Wallet</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Held</span>
              <span className="font-semibold">₹{(stats?.escrowHeld || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commission Earned</span>
              <span className="font-semibold text-green-600">₹{(stats?.commissionEarned || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subscription Revenue</span>
              <span className="font-semibold text-blue-600">₹{(stats?.subscriptionRevenue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Fleets</span>
              <span className="font-semibold">{stats?.activeFleets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Individual Operators</span>
              <span className="font-semibold">{stats?.individualOperators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Vehicles</span>
              <span className="font-semibold">{(stats?.activeFleets || 0) * 5 + (stats?.individualOperators || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                value={commissionConfig.percentage}
                onChange={(e) => setCommissionConfig({ percentage: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{commissionConfig.percentage}%</span>
            </div>
            <button
              onClick={() => handleCommissionUpdate(commissionConfig.percentage)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Commission
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingApprovals.map((approval) => (
                <tr key={approval.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {approval.type === 'company' && <Building2 className="h-5 w-5 text-blue-600 mr-2" />}
                      {approval.type === 'vehicle' && <Truck className="h-5 w-5 text-green-600 mr-2" />}
                      {approval.type === 'driver' && <UserCheck className="h-5 w-5 text-purple-600 mr-2" />}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {approval.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {approval.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(approval.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      approval.priority === 'high' ? 'bg-red-100 text-red-800' :
                      approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {approval.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {approval.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleApproval(approval.id, approval.type, 'approve')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleApproval(approval.id, approval.type, 'reject')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Percentage (0-10%)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={commissionConfig.percentage}
                  onChange={(e) => setCommissionConfig({ percentage: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-lg font-semibold w-12">{commissionConfig.percentage}%</span>
              </div>
            </div>
            <button
              onClick={() => handleCommissionUpdate(commissionConfig.percentage)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Commission Rate
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dynamic Pricing</h3>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>• 1st Escalation: +10% price increase</p>
              <p>• 2nd Escalation: +20% price increase</p>
              <p>• 3rd Escalation: Auto-cancel shipment</p>
            </div>
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Configure Escalation Rules
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Settings</h3>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>• Response Timeout: 2 minutes</p>
              <p>• Subscription Priority: Enabled</p>
              <p>• FCFS Fallback: Enabled</p>
            </div>
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Configure Assignment Rules
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>• Multi-language Support: English, Hindi</p>
              <p>• Auto-escalation: Enabled</p>
              <p>• WhatsApp Integration: Enabled</p>
            </div>
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Configure AI Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'approvals', name: 'Approvals', icon: CheckCircle },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">TrackAS System Administration & Oversight</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'approvals' && renderApprovals()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
};

export default EnhancedAdminDashboard;

