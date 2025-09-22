import React, { useState } from 'react';
import { Shield, CheckCircle, Clock, AlertCircle, FileText, User, Truck, Hash, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VerificationDashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'companies' | 'vehicles'>('companies');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const companies = state.companies || [];
  const vehicles = state.vehicles || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'under_review': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'under_review': return Eye;
      case 'rejected': return AlertCircle;
      default: return Clock;
    }
  };

  const updateCompanyStatus = (companyId: string, status: 'approved' | 'rejected', reason?: string) => {
    dispatch({
      type: 'UPDATE_COMPANY_STATUS',
      payload: { id: companyId, status, rejectionReason: reason }
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: status === 'approved' ? 'success' : 'warning',
        title: `Company ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Company registration has been ${status}`,
        timestamp: 'Just now',
        read: false
      }
    });
  };

  const updateVehicleStatus = (vehicleId: string, status: 'verified' | 'rejected') => {
    dispatch({
      type: 'UPDATE_VEHICLE_STATUS',
      payload: { id: vehicleId, status }
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: status === 'verified' ? 'success' : 'warning',
        title: `Vehicle ${status === 'verified' ? 'Verified' : 'Rejected'}`,
        message: `Vehicle verification has been ${status}`,
        timestamp: 'Just now',
        read: false
      }
    });
  };

  const CompanyDetails = ({ company }: { company: any }) => {
    const StatusIcon = getStatusIcon(company.status);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(company.status)}`}>
            <StatusIcon className="h-4 w-4 mr-1" />
            {company.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Company Address</label>
              <p className="text-gray-900">{company.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Registration Date</label>
              <p className="text-gray-900">{new Date(company.registrationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">TIN</label>
              <p className="text-gray-900">{company.tin}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Business Registration</label>
              <p className="text-gray-900">{company.businessRegistrationNumber}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Primary Contact</label>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p className="font-medium">{company.primaryContact.name}</p>
              <p className="text-gray-600">{company.primaryContact.email}</p>
              <p className="text-gray-600">{company.primaryContact.phone}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Verification Status</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className={`p-3 rounded-lg border ${company.verificationStatus.tinVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  {company.verificationStatus.tinVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">TIN Verified</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${company.verificationStatus.businessRegVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  {company.verificationStatus.businessRegVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">Business Reg</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${company.verificationStatus.documentsVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  {company.verificationStatus.documentsVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">Documents</span>
                </div>
              </div>
            </div>
          </div>

          {company.status === 'pending' && (
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => updateCompanyStatus(company.id, 'approved')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Company
              </button>
              <button
                onClick={() => updateCompanyStatus(company.id, 'rejected', 'Documentation incomplete')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Company
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const VehicleDetails = ({ vehicle }: { vehicle: any }) => {
    const StatusIcon = getStatusIcon(vehicle.status);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{vehicle.registrationNumber}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Hash className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600 font-mono font-medium">VCODE: {vehicle.vcode}</span>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(vehicle.status)}`}>
            <StatusIcon className="h-4 w-4 mr-1" />
            {vehicle.status.toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
              <p className="text-gray-900 capitalize">{vehicle.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Registration Date</label>
              <p className="text-gray-900">{new Date(vehicle.registrationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Weight Capacity</label>
              <p className="text-gray-900">{vehicle.capacity.weight} kg</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Volume Capacity</label>
              <p className="text-gray-900">{vehicle.capacity.volume} m³</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Driver Information</label>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p className="font-medium">{vehicle.driver.name}</p>
              <p className="text-gray-600">{vehicle.driver.mobile}</p>
              <p className="text-gray-600">License: {vehicle.driver.licenseNumber}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Verification Status</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className={`p-3 rounded-lg border ${vehicle.verificationStatus.registrationVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  {vehicle.verificationStatus.registrationVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">Registration</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${vehicle.verificationStatus.insuranceVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  {vehicle.verificationStatus.insuranceVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">Insurance</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${vehicle.verificationStatus.licenseVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  {vehicle.verificationStatus.licenseVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">License</span>
                </div>
              </div>
            </div>
          </div>

          {vehicle.status === 'pending' && (
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => updateVehicleStatus(vehicle.id, 'verified')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Verify Vehicle
              </button>
              <button
                onClick={() => updateVehicleStatus(vehicle.id, 'rejected')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Vehicle
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Dashboard</h2>
            <p className="text-gray-600">Review and approve company and vehicle registrations</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <img 
              src="/Vipul.png" 
              alt="Vipul Sharma" 
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="text-xs text-purple-700 font-medium">Admin by Vipul Sharma</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'companies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Company Registrations ({companies.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Vehicle Registrations ({vehicles.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {activeTab === 'companies' ? 'Companies' : 'Vehicles'}
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {activeTab === 'companies' ? (
                companies.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No company registrations</p>
                  </div>
                ) : (
                  companies.map((company) => {
                    const StatusIcon = getStatusIcon(company.status);
                    return (
                      <div
                        key={company.id}
                        onClick={() => setSelectedItem(company.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedItem === company.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-sm text-gray-600">{company.primaryContact.name}</p>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {company.status}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                vehicles.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Truck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No vehicle registrations</p>
                  </div>
                ) : (
                  vehicles.map((vehicle) => {
                    const StatusIcon = getStatusIcon(vehicle.status);
                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => setSelectedItem(vehicle.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedItem === vehicle.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.registrationNumber}</p>
                            <p className="text-sm text-gray-600">{vehicle.driver.name}</p>
                            <p className="text-xs text-purple-600 font-mono">{vehicle.vcode}</p>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {vehicle.status}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            activeTab === 'companies' ? (
              <CompanyDetails company={companies.find(c => c.id === selectedItem)} />
            ) : (
              <VehicleDetails vehicle={vehicles.find(v => v.id === selectedItem)} />
            )
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an item to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationDashboard;