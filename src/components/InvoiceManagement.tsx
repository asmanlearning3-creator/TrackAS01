import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Package,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDatabase } from '../context/DatabaseContext';

interface InvoiceManagementProps {
  userRole: 'admin' | 'logistics' | 'operator' | 'customer';
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ userRole }) => {
  const { state } = useApp();
  const { shipments, payments } = useDatabase();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30d');

  // Generate invoices from delivered shipments
  const invoices = (shipments || state.shipments)
    .filter(s => s.status === 'delivered' || s.price)
    .map(shipment => ({
      id: `INV-${shipment.id}`,
      shipmentId: shipment.id,
      customerName: shipment.customer || shipment.customer_name,
      amount: shipment.price || 0,
      status: Math.random() > 0.3 ? 'paid' : 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paidDate: Math.random() > 0.5 ? new Date().toISOString() : null,
      createdAt: shipment.createdAt || shipment.created_at,
      route: `${shipment.from || shipment.pickup_address} → ${shipment.to || shipment.destination_address}`,
      weight: shipment.weight,
      dimensions: shipment.dimensions,
      model: shipment.model
    }));

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.shipmentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      default: return FileText;
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would generate and download the PDF invoice
    alert(`Downloading invoice ${invoiceId}`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
  };

  const calculateTotals = () => {
    const total = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paid = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pending = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    
    return { total, paid, pending };
  };

  const totals = calculateTotals();
  const selectedInvoiceData = selectedInvoice ? filteredInvoices.find(inv => inv.id === selectedInvoice) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Management</h2>
            <p className="text-gray-600">Manage invoices and payment tracking for all shipments</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">{filteredInvoices.length} Invoices</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totals.total.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{totals.paid.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">₹{totals.pending.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="h-6 w-6 text-yellow-600" />
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
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Invoices ({filteredInvoices.length})</h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredInvoices.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices found</p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => {
                  const StatusIcon = getStatusIcon(invoice.status);
                  const isSelected = selectedInvoice === invoice.id;
                  
                  return (
                    <div
                      key={invoice.id}
                      onClick={() => handleViewInvoice(invoice.id)}
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{invoice.id}</h4>
                            <p className="text-sm text-gray-600">{invoice.customerName}</p>
                            <p className="text-xs text-gray-500">{invoice.shipmentId}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{invoice.amount.toLocaleString()}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(invoice.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {invoice.status.toUpperCase()}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div>
          {selectedInvoiceData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedInvoiceData.status)}`}>
                  {selectedInvoiceData.status.toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Invoice ID</label>
                  <p className="text-gray-900 font-mono">{selectedInvoiceData.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Shipment ID</label>
                  <p className="text-gray-900 font-mono">{selectedInvoiceData.shipmentId}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900">{selectedInvoiceData.customerName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Route</label>
                  <p className="text-gray-900 text-sm">{selectedInvoiceData.route}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Package Details</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{selectedInvoiceData.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium">{selectedInvoiceData.dimensions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium capitalize">{selectedInvoiceData.model.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Amount Breakdown</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Base Amount:</span>
                      <span className="font-medium text-blue-900">₹{(selectedInvoiceData.amount * 0.8).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Service Fee:</span>
                      <span className="font-medium text-blue-900">₹{(selectedInvoiceData.amount * 0.1).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">GST (18%):</span>
                      <span className="font-medium text-blue-900">₹{(selectedInvoiceData.amount * 0.1).toFixed(0)}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-blue-900">Total:</span>
                        <span className="font-bold text-blue-900">₹{selectedInvoiceData.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Information</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{new Date(selectedInvoiceData.dueDate).toLocaleDateString()}</span>
                    </div>
                    {selectedInvoiceData.paidDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paid Date:</span>
                        <span className="font-medium text-green-600">{new Date(selectedInvoiceData.paidDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownloadInvoice(selectedInvoiceData.id)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                  
                  {selectedInvoiceData.status === 'pending' && userRole === 'logistics' && (
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Mark as Paid</span>
                    </button>
                  )}

                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View Full Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an invoice to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;