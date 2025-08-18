import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MessageCircle, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Phone,
  Mail,
  Package,
  FileText,
  Star,
  Filter,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Dispute {
  id: string;
  shipmentId: string;
  customerName: string;
  operatorName: string;
  type: 'delivery_delay' | 'damaged_goods' | 'wrong_address' | 'payment_issue' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  customerContact: string;
  operatorContact: string;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  assignedTo?: string;
}

const DisputeManagement: React.FC = () => {
  const { dispatch } = useApp();
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  // Mock disputes data
  const disputes: Dispute[] = [
    {
      id: 'DIS-001',
      shipmentId: 'TAS-2024-001',
      customerName: 'Rajesh Kumar',
      operatorName: 'Amit Singh',
      type: 'delivery_delay',
      priority: 'high',
      status: 'open',
      description: 'Package was supposed to be delivered by 6 PM but arrived at 9 PM without prior notification.',
      customerContact: '+91-9876543210',
      operatorContact: '+91-9876543211',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'DIS-002',
      shipmentId: 'TAS-2024-003',
      customerName: 'Priya Sharma',
      operatorName: 'Ravi Kumar',
      type: 'damaged_goods',
      priority: 'critical',
      status: 'investigating',
      description: 'Fragile items were damaged during transit. Package was not handled according to special instructions.',
      customerContact: '+91-9876543212',
      operatorContact: '+91-9876543213',
      createdAt: '2024-01-14T14:20:00Z',
      assignedTo: 'Admin Team'
    },
    {
      id: 'DIS-003',
      shipmentId: 'TAS-2024-005',
      customerName: 'Arjun Patel',
      operatorName: 'Suresh Yadav',
      type: 'payment_issue',
      priority: 'medium',
      status: 'resolved',
      description: 'Customer was charged extra amount not mentioned in the original quote.',
      customerContact: '+91-9876543214',
      operatorContact: '+91-9876543215',
      createdAt: '2024-01-13T09:15:00Z',
      resolvedAt: '2024-01-14T16:30:00Z',
      resolution: 'Refunded excess amount to customer. Updated pricing transparency in system.'
    }
  ];

  const filteredDisputes = disputes.filter(dispute => {
    const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || dispute.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50 border-red-200';
      case 'investigating': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery_delay': return 'Delivery Delay';
      case 'damaged_goods': return 'Damaged Goods';
      case 'wrong_address': return 'Wrong Address';
      case 'payment_issue': return 'Payment Issue';
      default: return 'Other';
    }
  };

  const handleResolveDispute = (disputeId: string) => {
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution note');
      return;
    }

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOT-${Date.now()}`,
        type: 'success',
        title: 'Dispute Resolved',
        message: `Dispute ${disputeId} has been resolved successfully`,
        timestamp: 'Just now',
        read: false
      }
    });

    setResolutionNote('');
    setSelectedDispute(null);
  };

  const selectedDisputeData = selectedDispute ? filteredDisputes.find(d => d.id === selectedDispute) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dispute Management</h2>
            <p className="text-gray-600">Manage customer disputes and feedback resolution</p>
          </div>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-xs text-red-700 font-medium">
              {disputes.filter(d => d.status === 'open').length} Open Disputes
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Disputes</p>
              <p className="text-2xl font-bold text-gray-900">{disputes.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-red-600">{disputes.filter(d => d.status === 'open').length}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Investigating</p>
              <p className="text-2xl font-bold text-yellow-600">{disputes.filter(d => d.status === 'investigating').length}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{disputes.filter(d => d.status === 'resolved').length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
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
                placeholder="Search disputes..."
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
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disputes List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Disputes ({filteredDisputes.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredDisputes.map((dispute) => {
                const isSelected = selectedDispute === dispute.id;
                
                return (
                  <div
                    key={dispute.id}
                    onClick={() => setSelectedDispute(dispute.id)}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-red-50 border-r-4 border-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{dispute.id}</h4>
                          <p className="text-sm text-gray-600">{getTypeLabel(dispute.type)}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                          {dispute.priority.toUpperCase()}
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(dispute.status)}`}>
                          {dispute.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{dispute.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Shipment: {dispute.shipmentId}</span>
                      <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dispute Details */}
        <div>
          {selectedDisputeData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Dispute Details</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedDisputeData.status)}`}>
                  {selectedDisputeData.status.toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Dispute ID</label>
                  <p className="text-gray-900 font-mono">{selectedDisputeData.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Related Shipment</label>
                  <p className="text-gray-900 font-mono">{selectedDisputeData.shipmentId}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Dispute Type</label>
                  <p className="text-gray-900">{getTypeLabel(selectedDisputeData.type)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Priority Level</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedDisputeData.priority)}`}>
                    {selectedDisputeData.priority.toUpperCase()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1">
                    <p className="text-sm text-gray-900">{selectedDisputeData.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1">
                      <p className="font-medium text-blue-900">{selectedDisputeData.customerName}</p>
                      <p className="text-sm text-blue-700">{selectedDisputeData.customerContact}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Operator</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-1">
                      <p className="font-medium text-green-900">{selectedDisputeData.operatorName}</p>
                      <p className="text-sm text-green-700">{selectedDisputeData.operatorContact}</p>
                    </div>
                  </div>
                </div>

                {selectedDisputeData.resolution && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resolution</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-1">
                      <p className="text-sm text-green-800">{selectedDisputeData.resolution}</p>
                      {selectedDisputeData.resolvedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Resolved on {new Date(selectedDisputeData.resolvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedDisputeData.status !== 'resolved' && selectedDisputeData.status !== 'closed' && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Resolution Notes</label>
                      <textarea
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter resolution details..."
                      />
                    </div>
                    
                    <button
                      onClick={() => handleResolveDispute(selectedDisputeData.id)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolve Dispute</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>Call Customer</span>
                      </button>
                      
                      <button className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>Call Operator</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a dispute to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeManagement;