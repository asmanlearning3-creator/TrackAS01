import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText,
  Building2,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  AlertTriangle,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';

const AdminApprovalDashboard: React.FC = () => {
  const { dispatch } = useApp();
  const { companies, vehicles, operators } = useDatabase();
  const [activeTab, setActiveTab] = useState<'companies' | 'operators' | 'vehicles'>('companies');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Get pending items based on active tab
  const getPendingItems = () => {
    switch (activeTab) {
      case 'companies':
        return companies?.filter(c => 
          (filterStatus === 'all' || c.status === filterStatus) &&
          (searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        ) || [];
      case 'operators':
        return operators?.filter(o => 
          (filterStatus === 'all' || o.status === filterStatus) &&
          (searchTerm === '' || o.name.toLowerCase().includes(searchTerm.toLowerCase()))
        ) || [];
      case 'vehicles':
        return vehicles?.filter(v => 
          (filterStatus === 'all' || v.status === filterStatus) &&
          (searchTerm === '' || v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
        ) || [];
      default:
        return [];
    }
  };

  const pendingItems = getPendingItems();
  const selectedItemData = selectedItem ? pendingItems.find(item => item.id === selectedItem) : pendingItems[0];

  const handleApproval = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const item = pendingItems.find(i => i.id === itemId);
      if (!item) return;

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      // Update status based on item type
      if (activeTab === 'companies') {
        // Update company status
        dispatch({
          type: 'UPDATE_COMPANY_STATUS',
          payload: { 
            id: itemId, 
            status: newStatus,
            rejectionReason: action === 'reject' ? approvalNotes : undefined
          }
        });
      } else if (activeTab === 'vehicles') {
        // Update vehicle status
        dispatch({
          type: 'UPDATE_VEHICLE_STATUS',
          payload: { id: itemId, status: newStatus }
        });
      }

      // Send notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOT-${Date.now()}`,
          type: action === 'approve' ? 'success' : 'warning',
          title: `${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)} ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: `${item.name || item.registration_number || item.id} has been ${action}d`,
          timestamp: 'Just now',
          read: false
        }
      });

      setApprovalNotes('');
      setSelectedItem(null);
    } catch (error) {
      console.error('Approval action failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return AlertTriangle;
    }
  };

  const renderCompanyDetails = (company: any) => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Company Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <p className="text-gray-900">{company.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">TIN Number</label>
            <p className="text-gray-900">{company.tin}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <p className="text-gray-900">{company.address}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Business Registration</label>
            <p className="text-gray-900">{company.business_registration_number}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Fleet Size</label>
            <p className="text-gray-900">{company.fleet_size || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">Primary Contact</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-green-600" />
            <span className="text-green-800">{company.primary_contact_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-green-600" />
            <span className="text-green-800">{company.primary_contact_email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="text-green-800">{company.primary_contact_phone}</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-3">Verification Status</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border text-center ${
            company.verification_status?.tin_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <CheckCircle className={`h-4 w-4 mx-auto mb-1 ${
              company.verification_status?.tin_verified ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className="text-xs font-medium">TIN Verified</span>
          </div>
          <div className={`p-3 rounded-lg border text-center ${
            company.verification_status?.business_reg_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <CheckCircle className={`h-4 w-4 mx-auto mb-1 ${
              company.verification_status?.business_reg_verified ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className="text-xs font-medium">Business Reg</span>
          </div>
          <div className={`p-3 rounded-lg border text-center ${
            company.verification_status?.documents_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <CheckCircle className={`h-4 w-4 mx-auto mb-1 ${
              company.verification_status?.documents_verified ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className="text-xs font-medium">Documents</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicleDetails = (vehicle: any) => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Vehicle Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Registration Number</label>
            <p className="text-gray-900 font-mono">{vehicle.registration_number}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">VCODE</label>
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-purple-600" />
              <p className="text-purple-600 font-mono font-medium">{vehicle.vcode}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
            <p className="text-gray-900 capitalize">{vehicle.type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Weight Capacity</label>
            <p className="text-gray-900">{vehicle.weight_capacity} kg</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Volume Capacity</label>
            <p className="text-gray-900">{vehicle.volume_capacity} m³</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">Driver Information</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-green-600" />
            <span className="text-green-800">{vehicle.driver_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="text-green-800">{vehicle.driver_mobile}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-green-800">License: {vehicle.driver_license_number}</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-3">Verification Status</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border text-center ${
            vehicle.verification_status?.registration_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <CheckCircle className={`h-4 w-4 mx-auto mb-1 ${
              vehicle.verification_status?.registration_verified ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className="text-xs font-medium">Registration</span>
          </div>
          <div className={`p-3 rounded-lg border text-center ${
            vehicle.verification_status?.insurance_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <CheckCircle className={`h-4 w-4 mx-auto mb-1 ${
              vehicle.verification_status?.insurance_verified ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className="text-xs font-medium">Insurance</span>
          </div>
          <div className={`p-3 rounded-lg border text-center ${
            vehicle.verification_status?.license_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <CheckCircle className={`h-4 w-4 mx-auto mb-1 ${
              vehicle.verification_status?.license_verified ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className="text-xs font-medium">License</span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'companies', label: 'Companies', icon: Building2, count: companies?.filter(c => c.status === 'pending').length || 0 },
    { id: 'operators', label: 'Operators', icon: User, count: operators?.filter(o => o.status === 'pending').length || 0 },
    { id: 'vehicles', label: 'Vehicles', icon: Truck, count: vehicles?.filter(v => v.status === 'pending').length || 0 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Approval Dashboard</h2>
            <p className="text-gray-600">Review and approve pending registrations</p>
          </div>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="text-xs text-red-700 font-medium">Admin Access</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending {tab.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50">
                  <Icon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          );
        })}
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
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedItem(null);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({pendingItems.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {pendingItems.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No items pending approval</p>
                </div>
              ) : (
                pendingItems.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  const isSelected = selectedItem === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-red-50 border-r-4 border-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name || item.registration_number || item.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activeTab === 'companies' ? item.primary_contact_name :
                             activeTab === 'vehicles' ? item.driver_name :
                             item.phone}
                          </p>
                          {activeTab === 'vehicles' && (
                            <p className="text-xs text-purple-600 font-mono">{item.vcode}</p>
                          )}
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {item.status}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="lg:col-span-2">
          {selectedItemData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'companies' ? 'Company Details' :
                   activeTab === 'vehicles' ? 'Vehicle Details' :
                   'Operator Details'}
                </h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedItemData.status)}`}>
                  {selectedItemData.status.toUpperCase()}
                </div>
              </div>
              
              {activeTab === 'companies' && renderCompanyDetails(selectedItemData)}
              {activeTab === 'vehicles' && renderVehicleDetails(selectedItemData)}

              {/* Approval Actions */}
              {selectedItemData.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Approval Decision</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Add any notes about this approval decision..."
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleApproval(selectedItemData.id, 'approve')}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleApproval(selectedItemData.id, 'reject')}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="h-5 w-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Downloads */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeTab === 'companies' ? (
                    <>
                      <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Business Registration</span>
                      </button>
                      <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">TIN Certificate</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Driver License</span>
                      </button>
                      <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Vehicle Registration</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an item to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalDashboard;